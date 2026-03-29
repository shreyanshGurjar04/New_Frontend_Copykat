import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

const SPECS_L = []
const SPECS_R = []

function SpecCard({ lbl, val, note, dur, del, delay }) {
  return (
    <div className={`sc reveal reveal-delay-${delay}`} style={{ '--dur': dur, '--del': del }}>
      <div className="sc-lbl">{lbl}</div>
      <div className="sc-val">{val}</div>
      <div className="sc-note">{note}</div>
    </div>
  )
}

// ─── Isolated 3D canvas — accepts its own refs, works at any size ───────────
function KioskCanvas({ wrapRef, cnvRef, degRef }) {
  useEffect(() => {
    const wrap = wrapRef.current, cnv = cnvRef.current
    if (!wrap || !cnv) return
    let animId, aT

    const renderer3 = new THREE.WebGLRenderer({ canvas: cnv, antialias: true, alpha: true })
    renderer3.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer3.shadowMap.enabled = true
    renderer3.shadowMap.type = THREE.PCFSoftShadowMap
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, .01, 100)
    camera.position.set(0, .9, 4.4); camera.lookAt(0, .65, 0)

    function resz() {
      const w = wrap.clientWidth, h = wrap.clientHeight
      renderer3.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resz()
    const ro = new ResizeObserver(resz); ro.observe(wrap)

    scene.add(new THREE.AmbientLight(0xfff5e0, .55))
    const sun = new THREE.DirectionalLight(0xfff8e7, 1.7)
    sun.position.set(4, 7, 5); sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -2; sun.shadow.camera.right = 2
    sun.shadow.camera.top = 3.5; sun.shadow.camera.bottom = -.5
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x3355aa, .2); fill.position.set(-4, 2, -3); scene.add(fill)
    const rim = new THREE.DirectionalLight(0xFFD400, .3); rim.position.set(-2, 5, -4); scene.add(rim)
    const frt = new THREE.DirectionalLight(0xffffff, .25); frt.position.set(0, 2, 5); scene.add(frt)

    const S = 1 / 1000
    const mBD = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: .45, metalness: .25 })
    const mBK = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: .5, metalness: .2 })
    const mYel = new THREE.MeshStandardMaterial({ color: 0xC88A00, roughness: .38, metalness: .08 })
    const mYa = new THREE.MeshStandardMaterial({ color: 0xFFD400, roughness: .25, emissive: 0xFFD400, emissiveIntensity: .12 })
    const mDk = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: .62, metalness: .1 })
    const mGr = new THREE.MeshStandardMaterial({ color: 0x282828, roughness: .5, metalness: .3 })
    const mGl = new THREE.MeshStandardMaterial({ color: 0x091520, roughness: .04, metalness: .35, transparent: true, opacity: .84 })
    const mPp = new THREE.MeshStandardMaterial({ color: 0xeee4cc, roughness: .95 })

    const BX = (w, h, d, m) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.castShadow = true; o.receiveShadow = true; return o }
    const CL = (r, h, m, s = 20) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, s), m); o.castShadow = true; return o }
    const AT = (o, x, y, z) => { o.position.set(x, y, z); return o }

    const K = new THREE.Group(); scene.add(K)
    const W = 717 * S, D = 721 * S, H = 1690 * S, BH = 864 * S, TW = 173 * S
    const dA = THREE.MathUtils.degToRad(23)
    const dL = 653 * S, sH = dL * Math.sin(dA), sD = dL * Math.cos(dA), tA = Math.tan(dA)

    K.add(AT(BX(W, BH, D, mBD), 0, BH / 2, 0))
    K.add(AT(BX(.015, BH + .001, D + .001, mYel), W / 2 + .0075, BH / 2, 0))
    K.add(AT(BX(.015, BH + .001, D + .001, mYel), -W / 2 - .0075, BH / 2, 0))
    K.add(AT(BX(W + .031, BH + .001, .015, mYel), 0, BH / 2, -D / 2 - .0075))
    K.add(AT(BX(W + .031, .020, D + .031, mBK), 0, .010, 0))
    K.add(AT(BX(W + .002, .014, D + .002, mBK), 0, BH + .007, 0))
    const pW = 340 * S, pH = 152 * S, pY = BH * .55, pFZ = D / 2
    K.add(AT(BX(pW + .008, pH + .008, .040, mDk), 0, pY, pFZ - .020))
    K.add(AT(BX(pW, .014, .042, mGr), 0, pY + pH / 2 - .007, pFZ - .021))
    K.add(AT(BX(pW, .014, .042, mGr), 0, pY - pH / 2 + .007, pFZ - .021))
    K.add(AT(BX(pW + .018, .006, .004, mYa), 0, pY + pH / 2 + .005, pFZ + .001))
    K.add(AT(BX(pW + .018, .006, .004, mYa), 0, pY - pH / 2 - .005, pFZ + .001))
    K.add(AT(BX(pW - .04, .004, .055, mPp), 0, pY + pH / 2 + .004, pFZ + .022))
    const sb = BX(W, .020, dL, mBD); sb.rotation.x = dA; K.add(AT(sb, 0, BH + sH / 2, D / 2 - sD / 2))
    for (let i = 0; i < 80; i++) {
      const z0 = i / 80 * sD, z1 = (i + 1) / 80 * sD, h = (z0 + z1) / 2 * tA
      if (h < .001) continue
      const dz = z1 - z0
      const sl = BX(W, h + .001, dz + .001, mBD); sl.position.set(0, BH + h / 2, D / 2 - z0 - dz / 2); K.add(sl)
      const sR = BX(.016, h + .001, dz + .001, mYel); sR.position.set(W / 2 + .008, BH + h / 2, D / 2 - z0 - dz / 2); K.add(sR)
      const sL = BX(.016, h + .001, dz + .001, mYel); sL.position.set(-W / 2 - .008, BH + h / 2, D / 2 - z0 - dz / 2); K.add(sL)
    }
    const qW = 319 * S, qHt = 185 * S, qZo = 183 * S
    const qZw = D / 2 - qZo * Math.cos(dA) - qHt / 2 * Math.cos(dA)
    const qYw = BH + qZo * Math.sin(dA) + .015
    const qb = BX(qW, .030, qHt, mDk); qb.rotation.x = dA; K.add(AT(qb, 0, qYw, qZw))
    const qg = BX(qW - .010, .005, qHt - .010, mGl); qg.rotation.x = dA; K.add(AT(qg, 0, qYw + .009, qZw + .001))
    const qbo = BX(qW + .007, .005, qHt + .007, mYa); qbo.rotation.x = dA; K.add(AT(qbo, 0, qYw + .004, qZw))
    const tH = H - BH, tCZ = -D / 2 + TW / 2
    K.add(AT(BX(W, tH, TW, mBD), 0, BH + tH / 2, tCZ))
    K.add(AT(BX(.015, tH + .001, TW + .001, mYel), W / 2 + .0075, BH + tH / 2, tCZ))
    K.add(AT(BX(.015, tH + .001, TW + .001, mYel), -W / 2 - .0075, BH + tH / 2, tCZ))
    K.add(AT(BX(W + .031, .018, TW + .018, mBK), 0, H + .009, tCZ))
    K.add(AT(BX(W + .031, .008, TW + .018, mYa), 0, H + .021, tCZ))
    const scW = 533 * S, scH = 303 * S, scFZ = -D / 2 + TW + .016, scY = H - scH / 2 - .065
    K.add(AT(BX(scW + .022, scH + .022, .018, mBK), 0, scY, scFZ - .005))
    const uc = document.createElement('canvas'); uc.width = 256; uc.height = 145
    const uctx = uc.getContext('2d')
    uctx.fillStyle = '#040c18'; uctx.fillRect(0, 0, 256, 145)
    const ug = uctx.createLinearGradient(0, 0, 0, 145)
    ug.addColorStop(0, 'rgba(18,48,96,.8)'); ug.addColorStop(1, 'rgba(4,10,22,1)')
    uctx.fillStyle = ug; uctx.fillRect(0, 0, 256, 145)
    uctx.fillStyle = '#FFD400'; uctx.fillRect(12, 10, 110, 3)
    uctx.font = 'bold 18px sans-serif'; uctx.textAlign = 'center'; uctx.fillStyle = '#FFD400'; uctx.fillText('CopyKat', 128, 82)
    uctx.fillStyle = 'rgba(255,212,0,.35)'; uctx.font = '7px sans-serif'; uctx.fillText('PRINT KIOSK v1', 128, 96)
    uctx.fillStyle = '#FFD400'; uctx.fillRect(28, 118, 200, 22); uctx.fillStyle = '#111'; uctx.font = 'bold 8px sans-serif'; uctx.fillText('Pay & Print', 128, 133)
    const scTex = new THREE.CanvasTexture(uc)
    const scMat = new THREE.MeshStandardMaterial({ map: scTex, emissiveMap: scTex, emissive: new THREE.Color(1, 1, 1), emissiveIntensity: .5, roughness: .04, metalness: .15 })
    K.add(AT(BX(scW, scH, .007, scMat), 0, scY, scFZ + .005))
    K.add(AT(BX(.003, scH + .022, .003, mYa), -scW / 2 - .013, scY, scFZ))
    K.add(AT(BX(.003, scH + .022, .003, mYa), scW / 2 + .013, scY, scFZ))
    for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) {
      const v = CL(.004, .022, mGr, 6); v.rotation.z = Math.PI / 2
      v.position.set(W / 2 + .006, BH * .28 + r * .018, -D * .1 + c * .018); K.add(v)
    }
    ;[[-W / 2 + .06, D / 2 - .07], [W / 2 - .06, D / 2 - .07], [-W / 2 + .06, -D / 2 + .07], [W / 2 - .06, -D / 2 + .07]].forEach(([x, z]) => {
      const f = CL(.024, .018, new THREE.MeshStandardMaterial({ color: 0x080808, roughness: .95 }), 8)
      f.position.set(x, -.009, z); K.add(f)
    })
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: .2 }))
    gnd.rotation.x = -Math.PI / 2; gnd.position.y = -.001; gnd.receiveShadow = true; scene.add(gnd)
    const ring = new THREE.Mesh(new THREE.RingGeometry(.44, .84, 64), new THREE.MeshBasicMaterial({ color: 0xFFD400, transparent: true, opacity: .04, side: THREE.DoubleSide }))
    ring.rotation.x = -Math.PI / 2; ring.position.y = .001; scene.add(ring)
    K.position.set(0, 0, D / 2)

    // Interaction state — local to this instance
    const st = { tY: -.62, tX: .18, cY: -.62, cX: .18, autoR: true, dr: false, mpx: 0, mpy: 0, camZ: 4.4, pi2: 0 }

    const sd = (x, y) => { st.dr = true; st.mpx = x; st.mpy = y; st.autoR = false; clearTimeout(aT) }
    const mv = (x, y) => { if (!st.dr) return; st.tY += (x - st.mpx) * .009; st.tX += (y - st.mpy) * .004; st.tX = Math.max(-.5, Math.min(.62, st.tX)); st.mpx = x; st.mpy = y }
    const eu = () => { st.dr = false; aT = setTimeout(() => st.autoR = true, 4500) }

    cnv.addEventListener('mousedown', e => { e.stopPropagation(); sd(e.clientX, e.clientY) })
    const _mvHandler = e => mv(e.clientX, e.clientY)
    window.addEventListener('mousemove', _mvHandler)
    window.addEventListener('mouseup', eu)
    cnv.addEventListener('wheel', e => {
      e.preventDefault()
      st.camZ += e.deltaY * .002; st.camZ = Math.max(1.6, Math.min(7, st.camZ))
      st.autoR = false; clearTimeout(aT); aT = setTimeout(() => st.autoR = true, 2500)
    }, { passive: false })
    cnv.addEventListener('touchstart', e => {
      e.stopPropagation()
      e.preventDefault()   // ← stop page scroll immediately on touch
      if (e.touches.length === 1) { sd(e.touches[0].clientX, e.touches[0].clientY) }
      else if (e.touches.length === 2) { st.dr = false; const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY; st.pi2 = Math.sqrt(dx * dx + dy * dy) }
    }, { passive: false })  // ← must be non-passive to call preventDefault
    cnv.addEventListener('touchmove', e => {
      e.preventDefault()   // ← block page scroll while finger is on canvas
      if (e.touches.length === 1) mv(e.touches[0].clientX, e.touches[0].clientY)
      else if (e.touches.length === 2 && st.pi2 > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX, dy = e.touches[0].clientY - e.touches[1].clientY
        const d = Math.sqrt(dx * dx + dy * dy); st.camZ -= (d - st.pi2) * .005; st.camZ = Math.max(1.6, Math.min(7, st.camZ)); st.pi2 = d
      }
    }, { passive: false })  // ← must be non-passive to call preventDefault
    cnv.addEventListener('touchend', e => { if (e.touches.length === 0) eu(); st.pi2 = 0 })

    // View preset helpers — scoped to this canvas instance
    const btnIds = { front: [0, .05, 3.5], side: [-Math.PI / 2, .06, 3.5], iso: [-.62, .18, 4.4] }
    const svHandlers = {}
    Object.entries(btnIds).forEach(([key, [y, x, z]]) => {
      const id = `ks-b${key.charAt(0).toUpperCase() + key.slice(1)}-${cnv.id}`
      svHandlers[id] = () => { st.autoR = false; clearTimeout(aT); st.tY = y; st.tX = x; st.camZ = z; aT = setTimeout(() => st.autoR = true, 5000) }
      document.getElementById(id)?.addEventListener('click', svHandlers[id])
    })
    const autoId = `ks-bAuto-${cnv.id}`
    const autoHandler = () => { st.autoR = true; st.tX = .18; st.camZ = 4.4 }
    document.getElementById(autoId)?.addEventListener('click', autoHandler)

    let t = 0
    ;(function loop() {
      animId = requestAnimationFrame(loop); t += .007
      if (st.autoR && !st.dr) st.tY += .0033
      st.cY += (st.tY - st.cY) * .08; st.cX += (st.tX - st.cX) * .08
      K.rotation.y = st.cY; K.rotation.x = st.cX
      camera.position.z += (st.camZ - camera.position.z) * .08
      K.position.y = Math.sin(t * .5) * .006
      scMat.emissiveIntensity = .45 + Math.sin(t * 1.6) * .12
      ring.material.opacity = .035 + Math.sin(t) * .015
      if (degRef?.current) { const deg = Math.round(((st.cY % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) * 180 / Math.PI); degRef.current.textContent = deg + '°' }
      renderer3.render(scene, camera)
    })()

    K.scale.set(.01, .01, .01)
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { let sc = 0; const si = setInterval(() => { sc += .03; const ev = 1 - Math.pow(1 - Math.min(1, sc), 3); K.scale.setScalar(ev); if (sc >= 1) clearInterval(si) }, 16); io.disconnect() }
    }, { threshold: .1 })
    io.observe(wrap)

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(aT)
      ro.disconnect()
      renderer3.dispose()
      window.removeEventListener('mousemove', _mvHandler)
      window.removeEventListener('mouseup', eu)
    }
  }, [])

  return null
}

// ─── Fullscreen Overlay ──────────────────────────────────────────────────────
function FullscreenOverlay({ onClose }) {
  const wrapRef = useRef()
  const cnvRef  = useRef()
  const degRef  = useRef()

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="ks-fs-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="ks-fs-panel">
        {/* Header bar */}
        <div className="ks-fs-header">
          <div className="ks-fs-title">
            <span className="ks-live-dot" />
            CopyKat · Full 3D Viewer
          </div>
          <div className="ks-fs-actions">
            <span className="ks-fs-hint">🖱 Drag · Scroll to zoom · ESC to close</span>
            <button className="ks-fs-close" onClick={onClose} aria-label="Close fullscreen viewer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Close
            </button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="ks-fs-canvas-wrap" ref={wrapRef}>
          <div className="ks-scan" />
          <div className="ks-glow" />
          <canvas id="ks3d-fs" ref={cnvRef} />
          <div className="ks-deg" ref={degRef}>0°</div>
          <div className="ks-ctrl">
            <span className="ks-hint">🖱 Drag · Scroll</span>
            <div className="ks-sep" />
            <div className="ks-btn" id="ks-bFront-ks3d-fs">Front</div>
            <div className="ks-btn" id="ks-bSide-ks3d-fs">Side</div>
            <div className="ks-btn" id="ks-bIso-ks3d-fs">ISO</div>
            <div className="ks-sep" />
            <div className="ks-btn" id="ks-bAuto-ks3d-fs">⟳ Auto</div>
          </div>
        </div>

        <KioskCanvas wrapRef={wrapRef} cnvRef={cnvRef} degRef={degRef} />
      </div>

      <style>{`
        .ks-fs-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: ks-fs-fadein .22s ease;
        }
        @keyframes ks-fs-fadein {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .ks-fs-panel {
          position: relative;
          width: min(96vw, 1200px);
          height: min(92vh, 820px);
          background: #0a0a0a;
          border: 1px solid rgba(255,212,0,.18);
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 0 0 1px rgba(255,212,0,.06), 0 40px 120px rgba(0,0,0,.9), 0 0 80px rgba(255,212,0,.06);
          animation: ks-fs-slidein .28s cubic-bezier(.16,1,.3,1);
        }
        @keyframes ks-fs-slidein {
          from { opacity: 0; transform: scale(.96) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
        .ks-fs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(255,212,0,.12);
          background: rgba(255,212,0,.03);
          flex-shrink: 0;
        }
        .ks-fs-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: .75rem;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: rgba(255,212,0,.9);
        }
        .ks-fs-actions {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ks-fs-hint {
          font-size: .7rem;
          color: rgba(255,255,255,.3);
          letter-spacing: .04em;
        }
        .ks-fs-close {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,212,0,.08);
          border: 1px solid rgba(255,212,0,.25);
          color: #FFD400;
          font-size: .72rem;
          font-weight: 700;
          padding: 7px 16px;
          border-radius: 99px;
          cursor: pointer;
          letter-spacing: .08em;
          text-transform: uppercase;
          transition: background .18s, border-color .18s, transform .12s;
        }
        .ks-fs-close:hover {
          background: rgba(255,212,0,.2);
          border-color: rgba(255,212,0,.5);
          transform: scale(1.04);
        }
        .ks-fs-canvas-wrap {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        .ks-fs-canvas-wrap canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
        @media (max-width: 600px) {
          .ks-fs-panel {
            width: 100vw;
            height: 100dvh;
            border-radius: 0;
          }
          .ks-fs-hint { display: none; }
        }
      `}</style>
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function KioskShowcase() {
  const wrapRef = useRef()
  const cnvRef  = useRef()
  const degRef  = useRef()
  const [fsOpen, setFsOpen] = useState(false)

  const openFullscreen  = useCallback(() => setFsOpen(true),  [])
  const closeFullscreen = useCallback(() => setFsOpen(false), [])

  return (
    <>
      <section id="kiosk-showcase">
        <div className="ks-inner">
          <div className="reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,212,0,.07)', border: '1px solid rgba(255,212,0,.22)', color: 'var(--y)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 99, marginBottom: 18 }}>
              <span className="ks-live-dot" />Interactive 3D Preview
            </div>
            <h2 style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: 'clamp(2.2rem,5vw,3.8rem)', letterSpacing: '-.02em', lineHeight: .94, marginBottom: 14 }}>
              The Machine<br /><em style={{ fontStyle: 'normal', color: 'var(--y)', textShadow: '0 0 40px rgba(255,212,0,.3)' }}>Behind Every Print.</em>
            </h2>
            <p style={{ fontSize: '.98rem', color: 'var(--muted)', maxWidth: 460, margin: '0 auto', lineHeight: 1.72 }}>
              Drag, spin &amp; inspect the CopyKat kiosk in real-time 3D — engineered millimetre by millimetre for campus life.
            </p>
          </div>

          <div className="ks-stage">
            <div className="ks-col-l">
              {SPECS_L.map((s, i) => <SpecCard key={i} {...s} delay={i + 1} />)}
            </div>
            <div className="ks-col-c">
              <div className="ks-canvas-wrap reveal" ref={wrapRef}>
                <div className="ks-scan" />
                <div className="ks-glow" />
                <div className="ks-live"><span className="ks-live-dot" />Live 3D</div>
                <canvas id="ks3d" ref={cnvRef} />
                <div className="ks-deg" ref={degRef}>0°</div>
                <div className="ks-ctrl">
                  <span className="ks-hint">🖱 Drag · Scroll</span>
                  <div className="ks-sep" />
                  <div className="ks-btn" id="ks-bFront-ks3d">Front</div>
                  <div className="ks-btn" id="ks-bSide-ks3d">Side</div>
                  <div className="ks-btn" id="ks-bIso-ks3d">ISO</div>
                  <div className="ks-sep" />
                  <div className="ks-btn" id="ks-bAuto-ks3d">⟳ Auto</div>
                </div>
              </div>
            </div>
            <div className="ks-col-r">
              {SPECS_R.map((s, i) => <SpecCard key={i} {...s} delay={i + 1} />)}
            </div>
          </div>

          <div className="ks-cta reveal">
            <div className="ks-cta-row">
              {/* ✅ Now opens fullscreen overlay instead of linking to kiosk.html */}
              <button className="btn-3d" onClick={openFullscreen}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                Open Full 3D Viewer
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
              </button>
              <a href="/first" className="btn-3d-ghost">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                Start Printing Now
              </a>
            </div>
            <div className="ks-trust">
              {['Drag & rotate freely', 'Exact engineering dims', 'Fullscreen immersive view'].map((t, i) => (
                <div className="ks-trust-item" key={i}><span>✓</span>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inline canvas — always mounted */}
      <KioskCanvas wrapRef={wrapRef} cnvRef={cnvRef} degRef={degRef} />

      {/* Fullscreen overlay — mounted only when open, spins up its own renderer */}
      {fsOpen && <FullscreenOverlay onClose={closeFullscreen} />}
    </>
  )
}