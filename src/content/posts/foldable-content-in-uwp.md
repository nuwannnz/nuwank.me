---
pubDatetime: 2017-01-08T00:00:00.000Z
title: Foldable Content in UWP
description: A custom UWP user control to fold and expand content in a list, since UWP lacks an out of the box control like WPF had.
tags:
  - UWP
  - Windows 10
  - XAML
  - Visual Studio
canonicalURL: https://medium.com/@nuwan407/foldable-content-in-uwp-f4083b72e153
---

One of the last projects I did was coding up the design of an enterprise app. And like in most enterprise apps, this app had a list which needs to be folded and expanded. But unfortunately there was no such out of the box control in UWP (like we had in WPF). So I had to create a one from scratch. And with the time limitation in mind, I decided to go with a User Control. Guess what, the final outcome was not too bad. So I decided to share it with the community.

This is how it looks.

**Properties**

You can use this control with any kind of framework element. It's not just limited to a list. What you have to do is simply assign the property `FoldableContent` to the content you want.

You can specify the content in the header from changing the `HeaderText` property.

You can specify the content you want to display when there are no items in the content. Simply add a framework element to the `EmptyContent` property or change the `EmptyText` property. To display this emptiness you have to set the `DisplayEmpty` property to true. (If a ItemsControl simply bind the `Count` property with a value converter)

You can find the source code in my [GitHub](https://github.com/nuwannnz/UwpFoldableContentControl) repo.

Happy coding. Best of luck.
