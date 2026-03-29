import { useEffect, useRef } from 'react'

export default function BackgroundCanvases() {
  const pRef = useRef()
  const cRef = useRef()

  useEffect(() => {
    const pCanvas = pRef.current
    const cCanvas = cRef.current
    if (!pCanvas || !cCanvas) return
    const pCtx = pCanvas.getContext('2d')
    const cCtx = cCanvas.getContext('2d')
    let W, H, rafId

    function resize() {
      W = pCanvas.width = cCanvas.width = window.innerWidth
      H = pCanvas.height = cCanvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    /* ── Particles ── */
    class Particle {
      reset() {
        this.x = Math.random() * W; this.y = Math.random() * H
        this.r = Math.random() * 1.2 + 0.3
        this.vx = (Math.random() - 0.5) * 0.25; this.vy = (Math.random() - 0.5) * 0.25
        this.alpha = Math.random() * 0.35 + 0.08
        this.life = Math.random() * 300 + 100; this.age = 0
      }
      constructor() { this.reset() }
    }
    const particles = Array.from({ length: 60 }, () => {
      const p = new Particle(); p.age = Math.floor(Math.random() * p.life); return p
    })

    /* ── Drawing helpers ── */
    function drawCat(c, x, y, size, alpha, angle = 0, blinkT = 0) {
      c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(angle); c.scale(size, size)
      const Y = 'rgba(255,212,0,1)', YD = 'rgba(200,160,0,1)'
      c.beginPath(); c.ellipse(0, 8, 10, 8, 0, 0, Math.PI * 2); c.fillStyle = Y; c.fill()
      c.beginPath(); c.arc(0, -4, 9, 0, Math.PI * 2); c.fillStyle = Y; c.fill()
      ;[[-8,-10,-12,-20,-3,-11],[8,-10,12,-20,3,-11]].forEach(([x1,y1,x2,y2,x3,y3])=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.fillStyle=Y;c.fill()})
      ;[[-7,-11,-10,-18,-4,-12],[7,-11,10,-18,4,-12]].forEach(([x1,y1,x2,y2,x3,y3])=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.fillStyle=YD;c.fill()})
      const eH = blinkT > 0.9 ? 0.5 : 4
      c.fillStyle = '#0B0B0B'
      c.beginPath(); c.ellipse(-3.5, -5, 2.5, eH, 0, 0, Math.PI * 2); c.fill()
      c.beginPath(); c.ellipse(3.5, -5, 2.5, eH, 0, 0, Math.PI * 2); c.fill()
      if (blinkT <= 0.9) {
        c.fillStyle = 'rgba(255,255,255,.8)'
        c.beginPath(); c.arc(-2.5, -6, 0.8, 0, Math.PI * 2); c.fill()
        c.beginPath(); c.arc(4.5, -6, 0.8, 0, Math.PI * 2); c.fill()
      }
      c.fillStyle = YD; c.beginPath(); c.moveTo(0,-1); c.lineTo(-1.5,-3); c.lineTo(1.5,-3); c.fill()
      c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 0.6
      c.beginPath(); c.moveTo(0,-1); c.quadraticCurveTo(-3,1,-4,0); c.stroke()
      c.beginPath(); c.moveTo(0,-1); c.quadraticCurveTo(3,1,4,0); c.stroke()
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 0.5
      ;[-1,0,1].forEach(i=>{c.beginPath();c.moveTo(-2,-2+i*1.2);c.lineTo(-14,-1+i*1.5);c.stroke();c.beginPath();c.moveTo(2,-2+i*1.2);c.lineTo(14,-1+i*1.5);c.stroke()})
      c.strokeStyle = Y; c.lineWidth = 3; c.lineCap = 'round'
      c.beginPath(); c.moveTo(8,12); c.bezierCurveTo(18,20,22,8,16,2); c.stroke()
      c.restore()
    }

    function drawPaper(c, x, y, w, h, alpha, angle, lines = 3) {
      c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(angle)
      c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 8; c.shadowOffsetY = 3
      c.fillStyle = 'rgba(245,245,230,.9)'
      c.beginPath(); c.moveTo(-w/2,-h/2+4); c.lineTo(-w/2+4,-h/2); c.lineTo(w/2,-h/2); c.lineTo(w/2,h/2); c.lineTo(-w/2,h/2); c.closePath(); c.fill()
      c.shadowBlur = 0; c.fillStyle = 'rgba(210,210,195,.9)'
      c.beginPath(); c.moveTo(-w/2,-h/2+4); c.lineTo(-w/2+4,-h/2); c.lineTo(-w/2+4,-h/2+4); c.closePath(); c.fill()
      c.fillStyle = 'rgba(255,212,0,.7)'; c.fillRect(-w/2+4,-h/2,w-4,3)
      c.fillStyle = 'rgba(0,0,0,.15)'
      for (let i = 0; i < lines; i++) { const lw = i===lines-1 ? w*.4 : w*.75; c.fillRect(-w/2+6,-h/2+9+i*7,lw,1.5) }
      c.restore()
    }

    function drawPrinterIcon(c, x, y, size, alpha) {
      c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(size, size)
      c.fillStyle = 'rgba(255,212,0,.18)'; c.strokeStyle = 'rgba(255,212,0,.5)'; c.lineWidth = 1.5
      c.beginPath(); c.roundRect(-18,-8,36,22,4); c.fill(); c.stroke()
      c.fillStyle = 'rgba(245,245,230,.7)'; c.beginPath(); c.roundRect(-10,10,20,12,2); c.fill()
      c.strokeStyle = 'rgba(255,212,0,.3)'; c.stroke()
      c.fillStyle = 'rgba(245,245,230,.5)'; c.beginPath(); c.roundRect(-8,-18,16,12,2); c.fill()
      c.fillStyle = 'rgba(40,200,64,.9)'; c.beginPath(); c.arc(12,-2,2.5,0,Math.PI*2); c.fill()
      c.restore()
    }

    function drawPawPrint(c, x, y, size, alpha, angle = 0) {
      c.save(); c.globalAlpha = alpha; c.translate(x,y); c.rotate(angle)
      c.fillStyle = 'rgba(255,212,0,.6)'
      c.beginPath(); c.ellipse(0,0,size*1.1,size*.9,0,0,Math.PI*2); c.fill()
      ;[[-size*1.2,-size*1.4],[0,-size*1.7],[size*1.2,-size*1.4],[size*1.8,-size*.5]].forEach(([tx,ty])=>{c.beginPath();c.ellipse(tx,ty,size*.6,size*.55,0,0,Math.PI*2);c.fill()})
      c.restore()
    }

    function drawYarnBall(c, x, y, r, alpha, t) {
      c.save(); c.globalAlpha = alpha; c.strokeStyle = 'rgba(255,212,0,.55)'; c.lineWidth = 1.2
      c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle='rgba(255,212,0,.06)'; c.fill(); c.stroke()
      for (let i = 0; i < 6; i++) {
        const a = t*0.3+i*(Math.PI/3)
        c.beginPath(); c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r)
        c.quadraticCurveTo(x+Math.cos(a+Math.PI*.6)*r*.5,y+Math.sin(a+Math.PI*.6)*r*.5,x+Math.cos(a+Math.PI)*r,y+Math.sin(a+Math.PI)*r)
        c.stroke()
      }
      c.restore()
    }

    /* ── Entity classes ── */
    let entities = [], printers = [], frameCount = 0

    class FloatCat {
      init() {
        this.x=-80+Math.random()*(W+160); this.y=H+50
        this.size=.55+Math.random()*.55; this.vx=(Math.random()-.5)*.35; this.vy=-(0.45+Math.random()*.5)
        this.alpha=.12+Math.random()*.18; this.angle=(Math.random()-.5)*.3
        this.wobble=Math.random()*Math.PI*2; this.ws=.012+Math.random()*.015
        this.blinkTimer=Math.random()*200; this.blinkInterval=150+Math.random()*200; this.blinking=0; this.dead=false
      }
      constructor() { this.init() }
      update() {
        this.wobble+=this.ws; this.x+=this.vx+Math.sin(this.wobble)*.35; this.y+=this.vy
        this.blinkTimer++
        if(this.blinkTimer>this.blinkInterval) this.blinking=Math.min(1,this.blinking+.15)
        else this.blinking=Math.max(0,this.blinking-.12)
        if(this.blinkTimer>this.blinkInterval+15) this.blinkTimer=0
        if(this.y<-120) this.dead=true
      }
      draw(c) { drawCat(c,this.x,this.y,this.size,this.alpha,this.angle,this.blinking) }
    }

    class FlyingPaper {
      init(fromPrinter=false) {
        if(fromPrinter) { this.x=Math.random()*W; this.y=H*.3+Math.random()*H*.4; this.vx=(Math.random()-.5)*1.8; this.vy=-(1.5+Math.random()*1.5) }
        else { this.x=Math.random()*W; this.y=H+30; this.vx=(Math.random()-.5)*.6; this.vy=-(0.4+Math.random()*.55) }
        this.w=28+Math.random()*20; this.h=this.w*1.35; this.alpha=.08+Math.random()*.14
        this.angle=(Math.random()-.5)*.5; this.spin=(Math.random()-.5)*.012
        this.lines=Math.floor(2+Math.random()*4); this.dead=false; this.gravity=.006
      }
      constructor(fp=false) { this.init(fp) }
      update() { this.x+=this.vx; this.vy+=this.gravity; this.y+=this.vy; this.angle+=this.spin; if(this.y<-80)this.dead=true }
      draw(c) { drawPaper(c,this.x,this.y,this.w,this.h,this.alpha,this.angle,this.lines) }
    }

    class DriftingPaw {
      init() { this.x=Math.random()*W; this.y=H+20; this.size=4+Math.random()*6; this.alpha=.05+Math.random()*.1; this.angle=(Math.random()-.5)*Math.PI; this.vx=(Math.random()-.5)*.4; this.vy=-(0.3+Math.random()*.4); this.dead=false }
      constructor() { this.init() }
      update() { this.x+=this.vx; this.y+=this.vy; if(this.y<-20)this.dead=true }
      draw(c) { drawPawPrint(c,this.x,this.y,this.size,this.alpha,this.angle) }
    }

    class StaticPrinter {
      constructor() { this.x=50+Math.random()*(W-100); this.y=80+Math.random()*(H-200); this.size=.8+Math.random()*.7; this.alpha=.07+Math.random()*.08; this.ejectTimer=0; this.ejectInterval=180+Math.random()*240 }
      update() { this.ejectTimer++; if(this.ejectTimer>this.ejectInterval){this.ejectTimer=0;const p=new FlyingPaper(true);p.x=this.x;p.y=this.y-20*this.size;p.vx=(Math.random()-.5)*1.2;p.vy=-(1+Math.random());entities.push(p)} }
      draw(c) { drawPrinterIcon(c,this.x,this.y,this.size,this.alpha) }
    }

    class YarnBallFloat {
      init() { this.x=Math.random()*W; this.y=H+40; this.r=12+Math.random()*18; this.alpha=.06+Math.random()*.1; this.vx=(Math.random()-.5)*.35; this.vy=-(0.25+Math.random()*.3); this.t=Math.random()*100; this.dead=false }
      constructor() { this.init() }
      update() { this.x+=this.vx; this.y+=this.vy; this.t+=.04; if(this.y<-50)this.dead=true }
      draw(c) { drawYarnBall(c,this.x,this.y,this.r,this.alpha,this.t) }
    }

    for(let i=0;i<5;i++) printers.push(new StaticPrinter())
    for(let i=0;i<8;i++){const e=new FloatCat();e.y=Math.random()*H;entities.push(e)}
    for(let i=0;i<12;i++){const e=new FlyingPaper();e.y=Math.random()*H;entities.push(e)}
    for(let i=0;i<6;i++){const e=new DriftingPaw();e.y=Math.random()*H;entities.push(e)}
    for(let i=0;i<4;i++){const e=new YarnBallFloat();e.y=Math.random()*H;entities.push(e)}

    function loop() {
      rafId = requestAnimationFrame(loop)
      // particles canvas
      pCtx.clearRect(0,0,W,H)
      particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.age++;if(p.age>p.life)p.reset();const fade=Math.sin((p.age/p.life)*Math.PI);pCtx.beginPath();pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);pCtx.fillStyle=`rgba(255,212,0,${p.alpha*fade})`;pCtx.fill()})
      // cat canvas
      cCtx.clearRect(0,0,W,H)
      frameCount++
      if(frameCount%55===0&&entities.filter(e=>e instanceof FloatCat).length<12) entities.push(new FloatCat())
      if(frameCount%35===0&&entities.filter(e=>e instanceof FlyingPaper).length<20) entities.push(new FlyingPaper())
      if(frameCount%70===0&&entities.filter(e=>e instanceof DriftingPaw).length<10) entities.push(new DriftingPaw())
      if(frameCount%90===0&&entities.filter(e=>e instanceof YarnBallFloat).length<6) entities.push(new YarnBallFloat())
      printers.forEach(p=>{p.update();p.draw(cCtx)})
      entities=entities.filter(e=>!e.dead)
      entities.forEach(e=>{e.update();e.draw(cCtx)})
    }
    loop()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas ref={pRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none',opacity:.55}} />
      <canvas ref={cRef} style={{position:'fixed',inset:0,zIndex:0,pointerEvents:'none'}} />
    </>
  )
}
