import React, { useState, useEffect, useRef } from "react";

const API_BASE = "https://backend-copykat.onrender.com";
// const API_BASE = "https://api.copykat.co.in";

/* ══════════════════════════════════════════════════════════
   CUSTOM CURSOR  (gold dot + spinning diamond ring)
══════════════════════════════════════════════════════════ */
function useCursor() {
  useEffect(() => {
    // Create elements if they don't exist
    let cursor = document.getElementById('ck-cursor');
    let ring   = document.getElementById('ck-ring');
    if (!cursor) { cursor = document.createElement('div'); cursor.id = 'ck-cursor'; document.body.appendChild(cursor); }
    if (!ring)   { ring   = document.createElement('div'); ring.id   = 'ck-ring';   document.body.appendChild(ring);   }

    let mx = 0, my = 0, rx = 0, ry = 0, rafId;

    Object.assign(cursor.style, {
      position: 'fixed', width: '10px', height: '10px', borderRadius: '50%',
      background: '#FFD600', boxShadow: '0 0 6px 2px #FFD600, 0 0 14px 4px #FFD60066',
      pointerEvents: 'none', zIndex: '99999', transform: 'translate(-50%, -50%)',
      transition: 'width .15s ease, height .15s ease, background .15s ease, box-shadow .15s ease',
      willChange: 'left, top',
    });

    Object.assign(ring.style, {
      position: 'fixed', width: '32px', height: '32px',
      border: '2px solid #FFD600', borderRadius: '3px',
      pointerEvents: 'none', zIndex: '99998',
      transform: 'translate(-50%, -50%) rotate(45deg)',
      transition: 'width .2s ease, height .2s ease, border-color .2s ease, opacity .2s ease',
      opacity: '0.8', willChange: 'left, top',
    });

    if (!document.getElementById('ck-cursor-styles')) {
      const style = document.createElement('style');
      style.id = 'ck-cursor-styles';
      style.textContent = `
        * { cursor: none !important; }
        @keyframes ck-ring-spin {
          from { transform: translate(-50%,-50%) rotate(45deg); }
          to   { transform: translate(-50%,-50%) rotate(405deg); }
        }
        @keyframes ck-ring-spin-grow {
          from { transform: translate(-50%,-50%) rotate(45deg) scale(1.8); }
          to   { transform: translate(-50%,-50%) rotate(405deg) scale(1.8); }
        }
        @keyframes ck-dot-pulse {
          0%,100% { box-shadow: 0 0 6px 2px #FFD600, 0 0 14px 4px #FFD60066; }
          50%      { box-shadow: 0 0 10px 4px #FFD600, 0 0 28px 10px #FFD60099; }
        }
        #ck-ring { animation: ck-ring-spin 4s linear infinite; }
        body.cursor-grow #ck-cursor {
          width: 14px !important; height: 14px !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px #FFD600, 0 0 20px 6px #FFD600 !important;
          animation: ck-dot-pulse 0.8s ease-in-out infinite !important;
        }
        body.cursor-grow #ck-ring {
          border-color: #FFD600 !important; border-width: 2.5px !important;
          opacity: 1 !important;
          animation: ck-ring-spin-grow 0.9s linear infinite !important;
        }
      `;
      document.head.appendChild(style);
    }

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    };
    const animateRing = () => {
      rx += (mx - rx) * 0.10; ry += (my - ry) * 0.10;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      rafId = requestAnimationFrame(animateRing);
    };
    document.addEventListener('mousemove', onMove);
    animateRing();

    const addGrow = () => document.body.classList.add('cursor-grow');
    const rmGrow  = () => document.body.classList.remove('cursor-grow');
    const selectors = 'a,button,.glass-card,.pricing-card,.pg-key,input,select,details,summary';
    const attach = () => {
      document.querySelectorAll(selectors).forEach(el => {
        el.addEventListener('mouseenter', addGrow);
        el.addEventListener('mouseleave', rmGrow);
      });
    };
    attach();
    const mo = new MutationObserver(attach);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      mo.disconnect();
      document.body.classList.remove('cursor-grow');
    };
  }, []);
}

/* ══════════════════════════════════════════════════════════
   CANVAS ANIMATION  (cats · papers · paws · yarn · printers)
══════════════════════════════════════════════════════════ */
function AnimationCanvas() {
  const pRef = useRef(null);
  const cRef = useRef(null);
  useEffect(() => {
    const pc = pRef.current, cc = cRef.current;
    if (!pc || !cc) return;
    const pCtx = pc.getContext("2d"), cCtx = cc.getContext("2d");
    let W, H, frame = 0, entities = [], printers = [], particles = [], animId;
    function resize() { W = pc.width = cc.width = window.innerWidth; H = pc.height = cc.height = window.innerHeight; }
    resize(); window.addEventListener("resize", resize);

    function Particle() {
      this.reset = function() { this.x=Math.random()*W; this.y=Math.random()*H; this.r=Math.random()*1.2+.3; this.vx=(Math.random()-.5)*.25; this.vy=(Math.random()-.5)*.25; this.alpha=Math.random()*.3+.06; this.life=Math.random()*280+80; this.age=0; }; this.reset();
    }
    for(let i=0;i<55;i++){const p=new Particle();p.age=Math.floor(Math.random()*p.life);particles.push(p);}

    function drawCat(c,x,y,size,alpha,angle=0,blink=0){
      c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);c.scale(size,size);
      const Y="rgba(255,212,0,1)",YD="rgba(200,160,0,1)";
      c.beginPath();c.ellipse(0,8,10,8,0,0,Math.PI*2);c.fillStyle=Y;c.fill();
      c.beginPath();c.arc(0,-4,9,0,Math.PI*2);c.fillStyle=Y;c.fill();
      [[-8,-10,-12,-20,-3,-11],[8,-10,12,-20,3,-11]].forEach(([x1,y1,x2,y2,x3,y3])=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.fillStyle=Y;c.fill();});
      [[-7,-11,-10,-18,-4,-12],[7,-11,10,-18,4,-12]].forEach(([x1,y1,x2,y2,x3,y3])=>{c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.lineTo(x3,y3);c.fillStyle=YD;c.fill();});
      const eH=blink>.9?.5:4;
      c.fillStyle="#0B0B0B";
      c.beginPath();c.ellipse(-3.5,-5,2.5,eH,0,0,Math.PI*2);c.fill();
      c.beginPath();c.ellipse(3.5,-5,2.5,eH,0,0,Math.PI*2);c.fill();
      if(blink<=.9){c.fillStyle="rgba(255,255,255,.8)";c.beginPath();c.arc(-2.5,-6,.8,0,Math.PI*2);c.fill();c.beginPath();c.arc(4.5,-6,.8,0,Math.PI*2);c.fill();}
      c.fillStyle=YD;c.beginPath();c.moveTo(0,-1);c.lineTo(-1.5,-3);c.lineTo(1.5,-3);c.fill();
      c.strokeStyle="rgba(0,0,0,.5)";c.lineWidth=.6;
      c.beginPath();c.moveTo(0,-1);c.quadraticCurveTo(-3,1,-4,0);c.stroke();
      c.beginPath();c.moveTo(0,-1);c.quadraticCurveTo(3,1,4,0);c.stroke();
      c.strokeStyle="rgba(0,0,0,.35)";c.lineWidth=.5;
      [-1,0,1].forEach(i=>{c.beginPath();c.moveTo(-2,-2+i*1.2);c.lineTo(-14,-1+i*1.5);c.stroke();c.beginPath();c.moveTo(2,-2+i*1.2);c.lineTo(14,-1+i*1.5);c.stroke();});
      c.strokeStyle=Y;c.lineWidth=3;c.lineCap="round";
      c.beginPath();c.moveTo(8,12);c.bezierCurveTo(18,20,22,8,16,2);c.stroke();
      c.restore();
    }
    function drawPaper(c,x,y,w,h,alpha,angle,lines=3){
      c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);
      c.shadowColor="rgba(0,0,0,.3)";c.shadowBlur=8;c.shadowOffsetY=3;
      c.fillStyle="rgba(245,245,230,.9)";c.beginPath();c.moveTo(-w/2,-h/2+4);c.lineTo(-w/2+4,-h/2);c.lineTo(w/2,-h/2);c.lineTo(w/2,h/2);c.lineTo(-w/2,h/2);c.closePath();c.fill();
      c.shadowBlur=0;c.fillStyle="rgba(210,210,195,.9)";c.beginPath();c.moveTo(-w/2,-h/2+4);c.lineTo(-w/2+4,-h/2);c.lineTo(-w/2+4,-h/2+4);c.closePath();c.fill();
      c.fillStyle="rgba(255,212,0,.7)";c.fillRect(-w/2+4,-h/2,w-4,3);
      c.fillStyle="rgba(0,0,0,.15)";for(let i=0;i<lines;i++){const lw=i===lines-1?w*.4:w*.75;c.fillRect(-w/2+6,-h/2+9+i*7,lw,1.5);}
      c.restore();
    }
    function drawPrinter(c,x,y,size,alpha){
      c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(size,size);
      c.fillStyle="rgba(255,212,0,.18)";c.strokeStyle="rgba(255,212,0,.5)";c.lineWidth=1.5;
      c.beginPath();c.roundRect(-18,-8,36,22,4);c.fill();c.stroke();
      c.fillStyle="rgba(245,245,230,.7)";c.beginPath();c.roundRect(-10,10,20,12,2);c.fill();c.strokeStyle="rgba(255,212,0,.3)";c.stroke();
      c.fillStyle="rgba(245,245,230,.5)";c.beginPath();c.roundRect(-8,-18,16,12,2);c.fill();
      c.fillStyle="rgba(40,200,64,.9)";c.beginPath();c.arc(12,-2,2.5,0,Math.PI*2);c.fill();c.restore();
    }
    function drawPaw(c,x,y,size,alpha,angle=0){
      c.save();c.globalAlpha=alpha;c.translate(x,y);c.rotate(angle);c.fillStyle="rgba(255,212,0,.6)";
      c.beginPath();c.ellipse(0,0,size*1.1,size*.9,0,0,Math.PI*2);c.fill();
      [[-size*1.2,-size*1.4],[0,-size*1.7],[size*1.2,-size*1.4],[size*1.8,-size*.5]].forEach(([tx,ty])=>{c.beginPath();c.ellipse(tx,ty,size*.6,size*.55,0,0,Math.PI*2);c.fill();});
      c.restore();
    }
    function drawYarn(c,x,y,r,alpha,t){
      c.save();c.globalAlpha=alpha;c.strokeStyle="rgba(255,212,0,.55)";c.lineWidth=1.2;
      c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle="rgba(255,212,0,.06)";c.fill();c.stroke();
      for(let i=0;i<6;i++){const a=t*.3+i*(Math.PI/3);c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r);c.quadraticCurveTo(x+Math.cos(a+Math.PI*.6)*r*.5,y+Math.sin(a+Math.PI*.6)*r*.5,x+Math.cos(a+Math.PI)*r,y+Math.sin(a+Math.PI)*r);c.stroke();}
      c.restore();
    }

    class FloatCat{constructor(){this.init()}init(){this.x=-80+Math.random()*(W+160);this.y=H+50;this.size=.5+Math.random()*.5;this.vx=(Math.random()-.5)*.3;this.vy=-(0.4+Math.random()*.45);this.alpha=.1+Math.random()*.16;this.angle=(Math.random()-.5)*.3;this.wobble=Math.random()*Math.PI*2;this.ws=.012+Math.random()*.015;this.bt=Math.random()*200;this.bi=150+Math.random()*200;this.blinking=0;this.dead=false;}update(){this.wobble+=this.ws;this.x+=this.vx+Math.sin(this.wobble)*.3;this.y+=this.vy;this.bt++;if(this.bt>this.bi)this.blinking=Math.min(1,this.blinking+.15);else this.blinking=Math.max(0,this.blinking-.12);if(this.bt>this.bi+15)this.bt=0;if(this.y<-120)this.dead=true;}draw(c){drawCat(c,this.x,this.y,this.size,this.alpha,this.angle,this.blinking);}}
    class FlyingPaper{constructor(fp=false){this.init(fp)}init(fp=false){this.x=fp?(this.px||Math.random()*W):Math.random()*W;this.y=fp?(H*.3+Math.random()*H*.4):H+30;this.vx=(Math.random()-.5)*(fp?1.8:.6);this.vy=-(fp?1.5+Math.random()*1.5:.4+Math.random()*.5);this.w=28+Math.random()*20;this.h=this.w*1.35;this.alpha=.07+Math.random()*.12;this.angle=(Math.random()-.5)*.5;this.spin=(Math.random()-.5)*.012;this.lines=Math.floor(2+Math.random()*4);this.dead=false;this.g=.006;}update(){this.x+=this.vx;this.vy+=this.g;this.y+=this.vy;this.angle+=this.spin;if(this.y<-80)this.dead=true;}draw(c){drawPaper(c,this.x,this.y,this.w,this.h,this.alpha,this.angle,this.lines);}}
    class DriftingPaw{constructor(){this.init()}init(){this.x=Math.random()*W;this.y=H+20;this.size=4+Math.random()*6;this.alpha=.05+Math.random()*.1;this.angle=(Math.random()-.5)*Math.PI;this.vx=(Math.random()-.5)*.4;this.vy=-(0.3+Math.random()*.35);this.dead=false;}update(){this.x+=this.vx;this.y+=this.vy;if(this.y<-20)this.dead=true;}draw(c){drawPaw(c,this.x,this.y,this.size,this.alpha,this.angle);}}
    class StaticPrinter{constructor(){this.x=50+Math.random()*(W-100);this.y=80+Math.random()*(H-200);this.size=.75+Math.random()*.65;this.alpha=.06+Math.random()*.08;this.et=0;this.ei=160+Math.random()*220;}update(){this.et++;if(this.et>this.ei){this.et=0;const p=new FlyingPaper(true);p.x=this.x;p.y=this.y-20*this.size;p.vx=(Math.random()-.5)*1.2;p.vy=-(1+Math.random());entities.push(p);}}draw(c){drawPrinter(c,this.x,this.y,this.size,this.alpha);}}
    class YarnFloat{constructor(){this.init()}init(){this.x=Math.random()*W;this.y=H+40;this.r=12+Math.random()*16;this.alpha=.05+Math.random()*.09;this.vx=(Math.random()-.5)*.3;this.vy=-(0.22+Math.random()*.28);this.t=Math.random()*100;this.dead=false;}update(){this.x+=this.vx;this.y+=this.vy;this.t+=.04;if(this.y<-50)this.dead=true;}draw(c){drawYarn(c,this.x,this.y,this.r,this.alpha,this.t);}}

    for(let i=0;i<4;i++)printers.push(new StaticPrinter());
    for(let i=0;i<7;i++){const e=new FloatCat();e.y=Math.random()*H;entities.push(e);}
    for(let i=0;i<10;i++){const e=new FlyingPaper();e.y=Math.random()*H;entities.push(e);}
    for(let i=0;i<5;i++){const e=new DriftingPaw();e.y=Math.random()*H;entities.push(e);}
    for(let i=0;i<3;i++){const e=new YarnFloat();e.y=Math.random()*H;entities.push(e);}

    function loop(){
      pCtx.clearRect(0,0,W,H);
      particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.age++;if(p.age>p.life)p.reset();const fade=Math.sin((p.age/p.life)*Math.PI);pCtx.beginPath();pCtx.arc(p.x,p.y,p.r,0,Math.PI*2);pCtx.fillStyle=`rgba(255,212,0,${p.alpha*fade})`;pCtx.fill();});
      cc.width=window.innerWidth;cc.height=window.innerHeight;cCtx.clearRect(0,0,W,H);
      frame++;
      if(frame%55===0&&entities.filter(e=>e instanceof FloatCat).length<10)entities.push(new FloatCat());
      if(frame%38===0&&entities.filter(e=>e instanceof FlyingPaper).length<18)entities.push(new FlyingPaper());
      if(frame%72===0&&entities.filter(e=>e instanceof DriftingPaw).length<8)entities.push(new DriftingPaw());
      if(frame%95===0&&entities.filter(e=>e instanceof YarnFloat).length<5)entities.push(new YarnFloat());
      printers.forEach(p=>{p.update();p.draw(cCtx);});
      entities=entities.filter(e=>!e.dead);entities.forEach(e=>{e.update();e.draw(cCtx);});
      animId=requestAnimationFrame(loop);
    }
    loop();
    return()=>{cancelAnimationFrame(animId);window.removeEventListener("resize",resize);};
  },[]);
  return(<>
    <canvas ref={pRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:.5}}/>
    <canvas ref={cRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>
  </>);
}

/* ══════════════════════════════════════════════════════════
   PIN GATE
══════════════════════════════════════════════════════════ */
function PinGate({ children }) {
  const CORRECT_PIN = "282004";
  const [input, setInput]       = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError]       = useState(false);
  const [shake, setShake]       = useState(false);

  useCursor();

  const tap = (digit) => {
    if (input.length >= 6) return;
    const next = input + digit;
    setInput(next); setError(false);
    if (next.length === 6) {
      if (next === CORRECT_PIN) { setTimeout(() => setUnlocked(true), 120); }
      else { setShake(true); setError(true); setTimeout(() => { setInput(""); setShake(false); }, 600); }
    }
  };
  const del = () => { setInput(p => p.slice(0,-1)); setError(false); };

  if (unlocked) return children;

  return (
    <div style={{minHeight:"100vh",width:"100vw",background:"#0B0B0B",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Black+Han+Sans&family=DM+Mono:wght@400;500&display=swap');
        @keyframes pg-fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pg-glow{0%,100%{box-shadow:0 0 20px rgba(255,212,0,.2)}50%{box-shadow:0 0 50px rgba(255,212,0,.5)}}
        @keyframes pg-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
        @keyframes pg-pp{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        @keyframes pg-pulse{0%,100%{opacity:.7;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}
        .pg-key{transition:all .1s ease;background:rgba(255,212,0,.06);border:1px solid rgba(255,212,0,.15);color:#F5F5F5;font-size:1.4rem;font-weight:700;border-radius:14px;height:62px;cursor:none;font-family:'DM Mono',monospace;}
        .pg-key:hover{background:rgba(255,212,0,.15)!important;transform:scale(1.06);}
        .pg-key:active{transform:scale(.9)!important;background:rgba(255,212,0,.25)!important;}
      `}</style>
      <AnimationCanvas/>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(255,212,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,212,0,.03) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none",zIndex:1}}/>
      <div style={{position:"fixed",top:"-10%",left:"50%",width:600,height:400,background:"radial-gradient(circle,rgba(255,212,0,.1) 0%,transparent 70%)",pointerEvents:"none",zIndex:1,animation:"pg-pulse 6s ease-in-out infinite"}}/>

      <div style={{position:"relative",zIndex:2,background:"rgba(13,13,13,.92)",backdropFilter:"blur(30px)",border:"1px solid rgba(255,212,0,.2)",borderRadius:24,padding:"40px 32px",width:"min(360px,92vw)",animation:"pg-fadeIn .5s ease",boxShadow:"0 40px 80px rgba(0,0,0,.8)"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#FFD400,rgba(255,212,0,.3),transparent)",borderRadius:"24px 24px 0 0"}}/>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(255,212,0,.1)",border:"2px solid rgba(255,212,0,.3)",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",animation:"pg-glow 3s ease-in-out infinite"}}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.5rem",color:"#FFD400",letterSpacing:".06em"}}>DASHBOARD</div>
          <div style={{fontSize:".78rem",color:"rgba(255,255,255,.35)",marginTop:4,letterSpacing:".04em"}}>Enter 6-digit PIN to continue</div>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:20,animation:shake?"pg-shake .5s ease":"none"}}>
          {[0,1,2,3,4,5].map(i=>(
            <div key={i} style={{width:14,height:14,borderRadius:"50%",background:i<input.length?(error?"#ff4444":"#FFD400"):"transparent",border:`2px solid ${i<input.length?(error?"#ff4444":"#FFD400"):"rgba(255,212,0,.25)"}`,transition:"all .15s ease",boxShadow:i<input.length?`0 0 10px ${error?"rgba(255,68,68,.6)":"rgba(255,212,0,.5)"}`:"none",animation:i<input.length?"pg-pp .2s ease":"none"}}/>
          ))}
        </div>

        {error&&<p style={{textAlign:"center",color:"#ff6b6b",fontSize:".82rem",marginBottom:14,fontWeight:600}}>❌ Incorrect PIN. Try again.</p>}

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k,i)=>(
            <button key={i} className="pg-key"
              style={{opacity:k===""?0:1,pointerEvents:k===""?"none":"auto",background:k==="⌫"?"rgba(255,80,80,.08)":"rgba(255,212,0,.06)",borderColor:k==="⌫"?"rgba(255,80,80,.2)":"rgba(255,212,0,.15)",color:k==="⌫"?"#ff6b6b":"#F5F5F5"}}
              onClick={()=>{if(k==="⌫")del();else if(k!=="")tap(k);}}
              disabled={k===""}>
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CARTRIDGE TRACKER
══════════════════════════════════════════════════════════ */
function CartridgeTracker({ machineId, filteredJobs }) {
  const key = `cartridge_refills_${machineId}`;
  const [refills, setRefills] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState(new Date().toTimeString().slice(0,5));
  const [newNote, setNewNote] = useState("");
  const [editId, setEditId]   = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNote, setEditNote] = useState("");

  useEffect(()=>{try{const s=localStorage.getItem(key);setRefills(s?JSON.parse(s):[]);}catch{setRefills([]);}}, [machineId]);
  const save=(u)=>{setRefills(u);localStorage.setItem(key,JSON.stringify(u));};
  const add=()=>{if(!newDate||!newTime)return;save([...refills,{id:Date.now(),date:newDate,time:newTime,datetime:`${newDate}T${newTime}`,note:newNote.trim()}].sort((a,b)=>new Date(b.datetime)-new Date(a.datetime)));setNewNote("");setShowLog(false);};
  const del=(id)=>save(refills.filter(r=>r.id!==id));
  const startEdit=(r)=>{setEditId(r.id);setEditDate(r.date);setEditTime(r.time||"00:00");setEditNote(r.note||"");};
  const saveEdit=()=>{if(!editDate||!editTime)return;save(refills.map(r=>r.id===editId?{...r,date:editDate,time:editTime,datetime:`${editDate}T${editTime}`,note:editNote.trim()}:r).sort((a,b)=>new Date(b.datetime)-new Date(a.datetime)));setEditId(null);};

  const LIMIT=1000;
  const rwp=refills.map((r,i)=>{
    const from=new Date(r.datetime||r.date),to=i===0?new Date():new Date(refills[i-1].datetime||refills[i-1].date);
    const pages=filteredJobs.filter(j=>{const t=new Date(j.created_at);return t>=from&&t<to;}).reduce((s,j)=>s+Number(j.pages_printed||0),0);
    return{...r,pagesPrinted:pages};
  });
  const last=rwp[0]||null;
  const pgs=last?last.pagesPrinted:null;
  const pct=pgs!==null?Math.min((pgs/LIMIT)*100,100):0;
  const exceeded=pgs!==null&&pgs>=LIMIT, near=pgs!==null&&pgs>=LIMIT*.75&&!exceeded;
  const barColor=exceeded?"#ff4444":near?"#FFD400":"#28C840";
  const fmt=(r)=>r.time?`${r.date} at ${r.time}`:r.date;

  const iStyle={background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,212,0,.2)",borderRadius:8,padding:"10px 14px",color:"#F5F5F5",fontFamily:"'DM Mono',monospace",fontSize:".88rem",outline:"none"};

  return (
    <div style={{background:"rgba(255,255,255,.025)",border:`1px solid ${exceeded?"rgba(255,68,68,.3)":near?"rgba(255,212,0,.4)":"rgba(40,200,64,.2)"}`,borderRadius:14,padding:"18px 20px",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:".9rem",color:"#FFD400",letterSpacing:".06em"}}>🖨 CARTRIDGE TRACKER</div>
        <button onClick={()=>setShowLog(!showLog)} style={{background:"rgba(255,212,0,.1)",border:"1px solid rgba(255,212,0,.3)",color:"#FFD400",padding:"6px 14px",borderRadius:99,fontSize:".72rem",fontWeight:700,cursor:"none",letterSpacing:".06em",textTransform:"uppercase"}}>
          {showLog?"✕ Close":"+ Log Refill"}
        </button>
      </div>

      {pgs===null&&<p style={{fontSize:".85rem",color:"rgba(245,245,245,.45)",marginBottom:10}}>No refill logged yet. Log your first refill to start tracking.</p>}

      {(exceeded||near)&&(
        <div style={{background:exceeded?"rgba(255,68,68,.08)":"rgba(255,212,0,.07)",border:`1px solid ${exceeded?"rgba(255,68,68,.3)":"rgba(255,212,0,.3)"}`,borderRadius:10,padding:"10px 14px",fontSize:".85rem",color:exceeded?"#ff6b6b":"#FFD400",marginBottom:12,fontWeight:600}}>
          {exceeded?`🚨 ${pgs} pages — exceeded 1,000 limit! Refill now.`:`⚠ ${pgs} / ${LIMIT} pages — getting close.`}
        </div>
      )}

      {pgs!==null&&(
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:".8rem",color:"rgba(245,245,245,.45)",marginBottom:6}}>
            <span style={{color:barColor,fontWeight:600}}>{pgs} / {LIMIT} pages since last refill</span>
            <span>Last: {fmt(last)}{last.note?` — ${last.note}`:""}</span>
          </div>
          <div style={{background:"rgba(255,255,255,.06)",borderRadius:99,height:10,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:99,background:barColor,width:`${pct}%`,transition:"width .5s ease",boxShadow:`0 0 12px ${barColor}80`}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:".7rem",color:"rgba(255,255,255,.2)",marginTop:4}}>
            <span>0</span><span>500</span><span>1000</span>
          </div>
        </div>
      )}

      {showLog&&(
        <div style={{background:"rgba(255,212,0,.04)",border:"1px solid rgba(255,212,0,.15)",borderRadius:12,padding:16,marginBottom:12}}>
          <div style={{fontSize:".72rem",fontWeight:700,color:"#FFD400",letterSpacing:".1em",textTransform:"uppercase",marginBottom:12}}>Log New Refill</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
            {[["Date","date",newDate,setNewDate],["Time","time",newTime,setNewTime],["Note","text",newNote,setNewNote]].map(([lbl,type,val,setter])=>(
              <div key={lbl} style={{display:"flex",flexDirection:"column",gap:4}}>
                <label style={{fontSize:".68rem",fontWeight:700,color:"rgba(245,245,245,.45)",letterSpacing:".08em",textTransform:"uppercase"}}>{lbl}</label>
                <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={type==="text"?"e.g. Black cartridge":""} style={{...iStyle,minWidth:type==="text"?160:110}}/>
              </div>
            ))}
            <button onClick={add} style={{background:"#FFD400",color:"#0B0B0B",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:800,fontSize:".82rem",cursor:"none",alignSelf:"flex-end"}}>Save</button>
          </div>
        </div>
      )}

      {rwp.length>0&&(
        <details open>
          <summary style={{cursor:"none",fontSize:".8rem",color:"rgba(245,245,245,.45)",fontWeight:600,marginBottom:8}}>📜 Refill History ({rwp.length} entries)</summary>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:8}}>
            {rwp.map((r,i)=>(
              <div key={r.id}>
                {editId===r.id?(
                  <div style={{background:"rgba(255,212,0,.05)",border:"1px solid rgba(255,212,0,.2)",borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:10}}>
                    <div style={{fontSize:".72rem",fontWeight:700,color:"#FFD400",letterSpacing:".08em"}}>✏ EDITING</div>
                    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                      {[["Date","date",editDate,setEditDate],["Time","time",editTime,setEditTime],["Note","text",editNote,setEditNote]].map(([lbl,type,val,setter])=>(
                        <div key={lbl} style={{display:"flex",flexDirection:"column",gap:4}}>
                          <label style={{fontSize:".68rem",color:"rgba(245,245,245,.45)",fontWeight:600}}>{lbl}</label>
                          <input type={type} value={val} onChange={e=>setter(e.target.value)} style={{...iStyle,minWidth:type==="text"?140:100}}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={saveEdit} style={{background:"rgba(255,212,0,.15)",border:"1px solid rgba(255,212,0,.3)",color:"#FFD400",padding:"6px 16px",borderRadius:8,fontSize:".78rem",fontWeight:700,cursor:"none"}}>✓ Save</button>
                      <button onClick={()=>setEditId(null)} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(245,245,245,.45)",padding:"6px 14px",borderRadius:8,fontSize:".78rem",cursor:"none"}}>Cancel</button>
                    </div>
                  </div>
                ):(
                  <div style={{background:i===0?"rgba(40,200,64,.06)":"rgba(255,255,255,.025)",border:`1px solid ${i===0?"rgba(40,200,64,.2)":"rgba(255,255,255,.06)"}`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                    <div>
                      <span style={{fontSize:".85rem",fontWeight:600,color:i===0?"#28C840":"#F5F5F5"}}>{i===0?"🟢 ":""}{fmt(r)}</span>
                      {r.note&&<span style={{fontSize:".78rem",color:"rgba(245,245,245,.45)",marginLeft:8}}>— {r.note}</span>}
                      <div style={{marginTop:4,display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:".72rem",background:r.pagesPrinted>=LIMIT?"rgba(255,68,68,.15)":r.pagesPrinted>=LIMIT*.75?"rgba(255,212,0,.12)":"rgba(40,200,64,.1)",color:r.pagesPrinted>=LIMIT?"#ff6b6b":r.pagesPrinted>=LIMIT*.75?"#FFD400":"#28C840",padding:"2px 10px",borderRadius:99,fontWeight:700}}>{r.pagesPrinted} pages</span>
                        {r.pagesPrinted>=LIMIT&&<span style={{fontSize:".68rem",color:"#ff6b6b",fontWeight:700}}>⚠ Over limit</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>startEdit(r)} style={{background:"rgba(255,212,0,.08)",border:"1px solid rgba(255,212,0,.2)",color:"#FFD400",width:30,height:30,borderRadius:8,cursor:"none",fontSize:".8rem"}}>✏</button>
                      <button onClick={()=>del(r.id)} style={{background:"rgba(255,68,68,.08)",border:"1px solid rgba(255,68,68,.2)",color:"#ff6b6b",width:30,height:30,borderRadius:8,cursor:"none",fontSize:".85rem"}}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   STAT CARD
══════════════════════════════════════════════════════════ */
function StatCard({ icon, label, value, color="#FFD400", sub="" }) {
  return (
    <div style={{background:"rgba(255,255,255,.025)",border:`1px solid ${color}25`,borderRadius:14,padding:"16px 18px",flex:1,minWidth:120,transition:"transform .2s,border-color .2s,box-shadow .2s",cursor:"default"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=`${color}55`;e.currentTarget.style.boxShadow=`0 12px 30px rgba(0,0,0,.4),0 0 20px ${color}15`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.borderColor=`${color}25`;e.currentTarget.style.boxShadow="";}}>
      <div style={{fontSize:"1.4rem",marginBottom:6}}>{icon}</div>
      <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.6rem",color,lineHeight:1,textShadow:`0 0 20px ${color}60`}}>{value}</div>
      <div style={{fontSize:".72rem",color:"rgba(245,245,245,.45)",marginTop:4,letterSpacing:".06em",textTransform:"uppercase"}}>{label}</div>
      {sub&&<div style={{fontSize:".7rem",color:"rgba(245,245,245,.25)",marginTop:2}}>{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REVENUE CHART
══════════════════════════════════════════════════════════ */
function RevenueChart({ jobs }) {
  const localDateStr = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    const targetStr = localDateStr(d);
    const rev = jobs.filter(j => {
      if (!j.created_at) return false;
      return localDateStr(new Date(j.created_at)) === targetStr;
    }).reduce((s, j) => s + Number(j.revenue || 0), 0);
    days.push({ label, rev });
  }
  const max = Math.max(...days.map(d => d.rev), 1);
  return (
    <div style={{background:"rgba(255,255,255,.025)",border:"1px solid rgba(255,212,0,.1)",borderRadius:14,padding:"18px 20px",marginBottom:16}}>
      <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:".85rem",color:"#FFD400",letterSpacing:".08em",marginBottom:16}}>📈 REVENUE — LAST 7 DAYS</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:8,height:80}}>
        {days.map((d,i)=>(
          <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{fontSize:".6rem",color:"rgba(255,212,0,.6)",fontFamily:"'DM Mono',monospace",minHeight:14}}>{d.rev>0?`₹${d.rev}`:""}</div>
            <div style={{width:"100%",background:d.rev>0?"#FFD400":"rgba(255,212,0,.1)",borderRadius:"4px 4px 0 0",height:`${Math.max((d.rev/max)*60,d.rev>0?4:2)}px`,transition:"height .5s ease",boxShadow:d.rev>0?"0 0 10px rgba(255,212,0,.4)":"none"}}/>
            <div style={{fontSize:".6rem",color:"rgba(245,245,245,.35)",fontFamily:"'DM Mono',monospace"}}>{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════════════════════ */
function Dashboard() {
  const [machineId, setMachineId]       = useState("1");
  const [machineData, setMachineData]   = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [scrolled, setScrolled]         = useState(false);
  const [searchPhone, setSearchPhone]   = useState("");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hideTest, setHideTest]         = useState(false);
  const [activeTab, setActiveTab]       = useState("overview");

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>30);
    window.addEventListener("scroll",fn,{passive:true});
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  const load = async () => {
    if (!machineId) return;
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/chkServer/${machineId}/`);
      if (!res.ok) throw new Error();
      setMachineData(await res.json());
    } catch { setError("Machine not found or server error."); setMachineData(null); }
    setLoading(false);
  };

  const allJobs = machineData?.print_jobs || [];
  const filteredJobs = allJobs.filter(job => {
    const d = new Date(job.created_at);
    return(
      (!searchPhone || job.phone_no.includes(searchPhone)) &&
      (!startDate   || d >= new Date(startDate)) &&
      (!endDate     || d <= new Date(endDate+"T23:59:59")) &&
      (!statusFilter|| job.status===statusFilter) &&
      (!hideTest    || (job.phone_no!=="0"&&job.phone_no!=="7486086769"))
    );
  });

  const totalRevenue = filteredJobs.reduce((s,j)=>s+Number(j.revenue||0),0);
  const totalPages   = filteredJobs.reduce((s,j)=>s+Number(j.pages_printed||0),0);
  const phoneCounts  = {};
  filteredJobs.forEach(j=>{phoneCounts[j.phone_no]=(phoneCounts[j.phone_no]||0)+1;});
  const newCust   = Object.values(phoneCounts).filter(c=>c===1).length;
  const loyalCust = Object.values(phoneCounts).filter(c=>c>1).length;

  const statusColor = s => s==="PRINTING"?"#28C840":s==="PENDING"?"#FFD400":s==="DONE"?"#28C840":"rgba(245,245,245,.5)";

  const iStyle = {background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,212,0,.2)",borderRadius:10,padding:"11px 16px",color:"#F5F5F5",fontFamily:"'DM Mono',monospace",fontSize:".88rem",outline:"none",width:"100%"};
  const glass  = {background:"rgba(17,17,17,.85)",backdropFilter:"blur(16px)",border:"1px solid rgba(255,212,0,.1)",borderRadius:18,padding:"20px"};

  const tabs = [
    {id:"overview", label:"📊 Overview"},
    {id:"jobs",     label:"🖨 Print Jobs"},
    {id:"cartridge",label:"🖨 Cartridge"},
  ];

  return (
    <div style={{background:"#0B0B0B",minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:"#F5F5F5",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Black+Han+Sans&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0B0B0B;overflow-x:hidden}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow-aura{0%,100%{opacity:.7;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#FFD400;border-radius:2px}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.5) sepia(1) saturate(5) hue-rotate(10deg);cursor:none}
        select option{background:#111;color:#F5F5F5}
      `}</style>

      <AnimationCanvas/>
      <div style={{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(255,212,0,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,212,0,.03) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.03) 2px,rgba(0,0,0,.03) 4px)",pointerEvents:"none",zIndex:1}}/>
      <div style={{position:"fixed",top:"-150px",left:"50%",width:600,height:400,background:"radial-gradient(circle,rgba(255,212,0,.08) 0%,transparent 60%)",pointerEvents:"none",zIndex:0,animation:"glow-aura 8s ease-in-out infinite"}}/>

      {/* NAVBAR */}
      <nav style={{position:"sticky",top:0,zIndex:200,background:scrolled?"rgba(11,11,11,.95)":"rgba(11,11,11,.7)",backdropFilter:"blur(24px)",borderBottom:"1px solid rgba(255,212,0,.12)",height:60,padding:"0 20px",display:"flex",alignItems:"center",justifyContent:"space-between",transition:"all .3s",boxShadow:scrolled?"0 0 40px rgba(255,212,0,.05)":"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"#FFD400",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.1rem",color:"#FFD400",lineHeight:1}}>ADMIN PANEL</div>
            <div style={{fontSize:".58rem",color:"rgba(255,255,255,.3)",letterSpacing:".1em",textTransform:"uppercase"}}>CopyCat Dashboard</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,212,0,.08)",border:"1px solid rgba(255,212,0,.2)",padding:"4px 12px",borderRadius:99}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 8px #22c55e",animation:"blink 2s ease-in-out infinite"}}/>
            <span style={{fontSize:".65rem",fontWeight:700,letterSpacing:".1em",color:"#FFD400"}}>LIVE</span>
          </div>
          <a href="/" style={{background:"rgba(255,212,0,.1)",border:"1px solid rgba(255,212,0,.2)",color:"#FFD400",fontSize:".75rem",fontWeight:700,padding:"7px 16px",borderRadius:8,textDecoration:"none",letterSpacing:".04em"}}>← Back</a>
        </div>
      </nav>

      {/* TABS */}
      <div style={{borderBottom:"1px solid rgba(255,212,0,.1)",background:"rgba(11,11,11,.6)",backdropFilter:"blur(10px)",position:"sticky",top:60,zIndex:199}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",overflowX:"auto",padding:"0 16px"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{flex:"0 0 auto",padding:"14px 20px",background:"transparent",border:"none",borderBottom:`2px solid ${activeTab===t.id?"#FFD400":"transparent"}`,color:activeTab===t.id?"#FFD400":"rgba(255,255,255,.35)",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:".82rem",letterSpacing:".04em",cursor:"none",transition:"all .2s",whiteSpace:"nowrap"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"24px 16px 80px",position:"relative",zIndex:2}}>

        {/* Machine loader */}
        <div style={{...glass,marginBottom:20,animation:"fadeUp .5s ease"}}>
          <div style={{fontSize:".68rem",fontWeight:700,color:"#FFD400",letterSpacing:".14em",textTransform:"uppercase",marginBottom:14}}>Load Machine</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
            <div style={{flex:1,minWidth:160}}>
              <input type="number" placeholder="Machine ID" value={machineId} onChange={e=>setMachineId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} style={iStyle}/>
            </div>
            <button onClick={load} disabled={loading} style={{background:"#FFD400",color:"#0B0B0B",fontFamily:"'Black Han Sans',sans-serif",fontSize:".9rem",letterSpacing:".06em",border:"none",borderRadius:10,padding:"12px 28px",cursor:"none",opacity:loading?.6:1,transition:"all .2s",whiteSpace:"nowrap",boxShadow:loading?"none":"0 0 20px rgba(255,212,0,.25)"}}>
              {loading?<svg style={{animation:"spin .9s linear infinite"}} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>:"Load Machine"}
            </button>
          </div>
          {error&&<p style={{marginTop:10,color:"#ff6b6b",fontSize:".85rem",fontWeight:600}}>⚠ {error}</p>}
        </div>

        {/* Filters */}
        <div style={{...glass,marginBottom:20,animation:"fadeUp .5s .1s ease both"}}>
          <div style={{fontSize:".68rem",fontWeight:700,color:"#FFD400",letterSpacing:".14em",textTransform:"uppercase",marginBottom:14}}>Filters</div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"none",fontSize:".85rem",color:"rgba(245,245,245,.45)",userSelect:"none",padding:"10px 14px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,whiteSpace:"nowrap"}}>
              <div onClick={()=>setHideTest(h=>!h)} style={{width:36,height:20,borderRadius:99,background:hideTest?"rgba(255,212,0,.8)":"rgba(255,255,255,.1)",border:`1px solid ${hideTest?"#FFD400":"rgba(255,255,255,.15)"}`,position:"relative",transition:"all .2s",cursor:"none"}}>
                <div style={{position:"absolute",top:2,left:hideTest?18:2,width:14,height:14,borderRadius:"50%",background:hideTest?"#0B0B0B":"rgba(255,255,255,.5)",transition:"left .2s"}}/>
              </div>
              Hide test numbers
            </label>
            {[["Search phone","text",searchPhone,setSearchPhone],["From date","date",startDate,setStartDate],["To date","date",endDate,setEndDate]].map(([lbl,type,val,setter])=>(
              <div key={lbl} style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:130}}>
                <label style={{fontSize:".68rem",color:"rgba(245,245,245,.45)",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>{lbl}</label>
                <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={lbl} style={iStyle}/>
              </div>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,minWidth:130}}>
              <label style={{fontSize:".68rem",color:"rgba(245,245,245,.45)",fontWeight:600,letterSpacing:".06em",textTransform:"uppercase"}}>Status</label>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{...iStyle,appearance:"none"}}>
                <option value="">All Status</option>
                <option value="DONE">DONE</option>
                <option value="PRINTING">PRINTING</option>
                <option value="PENDING">PENDING</option>
                <option value="DELAY">DELAY</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab==="overview" && machineData && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <div style={{...glass,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:16,marginBottom:16}}>
                <div>
                  <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.8rem",color:"#FFD400",letterSpacing:"-.01em",lineHeight:1}}>Machine #{machineData.machine_id}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:"#28C840",animation:"blink 1.4s ease-in-out infinite"}}/>
                    <span style={{fontSize:".82rem",color:"rgba(245,245,245,.45)"}}>{machineData.machine_status}</span>
                    {machineData.machine_report&&<span style={{fontSize:".75rem",color:"rgba(245,245,245,.3)",marginLeft:4}}>— {machineData.machine_report}</span>}
                  </div>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {[["Pages Left",machineData.pages_left,"#28C840","📄"],["Total Jobs",machineData.print_jobs.length,"#FFD400","📋"]].map(([l,v,c,ic])=>(
                    <div key={l} style={{background:`${c}10`,border:`1px solid ${c}30`,borderRadius:12,padding:"12px 20px",textAlign:"center"}}>
                      <div style={{fontSize:"1.2rem",marginBottom:4}}>{ic}</div>
                      <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.4rem",color:c,lineHeight:1}}>{v}</div>
                      <div style={{fontSize:".68rem",color:"rgba(245,245,245,.35)",letterSpacing:".06em",textTransform:"uppercase",marginTop:2}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <RevenueChart jobs={filteredJobs}/>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
              <StatCard icon="🔍" label="Results"         value={filteredJobs.length} color="#F5F5F5"/>
              <StatCard icon="💰" label="Revenue"         value={`₹${totalRevenue}`}  color="#28C840"/>
              <StatCard icon="🖨" label="Pages Printed"   value={totalPages}           color="#FFD400"/>
              <StatCard icon="🆕" label="New Customers"   value={newCust}              color="#60a5fa"/>
              <StatCard icon="👑" label="Loyal Customers" value={loyalCust}            color="#fbbf24"/>
            </div>
          </div>
        )}

        {/* ── JOBS TAB ── */}
        {activeTab==="jobs" && machineData && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
              {[["Total Results",filteredJobs.length,"rgba(255,255,255,.1)","#F5F5F5"],["Total Revenue",`₹${totalRevenue}`,"rgba(40,200,64,.1)","#28C840"],["Total Pages",totalPages,"rgba(255,212,0,.1)","#FFD400"],["New Customers",newCust,"rgba(96,165,250,.1)","#60a5fa"],["Loyal Customers",loyalCust,"rgba(251,191,36,.1)","#fbbf24"]].map(([l,v,bg,c])=>(
                <div key={l} style={{background:bg,border:`1px solid ${c}30`,borderRadius:10,padding:"10px 16px",fontSize:".82rem",fontWeight:700}}>
                  <span style={{color:"rgba(245,245,245,.5)"}}>{l}: </span>
                  <span style={{color:c,fontFamily:"'DM Mono',monospace"}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{...glass,overflowX:"auto"}}>
              <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:".85rem",color:"#FFD400",letterSpacing:".08em",marginBottom:16}}>PRINT JOBS</div>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:820}}>
                <thead>
                  <tr>
                    {["ID","Phone","Copies","Pages","Revenue","Status","OTP","Created"].map(h=>(
                      <th key={h} style={{padding:"10px 14px",textAlign:"left",borderBottom:"1px solid rgba(255,212,0,.12)",fontSize:".68rem",fontWeight:700,color:"rgba(245,245,245,.45)",letterSpacing:".1em",textTransform:"uppercase",background:"rgba(255,212,0,.02)",whiteSpace:"nowrap"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length===0?(
                    <tr><td colSpan={8} style={{padding:"40px",textAlign:"center",color:"rgba(245,245,245,.35)",fontSize:".9rem"}}>No jobs match your filters.</td></tr>
                  ):filteredJobs.map((job,idx)=>(
                    <tr key={job.id}
                      style={{background:phoneCounts[job.phone_no]>1?"rgba(255,212,0,.04)":idx%2===0?"transparent":"rgba(255,255,255,.01)",borderBottom:"1px solid rgba(255,255,255,.04)",transition:"background .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,212,0,.06)"}
                      onMouseLeave={e=>e.currentTarget.style.background=phoneCounts[job.phone_no]>1?"rgba(255,212,0,.04)":idx%2===0?"transparent":"rgba(255,255,255,.01)"}>
                      <td style={{padding:"10px 14px",fontSize:".82rem",color:"rgba(245,245,245,.45)"}}>{job.id}</td>
                      <td style={{padding:"10px 14px",fontSize:".82rem"}}>
                        {job.phone_no}
                        {phoneCounts[job.phone_no]>1&&<span style={{marginLeft:6,fontSize:".7rem",background:"rgba(255,212,0,.12)",color:"#FFD400",padding:"1px 8px",borderRadius:99,fontWeight:700}}>👑 loyal</span>}
                      </td>
                      <td style={{padding:"10px 14px",fontSize:".82rem"}}>{job.no_of_copies}</td>
                      <td style={{padding:"10px 14px",fontSize:".82rem"}}>{job.pages_printed}</td>
                      <td style={{padding:"10px 14px",fontSize:".82rem",color:"#28C840",fontWeight:600}}>₹{job.revenue}</td>
                      <td style={{padding:"10px 14px"}}>
                        <span style={{fontSize:".72rem",fontWeight:700,padding:"3px 10px",borderRadius:99,background:`${statusColor(job.status)}18`,color:statusColor(job.status),border:`1px solid ${statusColor(job.status)}40`}}>{job.status}</span>
                      </td>
                      <td style={{padding:"10px 14px"}}>
                        {job.otp != null ? (
                          <span style={{fontFamily:"'DM Mono',monospace",fontSize:".82rem",fontWeight:700,letterSpacing:".12em",background:"rgba(255,212,0,.08)",color:"#FFD400",padding:"3px 10px",borderRadius:8,border:"1px solid rgba(255,212,0,.2)"}}>{job.otp}</span>
                        ) : (
                          <span style={{fontSize:".75rem",color:"rgba(245,245,245,.2)"}}>—</span>
                        )}
                      </td>
                      <td style={{padding:"10px 14px",fontSize:".78rem",color:"rgba(245,245,245,.45)",whiteSpace:"nowrap"}}>{new Date(job.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── CARTRIDGE TAB ── */}
        {activeTab==="cartridge" && machineData && (
          <div style={{animation:"fadeUp .4s ease"}}>
            <CartridgeTracker
              machineId={machineData.machine_id}
              filteredJobs={allJobs.filter(j=>j.phone_no!=="0"&&j.phone_no!=="7486086769")}
            />
          </div>
        )}

        {/* Empty state */}
        {!machineData && !loading && (
          <div style={{textAlign:"center",padding:"80px 24px",animation:"fadeUp .6s .3s ease both"}}>
            <div style={{fontSize:"4rem",marginBottom:20,opacity:.3}}>🖨️</div>
            <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:"1.4rem",color:"rgba(245,245,245,.35)",letterSpacing:".04em",marginBottom:8}}>Enter a Machine ID above</div>
            <div style={{fontSize:".85rem",color:"rgba(245,245,245,.2)"}}>Load machine data to view analytics, print jobs, and cartridge status.</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════════ */
export default function Root() {
  return (
    <PinGate>
      <Dashboard />
    </PinGate>
  );
}