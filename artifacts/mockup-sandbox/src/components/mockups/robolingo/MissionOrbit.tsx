import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Flame,
  Headphones,
  LockKeyhole,
  Mic2,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
} from "lucide-react";

type Mission = {
  id: string;
  index: string;
  title: string;
  type: string;
  minutes: number;
  progress: number;
  tone: "cyan" | "coral" | "gold";
  icon: typeof Headphones;
  locked?: boolean;
};

const missions: Mission[] = [
  {
    id: "street",
    index: "01",
    title: "At the corner shop",
    type: "escuta + fala",
    minutes: 8,
    progress: 72,
    tone: "cyan",
    icon: Headphones,
  },
  {
    id: "weekend",
    index: "02",
    title: "Weekend plans",
    type: "vocabulário",
    minutes: 6,
    progress: 18,
    tone: "coral",
    icon: Mic2,
  },
  {
    id: "city",
    index: "03",
    title: "Getting around",
    type: "frases úteis",
    minutes: 5,
    progress: 0,
    tone: "gold",
    icon: BookOpen,
    locked: true,
  },
];

const toneStyles = {
  cyan: { color: "#087d8f", soft: "#d9f4f3", line: "#1eb7bd" },
  coral: { color: "#ae493c", soft: "#f9e5dc", line: "#ef7961" },
  gold: { color: "#98721f", soft: "#f8efca", line: "#e3b42f" },
};

export function MissionOrbit() {
  const [activeTab, setActiveTab] = useState("Today");
  const [selectedId, setSelectedId] = useState("street");
  const [completed, setCompleted] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const selected = missions.find((mission) => mission.id === selectedId) ?? missions[0];
  const SelectedIcon = selected.icon;
  const selectedTone = toneStyles[selected.tone];

  const selectMission = (mission: Mission) => {
    if (!mission.locked) {
      setSelectedId(mission.id);
      setCompleted(false);
    }
  };

  return (
    <main className="robo-shell">
      <style>{`
        .robo-shell {
          --ink: #123456;
          --navy: #123456;
          --paper: #f8f1e4;
          --paper-deep: #eee1cf;
          --muted: #6f7b7d;
          --cyan: #1eb7bd;
          min-height: 100dvh;
          background: var(--paper);
          color: var(--ink);
          font-family: "Avenir Next", "DM Sans", "Trebuchet MS", sans-serif;
          display: flex;
          justify-content: center;
          overflow: hidden;
        }
        .robo-shell *, .robo-shell *::before, .robo-shell *::after { box-sizing: border-box; }
        .robo-phone {
          position: relative;
          width: 100%;
          max-width: 480px;
          min-height: 100dvh;
          background: var(--paper);
          overflow: hidden;
        }
        .robo-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: .22;
          background-image: radial-gradient(#cbbba4 0.65px, transparent 0.65px);
          background-size: 11px 11px;
          mix-blend-mode: multiply;
        }
        .robo-top {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 21px 15px;
          z-index: 1;
        }
        .robo-brand { display:flex; align-items:center; gap:10px; }
        .robo-mark {
          width: 38px; height: 38px; border-radius: 13px 13px 13px 4px;
          background: var(--navy); display:grid; place-items:center; color:#f9d873;
          transform: rotate(-7deg); box-shadow: 3px 4px 0 #d1bda1;
        }
        .robo-mark span { transform: rotate(7deg); font-weight:900; font-size: 16px; letter-spacing:-1px; }
        .robo-kicker { text-transform:uppercase; font-size:10px; letter-spacing:.18em; color:#718082; font-weight:800; }
        .robo-word { font-size:16px; font-weight:850; letter-spacing:-.04em; margin-top:1px; }
        .robo-bell {
          width: 39px; height:39px; display:grid; place-items:center; border-radius:14px;
          border:1px solid #d8cbb9; color:var(--navy); background:rgba(255,251,244,.56);
          cursor:pointer; transition:transform .2s ease, background .2s ease;
        }
        .robo-bell:hover { transform:translateY(-2px); background:#fffaf0; }
        .robo-scroll { position:relative; z-index:1; padding: 4px 21px 104px; }
        .robo-eyebrow { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .robo-date { color:#758183; font-size:11px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }
        .robo-streak { display:flex; align-items:center; gap:5px; color:#b06429; font-size:11px; font-weight:850; }
        .robo-heading { margin:0; font-size:32px; line-height:1.02; letter-spacing:-.075em; font-weight:900; max-width:275px; }
        .robo-heading em { color:#0c8d98; font-style:normal; }
        .robo-subheading { color:var(--muted); font-size:13px; line-height:1.4; margin:10px 0 18px; max-width:320px; }
        .robo-tabs {
          display:flex; gap:4px; background:#eadfce; border-radius:14px; padding:4px; margin-bottom:20px;
        }
        .robo-tab {
          flex:1; border:0; padding:10px 6px; border-radius:10px; color:#7b8381; background:transparent;
          font: 800 11px "Avenir Next", sans-serif; cursor:pointer; transition:all .2s ease;
        }
        .robo-tab.active { color:var(--navy); background:#fffaf1; box-shadow:0 2px 7px rgba(46,53,53,.08); }
        .robo-section-head { display:flex; align-items:end; justify-content:space-between; margin:0 0 10px; }
        .robo-section-label { color:#748082; font-size:10px; text-transform:uppercase; font-weight:850; letter-spacing:.16em; }
        .robo-progress-note { font-size:11px; color:#1c8a92; font-weight:850; }
        .robo-mission-list { display:flex; flex-direction:column; gap:9px; }
        .robo-mission {
          width:100%; display:flex; align-items:center; gap:12px; padding:11px 12px; text-align:left;
          border:1px solid #dfd2c1; background:rgba(255,250,241,.7); border-radius:18px; cursor:pointer;
          color:var(--ink); transition:transform .2s ease, border-color .2s ease, background .2s ease;
        }
        .robo-mission:hover { transform:translateX(3px); border-color:#aacdcc; }
        .robo-mission.selected { background:#fffaf2; border-color:#1eacb3; box-shadow:0 5px 0 #d9e7dd; }
        .robo-mission.locked { opacity:.55; cursor:not-allowed; }
        .robo-mission-index { display:grid; place-items:center; min-width:31px; height:31px; border-radius:10px; font-size:11px; font-weight:900; }
        .robo-mission-copy { min-width:0; flex:1; }
        .robo-mission-title { display:block; font-size:13px; font-weight:850; letter-spacing:-.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .robo-mission-meta { display:block; color:#7d8784; font-size:10px; margin-top:3px; }
        .robo-mission-arrow { color:#87918f; flex:none; }
        .robo-detail {
          position:relative; overflow:hidden; margin-top:16px; border-radius:24px; min-height:209px; padding:19px;
          background:var(--navy); color:#fdf4e4; box-shadow:0 8px 0 #d7c6af;
        }
        .robo-detail::after {
          content:""; position:absolute; width:170px; height:170px; border:1px solid rgba(249,216,115,.27);
          border-radius:50%; right:-76px; top:-44px; box-shadow:0 0 0 20px rgba(249,216,115,.05), 0 0 0 42px rgba(249,216,115,.04);
        }
        .robo-detail-top { display:flex; justify-content:space-between; align-items:flex-start; position:relative; z-index:1; }
        .robo-detail-tag { color:#f9d873; font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }
        .robo-detail-icon { width:42px; height:42px; border-radius:14px; display:grid; place-items:center; color:#123456; }
        .robo-detail h2 { font-size:24px; line-height:1.03; letter-spacing:-.065em; margin:20px 0 7px; max-width:245px; position:relative; z-index:1; }
        .robo-detail p { color:#b8c8c6; font-size:11px; margin:0; position:relative; z-index:1; }
        .robo-detail-footer { display:flex; align-items:center; justify-content:space-between; margin-top:19px; position:relative; z-index:1; }
        .robo-detail-time { display:flex; align-items:center; gap:6px; color:#b8c8c6; font-size:11px; }
        .robo-start {
          border:0; border-radius:12px; padding:11px 13px; background:#f9d873; color:#173653;
          font:900 12px "Avenir Next",sans-serif; cursor:pointer; display:flex; align-items:center; gap:7px;
          transition:transform .2s ease, background .2s ease;
        }
        .robo-start:hover { transform:translateY(-2px); background:#ffe594; }
        .robo-start.done { background:#84d8be; }
        .robo-insight { display:flex; align-items:center; gap:11px; padding:14px 0 0; color:#6f7977; font-size:11px; line-height:1.4; }
        .robo-insight-mark { width:25px; height:25px; border-radius:9px; background:#e8d8ba; display:grid; place-items:center; color:#9b7122; flex:none; }
        .robo-bottom {
          position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:space-around; gap:4px;
          padding:11px 18px 17px; background:rgba(248,241,228,.94); border-top:1px solid #e2d6c6; z-index:3;
          backdrop-filter: blur(12px);
        }
        .robo-nav {
          flex:1; border:0; background:transparent; color:#85908d; display:flex; align-items:center; flex-direction:column;
          gap:4px; font:800 9px "Avenir Next",sans-serif; cursor:pointer; padding:4px; transition:color .2s ease;
        }
        .robo-nav.active { color:#118a94; }
        .robo-nav-dot { width:4px; height:4px; border-radius:50%; background:currentColor; opacity:0; }
        .robo-nav.active .robo-nav-dot { opacity:1; }
        .robo-modal-scrim { position:absolute; inset:0; z-index:8; background:rgba(18,52,86,.48); display:flex; align-items:flex-end; }
        .robo-modal { width:100%; border-radius:28px 28px 0 0; background:#fff9ef; padding:19px 21px 29px; box-shadow:0 -12px 34px rgba(23,49,62,.16); animation:robo-rise .3s ease both; }
        @keyframes robo-rise { from { transform:translateY(30px); opacity:.4; } to { transform:translateY(0); opacity:1; } }
        .robo-modal-head { display:flex; align-items:center; justify-content:space-between; }
        .robo-modal-close { border:0; background:#efe3d1; color:#123456; width:32px; height:32px; border-radius:10px; display:grid; place-items:center; cursor:pointer; }
        .robo-modal-kicker { color:#118a94; font-size:10px; text-transform:uppercase; letter-spacing:.15em; font-weight:900; }
        .robo-modal h3 { font-size:25px; letter-spacing:-.07em; margin:19px 0 8px; }
        .robo-modal p { color:#748080; font-size:12px; line-height:1.5; margin:0 0 15px; }
        .robo-challenge { display:flex; gap:10px; align-items:center; padding:13px; border-radius:15px; background:#e8f5ef; color:#236862; font-size:12px; font-weight:800; }
        .robo-modal-actions { display:flex; gap:8px; margin-top:15px; }
        .robo-modal-action { flex:1; border:0; border-radius:13px; padding:13px; cursor:pointer; font:900 12px "Avenir Next",sans-serif; }
        .robo-modal-action.secondary { color:#48666a; background:#eee3d2; }
        .robo-modal-action.primary { color:#fff5e4; background:#123456; }
        @media (min-width: 520px) {
          .robo-shell { padding:20px 0; background:#e8dfd2; }
          .robo-phone { min-height: calc(100dvh - 40px); border-radius:32px; box-shadow:0 16px 50px rgba(34,48,56,.16); }
          .robo-modal-scrim { border-radius:32px; }
        }
      `}</style>

      <section className="robo-phone" aria-label="Robolingo mission planner">
        <div className="robo-noise" />
        <header className="robo-top">
          <div className="robo-brand">
            <div className="robo-mark" aria-hidden="true"><span>R•</span></div>
            <div>
              <div className="robo-kicker">learning cockpit</div>
              <div className="robo-word">Robolingo</div>
            </div>
          </div>
          <button className="robo-bell" aria-label="Ver notificações" onClick={() => setActiveTab("Updates")}>
            <Bell size={17} strokeWidth={2.2} />
          </button>
        </header>

        <div className="robo-scroll">
          <div className="robo-eyebrow">
            <span className="robo-date">Tue · 14 May</span>
            <span className="robo-streak"><Flame size={14} fill="currentColor" /> 7 day streak</span>
          </div>
          <h1 className="robo-heading">Your next <em>small win.</em></h1>
          <p className="robo-subheading">Pick one mission. Stay curious. Eight minutes is enough to keep moving.</p>

          <div className="robo-tabs" role="tablist" aria-label="Learning views">
            {["Today", "Review", "Goals"].map((tab) => (
              <button
                className={`robo-tab ${activeTab === tab ? "active" : ""}`}
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Today" ? (
            <>
              <div className="robo-section-head">
                <span className="robo-section-label">Your route · 3 stops</span>
                <span className="robo-progress-note">{completed ? "1 complete" : "1 in progress"}</span>
              </div>
              <div className="robo-mission-list">
                {missions.map((mission) => {
                  const MissionIcon = mission.icon;
                  const tone = toneStyles[mission.tone];
                  return (
                    <button
                      className={`robo-mission ${selectedId === mission.id ? "selected" : ""} ${mission.locked ? "locked" : ""}`}
                      key={mission.id}
                      onClick={() => selectMission(mission)}
                      aria-label={`${mission.title}${mission.locked ? ", locked" : ""}`}
                      disabled={mission.locked}
                    >
                      <span className="robo-mission-index" style={{ background: tone.soft, color: tone.color }}>
                        {mission.locked ? <LockKeyhole size={13} /> : mission.index}
                      </span>
                      <span className="robo-mission-copy">
                        <span className="robo-mission-title">{mission.title}</span>
                        <span className="robo-mission-meta">{mission.type} · {mission.progress}% explored</span>
                      </span>
                      <MissionIcon size={16} color={tone.color} strokeWidth={2.2} />
                      <ChevronRight className="robo-mission-arrow" size={16} />
                    </button>
                  );
                })}
              </div>

              <article className="robo-detail">
                <div className="robo-detail-top">
                  <span className="robo-detail-tag">{completed ? "Mission complete" : "Up next for you"}</span>
                  <span className="robo-detail-icon" style={{ background: selectedTone.soft }}>
                    {completed ? <Check size={20} /> : <SelectedIcon size={20} />}
                  </span>
                </div>
                <h2>{completed ? "Nice work, explorer." : selected.title}</h2>
                <p>{completed ? "Your streak is safe. A new route is waiting when you are ready." : "A tiny real-world scenario, tuned to your interests."}</p>
                <div className="robo-detail-footer">
                  <span className="robo-detail-time"><Target size={14} /> {selected.minutes} min · +85 XP</span>
                  <button className={`robo-start ${completed ? "done" : ""}`} onClick={() => setShowSession(true)}>
                    {completed ? "Replay" : "Start mission"} <ArrowRight size={14} />
                  </button>
                </div>
              </article>

              <div className="robo-insight">
                <span className="robo-insight-mark"><Sparkles size={13} /></span>
                <span><strong>Coach note:</strong> listening first makes the speaking part feel easier.</span>
              </div>
            </>
          ) : (
            <section className="robo-detail" style={{ marginTop: 0, minHeight: 280 }}>
              <div className="robo-detail-top">
                <span className="robo-detail-tag">{activeTab === "Review" ? "Words to revisit" : "Your north star"}</span>
                <span className="robo-detail-icon" style={{ background: activeTab === "Review" ? "#f9e5dc" : "#f8efca" }}>
                  {activeTab === "Review" ? <RotateCcw size={20} /> : <Trophy size={20} />}
                </span>
              </div>
              <h2>{activeTab === "Review" ? "12 words are ready for a second look." : "Be understood in everyday English."}</h2>
              <p>{activeTab === "Review" ? "Short, spaced practice keeps new phrases close." : "You are 34% closer than when you started this month."}</p>
              <div className="robo-detail-footer">
                <span className="robo-detail-time"><Target size={14} /> {activeTab === "Review" ? "4 min" : "34% complete"}</span>
                <button className="robo-start" onClick={() => setActiveTab("Today")}>See today <ArrowRight size={14} /></button>
              </div>
            </section>
          )}
        </div>

        <nav className="robo-bottom" aria-label="Primary navigation">
          {[
            { label: "Missions", icon: Target, tab: "Today" },
            { label: "Practice", icon: Headphones, tab: "Review" },
            { label: "Progress", icon: Trophy, tab: "Goals" },
          ].map(({ label, icon: NavIcon, tab }) => (
            <button key={label} className={`robo-nav ${activeTab === tab || (tab === "Today" && activeTab === "Updates") ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              <NavIcon size={18} strokeWidth={2.1} />
              {label}
              <span className="robo-nav-dot" />
            </button>
          ))}
        </nav>

        {showSession ? (
          <div className="robo-modal-scrim" role="dialog" aria-modal="true" aria-label="Start mission">
            <div className="robo-modal">
              <div className="robo-modal-head">
                <span className="robo-modal-kicker">Mission briefing</span>
                <button className="robo-modal-close" aria-label="Close briefing" onClick={() => setShowSession(false)}><X size={16} /></button>
              </div>
              <h3>{selected.title}</h3>
              <p>You will hear a short conversation, collect three useful phrases, then try them out loud.</p>
              <div className="robo-challenge"><CircleHelp size={16} /> No pressure — you can replay every step.</div>
              <div className="robo-modal-actions">
                <button className="robo-modal-action secondary" onClick={() => setShowSession(false)}>Not now</button>
                <button className="robo-modal-action primary" onClick={() => { setCompleted(true); setShowSession(false); }}>I&apos;m ready <Play size={13} fill="currentColor" style={{ verticalAlign: "middle", marginLeft: 4 }} /></button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default MissionOrbit;