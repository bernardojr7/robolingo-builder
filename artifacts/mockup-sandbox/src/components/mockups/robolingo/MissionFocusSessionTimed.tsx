import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  Flame,
  Headphones,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  Wind,
  X,
} from "lucide-react";

type Phrase = {
  english: string;
  portuguese: string;
  note: string;
  sound: string;
};

const phrases: Phrase[] = [
  {
    english: "Could I get a bottle of water, please?",
    portuguese: "Posso pegar uma garrafa de água, por favor?",
    note: "A friendly way to ask for something at the counter.",
    sound: "could I get a bottle of water please",
  },
  {
    english: "That'll be all for today.",
    portuguese: "É só isso por hoje.",
    note: "Use it when you are ready to finish your order.",
    sound: "that'll be all for today",
  },
  {
    english: "Do you take contactless?",
    portuguese: "Vocês aceitam aproximação?",
    note: "A useful question at shops, cafés, and market stalls.",
    sound: "do you take contactless",
  },
];

const breathPhases = [
  { label: "Breathe in", short: "Inhale", seconds: 4, tone: "#84d8be" },
  { label: "Stay soft", short: "Hold", seconds: 2, tone: "#f9d873" },
  { label: "Let it go", short: "Exhale", seconds: 6, tone: "#91ccd2" },
];

export function MissionFocusSessionTimed() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(breathPhases[0].seconds);

  const phrase = phrases[phraseIndex];
  const phase = breathPhases[phaseIndex];
  const progress = ((phraseIndex + (finished ? 1 : 0)) / phrases.length) * 100;
  const breathProgress = ((phase.seconds - phaseSeconds) / phase.seconds) * 100;
  const clock = useMemo(() => `0:${String(secondsLeft).padStart(2, "0")}`, [secondsLeft]);

  useEffect(() => {
    if (isPaused || finished) return;
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 45));
      setPhaseSeconds((current) => {
        if (current > 1) return current - 1;
        setPhaseIndex((index) => (index + 1) % breathPhases.length);
        return breathPhases[(phaseIndex + 1) % breathPhases.length].seconds;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [finished, isPaused, phaseIndex]);

  const nextPhrase = () => {
    setIsPlaying(false);
    setIsRecording(false);
    setShowHint(false);
    setSecondsLeft(45);
    setPhaseIndex(0);
    setPhaseSeconds(breathPhases[0].seconds);
    if (phraseIndex === phrases.length - 1) {
      setFinished(true);
      return;
    }
    setPhraseIndex((current) => current + 1);
  };

  const restart = () => {
    setPhraseIndex(0);
    setFinished(false);
    setIsPaused(false);
    setIsPlaying(false);
    setIsRecording(false);
    setSecondsLeft(45);
    setPhaseIndex(0);
    setPhaseSeconds(breathPhases[0].seconds);
  };

  return (
    <main className="timed-focus-shell">
      <style>{`
        .timed-focus-shell {
          --ink: #153854;
          --navy: #123456;
          --paper: #f8f1e4;
          --muted: #718082;
          --teal: #1eb7bd;
          --yellow: #f9d873;
          min-height: 100dvh;
          width: 100%;
          background: var(--paper);
          color: var(--ink);
          font-family: "Avenir Next", "DM Sans", "Trebuchet MS", sans-serif;
          overflow: hidden;
          position: relative;
        }
        .timed-focus-shell *, .timed-focus-shell *::before, .timed-focus-shell *::after { box-sizing: border-box; }
        .timed-focus-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .16;
          background-image: radial-gradient(#cbbba4 .65px, transparent .65px);
          background-size: 11px 11px;
          mix-blend-mode: multiply;
        }
        .timed-top, .timed-progress-wrap, .timed-content { position: relative; z-index: 2; width: min(1100px, calc(100% - 42px)); margin: 0 auto; }
        .timed-top { padding-top: 24px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 22px; }
        .timed-back, .timed-help, .timed-pause {
          border: 1px solid #d8cbb9; background: rgba(255,251,244,.58); color: var(--navy); cursor: pointer;
          transition: transform .2s ease, background .2s ease;
        }
        .timed-back:hover, .timed-help:hover, .timed-pause:hover, .timed-restart:hover { transform: translateY(-2px); background: #fffaf1; }
        .timed-back { justify-self: start; min-height: 40px; padding: 0 13px 0 10px; border-radius: 14px; display: inline-flex; align-items: center; gap: 7px; font: 850 11px "Avenir Next", sans-serif; }
        .timed-session-name { text-align: center; }
        .timed-kicker, .timed-step { display: block; color: #758183; font-size: 10px; font-weight: 850; letter-spacing: .17em; text-transform: uppercase; }
        .timed-session-name strong { display: block; margin-top: 3px; font-size: 16px; letter-spacing: -.04em; }
        .timed-tools { justify-self: end; display: flex; align-items: center; gap: 8px; }
        .timed-pause, .timed-help { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; }
        .timed-progress-wrap { margin-top: 26px; }
        .timed-progress-meta { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .timed-step { font-size: 9px; letter-spacing: .14em; }
        .timed-progress-number { color: #258a91; font-size: 11px; font-weight: 900; }
        .timed-progress { height: 6px; overflow: hidden; border-radius: 99px; background: #e5d8c6; }
        .timed-progress > span { display: block; height: 100%; border-radius: inherit; background: var(--teal); transition: width .35s ease; }
        .timed-content { min-height: calc(100dvh - 155px); display: grid; grid-template-columns: minmax(200px, .7fr) minmax(440px, 1.3fr); align-items: center; gap: clamp(42px, 9vw, 150px); padding: 28px 0 52px; }
        .timed-context-tag { color: #b06429; font-size: 11px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; }
        .timed-context h1 { max-width: 330px; margin: 18px 0 13px; font-size: clamp(37px, 5vw, 66px); line-height: .95; letter-spacing: -.085em; }
        .timed-context h1 em { color: #0b9098; font-style: normal; }
        .timed-context-copy { max-width: 270px; color: var(--muted); font-size: 13px; line-height: 1.52; }
        .timed-streak { display: flex; align-items: center; gap: 7px; margin-top: 30px; color: #a45f2a; font-size: 11px; font-weight: 850; }
        .timed-orbit { display: flex; align-items: center; gap: 6px; margin-top: 9px; }
        .timed-orbit span { display: block; width: 28px; height: 4px; border-radius: 99px; background: #e4d6c4; }
        .timed-orbit span.active { background: var(--teal); }
        .timed-card { position: relative; isolation: isolate; min-height: 488px; border-radius: 30px; padding: clamp(25px, 4vw, 48px); background: var(--navy); color: #fdf4e4; box-shadow: 10px 12px 0 #d8c6ae; overflow: hidden; display: flex; flex-direction: column; justify-content: center; }
        .timed-card::before, .timed-card::after { content: ""; position: absolute; z-index: -1; border: 1px solid rgba(249,216,115,.25); border-radius: 50%; pointer-events: none; }
        .timed-card::before { width: 460px; height: 460px; right: -230px; top: -185px; box-shadow: 0 0 0 22px rgba(249,216,115,.04), 0 0 0 52px rgba(249,216,115,.035); }
        .timed-card::after { width: 280px; height: 280px; left: -190px; bottom: -180px; border-color: rgba(30,183,189,.25); }
        .timed-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
        .timed-listen { display: inline-flex; align-items: center; gap: 8px; color: #f9d873; font-size: 10px; font-weight: 900; letter-spacing: .15em; text-transform: uppercase; }
        .timed-wave { display: flex; align-items: center; gap: 3px; height: 22px; }
        .timed-wave i { display: block; width: 3px; height: 7px; border-radius: 4px; background: #5ecbc4; opacity: .8; }
        .timed-wave i:nth-child(2) { height: 15px; } .timed-wave i:nth-child(3) { height: 22px; } .timed-wave i:nth-child(4) { height: 12px; } .timed-wave i:nth-child(5) { height: 18px; }
        .timed-wave.playing i { animation: timed-wave .8s ease-in-out infinite alternate; }
        .timed-wave.playing i:nth-child(2) { animation-delay: .15s; } .timed-wave.playing i:nth-child(3) { animation-delay: .3s; } .timed-wave.playing i:nth-child(4) { animation-delay: .08s; }
        @keyframes timed-wave { to { transform: scaleY(.35); opacity: .45; } }
        .timed-ritual { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 15px; margin-bottom: 22px; padding: 10px 12px; border: 1px solid rgba(145,204,210,.22); border-radius: 16px; background: rgba(255,255,255,.045); }
        .timed-ritual-copy { display: flex; align-items: center; gap: 9px; color: #a8c0bb; font-size: 10px; line-height: 1.3; }
        .timed-ritual-copy strong { display: block; color: #e7eee2; font-size: 12px; }
        .timed-ritual-copy small { display: block; margin-top: 2px; }
        .timed-breath-ring { position: relative; width: 50px; height: 50px; display: grid; place-items: center; border-radius: 50%; border: 1px solid rgba(132,216,190,.55); color: #f8e8b7; font: 900 14px "DM Mono", monospace; }
        .timed-breath-ring::after { content: ""; position: absolute; inset: 5px; border-radius: inherit; border: 2px solid ${phase.tone}; opacity: .55; transform: scale(${0.78 + (breathProgress / 100) * .2}); transition: transform .5s ease; }
        .timed-ritual-meter { grid-column: 1 / -1; height: 3px; overflow: hidden; border-radius: 99px; background: rgba(255,255,255,.12); }
        .timed-ritual-meter span { display: block; height: 100%; width: ${breathProgress}%; background: ${phase.tone}; transition: width .7s linear; }
        .timed-phrase { max-width: 670px; margin: 0; font-size: clamp(32px, 5vw, 63px); line-height: 1.02; letter-spacing: -.075em; font-weight: 900; }
        .timed-translation { margin: 18px 0 0; color: #a8c0bb; font-size: 14px; line-height: 1.45; }
        .timed-translation span { color: #e7eee2; font-weight: 800; }
        .timed-card-bottom { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-top: 34px; }
        .timed-hint { max-width: 300px; color: #a8bdb9; font-size: 11px; line-height: 1.4; }
        .timed-hint strong { color: #f5dd8c; }
        .timed-actions { display: flex; align-items: center; gap: 8px; }
        .timed-audio, .timed-next, .timed-record, .timed-restart { min-height: 44px; border-radius: 13px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; font: 900 11px "Avenir Next", sans-serif; transition: transform .2s ease, background .2s ease, border-color .2s ease; }
        .timed-audio:hover, .timed-next:hover, .timed-record:hover, .timed-restart:hover { transform: translateY(-2px); }
        .timed-audio { width: 48px; border: 1px solid #456274; background: rgba(255,255,255,.04); color: #e7eee2; }
        .timed-audio.active { background: #1a6773; border-color: #5dc9c2; }
        .timed-next, .timed-restart { padding: 0 17px; border: 0; color: #173653; background: var(--yellow); }
        .timed-record { align-self: center; margin-top: 22px; padding: 0 18px; border: 3px solid var(--navy); background: #fdf4e4; color: var(--navy); box-shadow: 0 4px 0 rgba(18,52,86,.14); }
        .timed-record.active { background: #f4b5a2; color: #7e332d; }
        .timed-finished { text-align: center; align-items: center; }
        .timed-finished-mark { width: 62px; height: 62px; display: grid; place-items: center; border-radius: 20px; color: var(--navy); background: #84d8be; transform: rotate(-6deg); margin: 4px auto 26px; }
        .timed-finished .timed-phrase { max-width: 520px; }
        .timed-paused { position: absolute; inset: 0; z-index: 5; background: rgba(18,52,86,.78); display: grid; place-items: center; text-align: center; padding: 30px; animation: timed-fade .2s ease both; }
        @keyframes timed-fade { from { opacity: 0; } to { opacity: 1; } }
        .timed-paused h2 { margin: 0 0 7px; font-size: 28px; letter-spacing: -.07em; } .timed-paused p { margin: 0; color: #bfd0ca; font-size: 12px; }
        .timed-paused button { margin-top: 21px; min-height: 42px; padding: 0 16px; border: 0; border-radius: 12px; background: var(--yellow); color: var(--navy); font: 900 11px "Avenir Next", sans-serif; cursor: pointer; }
        .timed-hint-pop { position: absolute; left: 28px; bottom: 82px; max-width: 250px; padding: 12px 14px; border-radius: 13px; color: #204855; background: #e8f5ef; font-size: 11px; line-height: 1.35; animation: timed-fade .2s ease both; }
        .timed-hint-pop button { float: right; border: 0; background: transparent; color: #397477; cursor: pointer; }
        @media (max-width: 720px) {
          .timed-top, .timed-progress-wrap, .timed-content { width: min(100% - 30px, 540px); }
          .timed-top { padding-top: 17px; grid-template-columns: 1fr auto; } .timed-session-name { display: none; }
          .timed-content { display: block; min-height: 0; padding: 45px 0 35px; }
          .timed-context { margin-bottom: 28px; } .timed-context h1 { margin: 11px 0 8px; font-size: 39px; max-width: 300px; }
          .timed-context-copy { max-width: 330px; } .timed-streak { display: none; }
          .timed-card { min-height: 500px; padding: 26px 22px; } .timed-card-top { margin-bottom: 25px; }
          .timed-phrase { font-size: 39px; } .timed-card-bottom { display: block; margin-top: 30px; }
          .timed-actions { margin-top: 17px; justify-content: flex-end; } .timed-hint { max-width: 270px; }
        }
      `}</style>

      <header className="timed-top">
        <button className="timed-back" type="button" aria-label="Leave focus session" onClick={() => setIsPaused(true)}>
          <ArrowLeft size={15} /> Exit session
        </button>
        <div className="timed-session-name">
          <span className="timed-kicker">Mission 01 · At the corner shop</span>
          <strong>Focus session</strong>
        </div>
        <div className="timed-tools">
          <button className="timed-pause" type="button" aria-label={isPaused ? "Resume session" : "Pause session"} onClick={() => setIsPaused((current) => !current)}>
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button className="timed-help" type="button" aria-label="Show learning tip" onClick={() => setShowHint((current) => !current)}>
            <CircleHelp size={17} />
          </button>
        </div>
      </header>

      <div className="timed-progress-wrap" aria-label={`Phrase ${Math.min(phraseIndex + 1, phrases.length)} of ${phrases.length}`}>
        <div className="timed-progress-meta">
          <span className="timed-step">One phrase at a time</span>
          <span className="timed-progress-number">{finished ? "Complete" : `${phraseIndex + 1} / ${phrases.length}`}</span>
        </div>
        <div className="timed-progress"><span style={{ width: `${progress}%` }} /></div>
      </div>

      <section className="timed-content" aria-label="Focused language practice with breathing timer">
        <div className="timed-context">
          <span className="timed-context-tag">Listen · breathe · speak</span>
          <h1>Small steps.<br /><em>Real words.</em></h1>
          <p className="timed-context-copy">A gentle 45-second window keeps your attention here. Follow the breath, then make the phrase yours.</p>
          <div className="timed-streak"><Flame size={14} fill="currentColor" /> 7 days in a row</div>
          <div className="timed-orbit" aria-hidden="true">
            {phrases.map((item, index) => <span className={index <= phraseIndex || finished ? "active" : ""} key={item.english} />)}
          </div>
        </div>

        <article className={`timed-card ${finished ? "timed-finished" : ""}`}>
          {finished ? (
            <>
              <div className="timed-finished-mark"><Check size={29} strokeWidth={2.5} /></div>
              <span className="timed-listen">Mission complete</span>
              <h2 className="timed-phrase">Nice work,<br />explorer.</h2>
              <p className="timed-translation">Three useful phrases are now in your pocket.</p>
              <button className="timed-restart" type="button" onClick={restart}><RotateCcw size={13} /> Replay mission</button>
            </>
          ) : (
            <>
              <div className="timed-card-top">
                <span className="timed-listen"><Headphones size={16} /> Listen first</span>
                <span className={`timed-wave ${isPlaying ? "playing" : ""}`} aria-label={isPlaying ? "Audio playing" : "Audio paused"}><i /><i /><i /><i /><i /></span>
              </div>
              <div className="timed-ritual" aria-live="polite">
                <div className="timed-ritual-copy"><Wind size={17} color={phase.tone} /><div><strong>{phase.label}</strong><small>{phase.short} gently · {clock} left</small></div></div>
                <div className="timed-breath-ring" style={{ ["--ring-tone" as string]: phase.tone }}>{phaseSeconds}</div>
                <div className="timed-ritual-meter"><span style={{ width: `${breathProgress}%`, background: phase.tone }} /></div>
              </div>
              <h2 className="timed-phrase">{phrase.english}</h2>
              <p className="timed-translation"><span>In Portuguese:</span> {phrase.portuguese}</p>
              <div className="timed-card-bottom">
                <p className="timed-hint"><strong>Why it works:</strong> {phrase.note}</p>
                <div className="timed-actions">
                  <button className={`timed-audio ${isPlaying ? "active" : ""}`} type="button" aria-label={`Play ${phrase.sound}`} onClick={() => setIsPlaying((current) => !current)}>{isPlaying ? <Pause size={16} /> : <Volume2 size={17} />}</button>
                  <button className="timed-next" type="button" onClick={nextPhrase}>{phraseIndex === phrases.length - 1 ? "Finish" : "Next phrase"} <ArrowRight size={14} /></button>
                </div>
              </div>
              <button className={`timed-record ${isRecording ? "active" : ""}`} type="button" onClick={() => setIsRecording((current) => !current)}><Mic2 size={15} /> {isRecording ? "Listening to you…" : "Try saying it"}</button>
              {showHint ? <div className="timed-hint-pop"><button type="button" aria-label="Close tip" onClick={() => setShowHint(false)}><X size={13} /></button>Let the timer be a soft anchor, not a test. Say it slowly once, then again at real-life speed.</div> : null}
            </>
          )}
          {isPaused && !finished ? <div className="timed-paused"><div><Sparkles size={20} color="#f9d873" /><h2>Take a breath.</h2><p>Your place is saved. The timer will wait.</p><button type="button" onClick={() => setIsPaused(false)}><Play size={13} style={{ verticalAlign: "middle", marginRight: 5 }} /> Continue mission</button></div></div> : null}
        </article>
      </section>
    </main>
  );
}

export default MissionFocusSessionTimed;