import { useState, useRef, useEffect, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import './Second.css'
import newlogo from "../assets/New_Logo.jpeg";
import clickSound from "../assets/Button-Clicking.mp3";
import { useNavigate, useLocation } from "react-router-dom";
import alertSound from "../assets/Alert.mp3";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
GlobalWorkerOptions.workerSrc = pdfWorker;

const SINGLE_PRICE = 2;
const DOUBLE_PRICE = 3;
const API_BASE = "https://api.copykat.co.in";
// const API_BASE = "https://backend-copykat.onrender.com";
// const API_BASE = "http://127.0.0.1:8000/";
const MAX_FILES = 20;
const DEV_MODE = false;

// ── ADMIN TOGGLE — set to true to reveal DELAY-CAT feature ──────────────────
const SHOW_DELAY_CAT = false; // ← flip this to true when you're ready to launch

function uid() {
  return "f_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}
function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function drawCat(c, x, y, size, alpha, angle = 0, blinkT = 0) {
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(angle); c.scale(size, size);
  const Y = "rgba(255,212,0,1)", YD = "rgba(200,160,0,1)";
  c.beginPath(); c.ellipse(0, 8, 10, 8, 0, 0, Math.PI * 2); c.fillStyle = Y; c.fill();
  c.beginPath(); c.arc(0, -4, 9, 0, Math.PI * 2); c.fillStyle = Y; c.fill();
  c.beginPath(); c.moveTo(-8, -10); c.lineTo(-12, -20); c.lineTo(-3, -11); c.fillStyle = Y; c.fill();
  c.beginPath(); c.moveTo(8, -10); c.lineTo(12, -20); c.lineTo(3, -11); c.fillStyle = Y; c.fill();
  c.beginPath(); c.moveTo(-7, -11); c.lineTo(-10, -18); c.lineTo(-4, -12); c.fillStyle = YD; c.fill();
  c.beginPath(); c.moveTo(7, -11); c.lineTo(10, -18); c.lineTo(4, -12); c.fillStyle = YD; c.fill();
  const eyeH = blinkT > 0.9 ? 0.5 : 4;
  c.fillStyle = "#0B0B0B";
  c.beginPath(); c.ellipse(-3.5, -5, 2.5, eyeH, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(3.5, -5, 2.5, eyeH, 0, 0, Math.PI * 2); c.fill();
  if (blinkT <= 0.9) {
    c.fillStyle = "rgba(255,255,255,0.8)";
    c.beginPath(); c.arc(-2.5, -6, 0.8, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(4.5, -6, 0.8, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = YD; c.beginPath(); c.moveTo(0, -1); c.lineTo(-1.5, -3); c.lineTo(1.5, -3); c.fill();
  c.strokeStyle = "rgba(0,0,0,0.5)"; c.lineWidth = 0.6;
  c.beginPath(); c.moveTo(0, -1); c.quadraticCurveTo(-3, 1, -4, 0); c.stroke();
  c.beginPath(); c.moveTo(0, -1); c.quadraticCurveTo(3, 1, 4, 0); c.stroke();
  c.strokeStyle = "rgba(0,0,0,0.35)"; c.lineWidth = 0.5;
  [-1, 0, 1].forEach((i) => {
    c.beginPath(); c.moveTo(-2, -2 + i * 1.2); c.lineTo(-14, -1 + i * 1.5); c.stroke();
    c.beginPath(); c.moveTo(2, -2 + i * 1.2); c.lineTo(14, -1 + i * 1.5); c.stroke();
  });
  c.strokeStyle = Y; c.lineWidth = 3; c.lineCap = "round";
  c.beginPath(); c.moveTo(8, 12); c.bezierCurveTo(18, 20, 22, 8, 16, 2); c.stroke();
  c.restore();
}
function drawPaper(c, x, y, w, h, alpha, angle, lines = 3) {
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(angle);
  c.shadowColor = "rgba(0,0,0,0.3)"; c.shadowBlur = 8; c.shadowOffsetY = 3;
  c.fillStyle = "rgba(245,245,230,0.9)";
  c.beginPath(); c.moveTo(-w / 2, -h / 2 + 4); c.lineTo(-w / 2 + 4, -h / 2); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2, h / 2); c.lineTo(-w / 2, h / 2); c.closePath(); c.fill();
  c.shadowBlur = 0; c.fillStyle = "rgba(210,210,195,0.9)";
  c.beginPath(); c.moveTo(-w / 2, -h / 2 + 4); c.lineTo(-w / 2 + 4, -h / 2); c.lineTo(-w / 2 + 4, -h / 2 + 4); c.closePath(); c.fill();
  c.fillStyle = "rgba(255,212,0,0.7)"; c.fillRect(-w / 2 + 4, -h / 2, w - 4, 3);
  c.fillStyle = "rgba(0,0,0,0.15)";
  for (let i = 0; i < lines; i++) { const lw = i === lines - 1 ? w * 0.4 : w * 0.75; c.fillRect(-w / 2 + 6, -h / 2 + 9 + i * 7, lw, 1.5); }
  c.restore();
}
function drawPrinterIcon(c, x, y, size, alpha) {
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(size, size);
  c.fillStyle = "rgba(255,212,0,0.18)"; c.strokeStyle = "rgba(255,212,0,0.5)"; c.lineWidth = 1.5;
  c.beginPath(); c.roundRect(-18, -8, 36, 22, 4); c.fill(); c.stroke();
  c.fillStyle = "rgba(245,245,230,0.7)"; c.beginPath(); c.roundRect(-10, 10, 20, 12, 2); c.fill();
  c.strokeStyle = "rgba(255,212,0,0.3)"; c.stroke();
  c.fillStyle = "rgba(245,245,230,0.5)"; c.beginPath(); c.roundRect(-8, -18, 16, 12, 2); c.fill();
  c.fillStyle = "rgba(40,200,64,0.9)"; c.beginPath(); c.arc(12, -2, 2.5, 0, Math.PI * 2); c.fill();
  c.restore();
}
function drawPawPrint(c, x, y, size, alpha, angle = 0) {
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(angle);
  c.fillStyle = "rgba(255,212,0,0.6)";
  c.beginPath(); c.ellipse(0, 0, size * 1.1, size * 0.9, 0, 0, Math.PI * 2); c.fill();
  [[-size * 1.2, -size * 1.4], [0, -size * 1.7], [size * 1.2, -size * 1.4], [size * 1.8, -size * 0.5]].forEach(([tx, ty]) => {
    c.beginPath(); c.ellipse(tx, ty, size * 0.6, size * 0.55, 0, 0, Math.PI * 2); c.fill();
  });
  c.restore();
}
function drawYarnBall(c, x, y, r, alpha, t) {
  c.save(); c.globalAlpha = alpha; c.strokeStyle = "rgba(255,212,0,0.55)"; c.lineWidth = 1.2;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,212,0,0.06)"; c.fill(); c.stroke();
  for (let i = 0; i < 6; i++) {
    const a = t * 0.3 + i * (Math.PI / 3);
    c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    c.quadraticCurveTo(x + Math.cos(a + Math.PI * 0.6) * r * 0.5, y + Math.sin(a + Math.PI * 0.6) * r * 0.5, x + Math.cos(a + Math.PI) * r, y + Math.sin(a + Math.PI) * r);
    c.stroke();
  }
  c.restore();
}

function AnimationCanvas() {
  const particlesRef = useRef(null);
  const catRef = useRef(null);
  useEffect(() => {
    const pc = particlesRef.current; const cc = catRef.current;
    if (!pc || !cc) return;
    const ctxP = pc.getContext("2d"); const ctx2 = cc.getContext("2d");
    let W, H, frameCount = 0, entities = [], printers = [], particles = [], animId1;
    function resize() { W = pc.width = cc.width = window.innerWidth; H = pc.height = cc.height = window.innerHeight; }
    resize(); window.addEventListener("resize", resize);
    function Particle() {
      this.reset = function () { this.x = Math.random() * W; this.y = Math.random() * H; this.r = Math.random() * 1.2 + 0.3; this.vx = (Math.random() - 0.5) * 0.25; this.vy = (Math.random() - 0.5) * 0.25; this.alpha = Math.random() * 0.3 + 0.06; this.life = Math.random() * 280 + 80; this.age = 0; }; this.reset();
    }
    for (let i = 0; i < 55; i++) { const p = new Particle(); p.age = Math.floor(Math.random() * p.life); particles.push(p); }
    function drawParticles() { ctxP.clearRect(0, 0, W, H); particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.age++; if (p.age > p.life) p.reset(); const fade = Math.sin((p.age / p.life) * Math.PI); ctxP.beginPath(); ctxP.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctxP.fillStyle = `rgba(255,212,0,${p.alpha * fade})`; ctxP.fill(); }); }
    class FloatCat { constructor() { this.init() } init() { this.x = -80 + Math.random() * (W + 160); this.y = H + 50; this.size = 0.5 + Math.random() * 0.5; this.vx = (Math.random() - 0.5) * 0.3; this.vy = -(0.4 + Math.random() * 0.45); this.alpha = 0.1 + Math.random() * 0.16; this.angle = (Math.random() - 0.5) * 0.3; this.wobble = Math.random() * Math.PI * 2; this.wobbleSpeed = 0.012 + Math.random() * 0.015; this.blinkTimer = Math.random() * 200; this.blinkInterval = 150 + Math.random() * 200; this.blinking = 0; this.dead = false; } update() { this.wobble += this.wobbleSpeed; this.x += this.vx + Math.sin(this.wobble) * 0.3; this.y += this.vy; this.blinkTimer++; if (this.blinkTimer > this.blinkInterval) this.blinking = Math.min(1, this.blinking + 0.15); else this.blinking = Math.max(0, this.blinking - 0.12); if (this.blinkTimer > this.blinkInterval + 15) this.blinkTimer = 0; if (this.y < -120) this.dead = true; } draw(c) { drawCat(c, this.x, this.y, this.size, this.alpha, this.angle, this.blinking); } }
    class FlyingPaper { constructor(fp = false) { this.init(fp) } init(fp = false) { this.x = fp ? (this.printerX || Math.random() * W) : Math.random() * W; this.y = fp ? (H * 0.3 + Math.random() * H * 0.4) : H + 30; this.vx = (Math.random() - 0.5) * (fp ? 1.8 : 0.6); this.vy = -(fp ? 1.5 + Math.random() * 1.5 : 0.4 + Math.random() * 0.5); this.w = 28 + Math.random() * 20; this.h = this.w * 1.35; this.alpha = 0.07 + Math.random() * 0.12; this.angle = (Math.random() - 0.5) * 0.5; this.spin = (Math.random() - 0.5) * 0.012; this.lines = Math.floor(2 + Math.random() * 4); this.dead = false; this.gravity = 0.006; } update() { this.x += this.vx; this.vy += this.gravity; this.y += this.vy; this.angle += this.spin; if (this.y < -80) this.dead = true; } draw(c) { drawPaper(c, this.x, this.y, this.w, this.h, this.alpha, this.angle, this.lines); } }
    class DriftingPaw { constructor() { this.init() } init() { this.x = Math.random() * W; this.y = H + 20; this.size = 4 + Math.random() * 6; this.alpha = 0.05 + Math.random() * 0.1; this.angle = (Math.random() - 0.5) * Math.PI; this.vx = (Math.random() - 0.5) * 0.4; this.vy = -(0.3 + Math.random() * 0.35); this.dead = false; } update() { this.x += this.vx; this.y += this.vy; if (this.y < -20) this.dead = true; } draw(c) { drawPawPrint(c, this.x, this.y, this.size, this.alpha, this.angle); } }
    class StaticPrinter { constructor() { this.x = 50 + Math.random() * (W - 100); this.y = 80 + Math.random() * (H - 200); this.size = 0.75 + Math.random() * 0.65; this.alpha = 0.06 + Math.random() * 0.08; this.ejectTimer = 0; this.ejectInterval = 160 + Math.random() * 220; } update() { this.ejectTimer++; if (this.ejectTimer > this.ejectInterval) { this.ejectTimer = 0; const p = new FlyingPaper(true); p.x = this.x; p.y = this.y - 20 * this.size; p.vx = (Math.random() - 0.5) * 1.2; p.vy = -(1 + Math.random()); entities.push(p); } } draw(c) { drawPrinterIcon(c, this.x, this.y, this.size, this.alpha); } }
    class YarnBallFloat { constructor() { this.init() } init() { this.x = Math.random() * W; this.y = H + 40; this.r = 12 + Math.random() * 16; this.alpha = 0.05 + Math.random() * 0.09; this.vx = (Math.random() - 0.5) * 0.3; this.vy = -(0.22 + Math.random() * 0.28); this.t = Math.random() * 100; this.dead = false; } update() { this.x += this.vx; this.y += this.vy; this.t += 0.04; if (this.y < -50) this.dead = true; } draw(c) { drawYarnBall(c, this.x, this.y, this.r, this.alpha, this.t); } }
    for (let i = 0; i < 4; i++) printers.push(new StaticPrinter());
    for (let i = 0; i < 7; i++) { const e = new FloatCat(); e.y = Math.random() * H; entities.push(e); }
    for (let i = 0; i < 10; i++) { const e = new FlyingPaper(); e.y = Math.random() * H; entities.push(e); }
    for (let i = 0; i < 5; i++) { const e = new DriftingPaw(); e.y = Math.random() * H; entities.push(e); }
    for (let i = 0; i < 3; i++) { const e = new YarnBallFloat(); e.y = Math.random() * H; entities.push(e); }
    function loop() { drawParticles(); cc.width = window.innerWidth; cc.height = window.innerHeight; ctx2.clearRect(0, 0, cc.width, cc.height); frameCount++; if (frameCount % 55 === 0 && entities.filter(e => e instanceof FloatCat).length < 10) entities.push(new FloatCat()); if (frameCount % 38 === 0 && entities.filter(e => e instanceof FlyingPaper).length < 18) entities.push(new FlyingPaper()); if (frameCount % 72 === 0 && entities.filter(e => e instanceof DriftingPaw).length < 8) entities.push(new DriftingPaw()); if (frameCount % 95 === 0 && entities.filter(e => e instanceof YarnBallFloat).length < 5) entities.push(new YarnBallFloat()); printers.forEach(p => { p.update(); p.draw(ctx2); }); entities = entities.filter(e => !e.dead); entities.forEach(e => { e.update(); e.draw(ctx2); }); animId1 = requestAnimationFrame(loop); }
    loop();
    return () => { cancelAnimationFrame(animId1); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <>
      <canvas ref={particlesRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.55 }} />
      <canvas ref={catRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
    </>
  );
}

function Toast({ msg, isError, visible }) {
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: `translateX(-50%) translateY(${visible ? "0" : "80px"})`, zIndex: 1000, background: "#131313", border: `1px solid ${isError ? "rgba(255,60,60,0.5)" : "rgba(255,212,0,0.3)"}`, color: isError ? "#ff6b6b" : "#F5F5F5", padding: "12px 20px", borderRadius: 10, fontSize: "0.86rem", maxWidth: "90vw", width: "max-content", fontFamily: "'Outfit',sans-serif", opacity: visible ? 1 : 0, transition: "all 0.3s ease", whiteSpace: "nowrap" }}>
      {msg}
    </div>
  );
}

function FileCard({ fileObj, onRemove }) {
  const canvasRef = useRef(null);
  const [imgUrl, setImgUrl] = useState(null);
  useEffect(() => {
    if (fileObj.mime === "application/pdf" && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = async function () {
        try {
          const typedArray = new Uint8Array(this.result);
          const pdf = await getDocument({ data: typedArray }).promise;
          const page = await pdf.getPage(1);
          const vp = page.getViewport({ scale: 1 });
          const c = canvasRef.current;
          if (!c) return;
          const scale = Math.min(120 / vp.width, 160 / vp.height) || 1;
          const viewport = page.getViewport({ scale });
          c.width = viewport.width; c.height = viewport.height;
          await page.render({ canvasContext: c.getContext("2d"), viewport }).promise;
        } catch { }
      };
      reader.readAsArrayBuffer(fileObj.rawFile);
    } else if (fileObj.mime.startsWith("image/")) {
      const url = URL.createObjectURL(fileObj.rawFile);
      setImgUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, []);
  const ext = fileObj.originalName.split(".").pop().toUpperCase();
  return (
    <div style={{ position: "relative", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,212,0,0.2)", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", display: "flex", flexDirection: "column", animation: "cardIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.02)", overflow: "hidden" }}>
        {fileObj.mime === "application/pdf" && <canvas ref={canvasRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        {fileObj.mime.startsWith("image/") && imgUrl && <img src={imgUrl} alt={fileObj.originalName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        {!fileObj.mime.startsWith("image/") && fileObj.mime !== "application/pdf" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "rgba(255,212,0,0.5)" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            <span style={{ fontSize: "0.6rem", opacity: 0.6 }}>{ext}</span>
          </div>
        )}
      </div>
      <div style={{ padding: "7px 8px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,212,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.62rem", color: "#FFD400", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={fileObj.originalName}>{fileObj.originalName}</span>
        <button onClick={() => onRemove(fileObj.id)} style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(255,60,60,0.15)", border: "1px solid rgba(255,60,60,0.3)", color: "rgba(255,100,100,0.8)", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>✕</button>
      </div>
    </div>
  );
}

// ── DELAY-CAT Teaser Cover (shown when SHOW_DELAY_CAT = false) ────────────────
function DelayCatTeaser() {
  const [hovered, setHovered] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const pts = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 3,
      dur: 2 + Math.random() * 3,
    }));
    setParticles(pts);
  }, []);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        marginTop: 12,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "default",
        background: "linear-gradient(135deg, rgba(10,10,20,0.95) 0%, rgba(20,10,40,0.95) 50%, rgba(10,10,20,0.95) 100%)",
        border: "1px solid rgba(99,102,241,0.25)",
        boxShadow: hovered
          ? "0 0 40px rgba(99,102,241,0.3), 0 0 80px rgba(99,102,241,0.1), inset 0 0 40px rgba(99,102,241,0.05)"
          : "0 0 20px rgba(99,102,241,0.1), inset 0 0 20px rgba(99,102,241,0.03)",
        transition: "box-shadow 0.5s ease",
      }}
    >
      {/* Animated noise/static background */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(99,102,241,0.03) 2px, rgba(99,102,241,0.03) 4px)`,
        animation: "staticShift 0.15s steps(1) infinite",
        opacity: 0.6,
        pointerEvents: "none",
      }} />

      {/* Floating star particles */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: `rgba(${Math.random() > 0.5 ? "99,102,241" : "167,139,250"},0.7)`,
          animation: `twinkle ${p.dur}s ${p.delay}s ease-in-out infinite`,
          pointerEvents: "none",
        }} />
      ))}

      {/* Top glowing bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent, #6366f1, #a78bfa, #6366f1, transparent)",
        animation: "shimmerBar 2.5s ease-in-out infinite",
      }} />

      {/* Radial glow center */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)",
        animation: "pulseGlow 3s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Corner decorations */}
      {[["0%","0%","90deg"], ["100%","0%","180deg"], ["0%","100%","0deg"], ["100%","100%","270deg"]].map(([l,t,r],i) => (
        <div key={i} style={{
          position: "absolute", left: l, top: t,
          width: 20, height: 20,
          border: "1px solid rgba(99,102,241,0.4)",
          borderRadius: 3,
          transform: `rotate(${r}) translate(${l==="0%" ? "4px" : "-4px"}, ${t==="0%" ? "4px" : "-4px"})`,
          opacity: 0.6,
        }} />
      ))}

      {/* Main content */}
      <div style={{ position: "relative", padding: "28px 20px 24px", textAlign: "center", zIndex: 2 }}>
        {/* Animated lock / mystery icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: "50%",
          background: "rgba(99,102,241,0.1)",
          border: "1.5px solid rgba(99,102,241,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
          animation: "floatIcon 3s ease-in-out infinite",
          boxShadow: "0 0 24px rgba(99,102,241,0.3)",
        }}>
          <span style={{ fontSize: "1.6rem", animation: "spinSlow 8s linear infinite" }}>🔮</span>
        </div>

        {/* COMING SOON badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.35)",
          borderRadius: 99, padding: "3px 12px",
          marginBottom: 10,
          animation: "pulseBadge 2s ease-in-out infinite",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", animation: "blink 1s ease-in-out infinite" }} />
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", color: "rgba(167,139,250,0.9)", textTransform: "uppercase" }}>Coming Soon</span>
        </div>

        {/* Title with glitch effect */}
        <div style={{
          fontFamily: "'Black Han Sans',sans-serif",
          fontSize: "clamp(1.2rem,4vw,1.6rem)",
          letterSpacing: "0.06em",
          color: "#F5F5F5",
          marginBottom: 6,
          textShadow: "0 0 20px rgba(99,102,241,0.5)",
          animation: "glitchText 6s ease-in-out infinite",
        }}>
          DELAY<span style={{ color: "#a78bfa" }}>-KAT</span>
        </div>

        {/* Mysterious subtitle */}
        <p style={{ fontSize: "0.78rem", color: "rgba(245,245,245,0.4)", lineHeight: 1.6, marginBottom: 16, maxWidth: 260, margin: "0 auto 16px" }}>
          Something new is brewing in the lab...<br />
          <span style={{ color: "rgba(167,139,250,0.6)", fontFamily: "'DM Mono',monospace", fontSize: "0.7rem" }}>Pay now. Print at your time.</span>
        </p>

        {/* Redacted feature pills */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[["🔐","████████"], ["⏱️","████ ████"], ["📱","████████"]].map(([icon, text], i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: 99, padding: "4px 10px",
              animation: `fadeSlide 0.5s ${i * 0.1}s ease both`,
            }}>
              <span style={{ fontSize: "0.75rem" }}>{icon}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.62rem", color: "rgba(99,102,241,0.5)", letterSpacing: "0.05em", filter: "blur(1.5px)" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Success overlay (instant print) ──────────────────────────────────────────
function SuccessOverlay({ onReset, machineId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chkServer/${machineId}/`);
      const data = await res.json();
      if (Array.isArray(data.print_jobs)) {
        setJobs(data.print_jobs.slice(0, 5));
      }
    } catch (err) {
      console.error("Failed to fetch print jobs:", err);
    } finally {
      setLoading(false);
    }
  }, [machineId]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  const statusConfig = {
    DONE:     { label: "Done",     color: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.3)"   },
    PENDING:  { label: "Pending",  color: "#FFD400", bg: "rgba(255,212,0,0.1)",    border: "rgba(255,212,0,0.3)"   },
    PRINTING: { label: "Printing", color: "#60a5fa", bg: "rgba(96,165,250,0.1)",   border: "rgba(96,165,250,0.3)"  },
    FAILED:   { label: "Failed",   color: "#f87171", bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.3)" },
  };
  const getStatus = (s) => statusConfig[s] || { label: s, color: "#aaa", bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.15)" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,11,11,0.97)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "24px 16px", overflowY: "auto" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,212,0,0.1)", border: "2px solid #FFD400", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 0 40px rgba(255,212,0,0.2)", animation: "pop 0.45s cubic-bezier(0.34,1.56,0.64,1)", flexShrink: 0 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "clamp(1.6rem,5vw,2.4rem)", color: "#FFD400", marginBottom: 4, textShadow: "0 0 30px rgba(255,212,0,0.4)", flexShrink: 0 }}>PRINT JOB SENT!</div>
      <p style={{ color: "rgba(245,245,245,0.5)", fontSize: "0.88rem", marginBottom: 20, textAlign: "center", flexShrink: 0 }}>Your documents are being processed at the kiosk.</p>
      <div style={{ width: "100%", maxWidth: 520, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,212,0,0.15)", borderRadius: 16, overflow: "hidden", marginBottom: 20, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,212,0,0.1)", background: "rgba(255,212,0,0.04)" }}>
          <span style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "0.8rem", letterSpacing: "0.1em", color: "#FFD400" }}>RECENT JOBS</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {loading
              ? <svg style={{ animation: "spin 0.9s linear infinite" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,212,0,0.6)" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
              : <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 6px #22c55e" }} />
            }
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.05em" }}>{loading ? "updating…" : "live · 10s"}</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr 90px", padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {["ID", "Phone", "Pages × Copies", "Status"].map(h => (
            <span key={h} style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", fontFamily: "'DM Mono',monospace" }}>{h}</span>
          ))}
        </div>
        {jobs.length === 0 && !loading && <div style={{ padding: "24px 16px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: "0.82rem" }}>No recent jobs found</div>}
        {jobs.map((job, i) => {
          const s = getStatus(job.status);
          const isLatest = i === 0;
          return (
            <div key={job.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr 1fr 90px", padding: "11px 16px", alignItems: "center", borderBottom: i < jobs.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: isLatest ? "rgba(255,212,0,0.03)" : "transparent", transition: "background 0.3s" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", color: isLatest ? "#FFD400" : "rgba(255,255,255,0.35)" }}>#{job.id}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", color: "rgba(245,245,245,0.75)" }}>{job.phone_no ? job.phone_no.slice(0, -4).replace(/./g, "•") + job.phone_no.slice(-4) : "—"}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.75rem", color: "rgba(245,245,245,0.45)" }}>{job.pages_printed}p × {job.no_of_copies}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: s.bg, border: `1px solid ${s.border}`, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", color: s.color, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap", width: "fit-content" }}>
                {job.status === "PRINTING" && <svg style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="3" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>}
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
      <button onClick={onReset} style={{ background: "#FFD400", color: "#0B0B0B", fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem", letterSpacing: "0.06em", border: "none", borderRadius: 12, padding: "14px 40px", cursor: "pointer", flexShrink: 0 }}>PRINT ANOTHER</button>
    </div>
  );
}

// ── DELAY-CAT OTP overlay ─────────────────────────────────────────────────────
function DelayOTPOverlay({ otp, onReset }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(otp).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,11,11,0.98)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "32px 20px", overflowY: "auto" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "2px solid rgba(99,102,241,0.6)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 0 50px rgba(99,102,241,0.3)", animation: "pop 0.45s cubic-bezier(0.34,1.56,0.64,1)", flexShrink: 0 }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "clamp(1.5rem,5vw,2.2rem)", color: "#F5F5F5", marginBottom: 6, textAlign: "center" }}>PAYMENT SUCCESSFUL!</div>
      <p style={{ color: "rgba(245,245,245,0.5)", fontSize: "0.9rem", marginBottom: 28, textAlign: "center", maxWidth: 340, lineHeight: 1.6 }}>
        Your files are saved. Walk up to any CopyKat kiosk and enter this OTP to print — whenever you're ready.
      </p>
      <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "28px 40px", marginBottom: 24, textAlign: "center", width: "100%", maxWidth: 360, flexShrink: 0 }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(99,102,241,0.7)", marginBottom: 14, fontFamily: "'DM Mono',monospace" }}>YOUR PRINT OTP</div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 18 }}>
          {otp.split("").map((d, i) => (
            <div key={i} style={{ width: 58, height: 72, borderRadius: 12, background: "rgba(99,102,241,0.12)", border: "2px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Black Han Sans',sans-serif", fontSize: "2.2rem", color: "#F5F5F5", boxShadow: "0 0 20px rgba(99,102,241,0.2)", animation: `cardIn 0.3s ${i * 0.08}s cubic-bezier(0.34,1.56,0.64,1) both` }}>{d}</div>
          ))}
        </div>
        <button onClick={copy} style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.12)", border: `1px solid ${copied ? "rgba(34,197,94,0.4)" : "rgba(99,102,241,0.3)"}`, color: copied ? "#22c55e" : "rgba(99,102,241,0.9)", fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", letterSpacing: "0.1em", padding: "8px 20px", borderRadius: 99, cursor: "pointer", transition: "all 0.25s ease", display: "flex", alignItems: "center", gap: 6, margin: "0 auto" }}>
          {copied
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>COPIED</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>COPY OTP</>
          }
        </button>
      </div>
      <div style={{ width: "100%", maxWidth: 360, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
        {[
          ["1", "Go to any CopyKat kiosk", "rgba(255,212,0,0.8)"],
          ["2", "Tap 'Enter OTP' on the kiosk screen", "rgba(255,212,0,0.8)"],
          ["3", `Enter your OTP: ${otp}`, "rgba(99,102,241,0.9)"],
          ["4", "Your document prints instantly!", "rgba(34,197,94,0.9)"],
        ].map(([n, text, col]) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Mono',monospace", fontSize: "0.72rem", color: col, fontWeight: 700, border: `1px solid ${col}` }}>{n}</div>
            <span style={{ fontSize: "0.84rem", color: "rgba(245,245,245,0.7)" }}>{text}</span>
          </div>
        ))}
      </div>
      <button onClick={onReset} style={{ background: "#FFD400", color: "#0B0B0B", fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem", letterSpacing: "0.06em", border: "none", borderRadius: 12, padding: "14px 40px", cursor: "pointer", flexShrink: 0 }}>PRINT ANOTHER</button>
    </div>
  );
}

// ── Kiosk OTP Panel ───────────────────────────────────────────────────────────
function KioskOTPPanel({ machineId, onJobQueued }) {
  const [open,    setOpen]    = useState(false);
  const [digits,  setDigits]  = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(null);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];
  const otp = digits.join("");

  const resetPanel = () => { setDigits(["", "", "", ""]); setError(""); setSuccess(null); setLoading(false); };
  const openPanel  = () => { resetPanel(); setOpen(true); };
  const closePanel = () => { setOpen(false); resetPanel(); };

  useEffect(() => { if (open) setTimeout(() => inputRefs[0].current?.focus(), 120); }, [open]);

  const handleDigitChange = (i, val) => {
    const ch = val.replace(/\D/g, "").slice(-1);
    const next = [...digits]; next[i] = ch; setDigits(next); setError("");
    if (ch && i < 3) inputRefs[i + 1].current?.focus();
  };
  const handleKeyDown = (i, e) => { if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs[i - 1].current?.focus(); };
  const handlePaste = e => {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (p.length === 4) { setDigits(p.split("")); setError(""); inputRefs[3].current?.focus(); }
    e.preventDefault();
  };

  const verifyOTP = async () => {
    if (otp.length !== 4) { setError("Please enter all 4 digits."); return; }
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${API_BASE}/api/verify-otp/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ machine_id: machineId, otp }) });
      const data = await res.json();
      if (res.ok) { setSuccess(data); if (onJobQueued) onJobQueued(); }
      else { setError(data.error || "Invalid OTP. Please try again."); setDigits(["", "", "", ""]); setTimeout(() => inputRefs[0].current?.focus(), 50); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={openPanel} style={{ position: "fixed", bottom: 28, right: 24, zIndex: 500, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: 16, padding: "14px 22px", fontFamily: "'Black Han Sans',sans-serif", fontSize: "0.95rem", letterSpacing: "0.06em", cursor: "pointer", boxShadow: "0 4px 24px rgba(99,102,241,0.5)", display: "flex", alignItems: "center", gap: 10, animation: "indigoGlow 2.5s ease-in-out infinite" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        ENTER OTP
      </button>
      {open && <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }} />}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: open ? "translate(-50%,0)" : "translate(-50%,110%)", width: "100%", maxWidth: 460, zIndex: 700, background: "rgba(14,14,20,0.98)", backdropFilter: "blur(32px)", border: "1px solid rgba(99,102,241,0.3)", borderBottom: "none", borderRadius: "24px 24px 0 0", padding: "28px 24px 40px", transition: "transform 0.4s cubic-bezier(0.34,1.15,0.64,1)", boxShadow: "0 -20px 60px rgba(99,102,241,0.25)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 99, background: "rgba(255,255,255,0.12)", margin: "0 auto 22px" }} />
        {!success ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(99,102,241,0.12)", border: "2px solid rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 0 30px rgba(99,102,241,0.3)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(99,102,241,1)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.4rem", color: "#F5F5F5", marginBottom: 6 }}>ENTER YOUR OTP</div>
              <p style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.45)", lineHeight: 1.5 }}>Enter the 4-digit code you received after payment to release your print job.</p>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: error ? 8 : 24 }} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input key={i} ref={inputRefs[i]} type="tel" inputMode="numeric" maxLength={1} value={d}
                  onChange={e => handleDigitChange(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)}
                  style={{ width: 64, height: 76, borderRadius: 14, background: d ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)", border: `2px solid ${error ? "rgba(248,113,113,0.6)" : d ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`, color: "#F5F5F5", fontFamily: "'Black Han Sans',sans-serif", fontSize: "2rem", textAlign: "center", outline: "none", transition: "all 0.2s ease", boxShadow: d ? "0 0 16px rgba(99,102,241,0.25)" : "none", caretColor: "transparent" }}
                />
              ))}
            </div>
            {error && <div style={{ textAlign: "center", color: "#f87171", fontSize: "0.8rem", fontFamily: "'DM Mono',monospace", marginBottom: 16, animation: "cardIn 0.2s ease" }}>⚠ {error}</div>}
            <button onClick={verifyOTP} disabled={loading || otp.length < 4}
              style={{ width: "100%", padding: "16px 0", borderRadius: 14, background: loading || otp.length < 4 ? "rgba(99,102,241,0.25)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: loading || otp.length < 4 ? "rgba(255,255,255,0.35)" : "#fff", fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.05rem", letterSpacing: "0.06em", cursor: loading || otp.length < 4 ? "not-allowed" : "pointer", transition: "all 0.2s ease", boxShadow: otp.length === 4 && !loading ? "0 4px 20px rgba(99,102,241,0.4)" : "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
              {loading ? <><svg style={{ animation: "spin 0.9s linear infinite" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>VERIFYING…</> : <>🔐 VERIFY &amp; PRINT</>}
            </button>
            <button onClick={closePanel} style={{ width: "100%", padding: "12px 0", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, color: "rgba(245,245,245,0.4)", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 30px rgba(34,197,94,0.3)", animation: "pop 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.5rem", color: "#22c55e", marginBottom: 6 }}>OTP VERIFIED!</div>
            <p style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.55)", marginBottom: 20, lineHeight: 1.6 }}>
              Job #{success.job_id} is now in the print queue.<br/>
              <span style={{ fontFamily: "'DM Mono',monospace", color: "rgba(245,245,245,0.35)" }}>{success.pages_printed} page{success.pages_printed !== 1 ? "s" : ""} × {success.no_of_copies} cop{success.no_of_copies !== 1 ? "ies" : "y"}</span>
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
              {[["🖨️", "Sending to printer"], ["📄", `${success.pages_printed * success.no_of_copies} total pages`], ["⚡", "Real-time queue"]].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "rgba(34,197,94,0.85)", background: "rgba(34,197,94,0.08)", padding: "5px 12px", borderRadius: 99, border: "1px solid rgba(34,197,94,0.2)" }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={closePanel} style={{ background: "#22c55e", color: "#0B0B0B", fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem", letterSpacing: "0.06em", border: "none", borderRadius: 14, padding: "14px 40px", cursor: "pointer", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}>DONE</button>
          </div>
        )}
      </div>
    </>
  );
}

function UploadingOverlay() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(11,11,11,0.97)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, textAlign: "center", padding: 24 }}>
      <svg style={{ animation: "spin 0.9s linear infinite" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
      <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.4rem", color: "#FFD400" }}>UPLOADING…</div>
      <div style={{ fontSize: "0.88rem", color: "rgba(245,245,245,0.5)" }}>Sending your files to the kiosk</div>
      <div style={{ width: 200, height: 4, background: "rgba(255,212,0,0.15)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#FFD400", width: "60%", borderRadius: 2, animation: "pulse-bar 1.2s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Second() {
  const navigate = useNavigate();
  const location = useLocation();
  const clickAudio = useRef(null);
  const alertAudio = useRef(null);
  const fileInputRef = useRef(null);
  const toastTimer = useRef(null);

  const [token, setToken] = useState("");
  const machine_id = 1;

  const [uploadedFiles,  setUploadedFiles]  = useState([]);
  const [printType,      setPrintTypeState] = useState("S");
  const [copies,         setCopies]         = useState(1);
  const [phone,          setPhone]          = useState("");
  const [step,           setStep]           = useState(1);
  const [toast,          setToast]          = useState({ msg: "", isError: false, visible: false });
  const [copiesPop,      setCopiesPop]      = useState(false);
  const [isDragOver,     setIsDragOver]     = useState(false);
  const [isDelayCat,     setIsDelayCat]     = useState(false);
  const [showSuccess,    setShowSuccess]    = useState(false);
  const [delayOtp,       setDelayOtp]       = useState(null);
  const [uploadingState, setUploadingState] = useState(null);
  const [totalDocPages,  setTotalDocPages]  = useState(0);
  const [pagesCounting,  setPagesCounting]  = useState(false);

  const TOTAL_PAGES = 250;
  const [pagesLeft, setPagesLeft] = useState(null);

  const barcodeValue = location.state?.barcodeValue || localStorage.getItem("barcodeValue") || "1234";
  const unitPrice = printType === "S" ? SINGLE_PRICE : DOUBLE_PRICE;
  const total = +(unitPrice * copies * (totalDocPages || Math.max(1, uploadedFiles.length))).toFixed(2);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/get-machine-token/${machine_id}/`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const fetched = data.token ?? data.access ?? data.key ?? Object.values(data)[0];
        if (fetched) { setToken(String(fetched)); localStorage.setItem("token", String(fetched)); }
      } catch (err) { console.error("Failed to fetch machine token:", err); }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/chkServer/${machine_id}/`)
      .then(r => r.json())
      .then(data => { if (typeof data.pages_left === "number") setPagesLeft(data.pages_left); })
      .catch(() => { });
  }, []);

  const phoneOk = phone.replace(/\D/g, "").length >= 6;
  const payBtnDisabled = uploadedFiles.length === 0 || pagesCounting;

  useEffect(() => {
    if (uploadedFiles.length > 0 && phoneOk) setStep(4);
    else if (uploadedFiles.length > 0 && !phoneOk) setStep(3);
    else if (uploadedFiles.length > 0) setStep(2);
    else setStep(1);
  }, [uploadedFiles, phone]);

  useEffect(() => {
    if (uploadedFiles.length === 0) { setTotalDocPages(0); setPagesCounting(false); return; }
    let cancelled = false;
    setPagesCounting(true);
    (async () => {
      let total = 0;
      for (const f of uploadedFiles) {
        if (cancelled) return;
        if (f.mime === "application/pdf") {
          const pages = await new Promise(resolve => {
            const t = setTimeout(() => resolve(1), 8000);
            const reader = new FileReader();
            reader.onload = async function () {
              try { const pdf = await getDocument({ data: new Uint8Array(this.result) }).promise; clearTimeout(t); resolve(pdf.numPages); }
              catch { clearTimeout(t); resolve(1); }
            };
            reader.onerror = () => { clearTimeout(t); resolve(1); };
            reader.readAsArrayBuffer(f.rawFile);
          });
          total += pages;
        } else {
          total += 1;
        }
      }
      if (!cancelled) { setTotalDocPages(total); setPagesCounting(false); }
    })();
    return () => { cancelled = true; };
  }, [uploadedFiles]);

  useEffect(() => {
    clickAudio.current = new Audio(clickSound); clickAudio.current.preload = "auto";
    alertAudio.current = new Audio(alertSound); alertAudio.current.preload = "auto";
  }, []);

  const playClick = () => { if (clickAudio.current) { clickAudio.current.currentTime = 0; clickAudio.current.play().catch(() => { }); } };
  const playAlert = (msg) => { if (alertAudio.current) { alertAudio.current.currentTime = 0; alertAudio.current.play().catch(() => { }); } alert(msg); };

  const showToast = useCallback((msg, isError = false) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, isError, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }, []);

  const handleLogoClick = () => { playClick(); navigate("/"); };

  const handleFiles = useCallback((rawFiles) => {
    const remaining = MAX_FILES - uploadedFiles.length;
    if (remaining <= 0) { showToast("Maximum 5 files reached.", true); return; }
    const toProcess = Array.from(rawFiles).slice(0, remaining);
    if (rawFiles.length > remaining) showToast(`Only ${remaining} more file(s) can be added.`, false);
    const newEntries = [];
    for (const file of toProcess) {
      if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) { showToast(`"${file.name}" — invalid type. Use PDF, PNG, JPG.`, true); continue; }
      if (file.size > 20 * 1024 * 1024) { showToast(`"${file.name}" is too large. Max 20 MB.`, true); continue; }
      newEntries.push({ id: uid(), originalName: file.name, mime: file.type, rawFile: file });
    }
    if (newEntries.length) setUploadedFiles(prev => [...prev, ...newEntries]);
  }, [uploadedFiles, showToast]);

  const removeFile = (id) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

  const changeCopies = (d) => {
    playClick();
    setCopies(c => Math.max(1, c + d));
    setCopiesPop(true);
    setTimeout(() => setCopiesPop(false), 250);
  };

  const runUploadFlow = async ({ pages, price, paymentId }) => {
    const filesToUpload = uploadedFiles;
    if (filesToUpload.length === 0) throw new Error("No files selected.");
    setUploadingState({ fileIndex: 1, totalFiles: filesToUpload.length });
    try {
      const formData = new FormData();
      formData.append("barcode_val", barcodeValue);
      // formData.append("machine_id", String(machine_id));
      formData.append("machine_id", String(machine_id));
      formData.append("no_of_copies", copies.toString());
      formData.append("pages_printed", pages.toString());
      formData.append("revenue", price.toString());
      formData.append("token", token);
      formData.append("phone_no", phone.replace(/\D/g, ""));
      // formData.append("razorpay_payment_id", paymentId);
      // formData.append("print_type", printType);
      // formData.append("is_delay", isDelayCat ? "true" : "false");
      filesToUpload.forEach(f => formData.append("pdf", f.rawFile));
      const uploadResponse = await fetch(`${API_BASE}/api/uploadServer/`, { method: "POST", body: formData });
      const data = await uploadResponse.json();
      if (uploadResponse.ok || uploadResponse.status === 201) {
        setUploadingState(null);
        if (isDelayCat && data.otp) {
          setDelayOtp(data.otp);
        } else {
          setShowSuccess(true);
        }
      } else {
        throw new Error(data.error || "Upload failed.");
      }
    } catch (err) {
      console.error("Upload Error after Payment:", err);
      setUploadingState(null);
      playAlert(err.message || "Payment success, but upload failed. Contact support.");
    }
  };

  const devTestPayment = async () => {
    playClick();
    if (uploadedFiles.length === 0) return playAlert("Please upload at least one file.");
    if (!phoneOk) return playAlert("Please enter a valid phone number (min 6 digits).");
    if (pagesCounting) return playAlert("Still counting pages, please wait a moment.");
    const pages = totalDocPages > 0 ? totalDocPages : uploadedFiles.length;
    const price = pages * copies * unitPrice;
    showToast(`[DEV] Skipping payment — uploading ${uploadedFiles.length} file(s)…`, false);
    await runUploadFlow({ pages, price, paymentId: "DEV_TEST_" + Date.now() });
  };

  const initiatePayment = async () => {
    playClick();
    try {
      if (uploadedFiles.length === 0) return playAlert("Please upload at least one file.");
      if (!phoneOk) {
        showToast("📱 Please enter a valid phone number before paying.", true);
        return;
      }
      if (pagesCounting) {
        showToast("Still counting pages, please wait a moment.", true);
        return;
      }
      const pages = totalDocPages > 0 ? totalDocPages : uploadedFiles.length;
      const price = pages * copies * unitPrice;
      if (DEV_MODE) {
        showToast(`[DEV] Skipping payment — uploading ${uploadedFiles.length} file(s)…`, false);
        await runUploadFlow({ pages, price, paymentId: "DEV_TEST_" + Date.now() });
        return;
      }
      const loaded = await loadRazorpay();
      if (!loaded) return playAlert("Razorpay SDK failed to load.");
      const keyRes = await fetch(`${API_BASE}/api/razorpay-key/`);
      const { key_id } = await keyRes.json();
      const options = {
        key: key_id,
        amount: Math.round(price * 100),
        currency: "INR",
        name: `${machine_id} CopyKat Printing`,
        description: isDelayCat ? "DELAY-CAT — Print Later" : "Print Payment",
        prefill: { name: "CopyKat User", contact: phone.replace(/\D/g, "") },
        theme: { color: isDelayCat ? "#6366f1" : "#ffd400" },
        handler: async (response) => {
          try { await runUploadFlow({ pages, price, paymentId: response.razorpay_payment_id }); }
          catch (err) { console.error("Upload Error after Payment:", err); playAlert(err.message || "Payment success, but upload failed. Contact support."); }
        },
        modal: { ondismiss: () => showToast("Payment cancelled.", true) },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => playAlert("Payment failed: " + r.error.description));
      rzp.open();
    } catch (err) {
      console.error("Razorpay Initialization Error:", err);
      playAlert("Could not initiate payment.");
    }
  };

  const reset = () => {
    setUploadedFiles([]); setCopies(1); setPrintTypeState("S");
    setPhone(""); setStep(1); setShowSuccess(false);
    setDelayOtp(null); setIsDelayCat(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const STEPS = ["Upload", "Phone", "Pay"];
  const stepIndicator = (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 20, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "8px 10px", overflowX: "auto", width: "100%" }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const isDone = step > n;
        const isActive = step === n;
        return (
          <div key={n} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 700, fontFamily: "'DM Mono',monospace", flexShrink: 0, background: isDone ? "#FFD400" : "rgba(255,212,0,0.1)", border: `1px solid ${isDone ? "#FFD400" : "rgba(255,212,0,0.25)"}`, color: isDone ? "#0B0B0B" : "#FFD400", transform: isDone ? "scale(1.1)" : "scale(1)", boxShadow: isActive ? "0 0 10px rgba(255,212,0,0.3)" : "none", transition: "all 0.3s" }}>{isDone ? "✓" : n}</div>
              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: isActive ? "#F5F5F5" : "rgba(245,245,245,0.45)", letterSpacing: "0.04em" }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span style={{ color: "rgba(255,212,0,0.2)", margin: "0 8px" }}>›</span>}
          </div>
        );
      })}
    </div>
  );

  const dropZoneText = uploadedFiles.length >= MAX_FILES
    ? <span style={{ color: "rgba(255,255,255,0.35)" }}>Max 20 files reached</span>
    : uploadedFiles.length === 0
      ? <>Drag &amp; drop or <span style={{ color: "#FFD400" }}>browse</span></>
      : <span style={{ color: "#FFD400" }}>+ Add more files</span>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Black+Han+Sans&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--y:#FFD400;--dark:#0B0B0B;--text:#F5F5F5;--muted:rgba(245,245,245,0.45);--indigo:#6366f1;}
        html{scroll-behavior:smooth;overflow-x:hidden;width:100%}
        body{background:var(--dark);color:var(--text);font-family:'Outfit',sans-serif;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;width:100%;max-width:100vw;}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--y);border-radius:2px}

        @keyframes cardIn{from{opacity:0;transform:scale(0.8) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes pop{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes glow{0%,100%{opacity:0.7;transform:translateX(-50%) scale(1)}50%{opacity:1;transform:translateX(-50%) scale(1.08)}}
        @keyframes dzPulse{0%,100%{border-color:rgba(255,212,0,0.3)}50%{border-color:rgba(255,212,0,0.55)}}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes logoPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,212,0,0.4)}50%{box-shadow:0 0 0 7px rgba(255,212,0,0)}}
        @keyframes titleFlicker{0%,96%,98%,100%{text-shadow:0 0 30px rgba(255,212,0,0.4)}97%{text-shadow:0 0 70px rgba(255,212,0,0.9),0 0 120px rgba(255,212,0,0.4)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse-bar{0%,100%{opacity:0.5;transform:scaleX(0.7)}50%{opacity:1;transform:scaleX(1)}}
        @keyframes indigoGlow{0%,100%{box-shadow:0 4px 24px rgba(99,102,241,0.4)}50%{box-shadow:0 4px 40px rgba(99,102,241,0.7)}}

        /* DELAY-CAT teaser animations */
        @keyframes twinkle{0%,100%{opacity:0.2;transform:scale(0.7)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes shimmerBar{0%{opacity:0.4;background-position:0% 50%}50%{opacity:1;background-position:100% 50%}100%{opacity:0.4;background-position:0% 50%}}
        @keyframes pulseGlow{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}
        @keyframes floatIcon{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-6px) rotate(5deg)}}
        @keyframes spinSlow{to{transform:rotate(360deg)}}
        @keyframes pulseBadge{0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.3)}50%{box-shadow:0 0 0 6px rgba(99,102,241,0)}}
        @keyframes blink{0%,100%{opacity:0.4;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes glitchText{
          0%,85%,100%{text-shadow:0 0 20px rgba(99,102,241,0.5)}
          86%{text-shadow:-2px 0 rgba(255,0,80,0.6),2px 0 rgba(0,200,255,0.6),0 0 20px rgba(99,102,241,0.5)}
          87%{text-shadow:2px 0 rgba(255,0,80,0.6),-2px 0 rgba(0,200,255,0.6),0 0 20px rgba(99,102,241,0.5)}
          88%{text-shadow:0 0 20px rgba(99,102,241,0.5)}
          89%{text-shadow:-1px 0 rgba(255,0,80,0.4),1px 0 rgba(0,200,255,0.4)}
          90%{text-shadow:0 0 20px rgba(99,102,241,0.8)}
        }
        @keyframes staticShift{0%,100%{opacity:0.4}50%{opacity:0.7}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

        /* DELAY-CAT active card glow */
        @keyframes delayCatActiveGlow{
          0%,100%{box-shadow:0 0 20px rgba(99,102,241,0.2),inset 0 0 20px rgba(99,102,241,0.03)}
          50%{box-shadow:0 0 40px rgba(99,102,241,0.35),inset 0 0 30px rgba(99,102,241,0.06)}
        }

        .ticker-track{display:flex;white-space:nowrap;animation:ticker 22s linear infinite}
        .ticker-track.rev{animation-direction:reverse;animation-duration:18s}
        .counter-btn:hover{background:rgba(255,212,0,0.18)!important;border-color:rgba(255,212,0,0.5)!important;transform:scale(1.08)!important}
        .counter-btn:active{transform:scale(0.88)!important}
        .pay-btn:not(:disabled):hover{box-shadow:0 0 32px rgba(255,212,0,0.55),0 6px 20px rgba(0,0,0,0.3)!important;transform:translateY(-2px)!important}
        .pay-btn:active{transform:translateY(0)!important}
        .glass-hover:hover{border-color:rgba(255,212,0,0.15)!important}
        .delay-card-active{animation:delayCatActiveGlow 2.5s ease-in-out infinite}

        /* ── Mobile centering ─────────────────────────────── */
        @media (max-width: 600px) {
          .main-content-wrapper {
            padding-left: 0 !important;
            padding-right: 0 !important;
            align-items: center !important;
          }
          .main-card-container {
            padding: 0 10px !important;
            width: 100% !important;
            max-width: 100vw !important;
          }
          .main-card {
            padding: 16px 12px !important;
            border-radius: 16px !important;
          }
          .step-indicator {
            justify-content: center !important;
          }
          .file-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
          }
          .order-summary-grid div {
            font-size: 0.8rem !important;
          }
          .pay-btn-wrap {
            padding: 0 !important;
          }
          .ticker-track span {
            font-size: 0.75rem !important;
            padding: 0 14px !important;
          }
          nav {
            padding: 0 12px !important;
          }
          .otp-digit-input {
            width: 52px !important;
            height: 64px !important;
            font-size: 1.6rem !important;
          }
          .kiosk-panel {
            padding: 22px 16px 32px !important;
          }
        }
      `}</style>

      <AnimationCanvas />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", backgroundImage: "linear-gradient(rgba(255,212,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,212,0,0.03) 1px,transparent 1px)", backgroundSize: "52px 52px" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)" }} />
      <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(circle,rgba(255,212,0,0.09) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0, animation: "glow 5s ease-in-out infinite" }} />
      <div style={{ position: "fixed", width: 220, height: 220, borderRadius: "50%", background: "rgba(255,212,0,0.06)", top: "20%", left: "5%", filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", width: 150, height: 150, borderRadius: "50%", background: "rgba(255,212,0,0.04)", bottom: "25%", right: "5%", filter: "blur(50px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Navbar */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, padding: "0 16px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(11,11,11,0.65)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,212,0,0.12)", width: "100%", overflow: "hidden" }}>
        <a href="#" onClick={e => { e.preventDefault(); handleLogoClick(); }} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 50, height: 50, background: "#FFD400", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", animation: "logoPulse 3s ease-in-out infinite", overflow: "hidden" }}>
            <img className="logo" src={newlogo} alt="CopyKat" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#F5F5F5" }}>Copy<span style={{ color: "#FFD400" }}>Kat</span></span>
        </a>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)", padding: "5px 14px", borderRadius: 99, background: "rgba(255,212,0,0.04)" }}>Print Portal</span>
      </nav>

      {/* Tickers */}
      <div style={{ position: "fixed", top: 68, left: 0, right: 0, zIndex: 199, overflow: "hidden", background: "#FFD400", padding: "9px 0", width: "100%" }}>
        <div className="ticker-track">
          {[...Array(4)].flatMap((_, ri) => ["INSTANT PRINT", "₹2/PAGE", "UPLOAD → PAY → PRINT", "PDF · PNG · JPG", "SINGLE & DOUBLE SIDE", "KIOSK DELIVERY", "DELAY-KAT — PRINT LATER", "SECURE PAYMENT"].map((t, i) => (
            <span key={`${ri}-${i}`} style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "0.82rem", letterSpacing: "0.12em", color: "#0B0B0B", padding: "0 22px", borderRight: "2px solid rgba(0,0,0,0.12)" }}>{t}</span>
          )))}
        </div>
      </div>
      <div style={{ position: "fixed", top: 104, left: 0, right: 0, zIndex: 199, overflow: "hidden", padding: "9px 0", borderBottom: "1px solid rgba(255,212,0,0.12)", width: "100%" }}>
        <div className="ticker-track rev">
          {[...Array(4)].flatMap((_, ri) => ["FAST PRINTING", "RAZORPAY SECURED", "MAX 20 FILES", "UPI · CARD · WALLET", "SLOW NET? USE DELAY-KAT"].map((t, i) => (
            <span key={`${ri}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "'Black Han Sans',sans-serif", fontSize: "0.82rem", letterSpacing: "0.1em", color: "rgba(255,212,0,0.35)", padding: "0 22px", borderRight: "1px solid rgba(255,212,0,0.1)" }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFD400", opacity: 0.4, display: "inline-block" }} />{t}
            </span>
          )))}
        </div>
      </div>

      {/* Overlays */}
      {uploadingState && <UploadingOverlay />}
      {delayOtp && <DelayOTPOverlay otp={delayOtp} onReset={reset} />}
      {showSuccess && !delayOtp && <SuccessOverlay onReset={reset} machineId={machine_id} />}

      {/* Kiosk OTP floating button */}
      {!uploadingState && !delayOtp && !showSuccess && (
        <KioskOTPPanel machineId={machine_id} onJobQueued={() => setShowSuccess(true)} />
      )}

      {/* ── Main content ── */}
      <div
        className="main-content-wrapper"
        style={{ position: "relative", zIndex: 2, paddingTop: 148, paddingBottom: 60, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", width: "100%", overflowX: "hidden" }}
      >
        <div
          className="main-card-container"
          style={{ width: "100%", maxWidth: 680, margin: "0 auto", padding: "0 12px", boxSizing: "border-box" }}
        >
          {/* Header */}
          <div style={{ marginBottom: 20, textAlign: "center", padding: "0 4px" }}>
            <span style={{ display: "inline-block", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400", background: "rgba(255,212,0,0.07)", border: "1px solid rgba(255,212,0,0.18)", padding: "4px 12px", borderRadius: 99, marginBottom: 10 }}>CopyKat Print Portal</span>
            <h1 style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "clamp(1.4rem,5.5vw,2.8rem)", letterSpacing: "-0.01em", lineHeight: 1, marginBottom: 6 }}>
              Print Your <span style={{ color: "#FFD400", textShadow: "0 0 30px rgba(255,212,0,0.4)", display: "inline-block", animation: "titleFlicker 5s ease-in-out infinite 3s" }}>Document.</span>
            </h1>
            <p style={{ marginTop: "1%", fontSize: "0.85rem", color: "rgba(245,245,245,0.45)", letterSpacing: "0.02em" }}>Upload → Configure → Pay → Print</p>
          </div>

          {/* Paper Capacity Bar */}
          {pagesLeft !== null && (() => {
            const pct = Math.min(100, Math.max(0, (pagesLeft / TOTAL_PAGES) * 100));
            const hue = Math.round((pct / 100) * 120);
            const barColor = `hsl(${hue},90%,48%)`;
            const glowColor = `hsla(${hue},90%,48%,0.45)`;
            const label = pct > 60 ? "Good" : pct > 25 ? "Low" : "Critical";
            return (
              <div style={{ marginBottom: 18, padding: "14px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,245,245,0.45)" }}>Paper Availability</span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.78rem", color: barColor, fontWeight: 600, textShadow: `0 0 10px ${glowColor}` }}>{label}</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: "rgba(255,255,255,0.07)", overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, #e53e3e, #FFD400 50%, #38a169)`, backgroundSize: `${(TOTAL_PAGES / pagesLeft) * 100}% 100%`, backgroundPosition: "left center", boxShadow: `0 0 8px ${glowColor}`, transition: "width 1s cubic-bezier(0.34,1.2,0.64,1)" }} />
                </div>
                <div style={{ position: "relative", height: 6, marginTop: 3 }}>
                  {[25, 50, 75].map(t => (
                    <div key={t} style={{ position: "absolute", left: `${t}%`, transform: "translateX(-50%)", width: 1, height: 4, background: "rgba(255,255,255,0.12)" }} />
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Main Card */}
          <div
            className="main-card"
            style={{ background: "rgba(15,15,15,0.88)", backdropFilter: "blur(28px)", border: `1px solid ${isDelayCat ? "rgba(99,102,241,0.3)" : "rgba(255,212,0,0.14)"}`, borderRadius: 20, padding: "20px 16px", boxShadow: "0 40px 80px rgba(0,0,0,0.5),0 0 60px rgba(255,212,0,0.04)", position: "relative", overflow: "hidden", width: "100%", transition: "border-color 0.4s" }}
          >
            {/* Top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: isDelayCat ? "linear-gradient(90deg,#6366f1,rgba(99,102,241,0.3),transparent)" : "linear-gradient(90deg,#FFD400,rgba(255,212,0,0.3),transparent)", transition: "background 0.4s" }} />

            {stepIndicator}

            {/* Drop Zone */}
            <div
              onClick={() => { if (uploadedFiles.length < MAX_FILES) { playClick(); fileInputRef.current?.click(); } }}
              onDragOver={e => { e.preventDefault(); if (uploadedFiles.length < MAX_FILES) setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
              style={{ border: `2px dashed ${isDragOver ? "rgba(255,212,0,0.8)" : "rgba(255,212,0,0.3)"}`, borderRadius: 16, padding: "28px 20px", textAlign: "center", cursor: uploadedFiles.length >= MAX_FILES ? "not-allowed" : "pointer", position: "relative", overflow: "hidden", background: isDragOver ? "rgba(255,212,0,0.06)" : "rgba(255,212,0,0.015)", opacity: uploadedFiles.length >= MAX_FILES ? 0.4 : 1, animation: isDragOver ? "none" : "dzPulse 3s ease-in-out infinite", transition: "all 0.3s ease" }}
            >
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>📁</div>
              <div style={{ fontSize: "0.95rem", marginBottom: 4 }}>{dropZoneText}</div>
              <p style={{ fontSize: "0.75rem", color: "rgba(245,245,245,0.3)", marginTop: 6 }}>PDF, PNG, JPG accepted · Max 20MB · Up to 5 files</p>
              <div style={{ marginTop: 10, fontSize: "0.72rem", color: "rgba(255,212,0,0.5)", fontFamily: "'DM Mono',monospace" }}>{uploadedFiles.length} / {MAX_FILES} files</div>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" multiple hidden onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ""; }} />

            {/* File cards */}
            {uploadedFiles.length > 0 && (
              <div className="file-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 12, marginTop: 14 }}>
                {uploadedFiles.map(f => <FileCard key={f.id} fileObj={f} onRemove={removeFile} />)}
              </div>
            )}

            {/* Print Type */}
            <div className="glass-hover" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginTop: 20, transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400" }}>Print Type</div>
                <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,212,0,0.45)", background: "rgba(255,212,0,0.07)", border: "1px solid rgba(255,212,0,0.15)", padding: "3px 10px", borderRadius: 99 }}>Single Side Only</span>
              </div>
              <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 4 }}>
                <div style={{ flex: 1, padding: "10px 0", borderRadius: 7, background: "#FFD400", textAlign: "center", fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#0B0B0B", boxShadow: "0 0 20px rgba(255,212,0,0.4)" }}>Single Side</div>
                <div style={{ flex: 1, padding: "10px 0", borderRadius: 7, textAlign: "center", fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "rgba(255,255,255,0.2)", cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  Double Side <span style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 99, letterSpacing: "0.05em" }}>N/A</span>
                </div>
              </div>
              <p style={{ marginTop: 10, fontSize: "0.78rem", color: "rgba(245,245,245,0.4)" }}>₹{SINGLE_PRICE.toFixed(2)}/page · Single Side</p>
            </div>

            {/* Copies */}
            <div className="glass-hover" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginTop: 12, transition: "border-color 0.2s" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400", marginBottom: 12 }}>Copies</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                <button className="counter-btn" onClick={() => changeCopies(-1)} style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,212,0,0.08)", border: "1px solid rgba(255,212,0,0.22)", color: "#FFD400", fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s ease", userSelect: "none" }}>−</button>
                <span style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "'DM Mono',monospace", color: "#FFD400", minWidth: 52, textAlign: "center", textShadow: "0 0 20px rgba(255,212,0,0.3)", display: "inline-block", transform: copiesPop ? "scale(1.4)" : "scale(1)", transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>{copies}</span>
                <button className="counter-btn" onClick={() => changeCopies(1)} style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,212,0,0.08)", border: "1px solid rgba(255,212,0,0.22)", color: "#FFD400", fontSize: "1.3rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s ease", userSelect: "none" }}>+</button>
              </div>
              <p style={{ textAlign: "center", marginTop: 8, fontSize: "0.78rem", color: "rgba(245,245,245,0.4)" }}>copies of all files</p>
            </div>

            {/* Phone */}
            <div className="glass-hover" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginTop: 12, transition: "border-color 0.2s" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400", marginBottom: 12 }}>Phone Number</div>
              <input type="tel" placeholder="e.g. 9876543210" value={phone} maxLength={15}
                onChange={e => setPhone(e.target.value)}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "13px 16px", color: "#F5F5F5", fontFamily: "'DM Mono',monospace", fontSize: "0.92rem", width: "100%", outline: "none" }} />
            </div>

            {/* ── DELAY-CAT section — teaser or full card based on SHOW_DELAY_CAT toggle ── */}
            {!SHOW_DELAY_CAT ? (
              <DelayCatTeaser />
            ) : (
              <div
                className={isDelayCat ? "delay-card-active" : ""}
                onClick={() => { playClick(); setIsDelayCat(p => !p); }}
                style={{
                  cursor: "pointer",
                  background: isDelayCat ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.1)",
                  border: `1px solid ${isDelayCat ? "rgba(99,102,241,0.4)" : "rgba(99,102,241,0.4)"}`,
                  borderRadius: 14, padding: "16px 18px", marginTop: 12,
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: isDelayCat ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${isDelayCat ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", transition: "all 0.3s" }}>
                      {isDelayCat ? "🔐" : "⏱️"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.88rem", color: isDelayCat ? "rgba(99,102,241,0.95)" : "#F5F5F5", marginBottom: 2 }}>
                        DELAY-CAT
                        {isDelayCat && <span style={{ marginLeft: 8, fontSize: "0.6rem", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "rgba(99,102,241,0.9)", padding: "1px 7px", borderRadius: 99, fontFamily: "'DM Mono',monospace" }}>ACTIVE</span>}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "rgba(245,245,245,0.45)", lineHeight: 1.4 }}>Pay now, upload anywhere — print with OTP at the kiosk</div>
                    </div>
                  </div>
                  {/* Toggle pill */}
                  <div style={{ width: 44, height: 24, borderRadius: 99, flexShrink: 0, background: isDelayCat ? "#6366f1" : "rgba(255,255,255,0.1)", border: `1px solid ${isDelayCat ? "#6366f1" : "rgba(255,255,255,0.15)"}`, position: "relative", transition: "all 0.3s ease", boxShadow: isDelayCat ? "0 0 12px rgba(99,102,241,0.5)" : "none" }}>
                    <div style={{ position: "absolute", top: 2, left: isDelayCat ? 22 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
                {isDelayCat && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(99,102,241,0.2)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[["📤", "Upload from anywhere"], ["🐢", "Works on slow connections"], ["🔑", "Secure 4-digit OTP"], ["🖨️", "Print when you're ready"]].map(([icon, text]) => (
                      <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "rgba(99,102,241,0.85)", background: "rgba(99,102,241,0.08)", padding: "4px 10px", borderRadius: 99, border: "1px solid rgba(99,102,241,0.2)" }}>
                        <span>{icon}</span><span>{text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order Summary */}
            <div className="glass-hover" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginTop: 12, transition: "border-color 0.2s" }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400", marginBottom: 12 }}>Order Summary</div>
              {[
                ["Files queued", uploadedFiles.length],
                ["Print Type", printType === "S" ? "Single Side" : "Double Side"],
                ["Copies", copies],
                ["Price per page", `₹${unitPrice.toFixed(2)}`],
                ...(SHOW_DELAY_CAT ? [["Mode", isDelayCat ? "🔐 DELAY-CAT (OTP)" : "⚡ Instant Print"]] : []),
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.55)" }}>{label}</span>
                  <span style={{ fontSize: "0.85rem", fontFamily: "'DM Mono',monospace", color: label === "Mode" && isDelayCat ? "rgba(99,102,241,0.9)" : "inherit" }}>{val}</span>
                </div>
              ))}
              {/* Total Pages row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <span style={{ fontSize: "0.85rem", color: "rgba(245,245,245,0.55)" }}>Total pages</span>
                <span style={{ fontSize: "0.85rem", fontFamily: "'DM Mono',monospace", display: "flex", alignItems: "center", gap: 6 }}>
                  {pagesCounting
                    ? <span style={{ fontSize: "0.75rem", color: "rgba(255,212,0,0.5)", display: "flex", alignItems: "center", gap: 4 }}>
                        <svg style={{ animation: "spin 0.9s linear infinite", flexShrink: 0 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                        counting…
                      </span>
                    : <span style={{ color: totalDocPages > 0 ? "#FFD400" : "rgba(245,245,245,0.55)" }}>
                        {totalDocPages > 0 ? totalDocPages : "—"}
                        {totalDocPages > 0 && copies > 1 &&
                          <span style={{ color: "rgba(245,245,245,0.35)", fontSize: "0.75rem", marginLeft: 4 }}>× {copies} = {totalDocPages * copies}</span>
                        }
                      </span>
                  }
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0 0" }}>
                <span style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem", letterSpacing: "0.06em" }}>TOTAL</span>
                <span style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.3rem", color: (SHOW_DELAY_CAT && isDelayCat) ? "#a78bfa" : "#FFD400", textShadow: `0 0 20px ${(SHOW_DELAY_CAT && isDelayCat) ? "rgba(167,139,250,0.4)" : "rgba(255,212,0,0.4)"}` }}>
                  {pagesCounting
                    ? <span style={{ fontSize: "0.9rem", color: "rgba(255,212,0,0.6)" }}>calculating…</span>
                    : `₹${total.toFixed(2)}`
                  }
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              className="pay-btn pay-btn-wrap"
              onClick={initiatePayment}
              disabled={payBtnDisabled}
              style={{
                background: (SHOW_DELAY_CAT && isDelayCat) ? "#6366f1" : "#FFD400",
                color: (SHOW_DELAY_CAT && isDelayCat) ? "#fff" : "#0B0B0B",
                fontFamily: "'Black Han Sans',sans-serif",
                fontSize: "1.25rem", letterSpacing: "0.08em",
                border: "none", borderRadius: 14, padding: "22px 32px",
                width: "100%", cursor: payBtnDisabled ? "not-allowed" : "pointer",
                marginTop: 20, opacity: payBtnDisabled ? 0.35 : 1,
                transition: "all 0.2s ease", position: "relative", overflow: "hidden",
                boxShadow: (SHOW_DELAY_CAT && isDelayCat) && !payBtnDisabled
                  ? "0 0 24px rgba(99,102,241,0.4), 0 4px 16px rgba(0,0,0,0.3)"
                  : !payBtnDisabled ? "0 4px 16px rgba(0,0,0,0.25)" : "none",
                minHeight: 64,
              }}
            >
              {DEV_MODE
                ? "🛠 DEV: SKIP PAYMENT & TEST"
                : pagesCounting
                  ? "CALCULATING…"
                  : (SHOW_DELAY_CAT && isDelayCat)
                    ? `🔐 PAY ₹${total.toFixed(2)} · GET OTP`
                    : `PAY ₹${total.toFixed(2)} NOW`
              }
            </button>

            {/* DEV MODE bypass */}
            {DEV_MODE && (
              <button
                onClick={devTestPayment}
                disabled={payBtnDisabled}
                style={{ marginTop: 10, width: "100%", padding: "13px 0", borderRadius: 12, background: "transparent", border: "1.5px dashed rgba(255,80,80,0.5)", color: "rgba(255,120,120,0.85)", fontFamily: "'DM Mono',monospace", fontSize: "0.82rem", letterSpacing: "0.06em", cursor: payBtnDisabled ? "not-allowed" : "pointer", opacity: payBtnDisabled ? 0.35 : 1, transition: "all 0.2s ease" }}
                onMouseEnter={e => { if (!payBtnDisabled) e.target.style.background = "rgba(255,80,80,0.08)"; }}
                onMouseLeave={e => { e.target.style.background = "transparent"; }}
              >
                🛠 DEV: Skip Payment &amp; Test Upload
              </button>
            )}
          </div>
        </div>
      </div>

      <Toast msg={toast.msg} isError={toast.isError} visible={toast.visible} />
    </>
  );
}
