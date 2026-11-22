// The curves use the same local coordinates in the welcome pane and the small
// gallery preview. The moving colour stop travels along each engraved crest.
const crestOutline = 'M-22 10 C38 23 87 15 140 1 C198 -15 206 -39 249 -40 C272 -42 291 -33 315 -48 C291 -26 270 -32 250 -32 C213 -32 194 -7 144 6 C91 21 34 25 -22 10 Z'
const crestLip = 'M-22 10 C38 23 87 15 140 1 C198 -15 206 -39 249 -40 C272 -42 291 -33 315 -48'
const lowerCurrent = 'M56 24 C104 21 161 13 200 -9 S259 -25 281 -29'
const returnCurrent = 'M178 -4 C205 -15 211 -26 231 -33 Q245 -37 254 -35'
let engraving: Path2D[] | undefined

export function paintDaylightWake(ctx: CanvasRenderingContext2D, x: number, y: number,
    width: number, height: number, elapsedMs: number) {
  if (elapsedMs < 160 || elapsedMs >= 2850 || !width || !height) return
  engraving ??= [crestOutline, crestLip, lowerCurrent, returnCurrent].map(curve => new Path2D(curve))
  const [outline, lip, lower, returning] = engraving
  ctx.save()
  ctx.globalCompositeOperation = 'destination-over'
  ctx.translate(x + width / 2, y + height * .86)
  ctx.scale(width / 460, height / 323)
  for (const side of [-1, 1]) {
    const t = Math.min(1, Math.max(0, (elapsedMs - (side < 0 ? 160 : 340)) / 2510))
    if (t <= 0 || t >= 1) continue
    const head = -30 + 460 * (1 - (1 - t) ** 1.65)
    const envelope = Math.min(1, t * 7, (1 - t) * 4)
    ctx.save()
    ctx.scale(side * (side < 0 ? .93 : 1.04), side < 0 ? .73 : 1)
    ctx.translate(0, 8 * (1 - t) + (side < 0 ? 5 : 0))
    const light = ctx.createLinearGradient(head - 172, 0, head + 19, 0)
    light.addColorStop(0, 'rgba(21,95,144,0)')
    light.addColorStop(.28, '#3487a8')
    light.addColorStop(.69, '#75d7e4')
    light.addColorStop(.84, '#f4ffff')
    light.addColorStop(.94, '#4384c5')
    light.addColorStop(1, 'rgba(61,114,177,0)')
    ctx.lineCap = 'round'
    ctx.strokeStyle = light
    ctx.fillStyle = light
    ctx.globalAlpha = envelope * .96
    ctx.lineWidth = 1.4
    ctx.stroke(lip)
    ctx.lineWidth = 1
    ctx.stroke(returning)
    ctx.globalAlpha = envelope * .73
    ctx.stroke(lower)
    ctx.fill(outline)
    // A little spray peels off the outside of the curl as the light reaches
    // it. Keep the face and the workspace row clear even on a short window.
    const spray = (t - .28) / .60
    if (spray > 0 && spray < 1) {
      ctx.fillStyle = '#4e97b6'
      for (let i = 0; i < 9; i++) {
        const age = spray - i * .035
        if (age <= 0) break
        ctx.globalAlpha = envelope * Math.sin(Math.PI * age) * .84
        const dx = 213 + (i * 31 % 63) + age * (18 + i * 2)
        const dy = -31 - age * (1 - age) * (90 + i * 7) - i % 4 * 2
        ctx.beginPath()
        ctx.ellipse(dx, dy, 1.55 - i * .08, .8, -.55, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    ctx.restore()
  }
  ctx.restore()
}
