/**
 * Deep Fish UI — the blank New Session surface.
 *
 * The blank home becomes a dotted composition: a dot-matrix portrait on the
 * right and the deepseek / harness wordmark on the left, both driven by one
 * canvas layer registered into `conversation.hero.frame` (the HOC slot that
 * wraps the Conversation scroll body and reports whether the blank home shows).
 * The layer renders the wrapped `children` unchanged and paints below the
 * content (`z-index: -1`, `pointer-events: none`).
 *
 * It also hides the stock home chrome it replaces: the headline, the brand mark,
 * and the official pixel-whale canvas. A faint `dsh-fish-ui` signature sits in
 * the page corner while the home is showing.
 *
 * The stylesheet below also carries the accent half in the same bundle:
 * whale-blue bold runs in chat prose, the whale-blue composer focus ring, and the
 * re-inked diff plates. One install, one stylesheet, one place to tune.
 */
window.__ModuleLoader__.load({
  id: 'dsh-fish-ui',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /* ------------------------------------------------------------ hero mascot */

    /** Dot grid sampled from the mascot artwork: one hex digit per cell. */
    const FISH_COLUMNS = 104
    const FISH_ROWS = 73
    const FISH_GRID = '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000066666666666666660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006666666666666600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006666666666666000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000666666666660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000066666666600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000066666666000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006666660000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bbbbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000000bbbbbb7777777777777bbbbb00000000000000004400000000000000000000000000000000000000000000000000000000000bbbb77777777777777777777777bbbb00000000000000000000000000000000000000000000000000000000000000000000000bbb77777779999999999999977777777bbb0000000000000044400000000000000000000000000000000000000000000000000bb7777779999999999999999999999777777bbb000000000000444000000000000000000000000000000000000000000000000bb77777799999999999999999999999999977777bbb000000000000000000000000000000000000000000000000000006600000bb77777999999999999999999999999999999977777bb0000044400000000000000000000000000000000000000000000666000bb7777999999999999999999999999999990999997777bb00044440000000000000000000000000000000000000000000066666bb777799999999999999999999999999990000099997777bb000040000000000000000000000000000000000000000000006666bb7777999999999999999999999999999900000099999777bb000000000000000000000000000000000000000000000000006666bb77799999999999999999999999999999000000999997777bb0000000000000000000000000000000000000000000000000666bb777799999999999999999999999999999990009999999777bb0000000000000000000000000000000000000000000000000666bb777799999999999999999999999999999999999999999777bb0000000000000000000000000000000000000000000000000666bb777799999999999999999999999999999999999999999770000000000000000000000000000000000000000000000000000666bb7777999999999999999999999999999999999999999997700000000000000000000000000000000000000000000000000006666bb77779999999999999999999999999999999999999997777bb00000000000000000000000000000000000000000000000006666bb7777999999999999999999999999999999999999997777bb0000000000000000000000000000000000000000000000000066660bb777799999999999999999999999999999999999997777bb00000000000000000000000000000000000000000000000000666000bb7777999999999999999999999999999999999977777bb0000000000000000000000000000000000000000000000000006600000bb77777999999999999999999999999999999977777bb000000000000000000000000000000000000000000000000000000000000bbb7777799999999999999999999999999977777bb0000000000000000000000000000000000000000000000000000000000000000bb7777779999999999999999999999777777bbb0000000000000000000000000000000000000000000000000000000000000000000bbb77777777999999999999977777777bbb00000000000000000000000000000000000000000000000000000000000000000000006bbbb77777777777777777777777bbb000000000000000000000000000000000000000000000000000000000000000000000000066666bbbbb777777777777bbbbbb000000000000000000000000000000000000000000000000000000000000000000000000000066666660000bbbbbbbbbbb0000000000000000000000000000000000000000000000000000000000000000000000000000000000666666000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006666000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000066600000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    const GIRL_LINES = '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001221000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000050551247200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000e601e8000001b624620000000000000000000000000000000000000000000000000000000000000000000000000000000000061f000000000000ff00068000000000000000000000000000000000000000000000000000000000000000000000000000000004b000000004000300000000090000000000000000000000000000000000000000000000000000000000000000000000000000006c5000600015100520030000080000000000000000000000000000000000000000000000000000000000000000000000000000005000005700000000000400000f55700000000000000000000000000000000000000000000000000000000000000000000000000100020000012125521100000021002800000000000000000000000000000000000000000000000000000000000000000000000070000600003fea779dfff910011000005000000000000000000000000000000000000000000000000000000000000000000000050000000112deb98422225efe10010000ff00000000000000000000000000000000000000000000000000000000000000000000f006000259b233233353322239fb000000099000000000000000000000000000000000000000000000000000000000000000000fd00110f95f52223222233323323cf1000000f000000000000000000000000000000000000000000000000000000000000000007f00001f82a43333333332333333324f2010005c0000000000000000000000000000000000000000000000000000000000000000ff1000f9254333333333333333333223f400000f1000000000000000000000000000000000000000000000000000000000000000f10008e23433333333333333323322333f10000f110000000000000000000000000000000000000000000000000000000000000300001f3333333333333332322234223335d110ff10400000000000000000000000000000000000000000000000000000000000060000983333333333333353222323422326920012f0010000000000000000000000000000000000000000000000000000000000700001d33333333334223239232232632323990000da0300000000000000000000000000000000000000000000000000000000004000059333333333322223337333323523324b70002f0100000000000000000000000000000000000000000000000000000000000f901b5333323333212233322b333326323336c1001f010000000000000000000000000000000000000000000000000000000000cf002b22333332332224343601a333236233237800bf02ee00000000000000000000000000000000000000000000000000000001f00085233324224333332369101a43326323334910fb246d0000000000000000000000000000000000000000000000000000000ff002c22333262273333333492116b733342333452152332b0000000000000000000000000000000000000000000000000000000ff00791234337119333333327a0002c533a31233332223f810000000000000000000000000000000000000000000000000000001ff10d22234338108633332422d00002735612433323313cf300000000000000000000000000000000000000000000000000000001f00a22235339102933322321f0000011287223333273743f80000000000000000000000000000000000000000000000000000000f005242343381118533222618000002104213333324f8433f400000000000000000000000000000000000000000000000000001ff813332243288004825322522102fffff1253323333654344f2000000000000000000000000000000000000000000000000001fc9d823332342b100082453224601fd2f13f9333233234333344f20000000000000000000000000000000000000000000000001f16683233323634100013233324901f72c90f82333342894333335f100000000000000000000000000000000000000000000000f90f453233323751100001163242270bdf3c011423323347e9433336f100000000000000000000000000000000000000000000000dfd4432333326801018d201b46b200572260025333233201afc84349f0000000000000000000000000000000000000000000000001a4323333334900fff7c2017129100b1110083432243f00013dfd97bf000000000000000000000000000000000000000000000000b5333233233806f3a36f000100000010002547322739900000128ffff0000000000000000000000000000000000000000000000cb533325322361f12ccfb0000000000000124b3225733e7000000002bff000000000000000000000000000000000000000000002f4433327322342f00e2251000000000111116b22584333ff9204a00000ff0000000000000000000000000000000000000000001f54433a2642323c9201a1100000000000001023243333325b03d86fced4fe000000000000000000000000000000000000000000f943548724822224200011000000001100000043662334223d100000100100000000000000000000000000000000000000000008e444ff2023932322b20000100002babe00001896932434322780000000000000000000000000000000000000000000000000002f548fa0119276333225100110009f214200000ea33224353222a200000000000000000000000000000000000000000000000002f66eb1001b72343235325211000005343000008f3332234432224a0000000000000000000000000000000000000000000000001fbdf300002e333333239322100000000000000af932222363422226a00000000000000000000000000000000000000000000000fff5100002f434333383238ff10000000000001f8722322353532223b8000000000000000000000000000000000000000000000ff20000ff45b5333323433228bf5100000000112e73232123343422222e900000000000000000000000000000000000000000000f515fef1003a3233223533322389dfff41102612fa33321233335222420fb00000000000000000000000000000000000000000000591010000f622557477323343333be36255411134662222343333222800cf0000000000000000000000000000000000000000000000000005f2236112ff922238333c601111111002f4332227333522246003f10000000000000000000000000000000000000000000000000f3337100006f52323437f201011111101f43322245338836491000fb000000000000000000000000000000000000000000000005623440110001d2253675100000c1f0000fa542224767ef1175b0000ff0000000000000000000000000000000000000000000004734352011000015242207000004f1f2000027d2125df9100065780000ff1000000000000000000000000000000000000000002e9343376001f00009121203b3dd8f324d222022121169100000272a10000ff3000000000000000000000000000000000000006ff2633269710ff0000c12f303fc66e72338eceef21c21410000002622b10001fa6100000000000000000000000000000000009fc1026323a1001f00102c11da02f744332237754ce03f6214000000e9222900005d46200000000000000000000000000000009f50000b3228a000cf0000b7112f00fc444d803a444f30172225100000fe222470001c70a100000000000000000000000000000fc00000b522398001ff1000d2126f000c444f302f444c001f6236a2100002922246000bc00d0000000000000000000000000000fc000008822246a102efb001d112f20018447f100f8463001ff9256ab20003c42224712ab102900000000000000000000000000ff000008b322354b20899f005511af005f9446c000b644d2001ff11536fc001c542222257e100f00000000000000000000000009f200009b3223536a10d46d006113f8001ffa4e20f22c45df7007f303328815056353222129000e3000000000000000000000001d92001aa3222433a201f44f30325ff2000013ff10002faafa0001ff12322904129334422222400d500000000000000000000000995a12a7222234338002e44f62c18ff0000000fd00000ff1000000cf3233440f2195334421223659100000000000000000000000c6322452222243337103a4632910ff100000001000000d200012001f2337712f2018333493112123610000000000000000000000c222242222233333232558325100ff00010000000400000010000025322f10ff201933432ca211287dc200000000000000000017322243222323333229a463228001f10001000000002700000000000df321002f202b323900ae212201cd60000000000000002fd6622243223323332375443222cf01f0000100010000ff000010000001fb00006f20b8322b100ab212101be10000000000000ff3016223322352333237444434225fb1f000000001000000000010000000ff0002fe20284228600598212101f8000000000007f500083223333432333364443439222f21f000000001000000000000000000ef001f9c20235324b008538313009d0000000000ef0000772223333332233554443434422500f1000000000000000000000000009f00089641323422a009234922400e000000000df00001922224333322233a44344443448900f900140000000000000000000000df000d547522233252242246a24109000000009f1000056242253333222323c4433444444f00ff001324200000cf000000000000fa00fc4446222223255222c12b229300000001eb000008312223433322232249444444445cf01fb00111241000df000000133002f100f64446322222322228900c32900000000ab80000082112224333223222244444444448f007f701111224110001246323310ff01fd44444832222322248000172810'

    /** Grid aspect (width / height), used to keep the portrait undistorted. */
    const GIRL_ASPECT = FISH_COLUMNS / FISH_ROWS

    /** Wordmark set in dots on the left: two lines, sampled from live text. */
    const LOCKUP_LINES = ['deepseek', 'harness']
    const LOCKUP_COLUMNS = 140
    const LOCKUP_ROWS = 58

    /** Alpha buckets drawn per frame, so the twinkle costs one fill per level. */
    const LEVELS = 12
    const TAU = Math.PI * 2

    /**
     * Twinkle refresh rate. The field is dense, so the frame budget is kept
     * loose: slow alpha breathing reads the same at 16 fps, and the canvas is
     * only alive while the blank home is on screen.
     */
    const FRAME_MS = 1000 / 30

    /** One dot's cell in CSS pixels: fixed, so dots never scale with the window. */
    const DOT_PITCH = 9

    /** Smallest dot pitch the wordmark may use before it is dropped. */
    const TEXT_MIN_PITCH = 3.6

    /** Wordmark assembly: dots reveal left to right over this long. */
    const ASSEMBLY_MS = 1300

    /** Each line's slice of the assembly, in timeline fractions: line 1 starts
     *  while line 0 is still finishing, so the two never pop at once. */
    const ASSEMBLY_SECOND_LINE = 0.42
    const ASSEMBLY_LINE_SPAN = 0.58

    /** Temporary on-canvas readout used to diagnose layout mismatches. */
    const DEBUG = false

    /** Dot model of the portrait for the light canvas (ink-weighted). */
    let dotModel

    /** Dot model of the portrait for the dark canvas (line-art weighted). */
    let lineModel

    /** Dot model of the wordmark, built once by rasterising live text. */
    let lockupModel

    /**
     * Decode one hex grid into dots: one dot per non-empty cell, weight from the
     * digit, each with its own twinkle phase and speed so the field never blinks
     * in unison.
     * @param cells - one hex digit per grid cell, row-major.
     * @returns dots in normalised space (`u`/`v` 0..1, `a` weight 0..1).
     */
    function decodeGrid(cells) {
      const dots = []
      for (let index = 0; index < cells.length; index += 1) {
        const weight = Number.parseInt(cells[index], 16)
        if (!(weight > 0)) continue
        const row = Math.floor(index / FISH_COLUMNS)
        const column = index % FISH_COLUMNS
        dots.push({
          u: (column + 0.5) / FISH_COLUMNS,
          v: (row + 0.5) / FISH_ROWS,
          a: weight / 15,
          phase: Math.random() * TAU,
          speed: 0.5 + Math.random() * 0.8,
        })
      }
      return dots
    }

    /**
     * Light canvas: the artwork's ink drives dot weight, so dark hair and the
     * dark dress read dark on the pale canvas.
     * @returns dots in normalised space.
     */
    function mascotDots() {
      if (dotModel === undefined) dotModel = decodeGrid(FISH_GRID)
      return dotModel
    }

    /**
     * Dark canvas: the dots are light, so the artwork's ink is inverted — skin
     * and the white apron become dense bright dots while ink-heavy hair and the
     * dress fade back into the canvas. Cells with no ink but enclosed by the
     * figure count as full weight, which is what keeps the face from turning
     * into an empty hole.
     * @returns dots in normalised space.
     */
    function invertedDots() {
      if (lineModel !== undefined) return lineModel
      const total = FISH_COLUMNS * FISH_ROWS
      const occupied = new Uint8Array(total)
      const weight = new Float32Array(total)
      for (let index = 0; index < FISH_GRID.length && index < total; index += 1) {
        const value = Number.parseInt(FISH_GRID[index], 16)
        if (!(value > 0)) continue
        occupied[index] = 1
        weight[index] = value / 15
      }
      const rowFirst = new Int32Array(FISH_ROWS).fill(-1)
      const rowLast = new Int32Array(FISH_ROWS).fill(-1)
      const columnFirst = new Int32Array(FISH_COLUMNS).fill(-1)
      const columnLast = new Int32Array(FISH_COLUMNS).fill(-1)
      for (let row = 0; row < FISH_ROWS; row += 1) {
        for (let column = 0; column < FISH_COLUMNS; column += 1) {
          if (occupied[row * FISH_COLUMNS + column] === 0) continue
          if (rowFirst[row] < 0) rowFirst[row] = column
          rowLast[row] = column
          if (columnFirst[column] < 0) columnFirst[column] = row
          columnLast[column] = row
        }
      }
      const dots = []
      for (let row = 0; row < FISH_ROWS; row += 1) {
        for (let column = 0; column < FISH_COLUMNS; column += 1) {
          if (row < columnFirst[column] || row > columnLast[column]) continue
          if (column < rowFirst[row] || column > rowLast[row]) continue
          const index = row * FISH_COLUMNS + column
          const alpha = occupied[index] === 1 ? 1 - weight[index] : 1
          if (alpha < 0.45) continue
          dots.push({
            u: (column + 0.5) / FISH_COLUMNS,
            v: (row + 0.5) / FISH_ROWS,
            a: alpha,
            phase: Math.random() * TAU,
            speed: 0.5 + Math.random() * 0.8,
          })
        }
      }
      lineModel = dots
      return dots
    }

    /**
     * Rasterise the two wordmark lines with the UI font and reduce them to the
     * same dotted grid the portrait uses.
     * @returns dots in normalised block space (`u`/`v` 0..1, `a` weight 0..1).
     */
    function lockupDots() {
      if (lockupModel !== undefined) return lockupModel
      const supersample = 4
      const family = '"Segoe UI", system-ui, sans-serif'
      // Display treatment: heavy italic with wide tracking, filled solid. Each
      // line is rasterised on its own canvas, so a descender that crosses the
      // other line's band still belongs to its own colour.
      const style = 'italic 700'
      const probe = document.createElement('canvas').getContext('2d')
      probe.font = `${style} 100px ${family}`
      if ('letterSpacing' in probe) probe.letterSpacing = '6px'
      const width = LOCKUP_COLUMNS * supersample
      const height = LOCKUP_ROWS * supersample
      const widest = Math.max(...LOCKUP_LINES.map(line => probe.measureText(line).width), 1)
      const size = ((width * 0.94) / widest) * 100
      const model = LOCKUP_LINES.map((line, lineIndex) => {
        const big = document.createElement('canvas')
        big.width = width
        big.height = height
        const bigContext = big.getContext('2d')
        bigContext.textAlign = 'left'
        bigContext.textBaseline = 'middle'
        if ('letterSpacing' in bigContext) bigContext.letterSpacing = '6px'
        bigContext.font = `${style} ${size.toFixed(1)}px ${family}`
        bigContext.fillStyle = 'rgba(255, 255, 255, 0.92)'
        bigContext.fillText(line, width * 0.02, height * (0.34 + 0.4 * lineIndex))

        const small = document.createElement('canvas')
        small.width = LOCKUP_COLUMNS
        small.height = LOCKUP_ROWS
        const smallContext = small.getContext('2d')
        smallContext.drawImage(big, 0, 0, LOCKUP_COLUMNS, LOCKUP_ROWS)
        const pixels = smallContext.getImageData(0, 0, LOCKUP_COLUMNS, LOCKUP_ROWS).data
        const dots = []
        for (let index = 0; index < LOCKUP_COLUMNS * LOCKUP_ROWS; index += 1) {
          const alpha = pixels[index * 4 + 3] / 255
          if (alpha < 0.08) continue
          dots.push({
            u: ((index % LOCKUP_COLUMNS) + 0.5) / LOCKUP_COLUMNS,
            v: (Math.floor(index / LOCKUP_COLUMNS) + 0.5) / LOCKUP_ROWS,
            a: Math.min(1, alpha * 1.25),
            phase: Math.random() * TAU,
            speed: 0.5 + Math.random() * 0.8,
          })
        }
        return dots
      })
      lockupModel = model
      return model
    }

    /**
     * Paint the dot mascot and wordmark into a canvas, twinkling in place.
     * @param canvas - the frame canvas sized to the conversation area.
     * @returns disposer that cancels the animation and observers.
     */
    function attachMascot(canvas) {
      const context = canvas.getContext('2d')
      if (context === null) return () => {}
      const portraitLight = mascotDots()
      const portraitDark = invertedDots()
      const wordmark = lockupDots()
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
      let reduced = motion.matches
      const started = performance.now()
      // The reveal clock starts on the first paint that actually has a canvas to draw
      // into, otherwise the animation can finish while the element is still sizing.
      let revealStarted = 0
      let width = 1
      let height = 1
      let dpr = 1
      let frame = 0
      let drawnAt = 0
      let disposed = false
      /** Composer card geometry in canvas coordinates; the composition's bound. */
      let composerLeft = 0
      let composerWidth = 0
      let composerTop = 0
      let composerNode = null
      const composerObserver = new ResizeObserver(() => { readComposer() })

      /** Re-read the composer card (it mounts with the hero and resizes with it). */
      const readComposer = () => {
        const canvasRect = canvas.getBoundingClientRect()
        // Pick the composer card that actually overlaps this conversation area:
        // hidden or off-screen cards (other panels, mounted shells) must not
        // become the layout bound.
        let node = null
        let rect = null
        for (const candidate of document.querySelectorAll('[data-composer-card]')) {
          const box = candidate.getBoundingClientRect()
          if (box.width < 80 || box.height < 20) continue
          if (box.right <= canvasRect.left || box.left >= canvasRect.right) continue
          if (rect === null || box.width > rect.width) {
            node = candidate
            rect = box
          }
        }
        if (node !== composerNode) {
          composerObserver.disconnect()
          composerNode = node
          if (node !== null) composerObserver.observe(node)
        }
        if (node === null || rect === null) {
          composerLeft = 0
          composerWidth = 0
          composerTop = 0
          return
        }
        composerLeft = rect.left - canvasRect.left
        composerWidth = rect.width
        composerTop = rect.top - canvasRect.top
      }

      /** Last canvas box in viewport coordinates, for pointer hit-testing. */
      let boxLeft = 0
      let boxTop = 0
      let boxWidth = 0
      let boxHeight = 0
      /** Pointer position in canvas coordinates; inactive while outside. */
      let pointerX = -1e6
      let pointerY = -1e6
      let pointerActive = false
      const onPointerMove = (event) => {
        pointerX = event.clientX - boxLeft
        pointerY = event.clientY - boxTop
        pointerActive = pointerX >= 0 && pointerY >= 0 && pointerX <= boxWidth && pointerY <= boxHeight
        if (pointerActive) {
          trail.push({ x: pointerX, y: pointerY, at: performance.now() })
          if (trail.length > 8) trail.shift()
        spawnRipple()
        }
        if (reduced) paint(performance.now())
      }
      const onPointerLeave = () => { pointerActive = false }
      /** Moving the pointer over the field band leaves a light ripple behind. */
      const spawnRipple = () => {
        const cfg = dcSettings
        if (cfg !== undefined && cfg.ripple === false) return
        const nowMs = performance.now()
        if (nowMs - lastRippleAt < 90) return
        const bandTop = boxHeight - Math.min(440, Math.max(230, boxHeight * 0.4))
        if (pointerY < bandTop) return
        lastRippleAt = nowMs
        fieldRipples.push({ x: pointerX, y: pointerY, at: nowMs })
        if (fieldRipples.length > 8) fieldRipples.shift()
      }
      /** Recent pointer samples so the light leaves a short, fading trail. */
      const trail = []
      /** Click ripples: origin plus start time, oldest first. */
      const ripples = []
      const onPointerDown = (event) => {
        const x = event.clientX - boxLeft
        const y = event.clientY - boxTop
        if (x < 0 || y < 0 || x > boxWidth || y > boxHeight) return
        ripples.push({ x, y, at: performance.now() })
        if (ripples.length > 5) ripples.shift()
      }


      const measure = () => {
        const rect = canvas.getBoundingClientRect()
        dpr = Math.min(window.devicePixelRatio || 1, 2)
        width = Math.max(1, rect.width)
        height = Math.max(1, rect.height)
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
        boxLeft = rect.left
        boxTop = rect.top
        boxWidth = width
        boxHeight = height
        readComposer()
      }

      /**
       * Draw one frame: both groups hold still and only their alpha breathes.
       * @param now - frame timestamp.
       */
      let bgLayer = null
        let bgGlow = null
        let fieldDots = null
        const fieldRipples = []
        let lastRippleAt = 0
        let fieldKeyCache = ''
        let composerFocused = false
        let focusAmount = 0
        let bgKey = ''

        const paint = (now) => {
        frame = 0
        if (disposed || document.hidden) return
        const cfg = dcSettings
        if (cfg !== undefined && cfg.hero === false) {
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          frame = requestAnimationFrame(paint)
          return
        }
        if (revealStarted === 0 && width > 200 && height > 200) revealStarted = now
        // The assembly is a short, fast reveal: give it a smoother frame rate
        // than the slow twinkle, then fall back to the cheap cadence.
        const assembling = now - revealStarted < ASSEMBLY_MS + 80
        const interval = (assembling ? 1000 / 60 : FRAME_MS) - 1
        if (!reduced && now - drawnAt < interval) {
          frame = requestAnimationFrame(paint)
          return
        }
        drawnAt = now
        const time = reduced ? 0 : (now - started) / 1000
        const dark = document.body.hasAttribute('data-ds-dark-theme')
        const ink = dark ? '236, 238, 242' : '102, 108, 120'
        // The composer card is the layout's bound: the pair is centred on it and
        // can never be wider than the input box.
        const limit = composerWidth > 160 ? composerWidth : width * 0.94
        const originX = composerWidth > 160 ? composerLeft : (width - limit) / 2

        // One pitch drives both groups: the wordmark and the portrait always share
        // the same dot size, and that pitch scales with the space available. Two
        // hard bounds: the composer width (the pair never exceeds the input box)
        // and the space above the composer (the pair hangs above it instead of
        // being covered by it).
        const availW = limit * 0.94
        const pairCells = LOCKUP_COLUMNS + FISH_COLUMNS - 30
        const bandTop = composerTop > 140 ? composerTop : height * 0.86
        const heightPitch = Math.max(1, bandTop - 8) / FISH_ROWS
        let pitch = Math.min(DOT_PITCH, availW / pairCells, heightPitch)
        let showText = true
        if (pitch < TEXT_MIN_PITCH) {
          // Only when the type would fall below the readable floor: drop the
          // wordmark and keep the portrait as large as it can be.
          showText = false
          pitch = Math.min(DOT_PITCH, availW / FISH_COLUMNS, heightPitch)
        }
        if (pitch < 2.2) {
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          return
        }
        const blockW = LOCKUP_COLUMNS * pitch
        const blockH = LOCKUP_ROWS * pitch
        const portraitW = FISH_COLUMNS * pitch
        const portraitH = FISH_ROWS * pitch
        const overlap = Math.max(8, pitch * 30)
        const pairW = blockW + portraitW - overlap

        // Hang the pair off the composer: the portrait's bottom edge sits on the
        // composer's top edge, and the dot pitch above guaranteed it fits there.
        const portraitY = Math.min(
          Math.max(bandTop - portraitH / 2, 6 + portraitH / 2),
          Math.max(6 + portraitH / 2, height - portraitH / 2 - 6),
        )
        let portraitX
        let blockX = 0
        if (showText) {
          blockX = originX + Math.max(0, (limit - pairW) / 2)
          portraitX = blockX + blockW - overlap + portraitW / 2
        } else {
          portraitX = originX + limit / 2
        }
        // Keep the pair inside the canvas even if the composer rect was odd.
        const minX = portraitW / 2 + 6
        const maxX = Math.max(minX, width - portraitW / 2 - 6)
        portraitX = Math.min(Math.max(portraitX, minX), maxX)
        const blockY = portraitY - blockH / 2
        // The portrait and the wordmark are centred on each other, which leaves their
        // cell rows half a cell apart; nudge the portrait so every dot in the scene
        // (artwork and printed field alike) lands on one single lattice.
        const portraitYAligned = portraitY + pitch / 2
        const portraitRadius = Math.max(0.8, pitch * 0.28)
        const lockupRadius = Math.max(0.8, pitch * 0.34)

        // A faint dot field under everything, built on the artwork's own pitch and
        // ink so the background reads as part of the same printed sheet.
        // Phase the background lattice onto the artwork's own grid: the wordmark and the
        // portrait already sit on one lattice (their origins differ by a whole number
        // of cells), so matching that phase makes the field read as the same printed
        // sheet instead of a second, offset grid.
        // Artwork dots sit at the CENTRES of their cells (blockX + (col + 0.5) * pitch),
        // so the field has to be phased half a cell further: its dots land exactly on
        // the artwork's dots, like stones on intersections, not inside the squares.
        const phaseX = (((blockX + pitch / 2) % pitch) + pitch) % pitch
        const phaseY = (((blockY + pitch / 2) % pitch) + pitch) % pitch
        const buildKey = pitch.toFixed(3) + '|' + ink + '|' + phaseX.toFixed(3) + '|'
          + phaseY.toFixed(3) + '|' + width + '|' + height + '|' + dpr
        if (buildKey !== bgKey) {
          bgKey = buildKey
          bgLayer = document.createElement('canvas')
          bgLayer.width = Math.max(1, Math.round(width * dpr))
          bgLayer.height = Math.max(1, Math.round(height * dpr))
          const layerContext = bgLayer.getContext('2d')
          if (layerContext === null) {
            bgLayer = null
          } else {
            layerContext.setTransform(dpr, 0, 0, dpr, 0, 0)
            const fieldRadius = Math.max(0.45, pitch * 0.11)

            // The resting field.
            layerContext.fillStyle = 'rgba(' + ink + ', 0.1)'
            for (let y = phaseY; y < height + pitch; y += pitch) {
              for (let x = phaseX; x < width + pitch; x += pitch) {
                layerContext.beginPath()
                layerContext.arc(x, y, fieldRadius, 0, TAU)
                layerContext.fill()
              }
            }

            // The focused field: the same lattice, but brighter close to the
            // composer card and fading out with distance, so the click lights the
            // dots around the input rather than the whole page.
            bgGlow = document.createElement('canvas')
            bgGlow.width = bgLayer.width
            bgGlow.height = bgLayer.height
            const glowContext = bgGlow.getContext('2d')
            if (glowContext === null) {
              bgGlow = null
            } else {
              glowContext.setTransform(dpr, 0, 0, dpr, 0, 0)
              const cardLeft = composerWidth > 160 ? composerLeft : (width - limit) / 2
              const cardWidthForGlow = composerWidth > 160 ? composerWidth : limit
              const glowRadiusX = Math.max(160, cardWidthForGlow * 0.55)
              const glowRadiusY = Math.max(150, Math.min(height * 0.3, 260))
              const centerX = cardLeft + cardWidthForGlow / 2
              const centerY = composerTop + 8
              for (let y = phaseY; y < height + pitch; y += pitch) {
                for (let x = phaseX; x < width + pitch; x += pitch) {
                  const dx = (x - centerX) / glowRadiusX
                  const dy = (y - centerY) / glowRadiusY
                  const falloff = Math.exp(-(dx * dx + dy * dy) * 2.1)
                  if (falloff < 0.03) continue
                  glowContext.fillStyle = 'rgba(' + ink + ', ' + (0.3 * falloff).toFixed(3) + ')'
                  glowContext.beginPath()
                  glowContext.arc(x, y, fieldRadius, 0, TAU)
                  glowContext.fill()
                }
              }
            }
          }
        }

        // The portrait runs one opacity notch brighter than the wordmark, so the
        // two groups keep separate alpha ladders.
        const portraitPaths = []
        const wordmarkPaths = [[], []]
        for (let level = 0; level < LEVELS; level += 1) {
          portraitPaths.push(new Path2D())
          wordmarkPaths[0].push(new Path2D())
          wordmarkPaths[1].push(new Path2D())
        }

        // Wordmark assembly: dots light up left to right, with a bright front.
        const assembly = reduced ? 1 : Math.min(1, (now - revealStarted) / ASSEMBLY_MS)
        // The portrait follows the wordmark: a soft vertical wipe grows it downward
        // about a tenth of a second later.
        const portraitProgress = reduced
          ? 1
          : Math.max(0, Math.min(1, ((now - revealStarted) - 140) / 1100))
        while (ripples.length > 0 && now - ripples[0].at > 760) ripples.shift()
        const trailNow = trail.filter(sample => now - sample.at < 420)
        const rippleBoost = (x, y) => {
          let best = 0
          for (const ripple of ripples) {
            const age = (now - ripple.at) / 760
            const radius = age * 640
            const dx = x - ripple.x
            const dy = y - ripple.y
            if (dx * dx + dy * dy > (radius + 200) * (radius + 200)) continue
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (Math.abs(distance - radius) > 160) continue
            const band = Math.exp(-Math.pow((distance - radius) / 44, 2))
            best = Math.max(best, band * (1 - age))
          }
          return 1 + 1.25 * best
        }
        const trailBoost = (x, y) => {
          let best = 0
          for (const sample of trailNow) {
            const age = Math.max(0, (now - sample.at) / 420)
            const dx = x - sample.x
            const dy = y - sample.y
            if (Math.abs(dx) > 260 || Math.abs(dy) > 260) continue
            best = Math.max(best, Math.exp(-(dx * dx + dy * dy) / (2 * 95 * 95)) * (1 - age))
          }
          return 1 + 0.95 * best
        }
        const place = (target, dot, x, y, radius, kind, line) => {
          // The portrait holds a steady level; only the wordmark breathes.
          const breathe = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(time * dot.speed + dot.phase)
          // Ease the wave so the low and high ends linger instead of sweeping
          // through the extremes linearly, which reads as a softer pulse.
          const eased = breathe * breathe * (3 - 2 * breathe)
          let tone = kind === 'portrait' ? dot.a : dot.a * (0.35 + 0.65 * eased)
          if (kind === 'portrait' && portraitProgress < 1) {
            const local = Math.max(0, Math.min(1, (portraitProgress - dot.v * 0.45) / 0.55))
            const wipe = local * local * (3 - 2 * local)
            if (wipe <= 0.004) return
            tone *= wipe
          }
          if (kind === 'wordmark') {
            if (assembly < 1) {
              // Whole-word fade: the line rises as one piece, no left-to-right sweep.
              const offset = line === 1 ? ASSEMBLY_SECOND_LINE : 0
              const progress = Math.max(0, Math.min(1, (assembly - offset) / ASSEMBLY_LINE_SPAN))
              const smooth = progress * progress * (3 - 2 * progress)
              if (smooth <= 0.02) return
              tone *= smooth
            }
            if (pointerActive) tone *= trailBoost(x, y)
          }
          // Ripples are a wordmark effect; the portrait stays untouched.
          if (kind === 'wordmark') tone = Math.min(1, tone * rippleBoost(x, y))
          const level = Math.min(LEVELS - 1, Math.max(0, Math.round(tone * (LEVELS - 1))))
          // Halftone weighting: heavier cells draw slightly larger dots, so the
          // field reads as printed ink rather than a uniform grid.
          const size = radius * (0.82 + 0.36 * dot.a)
          target[level].moveTo(x + size, y)
          target[level].arc(x, y, size, 0, TAU)
        }
        const portrait = dark ? portraitDark : portraitLight
        for (const dot of portrait) {
          place(
            portraitPaths,
            dot,
            portraitX + (dot.u - 0.5) * portraitW,
            portraitYAligned + (dot.v - 0.5) * portraitH,
            portraitRadius,
            'portrait',
          )
        }
        if (showText) {
          wordmark.forEach((dots, index) => {
            for (const dot of dots) {
              place(
                wordmarkPaths[index],
                dot,
                blockX + dot.u * blockW,
                blockY + dot.v * blockH,
                lockupRadius,
                'wordmark',
                index,
              )
            }
          })
        }

        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        context.clearRect(0, 0, width, height)
        // The field is painted after the clear so it survives the frame.
        if (bgLayer !== null && (cfg === undefined || cfg.field !== false)) {
          context.drawImage(bgLayer, 0, 0, width, height)
        }
        const focusTarget = composerFocused ? 1 : 0
        focusAmount += (focusTarget - focusAmount) * 0.14
        if (focusAmount > 0.005 && bgGlow !== null) {
          context.save()
          context.globalAlpha = Math.min(1, focusAmount)
          context.drawImage(bgGlow, 0, 0, width, height)
          context.restore()
        }

        // The wave field lives on the lattice: the light pattern is pure brightness,
        // and the pointer can nudge dots aside. Nothing follows the cursor and every
        // displaced dot springs straight back to its own cell.
        const fieldKey = width + '|' + height + '|' + pitch.toFixed(3) + '|'
          + phaseX.toFixed(2) + '|' + phaseY.toFixed(2)
        if (fieldKey !== fieldKeyCache) {
          fieldKeyCache = fieldKey
          fieldDots = []
          const bandHeight = Math.min(440, Math.max(230, height * 0.4))
          const bandTop = height - bandHeight
          for (let y = phaseY; y < height + pitch; y += pitch) {
            if (y < bandTop) continue
            const depth = Math.min(1, (y - bandTop) / bandHeight)
            const vertical = depth * depth * (3 - 2 * depth)
            for (let x = phaseX; x < width + pitch; x += pitch) {
              fieldDots.push({ x: x, y: y, vertical: vertical, ox: 0, oy: 0, vx: 0, vy: 0 })
            }
          }
        }

        if (!reduced && fieldDots !== null && (cfg === undefined || cfg.wave !== false)) {
          const dt = 1 / 30
          const unit = pitch / 8
          const fieldRadius = Math.max(0.45, pitch * 0.11)
          const breathe = 0.86 + 0.14 * Math.sin(time * 0.13)
          const buckets = [[], [], [], [], [], []]
          while (fieldRipples.length > 0 && now - fieldRipples[0].at > 1100) fieldRipples.shift()
          for (const dot of fieldDots) {

            const warpX = Math.sin(dot.y * 0.006 / unit + time * 0.23) * 30
              + Math.sin(dot.x * 0.003 / unit - time * 0.17) * 20
            const warpY = Math.sin(dot.x * 0.0035 / unit + time * 0.29) * 26
            const u = (dot.x + warpX) / unit
            const v = (dot.y + warpY) / unit
            const field = 0.5
              + 0.3 * Math.sin(u * 0.0035 - time * 0.55)
              + 0.22 * Math.sin(u * 0.0061 + time * 0.37 + v * 0.01)
              + 0.18 * Math.sin(u * 0.0107 - time * 0.29 + v * 0.021)
              + 0.12 * Math.sin(u * 0.0173 + time * 0.83 - v * 0.033)
            let light = Math.max(0, Math.min(1, field)) ** 1.6
            // A touch only adds light: rings race outward and fade, the dots stay put.
            for (const ripple of fieldRipples) {
              const age = (now - ripple.at) / 1100
              const rdx = dot.x - ripple.x
              const rdy = dot.y - ripple.y
              const distance = Math.sqrt(rdx * rdx + rdy * rdy)
              const ring = Math.exp(-Math.pow((distance - age * 420) / 42, 2)) * (1 - age)
              if (ring > 0.001) light += ring * 0.8
            }
            const alpha = dot.vertical * (0.05 + Math.min(1, light) * 0.85) * breathe * (dark ? 1 : 1.2)
            const level = Math.min(5, Math.floor(alpha * 7))
            buckets[level].push(dot.x, dot.y)
          }
          for (let level = 0; level < buckets.length; level += 1) {
            const bucket = buckets[level]
            if (bucket.length === 0) continue
            const alpha = 0.03 + level * 0.105
            context.fillStyle = 'rgba(' + ink + ', ' + alpha.toFixed(3) + ')'
            context.beginPath()
            for (let index = 0; index < bucket.length; index += 2) {
              context.moveTo(bucket[index] + fieldRadius, bucket[index + 1])
              context.arc(bucket[index], bucket[index + 1], fieldRadius, 0, TAU)
            }
            context.fill()
          }
        }

        const paintGroup = (paths, boost, color) => {
          for (let level = 0; level < LEVELS; level += 1) {
            const alpha = Math.min(1, (0.05 + (level / (LEVELS - 1)) * 0.5) * boost).toFixed(3)
            context.fillStyle = `rgba(${color}, ${alpha})`
            context.fill(paths[level])
          }
        }
        // The portrait's opacity nudge flips with the palette: +10% on the light
        // canvas, and its inverse trim on the dark one, where light dots already
        // read brighter against the canvas.
        paintGroup(portraitPaths, dark ? 1.15 : 1.8, ink)
        if (showText) {
          paintGroup(wordmarkPaths[0], dark ? 1 : 1.2, ink)
          paintGroup(wordmarkPaths[1], dark ? 1 : 1.2, '122, 170, 255')
        }
        if (DEBUG) {
          context.fillStyle = '#ff5555'
          context.font = '12px monospace'
          const readout = [
            'pitch=' + pitch.toFixed(2) + ' limit=' + limit.toFixed(0) + ' composerTop=' + composerTop.toFixed(0),
            'canvas=' + width.toFixed(0) + 'x' + height.toFixed(0) + ' dpr=' + dpr + ' showText=' + showText,
            'portrait=' + portraitW.toFixed(0) + 'x' + portraitH.toFixed(0)
              + ' @ ' + portraitX.toFixed(0) + ',' + portraitY.toFixed(0),
            'block=' + blockW.toFixed(0) + 'x' + blockH.toFixed(0)
              + ' @ ' + blockX.toFixed(0) + ',' + blockY.toFixed(0),
          ]
          readout.forEach((line, index) => context.fillText(line, 12, 20 + index * 16))
          context.strokeStyle = '#ff5555'
          context.strokeRect(portraitX - portraitW / 2, portraitY - portraitH / 2, portraitW, portraitH)
          context.strokeStyle = '#5599ff'
          context.strokeRect(blockX, blockY, blockW, blockH)
        }
        if (!reduced) frame = requestAnimationFrame(paint)
      }

      const observer = new ResizeObserver(() => {
        measure()
        if (reduced) paint(performance.now())
      })
      observer.observe(canvas)
      /** Focus inside the composer card lights the field around it. */
      const onFocusChange = () => {
        const active = document.activeElement
        composerFocused = active !== null && active !== document.body
          && typeof active.closest === 'function'
          && active.closest('[data-composer-card]') !== null
      }
      window.addEventListener('focusin', onFocusChange, { passive: true })
      window.addEventListener('focusout', onFocusChange, { passive: true })
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('pointerleave', onPointerLeave, { passive: true })
      window.addEventListener('pointerdown', onPointerDown, { passive: true })
      const refresh = () => {
        if (disposed) return
        cancelAnimationFrame(frame)
        frame = 0
        if (!document.hidden) frame = requestAnimationFrame(paint)
      }
      const onMotion = () => { reduced = motion.matches; refresh() }
      const themeObserver = new MutationObserver(refresh)
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
      const unsubscribeSettings = dcSubscribeSettings(refresh)
      motion.addEventListener('change', onMotion)
      document.addEventListener('visibilitychange', refresh)
      measure()
      refresh()

      return () => {
        disposed = true
        unsubscribeSettings()
        themeObserver.disconnect()
        motion.removeEventListener('change', onMotion)
        document.removeEventListener('visibilitychange', refresh)
        cancelAnimationFrame(frame)
        observer.disconnect()
        composerObserver.disconnect()
        window.removeEventListener('focusin', onFocusChange)
        window.removeEventListener('focusout', onFocusChange)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerleave', onPointerLeave)
        window.removeEventListener('pointerdown', onPointerDown)
      }
    }

    /**
     * Frame layer for the blank home: paint the dot mascot below the content and
     * pass the wrapped scroll body through untouched.
     * @param props - the home flag and the wrapped Conversation body.
     * @returns the layout-neutral frame.
     */
    function HeroFrame({ hero, children }) {
      const { values } = useDcSettings()
      const show = hero === true && values.hero
      const canvasRef = React.useRef(null)
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (!show || canvas === null) return undefined
        return attachMascot(canvas)
      }, [show])
      return h('div', { className: 'dwe-frame' },
        show ? h('div', { key: 'sign', className: 'dwe-sign' }, 'dsh-fish-ui') : null,
        show ? h('canvas', { key: 'mascot', ref: canvasRef, className: 'dwe-whale', 'aria-hidden': 'true' }) : null,
        children)
    }


    /* ---------------------------------------------------------------- styles */

const CSS = `
/* Hero frame layer: layout-neutral wrapper (display: contents keeps the wrapped
   scroll body a direct flex item) plus one canvas that sits above the
   Conversation background and below its content. */
.dwe-frame {
  display: contents;
}
.dwe-whale {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

/* One whale on the blank home: the official pixel whale would otherwise sit
   behind this dot field, so its canvas is hidden. It keeps its slot layer and
   still renders the wrapped content; only its artwork is suppressed. */
:root:has(canvas.dwe-whale) [data-home-whale] {
  display: none !important;
}

/* Blank-home headline: drop the headline copy and the brand mark
   beside it, leaving the dot portrait alone above the composer. The title group
   is a CSS-module class (matched by its local name inside the hash, scoped by
   the headline ancestor); the mark is the hero's own brand slot, matched by its
   public slot key. If upstream renames either hook the rule simply stops
   applying. */
:root:has(canvas.dwe-whale) [class*="headline"] [class*="titleGroup"],
:root:has(canvas.dwe-whale) [data-slot="conversation.hero.brand.mark"] {
  display: none !important;
}


/* Product signature: only while the blank home is on screen, because the
   element lives inside the hero frame layer. */
.dwe-sign {
  position: fixed;
  right: 14px;
  bottom: 10px;
  z-index: 2147483000;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--dsw-alias-label-tertiary);
  opacity: 0.28;
  pointer-events: none;
  user-select: none;
}

/* ------------------------------------------------------------------ accents */

/* Composer focus: the shipped 0.5px hairline turns whale blue and an inset ring
   thickens the edge. The inset shadow follows the card radius and costs no
   layout, and a focused draft editor is the only trigger — toolbar buttons
   inside the card keep the resting look. */
/* Frosted composer, but only where something interesting runs behind it: while a
   Session is open the messages scroll under the card, so glass reads as glass. On
   the blank home the card sits on flat dotted paper, where translucency only muddies
   the surface — there it keeps the shipped solid background. */
/* On the blank home the card must be fully opaque: the shipped menu surface is
   slightly translucent, so the wave field behind it would show through the card as
   moving light bands. */
/* The blank home keeps the card solid only when frosting is switched off. */
:root.dc-off-glass body:has(canvas.dwe-whale) [data-composer-card] {
  background: var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-1));
}

:root:not(.dc-off-glass) [data-composer-card] {
  /* Much more translucent than the host surface, with a stronger blur and a touch of
     saturation: the frosted look only reads if the backdrop is actually visible. */
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent),
      color-mix(in srgb, var(--dsw-alias-label-primary) 2%, transparent) 42%,
      transparent
    ),
    color-mix(in srgb, var(--dsw-specific-input-major, var(--dsw-alias-bg-layer-1)) 54%, transparent);
  -webkit-backdrop-filter: blur(26px) saturate(1.25);
  backdrop-filter: blur(26px) saturate(1.25);
}

/* Composer focus: a soft whale-blue ring fades in under the card's own hairline
   instead of recolouring it (a rebinding token switches instantly and reads as a
   pop). Both states declare the same shadow layers so the transition interpolates
   every layer, and the easing starts quickly and settles slowly. */
/* Focus ring in light grey: the composer is a text surface, so the highlight stays
   neutral and the accent colour is reserved for content. */
:root {
  --dc-focus-ink: 124, 128, 136;
}

body[data-ds-dark-theme] {
  --dc-focus-ink: 224, 226, 232;
}

:root:not(.dc-off-focusring) [data-composer-card] {
  box-shadow:
    var(--dsw-elevation-soft),
    inset 0 0 0 1px rgba(var(--dc-focus-ink), 0),
    0 0 0 0 rgba(var(--dc-focus-ink), 0),
    0 0 12px 0 rgba(var(--dc-focus-ink), 0),
    0 0 32px 2px rgba(var(--dc-focus-ink), 0);
  transition: box-shadow 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

:root:not(.dc-off-focusring) [data-composer-card]:has(:is([contenteditable="true"], [role="textbox"], textarea):focus) {
  box-shadow:
    var(--dsw-elevation-soft),
    inset 0 0 0 1.2px rgba(var(--dc-focus-ink), 0.92),
    0 0 0 3px rgba(var(--dc-focus-ink), 0.12),
    0 0 14px 1px rgba(var(--dc-focus-ink), 0.22),
    0 0 40px 6px rgba(var(--dc-focus-ink), 0.1);
}

/* --------------------------------------------------- frame-wide ambient layer */
.dc-overlay {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  pointer-events: none;
}

/* ------------------------------------------- composer stats in the button row */
.dc-stats {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 2px;
  color: var(--dsw-alias-label-tertiary);
  font-size: var(--dsh-content-font-size-secondary, 12px);
  font-variant-numeric: tabular-nums;
  line-height: 20px;
  white-space: nowrap;
  user-select: none;
}

.dc-stats-item {
  opacity: 0.85;
}


/* ---------------------------------------------- reasoning effort celebration */
body[data-ds-dark-theme] {
  --dc-effort-field: rgba(255, 255, 255, 0.8);
  --dc-effort-ink: rgba(255, 255, 255, 0.95);
  --dc-effort-glow: rgba(255, 255, 255, 0.6);
}

body:not([data-ds-dark-theme]) {
  --dc-effort-field: rgba(58, 62, 72, 0.55);
  --dc-effort-ink: rgba(22, 24, 28, 0.92);
  --dc-effort-glow: rgba(40, 44, 52, 0.4);
}

[data-composer-card] {
  position: relative;
  /* Own stacking context so the field can paint above the card surface but below its
     content without touching the host's children. */
  isolation: isolate;
}

[data-composer-card].dc-effort-on::before {
  content: '';
  position: absolute;
  left: 13%;
  right: 13%;
  bottom: 1px;
  height: 40px;
  z-index: -1;
  pointer-events: none;
  border-radius: 10px;
  opacity: 0.42;
  /* Two vertical highlight bars travel from the middle outwards while the model
     thinks; the third layer is the dot print itself. */
  background-image: linear-gradient(
      90deg,
      transparent 0%,
      var(--dc-effort-glow) 50%,
      transparent 100%
    ),
    linear-gradient(
      90deg,
      transparent 0%,
      var(--dc-effort-glow) 50%,
      transparent 100%
    ),
    radial-gradient(
      circle at 1px 1px,
      var(--dc-effort-field) 0.9px,
      transparent 1.15px
    );
  background-size: 0% 100%, 0% 100%, 4px 4px;
  background-repeat: no-repeat, no-repeat, repeat;
  background-position: 50% 50%, 50% 50%, 0 0;
  /* Fade the field out towards both edges so it reads as depth, not a band. */
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 26%, #000 74%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 26%, #000 74%, transparent 100%);
  clip-path: inset(0 50% 0 50%);
  animation: dc-effort-open 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

[data-composer-card].dc-effort-on::after {
  content: attr(data-dc-effort);
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 40px;
  z-index: 2;
  pointer-events: none;
  text-align: center;
  font: italic 900 30px / 40px "Segoe UI", system-ui, sans-serif;
  letter-spacing: 0.08em;
  background-image: radial-gradient(
    circle at 1px 1px,
    var(--dc-effort-ink) 0.95px,
    transparent 1.15px
  );
  background-size: 3px 3px;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  /* The shadow follows the dot alpha, so the word carries a soft halo. */
  filter:
    drop-shadow(0 0 5px rgba(255, 255, 255, 0.4))
    drop-shadow(0 0 16px rgba(255, 255, 255, 0.2));
  animation: dc-effort-word 620ms 740ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

[data-composer-card].dc-effort-max::after {
  background-image: radial-gradient(
    circle at 1px 1px,
    var(--dc-accent) 0.95px,
    transparent 1.15px
  );
  filter:
    drop-shadow(0 0 6px rgba(122, 170, 255, 0.75))
    drop-shadow(0 0 20px rgba(122, 170, 255, 0.45));
}

body:has([data-chat-running]) [data-composer-card].dc-effort-on::before {
  animation:
    dc-effort-open 800ms cubic-bezier(0.22, 1, 0.36, 1) forwards,
    dc-effort-spread 2.2s 900ms ease-out infinite;
}

@keyframes dc-effort-open {
  from { clip-path: inset(0 50% 0 50%); }
  to { clip-path: inset(0 0 0 0); }
}

@keyframes dc-effort-word {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes dc-effort-spread {
  0% {
    background-size: 12% 100%, 12% 100%, 4px 4px;
    background-position: 50% 50%, 50% 50%, 0 0;
  }
  100% {
    background-size: 12% 100%, 12% 100%, 4px 4px;
    background-position: 0% 50%, 100% 50%, 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-composer-card].dc-effort-on::before,
  [data-composer-card].dc-effort-on::after,
  body:has([data-chat-running]) [data-composer-card].dc-effort-on::before {
    animation: none;
    clip-path: inset(0 0 0 0);
    opacity: 1;
  }
}




/* ------------------------------------------------------------- startup splash */
.dc-splash {
  position: fixed;
  inset: 0;
  z-index: 2147483600;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050507;
  pointer-events: none;
  animation: dc-splash-out 460ms 1860ms cubic-bezier(0.4, 0, 1, 1) forwards;
  contain: strict;
}

/* Compositor-only animation: every property below is opacity or transform. */
.dc-splash-grid {
  position: absolute;
  inset: -2px;
  background-image: radial-gradient(circle at 1px 1px, rgba(186, 196, 214, 0.5) 0.9px, transparent 1.15px);
  background-size: 18px 18px;
  opacity: 0;
  will-change: opacity;
  animation: dc-splash-grid-in 620ms 60ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.dc-splash-ring {
  position: absolute;
  width: 108vmax;
  height: 108vmax;
  border: 1px solid rgba(176, 196, 232, 0.55);
  border-radius: 50%;
  opacity: 0;
  transform: scale(0.08);
  will-change: transform, opacity;
  animation: dc-splash-ring 900ms 60ms cubic-bezier(0.16, 0.84, 0.36, 1) forwards;
}

.dc-splash-mark {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08em;
  overflow: hidden;
}

.dc-splash-line {
  display: block;
  font: 800 clamp(38px, 7.8vw, 108px) / 1.14 "Segoe UI", system-ui, sans-serif;
  letter-spacing: 0.09em;
  color: transparent;
  background-size: 5px 5px;
  -webkit-background-clip: text;
  background-clip: text;
  opacity: 0;
  transform: translate3d(0, 14px, 0) scale(0.985);
  will-change: transform, opacity;
  animation: dc-splash-line 760ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.dc-splash-deepseek {
  background-image: radial-gradient(circle at 1px 1px, #eef0f4 1.1px, transparent 1.35px);
}

.dc-splash-harness {
  background-image: radial-gradient(circle at 1px 1px, #7aaaff 1.1px, transparent 1.35px);
  animation-delay: 170ms;
}

.dc-splash-sheen {
  position: absolute;
  top: -10%;
  bottom: -10%;
  left: 0;
  width: 34%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.42) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
  transform: translate3d(-120%, 0, 0);
  will-change: transform, opacity;
  animation: dc-splash-sheen 820ms 1080ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
}

.dc-splash-veil {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 46%, rgba(0, 0, 0, 0) 38%, rgba(0, 0, 0, 0.62) 100%),
    linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 26%);
}

@keyframes dc-splash-grid-in {
  to { opacity: 0.55; }
}

@keyframes dc-splash-ring {
  0% { opacity: 0; transform: scale(0.08); }
  30% { opacity: 0.5; }
  100% { opacity: 0; transform: scale(1.15); }
}

@keyframes dc-splash-line {
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

@keyframes dc-splash-sheen {
  0% { opacity: 0; transform: translate3d(-120%, 0, 0); }
  20% { opacity: 0.9; }
  100% { opacity: 0; transform: translate3d(300%, 0, 0); }
}

@keyframes dc-splash-out {
  to { opacity: 0; visibility: hidden; }
}

@media (prefers-reduced-motion: reduce) {
  .dc-splash,
  .dc-splash-grid,
  .dc-splash-ring,
  .dc-splash-line,
  .dc-splash-sheen {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* ------------------------------------------------------------ settings page */
.dc-set {
  max-width: 720px;
  padding: 4px 2px 24px;
  color: var(--dsw-alias-label-primary);
  font-synthesis: none;
}

.dc-set-group {
  margin: 0 0 22px;
  padding: 0 0 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}

.dc-set-group:last-of-type {
  border-bottom: 0;
}

.dc-set-group-title {
  margin: 0 0 6px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dc-set-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
}

.dc-set-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1 1 auto;
}

.dc-set-label {
  font-size: 14px;
  line-height: 1.4;
}

.dc-set-desc {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 1.45;
}

/* The control is an SVG capsule with a drawn circle knob, so the track ends are
   exact semicircles and the knob is an exact circle at any zoom. */
.dc-switch {
  flex: none;
  display: inline-flex;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: transparent;
  cursor: pointer;
}

.dc-switch:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, #7aaaff);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .dc-switch svg rect,
  .dc-switch svg g,
  .dc-switch svg circle {
    transition: none !important;
  }
}

.dc-set-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
}

.dc-set-reset {
  padding: 7px 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.dc-set-reset:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
}

.dc-set-note {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

/* -------------------------------------------------------- sidebar entry + sheet */
.dc-foot {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.dc-foot-button {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 10px;
  border: 0;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
}

.dc-foot-dots {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.dc-foot-button > :not(.dc-foot-dots) {
  position: relative;
  z-index: 1;
}

.dc-foot-button:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
  color: var(--dsw-alias-label-primary);
}

.dc-foot-button:focus-visible {
  outline: 2px solid var(--dsw-focus-ring-color, #7aaaff);
  outline-offset: 1px;
}

.dc-foot-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.dc-sheet-root {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
}

.dc-sheet-scrim {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.28);
}

.dc-sheet-panel {
  position: absolute;
  left: 14px;
  bottom: 78px;
  width: min(420px, calc(100vw - 28px));
  max-height: min(72vh, 640px);
  display: flex;
  flex-direction: column;
  border: 0;
  border-radius: 20px;
  /* Opaque on purpose: a raised surface layered over the base colour, so the panel is
     always solid and always uses the app's own palette instead of a hand-picked grey. */
  background-color: var(--dsw-alias-bg-base, #f6f6f8);
  background-image: linear-gradient(
    var(--dsw-alias-bg-layer-1, transparent),
    var(--dsw-alias-bg-layer-1, transparent)
  );
  box-shadow: var(--dsw-elevation-panel, 0 18px 48px rgba(0, 0, 0, 0.42));
  overflow: hidden;
  animation: dc-sheet-in 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes dc-sheet-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.dc-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}

.dc-sheet-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}

.dc-sheet-close {
  border: 0;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-size: 18px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 6px;
  cursor: pointer;
}

.dc-sheet-close:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.1));
  color: var(--dsw-alias-label-primary);
}

.dc-sheet-body {
  padding: 4px 16px 8px;
  overflow-y: auto;
}

@media (prefers-reduced-motion: reduce) {
  .dc-sheet-panel { animation: none; }
}
/* fish reading:start */
/* Deep Fish reading: semantic hooks only; never animate streamed text. */
body {
  --dc-accent: var(--dsw-alias-link);
  --dc-focus: color-mix(in srgb, var(--dc-accent) 18%, transparent);
}

:root:not(.dc-off-reading) [data-chat-flow-kind="assistant-step"]:not([data-chat-group-part="reasoning"]) :is(p, li) {
  line-height: 1.85;
  text-wrap: pretty;
}
:root:not(.dc-off-reading) [data-chat-flow-kind="assistant-step"] :is(h1, h2, h3, h4) {
  color: var(--dsw-alias-label-primary);
  letter-spacing: -0.015em;
  line-height: 1.45;
  text-wrap: balance;
}
:root:not(.dc-off-reading) [data-chat-flow-kind="assistant-step"] :is(h2, h3) {
  padding-block-start: 0.25em;
}
:root:not(.dc-off-reading) [data-chat-flow-kind="assistant-step"] blockquote {
  border-inline-start: 2px solid color-mix(in srgb, var(--dc-accent) 38%, transparent);
  padding-inline-start: 1em;
  color: var(--dsw-alias-label-secondary);
}
:root:not(.dc-off-reading) [data-chat-flow-kind="assistant-step"] :is(p, li) > code {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
  border-radius: 4px;
  padding: 0.12em 0.35em;
}
:root:not(.dc-off-code) [data-chat-flow-kind="assistant-step"] pre {
  font-variant-ligatures: none;
  tab-size: 2;
}
/* Sidebar brand: the whale mark and the product name carry a quiet halo so they read as
   part of the same light as the accent. */
[data-slot="sidebar.brand.mark"] {
  filter:
    drop-shadow(0 0 5px color-mix(in srgb, var(--dc-accent) 50%, transparent))
    drop-shadow(0 0 16px color-mix(in srgb, var(--dc-accent) 26%, transparent));
}

[data-slot="sidebar.brand.name"] {
  text-shadow:
    0 0 1px color-mix(in srgb, var(--dc-accent) 42%, transparent),
    0 0 9px color-mix(in srgb, var(--dc-accent) 34%, transparent),
    0 0 22px color-mix(in srgb, var(--dc-accent) 18%, transparent);
}

/* User messages carry a whale-blue halo: a hairline ring plus two soft halos. */
[data-message-bubble] {
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--dc-accent) 52%, transparent),
    0 0 14px 1px color-mix(in srgb, var(--dc-accent) 22%, transparent),
    0 0 38px 8px color-mix(in srgb, var(--dc-accent) 10%, transparent);
}

/* Selected conversation: a flat black plate in dark theme instead of the host's
   translucent hover fill. */
body[data-ds-dark-theme] [class*="_sessionRow"][class*="_selected"] {
  background-color: #0d0d10;
}

body:not([data-ds-dark-theme]) [class*="_sessionRow"][class*="_selected"] {
  background-color: #e9e9ec;
}

:root:not(.dc-off-bold) [data-chat-flow-kind="assistant-step"] :is(p, li, td, blockquote) :is(strong, b) {
  color: var(--dc-accent);
  /* A soft halo so the accent reads as light rather than paint. */
  text-shadow:
    0 0 1px color-mix(in srgb, var(--dc-accent) 55%, transparent),
    0 0 8px color-mix(in srgb, var(--dc-accent) 42%, transparent),
    0 0 20px color-mix(in srgb, var(--dc-accent) 22%, transparent);
}
:root:not(.dc-off-thinkinglabel) [data-chat-running] [class*="_runningText"] {
  opacity: 0;
}
:root:not(.dc-off-thinkingsphere) [data-chat-running] [class*="_runningIcon"] {
  display: none;
}

/* Compact figures leave submit reachable in a narrow composer. */
.dc-stats {
  gap: 10px;
  font-size: 11px;
  letter-spacing: 0.015em;
  font-variant-numeric: tabular-nums;
}
.dc-stats-label {
  margin-inline-end: 4px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 9px;
  letter-spacing: 0.06em;
}
.dc-stats-item { color: var(--dsw-alias-label-secondary); }
@media (max-width: 640px) {
  .dc-stats-label { display: none; }
  .dc-stats { gap: 6px; }
}
@media (max-width: 420px) {
  .dc-stats-output { display: none; }
}
.dc-switch:disabled { cursor: default; opacity: 0.48; }
.dc-set-reset:disabled { cursor: default; opacity: 0.48; }
.dc-settings-status {
  margin: 0 0 16px;
  font-size: 12px;
  color: var(--dsw-alias-label-secondary);
}
.dc-settings-status[role="alert"] { color: var(--dsw-alias-state-error-primary); }
@media (prefers-reduced-motion: reduce) {
  .dc-sheet-panel, .dc-sheet-scrim { animation: none; }
  [data-composer-card] { transition: none !important; }
}

/* fish reading:end */
`

    /* fish indicator:start */
    /**
     * Dot sphere and English status label.
     *
     * The host text keeps the real clock, so we read the elapsed seconds out of it and
     * redraw both the words and a sweeping highlight on our own overlay canvas. The host
     * label is hidden by `reading.css` while this is on; turning it off restores the host
     * row untouched and only parks the sphere to the left of the visible text.
     */
    function DcOverlay() {
      const canvasRef = React.useRef(null)
      const settings = useDcSettings()
      const sphereOn = settings.values.thinkingSphere !== false
      const labelOn = settings.values.thinkingLabel !== false
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const context = canvas.getContext('2d')
        if (!context) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        // Wall clock anchor. The host may remount its row on every tick, so an element
        // keyed start time resets constantly; a single anchor survives those remounts
        // and is dropped as soon as the row leaves the document.
        const clock = { since: 0 }
        let frame = 0
        let stopped = false
        const clear = () => context.clearRect(0, 0, canvas.width, canvas.height)

        // The hidden host text cannot be trusted for the clock (its digits are not the
        // elapsed value), so the label counts wall time from when the running row first
        // appeared and restarts whenever the row leaves the document.
        const elapsedOf = (now) => {
          if (clock.since === 0) clock.since = now
          return Math.max(0, Math.round((now - clock.since) / 1000))
        }

        const drawSphere = (cx, cy, spin, ink) => {
          // Two batched passes: a soft halo under a crisp core, so the sphere reads as
          // light instead of loose dots. Only 42 dots, so buckets are cheap.
          const points = []
          for (let index = 0; index < 42; index += 1) {
            const v = 1 - (2 * (index + 0.5)) / 42
            const ring = Math.sqrt(1 - v * v)
            const angle = index * 2.39996323 + spin
            const depth = Math.sin(angle) * ring
            points.push({
              x: cx + Math.cos(angle) * ring * 8,
              y: cy + v * 8,
              alpha: 0.25 + (depth + 1) * 0.32,
              radius: 0.8 + (depth + 1) * 0.35,
            })
          }
          context.fillStyle = ink
          const passes = [
            { grow: 2.1, scale: 0.28 },
            { grow: 1, scale: 1 },
          ]
          for (const pass of passes) {
            const buckets = new Map()
            for (const point of points) {
              const alpha = point.alpha * pass.scale
              if (alpha < 0.02) continue
              const level = Math.min(10, Math.max(1, Math.round(alpha * 10)))
              let bucket = buckets.get(level)
              if (bucket === undefined) {
                bucket = new Path2D()
                buckets.set(level, bucket)
              }
              const radius = point.radius * pass.grow
              bucket.moveTo(point.x + radius, point.y)
              bucket.arc(point.x, point.y, radius, 0, Math.PI * 2)
            }
            for (const [level, path] of buckets) {
              context.globalAlpha = level / 10
              context.fill(path)
            }
          }
          context.globalAlpha = 1
        }

        const drawLabel = (row, label, x, cy, seconds, now, ink) => {
          const style = getComputedStyle(label)
          const font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily
          context.font = font
          context.textBaseline = 'middle'
          const text = 'Deep thinking for ' + seconds + 's. . .'
          const width = context.measureText(text).width
          const accent = (getComputedStyle(row).getPropertyValue('--dc-accent') || '').trim() || '#7aaaff'
          const band = motion.matches ? -1e4 : ((now % 2600) / 2600) * (width + 140) - 70
          context.save()
          context.beginPath()
          context.rect(x - 2, cy - 20, width + 4, 40)
          context.clip()
          context.fillStyle = ink
          context.globalAlpha = 0.92
          context.fillText(text, x, cy)
          context.globalAlpha = 1
          const gradient = context.createLinearGradient(x + band - 70, 0, x + band + 70, 0)
          gradient.addColorStop(0, 'rgba(122, 170, 255, 0)')
          gradient.addColorStop(0.5, accent)
          gradient.addColorStop(1, 'rgba(122, 170, 255, 0)')
          context.fillStyle = gradient
          context.fillText(text, x, cy)
          context.restore()
        }

        const paint = now => {
          frame = 0
          if (stopped || document.hidden) return
          const dpr = Math.min(2, devicePixelRatio || 1)
          const width = innerWidth
          const height = innerHeight
          if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
          }
          clear()
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          const card = document.querySelector('[data-composer-card]')
          const cardTop = card === null ? height : card.getBoundingClientRect().top
          const spin = motion.matches ? 0.35 : now / 1800
          const running = document.querySelectorAll('[data-chat-running]')
          if (running.length === 0) clock.since = 0
          let visible = false
          for (const row of document.querySelectorAll('[data-chat-running]:not([data-holding])')) {
            const bounds = row.getBoundingClientRect()
            if (bounds.height === 0 || bounds.top < 0 || bounds.bottom > height) continue
            // The overlay paints above every column: never let the sphere or the label
            // sit over the composer card.
            if (bounds.bottom + 2 > cardTop) continue
            const label = row.querySelector('[class*="_runningText"]')
            if (label === null) continue
            const labelRect = label.getBoundingClientRect()
            const ink = getComputedStyle(label).color || 'rgb(200, 205, 215)'
            const size = 24
            let cx
            let cy
            if (labelOn) {
              cx = bounds.left + 2 + size / 2
              cy = bounds.top + Math.min(bounds.height, 30) / 2
            } else {
              if (labelRect.width === 0) continue
              // Keep clear of the host words: park the sphere in the gutter to their left.
              cx = Math.max(size / 2 + 6, labelRect.left - size / 2 - 8)
              cy = labelRect.top + labelRect.height / 2
            }
            visible = true
            if (sphereOn) drawSphere(cx, cy, spin, ink)
            if (labelOn) {
              const seconds = elapsedOf(now)
              const x = bounds.left + 2 + (sphereOn ? size + 8 : 0)
              drawLabel(row, label, x, cy, seconds, now, ink)
            }
          }
          if (visible && !motion.matches) frame = requestAnimationFrame(paint)
        }

        const refresh = () => {
          if (frame) cancelAnimationFrame(frame)
          frame = 0
          if (document.hidden) clear()
          else frame = requestAnimationFrame(paint)
        }
        const observer = new MutationObserver(refresh)
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          characterData: true,
          attributes: true,
          attributeFilter: ['data-holding', 'data-ds-dark-theme'],
        })
        window.addEventListener('resize', refresh)
        document.addEventListener('scroll', refresh, true)
        document.addEventListener('visibilitychange', refresh)
        motion.addEventListener('change', refresh)
        refresh()
        return () => {
          stopped = true
          cancelAnimationFrame(frame)
          observer.disconnect()
          window.removeEventListener('resize', refresh)
          document.removeEventListener('scroll', refresh, true)
          document.removeEventListener('visibilitychange', refresh)
          motion.removeEventListener('change', refresh)
        }
      }, [sphereOn, labelOn])
      return sphereOn || labelOn
        ? h('canvas', { ref: canvasRef, className: 'dc-overlay', 'aria-hidden': 'true' })
        : null
    }

/* fish indicator:end */

    /** Compact session stats for the composer button row. */
    function DcStats(props) {
      const { values } = useDcSettings()
      const usage = props.useProjection('tokenUsage')
      const pressure = props.useProjection('contextPressure')
      if (!values.stats) return null
      const billed = usage === undefined || usage === null
        ? 0
        : (usage.uncachedInputTokens || 0) + (usage.cacheReadTokens || 0)
          + (usage.cacheWriteTokens || 0) + (usage.outputTokens || 0)
      const used = pressure === undefined || pressure === null
        ? undefined
        : (pressure.projectedTokens !== undefined ? pressure.projectedTokens : pressure.pressureTokens)
      const windowSize = pressure === undefined || pressure === null ? undefined : pressure.contextWindow
      const percent = used === undefined || windowSize === undefined || windowSize === 0
        ? null
        : Math.max(0, Math.min(100, Math.round((used / windowSize) * 100)))
      if (billed === 0 && percent === null) return null
      const tokens = billed >= 1e6
        ? (billed / 1e6).toFixed(1) + 'm'
        : billed >= 1e3
          ? (billed / 1e3).toFixed(1) + 'k'
          : String(billed)
      return h('span', { className: 'dc-stats' }, [
        percent === null
          ? null
          : h('span', { key: 'ctx', className: 'dc-stats-item', title: dcUsesChinese() ? '上下文占用' : 'Context usage' }, [h('span', { key: 'label', className: 'dc-stats-label' }, 'CTX'), percent + '%']),
        billed === 0
          ? null
          : h('span', { key: 'tok', className: 'dc-stats-item dc-stats-output', title: dcUsesChinese() ? '累计 Token 用量' : 'Cumulative token usage' }, [h('span', { key: 'label', className: 'dc-stats-label' }, 'TOK'), tokens]),
      ])
    }

    /**
     * Hover dot field for every rows in the sidebar.
     *
     * No nodes are injected into host buttons: a single fixed canvas tracks the pointer,
     * finds the sidebar button under it, and prints a dot field clipped to that button.
     */
    function DcSidebarDots() {
      const canvasRef = React.useRef(null)
      const { values } = useDcSettings()
      const showDots = values.sidebarDots !== false
      const showRail = values.sidebarRail !== false
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) return
        const context = canvas.getContext('2d')
        if (context === null) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        const state = {
          row: null,
          x: 0,
          y: 0,
          inside: false,
          rail: false,
          alpha: 0,
          frame: 0,
          live: false,
          dirty: false,
        }
        let stopped = false
        let dpr = Math.min(2, devicePixelRatio || 1)
        let rootCache = null

        // The sidebar column itself is the scope: walk up from our footer button to the
        // column landmark, once, and only light controls inside it. A lowest-common-ancestor
        // guess leaked into the chat column and put rails on every button in the app.
        const sidebarScope = () => {
          if (rootCache !== null && rootCache.isConnected) return rootCache
          const foot = document.querySelector('.dc-foot-button')
          if (foot === null) return null
          let node = foot
          for (let depth = 0; depth < 10; depth += 1) {
            node = node.parentElement
            if (node === null) break
            if (node.matches('aside, [data-slot="sidebar"], [data-sidebar], [role="navigation"]')) {
              rootCache = node
              return node
            }
          }
          // No landmark: take the column wrapper a few levels up as a best effort.
          let fallback = foot
          for (let depth = 0; depth < 5 && fallback.parentElement !== null; depth += 1) {
            fallback = fallback.parentElement
          }
          rootCache = fallback
          return fallback
        }

        const paint = () => {
          state.frame = 0
          if (stopped) return
          const width = innerWidth
          const height = innerHeight
          if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
          }
          const target = state.inside ? 1 : 0
          state.alpha = motion.matches ? target : state.alpha + (target - state.alpha) * 0.22
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          if (!state.inside && state.alpha < 0.02) {
            state.alpha = 0
            state.live = false
            return
          }
          if (state.row === null || !state.row.isConnected) {
            state.inside = false
            state.live = false
            return
          }
          const rect = state.row.getBoundingClientRect()
          if (rect.width < 8 || rect.height < 8 || rect.bottom < 0 || rect.top > height) {
            state.live = false
            return
          }
          const style = getComputedStyle(state.row)
          const radius = parseFloat(style.borderTopLeftRadius) || 8
          const accent = (style.getPropertyValue('--dc-accent') || '').trim() || '#7aa4ff'
          const reach = 74
          context.save()
          context.beginPath()
          if (typeof context.roundRect === 'function') {
            context.roundRect(rect.left, rect.top, rect.width, rect.height, radius)
          } else {
            context.rect(rect.left, rect.top, rect.width, rect.height)
          }
          context.clip()
          context.fillStyle = accent
          if (showDots) {
          const startX = Math.floor(rect.left / 4) * 4 + 2
          const startY = Math.floor(rect.top / 4) * 4 + 2
          for (let y = startY; y < rect.bottom; y += 4) {
            for (let x = startX; x < rect.right; x += 4) {
              const dx = x - state.x
              const dy = y - state.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > reach) continue
              const alpha = Math.pow(1 - distance / reach, 1.35) * state.alpha * 0.72
              if (alpha < 0.02) continue
              context.globalAlpha = Math.min(1, alpha)
              context.beginPath()
              context.arc(x, y, 0.85, 0, Math.PI * 2)
              context.fill()
            }
          }
          }
          // A short whale-blue rail marks the hovered control — buttons only.
          if (state.rail && showRail) {
            const railWidth = 3
            const railInset = 5
            const railHeight = Math.max(6, rect.height - railInset * 2)
            const railTop = rect.top + (rect.height - railHeight) / 2
            context.globalAlpha = Math.min(1, state.alpha * 0.9)
            context.beginPath()
            if (typeof context.roundRect === 'function') {
              context.roundRect(rect.left + 2, railTop, railWidth, railHeight, 1.5)
            } else {
              context.rect(rect.left + 2, railTop, railWidth, railHeight)
            }
            context.fill()
          }
          context.restore()
          context.globalAlpha = 1
          const moving = state.dirty
          state.dirty = false
          if (motion.matches) {
            if (!state.inside) {
              context.clearRect(0, 0, width, height)
              state.alpha = 0
            }
            state.live = false
            return
          }
          if (state.inside && state.alpha >= 0.98 && !moving) {
            state.live = false
            return
          }
          if (state.inside || state.alpha >= 0.02) {
            state.frame = requestAnimationFrame(paint)
          } else {
            state.live = false
          }
        }

        const wake = () => {
          if (stopped || state.live) return
          state.live = true
          if (state.frame === 0) state.frame = requestAnimationFrame(paint)
        }

        const onMove = event => {
          const target = event.target instanceof Element
            ? event.target.closest('button, a, [role="button"]')
            : null
          const scope = sidebarScope()
          const insideSidebar = target !== null
            && scope !== null
            && scope.contains(target)
            && !target.closest('.dc-foot')
          if (!insideSidebar) {
            if (state.inside) {
              state.inside = false
              state.row = null
              wake()
            }
            return
          }
          state.row = target
          state.rail = target.matches('button')
          state.x = event.clientX
          state.y = event.clientY
          state.inside = true
          state.dirty = true
          wake()
        }

        const onLeave = () => {
          if (!state.inside) return
          state.inside = false
          state.row = null
          wake()
        }

        document.addEventListener('pointermove', onMove, { passive: true })
        document.addEventListener('pointerleave', onLeave)
        window.addEventListener('blur', onLeave)
        window.addEventListener('resize', wake)
        return () => {
          stopped = true
          document.removeEventListener('pointermove', onMove)
          document.removeEventListener('pointerleave', onLeave)
          window.removeEventListener('blur', onLeave)
          window.removeEventListener('resize', wake)
          if (state.frame !== 0) cancelAnimationFrame(state.frame)
          state.frame = 0
          state.live = false
        }
      }, [showDots, showRail])
      return showDots || showRail
        ? h('canvas', { ref: canvasRef, className: 'dc-overlay', 'aria-hidden': 'true' })
        : null
    }

    /**
     * Dot trail behind the composer caret.
     *
     * The caret itself is host-owned, so we only read its position (collapsed selection
     * range inside the active composer) and print a fading line of dots behind it on our
     * overlay canvas, clipped to the composer card. Dots never move once printed; they only
     * fade.
     */
    function DcCaretTrail() {
      const canvasRef = React.useRef(null)
      React.useEffect(() => {
        const canvas = canvasRef.current
        if (canvas === null) return
        const context = canvas.getContext('2d')
        if (context === null) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        if (motion.matches) return undefined
        const trail = []
        const LIFE = 650
        const STEP = 3
        let stopped = false
        let frame = 0
        let last = null
        let trailCard = null
        let dpr = Math.min(2, devicePixelRatio || 1)

        // A caret (or an IME composition) has no reliable box of its own, so every
        // measurement falls back to the text or element next to the insertion point.
        const rectAt = (container, offset) => {
          if (container === null) return null
          const range = document.createRange()
          try {
            range.setStart(container, offset)
            range.collapse(true)
          } catch (error) {
            return null
          }
          const collapsed = range.getBoundingClientRect()
          if (collapsed.height > 0 && (collapsed.left > 0 || collapsed.top > 0)) {
            return { left: collapsed.left, top: collapsed.top, height: collapsed.height }
          }
          const measure = (node, side) => {
            if (node === null) return null
            const inner = document.createRange()
            inner.selectNodeContents(node)
            const box = inner.getBoundingClientRect()
            if (box.height === 0) return null
            return { left: side === 'end' ? box.right : box.left, top: box.top, height: box.height }
          }
          if (container.nodeType === 3) {
            const text = container.textContent || ''
            if (offset > 0) {
              const inner = document.createRange()
              inner.setStart(container, offset - 1)
              inner.setEnd(container, offset)
              const box = inner.getBoundingClientRect()
              if (box.height > 0) return { left: box.right, top: box.top, height: box.height }
            }
            if (text.length > 0) {
              const inner = document.createRange()
              inner.setStart(container, 0)
              inner.setEnd(container, 1)
              const box = inner.getBoundingClientRect()
              if (box.height > 0) return { left: box.left, top: box.top, height: box.height }
            }
            return null
          }
          if (container.nodeType === 1) {
            const children = container.childNodes
            return measure(offset > 0 ? children[offset - 1] : null, 'end')
              || measure(offset < children.length ? children[offset] : null, 'start')
          }
          return null
        }

        const caretOf = () => {
          const active = document.activeElement
          if (active === null || typeof active.closest !== 'function') return null
          const card = active.closest('[data-composer-card]')
          if (card === null) return null
          const editable = active.isContentEditable
            ? active
            : active.closest('[contenteditable], [role="textbox"], textarea')
          if (editable === null || !card.contains(editable)) return null
          const selection = window.getSelection()
          if (selection === null || selection.rangeCount === 0) return null
          // While an IME composes, the selection covers the composition text; the caret
          // sits at its focus end, so measure there instead of bailing out.
          const container = selection.isCollapsed ? selection.anchorNode : selection.focusNode
          const offset = selection.isCollapsed ? selection.anchorOffset : selection.focusOffset
          if (container === null) return null
          if (container !== active && !active.contains(container)) return null
          const rect = rectAt(container, offset)
          if (rect === null || rect.height === 0) return null
          return { x: rect.left, y: rect.top, height: rect.height, card }
        }

        const push = (from, to, now) => {
          const deviceX = to.x - from.x
          const deviceY = to.y - from.y
          const distance = Math.sqrt(deviceX * deviceX + deviceY * deviceY)
          if (distance < 1.5) return
          // A line wrap or a jump to another spot is not a trail; only same-line motion is.
          if (distance > 90 || Math.abs(deviceY) > 6) return
          const topFrom = from.y
          const topTo = to.y
          const steps = Math.max(1, Math.min(40, Math.round(distance / STEP)))
          for (let index = 1; index <= steps; index += 1) {
            const t = index / steps
            trail.push({
              x: from.x + deviceX * t,
              y: topFrom + (topTo - topFrom) * t,
              height: to.height || 18,
              born: now - (steps - index) * 6,
            })
          }
          while (trail.length > 220) trail.shift()
        }

        const sample = () => {
          const caret = caretOf()
          if (caret === null) {
            last = null
            trailCard = null
            return
          }
          trailCard = caret.card
          const now = performance.now()
          if (last !== null) {
            const sameCard = last.card === caret.card
            if (sameCard) push({ x: last.x, y: last.y, height: last.height }, caret, now)
          }
          last = { x: caret.x, y: caret.y, height: caret.height, card: caret.card }
          wake()
        }

        const paint = () => {
          frame = 0
          if (stopped) return
          const width = innerWidth
          const height = innerHeight
          if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
          }
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          const now = performance.now()
          while (trail.length > 0 && now - trail[0].born > LIFE) trail.shift()
          if (trail.length === 0) {
            trailCard = null
            return
          }
          const card = trailCard
          let clip = null
          let radius = 12
          if (card !== null && card.isConnected) {
            clip = card.getBoundingClientRect()
            const style = getComputedStyle(card)
            radius = parseFloat(style.borderTopLeftRadius) || 12
          }
          const accent = (getComputedStyle(document.body).getPropertyValue('--dc-accent') || '').trim() || '#7aa4ff'
          context.save()
          if (clip !== null) {
            context.beginPath()
            if (typeof context.roundRect === 'function') {
              context.roundRect(clip.left, clip.top, clip.width, clip.height, radius)
            } else {
              context.rect(clip.left, clip.top, clip.width, clip.height)
            }
            context.clip()
          }
          // Collect every dot once, then paint a soft halo pass and a crisp pass in
          // batches: per-dot fills with shadows would crawl.
          const dots = []
          for (const point of trail) {
            const age = (now - point.born) / LIFE
            if (age >= 1) continue
            const alpha = Math.pow(1 - age, 1.4) * 0.85
            if (alpha < 0.02) continue
            for (let offset = 1; offset < point.height - 0.5; offset += 3) {
              dots.push(point.x, point.y + offset, alpha)
            }
          }
          context.fillStyle = accent
          const passes = [
            { radius: 2.4, scale: 0.3 },
            { radius: 1.05, scale: 1 },
          ]
          for (const pass of passes) {
            const buckets = new Map()
            for (let index = 0; index < dots.length; index += 3) {
              const alpha = dots[index + 2] * pass.scale
              if (alpha < 0.02) continue
              const level = Math.min(10, Math.max(1, Math.round(alpha * 10)))
              let bucket = buckets.get(level)
              if (bucket === undefined) {
                bucket = new Path2D()
                buckets.set(level, bucket)
              }
              bucket.moveTo(dots[index] + pass.radius, dots[index + 1])
              bucket.arc(dots[index], dots[index + 1], pass.radius, 0, Math.PI * 2)
            }
            for (const [level, path] of buckets) {
              context.globalAlpha = level / 10
              context.fill(path)
            }
          }
          context.restore()
          context.globalAlpha = 1
          frame = requestAnimationFrame(paint)
        }

        const wake = () => {
          if (stopped || frame !== 0) return
          frame = requestAnimationFrame(paint)
        }

        window.__dcCaretProbe = () => {
          const caret = caretOf()
          return caret === null
            ? { ok: false, active: document.activeElement ? document.activeElement.tagName : null }
            : { ok: true, x: Math.round(caret.x), y: Math.round(caret.y), height: Math.round(caret.height) }
        }
        const onActivity = () => sample()
        document.addEventListener('selectionchange', onActivity)
        document.addEventListener('input', onActivity, true)
        document.addEventListener('beforeinput', onActivity, true)
        document.addEventListener('compositionupdate', onActivity, true)
        document.addEventListener('keyup', onActivity, true)
        document.addEventListener('click', onActivity, true)
        document.addEventListener('pointerup', onActivity, true)
        window.addEventListener('resize', wake)
        return () => {
          stopped = true
          document.removeEventListener('selectionchange', onActivity)
          document.removeEventListener('input', onActivity, true)
          document.removeEventListener('beforeinput', onActivity, true)
          document.removeEventListener('compositionupdate', onActivity, true)
          document.removeEventListener('keyup', onActivity, true)
          document.removeEventListener('click', onActivity, true)
          document.removeEventListener('pointerup', onActivity, true)
          window.removeEventListener('resize', wake)
          if (frame !== 0) cancelAnimationFrame(frame)
          frame = 0
          trail.length = 0
        }
      }, [])
      return h('canvas', {
        ref: canvasRef,
        className: 'dc-overlay dc-caret-layer',
        'aria-hidden': 'true',
        style: { zIndex: 2147483000 },
      })
    }

    /**
     * Reasoning effort badge, done entirely in CSS.
     *
     * We only read the effort label and stamp two attributes on the composer card; the
     * unfolding dot field and the dot-printed level name are pseudo-elements, so there is no
     * canvas geometry to measure and nothing to drift when the layout changes.
     */
    const DC_EFFORT_OFF = /^(off|none|disabled?|无|关闭)$/i

    function dcEffortLabel() {
      const card = document.querySelector('[data-composer-card]')
      if (card === null) return null
      const node = card.querySelector('[class*="_triggerEffort"]')
      if (node === null) return null
      const text = (node.textContent || '').trim()
      return text === '' ? null : text
    }

    function dcPaintEffort(label) {
      const card = document.querySelector('[data-composer-card]')
      if (card === null) return
      if (label === null) {
        card.removeAttribute('data-dc-effort')
        card.classList.remove('dc-effort-on', 'dc-effort-max')
        return
      }
      const word = label.toUpperCase()
      const changed = card.getAttribute('data-dc-effort') !== word
      card.setAttribute('data-dc-effort', word)
      card.classList.toggle('dc-effort-max', word === 'MAX')
      if (changed) {
        // Toggle the class off and on so the CSS animation replays for the new word.
        card.classList.remove('dc-effort-on')
        void card.offsetWidth
        card.classList.add('dc-effort-on')
      } else if (!card.classList.contains('dc-effort-on')) {
        card.classList.add('dc-effort-on')
      }
    }

    /**
     * Startup splash: the dot wordmark over the boot screen.
     *
     * The whole animation is CSS transform/opacity so the compositor drives it: no canvas,
     * no per-frame JavaScript while the app is still booting.
     */
    function dcPlaySplash() {
      if (window.__dcSplashPlayed === true) return
      window.__dcSplashPlayed = true
      try {
        if (typeof document === 'undefined' || document.body === null) return
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const layer = document.createElement('div')
        layer.className = 'dc-splash'
        layer.setAttribute('aria-hidden', 'true')
        const grid = document.createElement('div')
        grid.className = 'dc-splash-grid'
        const ring = document.createElement('div')
        ring.className = 'dc-splash-ring'
        const mark = document.createElement('div')
        mark.className = 'dc-splash-mark'
        const deepseek = document.createElement('span')
        deepseek.className = 'dc-splash-line dc-splash-deepseek'
        deepseek.textContent = 'deepseek'
        const harness = document.createElement('span')
        harness.className = 'dc-splash-line dc-splash-harness'
        harness.textContent = 'harness'
        const sheen = document.createElement('div')
        sheen.className = 'dc-splash-sheen'
        mark.append(deepseek, harness, sheen)
        const veil = document.createElement('div')
        veil.className = 'dc-splash-veil'
        layer.append(grid, ring, mark, veil)
        document.body.appendChild(layer)
        const remove = () => {
          if (layer.isConnected) layer.remove()
        }
        layer.addEventListener('animationend', event => {
          if (event.animationName === 'dc-splash-out') remove()
        })
        setTimeout(remove, 3200)
      } catch (error) {
        console.warn('[dsh-fish-ui] splash failed', error)
      }
    }

    /* fish runtime:start */
    // Profile settings and token layers; embedded into client.js by build-runtime.mjs.
    const DC_SETTINGS_KEY = 'dsh-fish-ui:settings'
    const DC_DEFAULT_SETTINGS = Object.freeze(Object.fromEntries([
      'hero', 'field', 'wave', 'ripple', 'thinkingSphere', 'thinkingLabel',
      'glass', 'effortBadge', 'sidebarDots', 'sidebarRail', 'bold', 'focusRing', 'diff',
      'reading', 'code', 'fishFont', 'fishGlow', 'fishMotion', 'fishCode',
    ].map(key => [key, true])))
    const DC_OFF_CLASS = Object.freeze(Object.fromEntries(Object.keys(DC_DEFAULT_SETTINGS)
      .map(key => [key, 'dc-off-' + key.toLowerCase()])))
    const dcSettingsListeners = new Set()
    let dcSettings = DC_DEFAULT_SETTINGS
    let dcSnapshot = { values: dcSettings, status: 'loading', writable: false, pending: false, error: '' }
    let dcWrite = null
    let dcSettingsOwner = null
    let dcTheme = null
    let dcThemeLayers = new Map()
    let dcMounted = false

    const dcReadLegacy = () => {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(DC_SETTINGS_KEY))
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return null
        const values = Object.fromEntries(Object.keys(DC_DEFAULT_SETTINGS)
          .filter(key => typeof parsed[key] === 'boolean').map(key => [key, parsed[key]]))
        return Object.keys(values).length ? values : null
      } catch { return null }
    }
    const dcLegacy = dcReadLegacy()
    dcSettings = Object.freeze({ ...DC_DEFAULT_SETTINGS, ...dcLegacy })
    dcSnapshot = { ...dcSnapshot, values: dcSettings }
    const dcSubscribeSettings = listener => {
      dcSettingsListeners.add(listener)
      return () => dcSettingsListeners.delete(listener)
    }
    const dcGetSnapshot = () => dcSnapshot
    const useDcSettings = () => React.useSyncExternalStore(dcSubscribeSettings, dcGetSnapshot, dcGetSnapshot)
    const dcModes = (light, dark) => ({ light, dark })
    const DC_CODE = {
      '--shiki-token-constant': dcModes('#2562A5', '#92BEF4'),
      '--shiki-token-string': dcModes('#326B55', '#A5CCB8'),
      '--shiki-token-comment': dcModes('#657287', '#8E9BAF'),
      '--shiki-token-keyword': dcModes('#765795', '#C0ACD8'),
      '--shiki-token-parameter': dcModes('#956032', '#D8B18A'),
      '--shiki-token-function': dcModes('#406A9D', '#A7C8F2'),
      '--shiki-token-string-expression': dcModes('#326B55', '#A5CCB8'),
      '--shiki-token-punctuation': dcModes('#546377', '#A6B2C4'),
      '--shiki-token-link': dcModes('#3269B7', '#8AB6FA'),
    }
    const DC_DIFF = {
      '--dsw-alias-file-diff-added-bg': dcModes('rgb(58 117 196 / 9%)', 'rgb(122 170 255 / 12%)'),
      '--dsw-alias-file-diff-added-gutter': dcModes('rgb(58 117 196 / 6%)', 'rgb(122 170 255 / 7%)'),
      '--dsw-alias-file-diff-added-marker': dcModes('#3269B7', '#8AB6FA'),
      '--dsw-alias-file-diff-deleted-bg': dcModes('rgb(164 97 83 / 9%)', 'rgb(213 156 139 / 10%)'),
      '--dsw-alias-file-diff-deleted-gutter': dcModes('rgb(164 97 83 / 6%)', 'rgb(213 156 139 / 6%)'),
      '--dsw-alias-file-diff-deleted-marker': dcModes('#995C50', '#D4A18F'),
      '--dsw-alias-code-diff-added': dcModes('rgb(58 117 196 / 10%)', 'rgb(122 170 255 / 13%)'),
      '--dsw-alias-code-diff-deleted': dcModes('rgb(164 97 83 / 10%)', 'rgb(213 156 139 / 11%)'),
    }
    const DC_IDENTITY = {
      '--dc-accent': dcModes('#3269B7', '#8AB6FA'),
      '--dc-focus': dcModes('rgb(50 105 183 / 18%)', 'rgb(138 182 250 / 18%)'),
    }
    function dcSyncTheme() {
      if (dcTheme === null) return
      for (const [name, enabled, tokens] of [
        ['identity', true, DC_IDENTITY],
        ['code', dcSettings.code, DC_CODE], ['diff', dcSettings.diff, DC_DIFF],
      ]) {
        if (enabled && !dcThemeLayers.has(name)) {
          dcThemeLayers.set(name, dcTheme.overrideTokens('dsh-fish-ui:' + name, tokens))
        } else if (!enabled && dcThemeLayers.has(name)) {
          dcThemeLayers.get(name)()
          dcThemeLayers.delete(name)
        }
      }
    }
    function dcApplySettings() {
      if (!dcMounted) return
      for (const [key, className] of Object.entries(DC_OFF_CLASS)) {
        document.documentElement.classList.toggle(className, dcSettings[key] === false)
      }
      dcSyncTheme()
    }
    function dcPublish(patch) {
      dcSnapshot = Object.freeze({ ...dcSnapshot, ...patch })
      dcSettings = dcSnapshot.values
      dcApplySettings()
      dcSettingsListeners.forEach(listener => listener())
    }
    function dcConnectSettings(scope) {
      // This is the Host patch entry id; the bundle-config key below is the package name.
      const form = scope.configForms.get('dsh-fish-ui')
      let active = true
      let migrating = false
      let migrationTried = false
      const adopt = () => {
        if (!active) return
        const snapshot = form.getSnapshot()
        if (snapshot.status !== 'ready' || snapshot.value === undefined) {
          dcPublish({ status: snapshot.status, writable: false })
          return
        }
        const ownsValues = Object.keys(DC_DEFAULT_SETTINGS).some(key =>
          snapshot.user !== null && typeof snapshot.user === 'object' && Object.hasOwn(snapshot.user, key))
        const legacyKeys = dcLegacy === null ? []
          : Object.keys(dcLegacy).filter(key => Object.hasOwn(DC_DEFAULT_SETTINGS, key))
        if (!migrationTried && legacyKeys.length > 0 && !ownsValues && !snapshot.value.settingsMigrated && snapshot.writable) {
          migrationTried = true
          migrating = true
          dcPublish({ status: 'ready', writable: true, pending: true, error: '' })
          // Only carry keys the current schema still owns: a legacy blob may mention
          // preferences that were removed, and one unknown path rejects the whole write.
          const ops = Object.entries(dcLegacy)
            .filter(([key]) => Object.hasOwn(DC_DEFAULT_SETTINGS, key))
            .map(([key, value]) => ({ op: 'set', path: [key], value }))
          ops.push({ op: 'set', path: ['settingsMigrated'], value: true })
          // Fence the exact snapshot that established the namespace was empty.
          const migrate = async () => form.mutate(ops, snapshot.revision)
          migrate().then(ok => {
            if (!active) return
            migrating = false
            dcPublish({ pending: false, error: ok ? '' : 'conflict' })
            adopt()
          }, () => {
            if (!active) return
            migrating = false
            dcPublish({ pending: false, error: 'save' })
            adopt()
          })
          // Keep the legacy key read-only: other profiles may share this origin.
          return
        }
        if (migrating) return
        const values = Object.freeze(Object.fromEntries(Object.entries(DC_DEFAULT_SETTINGS)
          .map(([key, fallback]) => [key, typeof snapshot.value[key] === 'boolean' ? snapshot.value[key] : fallback])))
        dcPublish({ values, status: 'ready', writable: snapshot.writable })
      }
      const write = async values => {
        if (!active || dcSnapshot.pending || dcSnapshot.status !== 'ready' || !dcSnapshot.writable) return
        dcPublish({ pending: true, error: '' })
        try {
          const ops = Object.entries(values).filter(([key, value]) => Object.hasOwn(DC_DEFAULT_SETTINGS, key) && typeof value === 'boolean')
            .map(([key, value]) => ({ op: 'set', path: [key], value }))
          ops.push({ op: 'set', path: ['settingsMigrated'], value: true })
          const ok = await form.mutate(ops, form.getSnapshot().revision)
          if (active) dcPublish({ error: ok ? '' : 'conflict' })
        } catch {
          if (active) dcPublish({ error: 'save' })
        } finally {
          if (active) { dcPublish({ pending: false }); adopt() }
        }
      }
      scope.effect(() => {
        dcWrite = write
        dcSettingsOwner = write
        const unsubscribe = form.subscribe(adopt)
        adopt()
        return () => {
          active = false
          unsubscribe()
          if (dcWrite === write) dcWrite = null
          if (dcSettingsOwner === write) {
            dcSettingsOwner = null
            dcPublish({ status: 'unavailable', writable: false, pending: false })
          }
        }
      }, 'dsh-fish-ui: Host preferences')
    }
    const dcSetSetting = (key, value) => dcWrite?.({ [key]: value })

    class DcBoundary extends React.Component {
      state = { failed: false }
      static getDerivedStateFromError() { return { failed: true } }
      componentDidCatch(error) { console.error('[dsh-fish-ui] enhancement failed', error) }
      render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children }
    }
    const dcSafe = Component => function Deep FishSafeSlot(props) {
      return h(DcBoundary, { fallback: props.children }, h(Component, props))
    }

/* fish runtime:end */

    /** Settings copy follows the app language (Chinese unless the UI is English). */
    const dcUsesChinese = () => {
      const lang = (document.documentElement.lang || navigator.language || '').toLowerCase()
      return lang.startsWith('zh')
    }
    const DC_COPY = {
      zh: {
        lead: '\u8fd9\u91cc\u7684\u5f00\u5173\u7acb\u5373\u751f\u6548\uff0c\u5e76\u6309\u914d\u7f6e\u6587\u4ef6\u8bb0\u4f4f\u3002',
        groups: {
          hero: '\u6b22\u8fce\u9875',
          thinking: '\u601d\u8003\u4e2d',
          composer: '\u8f93\u5165\u6846',
          accents: '\u5f3a\u8c03\u8272',
          sidebar: '侧边栏',
        },
        items: {
          hero: ['\u70b9\u9635\u4eba\u50cf\u4e0e\u5b57\u6807', '\u7a7a\u767d\u6b22\u8fce\u9875\u4e0a\u7684\u7acb\u7ed8\u548c\u5b57\u6807'],
          field: ['\u80cc\u666f\u70b9\u9635', '\u94fa\u6ee1\u6574\u9875\u7684\u6de1\u70b9\u9635'],
          wave: ['\u5e95\u90e8\u6ce2\u6d6a', '\u9875\u9762\u5e95\u90e8\u7f13\u6162\u6d41\u52a8\u7684\u660e\u6697\u6ce2'],
          ripple: ['\u6307\u9488\u6d9f\u6f2a', '\u9f20\u6807\u5212\u8fc7\u70b9\u9635\u65f6\u8361\u5f00\u7684\u5149\u73af'],
          thinkingSphere: ['\u70b9\u9635\u7403', '\u601d\u8003\u65f6\u65cb\u8f6c\u7684\u5c0f\u7403'],
          thinkingLabel: ['英文思考文案', '把状态行换成 “Deep thinking for 12s. . .”'],
          glass: ['\u78e8\u7802\u73bb\u7483', '\u4f1a\u8bdd\u9875\u8f93\u5165\u6846\u7684\u534a\u900f\u660e\u6548\u679c'],
          stats: ['\u7528\u91cf\u8bfb\u6570', '\u5728\u53d1\u9001\u6309\u94ae\u6392\u663e\u793a\u4e0a\u4e0b\u6587\u4e0e Token \u7528\u91cf'],
          bold: ['\u9cb8\u9c7c\u84dd\u52a0\u7c97', '\u804a\u5929\u91cc\u7684\u52a0\u7c97\u6587\u5b57\u53d8\u6210\u9cb8\u9c7c\u84dd'],
          focusRing: ['\u805a\u7126\u63cf\u8fb9', '\u8f93\u5165\u6846\u805a\u7126\u65f6\u7684\u67d4\u5149\u63cf\u8fb9'],
          diff: ['diff \u6362\u84dd', '\u65b0\u589e / \u5220\u9664\u884c\u6539\u6210\u84dd\u8272\u65cf'],
        },
        reset: '\u6062\u590d\u9ed8\u8ba4',
        close: '\u5173\u95ed',
        dialog: 'Deep Fish UI \u8bbe\u7f6e',
        button: 'Deep Fish UI \u8bbe\u7f6e',
      },
      en: {
        lead: 'Everything here applies immediately and is remembered per profile.',
        groups: { hero: 'Welcome page', thinking: 'Thinking', composer: 'Composer', accents: 'Accents', sidebar: 'Sidebar' },
        items: {
          hero: ['Dot artwork', 'The portrait and the wordmark on the blank home'],
          field: ['Dot field', 'The faint lattice behind everything'],
          wave: ['Bottom wave', 'The slow brightness wave along the bottom edge'],
          ripple: ['Pointer ripples', 'Light rings where the pointer crosses the field'],
          thinkingSphere: ['Dot sphere', 'The rotating point-sphere beside the live status'],
          thinkingLabel: ['English status label', 'Replace the status row with “Deep thinking for 12s. . .”'],
          glass: ['Frosted glass', 'Translucent input card on session pages'],
          bold: ['Whale-blue bold', 'Bold runs in chat prose take the accent colour'],
          focusRing: ['Focus ring', 'The soft ring while the composer has focus'],
          diff: ['Re-inked diffs', 'Added and removed lines in the blue family'],
        },
        reset: 'Reset to defaults',
        close: 'Close',
        dialog: 'Deep Fish UI settings',
        button: 'Deep Fish UI settings',
      },
    }

    Object.assign(DC_COPY.zh.items, {
      reading: ['阅读排版', '舒展段落、标题与引用，保留你的字号'],
      code: ['代码配色', '低饱和语法颜色，保持代码层次'],
      effortBadge: ['推理等级动画', '输入框里用点阵显示当前推理等级'],
      sidebarDots: ['悬停点阵', '鼠标悬停在侧边栏按钮上时亮起点阵'],
      sidebarRail: ['蓝色竖线', '在悬停按钮左侧显示鲸鱼蓝竖线'],
      thinkingLabel: ['英文思考文案', '把状态行换成 “Deep thinking for 12s. . .”'],
      diff: ['差异配色', '新增用蓝色，删除用暖色，保留语法高亮'],
    })
    Object.assign(DC_COPY.en.items, {
      reading: ['Reading layout', 'Clear paragraphs, headings and quotes at your chosen font size'],
      code: ['Code palette', 'Muted, distinct syntax colours'],
      effortBadge: ['Effort badge', 'Print the reasoning level in dots inside the composer'],
      sidebarDots: ['Hover dot field', 'Light the dot field around the pointer on sidebar buttons'],
      sidebarRail: ['Blue rail', 'Show a whale-blue rail on the left of the hovered button'],
      thinkingLabel: ['English status label', 'Replace the status row with “Deep thinking for 12s. . .”'],
      diff: ['Diff palette', 'Blue additions and warm deletions, with syntax highlighting intact'],
    })

    Object.assign(DC_COPY.zh.items, {
      fishFont: ['Maple Mono 字体', '全站换成 Maple Mono NF CN，正文与代码统一字体'],
      fishGlow: ['输入框柔光', '16px 圆角，聚焦时带主题色光晕'],
      fishMotion: ['轻动效', '按钮悬停上浮，界面过渡更柔和'],
      fishCode: ['代码块质感', '圆角描边与行内代码小药丸'],
    })
    Object.assign(DC_COPY.en.items, {
      fishFont: ['Maple Mono type', 'Use Maple Mono NF CN everywhere, including code'],
      fishGlow: ['Composer glow', '16px radius plus an accent glow on focus'],
      fishMotion: ['Soft motion', 'Buttons lift on hover and surfaces ease between states'],
      fishCode: ['Code surface', 'Rounded code blocks and tinted inline-code pills'],
    })
    /** Switch drawn as SVG so the capsule ends and the knob are exact shapes. */
    function DcSwitchSvg({ value }) {
      const on = value === true
      return h('svg', {
        width: 42,
        height: 24,
        viewBox: '0 0 42 24',
        'aria-hidden': 'true',
        style: { display: 'block', overflow: 'visible' },
      }, [
        h('rect', {
          key: 'track',
          x: 0.5,
          y: 0.5,
          width: 41,
          height: 23,
          rx: 11.5,
          ry: 11.5,
          style: {
            fill: on
              ? 'color-mix(in srgb, var(--dsw-alias-label-primary) 94%, transparent)'
              : 'color-mix(in srgb, var(--dsw-alias-label-tertiary) 44%, transparent)',
            // Only the enabled state carries an outline; keep the SVG geometry fixed.
            stroke: on
              ? 'color-mix(in srgb, var(--dsw-alias-label-primary) 94%, transparent)'
              : 'none',
            strokeWidth: 1,
            transition: 'fill 200ms cubic-bezier(0.22, 1, 0.36, 1), stroke 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
        }),
        h('g', {
          key: 'knob',
          style: {
            transform: on ? 'translateX(18px)' : 'translateX(0px)',
            transition: 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
        }, h('circle', {
          cx: 12,
          cy: 12,
          r: 9,
          style: {
            fill: on ? 'var(--dsw-alias-bg-base, #17171a)' : 'color-mix(in srgb, var(--dsw-alias-label-primary) 82%, transparent)',
            transition: 'fill 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          },
        })),
      ])
    }

    /** One settings row: a label on the left and a switch on the right. */
    function DcSwitch({ label, description, value, disabled, onChange }) {
      return h('div', { className: 'dc-set-row' }, [
        h('div', { key: 'text', className: 'dc-set-text' }, [
          h('span', { key: 'label', className: 'dc-set-label' }, label),
          description === undefined
            ? null
            : h('span', { key: 'desc', className: 'dc-set-desc' }, description),
        ]),
        h('button', {
          key: 'switch',
          type: 'button',
          role: 'switch',
          disabled,
          'aria-checked': value ? 'true' : 'false',
          'aria-label': label,
          className: 'dc-switch',
          'data-on': value ? 'true' : undefined,
          onClick: () => onChange(!value),
        }, h(DcSwitchSvg, { key: 'glyph', value: value === true })),
      ])
    }

    /** The switch list shown inside the sidebar sheet. */
    const FISH_CSS = `
      :root {
        --fish-font: "Maple Mono NF CN", "Maple Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
        --fish-ink: var(--dc-accent, #7cc8ff);
      }
      :root:not(.dc-off-fishfont) body {
        font-family: var(--fish-font) !important;
        font-feature-settings: "ss01" 1, "cv01" 1, "liga" 1;
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      :root:not(.dc-off-fishfont) button,
      :root:not(.dc-off-fishfont) input,
      :root:not(.dc-off-fishfont) textarea,
      :root:not(.dc-off-fishfont) select,
      :root:not(.dc-off-fishfont) [contenteditable="true"] {
        font-family: inherit !important;
      }
      :root:not(.dc-off-fishfont) code,
      :root:not(.dc-off-fishfont) pre,
      :root:not(.dc-off-fishfont) kbd,
      :root:not(.dc-off-fishfont) samp {
        font-family: var(--fish-font) !important;
      }
      :root:not(.dc-off-fishfont) p,
      :root:not(.dc-off-fishfont) li,
      :root:not(.dc-off-fishfont) blockquote {
        line-height: 1.75;
      }
      :root:not(.dc-off-fishglow) [data-composer-card] {
        border-radius: 16px !important;
        transition: box-shadow .25s ease, border-color .25s ease;
      }
      :root:not(.dc-off-fishglow) [data-composer-card]:focus-within {
        box-shadow: 0 0 0 1px var(--fish-ink),
                    0 18px 50px -28px var(--fish-ink) !important;
      }
      :root:not(.dc-off-fishcode) pre {
        border-radius: 12px;
        border: 1px solid color-mix(in srgb, var(--dsw-alias-border-l1, #333) 70%, transparent);
      }
      :root:not(.dc-off-fishcode) :not(pre) > code {
        background: color-mix(in srgb, var(--dsw-alias-bg-layer-2, #222) 78%, transparent);
        padding: .12em .38em;
        border-radius: 5px;
      }
      :root:not(.dc-off-fishmotion) button {
        transition: transform .16s ease, box-shadow .16s ease;
      }
      :root:not(.dc-off-fishmotion) button:hover {
        transform: translateY(-1px);
      }
      ::selection {
        background: color-mix(in srgb, var(--fish-ink) 32%, transparent);
      }
      ::-webkit-scrollbar {
        width: 9px;
        height: 9px;
      }
      ::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--dsw-alias-border-l2, #555) 60%, transparent);
        border-radius: 999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: var(--fish-ink);
      }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    `

    function DcSettingsPage() {
      const copy = dcUsesChinese() ? DC_COPY.zh : DC_COPY.en
      const settings = useDcSettings()
      const state = settings.values
      const disabled = settings.status !== 'ready' || !settings.writable || settings.pending
      const update = key => value => dcSetSetting(key, value)
      const reset = () => dcWrite?.(DC_DEFAULT_SETTINGS)
      const group = (title, children) => h('section', { key: title, className: 'dc-set-group' }, [
        h('h3', { key: 'title', className: 'dc-set-group-title' }, title),
        ...children,
      ])
      const item = (key) => {
        const row = copy.items[key]
        return h(DcSwitch, {
          key: key,
          label: row[0],
          description: row[1],
          value: state[key],
          disabled,
          onChange: update(key),
        })
      }
      const zh = dcUsesChinese()
      const status = settings.error
        ? (zh ? '保存未完成。如果刚更新过插件，请完整退出 DSH 重启后再试。' : 'Could not save. If you just updated the plugin, quit and reopen DSH, then try again.')
        : settings.status === 'loading' ? (zh ? '正在读取主题设置…' : 'Loading theme preferences…')
        : settings.status !== 'ready' ? (zh ? '此宿主暂未提供主题设置。' : 'Theme preferences are unavailable on this host.')
        : !settings.writable ? (zh ? '此配置只读。' : 'These preferences are read-only.')
        : settings.pending ? (zh ? '正在保存…' : 'Saving…') : ''
      return h('div', { className: 'dc-set' }, [
        h('p', { key: 'autosave', className: 'dc-settings-status' }, zh ? '更改立即生效并自动保存。' : 'Changes apply immediately and save automatically.'),
        status ? h('p', { key: 'status', className: 'dc-settings-status', role: settings.error ? 'alert' : 'status' }, status) : null,
        group(zh ? '界面与阅读' : 'Interface & reading', [item('reading'), item('code')]),
        group(copy.groups.hero, [
          item('hero'), item('field'), item('wave'), item('ripple'),
        ]),
        group(copy.groups.thinking, [
          item('thinkingSphere'), item('thinkingLabel'),
        ]),
        group(copy.groups.composer, [
          item('glass'), item('effortBadge'),
        ]),
        group(copy.groups.sidebar, [
          item('sidebarDots'), item('sidebarRail'),
        ]),
        group(copy.groups.accents, [
          item('bold'), item('focusRing'), item('diff'),
        ]),
        group(zh ? 'Fish 字体与质感' : 'Fish finish', [
          item('fishFont'), item('fishGlow'), item('fishMotion'), item('fishCode'),
        ]),
        h('div', { key: 'footer', className: 'dc-set-footer' }, [
          h('button', { key: 'reset', type: 'button', className: 'dc-set-reset', disabled, onClick: reset }, copy.reset),
          h('span', { key: 'note', className: 'dc-set-note' }, 'Deep Fish UI · 0.2.0'),
        ]),
      ])
    }

    // ----------------------------------------------------------- sidebar entry
    /** Sheet state shared by the sidebar button and the panel itself. */
    let dcSheetOpen = false
    const dcSheetListeners = new Set()
    function dcSetSheetOpen(next) {
      dcSheetOpen = next
      dcSheetListeners.forEach((listener) => listener())
    }
    function useDcSheet() {
      const [open, setOpen] = React.useState(dcSheetOpen)
      React.useEffect(() => {
        const listener = () => setOpen(dcSheetOpen)
        dcSheetListeners.add(listener)
        return () => { dcSheetListeners.delete(listener) }
      }, [])
      return open
    }
    let dcReactDOM = null
    try {
      dcReactDOM = require('react-dom')
    } catch (error) {
      dcReactDOM = null
    }

    /** The floating settings sheet, portalled to the body when react-dom is around. */
    function DcSheet() {
      const open = useDcSheet()
      const panelRef = React.useRef(null)
      React.useEffect(() => {
        if (!open) return undefined
        const previousFocus = document.activeElement
        const panel = panelRef.current
        const focusable = () => panel === null ? [] : [...panel.querySelectorAll('button:not(:disabled), [href], [tabindex="0"]')]
        ;(focusable()[0] || panel)?.focus()
        const onKeyDown = event => {
          if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dcSetSheetOpen(false) }
          if (event.key !== 'Tab') return
          const items = focusable()
          const first = items[0] || panel
          const last = items[items.length - 1] || panel
          if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
            event.preventDefault(); last?.focus()
          } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
            event.preventDefault(); first?.focus()
          }
        }
        document.addEventListener('keydown', onKeyDown, true)
        return () => {
          document.removeEventListener('keydown', onKeyDown, true)
          if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus()
        }
      }, [open])
      if (!open) return null
      const panel = h('div', { key: 'panel', className: 'dc-sheet-panel', ref: panelRef, role: 'dialog', 'aria-modal': 'true', tabIndex: -1, 'aria-label': dcUsesChinese() ? DC_COPY.zh.dialog : DC_COPY.en.dialog }, [
        h('div', { key: 'head', className: 'dc-sheet-head' }, [
          h('span', { key: 'title', className: 'dc-sheet-title' }, 'Deep Fish UI'),
          h('button', {
            key: 'close',
            type: 'button',
            className: 'dc-sheet-close',
            'aria-label': dcUsesChinese() ? DC_COPY.zh.close : DC_COPY.en.close,
            onClick: () => dcSetSheetOpen(false),
          }, '\u00d7'),
        ]),
        h('div', { key: 'body', className: 'dc-sheet-body' }, h(DcSettingsPage)),
      ])
      const scrim = h('div', {
        key: 'scrim',
        className: 'dc-sheet-scrim',
        onClick: () => dcSetSheetOpen(false),
      })
      const both = h('div', { className: 'dc-sheet-root' }, [scrim, panel])
      if (dcReactDOM !== null && typeof dcReactDOM.createPortal === 'function') {
        return dcReactDOM.createPortal(both, document.body)
      }
      return both
    }

    /** Nine-dot glyph used by the sidebar button and its active state. */
    function DcSettingsIcon({ size = 16, active }) {
      const unit = size / 16
      const points = [
        [3, 3], [8, 3], [13, 3],
        [3, 8], [8, 8], [13, 8],
        [3, 13], [8, 13], [13, 13],
      ]
      return h('svg', {
        viewBox: '0 0 16 16',
        width: size,
        height: size,
        'aria-hidden': 'true',
        style: { display: 'block' },
      }, points.map((point, index) => h('circle', {
        key: index,
        cx: point[0],
        cy: point[1],
        r: 1.35 * unit,
        fill: active ? 'var(--dc-accent)' : 'currentColor',
      })))
    }

    /**
     * Sidebar footer button that opens the sheet.
     *
     * The button carries its own dot field: completely unlit at rest, it surfaces only in a
     * soft pool around the pointer, clipped to the button, and fades away when the pointer
     * leaves. Dots never move; only their brightness changes.
     */
    function DcSidebarAction({ wide }) {
      const open = useDcSheet()
      const { values } = useDcSettings()
      const showDots = values.sidebarDots !== false
      const showRail = values.sidebarRail !== false
      const canvasRef = React.useRef(null)
      React.useEffect(() => {
        if (!showDots && !showRail) return
        const canvas = canvasRef.current
        if (canvas === null) return
        const context = canvas.getContext('2d')
        if (context === null) return
        const button = canvas.parentElement
        if (button === null) return
        const motion = matchMedia('(prefers-reduced-motion: reduce)')
        const state = { x: -999, y: -999, inside: false, alpha: 0, frame: 0, live: false, dirty: false }
        let stopped = false
        let dpr = Math.min(2, devicePixelRatio || 1)

        const measure = () => {
          const rect = canvas.getBoundingClientRect()
          dpr = Math.min(2, devicePixelRatio || 1)
          const width = Math.max(1, Math.round(rect.width * dpr))
          const height = Math.max(1, Math.round(rect.height * dpr))
          if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width
            canvas.height = height
          }
        }

        const paint = () => {
          state.frame = 0
          if (stopped) return
          const rect = canvas.getBoundingClientRect()
          const width = rect.width
          const height = rect.height
          const target = state.inside ? 1 : 0
          state.alpha = motion.matches ? target : state.alpha + (target - state.alpha) * 0.22
          context.setTransform(dpr, 0, 0, dpr, 0, 0)
          context.clearRect(0, 0, width, height)
          if (!state.inside && state.alpha < 0.02) {
            state.alpha = 0
            state.live = false
            return
          }
          const radius = 64
          const accent = (getComputedStyle(button).getPropertyValue('--dc-accent') || '').trim() || '#7aa4ff'
          context.fillStyle = accent
          if (showDots) for (let y = 3; y < height; y += 4) {
            for (let x = 3; x < width; x += 4) {
              const dx = x - state.x
              const dy = y - state.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > radius) continue
              const alpha = Math.pow(1 - distance / radius, 1.35) * state.alpha
              if (alpha < 0.02) continue
              context.globalAlpha = Math.min(1, alpha)
              context.beginPath()
              context.arc(x, y, 0.85, 0, Math.PI * 2)
              context.fill()
            }
          }
          if (showRail) {
            const railHeight = Math.max(6, height - 10)
            const railTop = (height - railHeight) / 2
            context.globalAlpha = Math.min(1, state.alpha * 0.9)
            context.beginPath()
            if (typeof context.roundRect === 'function') {
              context.roundRect(2, railTop, 3, railHeight, 1.5)
            } else {
              context.rect(2, railTop, 3, railHeight)
            }
            context.fill()
            context.globalAlpha = 1
          }
          const moving = state.dirty
          state.dirty = false
          if (motion.matches) {
            if (!state.inside) {
              context.clearRect(0, 0, width, height)
              state.alpha = 0
            }
            state.live = false
            return
          }
          // Idle inside the button: stop the loop until the pointer moves again.
          if (state.inside && state.alpha >= 0.98 && !moving) {
            state.live = false
            return
          }
          if (state.inside || state.alpha >= 0.02) {
            state.frame = requestAnimationFrame(paint)
          } else {
            state.live = false
          }
        }

        const wake = () => {
          if (stopped || state.live) return
          state.live = true
          if (state.frame === 0) state.frame = requestAnimationFrame(paint)
        }

        const track = event => {
          const rect = canvas.getBoundingClientRect()
          state.x = event.clientX - rect.left
          state.y = event.clientY - rect.top
          state.inside = true
          state.dirty = true
          wake()
        }
        const leave = () => {
          state.inside = false
          wake()
        }

        const resizeObserver = new ResizeObserver(() => {
          measure()
          if (state.inside || state.alpha > 0.02) wake()
        })
        resizeObserver.observe(canvas)
        button.addEventListener('pointerenter', track)
        button.addEventListener('pointermove', track)
        button.addEventListener('pointerleave', leave)
        measure()
        return () => {
          stopped = true
          resizeObserver.disconnect()
          button.removeEventListener('pointerenter', track)
          button.removeEventListener('pointermove', track)
          button.removeEventListener('pointerleave', leave)
          if (state.frame !== 0) cancelAnimationFrame(state.frame)
          state.frame = 0
          state.live = false
        }
      }, [showDots, showRail])
      return h('div', { className: 'dc-foot' }, [
        h('button', {
          key: 'button',
          type: 'button',
          className: 'dc-foot-button',
          title: 'Deep Fish UI',
          'aria-label': dcUsesChinese() ? DC_COPY.zh.button : DC_COPY.en.button,
          onClick: () => dcSetSheetOpen(!dcSheetOpen),
        }, [
          showDots || showRail
            ? h('canvas', { key: 'dots', ref: canvasRef, className: 'dc-foot-dots', 'aria-hidden': 'true' })
            : null,
          h(DcSettingsIcon, { key: 'icon', size: 16, active: open }),
          wide ? h('span', { key: 'label', className: 'dc-foot-label' }, 'Deep Fish UI') : null,
        ]),
        h(DcSheet, { key: 'sheet' }),
      ])
    }


    return {
      inject: ['slots'],
      apply(ctx) {
        dcPlaySplash()
        ctx.effect(() => {
          dcMounted = true
          dcApplySettings()
          return () => {
            dcMounted = false
            dcWrite = null
            dcSetSheetOpen(false)
            for (const className of Object.values(DC_OFF_CLASS)) document.documentElement.classList.remove(className)
            for (const dispose of dcThemeLayers.values()) dispose()
            dcThemeLayers.clear()
            dcTheme = null
          }
        }, 'dsh-fish-ui: lifecycle')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.dshPlugin = 'dsh-fish-ui'
          style.textContent = CSS
          document.head.append(style)
          return () => style.remove()
        }, 'dsh-fish-ui: styles')
        ctx.effect(() => {
          const style = document.createElement('style')
          style.dataset.dshPlugin = 'dsh-fish-ui:finish'
          style.textContent = FISH_CSS
          document.head.append(style)
          return () => style.remove()
        }, 'dsh-fish-ui: finish styles')
        ctx.inject(['theme'], scope => {
          scope.effect(() => {
            dcTheme = scope.theme
            dcSyncTheme()
            return () => {
              for (const dispose of dcThemeLayers.values()) dispose()
              dcThemeLayers.clear()
              dcTheme = null
            }
          }, 'dsh-fish-ui: token layers')
        })
        ctx.effect(() => {
          const sync = () => {
            const enabled = dcGetSnapshot().values.effortBadge !== false
            const label = enabled ? dcEffortLabel() : null
            dcPaintEffort(label !== null && !DC_EFFORT_OFF.test(label) ? label : null)
          }
          sync()
          const timer = setInterval(sync, 500)
          return () => {
            clearInterval(timer)
            const card = document.querySelector('[data-composer-card]')
            if (card !== null) {
              card.removeAttribute('data-dc-effort')
              card.classList.remove('dc-effort-on', 'dc-effort-max')
            }
          }
        }, 'dsh-fish-ui: effort badge')
        // Fresh conversation on every launch. The service may not be reachable the first
        // moment the shell is up, so retry for a few seconds and leave a manual trigger.
        ctx.inject(['uiWorkspace'], scope => {
          const open = tries => {
            try {
              if (typeof scope.uiWorkspace.startSession === 'function') {
                scope.uiWorkspace.startSession()
                console.info('[dsh-fish-ui] opened a new session on launch')
                return
              }
            } catch (error) {
              console.warn('[dsh-fish-ui] new session failed', error)
              return
            }
            if (tries < 30) window.setTimeout(() => open(tries + 1), 400)
          }
          window.__dcNewSession = () => open(0)
          scope.effect(() => {
            const timer = window.setTimeout(() => open(0), 2500)
            return () => window.clearTimeout(timer)
          }, 'dsh-fish-ui: new session on launch')
        })
        ctx.inject(['configForms'], dcConnectSettings)
        const add = (name, options, Component) => ctx.slots.inject(name,
          () => ctx.slots.register({ name, ...options }, dcSafe(Component)))
        add('conversation.hero.frame', { id: 'dot-whale', order: 20 }, HeroFrame)
        add('sidebar.footer.action', { id: 'dsh-fish-ui', order: 5, label: () => 'Deep Fish UI' }, DcSidebarAction)
        add('shell.overlay', { id: 'dc-ambient', order: 5 }, DcOverlay)
        add('shell.overlay', { id: 'dc-sidebar-dots', order: 6 }, DcSidebarDots)
        add('shell.overlay', { id: 'dc-caret-trail', order: 4 }, DcCaretTrail)
        // Package name, distinct from the Host entry id even though both currently match.
        add('plugins.bundle.config', { key: 'dsh-fish-ui' }, DcSettingsPage)
      },
    }
  },
})
