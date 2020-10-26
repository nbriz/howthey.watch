# Averigua

A vanilla JS class that checks for all the things I'm always checking for. Essentially this is my "detection collectoin"

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

## install

```
$ npm install git+https://github.com/nbriz/Averigua.git
```

on the web
```HTML
<script src="node_modules/Averigua/Averigua.js"></script>
```

or in node
```js
const Averigua = require('Averigua')
```

## methods

```js
Averigua.isNode()         // Boolean
Averigua.isBrowser()      // Boolean
Averigua.isMobile()       // Boolean

Averigua.hasWebGL()       // Boolean
Averigua.hasWebVR()       // Boolean
Averigua.hasMIDI()        // Boolean
Averigua.hasTouch()       // Boolean

Averigua.doNotTrack()     // Boolean

Averigua.language()       // returns object with language and country
Averigua.timeZone()       // String

Averigua.orientation()    // String (landscape, portrait or no-support)
Averigua.screen()         // returns object with screen info

Averigua.gpuInfo()        // returns object with GPU info
Averigua.browserInfo()    // returns object with browser info
Averigua.platformInfo()   // returns object with platform info

Averigua.audioSupport()   // returns object with audio support info
Averigua.videoSupport()   // returns object with video support info
Averigua.pluginSupport()  // returns array with plugin info objects
Averigua.storageSupport() // returns object with web storage support info
Averigua.fontSupport()    // returns array of supported fonts
```
