---
title: "Building Relay: The Niche Webhook Stuff Most Devs Don't Know About"
description: "A brain dump of the weird distributed systems and security problems I had to solve in Relay—from timing attacks in HMAC comparison to SSRF cloud metadata exploits and full jitter math."
pubDate: 2026-10-14
tags: ["Webhooks", "TypeScript", "Security", "Backend", "Open Source"]
---

A while back I built [Relay](https://github.com/roshancodespace/relay), an open-source webhook delivery platform. 

I wanted to write this post mostly as a brain dump for myself, but also because webhooks are one of those things where almost every developer thinks:

> *"How hard can it be? It's literally just `await fetch(url, { method: 'POST' })`."*

That's the trap. On paper, webhooks sound like a 10-minute feature. You trigger an event, you send JSON over HTTP, you get a `200 OK`, done.

Except the moment you actually have to build a reliable webhook system from scratch, you run face-first into an absurd amount of niche security quirks, timing attacks, distributed state headaches, and retry math that almost nobody talks about. 

Things like:
- Why comparing HMAC hashes with `===` is actually a security flaw.
- How an IP address you've probably never seen (`169.254.169.254`) can leak your entire cloud infrastructure.
- Why standard exponential backoff can still accidentally DDoS your own users.
- Why API keys should only exist in plain text for about 3 seconds.

If you want to check out the project first, here are the links:
- **GitHub:** [roshancodespace/relay](https://github.com/roshancodespace/relay)
- **Live App:** [relay-bay-ten.vercel.app](https://relay-bay-ten.vercel.app)

Here is all the niche engineering stuff I learned while building it.

---

### 1. The HMAC Timing Attack (Why `===` is Broken)

When you send a webhook to an external receiver, how does the receiver know it actually came from you and wasn't spoofed by some random person firing requests with curl?

You sign the payload using **HMAC-SHA256**. You give the user a secret key, hash the payload with it, and put the signature in a header like `Relay-Signature`.

Most developers implement the verification check on their receiver endpoint like this:

```typescript
// The intuitive way (and why it's subtly flawed)
const expectedSignature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");

if (incomingSignature === expectedSignature) {
  // Process webhook...
}
```

Looks totally fine, right? 

Here's the catch: **JavaScript's `===` operator does not run in constant time.**

When the V8 engine compares two strings with `===`, it checks them character by character from left to right. The millisecond it finds a character that doesn't match, it aborts early and returns `false`:

```text
Target:   "a8f3b9c2..."
Guess 1:  "z8f3b9c2..."  -> Fails on char 0  (takes ~2ns)
Guess 2:  "a9f3b9c2..."  -> Fails on char 1  (takes ~5ns)
Guess 3:  "a8e3b9c2..."  -> Fails on char 2  (takes ~8ns)
```

If an attacker sends thousands of requests and measures the microscopic differences in response times (a **side-channel timing attack**), they can guess the correct signature character by character without ever knowing your secret key.

The fix in Node.js is to use `crypto.timingSafeEqual`:

```typescript
import crypto from "node:crypto";

const trustedBuf = Buffer.from(expectedSignature, "hex");
const untrustedBuf = Buffer.from(incomingSignature, "hex");

// Always checks every single byte regardless of where mismatches are
const isValid = trustedBuf.length === untrustedBuf.length && 
                crypto.timingSafeEqual(trustedBuf, untrustedBuf);
```

`timingSafeEqual` takes the exact same number of CPU cycles whether zero characters match or all of them match. No timing leak.

---

### 2. The Replay Attack & Timestamp Drift

Signing the body isn't even enough by itself. 

What happens if an attacker sits on the same public Wi-Fi as your receiver and intercepts a valid webhook request? Even if they can't tamper with the body (because the HMAC wouldn't match), they can simply copy the exact same headers and payload, and replay it against your receiver 4 hours later. 

If that webhook was `account.upgrade_to_pro`, they just re-triggered the action for free.

To stop replay attacks, Relay signs the **timestamp combined with the payload**:

```typescript
// What Relay signs:
const signedContent = `${timestamp}.${rawPayload}`;
const signature = crypto
  .createHmac("sha256", secret)
  .update(signedContent)
  .digest("hex");

// What the header looks like:
// Relay-Signature: t=1728904800,v1=9f83e2a09c48b2...
```

On the receiver end, before you even calculate the hash, you check the timestamp drift:

```typescript
const tolerance = 300; // 5 minutes in seconds
const now = Math.floor(Date.now() / 1000);

if (Math.abs(now - timestamp) > tolerance) {
  // Request is too old (or from the future) — reject immediately
  return false; 
}
```

Now, replaying a captured webhook after 5 minutes is completely useless.

---

### 3. The `169.254.169.254` Trap (SSRF via Webhook URLs)

This is one of the scariest vulnerabilities in web development that almost nobody thinks about until they get audited.

When you allow users to input a webhook destination URL, you are essentially letting them tell your backend server: *"Go make an HTTP request to this address."*

What happens if an attacker registers this URL?

```text
http://169.254.169.254/latest/meta-data/
```

If you host your app on AWS, GCP, or Azure, `169.254.169.254` is the internal link-local IP for the **Instance Metadata Service (IMDS)**.

If your backend server makes a naive `fetch()` to that URL, the cloud provider thinks the request is coming from an admin on the machine itself. It will happily return:
- Temporary IAM role credentials
- Private tokens
- S3 access keys
- Internal network configurations

The attacker just stole your entire AWS infrastructure without cracking a single password. This is **Server-Side Request Forgery (SSRF)**.

Or what if they put `http://127.0.0.1:6379`? Now they're sending raw HTTP commands into your internal Redis instance. What if they put `http://192.168.1.1`? They are mapping out your private company intranet.

#### The Naive Fix (And Why It Fails)
Most people try to fix this by doing:
```typescript
if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
  throw new Error("Forbidden!");
}
```

This fails immediately because of **DNS Rebinding**:
An attacker buys `evil-domain.com`. They configure their DNS server to return a legit public IP (like `93.184.216.34`) with a TTL of 1 second. Your code checks the hostname, sees it's public, and approves it. But 2 milliseconds later when `fetch()` runs, the DNS cache expires, and their DNS server replies with `127.0.0.1`.

#### How Relay Solves It
In Relay, before the worker touches the network:
1. It resolves the hostname to its raw IP address via `dns.promises.lookup`.
2. It tests that IP against a strict CIDR blocklist:
   - Loopbacks: `127.0.0.0/8`, `::1`
   - Private subnets (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - Link-local & cloud metadata: `169.254.0.0/16`
   - Carrier-grade NAT: `100.64.0.0/10`
3. If it matches any forbidden range, the delivery is rejected with a permanent SSRF violation without ever opening a TCP socket.

---

### 4. Exponential Backoff with "Full Jitter"

When an external endpoint goes down, you want to retry.

The rookie mistake is fixed retries (retry every 5 seconds). 

The intermediate approach is exponential backoff:
- Attempt 1: wait 2s
- Attempt 2: wait 4s
- Attempt 3: wait 8s
- Attempt 4: wait 16s

Here's why even standard exponential backoff has a massive flaw: **The Thundering Herd.**

Suppose an e-commerce platform has 500 webhooks fire during a flash sale. At 12:00:00, the destination server blips and all 500 webhooks fail.

If they all use exponential backoff:
- At 12:00:02, all 500 retry at the *exact same instant*.
- The destination server, trying to reboot, gets slammed with 500 simultaneous HTTP connections and falls over again.
- At 12:00:06, all 500 retry *together again*.

They march in lockstep. You've essentially created a periodic battering ram against your customer's server.

The mathematical fix is **Full Jitter** (popularized by AWS Architecture research):

$$\text{sleep} = \text{random}(0, \; \min(\text{max\_backoff}, \; \text{base} \times 2^{\text{attempt}}))$$

```typescript
function calculateJitteredBackoff(
  attempt: number,
  baseMs = 1000,
  maxMs = 86400000 // 24 hours
): number {
  const exponentialCap = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  // Uniform random distribution between 0 and the exponential cap
  return Math.floor(Math.random() * exponentialCap);
}
```

Instead of a sharp spike where 500 requests hit simultaneously, the retries get scattered smoothly across the entire time window. It transforms an aggressive avalanche into a gentle drizzle, giving the destination server the room it needs to recover.

---

### 5. API Keys Should Never Live in Plain Text

When a developer signs up for an API, you generate an API key like `rel_live_9f83a...`.

Most beginners store that string directly in a `users` or `projects` table:

```sql
-- Don't do this!
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  api_key TEXT NOT NULL
);
```

If your database ever gets dumped or exposed via an SQL injection or misconfigured backup, all your users' API keys are instantly out in the wild.

In Relay, API keys are treated like passwords:
1. When you create an API key, we generate a cryptographically secure random string.
2. We display the full key to the user **once**.
3. We compute a SHA-256 hash of that key:
   ```typescript
   const keyHash = crypto
     .createHash("sha256")
     .update(rawKey)
     .digest("hex");
   ```
4. The database *only* stores `keyHash` (plus a short prefix like `rel_live_...` just for identification in the UI).

When an incoming request arrives with `Authorization: Bearer rel_live_...`, Relay computes `sha256(incomingKey)` and checks if that hash exists in PostgreSQL. 

Even if someone got read access to the entire database, they couldn't send a single webhook event because reversing a SHA-256 hash is practically impossible.

---

### 6. Idempotency (Because The Network Always Lies)

Here is a common scenario:
1. Your app sends `POST /api/v1/events` to Relay.
2. Relay receives the event, writes it to PostgreSQL, and prepares to return `202 Accepted`.
3. Right before the response reaches your app, the network drops.
4. Your app sees a `Network Error` and assumes the event never made it.
5. Your app retries and sends the event again.

Without idempotency, you now have two identical events in the queue, and your customer gets two duplicate webhooks.

In Relay, every ingestion request accepts an `Idempotency-Key` header:

```bash
curl -X POST https://relay-bay-ten.vercel.app/api/v1/events \
  -H "Authorization: Bearer rel_live_..." \
  -H "Idempotency-Key: evt_order_991823" \
  -d '{"type": "order.completed", "data": {"id": 123}}'
```

Relay runs this in a single transactional query:
- If `evt_order_991823` already exists for this project, it immediately short-circuits and returns the existing event record with `200 OK`.
- No duplicate queue job is created.
- The delivery worker only ever dispatches the event once.

---

### The Architecture in 30 Seconds

Putting all these pieces together, here is how Relay actually runs:

1. **Next.js 16 (App Router):** Powers the dashboard, project settings, endpoint management, and the `/api/v1/events` ingestion route.
2. **PostgreSQL + Drizzle:** Stores projects, hashed API keys, endpoints, and the full event log.
3. **BullMQ + Redis:** When an event is ingested, a job is pushed to Redis. The API returns `202 Accepted` in ~12ms.
4. **Delivery Worker:** A background worker picks jobs off BullMQ, runs the SSRF checks, calculates the HMAC signatures, fires the HTTP request, logs the attempt (headers, latency, status code), and handles the jittered retries if it fails.
5. **The Manual Replay Engine:** If a customer's server is down for an entire weekend and exhausts all retries, you don't need to write custom SQL scripts to fix it. You just open the Relay dashboard, find the failed event, and hit **Replay**. It re-queues the delivery with a fresh lifecycle.

---

### Wrapping Up

Webhooks look deceptively simple from the outside. But once you pull back the curtain, it's a microcosm of everything that makes backend engineering interesting: cryptography, networking, fault tolerance, and security defenses.

If you're building something that sends webhooks, don't repeat my initial mistake and slap a 3-line `fetch()` inside your checkout handler. 

Check out the code, run it locally with Docker, or play with the hosted app:
- **GitHub:** [roshancodespace/relay](https://github.com/roshancodespace/relay)
- **Hosted App:** [relay-bay-ten.vercel.app](https://relay-bay-ten.vercel.app)

Hopefully this saves you from falling down the same 3:00 AM rabbit holes I did!
