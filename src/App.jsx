import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'

// ── Hooks ─────────────────────────────────────────────────────────────────────
import useCursor from './hooks/useCursor'
import useReveal from './hooks/useReveal'

// ── Shared components ─────────────────────────────────────────────────────────
import BackgroundCanvases from './components/BackgroundCanvases'
import Navbar             from './components/Navbar'
import Hero               from './components/Hero'
import KioskShowcase      from './components/KioskShowcase'
import {
  Ticker, Divider,
  WhatSection, StruggleSection, StorySection,
  UsersSection, FeaturesSection, PricingSection,
  CTASection, CampusAdsSection,
  DelayKatSection, BusinessSection,
  Footer,
} from './components/Sections'

// ── Page-level routes ─────────────────────────────────────────────────────────
import First     from './pages/first'
import Admin     from './pages/Admin'
import AboutInfo from './pages/About_info'

const TICKER_1 = [
  '24/7 AVAILABILITY','UPI PAYMENTS','FAST PRINTOUTS','NO WAITING',
  'CLOUD UPLOAD','SECURE & PRIVATE','PDF · PNG · JPG','CAMPUS KIOSK',
  'DELAY KAT','SCHEDULE PRINTS','WHITE LABEL','RENT OR BUY',
]
const TICKER_2 = [
  'BORN FROM FRUSTRATION','REAL STUDENT PROBLEM','BUILT BY STUDENTS',
  'CAMPUS FIRST','KIOSK PRINTING','RUGGED & RELIABLE','CLOUD CONNECTED','ZERO DEPENDENCY',
  'DELAY KAT COMING SOON','YOUR BRAND OUR MACHINE','OWN IT OR RENT IT','GROVIK TECHNO VENTURES',
]

// ── Landing page ──────────────────────────────────────────────────────────────
function LandingPage() {
  useCursor()
  useReveal()

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target
          el.style.transform  = 'scale(1.25)'
          el.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)'
          setTimeout(() => (el.style.transform = 'scale(1)'), 400)
        }
      }),
      { threshold: 0.5 }
    )
    document.querySelectorAll('.stat-num').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  })

  useEffect(() => {
    document.querySelectorAll('.card-emoji').forEach((em) => {
      const card = em.closest('.glass-card')
      if (!card) return
      card.addEventListener('mouseenter', () => {
        em.style.transform  = 'scale(1.35) rotate(-12deg)'
        em.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1)'
      })
      card.addEventListener('mouseleave', () => (em.style.transform = 'scale(1) rotate(0)'))
    })
  })

  return (
    <>
      <div id="ck-cursor" />
      <div id="ck-ring" />
      <BackgroundCanvases />
      <div className="grid-bg" />
      <div className="scanlines" />
      <Navbar />
      <Hero />
      <KioskShowcase />
      <Ticker items={TICKER_1} />
      <Divider />
      <WhatSection />
      <Divider />
      <StruggleSection />
      <Divider />
      <Ticker items={TICKER_2} reverse />
      <StorySection />
      <Divider />
      <UsersSection />
      <Divider />
      <FeaturesSection />
      <Divider />
      {/* ── Delay Kat — scheduled printing feature ── */}
      <DelayKatSection />
      <Divider />
      {/* ── Business options — white label / buy / rent ── */}
      <BusinessSection />
      <Divider />
      <PricingSection />
      <Divider />
      <CTASection />
      <CampusAdsSection />
      <Footer />
    </>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      <Route path="/"      element={<LandingPage />} />
      <Route path="/index" element={<LandingPage />} />
      <Route path="/first" element={<First />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/about" element={<AboutInfo />} />
      <Route path="*"      element={<LandingPage />} />
    </Routes>
  )
}