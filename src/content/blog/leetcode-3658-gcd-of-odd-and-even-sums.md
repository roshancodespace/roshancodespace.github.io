---
title: "LeetCode 3658: Getting Humbled by `return n;`"
description: "I spent 10 minutes writing loops to calculate odd and even sums, only to realize the entire answer was literally just return n."
pubDate: 2026-10-12
tags: ["LeetCode", "C++", "DSA", "Math"]
---

I was solving some LeetCode problems today and came across [3658. GCD of Odd and Even Sums](https://leetcode.com/problems/gcd-of-odd-and-even-sums/). 

It's marked as an **Easy** problem. The prompt is pretty straightforward: you get an integer `n`, and you need to find the greatest common divisor (GCD) between two things:
- `sumOdd`: the sum of the first `n` positive odd numbers
- `sumEven`: the sum of the first `n` positive even numbers

For example, if `n = 4`:
- Odd numbers: `1 + 3 + 5 + 7 = 16`
- Even numbers: `2 + 4 + 6 + 8 = 20`
- `GCD(16, 20) = 4`

And if `n = 5`:
- Odd numbers: `1 + 3 + 5 + 7 + 9 = 25`
- Even numbers: `2 + 4 + 6 + 8 + 10 = 30`
- `GCD(25, 30) = 5`

### The Monkey Brain Approach

Instead of pausing for literally two seconds to look at the pattern, my monkey brain kicked in. I didn't think about math at all. I just thought: *"Okay, loop through the numbers, add the odds to one bucket, add the evens to another bucket, and then find the GCD."*

So I wrote this absolute monstrosity:

```cpp
class Solution {
public:
    int gcdOfOddEvenSums(int n) {
        int sumEven = 0;
        int sumOdd = 0;

        for (int i = 1; i < (n * 2) + 1; i++) {
           if (i % 2 == 0) sumEven += i;
           else sumOdd += i;
        }

        int smaller = min(sumEven, sumOdd);
        int gcd = 1;

        for (int i = smaller; i > 0; i--) {
            if (sumEven % i == 0 && sumOdd % i == 0) {
                gcd = max(gcd, i);
                break;
            }
        }

        return gcd;
    }
};
```

I literally wrote a loop from `1` to `2n` to add up the numbers, and then wrote *another* backward loop counting down from `smaller` down to `1` checking modulo divisibility like a caveman. I didn't even use `std::gcd` from `<numeric>`.

I hit **Submit**. 

Green checkmark. Accepted. 

Because `n <= 1000`, the loop only runs a few thousand times, so LeetCode happily accepted it. In my head, I was like *"cool, easy problem done, moving on."*

### The Reality Check

Then I opened the Solutions tab just to see what other people wrote.

Every single top solution was literally this:

```cpp
class Solution {
public:
    int gcdOfOddEvenSums(int n) {
        return n;
    }
};
```

I just sat there staring at my screen. 

No loops. No sums. No modulo. Just `return n;`.

I wrote 25 lines of brute-force code, allocated four variables, ran two loops, and the answer was literally just the input parameter itself.

### Okay, But How Does That Even Work?

After feeling like a clown for a minute, I actually pulled out a pen to figure out why this works. 

If you look at the formulas for odd and even sums, it hits you immediately.

The sum of the first `n` odd numbers is an arithmetic series:<br>
`1 + 3 + 5 + ... + (2n - 1)`

If you add them up:
- For `n = 1`: `1` (which is `1²`)
- For `n = 2`: `1 + 3 = 4` (which is `2²`)
- For `n = 3`: `1 + 3 + 5 = 9` (which is `3²`)
- For `n = 4`: `1 + 3 + 5 + 7 = 16` (which is `4²`)

The sum of the first `n` odd numbers is **always `n²`**. Always.

Now look at the first `n` even numbers:
`2 + 4 + 6 + ... + 2n`

If you factor out the `2`:
`2 * (1 + 2 + 3 + ... + n)`

The sum of `1` through `n` is Gauss's formula `n * (n + 1) / 2`. Multiply that by `2`, and the denominator cancels out:<br>
`n * (n + 1)`

So now, the problem is literally asking us to find:<br>
`GCD(n², n * (n + 1))`

Both terms have an `n` in common, so you can just pull `n` outside the GCD:<br>
`n * GCD(n, n + 1)`

And what is the GCD of two consecutive numbers like `n` and `n + 1`?

They are **always coprime**. The greatest common divisor between any two consecutive integers is always `1`.<br> Like `GCD(4, 5) = 1`, `GCD(25, 26) = 1`, `GCD(100, 101) = 1`. 

Because if a number divides both `n` and `n + 1`, it has to divide their difference<br> `(n + 1) - n = 1`. And the only divisor of `1` is `1`.

So substituting that back:<br>
`n * GCD(n, n + 1) = n * 1 = n`

The GCD is always just `n`. It was `n` the whole damn time.

### Lesson Learned

I always have this bad habit where the moment I open an algorithmic problem, my hands start typing loops before my brain even finishes reading the prompt. 

If the examples literally showed:
- Input: `4` -> Output: `4`
- Input: `5` -> Output: `5`

I really should have paused and asked myself if the answer was just `n` before writing a nested while-loop backward counter. 

Next time, paper first, keyboard second.
