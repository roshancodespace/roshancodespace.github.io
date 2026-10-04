---
title: "Building ShonenX: How I Learned Flutter the Hard Way"
description: "ShonenX was my first Flutter project. I didn't know Dart, I didn't know the framework, and a year later, I had to rewrite the entire thing. Here is the story."
pubDate: 2026-10-04
tags: ["Flutter", "Architecture", "ShonenX", "Open Source"]
---

If you look around this portfolio, you'll notice it boasts about me a lot, but honestly, there's one single thing I care about the most: **ShonenX**. It wasn't just an app I built; it was literally my trial by fire into the world of mobile development.

It was not easy. At all.

### The Backwards Approach to Learning

When I started ShonenX, it was my very first `Flutter` project. 

Usually, the recommended path is to learn `Dart` first, understand object-oriented principles, figure out the `Flutter` widget tree, and *then* try to build something small like a to-do list.

I didn't do that. I just jumped straight into building a full-fledged anime tracking application. I took help from AI to get the boilerplates running, smashed pieces of code together, and just figured it out as I went. 

Was it the most efficient way to learn? Probably not. Did it result in some of the worst spaghetti code known to mankind? Absolutely. But it worked, and that chaotic, hands-on journey was how I actually learned `Flutter`.

### The v2.0.0 Rewrite

Fast forward over a year later. I had spent countless hours debugging, reading docs, and actually learning how to write scalable software. I looked back at the original ShonenX codebase and realized something terrifying: it was unmaintainable. 

So, untill recently when `v2.0.0` dropped, I sat down and did an entire rewrite from scratch. 

I had finally learned the "best" way to code a `Flutter` application (or at least, the best way *I* knew how). I restructured the entire app to follow an MVVM (Model-View-ViewModel) architecture. 

However, I made a conscious choice not to make it *pure* MVVM. I didn't want to introduce an insane amount of boilerplate and code complexity for an open-source app. The goal was to make the codebase clean, readable, and easy for other contributors to understand without needing a PhD in software architecture.

### The Multi-Tracker Evolution

The architecture rewrite wasn't just for clean code—it unlocked massive features. 

Before the rewrite, ShonenX was plain. It was heavily tied to just one tracking service. But with the new flexible architecture in `v2.0.0`, I was able to introduce true multi-tracker support. 

It was a domino effect of integrations:
- First, we got **AniList** working perfectly.
- Then came **MyAnimeList (MAL)**.
- Then **Kitsu**.
- And finally, **Simkl**.

Connecting all these different APIs with completely different JSON structures and authentication flows into one unified UI was one of the hardest but most rewarding engineering challenges of the project.

### Looking Forward

Right now, I have some other features on the home page, and I definitely plan to add more, better projects as I continue to grow as an engineer.

But ShonenX will always hold the top spot in my memory. It represents the messy, frustrating, and incredibly rewarding journey of going from absolutely zero `Flutter` knowledge to shipping a complex, multi-tracker app used by real people. 

It was a long journey, but I wouldn't trade it for anything.
