---
title: "Learning .NET in 2026: The VB.NET Plot Twist"
description: ".NET is peak technology with C#, but my college decided to teach us... Visual Basic."
pubDate: 2026-09-29
tags: ["DotNet", "College", "VB.NET", "Rant"]
---

I love the `.NET` ecosystem. Let's just get that out of the way. If you look at modern `C#`, `ASP.NET Core`, `Entity Framework`, and `Blazor`, it's arguably one of the most mature, performant, and "peak" backend technologies you can learn right now. Microsoft has done an incredible job modernizing the stack over the last decade.

So, when I saw "Introduction to `.NET Framework`" on my college syllabus chapter topics, I was actually hyped. I just skimmed it, saw "`.NET`", and thought, "Oh, I already know this." I figured I could just coast through the class, flex my `C#` skills, write some slick `LINQ` queries, and build some high-performance APIs. I didn't even bother reading the rest of the chapter details.

Fast forward to the week before mid-semester exams. I finally sat down to actually study the material so I could pass the test. I opened the notes, looked at the first code snippet, and had an absolute "holy f***" realization.

We weren't learning `C#`. We were learning **`VB.NET`**.

### The Visual Basic Plot Twist

I honestly didn't even know people were still writing *new* curriculum for `VB.NET`. Microsoft themselves literally announced years ago that they were no longer evolving the language with new features! 

Going from modern `TypeScript`/`C#` to `VB.NET` is like driving a Tesla and suddenly being handed the keys to a 1998 Honda Civic with a manual transmission and a sticky clutch. It works, it'll get you from point A to point B, but *man* is it a totally different vibe.

### The Basic Structure: Modules?

If you've never seen `VB.NET` code, let me bless your eyes with the absolute basics. 

In modern `C#`, you don't even need a `Main` method anymore thanks to top-level statements. But even if you use one, it's just a clean static class. 

Here is the monstrosity you have to write just to get a console app running in `VB.NET`:

```vb
Module Program
    Sub Main(args As String())
        Console.WriteLine("Hello World")
    End Sub
End Module
```

What is a `Module`? Why do I need to explicitly `End Sub` and `End Module`? There are no curly braces `{}` anywhere! You feel less like a programmer and more like you're drafting a formal legal document.

### Functions, Subs, and ByVal Madness

Then we started learning how to write functions. In `C#` (or `JavaScript`), a function is just a function. If it doesn't return anything, you just mark it as `void`. 

In `VB.NET`, they split this into two entirely different concepts: `Sub` (subroutine, returns nothing) and `Function` (returns something). And don't even get me started on the parameters and classes:

```vb
Public Class Calculator
    ' Why does this need to be so aggressive?
    Public Function CalculateTax(ByVal amount As Decimal, ByRef taxRate As Decimal) As Decimal
        Return amount * taxRate
    End Function
End Class
```

You have to explicitly state `ByVal` (pass by value) or `ByRef` (pass by reference) in the parameters. You have to write `Public Class` and manually close it with `End Class`. It reads like you're yelling at the compiler.

### The Try/Catch Frustration

Error handling is another beast. In `C#`, a `try/catch` block is visually compact and easy to scan. In `VB.NET`, the lack of brackets makes it feel like it's eating up your entire screen:

```vb
Try
    Dim result As Integer = 10 / 0
Catch ex As DivideByZeroException
    Console.WriteLine("Math broke: " & ex.Message)
Finally
    Console.WriteLine("Done.")
End Try
```

`Try`. `Catch ex As Exception`. `End Try`. It’s just so incredibly verbose. Literally everything requires an `End [Something]`. `End If`, `End Class`, `End Sub`, `End Try`. It drives you absolutely insane when you're used to just tapping the closing bracket `}` on your keyboard.

### The "Why?"

So why is college teaching this in 2026? 

The reasoning I usually hear is: "It's easier for beginners to read because it looks like plain English." 

I get the sentiment. If you've never programmed before, reading `If x = 10 Then` makes a lot of sense. But the problem is that *almost nobody writes code like this in the industry anymore*. The entire modern programming world (`JS`, `TS`, `C++`, `Java`, `C#`, `Rust`, `Go`, `Dart`) revolves around C-style syntax with curly braces and concise declarations. 

Teaching students `VB.NET` in 2026 because it's "easier to read" is like teaching students how to ride a horse because a steering wheel is too confusing. Eventually, they're going to have to drive a car anyway!

### The Silver Lining

Just like with my `PHP` class, I can't completely hate it. 

Underneath the incredibly verbose syntax, it's still compiling down to IL (Intermediate Language) and running on the exact same CLR (Common Language Runtime) as `C#`. You still have access to the massive `.NET` standard library. You can still do powerful things with it. 

It's actually been kind of funny trying to translate my `C#` brain into `VB.NET` syntax. It feels like speaking a foreign language where you know all the concepts but you just have to capitalize every keyword and announce the end of every sentence.

But please, if any professors are reading this... just teach `C#`. We can handle the curly braces. I promise.
