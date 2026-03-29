import { useState, useEffect, useRef } from 'react'

const MARQUEE_WORDS = ['PRINT SMARTER','UPLOAD & PRINT','PAY INSTANTLY','NO QUEUES','CAMPUS READY','24/7 AVAILABLE','FAST PRINTS','SECURE UPLOAD']
const URL_TEXTS = ['Copykat.app/print','Uploading… 87%','Payment successful ✓','Printing now… 🖨️','Ready for pickup! ✅','Copykat.app/print']

const PrinterSVG = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
)

function KioskMockup() {
  const [urlText, setUrlText] = useState(URL_TEXTS[0])
  const [urlOpacity, setUrlOpacity] = useState(1)
  const wrapRef = useRef()
  const cardRef = useRef()

  useEffect(() => {
    let idx = 0
    const iv = setInterval(() => {
      idx = (idx + 1) % URL_TEXTS.length
      setUrlOpacity(0)
      setTimeout(() => { setUrlText(URL_TEXTS[idx]); setUrlOpacity(1) }, 300)
    }, 2600)
    return () => clearInterval(iv)
  }, [])

  const handleMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2
    const rx = (e.clientY - cy) / 22, ry = -(e.clientX - cx) / 22
    cardRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`
    cardRef.current.style.boxShadow = `${-ry*2}px ${rx*2}px 60px rgba(0,0,0,.6),0 0 80px rgba(255,212,0,.08)`
  }
  const handleLeave = () => {
    if (cardRef.current) { cardRef.current.style.transform = ''; cardRef.current.style.boxShadow = '' }
  }

  return (
    <div className="hero-illustration" ref={wrapRef} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="kiosk-mockup" ref={cardRef}>
        <div className="kiosk-screen-top">
          <div className="kiosk-dots">
            <div className="kiosk-dot" style={{background:'#FF5F57'}}/>
            <div className="kiosk-dot" style={{background:'#FFBD2E'}}/>
            <div className="kiosk-dot" style={{background:'#28C840',animation:'dot-pulse-green 2s ease-in-out infinite'}}/>
          </div>
          <div className="kiosk-url-bar" style={{opacity: urlOpacity}}>{urlText}</div>
          <div style={{width:48}}/>
        </div>
        <div className="kiosk-content">
          <div className="kiosk-header-bar">
            <div className="kiosk-logo-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
            </div>
            <span style={{fontSize:'.82rem',fontWeight:700}}>Copy<span style={{color:'var(--y)'}}>Kat</span> Print</span>
            <span style={{marginLeft:'auto',fontSize:'.68rem',color:'rgba(255,212,0,.6)',fontWeight:700}}>● Ready</span>
          </div>
          <div className="kiosk-upload-zone">
            <div style={{color:'rgba(255,212,0,.5)',marginBottom:6,fontSize:'1.3rem'}}>⬆</div>
            Drop your PDF, PNG or JPG here
          </div>
          <div className="kiosk-options">
            <div className="kiosk-opt active">Single Side</div>
            <div className="kiosk-opt">Double Side</div>
            <div className="kiosk-opt">1 Copy</div>
          </div>

          {/* ── PAY button — now a real link to /first ── */}
          <a
            href="/first"
            style={{
              marginTop: 12,
              height: 36,
              background: 'rgba(255,212,0,.88)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '.76rem',
              fontWeight: 800,
              color: '#0B0B0B',
              letterSpacing: '.08em',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'background .18s, transform .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFD400'; e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,212,0,.88)'; e.currentTarget.style.transform = 'scale(1)' }}
          >
            PAY ₹2.00 NOW
          </a>
        </div>
      </div>
      <div style={{position:'absolute',bottom:-30,left:'50%',transform:'translateX(-50%)',width:'55%',height:40,background:'rgba(255,212,0,.1)',filter:'blur(22px)',borderRadius:'50%',pointerEvents:'none'}}/>
    </div>
  )
}

export default function Hero() {
  const all = [...MARQUEE_WORDS,...MARQUEE_WORDS,...MARQUEE_WORDS,...MARQUEE_WORDS]
  return (
    <>
      <style>{`
        @keyframes printPortalGlow {
          0%,100% {
            box-shadow: 0 0 8px rgba(40,200,64,0.3), inset 0 0 8px rgba(40,200,64,0.05);
            border-color: rgba(40,200,64,0.35);
          }
          50% {
            box-shadow: 0 0 20px rgba(40,200,64,0.6), inset 0 0 16px rgba(40,200,64,0.1);
            border-color: rgba(40,200,64,0.7);
          }
        }
        @keyframes badge-dot-blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
      `}</style>

      <section id="hero">
        <div className="hero-glow-main"/>
        <div className="orb orb-1" style={{width:200,height:200,background:'rgba(255,212,0,.08)',top:'15%',left:'8%','--dur':'7s'}}/>
        <div className="orb orb-2" style={{width:140,height:140,background:'rgba(255,212,0,.05)',top:'60%',right:'6%','--dur':'9s','--delay':'1.5s'}}/>
        <div className="orb orb-3" style={{width:80,height:80,background:'rgba(255,180,0,.1)',top:'35%',right:'15%','--dur':'6s','--delay':'3s'}}/>

        <div style={{position:'relative',zIndex:2,display:'flex',flexDirection:'column',alignItems:'center'}}>

          <div
            className="hero-badge"
            style={{
              color: '#28C840',
              border: '1px solid rgba(40,200,64,0.4)',
              background: 'rgba(40,200,64,0.08)',
              boxShadow: '0 0 12px rgba(40,200,64,0.3), inset 0 0 12px rgba(40,200,64,0.05)',
              textShadow: '0 0 10px rgba(40,200,64,0.8)',
              animation: 'printPortalGlow 2s ease-in-out infinite',
            }}
          >
            <span
              className="badge-dot"
              style={{
                background: '#28C840',
                boxShadow: '0 0 6px #28C840',
                animation: 'badge-dot-blink 1.5s ease-in-out infinite',
              }}
            />
            Now live on campus
          </div>

          <h1 className="hero-title">
            PRINT{' '}
            <span className="accent glitch" data-text="SMARTER.">SMARTER.</span>
            <br/>ANYTIME.<br/>
            <span style={{color:'rgba(245,245,245,.22)'}}>At Indus University.</span>
          </h1>

          <p className="hero-sub">
            Copykat is a self-service, cloud-integrated printing kiosk for modern student environments. Upload from your phone, pay instantly, collect your print — no queues, no hassle.
          </p>

          <div className="hero-buttons">
            <a href="/first" className="btn-primary">
              <PrinterSVG />
              Start Printing
            </a>
            <a href="#story" className="btn-ghost">
              Our Story
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
            </a>
          </div>

          <KioskMockup />
        </div>

        <div className="marquee-band">
          <div className="marquee-inner">
            {all.map((w, i) => <span key={i}>{w}</span>)}
          </div>
        </div>
      </section>
    </>
  )
}