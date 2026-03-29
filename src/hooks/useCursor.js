import { useEffect } from 'react'

export default function useCursor() {
  useEffect(() => {
    const cursor = document.getElementById('ck-cursor')
    const ring = document.getElementById('ck-ring')
    if (!cursor || !ring) return

    let mx = 0, my = 0, rx = 0, ry = 0, rafId

    // ── Core dot ──────────────────────────────────────────────
    Object.assign(cursor.style, {
      position:        'fixed',
      width:           '10px',
      height:          '10px',
      borderRadius:    '50%',
      background:      '#FFD600',
      boxShadow:       '0 0 6px 2px #FFD600, 0 0 14px 4px #FFD60066',
      pointerEvents:   'none',
      zIndex:          '99999',
      transform:       'translate(-50%, -50%)',
      transition:      'width .15s ease, height .15s ease, background .15s ease, box-shadow .15s ease',
      willChange:      'left, top',
    })

    // ── Ring – square rotated 45° (diamond) ───────────────────
    Object.assign(ring.style, {
      position:        'fixed',
      width:           '32px',
      height:          '32px',
      border:          '2px solid #FFD600',
      borderRadius:    '3px',
      pointerEvents:   'none',
      zIndex:          '99998',
      transform:       'translate(-50%, -50%) rotate(45deg)',
      transition:      'width .2s ease, height .2s ease, border-color .2s ease, opacity .2s ease',
      opacity:         '0.8',
      willChange:      'left, top',
    })

    // ── Inject styles once ────────────────────────────────────
    if (!document.getElementById('ck-cursor-styles')) {
      const style = document.createElement('style')
      style.id = 'ck-cursor-styles'
      style.textContent = `
        * { cursor: none !important; }

        @keyframes ck-ring-spin {
          from { transform: translate(-50%, -50%) rotate(45deg); }
          to   { transform: translate(-50%, -50%) rotate(405deg); }
        }
        @keyframes ck-ring-spin-grow {
          from { transform: translate(-50%, -50%) rotate(45deg) scale(1.8); }
          to   { transform: translate(-50%, -50%) rotate(405deg) scale(1.8); }
        }
        @keyframes ck-dot-pulse {
          0%, 100% { box-shadow: 0 0 6px 2px #FFD600, 0 0 14px 4px #FFD60066; }
          50%       { box-shadow: 0 0 10px 4px #FFD600, 0 0 28px 10px #FFD60099; }
        }

        /* Default slow spin */
        #ck-ring {
          animation: ck-ring-spin 4s linear infinite;
        }

        /* Hover grow state */
        body.cursor-grow #ck-cursor {
          width: 14px !important;
          height: 14px !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px #FFD600, 0 0 20px 6px #FFD600 !important;
          animation: ck-dot-pulse 0.8s ease-in-out infinite !important;
        }
        body.cursor-grow #ck-ring {
          border-color: #FFD600 !important;
          border-width: 2.5px !important;
          opacity: 1 !important;
          animation: ck-ring-spin-grow 0.9s linear infinite !important;
        }
      `
      document.head.appendChild(style)
    }

    // ── Mouse tracking ────────────────────────────────────────
    const onMove = (e) => {
      mx = e.clientX; my = e.clientY
      cursor.style.left = mx + 'px'
      cursor.style.top  = my + 'px'
    }

    const animateRing = () => {
      rx += (mx - rx) * 0.10
      ry += (my - ry) * 0.10
      ring.style.left = rx + 'px'
      ring.style.top  = ry + 'px'
      rafId = requestAnimationFrame(animateRing)
    }

    document.addEventListener('mousemove', onMove)
    animateRing()

    // ── Grow on interactive elements ──────────────────────────
    const addGrow = () => document.body.classList.add('cursor-grow')
    const rmGrow  = () => document.body.classList.remove('cursor-grow')

    const selectors =
      'a,button,.glass-card,.pricing-card,.kiosk-mockup,.ad-card,.sc,.btn-3d,.btn-3d-ghost,.ks-btn'

    const attach = () => {
      document.querySelectorAll(selectors).forEach(el => {
        el.addEventListener('mouseenter', addGrow)
        el.addEventListener('mouseleave', rmGrow)
      })
    }

    attach()
    const mo = new MutationObserver(attach)
    mo.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
      mo.disconnect()
    }
  }, [])
}