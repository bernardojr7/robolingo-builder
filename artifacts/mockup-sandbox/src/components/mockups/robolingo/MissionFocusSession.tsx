import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Flame,
  Headphones,
  Mic2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
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

export function MissionFocusSession() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);

  const phrase = phrases[phraseIndex];
  const progress = ((phraseIndex + (finished ? 1 : 0)) / phrases.length) * 100;

  const nextPhrase = () => {
    setIsPlaying(false);
    setIsRecording(false);
    setShowHint(false);
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
  };

  return (
    <main className="focus-shell">
      <style>{`
        .focus-shell {
          --ink: #153854;
          --navy: #123456;
          --paper: #f8f1e4;
          --paper-deep: #eee1cf;
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
        .focus-shell *, .focus-shell *::before, .focus-shell *::after { box-sizing: border-box; }
        .focus-shell::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .16;
          background-image: radial-gradient(#cbbba4 .65px, transparent .65px);
          background-size: 11px 11px;
          mix-blend-mode: multiply;
        }
        .focus-top {
          position: relative;
          z-index: 2;
          width: min(1100px, calc(100% - 42px));
          margin: 0 auto;
          padding: 24px 0 0;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 22px;
        }
        .focus-back, .focus-help, .focus-pause {
          border: 1px solid #d8cbb9;
          background: rgba(255,251,244,.58);
          color: var(--navy);
          cursor: pointer;
          transition: transform .2s ease, background .2s ease;
        }
        .focus-back:hover, .focus-help:hover, .focus-pause:hover { transform: translateY(-2px); background: #fffaf1; }
        .focus-back {
          justify-self: start;
          min-height: 40px;
          padding: 0 13px 0 10px;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font: 850 11px "Avenir Next", sans-serif;
        }
        .focus-session-name { text-align: center; }
        .focus-kicker, .focus-step {
          display: block;
          color: #758183;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .17em;
          text-transform: uppercase;
        }
        .focus-session-name strong {
          display: block;
          margin-top: 3px;
          font-size: 16px;
          letter-spacing: -.04em;
        }
        .focus-tools {
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .focus-pause, .focus-help {
          width: 40px;
          height: 40px;
          border-radius: 14px;
          display: grid;
          place-items: center;
        }
        .focus-progress-wrap {
          position: relative;
          z-index: 2;
          width: min(1100px, calc(100% - 42px));
          margin: 26px auto 0;
        }
        .focus-progress-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .focus-step { font-size: 9px; letter-spacing: .14em; }
        .focus-progress-number { color: #258a91; font-size: 11px; font-weight: 900; }
        .focus-progress {
          height: 6px;
          overflow: hidden;
          border-radius: 99px;
          background: #e5d8c6;
        }
        .focus-progress > span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: var(--teal);
          transition: width .35s ease;
        }
        .focus-content {
          position: relative;
          z-index: 1;
          width: min(1080px, calc(100% - 42px));
          min-height: calc(100dvh - 155px);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(200px, .7fr) minmax(440px, 1.3fr);
          align-items: center;
          gap: clamp(42px, 9vw, 150px);
          padding: 28px 0 52px;
        }
        .focus-context { align-self: center; }
        .focus-context-tag {
          color: #b06429;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }
        .focus-context h1 {
          max-width: 330px;
          margin: 18px 0 13px;
          font-size: clamp(37px, 5vw, 66px);
          line-height: .95;
          letter-spacing: -.085em;
        }
        .focus-context h1 em { color: #0b9098; font-style: normal; }
        .focus-context-copy {
          max-width: 270px;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.52;
        }
        .focus-streak {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-top: 30px;
          color: #a45f2a;
          font-size: 11px;
          font-weight: 850;
        }
        .focus-orbit {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
        }
        .focus-orbit span {
          display: block;
          width: 28px;
          height: 4px;
          border-radius: 99px;
          background: #e4d6c4;
        }
        .focus-orbit span.active { background: var(--teal); }
        .focus-card {
          position: relative;
          isolation: isolate;
          min-height: 430px;
          border-radius: 30px;
          padding: clamp(25px, 4vw, 48px);
          background: var(--navy);
          color: #fdf4e4;
          box-shadow: 10px 12px 0 #d8c6ae;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .focus-card::before, .focus-card::after {
          content: "";
          position: absolute;
          z-index: -1;
          border: 1px solid rgba(249,216,115,.25);
          border-radius: 50%;
          pointer-events: none;
        }
        .focus-card::before { width: 460px; height: 460px; right: -230px; top: -185px; box-shadow: 0 0 0 22px rgba(249,216,115,.04), 0 0 0 52px rgba(249,216,115,.035); }
        .focus-card::after { width: 280px; height: 280px; left: -190px; bottom: -180px; border-color: rgba(30,183,189,.25); }
        .focus-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 37px;
        }
        .focus-listen {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #f9d873;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          text-transform: uppercase;
        }
        .focus-wave {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 22px;
        }
        .focus-wave i {
          display: block;
          width: 3px;
          height: 7px;
          border-radius: 4px;
          background: #5ecbc4;
          opacity: .8;
        }
        .focus-wave i:nth-child(2) { height: 15px; }
        .focus-wave i:nth-child(3) { height: 22px; }
        .focus-wave i:nth-child(4) { height: 12px; }
        .focus-wave i:nth-child(5) { height: 18px; }
        .focus-wave.playing i { animation: focus-wave .8s ease-in-out infinite alternate; }
        .focus-wave.playing i:nth-child(2) { animation-delay: .15s; }
        .focus-wave.playing i:nth-child(3) { animation-delay: .3s; }
        .focus-wave.playing i:nth-child(4) { animation-delay: .08s; }
        @keyframes focus-wave { to { transform: scaleY(.35); opacity: .45; } }
        .focus-phrase {
          max-width: 670px;
          margin: 0;
          font-size: clamp(32px, 5vw, 63px);
          line-height: 1.02;
          letter-spacing: -.075em;
          font-weight: 900;
        }
        .focus-translation {
          margin: 18px 0 0;
          color: #a8c0bb;
          font-size: 14px;
          line-height: 1.45;
        }
        .focus-translation span { color: #e7eee2; font-weight: 800; }
        .focus-card-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 44px;
        }
        .focus-hint {
          max-width: 300px;
          color: #a8bdb9;
          font-size: 11px;
          line-height: 1.4;
        }
        .focus-hint strong { color: #f5dd8c; }
        .focus-actions { display: flex; align-items: center; gap: 8px; }
        .focus-audio, .focus-next, .focus-record {
          min-height: 44px;
          border-radius: 13px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font: 900 11px "Avenir Next", sans-serif;
          transition: transform .2s ease, background .2s ease, border-color .2s ease;
        }
        .focus-audio:hover, .focus-next:hover, .focus-record:hover { transform: translateY(-2px); }
        .focus-audio {
          width: 48px;
          border: 1px solid #456274;
          background: rgba(255,255,255,.04);
          color: #e7eee2;
        }
        .focus-audio.active { background: #1a6773; border-color: #5dc9c2; }
        .focus-next {
          padding: 0 17px;
          border: 0;
          color: #173653;
          background: var(--yellow);
        }
        .focus-next:hover { background: #ffe594; }
        .focus-record {
          position: relative;
          align-self: center;
          margin-top: 22px;
          padding: 0 18px;
          border: 3px solid var(--navy);
          background: #fdf4e4;
          color: var(--navy);
          box-shadow: 0 4px 0 rgba(18,52,86,.14);
        }
        .focus-record:hover { transform: translateY(-2px); }
        .focus-record.active { background: #f4b5a2; color: #7e332d; }
        .focus-finished {
          text-align: center;
          align-items: center;
        }
        .focus-finished .focus-card-top { width: 100%; }
        .focus-finished-mark {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: var(--navy);
          background: #84d8be;
          transform: rotate(-6deg);
          margin: 4px auto 26px;
        }
        .focus-finished .focus-phrase { max-width: 520px; }
        .focus-restart {
          margin-top: 30px;
          border: 0;
          border-radius: 13px;
          min-height: 44px;
          padding: 0 16px;
          background: var(--yellow);
          color: var(--navy);
          font: 900 11px "Avenir Next", sans-serif;
          cursor: pointer;
        }
        .focus-restart:hover { transform: translateY(-2px); }
        .focus-paused {
          position: absolute;
          inset: 0;
          z-index: 5;
          background: rgba(18,52,86,.78);
          display: grid;
          place-items: center;
          text-align: center;
          padding: 30px;
          animation: focus-fade .2s ease both;
        }
        @keyframes focus-fade { from { opacity: 0; } to { opacity: 1; } }
        .focus-paused h2 { margin: 0 0 7px; font-size: 28px; letter-spacing: -.07em; }
        .focus-paused p { margin: 0; color: #bfd0ca; font-size: 12px; }
        .focus-paused button {
          margin-top: 21px;
          min-height: 42px;
          padding: 0 16px;
          border: 0;
          border-radius: 12px;
          background: var(--yellow);
          color: var(--navy);
          font: 900 11px "Avenir Next", sans-serif;
          cursor: pointer;
        }
        .focus-hint-pop {
          position: absolute;
          left: 28px;
          bottom: 82px;
          max-width: 250px;
          padding: 12px 14px;
          border-radius: 13px;
          color: #204855;
          background: #e8f5ef;
          font-size: 11px;
          line-height: 1.35;
          animation: focus-fade .2s ease both;
        }
        .focus-hint-pop button { float: right; border: 0; background: transparent; color: #397477; cursor: pointer; }
        @media (max-width: 720px) {
          .focus-top { padding-top: 17px; }
          .focus-top, .focus-progress-wrap, .focus-content { width: min(100% - 30px, 540px); }
          .focus-top { grid-template-columns: 1fr auto; }
          .focus-session-name { display: none; }
          .focus-content {
            display: block;
            min-height: 0;
            padding: 45px 0 35px;
          }
          .focus-context { margin-bottom: 28px; }
          .focus-context h1 { margin: 11px 0 8px; font-size: 39px; max-width: 300px; }
          .focus-context-copy { max-width: 330px; }
          .focus-streak { display: none; }
          .focus-card { min-height: 450px; padding: 26px 22px; }
          .focus-card-top { margin-bottom: 47px; }
          .focus-phrase { font-size: 39px; }
          .focus-card-bottom { display: block; margin-top: 35px; }
          .focus-actions { margin-top: 17px; justify-content: flex-end; }
          .focus-hint { max-width: 270px; }
        }
      `}</style>

      <header className="focus-top">
        <button className="focus-back" type="button" aria-label="Leave focus session" onClick={() => setIsPaused(true)}>
          <ArrowLeft size={15} /> Exit session
        </button>
        <div className="focus-session-name">
          <span className="focus-kicker">Mission 01 · At the corner shop</span>
          <strong>Focus session</strong>
        </div>
        <div className="focus-tools">
          <button className="focus-pause" type="button" aria-label={isPaused ? "Resume session" : "Pause session"} onClick={() => setIsPaused((current) => !current)}>
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button className="focus-help" type="button" aria-label="Show learning tip" onClick={() => setShowHint((current) => !current)}>
            <CircleHelp size={17} />
          </button>
        </div>
      </header>

      <div className="focus-progress-wrap" aria-label={`Phrase ${Math.min(phraseIndex + 1, phrases.length)} of ${phrases.length}`}>
        <div className="focus-progress-meta">
          <span className="focus-step">One phrase at a time</span>
          <span className="focus-progress-number">{finished ? "Complete" : `${phraseIndex + 1} / ${phrases.length}`}</span>
        </div>
        <div className="focus-progress"><span style={{ width: `${progress}%` }} /></div>
      </div>

      <section className="focus-content" aria-label="Focused language practice">
        <div className="focus-context">
          <span className="focus-context-tag">Listen · then speak</span>
          <h1>Small steps.<br /><em>Real words.</em></h1>
          <p className="focus-context-copy">Stay with this one moment. Hear the rhythm, notice the useful bit, then make it yours.</p>
          <div className="focus-streak"><Flame size={14} fill="currentColor" /> 7 days in a row</div>
          <div className="focus-orbit" aria-hidden="true">
            {phrases.map((item, index) => <span className={index <= phraseIndex || finished ? "active" : ""} key={item.english} />)}
          </div>
        </div>

        <article className={`focus-card ${finished ? "focus-finished" : ""}`}>
          {finished ? (
            <>
              <div className="focus-finished-mark"><Check size={29} strokeWidth={2.5} /></div>
              <span className="focus-listen">Mission complete</span>
              <h2 className="focus-phrase">Nice work,<br />explorer.</h2>
              <p className="focus-translation">Three useful phrases are now in your pocket.</p>
              <button className="focus-restart" type="button" onClick={restart}><RotateCcw size={13} style={{ verticalAlign: "middle", marginRight: 6 }} /> Replay mission</button>
            </>
          ) : (
            <>
              <div className="focus-card-top">
                <span className="focus-listen"><Headphones size={16} /> Listen first</span>
                <span className={`focus-wave ${isPlaying ? "playing" : ""}`} aria-label={isPlaying ? "Audio playing" : "Audio paused"}>
                  <i /><i /><i /><i /><i />
                </span>
              </div>
              <h2 className="focus-phrase">{phrase.english}</h2>
              <p className="focus-translation"><span>In Portuguese:</span> {phrase.portuguese}</p>
              <div className="focus-card-bottom">
                <p className="focus-hint"><strong>Why it works:</strong> {phrase.note}</p>
                <div className="focus-actions">
                  <button className={`focus-audio ${isPlaying ? "active" : ""}`} type="button" aria-label={`Play ${phrase.sound}`} onClick={() => setIsPlaying((current) => !current)}>
                    {isPlaying ? <Pause size={16} /> : <Volume2 size={17} />}
                  </button>
                  <button className="focus-next" type="button" onClick={nextPhrase}>
                    {phraseIndex === phrases.length - 1 ? "Finish" : "Next phrase"} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
              <button className={`focus-record ${isRecording ? "active" : ""}`} type="button" onClick={() => setIsRecording((current) => !current)}>
                <Mic2 size={15} /> {isRecording ? "Listening to you…" : "Try saying it"}
              </button>
              {showHint ? <div className="focus-hint-pop"><button type="button" aria-label="Close tip" onClick={() => setShowHint(false)}><X size={13} /></button>Say it slowly once, then again at the speed you would use in real life.</div> : null}
            </>
          )}
          {isPaused && !finished ? (
            <div className="focus-paused">
              <div>
                <Sparkles size={20} color="#f9d873" />
                <h2>Take a breath.</h2>
                <p>Your place is saved. Come back when you are ready.</p>
                <button type="button" onClick={() => setIsPaused(false)}><Play size={13} style={{ verticalAlign: "middle", marginRight: 5 }} /> Continue mission</button>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </main>
  );
}

export default MissionFocusSession;