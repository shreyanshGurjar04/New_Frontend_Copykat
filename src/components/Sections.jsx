// Shared small components + all content sections
import newlogo from "../assets/New_Logo.jpeg";
const PrinterSVG = ({size=22}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
)

export function Ticker({ items, reverse }) {
  const all = [...items,...items,...items,...items]
  return (
    <div className="ticker-wrap">
      <div className={`ticker-track${reverse ? ' reverse' : ''}`}>
        {all.map((t,i) => (
          <span className="ticker-item" key={i}>
            <span className="ticker-dot"/>{t}
          </span>
        ))}
      </div>
    </div>
  )
}

export const Divider = () => <div className="section-divider"/>

export function SectionLabel({ children }) {
  return <span className="section-label">{children}</span>
}

export function WhatSection() {
  const steps = [
    ['01','Upload','Send your PDF, PNG, or JPG from any device — no cables, no apps needed.'],
    ['02','Configure','Choose print side, copies, and see your total instantly.'],
    ['03','Pay','Secure payment via UPI or card through Razorpay in seconds.'],
    ['04','Collect','Walk to the kiosk and collect your freshly printed document.'],
  ]
  return (
    <section className="section">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:64,alignItems:'center'}} className="responsive-grid">
        <div className="reveal-left">
          <SectionLabel>What is Copykat?</SectionLabel>
          <h2 className="section-title">A smarter way<br/>to print.</h2>
          <p className="section-body" style={{marginBottom:18}}>Copykat is a self-service, cloud-connected printing kiosk designed for high-traffic student environments — campuses and hostels where traditional print shops simply don't cut it.</p>
          <p className="section-body">Upload from your phone, configure instantly, pay via UPI, and collect. Runs 24/7 with zero dependency on a shopkeeper — faster, more private, always accessible.</p>
          <div style={{marginTop:36,display:'grid',gridTemplateColumns:'repeat(3,1fr)'}}>
            {[['24/7','Always open'],['0s','Queue time'],['₹2','Per page']].map(([n,l],i) => (
              <div key={i} style={{textAlign:'center',padding:'20px 0',borderRight:i<2?'1px solid rgba(255,212,0,.1)':'none'}}>
                <div className="stat-num">{n}</div>
                <div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:4,letterSpacing:'.06em',textTransform:'uppercase'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {steps.map(([num,title,desc],i) => (
            <div key={i} className={`glass-card tilt-card-${(i%3)+1}`} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'18px 22px'}}>
              <div style={{minWidth:38,height:38,background:'rgba(255,212,0,.08)',border:'1px solid rgba(255,212,0,.2)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Black Han Sans',sans-serif",fontSize:'.75rem',color:'var(--y)'}}>{num}</div>
              <div>
                <div style={{fontWeight:700,fontSize:'.95rem',marginBottom:3}}>{title}</div>
                <div style={{fontSize:'.83rem',color:'var(--muted)',lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StruggleSection() {
  const items = [
    ['01','Accessibility','Most print shops close late or are far from hostels. Copykat kiosks are available 24/7 exactly where students live and study.'],
    ['02','Privacy & Waiting','Students send personal docs via WhatsApp or USB drives to strangers. Copykat removes that awkwardness with direct private uploads.'],
    ['03','Technical Hassles','Driver issues, unsupported formats, device incompatibility — all gone. Copykat uses a simple mobile-to-kiosk workflow that just works.'],
  ]
  return (
    <section className="section">
      <div className="reveal" style={{textAlign:'center',maxWidth:580,margin:'0 auto 56px'}}>
        <SectionLabel>The Problem</SectionLabel>
        <h2 className="section-title">The Print Shop<br/>Struggle</h2>
        <p className="section-body" style={{margin:'0 auto'}}>Traditional campus printing is broken. Here's what students deal with every single day.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
        {items.map(([num,title,desc],i) => (
          <div key={i} className={`glass-card tilt-card-${i+1}`} style={{position:'relative'}}>
            <div className="struggle-number">{num}</div>
            <div className="icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:10}}>{title}</h3>
            <p style={{fontSize:'.88rem',color:'var(--muted)',lineHeight:1.7}}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function StorySection() {
  return (
    <section id="story" className="section">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center'}} className="responsive-grid">
        <div className="reveal-left" style={{position:'relative'}}>
          <div className="quote-card">
            <div className="quote-card-accent"/>
            <div style={{fontSize:'3.5rem',marginBottom:16,lineHeight:1}}>🎓</div>
            <blockquote style={{fontSize:'1.05rem',fontStyle:'italic',lineHeight:1.8,color:'rgba(245,245,245,.65)'}}>
              "Imagine rushing across campus at 9:00 AM trying to print an assignment due at 9:30 AM, only to find every print shop closed or charging unreasonable prices."
            </blockquote>
            <div style={{marginTop:22,display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:38,height:38,background:'var(--y)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div style={{fontSize:'.88rem',fontWeight:700}}>Shreyansh Gurjar (Founder)</div>
                <div style={{fontSize:'.75rem',color:'var(--muted)'}}>Real students, real problem</div>
              </div>
            </div>
            <div className="quote-corner">"</div>
          </div>
          <div style={{position:'absolute',bottom:-40,right:-30,width:120,height:120,border:'1px solid rgba(255,212,0,.12)',borderRadius:'50%',animation:'spin-slow 20s linear infinite',pointerEvents:'none'}}/>
          <div style={{position:'absolute',bottom:-20,right:-10,width:60,height:60,border:'1px solid rgba(255,212,0,.08)',borderRadius:'50%',animation:'spin-slow 12s linear infinite reverse',pointerEvents:'none'}}/>
        </div>
        <div className="reveal-right">
          <SectionLabel>Our Story</SectionLabel>
          <h2 className="section-title">Built from a<br/>Real Problem.</h2>
          <p className="section-body" style={{marginBottom:16}}>Copykat was born from the founders' own frustration as students — rushing across campus at 9 AM for a print job, only to find closed shop and even if the shop is open he had to face long queue.</p>
          <p className="section-body" style={{marginBottom:16}}>That experience sparked the mission: build a self-service kiosk that works anytime, without any dependency on a shopkeeper.</p>
          <p className="section-body">Building Copykat meant miniaturizing industrial printing tech into a rugged, sleek kiosk — tough enough for student environments yet modern enough for campus interiors.</p>
          <div style={{marginTop:28,display:'flex',gap:12,flexWrap:'wrap'}}>
            {['Campus First','24/7 Uptime','Student Built'].map(tag => (
              <span key={tag} style={{background:'rgba(255,212,0,.08)',border:'1px solid rgba(255,212,0,.18)',color:'var(--y)',fontSize:'.78rem',fontWeight:700,padding:'6px 16px',borderRadius:99,letterSpacing:'.08em',textTransform:'uppercase'}}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function UsersSection() {
  const users = [
    ['🎓','College Students','Print assignments, notes, and forms — anytime, even at midnight.'],
    ['👩‍🏫','Faculty','Quick handout printing without relying on department staff.'],
    ['🏢','Co-working Spaces','Drop-in printing for remote workers and freelancers.'],
    ['📚','Libraries','Self-service printing for research papers and reference material.'],
  ]
  return (
    <section className="section">
      <div className="reveal" style={{textAlign:'center',maxWidth:560,margin:'0 auto 56px'}}>
        <SectionLabel>Who It's For</SectionLabel>
        <h2 className="section-title">Designed for<br/>Campus Life.</h2>
        <p className="section-body" style={{margin:'0 auto'}}>From students and faculty to co-working spaces and libraries — Copykat fits anywhere people need to print fast.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
        {users.map(([emoji,title,desc],i) => (
          <div key={i} className={`glass-card tilt-card-${(i%3)+1}`} style={{textAlign:'center'}}>
            <div className="card-emoji" style={{fontSize:'2.4rem',marginBottom:14,display:'block',transition:'transform .3s'}}>{emoji}</div>
            <h3 style={{fontWeight:700,fontSize:'.98rem',marginBottom:8}}>{title}</h3>
            <p style={{fontSize:'.84rem',color:'var(--muted)',lineHeight:1.6}}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const features = [
    ['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 5v7l4 2','24/7 Availability','The kiosk never closes. Print at 3 AM before your 8 AM deadline — no problem.'],
    ['M22 12h-4l-3 9L9 3l-3 9H2','UPI Payments','Pay instantly with UPI, cards, or wallets via Razorpay — zero cash required.'],
    ['M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7','Fast Printouts','High-speed printing technology — your document is ready in seconds.'],
    ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z','Document Confidentiality','Files go straight to the kiosk. No third party ever sees your documents.'],
  ]
  return (
    <section className="section">
      <div className="reveal" style={{textAlign:'center',maxWidth:520,margin:'0 auto 56px'}}>
        <SectionLabel>Features</SectionLabel>
        <h2 className="section-title">Everything<br/>you need.</h2>
        <p className="section-body" style={{margin:'0 auto'}}>Built to make printing as simple as sending a message.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:22}}>
        {features.map(([path,title,desc],i) => (
          <div key={i} className={`glass-card tilt-card-${(i%3)+1}`}>
            <div className="icon-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={path}/>
              </svg>
            </div>
            <h3 style={{fontSize:'1rem',fontWeight:700,marginBottom:10}}>{title}</h3>
            <p style={{fontSize:'.87rem',color:'var(--muted)',lineHeight:1.65}}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function PricingSection() {
  const singleFeatures = ['Print one side per sheet','PDF, PNG, JPG accepted','Pay via UPI or card','Instant kiosk delivery']
  const doubleFeatures = ['Print both sides per sheet','50% more content per sheet','PDF, PNG, JPG accepted','Pay via UPI or card']
  return (
    <section className="section">
      <div className="reveal" style={{textAlign:'center',maxWidth:500,margin:'0 auto 56px'}}>
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="section-title">Simple<br/>Pricing.</h2>
        <p className="section-body" style={{margin:'0 auto'}}>No hidden fees. No subscriptions. Pay only when you print.</p>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24,maxWidth:720,margin:'0 auto'}}>
        <div className="pricing-card featured reveal">
          <div className="pricing-badge">Most Popular</div>
          <div style={{fontSize:'.76rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'var(--y)',marginBottom:16}}>Single Side</div>
          <div style={{display:'flex',alignItems:'flex-start',gap:2,marginBottom:6}}>
            <span style={{fontSize:'1.4rem',fontWeight:700,color:'var(--y)',marginTop:8}}>₹</span>
            <span className="price-big">2</span>
          </div>
          <div style={{fontSize:'.9rem',color:'var(--muted)',marginBottom:28}}>per page</div>
          <div style={{height:1,background:'rgba(255,212,0,.12)',marginBottom:24}}/>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:12}}>
            {singleFeatures.map((f,i) => <li key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:'.87rem',color:'rgba(245,245,245,.75)'}}><span style={{color:'var(--y)',fontSize:'1rem',fontWeight:800}}>✓</span>{f}</li>)}
          </ul>
          <a href="/first" className="btn-primary" style={{width:'100%',justifyContent:'center',marginTop:28}}>Print Now →</a>
        </div>
        <div className="pricing-card reveal reveal-delay-2">
          <div style={{fontSize:'.76rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',color:'rgba(255,255,255,.3)',marginBottom:16}}>Double Side</div>
          <div style={{display:'flex',alignItems:'flex-start',gap:2,marginBottom:6}}>
            <span style={{fontSize:'1.4rem',fontWeight:700,color:'rgba(245,245,245,.35)',marginTop:8}}>₹</span>
            <span style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:'4rem',color:'rgba(245,245,245,.35)',lineHeight:1}}>3.5</span>
          </div>
          <div style={{fontSize:'.9rem',color:'var(--muted)',marginBottom:28}}>per sheet</div>
          <div style={{height:1,background:'var(--border)',marginBottom:24}}/>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:12}}>
            {doubleFeatures.map((f,i) => <li key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:'.87rem',color:'rgba(245,245,245,.35)'}}><span style={{color:'rgba(255,255,255,.2)',fontSize:'1rem'}}>✓</span>{f}</li>)}
          </ul>
          <div style={{marginTop:28,background:'rgba(255,255,255,.03)',border:'1px dashed rgba(255,255,255,.08)',borderRadius:10,padding:14,textAlign:'center',fontSize:'.8rem',color:'rgba(255,255,255,.25)'}}>🚧 Coming soon — in development</div>
        </div>
      </div>
    </section>
  )
}

export function CTASection() {
  return (
    <section id="cta">
      <div className="cta-glow"/>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:500,height:500,border:'1px solid rgba(255,212,0,.05)',borderRadius:'50%',animation:'spin-slow 30s linear infinite',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:350,height:350,border:'1px solid rgba(255,212,0,.06)',borderRadius:'50%',animation:'spin-slow 20s linear infinite reverse',pointerEvents:'none'}}/>
      <div style={{maxWidth:640,margin:'0 auto',position:'relative',zIndex:1}} className="reveal">
        <div style={{fontSize:'4rem',marginBottom:20,display:'block',animation:'float-orb 3s ease-in-out infinite'}}>🖨️</div>
        <h2 className="section-title" style={{textAlign:'center',fontSize:'clamp(2.2rem,5vw,3.8rem)'}}>
          Ready to Print<br/><span style={{color:'var(--y)'}}>Your Documents?</span>
        </h2>
        <p className="section-body" style={{textAlign:'center',margin:'18px auto 36px'}}>Upload your file, choose your print settings, and collect your prints instantly from the Copykat kiosk.</p>
        <div style={{display:'flex',justifyContent:'center'}}>
          <a href="/first" className="btn-primary" style={{fontSize:'1rem',padding:'16px 40px'}}>
            <PrinterSVG size={18}/>
            Start Printing Now
          </a>
        </div>
        <p style={{textAlign:'center',fontSize:'.76rem',color:'rgba(255,255,255,.18)',marginTop:18,letterSpacing:'.05em'}}>Secured by Razorpay · SSL Encrypted · No account needed</p>
      </div>
    </section>
  )
}

export function CampusAdsSection() {
  // In production: fetch from your API endpoint that reads from MySQL
  const ads = []
  return (
    // <section id="campus-ads">
    //   <div style={{maxWidth:1120,margin:'0 auto'}}>
    //     <div className="reveal" style={{textAlign:'center',maxWidth:520,margin:'0 auto 52px'}}>
    //       <SectionLabel>Campus Ads</SectionLabel>
    //       <h2 className="section-title">What's On<br/><span style={{color:'var(--y)'}}>Campus.</span></h2>
    //       <p className="section-body" style={{margin:'0 auto'}}>Announcements, offers, and updates from around your campus community.</p>
    //     </div>
    //     {ads.length > 0 ? (
    //       <div className="ads-grid">
    //         {ads.map((ad, i) => (
    //           <div key={i} className="ad-card reveal">
    //             <div style={{padding:'22px 24px 26px'}}>
    //               <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:'1.1rem',marginBottom:8}}>{ad.title}</div>
    //               <p style={{fontSize:'.86rem',color:'var(--muted)',lineHeight:1.65}}>{ad.description}</p>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     ) : (
    //       <div className="ads-empty reveal">
    //         <div style={{fontSize:'3rem',marginBottom:16,opacity:.4}}>📋</div>
    //         <p style={{fontSize:'.95rem',color:'var(--muted)'}}>No campus advertisements available right now.</p>
    //       </div>
    //     )}
    //   </div>
    // </section>
    <div></div>
  )
}

export function DelayKatSection() {
  const steps = [
    ['💳','Pay & Upload Remotely','Open the CopyKat web-app on any device. Upload your file and pay — even over a slow campus Wi-Fi or mobile data connection. The heavy lifting is done away from the queue.'],
    ['🔑','Receive Your OTP Instantly','As soon as payment is confirmed, you receive a unique 4-digit OTP. Save it, screenshot it — it belongs to you and never expires.'],
    ['🚶','Walk to the Kiosk Whenever','Head to the nearest CopyKat kiosk at your own pace — 5 minutes or 5 hours later. No timer, no scheduling, no rush.'],
    ['🖨️','Type OTP → Instant Print','Enter your 4-digit OTP on the kiosk\'s touchscreen. Your document is already in the queue — it prints in seconds. Collect and go.'],
  ]

  return (
    <section id="delaykat" className="section">
      {/* ── Header ── */}
      <div className="reveal" style={{textAlign:'center',maxWidth:620,margin:'0 auto 56px'}}>
        <span style={{
          display:'inline-block',
          fontSize:'.68rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',
          color:'rgba(167,139,250,.95)',
          background:'rgba(99,102,241,.1)',
          border:'1px solid rgba(99,102,241,.3)',
          padding:'5px 16px',borderRadius:99,marginBottom:16,
        }}>Coming Soon</span>
        <h2 className="section-title">
          Introducing<br/>
          <em style={{fontStyle:'normal',color:'rgba(167,139,250,1)',textShadow:'0 0 50px rgba(99,102,241,.5)'}}>Delay Kat.</em>
        </h2>
        <p className="section-body" style={{margin:'0 auto'}}>
          Pay and upload your document from anywhere — then walk up to the kiosk and print it with a simple 4-digit OTP. No waiting at the machine, no upload queues, no stress.
        </p>
      </div>

      {/* ── Hero banner ── */}
      <div className="reveal" style={{
        maxWidth:980,margin:'0 auto 60px',
        background:'linear-gradient(135deg,rgba(99,102,241,.07) 0%,rgba(139,92,246,.04) 100%)',
        border:'1px solid rgba(99,102,241,.28)',
        borderRadius:24,overflow:'hidden',position:'relative',
      }}>
        {/* top glow line */}
        <div style={{height:3,background:'linear-gradient(90deg,transparent,#6366f1,#a78bfa,#6366f1,transparent)',opacity:.7}}/>

        <div style={{padding:'40px 40px 36px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}} className="responsive-grid">
          {/* Left */}
          <div>
            <h3 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:'clamp(1.4rem,2.5vw,2rem)',lineHeight:1.1,letterSpacing:'-.02em',marginBottom:14}}>
              Pay now.{' '}
              <span style={{color:'rgba(167,139,250,1)'}}>Print whenever.</span>
            </h3>
            <p style={{fontSize:'.9rem',color:'var(--muted)',lineHeight:1.78,marginBottom:20}}>
              Delay Kat separates the upload from the physical print. You handle the data-heavy part — uploading your PDF — over a fast internet connection (your home Wi-Fi, a café, the library), then walk up to the kiosk later and release the job with just a 4-digit OTP.
            </p>

            {/* Slow internet callout */}
            <div style={{
              background:'rgba(99,102,241,.08)',
              border:'1px solid rgba(99,102,241,.25)',
              borderRadius:14,padding:'16px 20px',marginBottom:20,
            }}>
              <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                <div style={{fontSize:'1.4rem',flexShrink:0,marginTop:2}}>📶</div>
                <div>
                  <div style={{fontWeight:700,fontSize:'.88rem',marginBottom:5,color:'rgba(167,139,250,.95)'}}>
                    Struggling with slow campus internet?
                  </div>
                  <p style={{fontSize:'.82rem',color:'var(--muted)',lineHeight:1.65,margin:0}}>
                    Upload your document from a fast connection elsewhere. When you reach the kiosk, the upload is already done — the kiosk only needs a tiny OTP lookup, not your entire file. <strong style={{color:'rgba(245,245,245,.75)'}}>No buffering, no failed uploads at the machine.</strong>
                  </p>
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {[
                ['🔒','End-to-end encrypted'],
                ['♾️','OTP never expires'],
                ['⚡','Instant kiosk release'],
                ['📱','Works on any device'],
              ].map(([icon,text]) => (
                <span key={text} style={{
                  display:'inline-flex',alignItems:'center',gap:5,
                  background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.22)',
                  color:'rgba(167,139,250,.9)',fontSize:'.72rem',fontWeight:600,
                  padding:'4px 12px',borderRadius:99,
                }}>{icon} {text}</span>
              ))}
            </div>
          </div>

          {/* Right — how it works visual */}
          <div style={{display:'flex',flexDirection:'column',gap:0}}>
            {[
              {icon:'📱',label:'Upload from home / café / library',sub:'Fast Wi-Fi — heavy upload done here',color:'rgba(167,139,250,.9)',line:true},
              {icon:'✅',label:'Payment confirmed — OTP sent',sub:'4-digit code, valid indefinitely',color:'rgba(167,139,250,.9)',line:true},
              {icon:'🚶',label:'Walk to kiosk — no rush',sub:'Go whenever it suits you',color:'rgba(167,139,250,.7)',line:true},
              {icon:'🖨️',label:'Enter OTP → Instant print',sub:'Kiosk only fetches a tiny job reference',color:'#22c55e',line:false},
            ].map(({icon,label,sub,color,line},i) => (
              <div key={i} style={{display:'flex',alignItems:'flex-start',gap:14,position:'relative'}}>
                {/* connector line */}
                {line && <div style={{position:'absolute',left:19,top:40,width:2,height:'calc(100% - 4px)',background:'rgba(99,102,241,.2)',borderRadius:99}}/>}
                <div style={{
                  width:40,height:40,borderRadius:'50%',flexShrink:0,
                  background:'rgba(99,102,241,.1)',border:'1px solid rgba(99,102,241,.3)',
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',
                  position:'relative',zIndex:1,
                }}>{icon}</div>
                <div style={{paddingBottom:24}}>
                  <div style={{fontWeight:700,fontSize:'.88rem',color,marginBottom:3}}>{label}</div>
                  <div style={{fontSize:'.78rem',color:'var(--muted)'}}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* bottom stat bar */}
        <div style={{borderTop:'1px solid rgba(99,102,241,.12)',background:'rgba(99,102,241,.03)',display:'flex',flexWrap:'wrap'}}>
          {[
            ['4-digit','OTP to print'],
            ['0 bytes','Upload at the kiosk'],
            ['Any network','Upload from anywhere'],
            ['Instant','Release at kiosk'],
          ].map(([val,lbl],i,arr) => (
            <div key={i} style={{flex:'1 1 120px',padding:'16px 0',textAlign:'center',borderRight:i<arr.length-1?'1px solid rgba(99,102,241,.1)':'none'}}>
              <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:'1.25rem',color:'rgba(167,139,250,.9)',marginBottom:3}}>{val}</div>
              <div style={{fontSize:'.7rem',color:'var(--muted)',letterSpacing:'.06em',textTransform:'uppercase'}}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4-step cards ── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20,maxWidth:980,margin:'0 auto 56px'}}>
        {steps.map(([emoji,title,desc],i) => (
          <div key={i} className="glass-card" style={{
            textAlign:'center',
            border:'1px solid rgba(99,102,241,.16)',
            background:'rgba(99,102,241,.03)',
            position:'relative',
          }}>
            <div style={{
              position:'absolute',top:14,right:16,
              fontFamily:"'Black Han Sans',sans-serif",
              fontSize:'.7rem',color:'rgba(99,102,241,.3)',letterSpacing:'.1em',
            }}>0{i+1}</div>
            <div className="card-emoji" style={{fontSize:'2rem',marginBottom:14,display:'block',transition:'transform .3s'}}>{emoji}</div>
            <h3 style={{fontWeight:700,fontSize:'.95rem',marginBottom:8}}>{title}</h3>
            <p style={{fontSize:'.82rem',color:'var(--muted)',lineHeight:1.65}}>{desc}</p>
          </div>
        ))}
      </div>

      {/* ── Instant vs Delay Kat comparison ── */}
      <div className="reveal" style={{maxWidth:760,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:20,alignItems:'stretch'}}>
        <div style={{
          background:'rgba(255,212,0,.04)',border:'1px solid rgba(255,212,0,.2)',
          borderRadius:16,padding:'24px 22px',
        }}>
          <div style={{fontSize:'.66rem',fontWeight:700,letterSpacing:'.13em',textTransform:'uppercase',color:'var(--y)',marginBottom:14}}>⚡ Instant Print</div>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:9}}>
            {['Upload at the kiosk','Pay & collect immediately','Great for fast connections','Walk-in, walk-out'].map(t => (
              <li key={t} style={{fontSize:'.82rem',color:'rgba(245,245,245,.62)',display:'flex',alignItems:'flex-start',gap:8}}>
                <span style={{color:'var(--y)',fontWeight:900,flexShrink:0,marginTop:1}}>✓</span>{t}
              </li>
            ))}
          </ul>
        </div>

        <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <div style={{
            background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',
            borderRadius:'50%',width:36,height:36,
            display:'flex',alignItems:'center',justifyContent:'center',
            fontSize:'.82rem',fontWeight:800,color:'rgba(255,255,255,.25)',
          }}>&</div>
        </div>

        <div style={{
          background:'rgba(99,102,241,.06)',border:'1px solid rgba(99,102,241,.3)',
          borderRadius:16,padding:'24px 22px',
          boxShadow:'0 0 30px rgba(99,102,241,.08)',
        }}>
          <div style={{fontSize:'.66rem',fontWeight:700,letterSpacing:'.13em',textTransform:'uppercase',color:'rgba(167,139,250,.9)',marginBottom:14}}>🔐 Delay Kat</div>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:9}}>
            {['Upload from any fast connection','OTP-based print release','Perfect for slow campus internet','Print when you arrive'].map(t => (
              <li key={t} style={{fontSize:'.82rem',color:'rgba(245,245,245,.62)',display:'flex',alignItems:'flex-start',gap:8}}>
                <span style={{color:'rgba(167,139,250,.9)',fontWeight:900,flexShrink:0,marginTop:1}}>✓</span>{t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export function BusinessSection() {
  // ── Advertising feature — full-width highlight ──────────────────────────────
  const adPerks = [
    ['📺','25" HD Display','Your ad plays on a large, high-visibility screen mounted at eye level — impossible to miss.'],
    ['🔁','24 / 7 Rotation','The kiosk never sleeps. Your advertisement runs around the clock, every day of the year.'],
    ['🎯','Hyper-local Reach','Placed inside campuses and hostels — your ad reaches exactly the students, faculty, and visitors who matter.'],
    ['💰','Pay-per-Slot','Buy display time in flexible slots. Affordable for local businesses, scalable for brands.'],
  ]

  // ── Deployment options ───────────────────────────────────────────────────────
  const options = [
    {
      emoji: '🏷️',
      badge: 'White Label',
      badgeColor: 'rgba(255,212,0,1)',
      badgeBg: 'rgba(255,212,0,.12)',
      badgeBorder: 'rgba(255,212,0,.3)',
      title: 'Your Brand,\nOur Machine.',
      desc: 'Deploy a CopyKat kiosk fully branded as your own — your logo, your colours, your domain. Perfect for universities, co-working chains, and print businesses wanting a turnkey private-label solution.',
      features: ['Custom logo & UI branding','Your own payment gateway','Dedicated admin dashboard','Full whitelabel source'],
      cta: 'Enquire about White Label',
      ctaHref: 'mailto:shreyanshgurjar04@gmail.com',
      highlight: true,
      highlightLabel: '⭐ Most Requested',
    },
    {
      emoji: '🤝',
      badge: 'Buy the Machine',
      badgeColor: 'rgba(245,245,245,.7)',
      badgeBg: 'rgba(255,255,255,.05)',
      badgeBorder: 'rgba(255,255,255,.12)',
      title: 'Own It\nOutright.',
      desc: 'Purchase the CopyKat kiosk hardware outright and deploy it anywhere on your campus or premises. One-time capital investment — you keep 100% of the printing revenue.',
      features: ['Full hardware ownership','One-time purchase price','100% revenue retention','Ongoing tech support available'],
      cta: 'Get a Purchase Quote',
      ctaHref: 'mailto:shreyanshgurjar04@gmail.com',
      highlight: false,
    },
    {
      emoji: '📦',
      badge: 'Rent the Machine',
      badgeColor: 'rgba(245,245,245,.7)',
      badgeBg: 'rgba(255,255,255,.05)',
      badgeBorder: 'rgba(255,255,255,.12)',
      title: 'Low Commitment,\nFull Service.',
      desc: 'Rent a CopyKat kiosk on a monthly basis with zero upfront hardware cost. We handle maintenance, firmware updates, and support — you start earning from day one.',
      features: ['Zero upfront hardware cost','Predictable monthly rental','Maintenance & updates included','Flexible upgrade path'],
      cta: 'Explore Rental Plans',
      ctaHref: 'mailto:shreyanshgurjar04@gmail.com',
      highlight: false,
    },
  ]

  return (
    <section id="business" className="section">
      {/* ── Header ── */}
      <div className="reveal" style={{textAlign:'center',maxWidth:600,margin:'0 auto 72px'}}>
        <SectionLabel>For Businesses</SectionLabel>
        <h2 className="section-title">
          Deploy CopyKat<br/>
          <em style={{fontStyle:'normal',color:'var(--y)',textShadow:'0 0 40px rgba(255,212,0,.3)'}}>Your Way.</em>
        </h2>
        <p className="section-body" style={{margin:'0 auto'}}>
          More than a printer — CopyKat is a revenue-generating smart kiosk. Choose how you deploy it, advertise on it, or make it entirely your own.
        </p>
      </div>

      {/* ── 25" Display Advertising ── */}
      <div className="reveal" style={{
        maxWidth:1020,margin:'0 auto 72px',
        background:'linear-gradient(135deg,rgba(255,212,0,.055) 0%,rgba(255,212,0,.02) 100%)',
        border:'1px solid rgba(255,212,0,.28)',
        borderRadius:24,
        overflow:'hidden',
        position:'relative',
      }}>
        {/* top accent bar */}
        <div style={{height:3,background:'linear-gradient(90deg,#FFD400,rgba(255,212,0,.3),transparent)'}}/>

        <div style={{padding:'40px 40px 36px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}} className="responsive-grid">
          {/* Left copy */}
          <div>
            <div style={{
              display:'inline-flex',alignItems:'center',gap:8,
              background:'rgba(255,212,0,.1)',border:'1px solid rgba(255,212,0,.3)',
              color:'var(--y)',fontSize:'.68rem',fontWeight:700,letterSpacing:'.14em',
              textTransform:'uppercase',padding:'5px 14px',borderRadius:99,marginBottom:20,
            }}>
              <span style={{width:7,height:7,borderRadius:'50%',background:'#FFD400',boxShadow:'0 0 6px #FFD400',display:'inline-block'}}/>
              Advertise on CopyKat
            </div>
            <h3 style={{
              fontFamily:"'Black Han Sans',sans-serif",
              fontSize:'clamp(1.6rem,3vw,2.4rem)',
              lineHeight:1.1,letterSpacing:'-.02em',marginBottom:16,
            }}>
              Your Ad. 25&quot; Screen.<br/>
              <span style={{color:'var(--y)'}}>Campus Audience.</span>
            </h3>
            <p style={{fontSize:'.92rem',color:'var(--muted)',lineHeight:1.78,marginBottom:24}}>
              Every CopyKat kiosk features a bright <strong style={{color:'rgba(245,245,245,.85)'}}>25-inch HD display</strong> that runs your advertisement 24 hours a day, 7 days a week. Placed inside high-footfall student zones — hostels, libraries, canteens — your brand gets seen by hundreds of students every single day.
            </p>
            <a
              href="mailto:shreyanshgurjar04@gmail.com"
              style={{
                display:'inline-flex',alignItems:'center',gap:10,
                background:'#FFD400',color:'#0B0B0B',
                fontFamily:"'Black Han Sans',sans-serif",fontSize:'.9rem',
                letterSpacing:'.06em',textTransform:'uppercase',
                border:'none',borderRadius:12,padding:'14px 28px',
                textDecoration:'none',fontWeight:800,
                boxShadow:'0 4px 20px rgba(255,212,0,.3)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Book Ad Slot →
            </a>
          </div>

          {/* Right — perk cards */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            {adPerks.map(([icon,title,desc],i) => (
              <div key={i} style={{
                background:'rgba(255,212,0,.04)',
                border:'1px solid rgba(255,212,0,.14)',
                borderRadius:14,padding:'18px 16px',
              }}>
                <div style={{fontSize:'1.6rem',marginBottom:10}}>{icon}</div>
                <div style={{fontWeight:700,fontSize:'.88rem',marginBottom:6,letterSpacing:'-.01em'}}>{title}</div>
                <p style={{fontSize:'.78rem',color:'var(--muted)',lineHeight:1.6,margin:0}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* bottom stat bar */}
        <div style={{
          borderTop:'1px solid rgba(255,212,0,.1)',
          background:'rgba(255,212,0,.025)',
          display:'flex',flexWrap:'wrap',
        }}>
          {[
            ['25"','HD Display'],
            ['24 / 7','Live Ads'],
            ['100 +','Daily viewers per kiosk'],
            ['Flexible','Slot pricing'],
          ].map(([val,lbl],i,arr) => (
            <div key={i} style={{
              flex:'1 1 120px',
              padding:'18px 0',
              textAlign:'center',
              borderRight: i < arr.length-1 ? '1px solid rgba(255,212,0,.08)' : 'none',
            }}>
              <div style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:'1.4rem',color:'var(--y)',marginBottom:3}}>{val}</div>
              <div style={{fontSize:'.72rem',color:'var(--muted)',letterSpacing:'.06em',textTransform:'uppercase'}}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Deployment options ── */}
      <div style={{textAlign:'center',maxWidth:500,margin:'0 auto 48px'}}>
        <h3 style={{fontFamily:"'Black Han Sans',sans-serif",fontSize:'clamp(1.4rem,3vw,2rem)',letterSpacing:'-.01em',marginBottom:12}}>
          Own, Rent or<br/><span style={{color:'var(--y)'}}>White-Label It.</span>
        </h3>
        <p style={{fontSize:'.9rem',color:'var(--muted)',lineHeight:1.7}}>Three flexible models — pick what works for your institution.</p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:28,maxWidth:1020,margin:'0 auto'}}>
        {options.map(({emoji,badge,badgeColor,badgeBg,badgeBorder,title,desc,features,cta,ctaHref,highlight,highlightLabel},i) => (
          <div
            key={i}
            style={{
              position:'relative',
              background: highlight ? 'rgba(255,212,0,.05)' : 'rgba(255,255,255,.025)',
              border: highlight ? '1px solid rgba(255,212,0,.4)' : '1px solid rgba(255,255,255,.07)',
              borderRadius:20,
              padding:'32px 28px 28px',
              display:'flex',flexDirection:'column',
            }}
          >
            {/* highlight ribbon — sits flush inside top border, no overflow issue */}
            {highlight && (
              <div style={{
                marginBottom:20,
                background:'var(--y)',
                color:'#0B0B0B',
                fontSize:'.68rem',fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',
                padding:'7px 0',borderRadius:10,
                textAlign:'center',
                boxShadow:'0 2px 12px rgba(255,212,0,.25)',
              }}>{highlightLabel}</div>
            )}

            {/* emoji */}
            <div style={{fontSize:'2.6rem',marginBottom:12,lineHeight:1}}>{emoji}</div>

            {/* badge pill */}
            <div style={{
              display:'inline-block',alignSelf:'flex-start',
              background: badgeBg,border:`1px solid ${badgeBorder}`,color: badgeColor,
              fontSize:'.66rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',
              padding:'3px 12px',borderRadius:99,marginBottom:16,
            }}>{badge}</div>

            {/* title */}
            <h3 style={{
              fontFamily:"'Black Han Sans',sans-serif",
              fontSize:'1.5rem',lineHeight:1.15,marginBottom:14,letterSpacing:'-.01em',
              whiteSpace:'pre-line',
            }}>{title}</h3>

            {/* description */}
            <p style={{fontSize:'.87rem',color:'var(--muted)',lineHeight:1.75,marginBottom:22,flex:1}}>{desc}</p>

            {/* feature list */}
            <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:10,marginBottom:26}}>
              {features.map((f,j) => (
                <li key={j} style={{display:'flex',alignItems:'flex-start',gap:10,fontSize:'.84rem',color:'rgba(245,245,245,.72)'}}>
                  <span style={{
                    display:'inline-flex',alignItems:'center',justifyContent:'center',
                    width:18,height:18,borderRadius:'50%',flexShrink:0,marginTop:1,
                    background: highlight ? 'rgba(255,212,0,.15)' : 'rgba(255,255,255,.06)',
                    color: highlight ? 'var(--y)' : 'rgba(245,245,245,.5)',
                    fontSize:'.65rem',fontWeight:900,
                  }}>✓</span>{f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href={ctaHref}
              style={{
                display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                width:'100%',padding:'13px 0',borderRadius:12,
                background: highlight ? 'rgba(255,212,0,.9)' : 'rgba(255,212,0,.07)',
                border: highlight ? 'none' : '1px solid rgba(255,212,0,.22)',
                color: highlight ? '#0B0B0B' : 'var(--y)',
                fontSize:'.82rem',fontWeight:800,letterSpacing:'.07em',textTransform:'uppercase',
                textDecoration:'none',
                boxShadow: highlight ? '0 4px 18px rgba(255,212,0,.2)' : 'none',
              }}
            >
              {cta} →
            </a>
          </div>
        ))}
      </div>

      {/* ── Contact nudge ── */}
      <div className="reveal" style={{
        maxWidth:680,margin:'56px auto 0',
        background:'rgba(255,212,0,.03)',
        border:'1px solid rgba(255,212,0,.12)',
        borderRadius:16,
        padding:'28px 36px',
        textAlign:'center',
      }}>
        <p style={{fontSize:'.82rem',color:'var(--muted)',marginBottom:14,lineHeight:1.7}}>
          Not sure which model fits your needs? Our team will walk you through the right option.
        </p>
        <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
          <a href="tel:+917486086769" style={{
            display:'inline-flex',alignItems:'center',gap:8,
            color:'var(--y)',textDecoration:'none',
            fontSize:'.86rem',fontWeight:700,
            background:'rgba(255,212,0,.07)',border:'1px solid rgba(255,212,0,.2)',
            padding:'9px 20px',borderRadius:99,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            +91 74860 86769
          </a>
          <a href="mailto:shreyanshgurjar04@gmail.com" style={{
            display:'inline-flex',alignItems:'center',gap:8,
            color:'var(--y)',textDecoration:'none',
            fontSize:'.86rem',fontWeight:700,
            background:'rgba(255,212,0,.07)',border:'1px solid rgba(255,212,0,.2)',
            padding:'9px 20px',borderRadius:99,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            shreyanshgurjar04@gmail.com
          </a>
        </div>
      </div>
    </section>
  )
}


export function Footer() {
  return (
    <footer>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>

        {/* ── Top grid ── */}
        <div className="footer-grid" style={{ paddingBottom: 40, borderBottom: '1px solid rgba(255,212,0,.08)' }}>

          {/* ── Nav links (left) ── */}
          <div className="footer-links-col" style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,212,0,.45)', marginBottom: 14 }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['Start Printing','/first'],['How it Works','#story'],['Pricing','#pricing'],['Features','#features']].map(([label,href]) => (
                  <a key={label} href={href} style={{ fontSize: '.83rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={e=>e.target.style.color='var(--y)'} onMouseLeave={e=>e.target.style.color='var(--muted)'}>{label}</a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,212,0,.45)', marginBottom: 14 }}>Business</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[['White Label','#business'],['Buy Machine','#business'],['Rent Machine','#business'],['Advertise','#business'],['Delay Kat','#delaykat']].map(([label,href]) => (
                  <a key={label} href={href} style={{ fontSize: '.83rem', color: 'var(--muted)', textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={e=>e.target.style.color='var(--y)'} onMouseLeave={e=>e.target.style.color='var(--muted)'}>{label}</a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Logo + tagline (centre) ── */}
          <div className="footer-logo-col">
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', cursor: 'none', justifyContent: 'center' }}>
              <div style={{
                width: 40, height: 40, background: 'var(--y)', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'logo-pulse 3s ease-in-out infinite',
                overflow: 'hidden', flexShrink: 0,
              }}>
                <img src={newlogo} alt="CopyKat" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text)' }}>
                Copy<span style={{ color: 'var(--y)' }}>Kat</span>
              </span>
            </a>

            <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.65, margin: '10px 0 0' }}>
              Self-service, cloud-integrated printing kiosks for modern campus environments.
            </p>

            <span className="footer-grovik-badge" style={{
              display: 'inline-block',
              fontSize: '.64rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'rgba(255,212,0,.45)', background: 'rgba(255,212,0,.05)',
              border: '1px solid rgba(255,212,0,.12)', padding: '3px 10px', borderRadius: 99,
              marginTop: 10,
            }}>A Unit of GROVIK TECHNO VENTURES LLP</span>
          </div>

          {/* ── Contact card (right) ── */}
          <div className="footer-contact-col" style={{
            background: 'rgba(255,212,0,.04)', border: '1px solid rgba(255,212,0,.15)',
            borderRadius: 16, padding: '22px 24px', minWidth: 240,
          }}>
            <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,212,0,.5)', marginBottom: 16 }}>Get in Touch</div>

            <a href="tel:+917486086769" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', textDecoration: 'none', marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(255,212,0,.1)', border: '1px solid rgba(255,212,0,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 1 }}>Call / WhatsApp</div>
                <div style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--y)', letterSpacing: '.01em' }}>+91 74860 86769</div>
              </div>
            </a>

            <a href="mailto:shreyanshgurjar04@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text)', textDecoration: 'none', marginBottom: 18 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: 'rgba(255,212,0,.1)', border: '1px solid rgba(255,212,0,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <div style={{ fontSize: '.7rem', color: 'var(--muted)', marginBottom: 1 }}>Email</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--y)', wordBreak: 'break-all' }}>shreyanshgurjar04@gmail.com</div>
              </div>
            </a>

            <a href="mailto:shreyanshgurjar04@gmail.com" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,212,0,.88)', color: '#0B0B0B',
              fontFamily: "'Black Han Sans',sans-serif", fontSize: '.8rem',
              letterSpacing: '.08em', textTransform: 'uppercase',
              textDecoration: 'none', borderRadius: 10, padding: '11px 0',
              fontWeight: 800, width: '100%',
            }}>Contact Us →</a>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="footer-bottom" style={{ paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontSize: '.74rem', color: 'rgba(255,255,255,.18)', letterSpacing: '.04em', margin: 0 }}>
            © {new Date().getFullYear()} CopyKat · All rights reserved · Website by Alay (9AppleWeb)
          </p>
          <p style={{ fontSize: '.7rem', color: 'rgba(255,212,0,.25)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
            GROVIK TECHNO VENTURES LLP
          </p>
        </div>
      </div>

      <style>{`
        /* ════ DESKTOP (>900px) ════
           3 equal columns: links | logo-centre | contact */
        .footer-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 48px;
          align-items: start;
        }
        .footer-links-col   { order: 1; }
        .footer-logo-col    {
          order: 2;
          display: flex;
          flex-direction: column;
          align-items: center;   /* centres logo + text */
          text-align: center;
          max-width: 260px;
          justify-self: center;
        }
        .footer-contact-col { order: 3; }

        /* ════ TABLET (≤900px) ════
           Row 1: links (left) | contact (right)
           Row 2: logo full-width centred             */
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto;
            gap: 32px;
          }
          .footer-links-col   { grid-column: 1; grid-row: 1; order: 1; justify-content: flex-start; }
          .footer-contact-col { grid-column: 2; grid-row: 1; order: 2; min-width: unset; width: 100%; }
          .footer-logo-col    {
            grid-column: 1 / -1; grid-row: 2; order: 3;
            align-items: center; text-align: center;
            max-width: 100%; justify-self: stretch;
          }
        }

        /* ════ MOBILE (≤560px) ════
           Stacks: logo → links → contact               */
        @media (max-width: 560px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .footer-logo-col    { grid-column: 1; grid-row: 1; order: 1; align-items: center; text-align: center; max-width: 100%; }
          .footer-links-col   { grid-column: 1; grid-row: 2; order: 2; justify-content: flex-start; gap: 32px; }
          .footer-contact-col { grid-column: 1; grid-row: 3; order: 3; min-width: unset; width: 100%; }
          .footer-bottom      { flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>
    </footer>
  )
}