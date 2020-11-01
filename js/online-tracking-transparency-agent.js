/* global Averigua */
class OTTA {
  constructor (opts) {
    opts = opts || {}

    const canvas = this.createCanvases()
    this.canvasEle = canvas.bg
    this.canvasString = canvas.fp.toDataURL()

    this.logs = []
    this.data = [
      this.toStr(Averigua.language()),
      `timezone: ${Averigua.timeZone()}`,
      `do-not-track-enabled: ${Averigua.doNotTrack()}`,
      this.toStr(Averigua.platformInfo()),
      this.toStr(Averigua.screen()),
      `gpu: ${this.toStr(Averigua.gpuInfo())}`,
      this.toStr(Averigua.storageSupport()),
      `installed-fonts: ${Averigua.fontSupport().join(', ')}`,
      `canvas-fingerprint: ${this.canv}`
    ]

    this.str = this.updateStr(0)
    this.setupConvo(opts.conversation)

    this.svgBox = this.createSVG(opts.background)
    this.setupSVGLines()
    this.positionSVG()

    if (window.crypto || window.msCrypto) {
      this.hashIt(this.canvasString, (hash) => {
        this.canv = hash
        const i = this.data.length - 1
        this.data[i] = `canvas-fingerprint: ${this.canv}`
        this.hashIt(this.updateStr(this.data.length), (id) => {
          id = id.toUpperCase()
          this.id = id
          this.idb = `${id.substring(0, 3)}...${id.substring(id.length - 3)}`
          this.convo = this.convoData()
          if (window.location.hash === '#see') this.demo()
          else if (Averigua.isMobile()) this.mobile()
          else this.goTo('greet-visitor')
        })
      })
    } else {
      // TODO fallback if crypto is missing?
    }

    if (opts.mobileDebug) {
      window.onerror = function (msg, url, linenumber) {
        window.alert(`Error message: ${msg}
URL: ${url}
Line Number: ${linenumber}`)
        return true
      }
    }

    window.addEventListener('resize', (e) => {
      if (opts.conversation) {
        this.positionConvo()
        this.positionSVG()
      }
      this.canvasEle.width = window.innerWidth
      this.canvasEle.height = window.innerHeight
      this.drawCanvasBG(this.canvasEle)
    })
  }

  // ---- setup ----------------------------------------------------------------

  setupSVGLines () {
    this.lines = []
    this.curvePoints.forEach((curve, i) => {
      const idx = i * 40
      const str = this.allOffset(idx)
      const l = this.curveText(curve, i, str)
      this.lines.push({ element: l, index: idx })
    })
    this.animateSVG()
  }

  toStr (obj) {
    return JSON.stringify(obj)
      .replace(/"/g, '')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/:/g, ': ')
      .replace(/,/g, ', ')
  }

  updateStr (length) {
    const len = 1000
    const str = this.data.slice(0, length).join('....')
    const pad = (n) => {
      let s = ''
      for (let i = 0; i < n; i++) s += '.'
      return s
    }
    return str + pad(len - str.length)
  }

  // ---- animate --------------------------------------------------------------

  allOffset (n) {
    let str = this.str.substr(n, 100)
    if (str.length < 100) {
      str += '....' + this.str.substr(0, 100 - str.length)
    }
    return str
  }

  animateSVG () {
    setTimeout(() => {
      this.animateSVG()
    }, 100)

    this.lines.forEach(l => {
      l.index++
      if (l.index > this.str.length) l.index = 0
      l.element.textContent = this.allOffset(l.index)
    })
  }

  // --------------------------------------------------------------------------
  // CRAETE SVG ELEMENT

  get curvePoints () {
    return [
      'M 67, 398 C 44, 350, 62, 221, 95, 202',
      'M 107, 172 C 179, 54, 359, 30, 455, 86',
      'M 485, 104 C 552, 145, 613, 256, 604, 339',
      'M 99, 398 C 57, 222, 191, 66, 367, 94',
      'M 400, 102 C 511, 136, 601, 247, 573, 461',
      'M 93, 472 C 132, 414, 141, 414, 125, 333',
      'M 128, 299 C 148, 100, 479, 19, 538, 322',
      'M 541, 354 C 545, 429, 538, 468, 523, 526',
      'M 117, 498 C 233, 373, 82, 329, 226, 195',
      'M 260, 175 C 305, 149, 394, 152, 442, 200 ',
      'M 468, 227 C 514, 286, 524, 428, 476, 563',
      'M 135, 528 C 162, 501, 179, 476, 191, 448',
      'M 201, 411 C 133, 115, 548, 108, 466, 465',
      'M 460, 503 C 456, 519, 442, 568, 428, 588',
      'M 161, 547 C 318, 419, 125, 268, 342, 227',
      'M 377, 239 C 435, 256, 482, 411, 381, 601',
      'M 191, 567 C 247, 518, 281, 414, 266, 357',
      'M 262, 321 C 296, 222, 417, 249, 404, 393',
      'M 404, 431 C 403, 480, 368, 569, 338, 606',
      'M 223, 586 C 244, 561, 279, 511, 286, 484',
      'M 297, 451 C 315, 363, 286, 343, 304, 306',
      'M 326, 296 C 386, 285, 399, 461, 297, 604',
      'M 257, 597 C 345, 490, 341, 410, 331, 326'
    ]
  }

  createSVG (parentSlector) {
    this.svgNS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(this.svgNS, 'svg')
    svg.setAttributeNS(null, 'viewBox', '0 0 660 656')
    svg.setAttributeNS(null, 'id', 'fingerPrint')
    // svg.setAttributeNS(null, 'fill', '#00002E')
    svg.setAttributeNS(null, 'fill', '#fff')
    svg.style.fontFamily = 'monospace'
    svg.style.fontSize = '12px'
    svg.style.fontWeight = 'bold'
    svg.style.width = '50vw'
    svg.style.display = 'block'
    svg.style.opacity = '0'
    svg.style.transition = 'opacity 2s cubic-bezier(0.165, 0.84, 0.44, 1)'

    this.parent = (parentSlector && typeof parentSlector === 'string')
      ? document.querySelector(parentSlector) : document.body

    this.parent.appendChild(svg)
    return svg
  }

  positionSVG () {
    const W = window.innerWidth
    const H = window.innerHeight
    const w = window.innerWidth / 2
    const h = (w / 660) * 656
    this.svgBox.style.left = W / 2 - w / 2 + 'px'
    this.svgBox.style.top = H / 2 - h / 2 + 'px'
  }

  curveText (points, i, string) {
    const xlinkNS = 'http://www.w3.org/1999/xlink'
    const path = document.createElementNS(this.svgNS, 'path')
    path.setAttributeNS(null, 'id', `curve${i}`)
    path.setAttributeNS(null, 'd', points)
    path.style.fill = 'transparent'
    this.svgBox.appendChild(path)
    const txt = document.createElementNS(this.svgNS, 'text')
    txt.setAttributeNS(null, 'x', 25)
    const txtPath = document.createElementNS(this.svgNS, 'textPath')
    txtPath.setAttributeNS(xlinkNS, 'xlink:href', `#curve${i}`)
    txtPath.textContent = string
    txt.appendChild(txtPath)
    this.svgBox.appendChild(txt)
    return txtPath
  }

  // -------------------------------------------------------------------------
  // CREATE CANVAS ELEMENT

  drawCanvasBG (canvas) {
    const w = canvas.width
    const h = canvas.height
    const ctx = canvas.getContext('2d')
    const newGrd = (clrz, x, y, r1, r2) => {
      const g = ctx.createRadialGradient(x, y, r1, x, y, r2)
      clrz.forEach((c, i) => g.addColorStop(i / clrz.length, c))
      return g
    }

    ctx.clearRect(0, 0, w, h)

    let x = w * 0.5
    let y = h * 0.5
    const r1 = (w > h) ? h / 8 : w / 8
    const r2 = (w > h) ? h : w
    ctx.globalAlpha = 0.25
    ctx.fillStyle = newGrd(['#aaa', 'violet', 'blue'], x, y, r1, r2)
    ctx.fillRect(0, 0, w, h)

    x = w * 0.25
    y = h * 0.25
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = newGrd(['red', '#aaa'], x, y, r1, r2)
    ctx.fillRect(w * 0.25, h * 0.1, w * 0.25, h * 0.40)

    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w * 0.1, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.globalAlpha = 1
    ctx.fillStyle = newGrd(['violet', 'blue', '#aaa'], x, y, r1, r2)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(w * 0.625, h * 0.3)
    ctx.lineTo(w * 0.375, h * 0.3)
    ctx.lineTo(w * 0.625, h * 0.9)
    ctx.closePath()
    ctx.globalAlpha = 0.5
    ctx.fillStyle = newGrd(['blue', 'violet'], x, y, r1, r2)
    ctx.fill()
  }

  createCanvases () {
    const bg = document.createElement('canvas')
    bg.width = window.innerWidth
    bg.height = window.innerHeight
    bg.style.position = 'fixed'
    bg.style.left = '0'
    bg.style.top = '0'
    bg.style.zIndex = '-1'
    bg.style.transition = 'filter 5s cubic-bezier(0.165, 0.84, 0.44, 1),' +
      'opacity 2s cubic-bezier(0.165, 0.84, 0.44, 1)'
    if (window.location.hash === '#see') bg.style.filter = 'blur(0px)'
    else bg.style.filter = 'blur(100px)'
    document.body.appendChild(bg)
    this.drawCanvasBG(bg)
    const fp = document.createElement('canvas')
    this.drawCanvasBG(fp)
    return { bg, fp }
  }

  // --------------------------------------------------------------------------
  // HASHING FUNCTIONS

  str2ArrayBuffer (str) {
    const bytes = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i)
    }
    return bytes
  }

  arrayBuffer2Hex (buf) {
    const dataView = new DataView(buf)
    let i, len, c
    let hex = ''
    for (i = 0, len = dataView.byteLength; i < len; i++) {
      c = dataView.getUint8(i).toString(16)
      if (c.length < 2) c = '0' + c
      hex += c
    }
    return hex
  }

  hashIt (data, callback) {
    const crypto = window.crypto || window.msCrypto
    const opts = { name: 'SHA-256' }
    let promise
    if (crypto.webkitSubtle) {
      promise = crypto.webkitSubtle.digest(opts, this.str2ArrayBuffer(data))
    } else if (crypto.subtle) {
      promise = crypto.subtle.digest(opts, this.str2ArrayBuffer(data))
    } else {
      return callback(data)
    }

    promise.then((res) => {
      const hashVal = this.arrayBuffer2Hex(res)
      callback(hashVal)
    })
  }

  // --------------------------------------------------------------------------
  // SESSION + KEY LOGGING

  setupReplay () {
    this.cursor = document.createElement('img')
    this.cursor.src = '../images/cursor.png'
    this.cursor.style.position = 'fixed'
    this.cursor.style.zIndex = '500'

    this.convoEle.querySelector('.text').innerHTML = ''
    this.convoEle.querySelector('.options').innerHTML = ''
    this.canvasEle.style.opacity = 0
    this.svgBox.style.opacity = 0
    setTimeout(() => {
      document.body.appendChild(this.cursor)
      this.runReplays(0)
      this.convoEle.style.opacity = 1
      document.body.style.cursor = 'none'
      const input = document.createElement('input')
      input.style.cursor = 'none'
      // TODO...
      input.setAttribute('placeholder', 'your name')
      input.setAttribute('disabled', 'true')
      this.convoEle.querySelector('.options').appendChild(input)
      this.positionConvo('center')
    }, 2000)
  }

  runReplays (idx) {
    const l = this.logs.length
    const replayTime = this.logs[l - 1].time - this.logs[0].time
    if (idx < l) { // update frame
      const obj = this.logs[idx]
      const input = document.querySelector('input')
      if (obj.text) {
        if (input) input.value = obj.text
      } else if (obj.click) {
        if (obj.click < this.opts.length) {
          input.setAttribute('placeholder', this.opts[obj.click].text)
          input.value = ''
          this.positionConvo(this.opts[obj.click].pos)
        } else this.positionConvo('center')
      } else {
        this.cursor.style.left = obj.x + 'px'
        this.cursor.style.top = obj.y + 'px'
      }
      if (idx + 1 < l) {
        const delay = this.logs[idx + 1].time - obj.time
        setTimeout(() => this.runReplays(idx + 1), delay)
      } else { // go bax to normal
        setTimeout(() => {
          document.body.style.cursor = "url('../images/cursor.png'), auto"
          document.body.removeChild(this.cursor)
          this.canvasEle.style.opacity = 0
          setTimeout(() => {
            this.convoEle.querySelector('.options').innerHTML = ''
            this.createOption('I see...', () => this.goTo('do-nothing'))
            this.canvasEle.style.opacity = 1
          }, 500)
        }, 1000)
      }
      if (idx + 1 === l) console.log(replayTime)
    }
  }

  setupLogger () {
    this.logging = true
    this.opts = [
      { text: 'your name', pos: 'center' },
      { text: 'and your mom\'s maiden name?', pos: { x: 50, y: 50 } },
      {
        text: 'and your first pet\'s name?',
        pos: {
          x: window.innerWidth - (window.innerWidth / 2),
          y: window.innerHeight - (window.innerHeight / 2)
        }
      },
      {
        text: 'and the street you grew up on?',
        pos: { x: 50, y: window.innerHeight - (window.innerHeight / 2) }
      }
    ]
    this.convoEle.querySelector('.text').innerHTML = ''
    this.convoEle.querySelector('.options').innerHTML = ''
    window.addEventListener('mousemove', (e) => this.logMouseMove(e))
    setTimeout(() => {
      this.convoEle.querySelector('.text')
        .innerHTML = 'Speaking of names, what do you prefer to be called?'
      this.nextLoggerOption(0)
      setTimeout(() => { this.convoEle.style.opacity = 1 }, 550)
    }, 100)
  }

  nextLoggerOption (idx) {
    const opt = this.opts[idx]
    this.convoEle.querySelector('.options').innerHTML = ''
    const input = document.createElement('input')
    input.setAttribute('placeholder', opt.text)
    input.addEventListener('input', (e) => this.logKeyStrokes(e))
    const button = document.createElement('button')
    button.textContent = 'submit'
    button.addEventListener('click', () => {
      this.logs.push({ time: Date.now(), click: idx + 1 })
      if (idx === 0) { // first one
        this.username = input.value === '' ? this.idb : input.value
        this.convoEle.querySelector('.text').innerHTML = ''
        this.nextLoggerOption(1)
      } else if (idx === this.opts.length - 1) { // last one
        setTimeout(() => { this.logging = false }, 1000)
        this.convo = this.convoData()
        if (this.username === this.idb) this.goTo('no-name', 'center')
        else this.goTo('submit-name', 'center')
      } else { // the rest of 'em
        this.convoEle.querySelector('.text').innerHTML = ''
        this.nextLoggerOption(idx + 1)
      }
    })
    this.convoEle.querySelector('.options').appendChild(input)
    this.convoEle.querySelector('.options').appendChild(button)
    this.positionConvo(opt.pos)
  }

  logKeyStrokes (e) {
    if (!this.logging) return
    this.logs.push({ time: Date.now(), text: e.target.value })
  }

  logMouseMove (e) {
    if (!this.logging) return
    this.logs.push({ time: Date.now(), x: e.clientX, y: e.clientY })
  }

  // --------------------------------------------------------------------------
  // CONVO LOGIC

  setupConvo (ele) {
    this.convoLayout = 'center'
    this.convoEle = (ele && typeof ele === 'string')
      ? document.querySelector(ele) : document.createElement('div')
    if (!ele) {
      this.convoEle.innerHTML = `
      <div class="text"></div>
      <div class="options"></div>
      `
    }
    this.convoEle.style.opacity = 1
    this.positionConvo('center')
  }

  positionConvo (layout) {
    if (layout) this.convoLayout = layout
    if (this.convoLayout === 'center') {
      const h = this.convoEle.offsetHeight
      const w = this.convoEle.offsetWidth
      const height = window.innerHeight
      const width = window.innerWidth
      this.convoEle.style.maxWidth = '40vw'
      this.convoEle.style.left = `${width / 2 - w / 2}px`
      this.convoEle.style.top = `${height / 2 - h / 2}px`
    } else if (typeof this.convoLayout === 'object') {
      this.convoEle.style.maxWidth = '40vw'
      this.convoEle.style.left = `${this.convoLayout.x}px`
      this.convoEle.style.top = `${this.convoLayout.y}px`
    } else {
      this.convoEle.style.maxWidth = '30vw'
      this.convoEle.style.left = '10px'
      this.convoEle.style.top = '10px'
    }
  }

  createOption (txt, func) {
    const div = document.createElement('div')
    div.innerHTML = txt
    div.onclick = func
    this.convoEle.querySelector('.options').appendChild(div)
  }

  goTo (id, layout) {
    this.convoEle.style.opacity = 0

    if (id === 'pref-name') {
      setTimeout(() => { this.setupLogger() }, 550)
      return
    } else if (id === 'pref-name-replay') {
      setTimeout(() => { this.setupReplay() }, 550)
      return
    }

    setTimeout(() => {
      this.convoEle.querySelector('.text').innerHTML = ''
      this.convoEle.querySelector('.options').innerHTML = ''
      setTimeout(() => {
        if (layout) this.convoLayout = layout
        const obj = this.convo[id]
        this.convoEle.querySelector('.text').innerHTML = obj.content
        for (const key in obj.options) {
          const func = obj.options[key]
          this.createOption(key, func)
        }
        this.positionConvo()
        setTimeout(() => { this.convoEle.style.opacity = 1 }, 550)
      }, 100)
    }, 550)
  }

  convoData () {
    return {
      'greet-visitor': {
        content: `Hello ${this.idb}, <br>Would you like to know how I knew your name?`,
        options: {
          yes: () => { this.goTo('your-corp-name') },
          'that\'s not my name': () => { this.goTo('not-gov-name') }
        }
      },
      'not-gov-name': {
        content: `${this.idb} isn't your government name, of course. You can always change that.`,
        options: {
          'so what\'s is it?': () => { this.goTo('your-corp-name') }
        }
      },
      'your-corp-name': {
        content: 'This is your corporate name. It\'s been secretly assigned to you by surveillance capitalists.',
        options: {
          'corporate name?': () => { this.goTo('your-id') }
        }
      },
      'your-id': {
        content: 'Well, it\'s less of a name and more of an id. Colloquially it\'s referred to as your browser/device "fingerprint". I\'ve abbreviated it, it\'s typically a bit longer. It\'s how they watch you online.',
        options: {
          'I see...': () => { this.goTo('pref-name') },
          'what\'s it like unabbreviated?': () => { this.goTo('your-full-id') }
        }
      },
      'your-full-id': {
        content: `Your full unique fingerprint is ${this.id}`,
        options: {
          'that\'s much longer than my government name': () => { this.goTo('pref-name') }
        }
      },
      'submit-name': {
        content: `Nice to officially meet you ${this.username}`,
        options: {
          'you too': () => { this.goTo('post-name') }
        }
      },
      'no-name': {
        content: `Ok then, we'll stick to ${this.idb}`,
        options: {
          cool: () => { this.goTo('post-name') }
        }
      },
      'post-name': {
        content: 'There was a time, not long ago, when most of the Internet\'s citizens were unaware of online tracking and assumed all their favorite services were simply free. Today most netizens understand that if you are not paying for an online service, you are not the customer, you are the product.',
        options: {
          'so i\'ve heard': () => { this.goTo('all-becomes-data') }
        }
      },
      'all-becomes-data': {
        content: 'Everything we do on the Internet generates data, this data is your experience of the online world made manifest. This experience has become free raw material for hidden commercial practices of extraction, prediction and sales. A new economic order, which has come to dominate the information age, known as <a href="https://en.wikipedia.org/wiki/Surveillance_capitalism" target="_blank">Surveillance Capitalism</a>.',
        options: {
          'I see...': () => { this.goTo('tracking-you') }
        }
      },
      'tracking-you': {
        content: `This new economic order depends on being able to identify you ${this.username}. Regardless of whether or not you chose to sign-up, log-in, or otherwise identify yourself. This sort of <a href="https://www.cs.princeton.edu/~arvindn/publications/OpenWPM_1_million_site_tracking_measurement.pdf" target="_blank">tracking</a> watches you across websites and services.`,
        options: {
          'how so?': () => { this.goTo('third-party-cookies') },
          'I know, cookies right?': () => { this.goTo('cookies-right') }
        }
      },
      'third-party-cookies': {
        content: 'Initially this was done by storing small text files called <a href="https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#third-party-cookies" target="_blank">cookies</a> in your browser. Like tagging or branding cattle, this would be used to identify you within the digital factory of "online advertising". But as netizens grew wise to these techniques they installed "tracker blocker" add-ons to their browsers to circumvent this.',
        options: {
          'should I install one?': () => { this.goTo('no-blocked') }
        }
      },
      'cookies-right': {
        content: 'Yes, that\'s part of it. Perhaps you\'ve already taken measures to circumvent them? Maybe you\'ve installed a <a href="https://privacybadger.org/" target="_blank">"tracker blocker"</a> on your browser?',
        options: {
          'I have.': () => { this.goTo('yes-blocked') },
          'I have not': () => { this.goTo('no-blocked') }
        }
      },
      'yes-blocked': {
        content: `Well done ${this.username}, though I'm happy to inform you these will soon no longer be necessary.`,
        options: {
          'really?': () => { this.goTo('cookies-today') }
        }
      },
      'no-blocked': {
        content: `You probably should ${this.username}, but soon these will no longer be necessary.`,
        options: {
          'no?': () => { this.goTo('cookies-today') }
        }
      },
      'cookies-today': {
        content: 'Today, privacy conscious browsers like Brave and Firefox, and even some default browsers like Edge and Safari, automatically block these sorts of cookies. Though now, perhaps unsurprisingly, the trackers have adapted craftier ways of identifying you.',
        options: {
          'how?': () => { this.goTo('cookies-to-fingerprints') }
        }
      },
      'cookies-to-fingerprints': {
        content: `When cookies became ineffective, browser fingerprinting took it's place. Hence your fingerprint, ${this.idb}`,
        options: {
          'I see...': () => { this.goTo('regardless-of-blockers') }
        }
      },
      'regardless-of-blockers': {
        content: 'Regardless of whether or not you use cookie blockers, privacy/incognito windows or even proxy servers like VPNs or TOR, they can still identify you by this fingerprint as I just did.',
        options: {
          'how?': () => {
            this.convoEle.style.opacity = 0
            setTimeout(() => {
              this.canvasEle.style.filter = 'blur(0px)'
              this.convoEle.querySelector('.text').innerHTML = ''
              this.convoEle.querySelector('.options').innerHTML = ''
              setTimeout(() => {
                this.goTo('it-begins-with-abstraction', 'top-left')
              }, 4000)
            }, 500)
          }
        }
      },
      'it-begins-with-abstraction': {
        content: 'It begins with an abstract composition, a set of geometric shapes layered over each other and composited in a particular way. This is not done for aesthetic purposes, though these compositions have been <a href="https://www.instagram.com/p/CFzdrdjHOsK/" target="_blank">found all across the Web</a>, they are never visually displayed. Instead they discreetly identify tiny variations in the way your particular device renders images.',
        options: {
          'go on...': () => { this.goTo('canvas-fingerprinting') }
        }
      },
      'canvas-fingerprinting': {
        content: 'This is called <a href="https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#canvas-fingerprinting" target="_blank">Canvas Fingerprinting</a> because it makes use of the HTML5 canvas element. A technology initially created to enrich your online experience is now being exploited to generate invisible images that betray you.',
        options: {
          'how is this possible?': () => { this.goTo('data-available') }
        }
      },
      'data-available': {
        content: 'Your device makes various forms of data available for algorithmic use by applications. For example, a mobile app can determine how much battery life you have left and adjust it\'s details accordingly, perhaps to conserve power or to auto-save your progress before your device shuts down.',
        options: {
          'seems helpful': () => { this.goTo('seems-helpful') }
        }
      },
      'seems-helpful': {
        content: 'It is, but this seemingly innocuous byte of data can actually be abused. Today data is used to make predictions about your behavior. Predictions which are then used to manipulate your behavior in devious ways.',
        options: {
          'how?': () => { this.goTo('uber-predictions') }
        }
      },
      'uber-predictions': {
        content: 'For example, Uber has <a href="https://www.forbes.com/sites/nicolemartin1/2019/03/30/uber-charges-more-if-they-think-youre-willing-to-pay-more/#4cd281f47365" target="_blank">discovered</a> that your battery level is one of the <i>"strongest predictors of whether or not you are going to be sensitive to surge [prices]"</i>, and thus can be used to maximize how much value they extract from you.',
        options: {
          'not cool': () => { this.goTo('your-browser-print') }
        }
      },
      'your-browser-print': {
        content: `Web browsers, like the ${typeof Averigua.browserInfo().name === 'string' ? Averigua.browserInfo().name : ''} browser you are using now, share a lot about you as well. This data is meant to be used ethically, for utilitarian purposes, but there are very few rules demanding that this be the case. And so, online trackers aggregate various bits of data to form a unique fingerprint used to secretly identify you.`,
        options: {
          'how?': () => {
            this.svgBox.style.opacity = 1
            this.goTo('the-specifics-vary')
          }
        }
      },
      'the-specifics-vary': {
        content: 'The specifics vary from tracker to tracker, but it often begins with an abstract composition like the one I\'ve rendered in the background. This gets compressed into a short string of text which becomes a unique data point',
        options: {
          'the first? there\'s more?': () => {
            this.canvasEle.style.filter = 'blur(100px)'
            this.str = this.updateStr(2)
            this.goTo('plenty-more')
          },
          'short string of text?': () => { this.goTo('canvas-hash') }
        }
      },
      'canvas-hash': {
        content: `Yes, your canvas fingerprint is ${this.canv}`,
        options: {
          'you said this was only the first data point?': () => {
            this.canvasEle.style.filter = 'blur(100px)'
            this.str = this.updateStr(2)
            this.goTo('plenty-more')
          }
        }
      },
      'plenty-more': {
        content: `Yes, there's plenty more. A tracker might then add the configurations you've set on your device, like the fact that you have your language set to the ${Averigua.language().country} version of ${Averigua.language().language} with a time zone set to ${Averigua.timeZone()}.`,
        options: {
          'that\'s true': () => {
            this.str = this.updateStr(3)
            if (Averigua.doNotTrack()) this.goTo('doNotTrack-enabled')
            else this.goTo('doNotTrack-disabled')
          }
        }
      },
      'doNotTrack-enabled': {
        content: 'I\'ve noticed that you have "do-not-track" enabled on your browser, good for you.',
        options: {
          yes: () => { this.goTo('ironic-tracking-bit') }
        }
      },
      'doNotTrack-disabled': {
        content: 'I\'ve noticed that you do not have "do-not-track" enabled on your browser, you probably should.',
        options: {
          oh: () => { this.goTo('ironic-tracking-bit') }
        }
      },
      'ironic-tracking-bit': {
        content: 'Although, regardless of whether or not you have "do-not-track" enabled, this bit of data is itself a piece of information trackers have been known to include in your fingerprint. Ironic isn\'t it? You\'re explicit declaration of the desire for privacy is itself used to track you.',
        options: {
          'ironic indeed': () => {
            this.str = this.updateStr(7)
            this.goTo('even-more')
          }
        }
      },
      'even-more': {
        content: `Loads more data can be pulled from your system, like the fact that you're ${Averigua.platformInfo().mobile ? '' : 'not'} on a mobile device and the fact that you have ${Averigua.platformInfo().processors ? Averigua.platformInfo().processors + ' CPU cores running on the' : 'a'} ${Averigua.platformInfo().platform} platform ${typeof Averigua.gpuInfo().vendor === 'string' ? 'with a GPU made by ' + Averigua.gpuInfo().vendor : ''}.`,
        options: {
          'I see...': () => { this.goTo('already-enough') }
        }
      },
      'already-enough': {
        content: 'This is likely already enough to <a href="https://panopticlick.eff.org/" target="_blank">uniquely identify you</a> among billions of Internet users, but there\'s more.',
        options: {
          'like what?': () => { this.goTo('clever-programmers') }
        }
      },
      'clever-programmers': {
        content: 'A few creative programmers realized that because users often install custom fonts on their computer, the particular list of fonts you have installed also becomes an identifiable detail.',
        options: {
          'how do they know what fonts I have?': () => { this.goTo('what-fonts') }
        }
      },
      'what-fonts': {
        content: 'They developed clever tricks for algorithmically generating gibberish text off-screen (to hide it from the viewer) in various types of fonts. They then measure the specific dimensions of the text rendered at a given font-size for each to see if it matches any of the fonts on their list, in effect revealing which you have isntalled',
        options: {
          'sounds complicated': () => { this.goTo('sounds-complicated') },
          'smart, I get it.': () => { this.goTo('sounds-smart') }
        }
      },
      'sounds-smart': {
        content: 'It\'s a pretty straight forward trick, but you\'re right... it\'s insidiously smart. Want to see me "font fingerprint" you?',
        options: {
          'do I have a choice?': () => {
            this.str = this.updateStr(8)
            this.goTo('my-fonts')
          }
        }
      },
      'sounds-complicated': {
        content: 'In some ways it is, but like any magic trick once you learn it and practice, it\'s fairly simple to execute. Want to see me "font fingerprint" you?',
        options: {
          'do I have a choice?': () => {
            this.str = this.updateStr(8)
            this.goTo('my-fonts')
          }
        }
      },
      'my-fonts': {
        content: `No, unlike cookies, trackers never ask you for permission to do this. As it turns out, you have ${Averigua.fontSupport().length} fonts installed that match my internal list of 485 fonts. I've now added these fonts to your fingerprint as well.`,
        options: {
          'I see': () => { this.goTo('print-complete') }
        }
      },
      'print-complete': {
        content: `Once we add the canvas fingerprint string from before and compress it all into a single "hashed" value, we arrive at your unique fingerprint ${this.username}...`,
        options: {
          'show me...': () => {
            this.str = this.updateStr(9)
            this.goTo('final-fingerprint')
          }
        }
      },
      'final-fingerprint': {
        content: this.id,
        options: {
          '...': () => { this.goTo('diff-task') }
        }
      },
      'diff-task': {
        content: 'This sort of fingerprinting takes a lot of effort and creativity. Using data in unconventional ways isn\'t inherently unethical. Just imagine what these clever programmers could have created instead had their skills been assigned to a different task?',
        options: {
          'I can <i>only</i> imagine...': () => { this.goTo('today-we-block') }
        }
      },
      'today-we-block': {
        content: 'Thankfully today privacy conscious browsers like Brave and Firefox are attempting to block fingerprinting. But so long as surveillance capitalism remains legal and profitable, the trackers will continue to be incentivized to create even more connivingly crafty ways of watching and exploiting you online.',
        options: {
          'it\'s a cat and mouse game': () => { this.goTo('cat-and-mouse') }
        }
      },
      'cat-and-mouse': {
        content: 'It is, and speaking of your mouse, techniques like <a href="https://themarkup.org/blacklight/2020/09/22/how-we-built-a-real-time-privacy-inspector#session-recording" target="_blank">session recording</a> and <a href="key-logging" target="_blank">key logging</a> have now also become part of the online tracking toolkit.',
        options: {
          'what is that?': () => { this.goTo('what-is-logging') },
          'isn\'t that what hackers do?': () => { this.goTo('hackers-do') },
          'isn\'t that used for UX testing?': () => { this.goTo('user-testing') }
        }
      },
      'hackers-do': {
        content: 'Yes, and now it\'s at part of the online tracking répertoire. One tracker was even caught <a href="https://freedom-to-tinker.com/2018/02/26/no-boundaries-for-credentials-password-leaks-to-mixpanel-and-session-replay-companies/" target="_blank">storing passwords that users typed into websites</a>.',
        options: {
          'how do they get away with this?': () => { this.goTo('what-is-logging') }
        }
      },
      'user-testing': {
        content: 'It is, but this is different.',
        options: {
          'how?': () => { this.goTo('how-is-it-diff') }
        }
      },
      'how-is-it-diff': {
        content: 'If a netizen is participating in transparent (ideally paid) "user testing" they have agency. People behave differently when they know they\'re being watched. When these tactics are deployed on netizens without their consent bad things happen.',
        options: {
          'I see': () => { this.goTo('what-is-logging') },
          'like what?': () => { this.goTo('like-what') }
        }
      },
      'like-what': {
        content: 'Well if you think no ones watching you feel safe typing in your password. Some online trackers have been caught <a href="https://freedom-to-tinker.com/2018/02/26/no-boundaries-for-credentials-password-leaks-to-mixpanel-and-session-replay-companies/" target="_blank">storing passwords that users typed into websites</a> without their realization.',
        options: {
          'point made': () => { this.goTo('what-is-logging') },
          'that\'s their own fault': () => { this.goTo('what-is-logging') }
        }
      },
      'what-is-logging': {
        content: 'Do you remember earlier when I asked about what your preferred name was?',
        options: {
          'yea...': () => {
            if (this.username === this.idb) this.goTo('do-u-remember-a')
            else this.goTo('do-u-remember-b')
          }
        }
      },
      'do-u-remember-a': {
        content: 'Well, even though you chose not to share your name I was still watching to see what you would type and how you were moving your mouse...',
        options: {
          'what?': () => { this.goTo('pref-name-replay') }
        }
      },
      'do-u-remember-b': {
        content: `Well ${this.username}, I was secretly recording all your keystrokes and mouse movements...`,
        options: {
          'what?': () => { this.goTo('pref-name-replay') }
        }
      },
      'do-nothing': {
        content: 'Just like your battery status, using machine learning algorithms, these mouse and keystroke data can also be used to make predictions about you.',
        options: {
          'like what?': () => { this.goTo('like-onset-condition') }
        }
      },
      'like-onset-condition': {
        content: 'Like whether or not you have an onset neurological disease. Search engines have been <a href="https://www.wsj.com/articles/clues-to-parkinsons-disease-from-how-you-use-your-computer-1527600547" target="_blank">able to detect</a> subtle signs of medical conditions potentially before your doctor does. And if <a href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0188226" target="_blank">someone else knows</a> you have Parkinson\'s disease before you do... what do you think they\'ll do with that information?',
        options: {
          'tell me, so I can get it checked out?': () => { this.goTo('tell-me') },
          'sell it to the highest bidder?': () => { this.goTo('sell-it') }
        }
      },
      'tell-me': {
        content: 'That would be the ethical thing to do, but surveillance capitalism has never really been motivated by ethics.',
        options: {
          'right...': () => { this.goTo('you-are-the-product') }
        }
      },
      'sell-it': {
        content: 'Unfortunately, that\'s a reasonable assumption. As you know, if the product is free, you\'re not the customer. But I can image certain customers who might find this sort of information very valuable, perhaps an insurance company or a large employer.',
        options: {
          'right...': () => { this.goTo('closing-statement') }
        }
      },
      'you-are-the-product': {
        content: 'Remember, if the product is free, you\'re not the customer. But I can image certain customers, perhaps an insurance company or a large employer, might find this sort of information very valuable.',
        options: {
          'right...': () => { this.goTo('closing-statement') }
        }
      },
      'closing-statement': {
        content: 'These sort of data fueled predictions can be used to help you, but it can just as easily be used to hurt you. While our online experiences remain the free raw material for hidden commercial practices of extraction, prediction and sales, the latter is certainly more likely.',
        options: {
          'so what can I do about it?': () => { this.fin() }
        }
      },
      'what-to-do': {
        content: 'Do you work at a tech company?',
        options: {
          yes: () => { this.fin(true) },
          no: () => { this.fin(false) }
        }
      }
    }
  }

  mobile () {
    window.alert("Sorry, this doesn't work on mobile :(")
  }

  _demoEle (content, spot) {
    const ele = document.createElement('div')
    ele.innerHTML = content
    ele.style.position = 'fixed'
    ele.style.zIndex = '1000'
    ele.style.left = '0'
    if (spot === 'top') {
      ele.style.top = '40px'
      ele.style.fontSize = '64px'
    } else {
      ele.style.bottom = '40px'
      ele.style.fontSize = '24px'
    }
    ele.style.textAlign = 'center'
    ele.style.opacity = 0
    ele.style.color = '#fff'
    ele.style.width = '100vw'
    ele.style.transition = 'opacity 2s cubic-bezier(0.165, 0.84, 0.44, 1)'
    document.body.appendChild(ele)
    return ele
  }

  demo () {
    const title = this._demoEle('<a href="/you">howthey.watch/you</a>', 'top')
    const print = this._demoEle(this.id, 'bottom')

    setTimeout(() => {
      this.canvasEle.style.filter = 'blur(100px)'
      this.data = this.data.join(',').split(',')
      const delay = 100
      setTimeout(() => {
        this.svgBox.style.opacity = '1'
        for (let i = 0; i < this.data.length; i++) {
          setTimeout(() => { this.str = this.updateStr(i) }, (i * delay))
        }
      }, 2000)
      setTimeout(() => {
        title.style.opacity = 1
        print.style.opacity = 1
      }, this.data.length * delay + 2000)
    }, 2000)

    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 82) { // r
        title.style.opacity = 0
        print.style.opacity = 0
        this.svgBox.style.opacity = 0
        setTimeout(() => {
          this.canvasEle.style.filter = 'blur(0px)'
        }, 2000)
      }
    })
  }

  fin (techEmployee) {
    const http = window.location.protocol
    window.location = `${http}//${window.location.host}/us`
  }
}

window.OTTA = OTTA
