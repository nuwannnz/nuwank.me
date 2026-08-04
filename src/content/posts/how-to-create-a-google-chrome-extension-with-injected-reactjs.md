---
pubDatetime: 2018-06-14T00:00:00.000Z
title: How to create a Google chrome extension with injected ReactJS
description: Build a Chrome extension that injects a ReactJS app into a loaded webpage using content scripts.
tags:
  - JavaScript
  - Chrome
  - Chrome Extension
  - React
  - Google Chrome
canonicalURL: https://medium.com/@nuwan407/how-to-create-a-google-chrome-extension-with-injected-reactjs-d265c55af410
---

A chrome extension can be used to improve the browsing experience of the user. Simple extensions can be developed just by using vanilla JS but a more complex extension needs some kind of a proper architecture. So why not use a framework which is already so popular in the JavaScript world. You guess it, ReactJS. ReactJS is a framework developed by Facebook to manage the frontend of a web app. We can use ReactJS framework to develop robust chrome extensions.

Now a chrome extension can be a pop-up which is displayed when the user clicks on the extension icon on the toolbar of the browser and it will be closed when it loses the focus. In one of my last client projects, we needed to keep the pop-up window opened even when it has lost focus. So as the solution, I decided to inject a ReactJS app into the loaded webpage using content scripts in Chrome extensions. So we were able to control the visibility of our pop up. Here's how we can achieve this.

## Create the React app

First, we have to create a react app.

```bash
create-react-app test-extension
```

To run this command, first you need to install the create-react-app npm package using the below command if you don't have it installed already.

```bash
npm install -g create-react-app
```

## The manifest file

A chrome extension must have a manifest file and in react we already have a manifest file so we can alter that one.

In here the content scripts are the JavaScript code that will be injected into the loaded webpage. Here we inject these code into any webpage as we have `<all_urls>` set for matches. We can inject JS into specific or matching webpages too. You can read about it more in this [documentation](https://developer.chrome.com/apps/match_patterns). You may now wonder what are these `/static/` paths. These paths will be created once we build our react app. Let's build our react app.

```bash
npm run-script build
```

This will create a build folder in our project and we can find the `static` folder inside that. But there is a little problem as Webpack has added a hash to the name of our CSS and JS files. Because of that we will have to update our manifest file each time we perform a build. As a solution, we can edit our Webpack config file. Before that we have to eject our app.

```bash
npm run-script eject
```

Then enter `y` for the confirmation message. Now open the `webpack.config.prod.js` file which is inside the config folder. Then change the following parts. Here we remove the hashes from the generated CSS and JS file names.

Now let's build our app again.

```bash
npm run-script build
```

## Load the extension into Chrome

Now we can add our extension to chrome. Open Google chrome and type `chrome://extensions` on the address bar and press enter. It will load the chrome extensions page. Here we have to enable the developer mode.

Then click on the _'LOAD UNPACKED'_ button and locate and select our `build` folder. Now we have successfully loaded our chrome extension which uses ReactJS into chrome.

## Adding a background script

Now when developing chrome extensions, most of the time we will need a background script. If you don't know what a background script is check [this](https://developer.chrome.com/extensions/background_pages). In our setup if we want a background script then we have to add it to the `public` folder so it will be directly copied into our build folder during the build process. Also we must mention it in the manifest file.

```json
"background" : {
  "scripts": ["background.js"]
}
```

This is how we can setup and use ReactJS in the content scripts of our chrome extensions.

Happy Coding!
