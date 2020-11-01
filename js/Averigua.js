/* global DocumentTouch */
/*
    Averigua
    -----------
    by Nick Briz <nickbriz@gmail.com>
    GNU GPLv3 - https://www.gnu.org/licenses/gpl-3.0.txt
    2019

    -----------
       info
    -----------

    A vanilla JS class that checks for all the things i'm always checking for.

    -----------
       usage
    -----------

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
*/
class Averigua {
  static _browserErr () {
    console.error('Averigua: this is not a browser')
  }

  static isNode () {
    if (typeof process !== 'undefined') return process.version
    else return false
  }

  static isBrowser () {
    return (typeof window !== 'undefined' && typeof document !== 'undefined')
  }

  static isMobile () {
    if (!this.isBrowser()) return this._browserErr()
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
      return true
    } else {
      return false
    }
  }

  static hasWebGL () {
    if (!this.isBrowser()) return this._browserErr()

    return (!!window.WebGLRenderingContext &&
      !!document.createElement('canvas').getContext('experimental-webgl'))
  }

  static hasWebVR () {
    if (!this.isBrowser()) return this._browserErr()

    return (typeof navigator.getVRDisplays !== 'undefined')
  }

  static hasMIDI () {
    if (!this.isBrowser()) return this._browserErr()

    if (navigator.requestMIDIAccess) return true
    else return false
  }

  static hasTouch () {
    // via: https://stackoverflow.com/a/4819886/1104148
    if (!this.isBrowser()) return this._browserErr()
    const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ')
    const mq = function (query) { return window.matchMedia(query).matches }
    if (('ontouchstart' in window) ||
      (window.DocumentTouch && document instanceof DocumentTouch)) {
      return true
    }
    let query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')']
    query = query.join('')
    if (mq(query)) return true
    else return false
  }

  static doNotTrack () {
    if (!this.isBrowser()) return this._browserErr()
    const t = navigator.doNotTrack
    if (t === '1' || t === 'yes' || t === 1 || t === true) {
      return true
    } else return false
  }

  static orientation () {
    if (!this.isBrowser()) return this._browserErr()

    if (window.orientation) {
      if (window.orientation === -90 || window.orientation === 90) {
        return 'landscape'
      } else return 'portrait'
    } else return 'no-support'
  }

  static screen () {
    return {
      orientation: this.orientation(),
      colorDepth: window.screen.colorDepth,
      width: window.screen.width,
      height: window.screen.height
    }
  }

  static language () {
    const arr = navigator.language.split('-')
    const lan = { language: this.languageCodes()[arr[0]] }
    if (arr.length > 1) lan.country = this.countryCodes()[arr[1]]
    return lan
  }

  static timeZone () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : new Date().getTimezoneOffset()
  }

  static gpuInfo () {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl')
    const dbgRenNfo = gl.getExtension('WEBGL_debug_renderer_info')
    let vendor = gl.getParameter(gl.VENDOR)
    let renderer = gl.getParameter(gl.RENDERER)
    if (dbgRenNfo) {
      vendor = gl.getParameter(dbgRenNfo.UNMASKED_VENDOR_WEBGL)
      renderer = gl.getParameter(dbgRenNfo.UNMASKED_RENDERER_WEBGL)
    }
    return { vendor, renderer }
  }

  static browserInfo () {
    if (!this.isBrowser()) return this._browserErr()

    const ua = navigator.userAgent
    let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
    let tem
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || []
      return 'IE ' + (tem[1] || '')
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/)
      if (tem !== null) return tem.slice(1).join(' ').replace('OPR', 'Opera')
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
    if ((tem = ua.match(/version\/(\d+)/i)) !== null) M.splice(1, 1, tem[1])
    // check for Brave browser
    if (window.navigator.brave &&
        window.navigator.brave.isBrave.name === 'isBrave') {
      M[0] = 'Brave'; M[1] = null
    }
    return { name: M[0], version: M[1] }
  }

  static platformInfo () {
    if (this.isBrowser()) {
      return {
        mobile: this.isMobile(),
        browser: this.browserInfo(),
        oscpu: navigator.oscpu,
        processors: navigator.hardwareConcurrency,
        platform: navigator.platform
      }
    }
    const os = require('os')
    return {
      platform: process.platform,
      os: {
        arch: os.arch(),
        type: os.type(),
        release: os.release(),
        cpus: os.cpus(),
        freemem: os.freemem(),
        totalmem: os.totalmem(),
        homedir: os.homedir(),
        hostname: os.hostname(),
        userInfo: os.userInfo(),
        networkInterfaces: os.networkInterfaces()
      },
      env: process.env
    }
  }

  static audioSupport () {
    if (!this.isBrowser()) return this._browserErr()

    const aObj = { mp3: 'no', vorbis: 'no', wav: 'no', aac: 'no' }
    const a = document.createElement('audio')
    if (typeof a.canPlayType === 'function') {
      aObj.mp3 = a.canPlayType('audio/mpeg;')
      if (aObj.mp3 === '') aObj.mp3 = 'no'
      aObj.vorbis = a.canPlayType('audio/ogg; codecs="vorbis"')
      if (aObj.vorbis === '') aObj.vorbis = 'no'
      aObj.wav = a.canPlayType('audio/wav; codecs="1"')
      if (aObj.wav === '') aObj.wav = 'no'
      aObj.aac = a.canPlayType('audio/mp4; codecs="mp4a.40.2"')
      if (aObj.aac === '') aObj.aac = 'no'
    }
    return aObj
  }

  static videoSupport () {
    if (!this.isBrowser()) return this._browserErr()

    const vObj = {
      captions: 'no',
      poster: 'no',
      webm: 'no',
      h264: 'no',
      theora: 'no'
    }
    const v = document.createElement('video')
    if (typeof v.canPlayType === 'function') {
      vObj.webm = v.canPlayType('video/webm; codecs="vp8, vorbis"')
      if (vObj.webm === '') vObj.webm = 'no'
      vObj.h264 = v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
      if (vObj.h264 === '') vObj.h264 = 'no'
      vObj.theora = v.canPlayType('video/ogg; codecs="theora"')
      if (vObj.theora === '') vObj.theora = 'no'

      vObj.poster = ('poster' in document.createElement('video'))
        ? 'probably' : 'no'
      vObj.captions = ('src' in document.createElement('track'))
        ? 'probably' : 'no'
    }
    return vObj
  }

  static pluginSupport () {
    if (!this.isBrowser()) return this._browserErr()

    const plugins = []
    for (let i = 0; i < navigator.plugins.length; i++) {
      const p = {
        name: navigator.plugins[i].name,
        description: navigator.plugins[i].description,
        filename: navigator.plugins[i].filename,
        array: []
      }
      for (let j = 0; j < navigator.plugins[i].length; j++) {
        p.array.push({
          description: navigator.plugins[i][j].description,
          type: navigator.plugins[i][j].type,
          suffixes: navigator.plugins[i][j].suffixes
        })
      }
      plugins.push(p)
    }

    return plugins
  }

  static storageSupport () {
    if (!this.isBrowser()) return this._browserErr()
    const s = { localStorage: false, sessionStorage: false, indexedDB: false }
    if (window.localStorage) s.localStorage = true
    if (window.sessionStorage) s.sessionStorage = true
    if (window.indexedDB) s.indexedDB = true
    return s
  }

  static fontSupport () {
    // via: https://stackoverflow.com/a/3368855/1104148
    const baseFonts = ['monospace', 'sans-serif', 'serif']

    const fontList = [
      'Andale Mono', 'Arial', 'Arial Black', 'Arial Hebrew', 'Arial MT', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS',
      'Bitstream Vera Sans Mono', 'Book Antiqua', 'Bookman Old Style',
      'Calibri', 'Cambria', 'Cambria Math', 'Century', 'Century Gothic', 'Century Schoolbook', 'Comic Sans', 'Comic Sans MS', 'Consolas', 'Courier', 'Courier New',
      'Geneva', 'Georgia',
      'Helvetica', 'Helvetica Neue',
      'Impact',
      'Lucida Bright', 'Lucida Calligraphy', 'Lucida Console', 'Lucida Fax', 'LUCIDA GRANDE', 'Lucida Handwriting', 'Lucida Sans', 'Lucida Sans Typewriter', 'Lucida Sans Unicode',
      'Microsoft Sans Serif', 'Monaco', 'Monotype Corsiva', 'MS Gothic', 'MS Outlook', 'MS PGothic', 'MS Reference Sans Serif', 'MS Sans Serif', 'MS Serif', 'MYRIAD', 'MYRIAD PRO',
      'Palatino', 'Palatino Linotype',
      'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Symbol',
      'Tahoma', 'Times', 'Times New Roman', 'Times New Roman PS', 'Trebuchet MS',
      'Verdana', 'Wingdings', 'Wingdings 2', 'Wingdings 3',
      'Abadi MT Condensed Light', 'Academy Engraved LET', 'ADOBE CASLON PRO', 'Adobe Garamond', 'ADOBE GARAMOND PRO', 'Agency FB', 'Aharoni', 'Albertus Extra Bold', 'Albertus Medium', 'Algerian', 'Amazone BT', 'American Typewriter',
      'American Typewriter Condensed', 'AmerType Md BT', 'Andalus', 'Angsana New', 'AngsanaUPC', 'Antique Olive', 'Aparajita', 'Apple Chancery', 'Apple Color Emoji', 'Apple SD Gothic Neo', 'Arabic Typesetting', 'ARCHER',
      'ARNO PRO', 'Arrus BT', 'Aurora Cn BT', 'AvantGarde Bk BT', 'AvantGarde Md BT', 'AVENIR', 'Ayuthaya', 'Bandy', 'Bangla Sangam MN', 'Bank Gothic', 'BankGothic Md BT', 'Baskerville',
      'Baskerville Old Face', 'Batang', 'BatangChe', 'Bauer Bodoni', 'Bauhaus 93', 'Bazooka', 'Bell MT', 'Bembo', 'Benguiat Bk BT', 'Berlin Sans FB', 'Berlin Sans FB Demi', 'Bernard MT Condensed', 'BernhardFashion BT', 'BernhardMod BT', 'Big Caslon', 'BinnerD',
      'Blackadder ITC', 'BlairMdITC TT', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bodoni MT', 'Bodoni MT Black', 'Bodoni MT Condensed', 'Bodoni MT Poster Compressed',
      'Bookshelf Symbol 7', 'Boulder', 'Bradley Hand', 'Bradley Hand ITC', 'Bremen Bd BT', 'Britannic Bold', 'Broadway', 'Browallia New', 'BrowalliaUPC', 'Brush Script MT', 'Californian FB', 'Calisto MT', 'Calligrapher', 'Candara',
      'CaslonOpnface BT', 'Castellar', 'Centaur', 'Cezanne', 'CG Omega', 'CG Times', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charlesworth', 'Charter Bd BT', 'Charter BT', 'Chaucer',
      'ChelthmITC Bk BT', 'Chiller', 'Clarendon', 'Clarendon Condensed', 'CloisterBlack BT', 'Cochin', 'Colonna MT', 'Constantia', 'Cooper Black', 'Copperplate', 'Copperplate Gothic', 'Copperplate Gothic Bold',
      'Copperplate Gothic Light', 'CopperplGoth Bd BT', 'Corbel', 'Cordia New', 'CordiaUPC', 'Cornerstone', 'Coronet', 'Cuckoo', 'Curlz MT', 'DaunPenh', 'Dauphin', 'David', 'DB LCD Temp', 'DELICIOUS', 'Denmark',
      'DFKai-SB', 'Didot', 'DilleniaUPC', 'DIN', 'DokChampa', 'Dotum', 'DotumChe', 'Ebrima', 'Edwardian Script ITC', 'Elephant', 'English 111 Vivace BT', 'Engravers MT', 'EngraversGothic BT', 'Eras Bold ITC', 'Eras Demi ITC', 'Eras Light ITC', 'Eras Medium ITC',
      'EucrosiaUPC', 'Euphemia', 'Euphemia UCAS', 'EUROSTILE', 'Exotc350 Bd BT', 'FangSong', 'Felix Titling', 'Fixedsys', 'FONTIN', 'Footlight MT Light', 'Forte',
      'FrankRuehl', 'Fransiscan', 'Freefrm721 Blk BT', 'FreesiaUPC', 'Freestyle Script', 'French Script MT', 'FrnkGothITC Bk BT', 'Fruitger', 'FRUTIGER',
      'Futura', 'Futura Bk BT', 'Futura Lt BT', 'Futura Md BT', 'Futura ZBlk BT', 'FuturaBlack BT', 'Gabriola', 'Galliard BT', 'Gautami', 'Geeza Pro', 'Geometr231 BT', 'Geometr231 Hv BT', 'Geometr231 Lt BT', 'GeoSlab 703 Lt BT',
      'GeoSlab 703 XBd BT', 'Gigi', 'Gill Sans', 'Gill Sans MT', 'Gill Sans MT Condensed', 'Gill Sans MT Ext Condensed Bold', 'Gill Sans Ultra Bold', 'Gill Sans Ultra Bold Condensed', 'Gisha', 'Gloucester MT Extra Condensed', 'GOTHAM', 'GOTHAM BOLD',
      'Goudy Old Style', 'Goudy Stout', 'GoudyHandtooled BT', 'GoudyOLSt BT', 'Gujarati Sangam MN', 'Gulim', 'GulimChe', 'Gungsuh', 'GungsuhChe', 'Gurmukhi MN', 'Haettenschweiler', 'Harlow Solid Italic', 'Harrington', 'Heather', 'Heiti SC', 'Heiti TC', 'HELV',
      'Herald', 'High Tower Text', 'Hiragino Kaku Gothic ProN', 'Hiragino Mincho ProN', 'Hoefler Text', 'Humanst 521 Cn BT', 'Humanst521 BT', 'Humanst521 Lt BT', 'Imprint MT Shadow', 'Incised901 Bd BT', 'Incised901 BT',
      'Incised901 Lt BT', 'INCONSOLATA', 'Informal Roman', 'Informal011 BT', 'INTERSTATE', 'IrisUPC', 'Iskoola Pota', 'JasmineUPC', 'Jazz LET', 'Jenson', 'Jester', 'Jokerman', 'Juice ITC', 'Kabel Bk BT', 'Kabel Ult BT', 'Kailasa', 'KaiTi', 'Kalinga', 'Kannada Sangam MN',
      'Kartika', 'Kaufmann Bd BT', 'Kaufmann BT', 'Khmer UI', 'KodchiangUPC', 'Kokila', 'Korinna BT', 'Kristen ITC', 'Krungthep', 'Kunstler Script', 'Lao UI', 'Latha', 'Leelawadee', 'Letter Gothic', 'Levenim MT', 'LilyUPC', 'Lithograph', 'Lithograph Light', 'Long Island',
      'Lydian BT', 'Magneto', 'Maiandra GD', 'Malayalam Sangam MN', 'Malgun Gothic',
      'Mangal', 'Marigold', 'Marion', 'Marker Felt', 'Market', 'Marlett', 'Matisse ITC', 'Matura MT Script Capitals', 'Meiryo', 'Meiryo UI', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Tai Le',
      'Microsoft Uighur', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU', 'MingLiU_HKSCS', 'MingLiU_HKSCS-ExtB', 'MingLiU-ExtB', 'Minion', 'Minion Pro', 'Miriam', 'Miriam Fixed', 'Mistral', 'Modern', 'Modern No. 20', 'Mona Lisa Solid ITC TT', 'Mongolian Baiti',
      'MONO', 'MoolBoran', 'Mrs Eaves', 'MS LineDraw', 'MS Mincho', 'MS PMincho', 'MS Reference Specialty', 'MS UI Gothic', 'MT Extra', 'MUSEO', 'MV Boli',
      'Nadeem', 'Narkisim', 'NEVIS', 'News Gothic', 'News GothicMT', 'NewsGoth BT', 'Niagara Engraved', 'Niagara Solid', 'Noteworthy', 'NSimSun', 'Nyala', 'OCR A Extended', 'Old Century', 'Old English Text MT', 'Onyx', 'Onyx BT', 'OPTIMA', 'Oriya Sangam MN',
      'OSAKA', 'OzHandicraft BT', 'Palace Script MT', 'Papyrus', 'Parchment', 'Party LET', 'Pegasus', 'Perpetua', 'Perpetua Titling MT', 'PetitaBold', 'Pickwick', 'Plantagenet Cherokee', 'Playbill', 'PMingLiU', 'PMingLiU-ExtB',
      'Poor Richard', 'Poster', 'PosterBodoni BT', 'PRINCETOWN LET', 'Pristina', 'PTBarnum BT', 'Pythagoras', 'Raavi', 'Rage Italic', 'Ravie', 'Ribbon131 Bd BT', 'Rockwell', 'Rockwell Condensed', 'Rockwell Extra Bold', 'Rod', 'Roman', 'Sakkal Majalla',
      'Santa Fe LET', 'Savoye LET', 'Sceptre', 'Script', 'Script MT Bold', 'SCRIPTINA', 'Serifa', 'Serifa BT', 'Serifa Th BT', 'ShelleyVolante BT', 'Sherwood',
      'Shonar Bangla', 'Showcard Gothic', 'Shruti', 'Signboard', 'SILKSCREEN', 'SimHei', 'Simplified Arabic', 'Simplified Arabic Fixed', 'SimSun', 'SimSun-ExtB', 'Sinhala Sangam MN', 'Sketch Rockwell', 'Skia', 'Small Fonts', 'Snap ITC', 'Snell Roundhand', 'Socket',
      'Souvenir Lt BT', 'Staccato222 BT', 'Steamer', 'Stencil', 'Storybook', 'Styllo', 'Subway', 'Swis721 BlkEx BT', 'Swiss911 XCm BT', 'Sylfaen', 'Synchro LET', 'System', 'Tamil Sangam MN', 'Technical', 'Teletype', 'Telugu Sangam MN', 'Tempus Sans ITC',
      'Terminal', 'Thonburi', 'Traditional Arabic', 'Trajan', 'TRAJAN PRO', 'Tristan', 'Tubular', 'Tunga', 'Tw Cen MT', 'Tw Cen MT Condensed', 'Tw Cen MT Condensed Extra Bold',
      'TypoUpright BT', 'Unicorn', 'Univers', 'Univers CE 55 Medium', 'Univers Condensed', 'Utsaah', 'Vagabond', 'Vani', 'Vijaya', 'Viner Hand ITC', 'VisualUI', 'Vivaldi', 'Vladimir Script', 'Vrinda', 'Westminster', 'WHITNEY', 'Wide Latin',
      'ZapfEllipt BT', 'ZapfHumnst BT', 'ZapfHumnst Dm BT', 'Zapfino', 'Zurich BlkEx BT', 'Zurich Ex BT', 'ZWAdobeF']

    const testString = 'mmmmmmmmmmlli'
    const testSize = '72px'
    const h = document.getElementsByTagName('body')[0]
    const baseFontsDiv = document.createElement('div')
    const fontsDiv = document.createElement('div')
    const defaultWidth = {}
    const defaultHeight = {}

    const createSpan = function () {
      const s = document.createElement('span')
      s.style.position = 'absolute'
      s.style.left = '-9999px'
      s.style.fontSize = testSize
      s.style.fontStyle = 'normal'
      s.style.fontWeight = 'normal'
      s.style.letterSpacing = 'normal'
      s.style.lineBreak = 'auto'
      s.style.lineHeight = 'normal'
      s.style.textTransform = 'none'
      s.style.textAlign = 'left'
      s.style.textDecoration = 'none'
      s.style.textShadow = 'none'
      s.style.whiteSpace = 'normal'
      s.style.wordBreak = 'normal'
      s.style.wordSpacing = 'normal'
      s.innerHTML = testString
      return s
    }

    const createSpanWithFonts = function (fontToDetect, baseFont) {
      const s = createSpan()
      s.style.fontFamily = `'${fontToDetect}',${baseFont}`
      return s
    }

    const initializeBaseFontsSpans = function () {
      const spans = []
      for (let idx = 0, length = baseFonts.length; idx < length; idx++) {
        const s = createSpan()
        s.style.fontFamily = baseFonts[idx]
        baseFontsDiv.appendChild(s)
        spans.push(s)
      }
      return spans
    }

    const initializeFontsSpans = function () {
      var spans = {}
      for (let i = 0, l = fontList.length; i < l; i++) {
        const fontSpans = []
        for (let j = 0, numDFnts = baseFonts.length; j < numDFnts; j++) {
          const s = createSpanWithFonts(fontList[i], baseFonts[j])
          fontsDiv.appendChild(s)
          fontSpans.push(s)
        }
        spans[fontList[i]] = fontSpans
      }
      return spans
    }

    const isFontAvailable = function (fontSpans) {
      let d = false
      for (let i = 0; i < baseFonts.length; i++) {
        d = (fontSpans[i].offsetWidth !== defaultWidth[baseFonts[i]] || fontSpans[i].offsetHeight !== defaultHeight[baseFonts[i]])
        if (d) { return d }
      }
      return d
    }

    const baseFontsSpans = initializeBaseFontsSpans()
    h.appendChild(baseFontsDiv)

    for (let idx = 0, length = baseFonts.length; idx < length; idx++) {
      defaultWidth[baseFonts[idx]] = baseFontsSpans[idx].offsetWidth
      defaultHeight[baseFonts[idx]] = baseFontsSpans[idx].offsetHeight
    }

    const fontsSpans = initializeFontsSpans()
    h.appendChild(fontsDiv)

    const available = []
    for (let i = 0, l = fontList.length; i < l; i++) {
      if (isFontAvailable(fontsSpans[fontList[i]])) {
        available.push(fontList[i])
      }
    }
    return available
  }

  static languageCodes () {
    return {
      ab: 'Abkhazian',
      aa: 'Afar',
      af: 'Afrikaans',
      ak: 'Akan',
      sq: 'Albanian',
      am: 'Amharic',
      ar: 'Arabic',
      an: 'Aragonese',
      hy: 'Armenian',
      as: 'Assamese',
      av: 'Avaric',
      ae: 'Avestan',
      ay: 'Aymara',
      az: 'Azerbaijani',
      bm: 'Bambara',
      ba: 'Bashkir',
      eu: 'Basque',
      be: 'Belarusian',
      bn: 'Bengali (Bangla)',
      bh: 'Bihari',
      bi: 'Bislama',
      bs: 'Bosnian',
      br: 'Breton',
      bg: 'Bulgarian',
      my: 'Burmese',
      ca: 'Catalan',
      ch: 'Chamorro',
      ce: 'Chechen',
      ny: 'Chichewa, Chewa, Nyanja',
      zh: 'Chinese',
      'zh-Hans': 'Chinese (Simplified)',
      'zh-Hant': 'Chinese (Traditional)',
      cv: 'Chuvash',
      kw: 'Cornish',
      co: 'Corsican',
      cr: 'Cree',
      hr: 'Croatian',
      cs: 'Czech',
      da: 'Danish',
      dv: 'Divehi, Dhivehi, Maldivian',
      nl: 'Dutch',
      dz: 'Dzongkha',
      en: 'English',
      eo: 'Esperanto',
      et: 'Estonian',
      ee: 'Ewe',
      fo: 'Faroese',
      fj: 'Fijian',
      fi: 'Finnish',
      fr: 'French',
      ff: 'Fula, Fulah, Pulaar, Pular',
      gl: 'Galician',
      gd: 'Gaelic (Scottish)',
      gv: 'Gaelic (Manx)',
      ka: 'Georgian',
      de: 'German',
      el: 'Greek',
      gn: 'Guarani',
      gu: 'Gujarati',
      ht: 'Haitian Creole',
      ha: 'Hausa',
      he: 'Hebrew',
      hz: 'Herero',
      hi: 'Hindi',
      ho: 'Hiri Motu',
      hu: 'Hungarian',
      is: 'Icelandic',
      io: 'Ido',
      ig: 'Igbo',
      id: 'Indonesian',
      in: 'Indonesian',
      ia: 'Interlingua',
      ie: 'Interlingue',
      iu: 'Inuktitut',
      ik: 'Inupiak',
      ga: 'Irish',
      it: 'Italian',
      ja: 'Japanese',
      jv: 'Javanese',
      kl: 'Kalaallisut, Greenlandic',
      kn: 'Kannada',
      kr: 'Kanuri',
      ks: 'Kashmiri',
      kk: 'Kazakh',
      km: 'Khmer',
      ki: 'Kikuyu',
      rw: 'Kinyarwanda (Rwanda)',
      rn: 'Kirundi',
      ky: 'Kyrgyz',
      kv: 'Komi',
      kg: 'Kongo',
      ko: 'Korean',
      ku: 'Kurdish',
      kj: 'Kwanyama',
      lo: 'Lao',
      la: 'Latin',
      lv: 'Latvian (Lettish)',
      li: 'Limburgish ( Limburger)',
      ln: 'Lingala',
      lt: 'Lithuanian',
      lu: 'Luga-Katanga',
      lg: 'Luganda, Ganda',
      lb: 'Luxembourgish',
      mk: 'Macedonian',
      mg: 'Malagasy',
      ms: 'Malay',
      ml: 'Malayalam',
      mt: 'Maltese',
      mi: 'Maori',
      mr: 'Marathi',
      mh: 'Marshallese',
      mo: 'Moldavian',
      mn: 'Mongolian',
      na: 'Nauru',
      nv: 'Navajo',
      ng: 'Ndonga',
      nd: 'Northern Ndebele',
      ne: 'Nepali',
      no: 'Norwegian',
      nb: 'Norwegian bokmål',
      nn: 'Norwegian nynorsk',
      ii: 'Nuosu | Sichuan Yi',
      oc: 'Occitan',
      oj: 'Ojibwe',
      cu: 'Old Church Slavonic, Old Bulgarian',
      or: 'Oriya',
      om: 'Oromo (Afaan Oromo)',
      os: 'Ossetian',
      pi: 'Pāli',
      ps: 'Pashto, Pushto',
      fa: 'Persian (Farsi)',
      pl: 'Polish',
      pt: 'Portuguese',
      pa: 'Punjabi (Eastern)',
      qu: 'Quechua',
      rm: 'Romansh',
      ro: 'Romanian',
      ru: 'Russian',
      se: 'Sami',
      sm: 'Samoan',
      sg: 'Sango',
      sa: 'Sanskrit',
      sr: 'Serbian',
      sh: 'Serbo-Croatian',
      st: 'Sesotho',
      tn: 'Setswana',
      sn: 'Shona',
      sd: 'Sindhi',
      si: 'Sinhalese',
      ss: 'Siswati | Swati',
      sk: 'Slovak',
      sl: 'Slovenian',
      so: 'Somali',
      nr: 'Southern Ndebele',
      es: 'Spanish',
      su: 'Sundanese',
      sw: 'Swahili (Kiswahili)',
      sv: 'Swedish',
      tl: 'Tagalog',
      ty: 'Tahitian',
      tg: 'Tajik',
      ta: 'Tamil',
      tt: 'Tatar',
      te: 'Telugu',
      th: 'Thai',
      bo: 'Tibetan',
      ti: 'Tigrinya',
      to: 'Tonga',
      ts: 'Tsonga',
      tr: 'Turkish',
      tk: 'Turkmen',
      tw: 'Twi',
      ug: 'Uyghur',
      uk: 'Ukrainian',
      ur: 'Urdu',
      uz: 'Uzbek',
      ve: 'Venda',
      vi: 'Vietnamese',
      vo: 'Volapük',
      wa: 'Wallon',
      cy: 'Welsh',
      wo: 'Wolof',
      fy: 'Western Frisian',
      xh: 'Xhosa',
      yi: 'Yiddish',
      ji: 'Yiddish',
      yo: 'Yoruba',
      za: 'Zhuang, Chuang',
      zu: 'Zulu'
    }
  }

  static countryCodes () {
    return {
      AF: 'AFGHANISTAN',
      AL: 'ALBANIA',
      DZ: 'ALGERIA',
      AS: 'AMERICAN SAMOA',
      AD: 'ANDORRA',
      AO: 'ANGOLA',
      AQ: 'ANTARCTICA',
      AG: 'ANTIGUA AND BARBUDA',
      AR: 'ARGENTINA',
      AM: 'ARMENIA',
      AW: 'ARUBA',
      AU: 'AUSTRALIA',
      AT: 'AUSTRIA',
      AZ: 'AZERBAIJAN',
      BS: 'BAHAMAS',
      BH: 'BAHRAIN',
      BD: 'BANGLADESH',
      BB: 'BARBADOS',
      BY: 'BELARUS',
      BE: 'BELGIUM',
      BZ: 'BELIZE',
      BJ: 'BENIN',
      BM: 'BERMUDA',
      BT: 'BHUTAN',
      BO: 'BOLIVIA',
      BA: 'BOSNIA AND HERZEGOVINA',
      BW: 'BOTSWANA',
      BV: 'BOUVET ISLAND',
      BR: 'BRAZIL',
      IO: 'BRITISH INDIAN OCEAN TERRITORY',
      BN: 'BRUNEI DARUSSALAM',
      BG: 'BULGARIA',
      BF: 'BURKINA FASO',
      BI: 'BURUNDI',
      KH: 'CAMBODIA',
      CM: 'CAMEROON',
      CA: 'CANADA',
      CV: 'CAPE VERDE',
      KY: 'CAYMAN ISLANDS',
      CF: 'CENTRAL AFRICAN REPUBLIC',
      TD: 'CHAD',
      CL: 'CHILE',
      CN: 'CHINA',
      CX: 'CHRISTMAS ISLAND',
      CC: 'COCOS (KEELING) ISLANDS',
      CO: 'COLOMBIA',
      KM: 'COMOROS',
      CG: 'CONGO',
      CD: 'CONGO, THE DEMOCRATIC REPUBLIC OF THE',
      CK: 'COOK ISLANDS',
      CR: 'COSTA RICA',
      CI: 'CÔTE D\'IVOIRE',
      HR: 'CROATIA',
      CU: 'CUBA',
      CY: 'CYPRUS',
      CZ: 'CZECH REPUBLIC',
      DK: 'DENMARK',
      DJ: 'DJIBOUTI',
      DM: 'DOMINICA',
      DO: 'DOMINICAN REPUBLIC',
      EC: 'ECUADOR',
      EG: 'EGYPT',
      SV: 'EL SALVADOR',
      GQ: 'EQUATORIAL GUINEA',
      ER: 'ERITREA',
      EE: 'ESTONIA',
      ET: 'ETHIOPIA',
      FK: 'FALKLAND ISLANDS (MALVINAS)',
      FO: 'FAROE ISLANDS',
      FJ: 'FIJI',
      FI: 'FINLAND',
      FR: 'FRANCE',
      GF: 'FRENCH GUIANA',
      PF: 'FRENCH POLYNESIA',
      TF: 'FRENCH SOUTHERN TERRITORIES',
      GA: 'GABON',
      GM: 'GAMBIA',
      GE: 'GEORGIA',
      DE: 'GERMANY',
      GH: 'GHANA',
      GI: 'GIBRALTAR',
      GR: 'GREECE',
      GL: 'GREENLAND',
      GD: 'GRENADA',
      GP: 'GUADELOUPE',
      GU: 'GUAM',
      GT: 'GUATEMALA',
      GN: 'GUINEA',
      GW: 'GUINEA-BISSAU',
      GY: 'GUYANA',
      HT: 'HAITI',
      HM: 'HEARD ISLAND AND MCDONALD ISLANDS',
      HN: 'HONDURAS',
      HK: 'HONG KONG',
      HU: 'HUNGARY',
      IS: 'ICELAND',
      IN: 'INDIA',
      ID: 'INDONESIA',
      IR: 'IRAN, ISLAMIC REPUBLIC OF',
      IQ: 'IRAQ',
      IE: 'IRELAND',
      IL: 'ISRAEL',
      IT: 'ITALY',
      JM: 'JAMAICA',
      JP: 'JAPAN',
      JO: 'JORDAN',
      KZ: 'KAZAKHSTAN',
      KE: 'KENYA',
      KI: 'KIRIBATI',
      KP: 'KOREA, DEMOCRATIC PEOPLE\'S REPUBLIC OF',
      KR: 'KOREA, REPUBLIC OF',
      KW: 'KUWAIT',
      KG: 'KYRGYZSTAN',
      LA: 'LAO PEOPLE\'S DEMOCRATIC REPUBLIC (LAOS)',
      LV: 'LATVIA',
      LB: 'LEBANON',
      LS: 'LESOTHO',
      LR: 'LIBERIA',
      LY: 'LIBYA, STATE OF',
      LI: 'LIECHTENSTEIN',
      LT: 'LITHUANIA',
      LU: 'LUXEMBOURG',
      MO: 'MACAO',
      MK: 'MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF',
      MG: 'MADAGASCAR',
      MW: 'MALAWI',
      MY: 'MALAYSIA',
      MV: 'MALDIVES',
      ML: 'MALI',
      MT: 'MALTA',
      MH: 'MARSHALL ISLANDS',
      MQ: 'MARTINIQUE',
      MR: 'MAURITANIA',
      MU: 'MAURITIUS',
      YT: 'MAYOTTE',
      MX: 'MEXICO',
      FM: 'MICRONESIA, FEDERATED STATES OF',
      MD: 'MOLDOVA, REPUBLIC OF',
      MC: 'MONACO',
      MN: 'MONGOLIA',
      ME: 'MONTENEGRO',
      MS: 'MONTSERRAT',
      MA: 'MOROCCO',
      MZ: 'MOZAMBIQUE',
      MM: 'MYANMAR',
      NA: 'NAMIBIA',
      NR: 'NAURU',
      NP: 'NEPAL, FEDERAL DEMOCRATIC REPUBLIC OF',
      NL: 'NETHERLANDS',
      AN: 'NETHERLANDS ANTILLES',
      NC: 'NEW CALEDONIA',
      NZ: 'NEW ZEALAND',
      NI: 'NICARAGUA',
      NE: 'NIGER',
      NG: 'NIGERIA',
      NU: 'NIUE',
      NF: 'NORFOLK ISLAND',
      MP: 'NORTHERN MARIANA ISLANDS',
      NO: 'NORWAY',
      OM: 'OMAN',
      PK: 'PAKISTAN',
      PW: 'PALAU',
      PS: 'PALESTINE, STATE OF',
      PA: 'PANAMA',
      PG: 'PAPUA NEW GUINEA',
      PY: 'PARAGUAY',
      PE: 'PERU',
      PH: 'PHILIPPINES',
      PN: 'PITCAIRN',
      PL: 'POLAND',
      PT: 'PORTUGAL',
      PR: 'PUERTO RICO',
      QA: 'QATAR',
      RE: 'RÉUNION',
      RO: 'ROMANIA',
      RU: 'RUSSIAN FEDERATION',
      RW: 'RWANDA',
      SH: 'SAINT HELENA',
      KN: 'SAINT KITTS AND NEVIS',
      LC: 'SAINT LUCIA',
      PM: 'SAINT PIERRE AND MIQUELON',
      VC: 'SAINT VINCENT AND THE GRENADINES',
      WS: 'SAMOA',
      SM: 'SAN MARINO',
      ST: 'SAO TOME AND PRINCIPE',
      SA: 'SAUDI ARABIA',
      SN: 'SENEGAL',
      RS: 'SERBIA',
      SC: 'SEYCHELLES',
      SL: 'SIERRA LEONE',
      SG: 'SINGAPORE',
      SK: 'SLOVAKIA',
      SI: 'SLOVENIA',
      SB: 'SOLOMON ISLANDS',
      SO: 'SOMALIA',
      ZA: 'SOUTH AFRICA',
      GS: 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
      SS: 'SOUTH SUDAN',
      ES: 'SPAIN',
      LK: 'SRI LANKA',
      SD: 'SUDAN',
      SR: 'SURINAME',
      SJ: 'SVALBARD AND JAN MAYEN',
      SZ: 'SWAZILAND',
      SE: 'SWEDEN',
      CH: 'SWITZERLAND',
      SY: 'SYRIAN ARAB REPUBLIC',
      TW: 'TAIWAN',
      TJ: 'TAJIKISTAN',
      TZ: 'TANZANIA, UNITED REPUBLIC OF',
      TH: 'THAILAND',
      TL: 'TIMOR-LESTE',
      TG: 'TOGO',
      TK: 'TOKELAU',
      TO: 'TONGA',
      TT: 'TRINIDAD AND TOBAGO',
      TN: 'TUNISIA',
      TR: 'TURKEY',
      TM: 'TURKMENISTAN',
      TC: 'TURKS AND CAICOS ISLANDS',
      TV: 'TUVALU',
      UG: 'UGANDA',
      UA: 'UKRAINE',
      AE: 'UNITED ARAB EMIRATES',
      GB: 'UNITED KINGDOM',
      US: 'UNITED STATES',
      UM: 'UNITED STATES MINOR OUTLYING ISLANDS',
      UY: 'URUGUAY',
      UZ: 'UZBEKISTAN',
      VU: 'VANUATU',
      VE: 'VENEZUELA',
      VN: 'VIET NAM',
      VG: 'VIRGIN ISLANDS, BRITISH',
      VI: 'VIRGIN ISLANDS, U.S.',
      WF: 'WALLIS AND FUTUNA',
      EH: 'WESTERN SAHARA',
      YE: 'YEMEN',
      ZM: 'ZAMBIA',
      ZW: 'ZIMBABWE'
    }
  }
}

if (typeof module !== 'undefined') module.exports = Averigua
else window.Averigua = Averigua
