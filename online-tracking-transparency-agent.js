/* global Averigua */
class OTTA {
  constructor (parentSlector, params) {
    this.svgBox = this.createSVG(parentSlector, params)
    this.canvasString = this.createCanvases().fp.toDataURL()

    this.data = [
      `canvas-fingerprint: ${this.canv}`,
      this.toStr(Averigua.language()),
      `timezone: ${Averigua.timeZone()}`,
      `do-not-track-enabled: ${Averigua.doNotTrack()}`,
      this.toStr(Averigua.platformInfo()),
      this.toStr(Averigua.screen()),
      `gpu: ${this.toStr(Averigua.gpuInfo())}`,
      this.toStr(Averigua.storageSupport()),
      `installed-fonts: ${Averigua.fontSupport().join(', ')}`
    ]

    if (window.crypto || window.msCrypto) {
      this.hashIt(this.canvasString, (hash) => {
        console.log(hash);
        this.canv = hash
        this.data[0] = `canvas-fingerprint: ${this.canv}`
        this.str = this.updateStr(1)
        this.hashIt(this.updateStr(this.data.length), (id) => { this.id = id })
      })
    } else {
      // TODO fallback if crypto is missing?
      window.alert('poop')
    }


    this.str = this.updateStr(1)
    this.lines = []
    this.init()
  }

  toStr (obj) {
    return JSON.stringify(obj)
      .replace(/"/g, '')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/:/g, ': ')
      .replace(/,/g, ', ')
  }

  // ---- setup ----------------------------------------------------------------

  init () {
    this.curvePoints.forEach((curve, i) => {
      const idx = i * 40
      const str = this.allOffset(idx)
      const l = this.curveText(curve, i, str)
      this.lines.push({ element: l, index: idx })
    })

    this.animate()
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

  animate () {
    setTimeout(() => {
      this.animate()
    }, 100)

    this.lines.forEach(l => {
      l.index++
      if (l.index > this.str.length) l.index = 0
      l.element.textContent = this.allOffset(l.index)
    })
  }

  // --------------------------------------------------------------------------
  // CONVO LOGIC



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

  createSVG (parentSlector, params) {
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
    const h = (window.innerWidth / 2 / 660) * 656
    const H = window.innerHeight
    svg.style.margin = `${H / 2 - h / 2}px auto`

    this.parent = (parentSlector && typeof parentSlector === 'string')
      ? document.querySelector(parentSlector) : document.body

    if (params && params.mobileDebug) {
      window.onerror = function (msg, url, linenumber) {
        window.alert(`Error message: ${msg}
URL: ${url}
Line Number: ${linenumber}`)
        return true
      }
    }

    this.parent.appendChild(svg)
    return svg
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

    let x = w * 0.5
    let y = h * 0.5
    const r1 = (w > h) ? h / 8 : w / 8
    const r2 = (w > h) ? h : w
    ctx.globalAlpha = 0.25
    ctx.fillStyle = newGrd(['white', 'violet', 'blue'], x, y, r1, r2)
    ctx.fillRect(0, 0, w, h)

    x = w * 0.25
    y = h * 0.25
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = newGrd(['red', 'white'], x, y, r1, r2)
    ctx.fillRect(w * 0.25, h * 0.1, w * 0.25, h * 0.40)

    ctx.beginPath()
    ctx.arc(w / 2, h / 2, w * 0.1, 0, 2 * Math.PI)
    ctx.closePath()
    ctx.globalAlpha = 1
    ctx.fillStyle = newGrd(['violet', 'blue', 'white'], x, y, r1, r2)
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
    bg.style.transition = 'filter 2s cubic-bezier(0.165, 0.84, 0.44, 1)'
    bg.style.filter = 'blur(100px)'
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


}

window.OTTA = OTTA
