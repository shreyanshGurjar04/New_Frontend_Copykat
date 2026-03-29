import { useState, useEffect, useRef } from 'react'
import newlogo from "../assets/New_Logo.jpeg";
import clickSound from "../assets/Button-Clicking.mp3";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const clickAudio = useRef(null)

  useEffect(() => {
    clickAudio.current = new Audio(clickSound)
    clickAudio.current.preload = "auto"
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const playClick = () => {
    if (clickAudio.current) {
      clickAudio.current.currentTime = 0
      clickAudio.current.play().catch(() => {})
    }
  }

  return (
    <>
      <style>{`
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,212,0,0.4); }
          50%      { box-shadow: 0 0 0 7px rgba(255,212,0,0); }
        }
      `}</style>

      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <a
          href="#"
          className="nav-logo"
          onClick={(e) => { e.preventDefault(); playClick(); }}
        >
          {/* Logo image — matches Second.jsx exactly */}
          <div style={{
            marginLeft:'-10px',
            width: 50,
            height: 50,
            background: '#FFD400',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'logoPulse 3s ease-in-out infinite',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <img
              src={newlogo}
              alt="CopyKat"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <span className="nav-logo-text">Copy<span>Kat</span></span>
        </a>

        <a href="/first" className="nav-cta">Start Printing →</a>
      </nav>
    </>
  )
}
