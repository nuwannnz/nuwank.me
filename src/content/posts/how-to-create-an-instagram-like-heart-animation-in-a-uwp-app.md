---
pubDatetime: 2017-06-06T00:00:00.000Z
title: How to create an Instagram like heart animation in a UWP app
description: Recreate the Instagram double tap heart animation in a UWP app using XAML storyboards and the Segoe MDL2 Assets font.
tags:
  - UWP
  - UWP Apps
  - Animation
  - Windows 10
  - Windows 10 Mobile
canonicalURL: https://medium.com/@nuwan407/how-to-create-an-instagram-like-heart-animation-in-a-uwp-app-bca8dad04f98
---

We all have seen the lovely heart animation we get when we double tap on a photo in Instagram. Well, it's pretty much easy to get a similar kind of animation in a UWP app using XAML storyboards. So let's get started. So first of all create a blank Universal Windows app in Visual Studio.

For the hearts we can use the Segoe MDL2 Assets font. Which is built into Windows 10. Also we can easily scale them without getting any blurriness. We can use the `FontIcon` control to add these shapes. We need two heart shapes. One with the stroke and another one with the fill.

Basically, what we are going to do is scale up the filled heart shape when the user double taps the other heart shape. So we are going to overlap them so the filled heart is in the front. Below is the XAML code to achieve the above.

```xml
<Grid>
    <FontIcon x:Name="StrokedHeart"
              FontFamily="Segoe MDL2 Assets"
              Glyph="&#xEB51;"
              FontSize="200"
              Foreground="Black"
              IsHitTestVisible="True"
              DoubleTapped="StrokedHeart_DoubleTapped"/>

    <FontIcon x:Name="FilledHeart"
              FontFamily="Segoe MDL2 Assets"
              Glyph="&#xEB52;"
              FontSize="200"
              Foreground="Red"
              Opacity="0"
              RenderTransformOrigin="0.5,0.5">
        <FontIcon.RenderTransform>
            <ScaleTransform x:Name="HeartScaleTransform"
                            ScaleX="0"
                            ScaleY="0"/>
        </FontIcon.RenderTransform>
    </FontIcon>
</Grid>
```

Now we have to create the animations. To do that we are going to use XAML `Storyboards`. We are going to change the value of ScaleX and ScaleY of the `ScaleTransform` of the filled heart. Below is the XAML code for the animations. The second `Storyboard` will add a little shrinking effect after the heart is fully scaled up. So it will add a natural touch to the animation. We can add the below two storyboards to the page resources.

Storyboard 1

```xml
<Storyboard x:Name="ScaleUpStoryboard">
    <DoubleAnimation Storyboard.TargetName="FilledHeart"
                     Storyboard.TargetProperty="Opacity"
                     From="0" To="1"
                     Duration="0:0:0.1"/>
    <DoubleAnimation Storyboard.TargetName="HeartScaleTransform"
                     Storyboard.TargetProperty="ScaleX"
                     From="0" To="1"
                     Duration="0:0:0.3"/>
    <DoubleAnimation Storyboard.TargetName="HeartScaleTransform"
                     Storyboard.TargetProperty="ScaleY"
                     From="0" To="1"
                     Duration="0:0:0.3"/>
</Storyboard>
```

Storyboard 2

```xml
<Storyboard x:Name="ShrinkStoryboard">
    <DoubleAnimation Storyboard.TargetName="HeartScaleTransform"
                     Storyboard.TargetProperty="ScaleX"
                     From="1" To="0.8"
                     Duration="0:0:0.2"/>
    <DoubleAnimation Storyboard.TargetName="HeartScaleTransform"
                     Storyboard.TargetProperty="ScaleY"
                     From="1" To="0.8"
                     Duration="0:0:0.2"/>
</Storyboard>
```

Finally, we have to add the `DoubleTap` event handler to the stroked heart shape. Inside the event handler we are going to begin the first `Storyboard` and we are adding an event handler to the 'Completed' event of that `Storyboard`. So we can stop the first one and begin the second 'Storyboard'. Check the below code.

Double Tap event handler

```csharp
private void StrokedHeart_DoubleTapped(object sender, DoubleTappedRoutedEventArgs e)
{
    ScaleUpStoryboard.Completed += ScaleUpStoryboard_Completed;
    ScaleUpStoryboard.Begin();
}

private void ScaleUpStoryboard_Completed(object sender, object e)
{
    ScaleUpStoryboard.Stop();
    ShrinkStoryboard.Begin();
}
```

Now we can run the app. Now this is a very simple version for the sake of explaining. But in a real app these shapes will probably end up in a user control.

Happy coding!!
