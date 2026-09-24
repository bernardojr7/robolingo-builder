import { useState } from "react";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Headphones,
  MessageCircle,
  Mic2,
  Play,
  Plus,
  Radio,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Video,
  X,
} from "lucide-react";

type Challenge = {
  id: string;
  title: string;
  detail: string;
  time: string;
  members: string;
  tone: "teal" | "coral" | "sun";
  icon: typeof Headphones;
  joined?: boolean;
};

const challenges: Challenge[] = [
  {
    id: "coffee",
    title: "Order like a local",
    detail: "Voice challenge · 3 rounds",
    time: "6 min",
    members: "8 friends",
    tone: "teal",
    icon: Mic2,
    joined: true,
  },
  {
    id: "weekend",
    title: "Weekend plans",
    detail: "Phrase swap · 5 prompts",
    time: "8 min",
    members: "12 friends",
    tone: "coral",
    icon: MessageCircle,
  },
  {
    id: "street",
    title: "Find your way",
    detail: "Listening relay · 4 clues",
    time: "5 min",
    members: "6 friends",
    tone: "sun",
    icon: Headphones,
  },
];

const toneStyles = {
  teal: { ink: "#087d8f", soft: "#d9f4f3", line: "#1eb7bd" },
  coral: { ink: "#ae493c", soft: "#f9e5dc", line: "#ef7961" },
  sun: { ink: "#98721f", soft: "#f8efca", line: "#e3b42f" },
};

export function PeerCircleOrbit() {
  const [activeTab, setActiveTab] = useState<"Circle" | "Challenges" | "Progress">("Circle");
  const [selectedId, setSelectedId] = useState("coffee");
  const [showChallenge, setShowChallenge] = useState(false);
  const [joined, setJoined] = useState<string[]>(["coffee"]);
  const [reminded, setReminded] = useState(false);

  const selected = challenges.find((item) => item.id === selectedId) ?? challenges[0];
  const SelectedIcon = selected.icon;
  const selectedTone = toneStyles[selected.tone];

  const toggleJoin = (id: string) => {
    setJoined((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <main className="peer-shell">
      <style>{`
        .peer-shell {
          --ink: #123456;
          --navy: #123456;
          --paper: #f8f1e4;
          --paper-deep: #eee1cf;
          --muted: #6f7b7d;
          min-height: 100dvh;
          background: #e8dfd2;
          color: var(--ink);
          font-family: "Avenir Next", "DM Sans", "Trebuchet MS", sans-serif;
          display: flex;
          justify-content: center;
        }
        .peer-shell *, .peer-shell *::before, .peer-shell *::after { box-sizing: border-box; }
        .peer-phone {
          position: relative;
          width: 100%;
          max-width: 480px;
          min-height: 100dvh;
          background: var(--paper);
          overflow: hidden;
        }
        .peer-noise {
          position: absolute; inset: 0; pointer-events: none; opacity: .22;
          background-image: radial-gradient(#cbbba4 .65px, transparent .65px);
          background-size: 11px 11px; mix-blend-mode: multiply;
        }
        .peer-top {
          position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between;
          padding: 24px 21px 15px;
        }
        .peer-brand { display:flex; align-items:center; gap:10px; }
        .peer-mark {
          width: 38px; height: 38px; border-radius: 13px 13px 13px 4px;
          background: var(--navy); display:grid; place-items:center; color:#f9d873;
          transform: rotate(-7deg); box-shadow: 3px 4px 0 #d1bda1;
        }
        .peer-mark span { transform: rotate(7deg); font-weight:900; font-size: 16px; letter-spacing:-1px; }
        .peer-kicker { text-transform:uppercase; font-size:10px; letter-spacing:.18em; color:#718082; font-weight:800; }
        .peer-word { font-size:16px; font-weight:850; letter-spacing:-.04em; margin-top:1px; }
        .peer-bell {
          width:39px; height:39px; display:grid; place-items:center; border-radius:14px; border:1px solid #d8cbb9;
          color:var(--navy); background:rgba(255,251,244,.56); cursor:pointer; transition:transform .2s ease, background .2s ease;
        }
        .peer-bell:hover { transform:translateY(-2px); background:#fffaf0; }
        .peer-scroll { position:relative; z-index:1; padding:4px 21px 106px; }
        .peer-eyebrow { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .peer-date { color:#758183; font-size:11px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }
        .peer-streak { display:flex; align-items:center; gap:5px; color:#b06429; font-size:11px; font-weight:850; }
        .peer-heading { margin:0; font-size:32px; line-height:1.02; letter-spacing:-.075em; font-weight:900; max-width:305px; }
        .peer-heading em { color:#0c8d98; font-style:normal; }
        .peer-subheading { color:var(--muted); font-size:13px; line-height:1.4; margin:10px 0 18px; max-width:330px; }
        .peer-tabs { display:flex; gap:4px; background:#eadfce; border-radius:14px; padding:4px; margin-bottom:20px; }
        .peer-tab {
          flex:1; border:0; padding:10px 6px; border-radius:10px; color:#7b8381; background:transparent;
          font:800 11px "Avenir Next", sans-serif; cursor:pointer; transition:all .2s ease;
        }
        .peer-tab.active { color:var(--navy); background:#fffaf1; box-shadow:0 2px 7px rgba(46,53,53,.08); }
        .peer-section-head { display:flex; align-items:end; justify-content:space-between; margin:0 0 10px; }
        .peer-section-label { color:#748082; font-size:10px; text-transform:uppercase; font-weight:850; letter-spacing:.16em; }
        .peer-section-action { border:0; background:transparent; color:#16868e; padding:0; font:850 11px "Avenir Next", sans-serif; cursor:pointer; }
        .peer-circle {
          position:relative; overflow:hidden; border-radius:24px; min-height:182px; padding:18px 19px; color:#fdf4e4;
          background:var(--navy); box-shadow:0 8px 0 #d7c6af; margin-bottom:17px;
        }
        .peer-circle::after {
          content:""; position:absolute; width:195px; height:195px; border:1px solid rgba(249,216,115,.27); border-radius:50%;
          right:-92px; top:-52px; box-shadow:0 0 0 20px rgba(249,216,115,.05), 0 0 0 42px rgba(249,216,115,.04);
        }
        .peer-circle-top { display:flex; align-items:flex-start; justify-content:space-between; position:relative; z-index:1; }
        .peer-circle-tag { color:#f9d873; font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }
        .peer-live { display:flex; align-items:center; gap:5px; color:#9ee1c4; font-size:10px; font-weight:850; }
        .peer-live-dot { width:6px; height:6px; border-radius:50%; background:#83d5b5; }
        .peer-circle h2 { font-size:24px; line-height:1.03; letter-spacing:-.065em; margin:21px 0 7px; max-width:260px; position:relative; z-index:1; }
        .peer-circle p { color:#b8c8c6; font-size:11px; line-height:1.4; margin:0; max-width:270px; position:relative; z-index:1; }
        .peer-circle-footer { display:flex; align-items:center; justify-content:space-between; margin-top:17px; position:relative; z-index:1; }
        .peer-avatars { display:flex; align-items:center; }
        .peer-avatar {
          width:26px; height:26px; margin-right:-6px; border:2px solid var(--navy); border-radius:50%; display:grid; place-items:center;
          font-size:9px; font-weight:900; color:#123456; background:#f9d873;
        }
        .peer-avatar:nth-child(2) { background:#9fd6cb; }
        .peer-avatar:nth-child(3) { background:#f0a38b; }
        .peer-avatar.more { background:#e9eee3; color:#55716e; }
        .peer-circle-cta, .peer-challenge-cta {
          border:0; border-radius:12px; padding:10px 12px; background:#f9d873; color:#173653;
          font:900 11px "Avenir Next",sans-serif; cursor:pointer; display:flex; align-items:center; gap:6px;
          transition:transform .2s ease, background .2s ease;
        }
        .peer-circle-cta:hover, .peer-challenge-cta:hover { transform:translateY(-2px); background:#ffe594; }
        .peer-challenge-list { display:flex; flex-direction:column; gap:9px; }
        .peer-challenge {
          width:100%; display:flex; align-items:center; gap:11px; padding:11px 12px; text-align:left;
          border:1px solid #dfd2c1; background:rgba(255,250,241,.7); border-radius:18px; cursor:pointer;
          color:var(--ink); transition:transform .2s ease, border-color .2s ease, background .2s ease;
        }
        .peer-challenge:hover { transform:translateX(3px); border-color:#aacdcc; }
        .peer-challenge.selected { background:#fffaf2; border-color:#1eacb3; box-shadow:0 5px 0 #d9e7dd; }
        .peer-challenge-icon { display:grid; place-items:center; width:34px; height:34px; border-radius:11px; flex:none; }
        .peer-challenge-copy { min-width:0; flex:1; }
        .peer-challenge-title { display:block; font-size:13px; font-weight:850; letter-spacing:-.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .peer-challenge-meta { display:flex; align-items:center; gap:7px; color:#7d8784; font-size:10px; margin-top:3px; }
        .peer-challenge-arrow { color:#87918f; flex:none; }
        .peer-detail {
          display:flex; align-items:center; gap:12px; padding:14px 0 0; color:#6f7977; font-size:11px; line-height:1.4;
        }
        .peer-detail-mark { width:25px; height:25px; border-radius:9px; display:grid; place-items:center; flex:none; }
        .peer-detail strong { color:#42676a; }
        .peer-empty {
          padding:22px 16px; border:1px dashed #cdbfae; border-radius:18px; color:#758183; font-size:12px; line-height:1.5;
          background:rgba(255,250,241,.42);
        }
        .peer-progress {
          border-radius:24px; padding:19px; background:#fff9ef; border:1px solid #dfd2c1; box-shadow:0 6px 0 #e1d3bf;
        }
        .peer-progress-head { display:flex; align-items:flex-start; justify-content:space-between; }
        .peer-progress-kicker { color:#118a94; font-size:10px; text-transform:uppercase; letter-spacing:.15em; font-weight:900; }
        .peer-progress h2 { font-size:24px; letter-spacing:-.07em; margin:18px 0 7px; line-height:1.05; }
        .peer-progress p { color:#748080; font-size:12px; line-height:1.5; margin:0; }
        .peer-ring { width:44px; height:44px; border-radius:50%; display:grid; place-items:center; color:#123456; background:conic-gradient(#1eb7bd 0 64%, #d8ebe1 64% 100%); position:relative; }
        .peer-ring::after { content:""; position:absolute; inset:5px; border-radius:50%; background:#fff9ef; }
        .peer-ring span { position:relative; z-index:1; font-size:10px; font-weight:900; }
        .peer-metrics { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-top:19px; }
        .peer-metric { border-radius:13px; background:#eef5ec; padding:11px 9px; }
        .peer-metric strong { display:block; color:#123456; font-size:18px; letter-spacing:-.06em; }
        .peer-metric span { display:block; color:#718083; font-size:9px; margin-top:3px; }
        .peer-bottom {
          position:absolute; bottom:0; left:0; right:0; display:flex; justify-content:space-around; gap:4px;
          padding:11px 18px 17px; background:rgba(248,241,228,.94); border-top:1px solid #e2d6c6; z-index:3; backdrop-filter:blur(12px);
        }
        .peer-nav {
          flex:1; border:0; background:transparent; color:#85908d; display:flex; align-items:center; flex-direction:column; gap:4px;
          font:800 9px "Avenir Next",sans-serif; cursor:pointer; padding:4px; transition:color .2s ease;
        }
        .peer-nav.active { color:#118a94; }
        .peer-nav-dot { width:4px; height:4px; border-radius:50%; background:currentColor; opacity:0; }
        .peer-nav.active .peer-nav-dot { opacity:1; }
        .peer-modal-scrim { position:absolute; inset:0; z-index:8; background:rgba(18,52,86,.48); display:flex; align-items:flex-end; }
        .peer-modal { width:100%; border-radius:28px 28px 0 0; background:#fff9ef; padding:19px 21px 29px; box-shadow:0 -12px 34px rgba(23,49,62,.16); animation:peer-rise .3s ease both; }
        @keyframes peer-rise { from { transform:translateY(30px); opacity:.4; } to { transform:translateY(0); opacity:1; } }
        .peer-modal-head { display:flex; align-items:center; justify-content:space-between; }
        .peer-modal-close { border:0; background:#efe3d1; color:#123456; width:32px; height:32px; border-radius:10px; display:grid; place-items:center; cursor:pointer; }
        .peer-modal-kicker { color:#118a94; font-size:10px; text-transform:uppercase; letter-spacing:.15em; font-weight:900; }
        .peer-modal h3 { font-size:25px; letter-spacing:-.07em; margin:19px 0 8px; }
        .peer-modal p { color:#748080; font-size:12px; line-height:1.5; margin:0 0 15px; }
        .peer-modal-callout { display:flex; gap:10px; align-items:center; padding:13px; border-radius:15px; background:#e8f5ef; color:#236862; font-size:12px; font-weight:800; }
        .peer-modal-actions { display:flex; gap:8px; margin-top:15px; }
        .peer-modal-action { flex:1; border:0; border-radius:13px; padding:13px; cursor:pointer; font:900 12px "Avenir Next",sans-serif; }
        .peer-modal-action.secondary { color:#48666a; background:#eee3d2; }
        .peer-modal-action.primary { color:#fff5e4; background:#123456; }
        @media (min-width: 520px) {
          .peer-shell { padding:20px 0; }
          .peer-phone { min-height:calc(100dvh - 40px); border-radius:32px; box-shadow:0 16px 50px rgba(34,48,56,.16); }
          .peer-modal-scrim { border-radius:32px; }
        }
      `}</style>

      <section className="peer-phone" aria-label="Robolingo peer challenges and weekly language circle">
        <div className="peer-noise" />
        <header className="peer-top">
          <div className="peer-brand">
            <div className="peer-mark" aria-hidden="true"><span>R•</span></div>
            <div>
              <div className="peer-kicker">learning together</div>
              <div className="peer-word">Robolingo</div>
            </div>
          </div>
          <button className="peer-bell" aria-label="Open circle updates" onClick={() => setActiveTab("Circle")}>
            <Bell size={17} strokeWidth={2.2} />
          </button>
        </header>

        <div className="peer-scroll">
          <div className="peer-eyebrow">
            <span className="peer-date">Tue · 14 May</span>
            <span className="peer-streak"><Flame size={14} fill="currentColor" /> 7 day streak</span>
          </div>
          <h1 className="peer-heading">Small words. <em>Good company.</em></h1>
          <p className="peer-subheading">Your language gets better when it gets shared. Join a circle, take a turn, keep going.</p>

          <div className="peer-tabs" role="tablist" aria-label="Community views">
            {(["Circle", "Challenges", "Progress"] as const).map((tab) => (
              <button
                className={`peer-tab ${activeTab === tab ? "active" : ""}`}
                key={tab}
                role="tab"
                aria-selected={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === "Circle" ? (
            <>
              <div className="peer-section-head">
                <span className="peer-section-label">This week · Tue 19:30</span>
                <button className="peer-section-action" onClick={() => setReminded((value) => !value)}>
                  {reminded ? "Reminder set" : "Remind me"}
                </button>
              </div>
              <article className="peer-circle">
                <div className="peer-circle-top">
                  <span className="peer-circle-tag">Weekly language circle</span>
                  <span className="peer-live"><span className="peer-live-dot" /> 5 spots left</span>
                </div>
                <h2>Tell us about your perfect weekend.</h2>
                <p>Twenty minutes of low-pressure speaking with people on the same route.</p>
                <div className="peer-circle-footer">
                  <div className="peer-avatars" aria-label="Circle members">
                    <span className="peer-avatar">AM</span><span className="peer-avatar">JS</span><span className="peer-avatar">LK</span><span className="peer-avatar more">+5</span>
                  </div>
                  <button className="peer-circle-cta" onClick={() => setReminded((value) => !value)}>
                    {reminded ? "You&apos;re in" : "Join circle"} <ArrowRight size={13} />
                  </button>
                </div>
              </article>

              <div className="peer-section-head">
                <span className="peer-section-label">Peer challenges · 3 open</span>
                <button className="peer-section-action" onClick={() => setActiveTab("Challenges")}>See all</button>
              </div>
              <div className="peer-challenge-list">
                {challenges.map((challenge) => {
                  const ChallengeIcon = challenge.icon;
                  const tone = toneStyles[challenge.tone];
                  return (
                    <button
                      className={`peer-challenge ${selectedId === challenge.id ? "selected" : ""}`}
                      key={challenge.id}
                      onClick={() => { setSelectedId(challenge.id); setActiveTab("Challenges"); }}
                    >
                      <span className="peer-challenge-icon" style={{ background: tone.soft, color: tone.ink }}><ChallengeIcon size={16} /></span>
                      <span className="peer-challenge-copy">
                        <span className="peer-challenge-title">{challenge.title}</span>
                        <span className="peer-challenge-meta"><Clock3 size={11} /> {challenge.time} <Users size={11} /> {challenge.members}</span>
                      </span>
                      <ChevronRight className="peer-challenge-arrow" size={16} />
                    </button>
                  );
                })}
              </div>
              <div className="peer-detail">
                <span className="peer-detail-mark" style={{ background: "#e8d8ba", color: "#9b7122" }}><Sparkles size={13} /></span>
                <span><strong>Circle note:</strong> listening twice makes your own turn feel much easier.</span>
              </div>
            </>
          ) : activeTab === "Challenges" ? (
            <>
              <div className="peer-section-head">
                <span className="peer-section-label">Choose your next turn</span>
                <button className="peer-section-action" onClick={() => setActiveTab("Circle")}>Back to circle</button>
              </div>
              <div className="peer-challenge-list">
                {challenges.map((challenge) => {
                  const ChallengeIcon = challenge.icon;
                  const tone = toneStyles[challenge.tone];
                  const isJoined = joined.includes(challenge.id);
                  return (
                    <button
                      className={`peer-challenge ${selectedId === challenge.id ? "selected" : ""}`}
                      key={challenge.id}
                      onClick={() => { setSelectedId(challenge.id); setShowChallenge(true); }}
                    >
                      <span className="peer-challenge-icon" style={{ background: tone.soft, color: tone.ink }}><ChallengeIcon size={16} /></span>
                      <span className="peer-challenge-copy">
                        <span className="peer-challenge-title">{challenge.title}</span>
                        <span className="peer-challenge-meta"><Clock3 size={11} /> {challenge.time} <Users size={11} /> {challenge.members}</span>
                      </span>
                      {isJoined ? <Check size={16} color="#16868e" /> : <ChevronRight className="peer-challenge-arrow" size={16} />}
                    </button>
                  );
                })}
              </div>
              <div className="peer-empty" style={{ marginTop: 17 }}>
                <strong style={{ color: "#42676a" }}>Want to host a prompt?</strong><br />
                Start a tiny challenge around a phrase you learned this week.
                <button className="peer-challenge-cta" style={{ marginTop: 13 }} onClick={() => setShowChallenge(true)}><Plus size={14} /> Create prompt</button>
              </div>
            </>
          ) : (
            <section className="peer-progress">
              <div className="peer-progress-head">
                <div>
                  <div className="peer-progress-kicker">Your circle momentum</div>
                  <h2>Keep your voice in the room.</h2>
                </div>
                <div className="peer-ring" aria-label="64 percent complete"><span>64%</span></div>
              </div>
              <p>You showed up for two circles and helped three peers this month. That is real progress.</p>
              <div className="peer-metrics">
                <div className="peer-metric"><strong>02</strong><span>circles joined</span></div>
                <div className="peer-metric"><strong>11</strong><span>turns taken</span></div>
                <div className="peer-metric"><strong>07</strong><span>peers helped</span></div>
              </div>
              <button className="peer-circle-cta" style={{ marginTop: 18 }} onClick={() => setActiveTab("Circle")}>Find a circle <ArrowRight size={13} /></button>
            </section>
          )}
        </div>

        <nav className="peer-bottom" aria-label="Primary navigation">
          {[
            { label: "Circle", icon: Radio, tab: "Circle" as const },
            { label: "Challenges", icon: Swords, tab: "Challenges" as const },
            { label: "Progress", icon: Trophy, tab: "Progress" as const },
          ].map(({ label, icon: NavIcon, tab }) => (
            <button key={label} className={`peer-nav ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
              <NavIcon size={18} strokeWidth={2.1} />{label}<span className="peer-nav-dot" />
            </button>
          ))}
        </nav>

        {showChallenge ? (
          <div className="peer-modal-scrim" role="dialog" aria-modal="true" aria-label="Challenge briefing">
            <div className="peer-modal">
              <div className="peer-modal-head">
                <span className="peer-modal-kicker">Peer challenge</span>
                <button className="peer-modal-close" aria-label="Close challenge briefing" onClick={() => setShowChallenge(false)}><X size={16} /></button>
              </div>
              <h3>{selected.title}</h3>
              <p>Take a short turn, then leave one encouraging note for the next learner. Nobody needs perfect words here.</p>
              <div className="peer-modal-callout"><Video size={16} /> {joined.includes(selected.id) ? "Your circle is waiting for your voice." : "Join this prompt and practice with peers."}</div>
              <div className="peer-modal-actions">
                <button className="peer-modal-action secondary" onClick={() => setShowChallenge(false)}>Not now</button>
                <button className="peer-modal-action primary" onClick={() => { toggleJoin(selected.id); setShowChallenge(false); }}> {joined.includes(selected.id) ? "Practice now" : "Join challenge"} <Play size={13} fill="currentColor" style={{ verticalAlign: "middle", marginLeft: 4 }} /></button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

export default PeerCircleOrbit;