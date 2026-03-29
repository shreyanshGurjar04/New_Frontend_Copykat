import { useState, useRef, useEffect, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";
GlobalWorkerOptions.workerSrc = pdfWorker;

// const API_BASE = "https://backend-copykat.onrender.com";
const API_BASE = "https://api.copykat.co.in";
const ADMIN_PIN = "2803";
const SINGLE_PRICE = 2;
const DOUBLE_PRICE = 3;
const MAX_FILES = 5;

function uid() {
  return "f_" + Date.now() + "_" + Math.random().toString(36).slice(2);
}


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

// ─── PIN GATE ──────────────────────────────────────────────────────────────
function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);


  useEffect(() => { inputRef.current?.focus(); }, []);
  useCursor();

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setShake(true);
      setError("Wrong PIN. Try again.");
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleDigit = (d) => {
    if (pin.length < 4) {
      const next = pin + d;
      setPin(next);
      setError("");
      if (next.length === 4) {
        setTimeout(() => {
          if (next === ADMIN_PIN) onUnlock();
          else {
            setShake(true);
            setError("Wrong PIN.");
            setPin("");
            setTimeout(() => setShake(false), 500);
          }
        }, 120);
      }
    }
  };

  return (
    <div style={{
      height: "100vh", width: "100vw", background: "#0B0B0B",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Outfit', sans-serif", flexDirection: "column",
      position: "fixed", inset: 0, overflow: "auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Black+Han+Sans&family=DM+Mono:wght@400;500&display=swap');
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,212,0,0.2)}50%{box-shadow:0 0 50px rgba(255,212,0,0.5)}}
        @keyframes pinpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        .pin-key:hover{background:rgba(255,212,0,0.15)!important;transform:scale(1.05);}
        .pin-key:active{transform:scale(0.92)!important;background:rgba(255,212,0,0.25)!important;}
      `}</style>

      {/* Background grid */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,212,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,212,0,0.03) 1px,transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, background: "radial-gradient(circle,rgba(255,212,0,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />

      <div style={{
        position: "relative", zIndex: 1,
        background: "rgba(15,15,15,0.9)", backdropFilter: "blur(30px)",
        border: "1px solid rgba(255,212,0,0.18)", borderRadius: 24,
        padding: "36px 32px", width: "min(340px, 90vw)",
        animation: "fadeIn 0.5s ease",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
      }}>
        {/* Top accent */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#FFD400,rgba(255,212,0,0.3),transparent)", borderRadius: "24px 24px 0 0" }} />

        {/* Lock icon */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{
            width: 60, height: 60, borderRadius: "50%",
            background: "rgba(255,212,0,0.1)", border: "2px solid rgba(255,212,0,0.3)",
            margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center",
            animation: "glow 3s ease-in-out infinite",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.4rem", color: "#FFD400", letterSpacing: "0.06em" }}>ADMIN PANEL</div>
          <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Enter 4-digit PIN to continue</div>
        </div>

        {/* PIN dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 14, marginBottom: 24,
          animation: shake ? "shake 0.4s ease" : "none",
        }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: "50%",
              background: i < pin.length ? "#FFD400" : "transparent",
              border: `2px solid ${i < pin.length ? "#FFD400" : "rgba(255,212,0,0.3)"}`,
              transition: "all 0.15s ease",
              animation: i < pin.length ? "pinpulse 0.2s ease" : "none",
              boxShadow: i < pin.length ? "0 0 12px rgba(255,212,0,0.6)" : "none",
            }} />
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ textAlign: "center", color: "#ff6b6b", fontSize: "0.8rem", marginBottom: 14, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* Keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
            <button
              key={i}
              className="pin-key"
              onClick={() => {
                if (k === "⌫") { setPin(p => p.slice(0, -1)); setError(""); }
                else if (k !== "") handleDigit(String(k));
              }}
              style={{
                padding: "16px 0",
                background: k === "⌫" ? "rgba(255,60,60,0.08)" : "rgba(255,212,0,0.06)",
                border: `1px solid ${k === "⌫" ? "rgba(255,60,60,0.2)" : "rgba(255,212,0,0.15)"}`,
                borderRadius: 12, color: k === "⌫" ? "#ff6b6b" : "#F5F5F5",
                fontSize: k === "⌫" ? "1.1rem" : "1.3rem",
                fontWeight: 700, fontFamily: "'DM Mono',monospace",
                cursor: k === "" ? "default" : "pointer",
                transition: "all 0.15s ease",
                opacity: k === "" ? 0 : 1,
                pointerEvents: k === "" ? "none" : "auto",
              }}
            >
              {k}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            marginTop: 16, width: "100%", padding: "14px 0",
            background: "#FFD400", color: "#0B0B0B",
            fontFamily: "'Black Han Sans',sans-serif",
            fontSize: "1rem", letterSpacing: "0.08em",
            border: "none", borderRadius: 12, cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.target.style.boxShadow = "0 0 30px rgba(255,212,0,0.5)"}
          onMouseLeave={e => e.target.style.boxShadow = "none"}
        >
          UNLOCK
        </button>
      </div>
    </div>
  );
}

// ─── FILE CARD ─────────────────────────────────────────────────────────────
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
    <div style={{
      position: "relative", background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,212,0,0.2)", borderRadius: 12,
      overflow: "hidden", aspectRatio: "3/4",
      display: "flex", flexDirection: "column",
      animation: "cardIn 0.35s cubic-bezier(0.34,1.56,0.64,1)",
      
    }}>
      
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
      <div style={{ padding: "6px 8px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,212,0,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <span style={{ fontFamily: "'DM Mono',monospace", fontSize: "0.58rem", color: "#FFD400", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={fileObj.originalName}>{fileObj.originalName}</span>
        <button onClick={() => onRemove(fileObj.id)} style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,60,60,0.15)", border: "1px solid rgba(255,60,60,0.3)", color: "rgba(255,100,100,0.8)", fontSize: "0.65rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, padding: 0, lineHeight: 1 }}>✕</button>
      </div>
    </div>
  );
}

// ─── TOAST ─────────────────────────────────────────────────────────────────
function Toast({ msg, isError, visible }) {
  useCursor();
  return (
    <div style={{
      position: "fixed", bottom: 16, left: "50%",
      transform: visible ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(100px)",
      zIndex: 1000, background: "#131313",
      border: `1px solid ${isError ? "rgba(255,60,60,0.5)" : "rgba(255,212,0,0.3)"}`,
      color: isError ? "#ff6b6b" : "#F5F5F5",
      padding: "12px 20px", borderRadius: 10, fontSize: "0.86rem",
      width: "calc(100% - 32px)", maxWidth: 380, textAlign: "center",
      fontFamily: "'Outfit',sans-serif",
      opacity: visible ? 1 : 0, transition: "all 0.3s ease",
      boxSizing: "border-box",
    }}>
      {msg}
    </div>
  );
}

// ─── PAGE UPDATE SECTION ───────────────────────────────────────────────────
function PageUpdateSection({ token, showToast }) {
  const [pagesLeft, setPagesLeft] = useState("");
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/machine/1/`)
      .then(r => r.json())
      .then(data => { if (typeof data.pages_left === "number") setCurrent(data.pages_left); })
      .catch(() => { });
  }, []);

  const handleUpdate = async () => {
    if (!pagesLeft || isNaN(Number(pagesLeft))) { showToast("Enter a valid number", true); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/pageupdate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine_id: 1, pages_left: Number(pagesLeft), token }),
      });
      const data = await res.json();
      if (res.ok) { showToast("✅ Pages updated successfully!"); setCurrent(Number(pagesLeft)); setPagesLeft(""); }
      else showToast(data.error || "Update failed", true);
    } catch { showToast("Network error", true); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16, marginTop: 10 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400", marginBottom: 12 }}>📄 Update Paper Count</div>
      {current !== null && (
        <div style={{ marginBottom: 10, padding: "8px 12px", background: "rgba(255,212,0,0.06)", border: "1px solid rgba(255,212,0,0.15)", borderRadius: 8, fontSize: "0.82rem", color: "#FFD400", fontFamily: "'DM Mono',monospace" }}>
          Current pages left: <strong>{current}</strong>
        </div>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number" placeholder="e.g. 240"
          value={pagesLeft}
          onChange={e => setPagesLeft(e.target.value)}
          style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px", color: "#F5F5F5", fontFamily: "'DM Mono',monospace", fontSize: "1rem", outline: "none" }}
        />
        <button onClick={handleUpdate} disabled={loading} style={{ padding: "12px 18px", background: "#FFD400", color: "#0B0B0B", border: "none", borderRadius: 10, fontFamily: "'Black Han Sans',sans-serif", fontSize: "0.85rem", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? "..." : "SET"}
        </button>
      </div>
    </div>
  );
}

// ─── AD UPLOAD SECTION ─────────────────────────────────────────────────────
function AdUploadSection({ token, showToast }) {
  const [adFile, setAdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async () => {
    if (!adFile) { showToast("Select a video file first", true); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("machine_id", "1");
      formData.append("token", token);
      formData.append("video", adFile);
      const res = await fetch(`${API_BASE}/api/upload-ad/`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) { showToast("✅ Ad uploaded successfully!"); setAdFile(null); }
      else showToast(data.error || "Upload failed", true);
    } catch { showToast("Network error", true); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16, marginTop: 10 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400", marginBottom: 12 }}>📺 Upload Advertisement</div>
      <div
        onClick={() => fileRef.current?.click()}
        style={{ border: "2px dashed rgba(255,212,0,0.3)", borderRadius: 10, padding: "20px 16px", textAlign: "center", cursor: "pointer", background: "rgba(255,212,0,0.015)", transition: "all 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,212,0,0.05)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,212,0,0.015)"}
      >
        {adFile ? (
          <div>
            <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>🎬</div>
            <div style={{ color: "#FFD400", fontSize: "0.82rem", fontFamily: "'DM Mono',monospace" }}>{adFile.name}</div>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.7rem", marginTop: 2 }}>{(adFile.size / 1024 / 1024).toFixed(1)} MB</div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>📁</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>Click to select <span style={{ color: "#FFD400" }}>video file</span></div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", marginTop: 4 }}>MP4, MOV, AVI</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="video/*" hidden onChange={e => { if (e.target.files[0]) setAdFile(e.target.files[0]); e.target.value = ""; }} />
      {adFile && (
        <button onClick={handleUpload} disabled={loading} style={{ marginTop: 10, width: "100%", padding: "13px 0", background: "#FFD400", color: "#0B0B0B", fontFamily: "'Black Han Sans',sans-serif", fontSize: "0.95rem", border: "none", borderRadius: 10, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
          {loading ? "UPLOADING..." : "UPLOAD AD"}
        </button>
      )}
    </div>
  );
}

// ─── MAIN ADMIN PANEL ──────────────────────────────────────────────────────
function AdminPanel() {
  const fileInputRef = useRef(null);
  const toastTimer = useRef(null);
  const [token, setToken] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [printType, setPrintType] = useState("S");
  const [copies, setCopies] = useState(1);
  const [phone, setPhone] = useState("");
  const [toast, setToast] = useState({ msg: "", isError: false, visible: false });
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [totalDocPages, setTotalDocPages] = useState(0);
  const [pagesCounting, setPagesCounting] = useState(false);
  const [copiesPop, setCopiesPop] = useState(false);
  const [activeTab, setActiveTab] = useState("print");

  const unitPrice = printType === "S" ? SINGLE_PRICE : DOUBLE_PRICE;
  const total = +(unitPrice * copies * (totalDocPages || Math.max(1, uploadedFiles.length))).toFixed(2);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/get-machine-token/01/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const fetched = data.token ?? data.access ?? data.key ?? Object.values(data)[0];
        if (fetched) { setToken(String(fetched)); localStorage.setItem("token", String(fetched)); }
      } catch { }
    };
    fetchToken();
  }, []);

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
        } else { total += 1; }
      }
      if (!cancelled) { setTotalDocPages(total); setPagesCounting(false); }
    })();
    return () => { cancelled = true; };
  }, [uploadedFiles]);

  const showToast = useCallback((msg, isError = false) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, isError, visible: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }, []);

  const handleFiles = useCallback((rawFiles) => {
    const remaining = MAX_FILES - uploadedFiles.length;
    if (remaining <= 0) { showToast("Maximum 5 files reached.", true); return; }
    const toProcess = Array.from(rawFiles).slice(0, remaining);
    const newEntries = [];
    for (const file of toProcess) {
      if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) { showToast(`"${file.name}" — invalid type.`, true); continue; }
      if (file.size > 20 * 1024 * 1024) { showToast(`"${file.name}" too large. Max 20MB.`, true); continue; }
      newEntries.push({ id: uid(), originalName: file.name, mime: file.type, rawFile: file });
    }
    if (newEntries.length) setUploadedFiles(prev => [...prev, ...newEntries]);
  }, [uploadedFiles, showToast]);

  const countPdfPages = (rawFile) =>
    new Promise((resolve) => {
      const timer = setTimeout(() => resolve(1), 8000);
      const reader = new FileReader();
      reader.onload = async function () {
        try { const pdf = await getDocument({ data: new Uint8Array(this.result) }).promise; clearTimeout(timer); resolve(pdf.numPages); }
        catch { clearTimeout(timer); resolve(1); }
      };
      reader.onerror = () => { clearTimeout(timer); resolve(1); };
      reader.readAsArrayBuffer(rawFile);
    });

  const countTotalPages = async (files) => {
    let total = 0;
    for (const f of files) total += f.mime === "application/pdf" ? await countPdfPages(f.rawFile) : 1;
    return total;
  };

  const handlePrintDev = async () => {
    if (uploadedFiles.length === 0) { showToast("Upload at least one file", true); return; }
    if (!phone || phone.replace(/\D/g, "").length < 6) { showToast("Enter a valid phone number", true); return; }
    setUploading(true);
    try {
      const pages = await countTotalPages(uploadedFiles);
      const price = pages * copies * unitPrice;
      const formData = new FormData();
      formData.append("barcode_val", "ADMIN_TEST");
      formData.append("machine_id", "1");
      formData.append("no_of_copies", copies.toString());
      formData.append("pages_printed", pages.toString());
      formData.append("revenue", price.toString());
      formData.append("token", token);
      formData.append("phone_no", phone.replace(/\D/g, ""));
      // formData.append("razorpay_payment_id", "ADMIN_" + Date.now());
      formData.append("print_type", printType);
      uploadedFiles.forEach(f => formData.append("pdf", f.rawFile));
      const res = await fetch(`${API_BASE}/api/uploadServer/`, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok || res.status === 201) { setSuccess(true); }
      else showToast(data.error || "Upload failed", true);
    } catch (err) { showToast("Error: " + (err.message || "Unknown"), true); }
    finally { setUploading(false); }
  };

  const handlePrintWithPayment = async () => {
    if (uploadedFiles.length === 0) { showToast("Upload at least one file", true); return; }
    if (!phone || phone.replace(/\D/g, "").length < 6) { showToast("Enter a valid phone number", true); return; }
    try {
      const pages = await countTotalPages(uploadedFiles);
      const price = pages * copies * unitPrice;
      const loaded = await loadRazorpay();
      if (!loaded) { showToast("Razorpay failed to load", true); return; }
      const keyRes = await fetch(`${API_BASE}/api/razorpay-key/`);
      const { key_id } = await keyRes.json();
      const options = {
        key: key_id, amount: Math.round(price * 100), currency: "INR",
        name: "CopyKat Admin Print", description: "Admin Print Test",
        prefill: { contact: phone.replace(/\D/g, "") },
        theme: { color: "#FFD400" },
        handler: async (response) => {
          setUploading(true);
          try {
            const formData = new FormData();
            formData.append("barcode_val", "ADMIN_TEST");
            formData.append("machine_id", "1");
            formData.append("no_of_copies", copies.toString());
            formData.append("pages_printed", pages.toString());
            formData.append("revenue", price.toString());
            formData.append("token", token);
            formData.append("phone_no", phone.replace(/\D/g, ""));
            formData.append("razorpay_payment_id", response.razorpay_payment_id);
            formData.append("print_type", printType);
            uploadedFiles.forEach(f => formData.append("pdf", f.rawFile));
            const res = await fetch(`${API_BASE}/api/upload/`, { method: "POST", body: formData });
            const data = await res.json();
            if (res.ok || res.status === 201) setSuccess(true);
            else showToast(data.error || "Upload failed", true);
          } catch { showToast("Upload error", true); }
          finally { setUploading(false); }
        },
        modal: { ondismiss: () => showToast("Payment cancelled", true) },
      };
      new window.Razorpay(options).open();
    } catch (err) { showToast("Payment error: " + (err.message || ""), true); }
  };

  const reset = () => {
    setUploadedFiles([]); setCopies(1); setPrintType("S");
    setPhone(""); setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (success) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" }}>
        <div style={{ textAlign: "center", animation: "fadeIn 0.5s ease" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,212,0,0.1)", border: "2px solid #FFD400", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 50px rgba(255,212,0,0.3)" }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "2rem", color: "#FFD400", marginBottom: 8 }}>PRINT JOB SENT!</div>
          <p style={{ color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Files uploaded to the kiosk successfully.</p>
          <button onClick={reset} style={{ background: "#FFD400", color: "#0B0B0B", fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem", border: "none", borderRadius: 12, padding: "14px 40px", cursor: "pointer" }}>PRINT ANOTHER</button>
        </div>
      </div>
    );
  }

  if (uploading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0B0B0B", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "'Outfit',sans-serif" }}>
        <svg style={{ animation: "spin 0.9s linear infinite" }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FFD400" strokeWidth="2" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.4rem", color: "#FFD400" }}>UPLOADING…</div>
        <div style={{ fontSize: "0.88rem", color: "rgba(245,245,245,0.5)" }}>Sending files to kiosk</div>
      </div>
    );
  }

  const tabs = [
    { id: "print", label: "🖨 Test Print" },
    { id: "pages", label: "📄 Paper Count" },
    { id: "ads", label: "📺 Upload Ad" },
  ];

  const glassSection = (children, extraStyle = {}) => (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px", marginTop: 10, ...extraStyle }}>
      {children}
    </div>
  );

  const sectionLabel = (text) => (
    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#FFD400", marginBottom: 10 }}>{text}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0B0B0B", fontFamily: "'Outfit',sans-serif", color: "#F5F5F5", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800;900&family=Black+Han+Sans&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#0B0B0B;overflow-x:hidden}
        @keyframes cardIn{from{opacity:0;transform:scale(0.8) translateY(16px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes dzPulse{0%,100%{border-color:rgba(255,212,0,0.3)}50%{border-color:rgba(255,212,0,0.55)}}
        .counter-btn:hover{background:rgba(255,212,0,0.18)!important;border-color:rgba(255,212,0,0.5)!important;}
        .counter-btn:active{transform:scale(0.88)!important;}
        .files-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:10px;margin-top:12px}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#FFD400;border-radius:2px}
      `}</style>

      {/* Background */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "linear-gradient(rgba(255,212,0,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,212,0,0.03) 1px,transparent 1px)", backgroundSize: "50px 50px", pointerEvents: "none" }} />

      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(11,11,11,0.85)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,212,0,0.12)", padding: "0 16px", height: 58 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#FFD400", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0B0B0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.1rem", color: "#FFD400", lineHeight: 1 }}>ADMIN PANEL</div>
            <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>COPYKAT INTERNAL</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,212,0,0.08)", border: "1px solid rgba(255,212,0,0.2)", padding: "4px 12px", borderRadius: 99 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
          <span style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", color: "#FFD400" }}>MACHINE 1</span>
        </div>
        </div>
      </nav>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid rgba(255,212,0,0.1)", background: "rgba(11,11,11,0.6)", backdropFilter: "blur(10px)", position: "sticky", top: 58, zIndex: 99 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", overflowX: "auto", width: "100%" }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, minWidth: 100, padding: "14px 8px",
            background: "transparent", border: "none",
            borderBottom: activeTab === tab.id ? "2px solid #FFD400" : "2px solid transparent",
            color: activeTab === tab.id ? "#FFD400" : "rgba(255,255,255,0.35)",
            fontFamily: "'Outfit',sans-serif", fontWeight: 700,
            fontSize: "0.78rem", letterSpacing: "0.04em",
            cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
          }}>{tab.label}</button>
        ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "16px 14px 60px", position: "relative", zIndex: 1, width: "100%" }}>

        {/* ── PRINT TAB ── */}
        {activeTab === "print" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <div style={{ marginBottom: 16, padding: "12px 14px", background: "rgba(255,165,0,0.05)", border: "1px solid rgba(255,165,0,0.2)", borderRadius: 12 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#FFA500", letterSpacing: "0.1em", marginBottom: 2 }}>⚡ ADMIN MODE</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)" }}>Test printing with full bypass. Double-side enabled. Payment optional.</div>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => { if (uploadedFiles.length < MAX_FILES) fileInputRef.current?.click(); }}
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
              style={{
                border: `2px dashed ${isDragOver ? "rgba(255,212,0,0.8)" : "rgba(255,212,0,0.3)"}`,
                borderRadius: 14, padding: "22px 16px", textAlign: "center",
                cursor: uploadedFiles.length >= MAX_FILES ? "not-allowed" : "pointer",
                background: isDragOver ? "rgba(255,212,0,0.06)" : "rgba(255,212,0,0.015)",
                opacity: uploadedFiles.length >= MAX_FILES ? 0.4 : 1,
                animation: "dzPulse 3s ease-in-out infinite",
              }}
            >
              <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>📁</div>
              <div style={{ fontSize: "0.9rem" }}>
                {uploadedFiles.length >= MAX_FILES
                  ? <span style={{ color: "rgba(255,255,255,0.35)" }}>Max 5 files reached</span>
                  : uploadedFiles.length === 0
                    ? <>Drag & drop or <span style={{ color: "#FFD400" }}>browse</span></>
                    : <span style={{ color: "#FFD400" }}>+ Add more files</span>
                }
              </div>
              <p style={{ fontSize: "0.7rem", color: "rgba(245,245,245,0.3)", marginTop: 4 }}>PDF, PNG, JPG · Max 20MB · Up to 5 files</p>
              <div style={{ marginTop: 8, fontSize: "0.68rem", color: "rgba(255,212,0,0.5)", fontFamily: "'DM Mono',monospace" }}>{uploadedFiles.length} / {MAX_FILES} files</div>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" multiple hidden onChange={e => { if (e.target.files.length) handleFiles(e.target.files); e.target.value = ""; }} />

            {uploadedFiles.length > 0 && (
              <div className="files-grid">
                {uploadedFiles.map(f => <FileCard key={f.id} fileObj={f} onRemove={(id) => setUploadedFiles(prev => prev.filter(f => f.id !== id))} />)}
              </div>
            )}

            {/* Print Type — DOUBLE SIDE ENABLED for admin */}
            {glassSection(
              <>
                {sectionLabel("🖨 Print Type")}
                <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 4, gap: 4 }}>
                  {[{ val: "S", label: "Single Side", price: SINGLE_PRICE }, { val: "D", label: "Double Side", price: DOUBLE_PRICE }].map(opt => (
                    <div key={opt.val} onClick={() => setPrintType(opt.val)} style={{
                      flex: 1, padding: "10px 0", borderRadius: 7, textAlign: "center",
                      background: printType === opt.val ? "#FFD400" : "transparent",
                      color: printType === opt.val ? "#0B0B0B" : "rgba(255,255,255,0.4)",
                      fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                      boxShadow: printType === opt.val ? "0 0 20px rgba(255,212,0,0.4)" : "none",
                      transition: "all 0.2s",
                    }}>
                      {opt.label}
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 8, fontSize: "0.75rem", color: "rgba(245,245,245,0.4)" }}>
                  ₹{unitPrice.toFixed(2)}/page · {printType === "S" ? "Single" : "Double"} Side
                </p>
              </>
            )}

            {/* Copies */}
            {glassSection(
              <>
                {sectionLabel("📋 Copies")}
                <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
                  <button className="counter-btn" onClick={() => { setCopies(c => Math.max(1, c - 1)); setCopiesPop(true); setTimeout(() => setCopiesPop(false), 250); }}
                    style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,212,0,0.08)", border: "1px solid rgba(255,212,0,0.22)", color: "#FFD400", fontSize: "1.5rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}>−</button>
                  <span style={{ fontSize: "2.4rem", fontWeight: 800, fontFamily: "'DM Mono',monospace", color: "#FFD400", minWidth: 56, textAlign: "center", transform: copiesPop ? "scale(1.4)" : "scale(1)", transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}>{copies}</span>
                  <button className="counter-btn" onClick={() => { setCopies(c => c + 1); setCopiesPop(true); setTimeout(() => setCopiesPop(false), 250); }}
                    style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,212,0,0.08)", border: "1px solid rgba(255,212,0,0.22)", color: "#FFD400", fontSize: "1.5rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.15s" }}>+</button>
                </div>
              </>
            )}

            {/* Phone */}
            {glassSection(
              <>
                {sectionLabel("📱 Phone Number")}
                <input
                  type="tel" inputMode="numeric" placeholder="e.g. 9876543210"
                  value={phone} maxLength={15} onChange={e => setPhone(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "14px 16px", color: "#F5F5F5", fontFamily: "'DM Mono',monospace", fontSize: "1rem", width: "100%", outline: "none" }}
                />
              </>
            )}

            {/* Summary */}
            {glassSection(
              <>
                {sectionLabel("🧾 Summary")}
                {[
                  ["Files", uploadedFiles.length],
                  ["Print Type", printType === "S" ? "Single Side" : "Double Side"],
                  ["Copies", copies],
                  ["Price/page", `₹${unitPrice.toFixed(2)}`],
                  ["Total Pages", pagesCounting ? "counting…" : (totalDocPages || "—")],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: "0.82rem", color: "rgba(245,245,245,0.55)" }}>{l}</span>
                    <span style={{ fontSize: "0.82rem", fontFamily: "'DM Mono',monospace" }}>{String(v)}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12 }}>
                  <span style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem" }}>TOTAL</span>
                  <span style={{ fontFamily: "'Black Han Sans',sans-serif", fontSize: "1.4rem", color: "#FFD400" }}>
                    {pagesCounting ? <span style={{ fontSize: "0.88rem", color: "rgba(255,212,0,0.6)" }}>calculating…</span> : `₹${total.toFixed(2)}`}
                  </span>
                </div>
              </>
            )}

            {/* Buttons */}
            <button onClick={handlePrintDev} disabled={uploadedFiles.length === 0 || pagesCounting}
              style={{ width: "100%", padding: "16px 0", marginTop: 12, background: "#FFD400", color: "#0B0B0B", fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem", letterSpacing: "0.06em", border: "none", borderRadius: 12, cursor: "pointer", opacity: (uploadedFiles.length === 0 || pagesCounting) ? 0.35 : 1, transition: "all 0.2s" }}>
              🛠 SKIP PAYMENT — UPLOAD DIRECTLY
            </button>

            <button onClick={handlePrintWithPayment} disabled={uploadedFiles.length === 0 || pagesCounting}
              style={{ width: "100%", padding: "16px 0", marginTop: 8, background: "transparent", color: "#FFD400", fontFamily: "'Black Han Sans',sans-serif", fontSize: "1rem", letterSpacing: "0.06em", border: "2px solid rgba(255,212,0,0.4)", borderRadius: 12, cursor: "pointer", opacity: (uploadedFiles.length === 0 || pagesCounting) ? 0.35 : 1, transition: "all 0.2s" }}>
              💳 PAY ₹{total.toFixed(2)} WITH RAZORPAY
            </button>
          </div>
        )}

        {/* ── PAGES TAB ── */}
        {activeTab === "pages" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <PageUpdateSection token={token} showToast={showToast} />
          </div>
        )}

        {/* ── ADS TAB ── */}
        {activeTab === "ads" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <AdUploadSection token={token} showToast={showToast} />
          </div>
        )}
      </div>

      <Toast msg={toast.msg} isError={toast.isError} visible={toast.visible} />
    </div>
  );
}

// ─── ROOT EXPORT ────────────────────────────────────────────────────────────
export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);

  return unlocked ? <AdminPanel /> : <PinGate onUnlock={() => setUnlocked(true)} />;
}
