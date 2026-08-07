/* @ds-bundle: {"format":4,"namespace":"AnaPaulaFiRioDesignSystem_6bd756","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"}],"sourceHashes":{"animations.jsx":"ebe6809a6cbe","audio.js":"08044d722606","components/core/Badge.jsx":"df221a9c28b8","components/core/Button.jsx":"3cefa9f26740","components/core/Card.jsx":"b06a21b29a6a","components/core/Tag.jsx":"cf71bbfd9f54","image-slot.js":"9309434cb09c","reels-app.jsx":"5a67cf534efc","reels-dir-a.jsx":"c1d9d5d384b4","reels-dir-b.jsx":"347ef042c047","reels-dir-c.jsx":"96c3e48c52b6","reels-shared.jsx":"86bbb23ea466","scenes-cine.jsx":"90d9b6c78b3b","scenes-teaser.jsx":"062e60c949cf","scenes.jsx":"672ff23add28","site-preview/apf-data.js":"1928624d3f2f","site-preview/apf.js":"0ca4714d166f"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.AnaPaulaFiRioDesignSystem_6bd756 = window.AnaPaulaFiRioDesignSystem_6bd756 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// animations.jsx
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: t => t,
  // Quad
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  // Cubic
  easeInCubic: t => t * t * t,
  easeOutCubic: t => --t * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // Quart
  easeInQuart: t => t * t * t * t,
  easeOutQuart: t => 1 - --t * t * t * t,
  easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  // Expo
  easeInExpo: t => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: t => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },
  // Sine
  easeInSine: t => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: t => Math.sin(t * Math.PI / 2),
  easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  // Back (overshoot)
  easeOutBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: t => {
    const c1 = 1.70158,
      c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: t => {
    const c1 = 1.70158,
      c2 = c1 * 1.525;
    return t < 0.5 ? Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  // Elastic
  easeOutElastic: t => {
    const c4 = 2 * Math.PI / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  }
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return t => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? ease[i] || Easing.linear : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({
  from = 0,
  to = 1,
  start = 0,
  end = 1,
  ease = Easing.easeInOutCubic
}) {
  return t => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({
  time: 0,
  duration: 10,
  playing: false
});
const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({
  localTime: 0,
  progress: 0,
  duration: 0
});
const useSprite = () => React.useContext(SpriteContext);
function Sprite({
  start = 0,
  end = Infinity,
  children,
  keepMounted = false
}) {
  const {
    time
  } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;
  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration) ? clamp(localTime / duration, 0, 1) : 0;
  const value = {
    localTime,
    progress,
    duration,
    visible
  };
  return /*#__PURE__*/React.createElement(SpriteContext.Provider, {
    value: value
  }, typeof children === 'function' ? children(value) : children);
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0,
  y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em'
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let ty = 0;
  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }
  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity'
    }
  }, text);
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0,
  y = 0,
  width = 400,
  height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null // {label: string} for striped placeholder
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }
  const content = placeholder ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, placeholder.label || 'image') : /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: fit,
      display: 'block'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity'
    }
  }, content);
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0,
  y = 0,
  width = 100,
  height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const {
    localTime,
    duration
  } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);
  let opacity = 1;
  let scale = 1;
  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }
  const overrides = render ? render(spriteCtx) : {};
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width,
      height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides
    }
  });
}
function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch {
      return 0;
    }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);
  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try {
      localStorage.setItem(persistKey + ':t', String(time));
    } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(el.clientWidth / width, (el.clientHeight - barH) / height);
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = ts => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime(t => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;else {
            next = duration;
            setPlaying(false);
          }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = e => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);
  const displayTime = hoverTime != null ? hoverTime : time;
  const ctxValue = React.useMemo(() => ({
    time: displayTime,
    duration,
    playing,
    setTime,
    setPlaying
  }), [displayTime, duration, playing]);
  return /*#__PURE__*/React.createElement("div", {
    ref: stageRef,
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: '#0a0a0a',
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: canvasRef,
    style: {
      width,
      height,
      background,
      position: 'relative',
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      flexShrink: 0,
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(TimelineContext.Provider, {
    value: ctxValue
  }, children))), /*#__PURE__*/React.createElement(PlaybackBar, {
    time: displayTime,
    actualTime: time,
    duration: duration,
    playing: playing,
    onPlayPause: () => setPlaying(p => !p),
    onReset: () => {
      setTime(0);
    },
    onSeek: t => setTime(t),
    onHover: t => setHoverTime(t)
  }));
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({
  time,
  duration,
  playing,
  onPlayPause,
  onReset,
  onSeek,
  onHover
}) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);
  const timeFromEvent = React.useCallback(e => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);
  const onTrackMove = e => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };
  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };
  const onTrackDown = e => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = e => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);
  const pct = duration > 0 ? time / duration * 100 : 0;
  const fmt = t => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor(total * 100 % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };
  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',
      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    onClick: onReset,
    title: "Return to start (0)"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2v10M12 2L5 7l7 5V2z",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinejoin: "round",
    strokeLinecap: "round"
  }))), /*#__PURE__*/React.createElement(IconButton, {
    onClick: onPlayPause,
    title: "Play/pause (space)"
  }, playing ? /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "3",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "8",
    y: "2",
    width: "3",
    height: "10",
    fill: "currentColor"
  })) : /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 14 14",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3 2l9 5-9 5V2z",
    fill: "currentColor"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'right',
      color: '#f6f4ef'
    }
  }, fmt(time)), /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    onMouseMove: onTrackMove,
    onMouseLeave: onTrackLeave,
    onMouseDown: onTrackDown,
    style: {
      flex: 1,
      height: 22,
      position: 'relative',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 4,
      background: 'rgba(255,255,255,0.12)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      width: `${pct}%`,
      height: 4,
      background: 'oklch(72% 0.12 250)',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${pct}%`,
      top: '50%',
      width: 12,
      height: 12,
      marginLeft: -6,
      marginTop: -6,
      background: '#fff',
      borderRadius: 6,
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: mono,
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      width: 64,
      textAlign: 'left',
      color: 'rgba(246,244,239,0.55)'
    }
  }, fmt(duration)));
}
function IconButton({
  children,
  onClick,
  title
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    title: title,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6,
      color: '#f6f4ef',
      cursor: 'pointer',
      padding: 0,
      transition: 'background 120ms'
    }
  }, children);
}
Object.assign(window, {
  Easing,
  interpolate,
  animate,
  clamp,
  TimelineContext,
  useTime,
  useTimeline,
  Sprite,
  SpriteContext,
  useSprite,
  TextSprite,
  ImageSprite,
  RectSprite,
  Stage,
  PlaybackBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "animations.jsx", error: String((e && e.message) || e) }); }

// audio.js
try { (() => {
// audio.js — motor de efeitos sonoros sintetizados (Web Audio API)
// Sem arquivos externos: tudo gerado por osciladores + ruído, com reverb leve.
(function () {
  class TeaserAudio {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.startAt = 0;
    }
    init() {
      if (this.ctx) return;
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.85;
      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -10;
      this.comp.ratio.value = 6;
      // reverb curto p/ espaço cinematográfico
      this.conv = this.ctx.createConvolver();
      this.conv.buffer = this._impulse(1.4, 2.6);
      this.wet = this.ctx.createGain();
      this.wet.gain.value = 0.18;
      // tom global: lowpass p/ remover qualquer agudo
      this.tone = this.ctx.createBiquadFilter();
      this.tone.type = 'lowpass';
      this.tone.frequency.value = 2900;
      this.tone.Q.value = 0.5;
      this.master.connect(this.tone);
      this.tone.connect(this.comp);
      this.comp.connect(this.ctx.destination);
      this.master.connect(this.conv);
      this.conv.connect(this.wet);
      this.wet.connect(this.tone);
      this._noise = this._noiseBuffer(2.2);
    }
    _noiseBuffer(sec) {
      const n = Math.floor(this.ctx.sampleRate * sec);
      const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      return b;
    }
    _impulse(dur, decay) {
      const rate = this.ctx.sampleRate,
        len = Math.floor(rate * dur);
      const b = this.ctx.createBuffer(2, len, rate);
      for (let c = 0; c < 2; c++) {
        const d = b.getChannelData(c);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
      return b;
    }
    _env(at, vol, a, d) {
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + a);
      g.gain.exponentialRampToValueAtTime(0.0001, at + a + d);
      return g;
    }
    boom(at, o) {
      o = o || {};
      const f = o.f || 145,
        drop = o.drop || 44,
        dur = o.dur || 0.55,
        vol = o.vol || 0.9;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, at);
      osc.frequency.exponentialRampToValueAtTime(drop, at + dur * 0.8);
      const g = this._env(at, vol, 0.006, dur);
      osc.connect(g);
      g.connect(this.master);
      osc.start(at);
      osc.stop(at + dur + 0.1);
      this.noiseHit(at, {
        vol: vol * 0.28,
        dur: 0.1,
        hp: 320,
        lp: 2200
      });
      this.sub(at, {
        vol: vol * 0.55,
        dur: dur * 1.1
      });
    }
    sub(at, o) {
      o = o || {};
      const f = o.f || 58,
        dur = o.dur || 0.7,
        vol = o.vol || 0.6;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, at);
      osc.frequency.exponentialRampToValueAtTime(f * 0.55, at + dur);
      const g = this._env(at, vol, 0.012, dur);
      osc.connect(g);
      g.connect(this.master);
      osc.start(at);
      osc.stop(at + dur + 0.1);
    }
    noiseHit(at, o) {
      o = o || {};
      const vol = o.vol || 0.3,
        dur = o.dur || 0.1,
        hp = o.hp || 800,
        lp = o.lp || 9000;
      const s = this.ctx.createBufferSource();
      s.buffer = this._noise;
      const hpf = this.ctx.createBiquadFilter();
      hpf.type = 'highpass';
      hpf.frequency.value = hp;
      const lpf = this.ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.frequency.value = lp;
      const g = this._env(at, vol, 0.004, dur);
      s.connect(hpf);
      hpf.connect(lpf);
      lpf.connect(g);
      g.connect(this.master);
      s.start(at);
      s.stop(at + dur + 0.1);
    }
    whoosh(at, o) {
      o = o || {};
      const dur = o.dur || 0.5,
        vol = (o.vol || 0.45) * 0.85;
      const from = Math.min(o.from || 220, 360),
        to = Math.min(o.to || 700, 850);
      const s = this.ctx.createBufferSource();
      s.buffer = this._noise;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 0.6;
      bp.frequency.setValueAtTime(from, at);
      bp.frequency.exponentialRampToValueAtTime(to, at + dur);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1050;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.linearRampToValueAtTime(vol, at + dur * 0.5);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      s.connect(bp);
      bp.connect(lp);
      lp.connect(g);
      g.connect(this.master);
      s.start(at);
      s.stop(at + dur + 0.1);
    }
    tick(at, o) {
      o = o || {};
      // marcador quente (mallet suave), nada de agudo
      const f = o.f2 || 330,
        vol = o.vol || 0.34;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, at);
      osc.frequency.exponentialRampToValueAtTime(f * 0.82, at + 0.18);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      const g = this._env(at, vol, 0.006, 0.22);
      osc.connect(lp);
      lp.connect(g);
      g.connect(this.master);
      osc.start(at);
      osc.stop(at + 0.32);
      const o2 = this.ctx.createOscillator();
      o2.type = 'triangle';
      o2.frequency.setValueAtTime(f * 2, at);
      const lp2 = this.ctx.createBiquadFilter();
      lp2.type = 'lowpass';
      lp2.frequency.value = 1250;
      const g2 = this._env(at, vol * 0.26, 0.005, 0.13);
      o2.connect(lp2);
      lp2.connect(g2);
      g2.connect(this.master);
      o2.start(at);
      o2.stop(at + 0.22);
    }
    riser(at, o) {
      o = o || {};
      const dur = o.dur || 1.6,
        vol = o.vol || 0.4;
      const s = this.ctx.createBufferSource();
      s.buffer = this._noise;
      s.loop = true;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(170, at);
      bp.frequency.exponentialRampToValueAtTime(2100, at + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + dur * 0.92);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      s.connect(bp);
      bp.connect(g);
      g.connect(this.master);
      s.start(at);
      s.stop(at + dur + 0.1);
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, at);
      osc.frequency.exponentialRampToValueAtTime(340, at + dur);
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1150;
      const og = this.ctx.createGain();
      og.gain.setValueAtTime(0.0001, at);
      og.gain.exponentialRampToValueAtTime(vol * 0.5, at + dur * 0.92);
      og.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(lp);
      lp.connect(og);
      og.connect(this.master);
      osc.start(at);
      osc.stop(at + dur + 0.1);
    }
    shimmer(at, o) {
      o = o || {};
      // floreio grave e quente (acorde baixo), em vez de sino agudo
      const vol = o.vol || 0.26,
        freqs = [196, 294, 392];
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1250;
      lp.connect(this.master);
      freqs.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f * (1 + Math.random() * 0.003);
        const g = this._env(at + i * 0.03, vol * (1 - i * 0.18), 0.05, 0.95);
        osc.connect(g);
        g.connect(lp);
        osc.start(at + i * 0.03);
        osc.stop(at + i * 0.03 + 1.1);
      });
    }
    schedule(events) {
      if (!this.ctx) return;
      const t0 = this.ctx.currentTime + 0.08;
      this.startAt = t0;
      events.forEach(e => {
        try {
          this[e.fn](t0 + e.t, e.opts || {});
        } catch (err) {}
      });
    }
    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.value = m ? 0 : 0.85;
    }
  }
  window.TeaserAudio = TeaserAudio;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "audio.js", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
/**
 * Badge — category and status label for articles, sections and content items.
 * Renders as an inline chip with optional separator text.
 */
function Badge({
  children,
  color = 'secondary',
  size = 'sm',
  uppercase = true,
  separator
}) {
  const colors = {
    primary: {
      color: 'hsl(var(--primary, 348 46% 48%))'
    },
    secondary: {
      color: 'hsl(var(--secondary, 155 20% 34%))'
    },
    accent: {
      color: 'hsl(var(--accent, 40 58% 62%))'
    },
    muted: {
      color: 'hsl(var(--muted-foreground, 40 6% 40%))'
    },
    pill_primary: {
      background: 'hsl(var(--rose-100, 348 65% 93%))',
      color: 'hsl(var(--rose-700, 348 50% 32%))',
      borderRadius: '9999px',
      padding: '2px 10px',
      border: '1px solid hsl(var(--rose-300, 348 52% 76%))'
    },
    pill_secondary: {
      background: 'hsl(var(--sage-800, 155 18% 22%) / 0.12)',
      color: 'hsl(var(--sage-600, 155 20% 34%))',
      borderRadius: '9999px',
      padding: '2px 10px',
      border: '1px solid hsl(var(--sage-400, 155 18% 50%) / 0.4)'
    },
    pill_accent: {
      background: 'hsl(var(--honey-300, 40 68% 78%) / 0.35)',
      color: 'hsl(var(--warm-900, 60 8% 13%))',
      borderRadius: '9999px',
      padding: '2px 10px',
      border: '1px solid hsl(var(--honey-500, 40 58% 62%) / 0.5)'
    }
  };
  const sizes = {
    xs: {
      fontSize: '10px',
      letterSpacing: '0.18em'
    },
    sm: {
      fontSize: '11px',
      letterSpacing: '0.2em'
    },
    md: {
      fontSize: '12px',
      letterSpacing: '0.15em'
    }
  };
  const isPill = color.startsWith('pill_');
  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-body, "Poppins", sans-serif)',
    fontWeight: 500,
    textTransform: uppercase ? 'uppercase' : undefined,
    ...sizes[size],
    ...colors[color]
  };
  return /*#__PURE__*/React.createElement("span", {
    style: style
  }, children, separator && /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.5,
      fontWeight: 400
    }
  }, "\xB7"), separator);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
/**
 * Button — CTA primário e ações da interface do portal.
 * Suporta renderização como <button> ou <a> (via prop href).
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  pill = false,
  href,
  disabled = false,
  onClick,
  type = 'button'
}) {
  const [hovered, setHovered] = React.useState(false);
  const Tag = href ? 'a' : 'button';
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body, "Poppins", sans-serif)',
    fontWeight: 500,
    letterSpacing: '0.01em',
    lineHeight: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    textDecoration: 'none',
    border: '1.5px solid transparent',
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
    whiteSpace: 'nowrap',
    userSelect: 'none'
  };
  const sizes = {
    sm: {
      padding: '6px 16px',
      fontSize: '12px',
      borderRadius: pill ? '9999px' : '6px'
    },
    md: {
      padding: '10px 22px',
      fontSize: '14px',
      borderRadius: pill ? '9999px' : '8px'
    },
    lg: {
      padding: '13px 30px',
      fontSize: '15px',
      borderRadius: pill ? '9999px' : '10px'
    }
  };
  const variants = {
    primary: {
      default: {
        background: 'hsl(var(--primary, 348 46% 48%))',
        color: 'hsl(var(--primary-foreground, 40 38% 97%))'
      },
      hover: {
        background: 'hsl(var(--primary-dark, 348 48% 40%))',
        color: 'hsl(var(--primary-foreground, 40 38% 97%))'
      }
    },
    dark: {
      default: {
        background: 'hsl(var(--foreground, 60 8% 8%))',
        color: 'hsl(var(--background, 40 38% 97%))'
      },
      hover: {
        background: 'hsl(var(--primary, 348 46% 48%))',
        color: 'hsl(var(--primary-foreground, 40 38% 97%))'
      }
    },
    outline: {
      default: {
        background: 'transparent',
        color: 'hsl(var(--foreground, 60 8% 8%))',
        borderColor: 'hsl(var(--border, 36 18% 87%))'
      },
      hover: {
        background: 'hsl(var(--muted, 40 26% 93%))',
        color: 'hsl(var(--foreground, 60 8% 8%))',
        borderColor: 'hsl(var(--border, 36 18% 87%))'
      }
    },
    ghost: {
      default: {
        background: 'transparent',
        color: 'hsl(var(--foreground, 60 8% 8%))'
      },
      hover: {
        background: 'hsl(var(--muted, 40 26% 93%))',
        color: 'hsl(var(--foreground, 60 8% 8%))'
      }
    },
    secondary: {
      default: {
        background: 'hsl(var(--secondary, 155 20% 34%))',
        color: 'hsl(var(--secondary-foreground, 40 38% 97%))'
      },
      hover: {
        background: 'hsl(var(--secondary-dark, 155 18% 22%))',
        color: 'hsl(var(--secondary-foreground, 40 38% 97%))'
      }
    }
  };
  const v = variants[variant] || variants.primary;
  const variantStyle = hovered && !disabled ? v.hover : v.default;
  return /*#__PURE__*/React.createElement(Tag, {
    href: href,
    type: !href ? type : undefined,
    disabled: !href && disabled,
    onClick: disabled ? undefined : onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: {
      ...base,
      ...sizes[size],
      ...variantStyle
    }
  }, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
/**
 * Card — content presentation unit for articles, tools and section links.
 * Variants: insight (article preview), tool (management tool info), compact (sidebar list item).
 */
function Card({
  title,
  category,
  excerpt,
  readTime,
  href = '#',
  variant = 'insight',
  featured = false,
  index
}) {
  const [hovered, setHovered] = React.useState(false);
  if (variant === 'tool') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '20px 24px',
        borderRadius: '8px',
        background: 'hsl(var(--card, 40 55% 99%))',
        border: `1.5px solid hsl(var(--border, 36 18% 87%))`,
        borderColor: hovered ? 'hsl(var(--primary, 348 46% 48%))' : 'hsl(var(--border, 36 18% 87%))',
        transition: 'border-color 0.2s ease',
        cursor: 'pointer'
      },
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false)
    }, category && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '11px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: 'hsl(var(--secondary, 155 20% 34%))',
        marginBottom: '8px'
      }
    }, category), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-heading, "Poppins", sans-serif)',
        fontSize: '20px',
        fontWeight: 500,
        letterSpacing: '-0.02em',
        color: hovered ? 'hsl(var(--primary, 348 46% 48%))' : 'hsl(var(--foreground, 60 8% 8%))',
        transition: 'color 0.2s ease',
        marginBottom: excerpt ? '8px' : 0
      }
    }, title), excerpt && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '14px',
        lineHeight: 1.65,
        color: 'hsl(var(--muted-foreground, 40 6% 40%))'
      }
    }, excerpt));
  }
  if (variant === 'compact') {
    return /*#__PURE__*/React.createElement("article", {
      style: {
        borderTop: '1px solid hsl(var(--border, 36 18% 87%))',
        paddingTop: '20px',
        paddingBottom: '20px'
      }
    }, category && /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: '11px',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.2em',
        color: 'hsl(var(--secondary, 155 20% 34%))',
        marginBottom: '6px'
      }
    }, category, readTime ? ` · ${readTime}` : ''), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontFamily: 'var(--font-heading, "Poppins", sans-serif)',
        fontSize: '20px',
        fontWeight: 500,
        letterSpacing: '-0.02em',
        lineHeight: 1.3,
        color: hovered ? 'hsl(var(--primary, 348 46% 48%))' : 'hsl(var(--foreground, 60 8% 8%))',
        transition: 'color 0.2s ease',
        cursor: 'pointer'
      },
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false)
    }, title));
  }

  // Default: insight (featured article card)
  return /*#__PURE__*/React.createElement("article", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      borderLeft: featured ? `2px solid hsl(var(--primary, 348 46% 48%))` : 'none',
      paddingLeft: featured ? '28px' : '0'
    }
  }, category && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      color: 'hsl(var(--secondary, 155 20% 34%))',
      marginBottom: '14px'
    }
  }, category, readTime ? ` · ${readTime}` : ''), index !== undefined && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-heading, "Poppins", sans-serif)',
      fontSize: '18px',
      fontStyle: 'italic',
      color: 'hsl(var(--accent, 40 58% 62%))',
      marginBottom: '8px',
      letterSpacing: '-0.01em'
    }
  }, String(index).padStart(2, '0')), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading, "Poppins", sans-serif)',
      fontSize: featured ? '32px' : '20px',
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
      color: hovered ? 'hsl(var(--primary, 348 46% 48%))' : 'hsl(var(--foreground, 60 8% 8%))',
      transition: 'color 0.2s ease',
      marginBottom: '14px',
      cursor: 'pointer'
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  }, title), excerpt && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: featured ? '16px' : '14px',
      lineHeight: 1.7,
      color: 'hsl(var(--muted-foreground, 40 6% 40%))',
      marginBottom: '20px'
    }
  }, excerpt), /*#__PURE__*/React.createElement("a", {
    href: href,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '14px',
      fontWeight: 500,
      color: 'hsl(var(--primary, 348 46% 48%))',
      textDecoration: 'none',
      marginTop: 'auto'
    }
  }, "Ler o artigo \u2192"));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
/**
 * Tag — rounded pill chip for topic filters and tool names.
 * Outline by default; fills with forest sage color on hover.
 * Matches the "ferramentas cloud" pattern on the homepage.
 */
function Tag({
  children,
  href,
  filled = false,
  size = 'md',
  onClick,
  active = false
}) {
  const [hovered, setHovered] = React.useState(false);
  const Tag = href ? 'a' : 'button';
  const isActive = filled || active || hovered;
  const sizes = {
    sm: {
      padding: '5px 14px',
      fontSize: '13px'
    },
    md: {
      padding: '9px 20px',
      fontSize: '17px'
    },
    lg: {
      padding: '12px 28px',
      fontSize: '19px'
    }
  };
  const style = {
    display: 'inline-block',
    borderRadius: '9999px',
    border: `1.5px solid ${isActive ? 'hsl(var(--secondary, 155 20% 34%))' : 'hsl(var(--foreground, 60 8% 8%) / 0.25)'}`,
    background: isActive ? 'hsl(var(--secondary, 155 20% 34%))' : 'transparent',
    color: isActive ? 'hsl(var(--secondary-foreground, 40 38% 97%))' : 'hsl(var(--foreground, 60 8% 8%))',
    fontFamily: 'var(--font-heading, "Poppins", sans-serif)',
    fontWeight: 400,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease',
    lineHeight: 1,
    ...sizes[size]
  };
  return /*#__PURE__*/React.createElement(Tag, {
    href: href,
    onClick: onClick,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    style: style
  }, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// image-slot.js
try { (() => {
// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)
/* BEGIN USAGE */
/**
 * <image-slot> — user-fillable image placeholder.
 *
 * Drop this into a deck, mockup, or page wherever you want the user to
 * supply an image. You control the slot's shape and size; the user fills it
 * by dragging an image file onto it (or clicking to browse). The dropped
 * image persists across reloads via a .image-slots.state.json sidecar —
 * same read-via-fetch / write-via-window.omelette pattern as
 * design_canvas.jsx, so the filled slot shows on share links, downloaded
 * zips, and PPTX export. Outside the omelette runtime the slot is read-only.
 *
 * The host bridge only allows sidecar writes at the project root, so the
 * HTML that uses this component is assumed to live at the project root too
 * (same constraint as design_canvas.jsx).
 *
 * Attributes:
 *   id           Persistence key. REQUIRED for the drop to survive reload —
 *                every slot on the page needs a distinct id.
 *   shape        'rect' | 'rounded' | 'circle' | 'pill'   (default 'rounded')
 *                'circle' applies 50% border-radius; on a non-square slot
 *                that's an ellipse — set equal width and height for a true
 *                circle.
 *   radius       Corner radius in px for 'rounded'.       (default 12)
 *   mask         Any CSS clip-path value. Overrides `shape` — use this for
 *                hexagons, blobs, arbitrary polygons.
 *   fit          object-fit: cover | contain | fill.       (default 'cover')
 *                With cover (the default) double-clicking the filled slot
 *                enters a reframe mode: the whole image spills past the mask
 *                (translucent outside, opaque inside), drag to reposition,
 *                corner-drag to scale. The crop persists alongside the image
 *                in the sidecar. contain/fill stay static.
 *   position     object-position for fit=contain|fill.     (default '50% 50%')
 *   placeholder  Empty-state caption.                      (default 'Drop an image')
 *   src          Optional initial/fallback image URL. A user drop overrides
 *                it; clearing the drop reveals src again.
 *
 * Size and layout come from ordinary CSS on the element — width/height
 * inline or from a parent grid — so it composes with any layout.
 *
 * Usage:
 *   <image-slot id="hero"   style="width:800px;height:450px" shape="rounded" radius="20"
 *               placeholder="Drop a hero image"></image-slot>
 *   <image-slot id="avatar" style="width:120px;height:120px" shape="circle"></image-slot>
 *   <image-slot id="kite"   style="width:300px;height:300px"
 *               mask="polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"></image-slot>
 */
/* END USAGE */

(() => {
  const STATE_FILE = '.image-slots.state.json';
  // 2× a ~600px slot in a 1920-wide deck — retina-sharp without making the
  // sidecar enormous. A 1200px WebP at q=0.85 is ~150-300KB.
  const MAX_DIM = 1200;
  // Raster formats only. SVG is excluded (can carry script; createImageBitmap
  // on SVG blobs is inconsistent). GIF is excluded because the canvas
  // re-encode keeps only the first frame, so an animated GIF would silently
  // go still — better to reject than surprise.
  const ACCEPT = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

  // ── Shared sidecar store ────────────────────────────────────────────────
  // One fetch + immediate write-on-change for every <image-slot> on the
  // page. Reads via fetch() so viewing works anywhere the HTML and sidecar
  // are served together; writes go through window.omelette.writeFile, which
  // the host allowlists to *.state.json basenames only.
  const subs = new Set();
  let slots = {};
  // ids explicitly cleared before the sidecar fetch resolved — otherwise
  // the merge below can't tell "never set" from "just deleted" and would
  // resurrect the sidecar's stale value.
  const tombstones = new Set();
  let loaded = false;
  let loadP = null;
  function load() {
    if (loadP) return loadP;
    loadP = fetch(STATE_FILE).then(r => r.ok ? r.json() : null).then(j => {
      // Merge: sidecar loses to any in-memory change that raced ahead of
      // the fetch (drop or clear) so neither is clobbered by hydration.
      if (j && typeof j === 'object') {
        const merged = Object.assign({}, j, slots);
        // A framing-only write that raced ahead of hydration must not
        // drop a user image that's only on disk — inherit u from the
        // sidecar for any in-memory entry that lacks one.
        for (const k in slots) {
          if (merged[k] && !merged[k].u && j[k]) {
            merged[k].u = typeof j[k] === 'string' ? j[k] : j[k].u;
          }
        }
        for (const id of tombstones) delete merged[id];
        slots = merged;
      }
      tombstones.clear();
    }).catch(() => {}).then(() => {
      loaded = true;
      subs.forEach(fn => fn());
    });
    return loadP;
  }

  // Serialize writes so two near-simultaneous drops on different slots
  // can't reorder at the backend and leave the sidecar with only the
  // first. A save requested mid-flight just marks dirty and re-fires on
  // completion with the then-current slots.
  let saving = false;
  let saveDirty = false;
  function save() {
    if (saving) {
      saveDirty = true;
      return;
    }
    const w = window.omelette && window.omelette.writeFile;
    if (!w) return;
    saving = true;
    Promise.resolve(w(STATE_FILE, JSON.stringify(slots))).catch(() => {}).then(() => {
      saving = false;
      if (saveDirty) {
        saveDirty = false;
        save();
      }
    });
  }
  const S_MAX = 5;
  const clampS = s => Math.max(1, Math.min(S_MAX, s));

  // Normalize a stored slot value. Pre-reframe sidecars stored a bare
  // data-URL string; newer ones store {u, s, x, y}. Either shape is valid.
  function getSlot(id) {
    const v = slots[id];
    if (!v) return null;
    return typeof v === 'string' ? {
      u: v,
      s: 1,
      x: 0,
      y: 0
    } : v;
  }
  function setSlot(id, val) {
    if (!id) return;
    if (val) {
      slots[id] = val;
      tombstones.delete(id);
    } else {
      delete slots[id];
      if (!loaded) tombstones.add(id);
    }
    subs.forEach(fn => fn());
    // A drop is rare + high-value — write immediately so nav-away can't lose
    // it. Gate on the initial read so we don't overwrite a sidecar we haven't
    // merged yet; the merge in load() keeps this change once the read lands.
    if (loaded) save();else load().then(save);
  }

  // ── Image downscale ─────────────────────────────────────────────────────
  // Encode through a canvas so the sidecar carries resized bytes, not the
  // raw upload. Longest side is capped at 2× the slot's rendered width
  // (retina) and at MAX_DIM. WebP keeps alpha and is ~10× smaller than PNG
  // for photos, so there's no need for per-image format picking.
  async function toDataUrl(file, targetW) {
    const bitmap = await createImageBitmap(file);
    try {
      const cap = Math.min(MAX_DIM, Math.max(1, Math.round(targetW * 2)) || MAX_DIM);
      const scale = Math.min(1, cap / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
      return canvas.toDataURL('image/webp', 0.85);
    } finally {
      bitmap.close && bitmap.close();
    }
  }

  // ── Custom element ──────────────────────────────────────────────────────
  const stylesheet = ':host{display:inline-block;position:relative;vertical-align:top;' + '  font:13px/1.3 system-ui,-apple-system,sans-serif;color:rgba(0,0,0,.55);width:240px;height:160px}' + '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
  // .frame img (clipped) and .spill (unclipped ghost + handles) share the
  // same left/top/width/height in frame-%, computed by _applyView(), so the
  // inside-mask crop and the outside-mask spill stay pixel-aligned.
  '.frame img{position:absolute;max-width:none;transform:translate(-50%,-50%);' + '  -webkit-user-drag:none;user-select:none;touch-action:none}' +
  // Reframe mode (double-click): the full image spills past the mask. The
  // spill layer is sized to the IMAGE bounds so its corners are where the
  // resize handles belong. The ghost <img> inside is translucent; the real
  // clipped <img> underneath shows the opaque in-mask crop.
  '.spill{position:absolute;transform:translate(-50%,-50%);display:none;z-index:1;' + '  cursor:grab;touch-action:none}' + ':host([data-panning]) .spill{cursor:grabbing}' + '.spill .ghost{position:absolute;inset:0;width:100%;height:100%;opacity:.35;' + '  pointer-events:none;-webkit-user-drag:none;user-select:none;' + '  box-shadow:0 0 0 1px rgba(0,0,0,.2),0 12px 32px rgba(0,0,0,.2)}' + '.spill .handle{position:absolute;width:12px;height:12px;border-radius:50%;' + '  background:#fff;box-shadow:0 0 0 1.5px #c96442,0 1px 3px rgba(0,0,0,.3);' + '  transform:translate(-50%,-50%)}' + '.spill .handle[data-c=nw]{left:0;top:0;cursor:nwse-resize}' + '.spill .handle[data-c=ne]{left:100%;top:0;cursor:nesw-resize}' + '.spill .handle[data-c=sw]{left:0;top:100%;cursor:nesw-resize}' + '.spill .handle[data-c=se]{left:100%;top:100%;cursor:nwse-resize}' + ':host([data-reframe]){z-index:10}' + ':host([data-reframe]) .spill{display:block}' + ':host([data-reframe]) .frame{box-shadow:0 0 0 2px #c96442}' + '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;' + '  justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;' + '  cursor:pointer;user-select:none}' + '.empty svg{opacity:.45}' + '.empty .cap{max-width:90%;font-weight:500;letter-spacing:.01em}' + '.empty .sub{font-size:11px}' + '.empty .sub u{text-underline-offset:2px;text-decoration-color:rgba(0,0,0,.25)}' + '.empty:hover .sub u{color:rgba(0,0,0,.75);text-decoration-color:currentColor}' + ':host([data-over]) .frame{outline:2px solid #c96442;outline-offset:-2px;' + '  background:rgba(201,100,66,.10)}' + '.ring{position:absolute;inset:0;pointer-events:none;border:1.5px dashed rgba(0,0,0,.25);' + '  transition:border-color .12s}' + ':host([data-over]) .ring{border-color:#c96442}' + ':host([data-filled]) .ring{display:none}' +
  // Controls sit BELOW the mask (top:100%), absolutely positioned so the
  // author-declared slot height is unaffected. The gap is padding, not a
  // top offset, so the hover target stays contiguous with the frame.
  '.ctl{position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:8px;' + '  display:flex;gap:6px;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2;' + '  white-space:nowrap}' + ':host([data-filled][data-editable]:hover) .ctl,:host([data-reframe]) .ctl' + '  {opacity:1;pointer-events:auto}' + '.ctl button{appearance:none;border:0;border-radius:6px;padding:5px 10px;cursor:pointer;' + '  background:rgba(0,0,0,.65);color:#fff;font:11px/1 system-ui,-apple-system,sans-serif;' + '  backdrop-filter:blur(6px)}' + '.ctl button:hover{background:rgba(0,0,0,.8)}' + '.err{position:absolute;left:8px;bottom:8px;right:8px;color:#b3261e;font-size:11px;' + '  background:rgba(255,255,255,.85);padding:4px 6px;border-radius:5px;pointer-events:none}';
  const icon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>' + '<path d="m21 15-5-5L5 21"/></svg>';
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['shape', 'radius', 'mask', 'fit', 'position', 'placeholder', 'src', 'id'];
    }
    constructor() {
      super();
      const root = this.attachShadow({
        mode: 'open'
      });
      // .spill and .ctl sit OUTSIDE .frame so overflow:hidden + border-radius
      // on the frame (circle, pill, rounded) can't clip them.
      root.innerHTML = '<style>' + stylesheet + '</style>' + '<div class="frame" part="frame">' + '  <img part="image" alt="" draggable="false" style="display:none">' + '  <div class="empty" part="empty">' + icon + '    <div class="cap"></div>' + '    <div class="sub">or <u>browse files</u></div></div>' + '  <div class="ring" part="ring"></div>' + '</div>' + '<div class="spill">' + '  <img class="ghost" alt="" draggable="false">' + '  <div class="handle" data-c="nw"></div><div class="handle" data-c="ne"></div>' + '  <div class="handle" data-c="sw"></div><div class="handle" data-c="se"></div>' + '</div>' + '<div class="ctl"><button data-act="replace" title="Replace image">Replace</button>' + '  <button data-act="clear" title="Remove image">Remove</button></div>' + '<input type="file" accept="' + ACCEPT.join(',') + '" hidden>';
      this._frame = root.querySelector('.frame');
      this._ring = root.querySelector('.ring');
      this._img = root.querySelector('.frame img');
      this._empty = root.querySelector('.empty');
      this._cap = root.querySelector('.cap');
      this._sub = root.querySelector('.sub');
      this._spill = root.querySelector('.spill');
      this._ghost = root.querySelector('.ghost');
      this._err = null;
      this._input = root.querySelector('input');
      this._depth = 0;
      this._gen = 0;
      this._view = {
        s: 1,
        x: 0,
        y: 0
      };
      this._subFn = () => this._render();
      // Shadow-DOM listeners live with the shadow DOM — bound once here so
      // disconnect/reconnect (e.g. React remount) doesn't stack handlers.
      this._empty.addEventListener('click', () => this._input.click());
      root.addEventListener('click', e => {
        const act = e.target && e.target.getAttribute && e.target.getAttribute('data-act');
        if (act === 'replace') {
          this._exitReframe(true);
          this._input.click();
        }
        if (act === 'clear') {
          this._exitReframe(false);
          this._gen++;
          this._local = null;
          if (this.id) setSlot(this.id, null);else this._render();
        }
      });
      this._input.addEventListener('change', () => {
        const f = this._input.files && this._input.files[0];
        if (f) this._ingest(f);
        this._input.value = '';
      });
      // naturalWidth/Height aren't known until load — re-apply so the cover
      // baseline is computed from real dimensions, not the 100%×100% fallback.
      this._img.addEventListener('load', () => this._applyView());
      // Gated on editable + fit=cover so share links and contain/fill slots
      // stay static.
      this.addEventListener('dblclick', e => {
        if (!this.hasAttribute('data-editable') || !this._reframes()) return;
        e.preventDefault();
        if (this.hasAttribute('data-reframe')) this._exitReframe(true);else this._enterReframe();
      });
      // Pan + resize both originate on the spill layer. A handle pointerdown
      // drives an aspect-locked resize anchored at the opposite corner; any
      // other pointerdown on the spill pans. Offsets are frame-% so a
      // reframed slot survives responsive resize / PPTX export.
      this._spill.addEventListener('pointerdown', e => {
        if (e.button !== 0 || !this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        e.stopPropagation();
        this._spill.setPointerCapture(e.pointerId);
        const rect = this.getBoundingClientRect();
        const fw = rect.width || 1,
          fh = rect.height || 1;
        const corner = e.target.getAttribute && e.target.getAttribute('data-c');
        let move;
        if (corner) {
          // Resize about the OPPOSITE corner. Viewport-px throughout (rect
          // fw/fh, not clientWidth) so the math survives a transform:scale()
          // ancestor — deck_stage renders slides scaled-to-fit.
          const iw = this._img.naturalWidth || 1,
            ih = this._img.naturalHeight || 1;
          const base = Math.max(fw / iw, fh / ih);
          const sx = corner.includes('e') ? 1 : -1;
          const sy = corner.includes('s') ? 1 : -1;
          const s0 = this._view.s;
          const w0 = iw * base * s0,
            h0 = ih * base * s0;
          const cx0 = (50 + this._view.x) / 100 * fw;
          const cy0 = (50 + this._view.y) / 100 * fh;
          const ox = cx0 - sx * w0 / 2,
            oy = cy0 - sy * h0 / 2;
          const diag0 = Math.hypot(w0, h0);
          const ux = sx * w0 / diag0,
            uy = sy * h0 / diag0;
          move = ev => {
            const proj = (ev.clientX - rect.left - ox) * ux + (ev.clientY - rect.top - oy) * uy;
            const s = clampS(s0 * proj / diag0);
            const d = diag0 * s / s0;
            this._view.s = s;
            this._view.x = (ox + ux * d / 2) / fw * 100 - 50;
            this._view.y = (oy + uy * d / 2) / fh * 100 - 50;
            this._clampView();
            this._applyView();
          };
        } else {
          this.setAttribute('data-panning', '');
          const start = {
            px: e.clientX,
            py: e.clientY,
            x: this._view.x,
            y: this._view.y
          };
          move = ev => {
            this._view.x = start.x + (ev.clientX - start.px) / fw * 100;
            this._view.y = start.y + (ev.clientY - start.py) / fh * 100;
            this._clampView();
            this._applyView();
          };
        }
        const up = () => {
          try {
            this._spill.releasePointerCapture(e.pointerId);
          } catch {}
          this._spill.removeEventListener('pointermove', move);
          this._spill.removeEventListener('pointerup', up);
          this._spill.removeEventListener('pointercancel', up);
          this.removeAttribute('data-panning');
          this._dragUp = null;
        };
        // Stashed so _exitReframe (Escape / outside-click mid-drag) can
        // tear the capture + listeners down synchronously.
        this._dragUp = up;
        this._spill.addEventListener('pointermove', move);
        this._spill.addEventListener('pointerup', up);
        this._spill.addEventListener('pointercancel', up);
      });
      // Wheel zoom stays available inside reframe mode as a trackpad nicety —
      // zooms toward the cursor (offset' = cursor·(1-k) + offset·k).
      this.addEventListener('wheel', e => {
        if (!this.hasAttribute('data-reframe')) return;
        e.preventDefault();
        const r = this.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width * 100 - 50;
        const cy = (e.clientY - r.top) / r.height * 100 - 50;
        const prev = this._view.s;
        const next = clampS(prev * Math.pow(1.0015, -e.deltaY));
        if (next === prev) return;
        const k = next / prev;
        this._view.s = next;
        this._view.x = cx * (1 - k) + this._view.x * k;
        this._view.y = cy * (1 - k) + this._view.y * k;
        this._clampView();
        this._applyView();
      }, {
        passive: false
      });
    }
    connectedCallback() {
      // Warn once per page — an id-less slot works for the session but
      // cannot persist, and two id-less slots would share nothing.
      if (!this.id && !ImageSlot._warned) {
        ImageSlot._warned = true;
        console.warn('<image-slot> without an id will not persist its dropped image.');
      }
      this.addEventListener('dragenter', this);
      this.addEventListener('dragover', this);
      this.addEventListener('dragleave', this);
      this.addEventListener('drop', this);
      subs.add(this._subFn);
      // width%/height% in _applyView encode the frame aspect at call time —
      // a host resize (responsive grid, pane divider) would stretch the
      // image until the next _render. Re-render on size change: _render()
      // re-seeds _view from stored before clamp/apply, so a shrink→grow
      // cycle round-trips instead of ratcheting x/y toward the narrower
      // frame's clamp range.
      this._ro = new ResizeObserver(() => this._render());
      this._ro.observe(this);
      load();
      this._render();
    }
    disconnectedCallback() {
      subs.delete(this._subFn);
      this.removeEventListener('dragenter', this);
      this.removeEventListener('dragover', this);
      this.removeEventListener('dragleave', this);
      this.removeEventListener('drop', this);
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      this._exitReframe(false);
    }
    _enterReframe() {
      if (this.hasAttribute('data-reframe')) return;
      this.setAttribute('data-reframe', '');
      this._applyView();
      // Close on click outside (the spill handler stopPropagation()s so
      // in-image drags don't reach this) and on Escape. Listeners are held
      // on the instance so _exitReframe / disconnectedCallback can detach
      // exactly what was attached.
      this._outside = e => {
        if (e.composedPath && e.composedPath().includes(this)) return;
        this._exitReframe(true);
      };
      this._esc = e => {
        if (e.key === 'Escape') this._exitReframe(true);
      };
      document.addEventListener('pointerdown', this._outside, true);
      document.addEventListener('keydown', this._esc, true);
    }
    _exitReframe(commit) {
      if (!this.hasAttribute('data-reframe')) return;
      if (this._dragUp) this._dragUp();
      this.removeAttribute('data-reframe');
      this.removeAttribute('data-panning');
      if (this._outside) document.removeEventListener('pointerdown', this._outside, true);
      if (this._esc) document.removeEventListener('keydown', this._esc, true);
      this._outside = this._esc = null;
      if (commit) this._commitView();
    }
    attributeChangedCallback() {
      if (this.shadowRoot) this._render();
    }

    // handleEvent — one listener object for all four drag events keeps the
    // add/remove symmetric and the depth counter correct.
    handleEvent(e) {
      if (e.type === 'dragenter' || e.type === 'dragover') {
        // Without preventDefault the browser never fires 'drop'.
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        if (e.type === 'dragenter') this._depth++;
        this.setAttribute('data-over', '');
      } else if (e.type === 'dragleave') {
        // dragenter/leave fire for every descendant crossing — count depth
        // so hovering the icon inside the empty state doesn't flicker.
        if (--this._depth <= 0) {
          this._depth = 0;
          this.removeAttribute('data-over');
        }
      } else if (e.type === 'drop') {
        e.preventDefault();
        e.stopPropagation();
        this._depth = 0;
        this.removeAttribute('data-over');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) this._ingest(f);
      }
    }
    async _ingest(file) {
      this._setError(null);
      if (!file || ACCEPT.indexOf(file.type) < 0) {
        this._setError('Drop a PNG, JPEG, WebP, or AVIF image.');
        return;
      }
      // toDataUrl can take hundreds of ms on a large photo. A Clear or a
      // newer drop during that window would be clobbered when this await
      // resumes — bump + capture a generation so stale encodes bail.
      const gen = ++this._gen;
      try {
        const w = this.clientWidth || this.offsetWidth || MAX_DIM;
        const url = await toDataUrl(file, w);
        if (gen !== this._gen) return;
        // Only exit reframe once the new image is in hand — a rejected type
        // or decode failure leaves the in-progress crop untouched.
        this._exitReframe(false);
        const val = {
          u: url,
          s: 1,
          x: 0,
          y: 0
        };
        setSlot(this.id || '', val);
        // Keep a session-local copy for id-less slots so the drop still
        // shows, even though it cannot persist.
        if (!this.id) {
          this._local = val;
          this._render();
        }
      } catch (err) {
        if (gen !== this._gen) return;
        this._setError('Could not read that image.');
        console.warn('<image-slot> ingest failed:', err);
      }
    }
    _setError(msg) {
      if (this._err) {
        this._err.remove();
        this._err = null;
      }
      if (!msg) return;
      const d = document.createElement('div');
      d.className = 'err';
      d.textContent = msg;
      this.shadowRoot.appendChild(d);
      this._err = d;
      setTimeout(() => {
        if (this._err === d) {
          d.remove();
          this._err = null;
        }
      }, 3000);
    }

    // Reframing (pan/resize) is only meaningful for fit=cover — contain/fill
    // keep the old object-fit path and double-click is a no-op.
    _reframes() {
      return this.hasAttribute('data-filled') && (this.getAttribute('fit') || 'cover') === 'cover';
    }

    // Cover-baseline geometry, shared by clamp/apply/resize. Null until the
    // img has loaded (naturalWidth is 0 before that) or when the slot has no
    // layout box — ResizeObserver fires with a 0×0 rect under display:none,
    // and clamping against a degenerate 1×1 frame would silently pull the
    // stored pan toward zero.
    _geom() {
      const iw = this._img.naturalWidth,
        ih = this._img.naturalHeight;
      const fw = this.clientWidth,
        fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) return null;
      return {
        iw,
        ih,
        fw,
        fh,
        base: Math.max(fw / iw, fh / ih)
      };
    }
    _clampView() {
      // Pan range on each axis is half the overflow past the frame edge.
      const g = this._geom();
      if (!g) return;
      const mx = Math.max(0, (g.iw * g.base * this._view.s / g.fw - 1) * 50);
      const my = Math.max(0, (g.ih * g.base * this._view.s / g.fh - 1) * 50);
      this._view.x = Math.max(-mx, Math.min(mx, this._view.x));
      this._view.y = Math.max(-my, Math.min(my, this._view.y));
    }
    _applyView() {
      const g = this._geom();
      const fit = this.getAttribute('fit') || 'cover';
      if (fit !== 'cover' || !g) {
        // Non-cover, or dimensions not known yet (before img load).
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        this._img.style.objectFit = fit;
        this._img.style.objectPosition = this.getAttribute('position') || '50% 50%';
        return;
      }
      // Cover baseline: img fills the frame on its tighter axis at s=1, so
      // pan works immediately on the overflowing axis without zooming first.
      // Width/height and left/top are all frame-% — depends only on the
      // frame aspect ratio, so a responsive resize keeps the same crop. The
      // spill layer mirrors the same box so its corners = image corners.
      const k = g.base * this._view.s;
      const w = g.iw * k / g.fw * 100 + '%';
      const h = g.ih * k / g.fh * 100 + '%';
      const l = 50 + this._view.x + '%';
      const t = 50 + this._view.y + '%';
      this._img.style.width = w;
      this._img.style.height = h;
      this._img.style.left = l;
      this._img.style.top = t;
      this._img.style.objectFit = '';
      this._spill.style.width = w;
      this._spill.style.height = h;
      this._spill.style.left = l;
      this._spill.style.top = t;
    }
    _commitView() {
      const v = {
        s: this._view.s,
        x: this._view.x,
        y: this._view.y
      };
      if (this._userUrl) v.u = this._userUrl;
      // Framing-only (no u) persists too so an author-src slot remembers its
      // crop; clearing the sidecar still falls through to src=.
      if (this.id) setSlot(this.id, v);else {
        this._local = v;
      }
    }
    _render() {
      // Shape / mask. Presets use border-radius so the dashed ring can
      // follow the rounded outline; clip-path is only applied for an
      // explicit `mask` (the ring is hidden there since a rectangle
      // dashed border chopped by an arbitrary polygon looks broken).
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';else if (shape === 'pill') radius = '9999px';else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._ring.style.borderRadius = mask ? '' : radius;
      this._ring.style.display = mask ? 'none' : '';

      // Controls and reframe entry gate on this so share links stay read-only.
      const editable = !!(window.omelette && window.omelette.writeFile);
      this.toggleAttribute('data-editable', editable);
      this._sub.style.display = editable ? '' : 'none';

      // Content. The sidecar is also writable by the agent's write_file
      // tool, so its value isn't guaranteed canvas-originated — only accept
      // data:image/ URLs from it. The `src` attribute is author-controlled
      // (Claude wrote it into the HTML) so it passes through unchanged.
      let stored = this.id ? getSlot(this.id) : this._local;
      if (stored && stored.u && !/^data:image\//i.test(stored.u)) stored = null;
      const srcAttr = this.getAttribute('src') || '';
      this._userUrl = stored && stored.u || null;
      const url = this._userUrl || srcAttr;
      // Don't clobber an in-flight reframe with a store-triggered re-render.
      if (!this.hasAttribute('data-reframe')) {
        this._view = {
          s: stored && Number.isFinite(stored.s) ? clampS(stored.s) : 1,
          x: stored && Number.isFinite(stored.x) ? stored.x : 0,
          y: stored && Number.isFinite(stored.y) ? stored.y : 0
        };
      }
      this._cap.textContent = this.getAttribute('placeholder') || 'Drop an image';
      // Toggle via style.display — the [hidden] attribute alone loses to
      // the display:flex / display:block rules in the stylesheet above.
      if (url) {
        if (this._img.getAttribute('src') !== url) {
          this._img.src = url;
          this._ghost.src = url;
        }
        this._img.style.display = 'block';
        this._empty.style.display = 'none';
        this.setAttribute('data-filled', '');
        this._clampView();
        this._applyView();
      } else {
        this._img.style.display = 'none';
        this._img.removeAttribute('src');
        this._ghost.removeAttribute('src');
        this._empty.style.display = 'flex';
        this.removeAttribute('data-filled');
      }
    }
  }
  if (!customElements.get('image-slot')) {
    customElements.define('image-slot', ImageSlot);
  }
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "image-slot.js", error: String((e && e.message) || e) }); }

// reels-app.jsx
try { (() => {
// reels-app.jsx — controlador: seletor de direção, palco escalado, transporte.
// Loop contínuo com reagendamento da trilha a cada volta; troca de direção ao vivo.
const {
  RW,
  RH,
  FONT,
  ASTER,
  PAL
} = window.RX;
const {
  TimelineContext,
  clamp
} = window;
const DUR = 15;
function ReelsApp() {
  const ORDER = ['A', 'B', 'C'];
  const [dirId, setDirId] = React.useState(() => {
    try {
      const v = localStorage.getItem('apf-reels-dir');
      return ORDER.includes(v) ? v : 'A';
    } catch {
      return 'A';
    }
  });
  const [started, setStarted] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [muted, setMuted] = React.useState(false);
  const [scale, setScale] = React.useState(0.4);
  const dir = window.REELS[dirId];
  const wrapRef = React.useRef(null);
  const audioRef = React.useRef(null);
  const startPerf = React.useRef(0);
  const loopRef = React.useRef(0);
  const rafRef = React.useRef(null);
  const intRef = React.useRef(null);
  const dirRef = React.useRef(dirId);
  dirRef.current = dirId;

  // escala para caber
  React.useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      setScale(Math.max(0.1, Math.min(el.clientWidth / RW, el.clientHeight / RH)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  const scheduleAudio = React.useCallback(() => {
    const d = window.REELS[dirRef.current];
    if (audioRef.current && d) audioRef.current.schedule(d.EVENTS);
  }, []);
  const tick = React.useCallback(() => {
    const elapsed = (performance.now() - startPerf.current) / 1000;
    const lp = Math.floor(elapsed / DUR);
    if (lp !== loopRef.current) {
      loopRef.current = lp;
      scheduleAudio();
    }
    setTime(elapsed - lp * DUR);
  }, [scheduleAudio]);
  const loop = React.useCallback(() => {
    tick();
    rafRef.current = requestAnimationFrame(loop);
  }, [tick]);

  // arranca a partir de um instante de performance.now() (rAF + fallback setInterval)
  const runFrom = React.useCallback(perfStart => {
    startPerf.current = perfStart;
    loopRef.current = Math.floor((performance.now() - perfStart) / 1000 / DUR);
    cancelAnimationFrame(rafRef.current);
    clearInterval(intRef.current);
    rafRef.current = requestAnimationFrame(loop);
    intRef.current = setInterval(tick, 33); // fallback p/ quando rAF congela (aba em 2º plano)
  }, [loop, tick]);
  const beginPlayback = React.useCallback(() => {
    scheduleAudio();
    runFrom(performance.now());
  }, [runFrom, scheduleAudio]);
  const start = React.useCallback(() => {
    if (!audioRef.current) audioRef.current = new window.TeaserAudio();
    audioRef.current.init();
    if (audioRef.current.ctx.state === 'suspended') audioRef.current.ctx.resume();
    audioRef.current.setMuted(muted);
    setStarted(true);
    setPlaying(true);
    beginPlayback();
  }, [beginPlayback, muted]);
  const togglePlay = React.useCallback(() => {
    setPlaying(p => {
      const np = !p;
      if (np) {
        runFrom(performance.now() - time * 1000);
      } else {
        cancelAnimationFrame(rafRef.current);
        clearInterval(intRef.current);
      }
      return np;
    });
  }, [runFrom, time]);
  const toggleMute = () => setMuted(m => {
    const nm = !m;
    if (audioRef.current) audioRef.current.setMuted(nm);
    return nm;
  });
  const pickDir = id => {
    setDirId(id);
    try {
      localStorage.setItem('apf-reels-dir', id);
    } catch {}
    dirRef.current = id;
    setTime(0);
    if (started && playing) {
      beginPlayback();
    } else if (started) {
      setTime(0);
    }
  };
  React.useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(intRef.current);
  }, []);
  const ctx = {
    time,
    duration: DUR,
    playing: started && playing
  };
  const Comp = dir.Comp;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: '#0b0b0c',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: FONT,
      color: '#f3efe6'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      padding: '18px 22px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: PAL.honey,
      fontSize: 18
    }
  }, ASTER), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: '0.02em'
    }
  }, "Reels \xB7 Ana Paula Fi\xF3rio"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: 'rgba(243,239,230,0.5)'
    }
  }, "9:16 \xB7 15s \xB7 3 dire\xE7\xF5es")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, ORDER.map(id => {
    const d = window.REELS[id];
    const active = id === dirId;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => pickDir(id),
      style: {
        textAlign: 'left',
        cursor: 'pointer',
        borderRadius: 12,
        padding: '9px 16px',
        border: `1px solid ${active ? PAL.honey : 'rgba(255,255,255,0.14)'}`,
        background: active ? 'rgba(212,168,90,0.14)' : 'rgba(255,255,255,0.04)',
        color: '#f3efe6',
        fontFamily: FONT,
        transition: 'all 140ms'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 18,
        height: 18,
        borderRadius: 5,
        background: d.bg,
        display: 'inline-block',
        border: '1px solid rgba(255,255,255,0.2)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 600
      }
    }, d.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: active ? 'rgba(243,239,230,0.7)' : 'rgba(243,239,230,0.45)',
        marginTop: 4
      }
    }, d.desc));
  }))), /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      flex: 1,
      minHeight: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: '4px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: RW,
      height: RH,
      position: 'relative',
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      background: dir.bg,
      overflow: 'hidden',
      flexShrink: 0,
      borderRadius: 2,
      boxShadow: '0 30px 80px rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement(TimelineContext.Provider, {
    value: ctx
  }, /*#__PURE__*/React.createElement(Comp, {
    key: dirId
  })), !started && /*#__PURE__*/React.createElement("div", {
    onClick: start,
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 120,
      cursor: 'pointer',
      background: 'linear-gradient(180deg, rgba(11,12,12,0.45), rgba(11,12,12,0.78))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      textAlign: 'center',
      padding: '0 80px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 96,
      color: PAL.honeyLt
    }
  }, ASTER), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      fontSize: 96,
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 0.98
    }
  }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: PAL.honeyLt
    }
  }, "Fi\xF3rio")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26,
      fontSize: 34,
      letterSpacing: '0.26em',
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.7)'
    }
  }, "Reels \xB7 15s \xB7 com som"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 70,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 20,
      background: PAL.bordeaux,
      padding: '32px 70px',
      borderRadius: 9999,
      fontSize: 46,
      fontWeight: 600,
      boxShadow: '0 24px 54px rgba(179,66,89,0.4)'
    }
  }, "\u25B6 Tocar com som")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0,
      padding: '12px 22px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: started ? togglePlay : start,
    style: btn
  }, !started ? '▶ Tocar' : playing ? '⏸ Pausar' : '▶ Tocar'), /*#__PURE__*/React.createElement("button", {
    onClick: toggleMute,
    style: btn
  }, muted ? '🔇 Som off' : '🔊 Som on'), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280,
      maxWidth: '42vw',
      height: 5,
      borderRadius: 3,
      background: 'rgba(255,255,255,0.14)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${time / DUR * 100}%`,
      background: PAL.honey,
      transition: 'width 60ms linear'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      color: 'rgba(243,239,230,0.55)',
      width: 78,
      textAlign: 'right'
    }
  }, time.toFixed(1), "s / ", DUR, "s")));
}
const btn = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: '#f3efe6',
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 500,
  padding: '10px 18px',
  borderRadius: 9999,
  cursor: 'pointer'
};
window.ReelsApp = ReelsApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "reels-app.jsx", error: String((e && e.message) || e) }); }

// reels-dir-a.jsx
try { (() => {
// reels-dir-a.jsx — DIREÇÃO A · "Editorial suave"
// Papel creme, tipografia editorial, ritmo calmo, numerais em mel, ✳.
const A = (() => {
  const {
    Sprite,
    Easing,
    clamp,
    useSprite,
    useTime
  } = window;
  const {
    PAL,
    FONT,
    ASTER,
    outQuint,
    useFade,
    slamAt,
    riseUp,
    MediaReveal,
    Grain,
    Flash,
    FadeEdge,
    CTAPill,
    BioCue
  } = window.RX;
  const EVENTS = [{
    t: 0.15,
    fn: 'boom',
    opts: {
      f: 140,
      drop: 46,
      vol: 0.7
    }
  }, {
    t: 0.35,
    fn: 'shimmer',
    opts: {
      vol: 0.22
    }
  }, {
    t: 3.55,
    fn: 'whoosh',
    opts: {
      from: 220,
      to: 1800,
      dur: 0.5,
      vol: 0.34
    }
  }, {
    t: 3.70,
    fn: 'shimmer',
    opts: {
      vol: 0.24
    }
  }, {
    t: 7.45,
    fn: 'tick',
    opts: {
      f2: 262
    }
  }, {
    t: 8.20,
    fn: 'tick',
    opts: {
      f2: 330
    }
  }, {
    t: 8.95,
    fn: 'tick',
    opts: {
      f2: 392
    }
  }, {
    t: 11.15,
    fn: 'boom',
    opts: {
      f: 150,
      drop: 44,
      vol: 0.78
    }
  }, {
    t: 11.20,
    fn: 'shimmer',
    opts: {
      vol: 0.26
    }
  }, {
    t: 12.70,
    fn: 'tick',
    opts: {
      f2: 440,
      vol: 0.4
    }
  }];
  const IMPACTS = [0.15, 11.15];

  // FASE 1 — gancho editorial
  function P1() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.01, 0.3);
    const ap = clamp((localTime - 0.15) / 0.4, 0, 1);
    const line = clamp((localTime - 0.4) / 0.7, 0, 1);
    const L = (txt, st, em) => /*#__PURE__*/React.createElement("div", {
      style: {
        overflow: 'hidden',
        paddingBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        transform: `translateY(${riseUp(localTime, st, 0.62)}%)`,
        fontSize: 96,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        lineHeight: 1.04,
        color: em ? PAL.bordeaux : PAL.ink,
        fontStyle: em ? 'italic' : 'normal'
      }
    }, txt));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        top: 380,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 88,
        color: PAL.honey,
        opacity: ap,
        transform: `scale(${Easing.easeOutBack(ap)})`,
        lineHeight: 1,
        marginBottom: 36
      }
    }, ASTER), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 220 * outQuint(line),
        height: 2,
        background: PAL.honey,
        opacity: 0.7,
        marginBottom: 48
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: FONT
      }
    }, L('Aprender só vale', 0.55), L('quando muda o jeito', 0.74), L('de trabalhar.', 0.93, true))));
  }

  // FASE 2 — retrato + nome
  function P2() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.18, 0.28);
    const nm = slamAt(localTime, 0.55, 0.4);
    const role = clamp((localTime - 0.9) / 0.5, 0, 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        right: 96,
        top: 1320,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...nm
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 104,
        fontWeight: 700,
        letterSpacing: '-0.035em',
        lineHeight: 0.98,
        color: PAL.ink
      }
    }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
      style: {
        fontStyle: 'italic',
        color: PAL.bordeaux
      }
    }, "Fi\xF3rio"))), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '30px 0 0',
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: PAL.sage,
        opacity: role
      }
    }, "Educa\xE7\xE3o corporativa \xB7 Lideran\xE7a \xB7 Comunica\xE7\xE3o")));
  }

  // FASE 3 — o que tem no portal (numerais editoriais)
  const ITEMS = [{
    n: '01',
    t: 'Trilha de liderança',
    s: '7 temas, um método'
  }, {
    n: '02',
    t: 'Laboratório de dinâmicas',
    s: '15+ atividades prontas'
  }, {
    n: '03',
    t: 'Biblioteca curada',
    s: 'livros e materiais'
  }];
  function P3() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.14, 0.24);
    const head = clamp((localTime - 0.1) / 0.5, 0, 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        right: 96,
        top: 420,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 46,
        fontWeight: 500,
        color: PAL.inkSoft,
        opacity: head,
        transform: `translateY(${(1 - head) * 18}px)`,
        letterSpacing: '-0.01em'
      }
    }, "Um portal de uso profissional:"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        marginTop: 72
      }
    }, ITEMS.map((it, i) => {
      const st = 0.45 + i * 0.75;
      const s = slamAt(localTime, st, 0.3);
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'baseline',
          gap: 36,
          ...s
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 64,
          fontWeight: 700,
          fontStyle: 'italic',
          color: PAL.honey,
          minWidth: 110,
          letterSpacing: '-0.02em'
        }
      }, it.n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: PAL.ink,
          lineHeight: 1.02
        }
      }, it.t), /*#__PURE__*/React.createElement("div", {
        style: {
          fontSize: 32,
          fontWeight: 400,
          color: PAL.muted,
          marginTop: 6
        }
      }, it.s)));
    }))));
  }

  // FASE 4 — tagline + CTA + assinatura
  function P4() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.04, 0.01);
    const tag = slamAt(localTime, 0.05, 0.4);
    const btn = slamAt(localTime, 1.55, 0.42);
    const arrow = Math.sin(Math.max(0, localTime - 1.8) * 3) * 6;
    const sign = clamp((localTime - 2.4) / 0.6, 0, 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.paper
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        right: 96,
        top: 430,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...tag
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        fontSize: 92,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        lineHeight: 1.03,
        color: PAL.ink
      }
    }, "Educa\xE7\xE3o que sai do slide e chega \xE0 ", /*#__PURE__*/React.createElement("em", {
      style: {
        fontStyle: 'italic',
        color: PAL.bordeaux
      }
    }, "pr\xE1tica."))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 80,
        ...btn
      }
    }, /*#__PURE__*/React.createElement(CTAPill, null, "Explorar o portal ", /*#__PURE__*/React.createElement("span", {
      style: {
        transform: `translateX(${arrow}px)`,
        fontSize: 44
      }
    }, "\u2192")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 36
      }
    }, /*#__PURE__*/React.createElement(BioCue, null)))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 250,
        textAlign: 'center',
        fontFamily: FONT,
        opacity: sign,
        transform: `translateY(${(1 - sign) * 16}px)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 38,
        color: PAL.honey
      }
    }, ASTER), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18,
        fontSize: 26,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: PAL.muted
      }
    }, "Ana Paula Fi\xF3rio")));
  }
  function Comp() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(MediaReveal, {
      slotId: "apf-foto",
      shape: "rounded",
      radius: 30,
      start: 3.4,
      end: 7.25,
      x: "50%",
      y: "40%",
      w: 620,
      h: 800,
      placeholder: "foto da Ana Paula",
      frameStyle: {
        boxShadow: '0 30px 70px rgba(60,30,30,0.18)',
        border: '1px solid hsl(36 18% 84%)'
      }
    }), /*#__PURE__*/React.createElement(Sprite, {
      start: 0,
      end: 3.45
    }, /*#__PURE__*/React.createElement(P1, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 3.4,
      end: 7.25
    }, /*#__PURE__*/React.createElement(P2, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 7.2,
      end: 11.05
    }, /*#__PURE__*/React.createElement(P3, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 11.0,
      end: 15
    }, /*#__PURE__*/React.createElement(P4, null)), /*#__PURE__*/React.createElement(Grain, {
      opacity: 0.05,
      blend: "multiply"
    }), /*#__PURE__*/React.createElement(Flash, {
      impacts: IMPACTS,
      max: 0.12
    }), /*#__PURE__*/React.createElement(FadeEdge, {
      color: PAL.paper,
      inEnd: 0.4,
      outStart: 14.4,
      outEnd: 15
    }));
  }
  return {
    id: 'A',
    name: 'Editorial',
    desc: 'Papel creme · tipografia · calmo',
    bg: PAL.paper,
    Comp,
    EVENTS,
    IMPACTS
  };
})();
window.REELS = window.REELS || {};
window.REELS.A = A;
})(); } catch (e) { __ds_ns.__errors.push({ path: "reels-dir-a.jsx", error: String((e && e.message) || e) }); }

// reels-dir-b.jsx
try { (() => {
// reels-dir-b.jsx — DIREÇÃO B · "Cinematográfico"
// Foto full-bleed com Ken Burns, fundo forest profundo, texto em blur-in,
// vinheta + grão, ritmo lento e premium. Mel como acento.
const B = (() => {
  const {
    Sprite,
    Easing,
    clamp,
    useSprite,
    useTime
  } = window;
  const {
    PAL,
    FONT,
    ASTER,
    outQuint,
    useFade,
    slamAt,
    MediaReveal,
    Grain,
    Vignette,
    Flash,
    FadeEdge,
    CTAPill,
    BioCue
  } = window.RX;
  const EVENTS = [{
    t: 0.30,
    fn: 'boom',
    opts: {
      f: 120,
      drop: 40,
      vol: 0.9
    }
  }, {
    t: 0.34,
    fn: 'sub',
    opts: {
      f: 54,
      dur: 1.6,
      vol: 0.5
    }
  }, {
    t: 0.55,
    fn: 'whoosh',
    opts: {
      from: 180,
      to: 1400,
      dur: 0.9,
      vol: 0.32
    }
  }, {
    t: 4.05,
    fn: 'whoosh',
    opts: {
      from: 1400,
      to: 300,
      dur: 0.5,
      vol: 0.34
    }
  }, {
    t: 4.20,
    fn: 'boom',
    opts: {
      f: 130,
      drop: 42,
      vol: 0.82
    }
  }, {
    t: 8.05,
    fn: 'boom',
    opts: {
      f: 165,
      drop: 38,
      vol: 1.0
    }
  }, {
    t: 8.10,
    fn: 'shimmer',
    opts: {
      vol: 0.3
    }
  }, {
    t: 8.10,
    fn: 'sub',
    opts: {
      f: 60,
      dur: 1.4,
      vol: 0.42
    }
  }, {
    t: 11.65,
    fn: 'boom',
    opts: {
      f: 145,
      drop: 44,
      vol: 0.85
    }
  }, {
    t: 11.70,
    fn: 'shimmer',
    opts: {
      vol: 0.28
    }
  }, {
    t: 13.10,
    fn: 'tick',
    opts: {
      f2: 392,
      vol: 0.36
    }
  }];
  const IMPACTS = [0.30, 4.20, 8.05, 11.65];

  // blur-in editorial (sobe + desfoca)
  function blurIn(localTime, start, dur = 0.7) {
    const p = clamp((localTime - start) / dur, 0, 1);
    const e = outQuint(p);
    return {
      opacity: clamp(p * 1.5, 0, 1),
      transform: `translateY(${(1 - e) * 46}px)`,
      filter: `blur(${(1 - e) * 16}px)`
    };
  }

  // FASE 1 — retrato full-bleed + assinatura inferior
  function P1() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.01, 0.3);
    const ap = clamp((localTime - 0.5) / 0.6, 0, 1);
    const nm = blurIn(localTime, 0.7, 0.8);
    const role = clamp((localTime - 1.3) / 0.6, 0, 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        right: 96,
        bottom: 360
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        fontSize: 64,
        color: PAL.honey,
        opacity: ap,
        transform: `scale(${Easing.easeOutBack(ap)})`,
        marginBottom: 26
      }
    }, ASTER), /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 108,
        fontWeight: 700,
        letterSpacing: '-0.035em',
        lineHeight: 0.96,
        color: PAL.cream,
        ...nm
      }
    }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
      style: {
        fontStyle: 'italic',
        color: PAL.honeyLt
      }
    }, "Fi\xF3rio")), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '28px 0 0',
        fontSize: 28,
        fontWeight: 600,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: PAL.mutedLt,
        opacity: role
      }
    }, "Educa\xE7\xE3o corporativa \xB7 Lideran\xE7a \xB7 Comunica\xE7\xE3o")));
  }

  // FASE 2 — manifesto sobre a foto escurecida
  function P2() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.12, 0.26);
    const l1 = blurIn(localTime, 0.15, 0.7);
    const l2 = blurIn(localTime, 0.7, 0.7);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(10,18,15,0.5) 0%, rgba(10,18,15,0.78) 100%)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        right: 96,
        top: 560
      }
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        margin: 0,
        fontSize: 112,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        lineHeight: 1.0,
        color: PAL.cream
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        ...l1
      }
    }, "Educa\xE7\xE3o"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        ...l1
      }
    }, "corporativa"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 8,
        ...l2
      }
    }, "que sai do slide."))));
  }

  // FASE 3 — "prática." gigante em sage sólido
  function P3() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.05, 0.28);
    const kick = clamp((localTime - 0.05) / 0.5, 0, 1);
    const slam = slamAt(localTime, 0.1, 0.42);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.sage900,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(1200px 1200px at 50% 44%, rgba(191,140,60,0.12), rgba(0,0,0,0) 64%)`
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        right: 96,
        top: 640
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 52,
        fontWeight: 500,
        color: PAL.mutedLt,
        opacity: kick,
        letterSpacing: '0.01em'
      }
    }, "e chega \xE0"), /*#__PURE__*/React.createElement("div", {
      style: {
        ...slam
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: '10px 0 0',
        fontSize: 250,
        fontWeight: 700,
        fontStyle: 'italic',
        letterSpacing: '-0.05em',
        lineHeight: 0.92,
        color: PAL.bordeauxLt
      }
    }, "pr\xE1tica."))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        bottom: 380,
        fontSize: 60,
        color: PAL.honey,
        opacity: kick
      }
    }, ASTER));
  }

  // FASE 4 — eixos + CTA + assinatura
  const AXES = ['Trilha de liderança', 'Laboratório de dinâmicas', 'Biblioteca curada'];
  function P4() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.05, 0.01);
    const head = clamp((localTime - 0.1) / 0.5, 0, 1);
    const btn = slamAt(localTime, 1.5, 0.42);
    const arrow = Math.sin(Math.max(0, localTime - 1.8) * 3) * 6;
    const sign = clamp((localTime - 2.4) / 0.6, 0, 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.sage900,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 96,
        right: 96,
        top: 470
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: 0,
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: PAL.honey,
        opacity: head
      }
    }, "O portal"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        marginTop: 44
      }
    }, AXES.map((a, i) => {
      const s = slamAt(localTime, 0.35 + i * 0.32, 0.3);
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          ...s
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: PAL.bordeauxLt,
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: PAL.cream,
          lineHeight: 1.04
        }
      }, a));
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 90,
        ...btn
      }
    }, /*#__PURE__*/React.createElement(CTAPill, {
      bg: PAL.bordeauxLt,
      fg: PAL.sage900
    }, "Explorar o portal ", /*#__PURE__*/React.createElement("span", {
      style: {
        transform: `translateX(${arrow}px)`,
        fontSize: 44
      }
    }, "\u2192")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 36
      }
    }, /*#__PURE__*/React.createElement(BioCue, {
      color: PAL.mutedLt,
      arrow: PAL.honeyLt
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 250,
        textAlign: 'center',
        opacity: sign,
        transform: `translateY(${(1 - sign) * 16}px)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 36,
        color: PAL.honey
      }
    }, ASTER), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 16,
        fontSize: 26,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: PAL.mutedLt
      }
    }, "Ana Paula Fi\xF3rio")));
  }
  function Comp() {
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        background: PAL.sageInk
      }
    }), /*#__PURE__*/React.createElement(MediaReveal, {
      slotId: "apf-foto",
      shape: "rect",
      radius: 0,
      start: 0,
      end: 8.05,
      x: "50%",
      y: "50%",
      w: 1080,
      h: 1920,
      kenBurns: true,
      fadeIn: 0.7,
      fadeOut: 0.45,
      dim: 1,
      placeholder: "foto ou v\xEDdeo da Ana Paula",
      zIndex: 2
    }), /*#__PURE__*/React.createElement(Sprite, {
      start: 0,
      end: 4.05
    }, /*#__PURE__*/React.createElement(P1, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 4.0,
      end: 8.05
    }, /*#__PURE__*/React.createElement(P2, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 8.0,
      end: 11.7
    }, /*#__PURE__*/React.createElement(P3, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 11.6,
      end: 15
    }, /*#__PURE__*/React.createElement(P4, null)), /*#__PURE__*/React.createElement(Vignette, {
      strength: 0.5
    }), /*#__PURE__*/React.createElement(Grain, {
      opacity: 0.08,
      blend: "overlay"
    }), /*#__PURE__*/React.createElement(Flash, {
      impacts: IMPACTS,
      color: "rgba(255,238,205,0.9)",
      max: 0.16
    }), /*#__PURE__*/React.createElement(FadeEdge, {
      color: "#000",
      inEnd: 0.6,
      outStart: 14.3,
      outEnd: 15
    }));
  }
  return {
    id: 'B',
    name: 'Cinematográfico',
    desc: 'Foto full-bleed · escuro · mood',
    bg: PAL.sage900,
    Comp,
    EVENTS,
    IMPACTS
  };
})();
window.REELS = window.REELS || {};
window.REELS.B = B;
})(); } catch (e) { __ds_ns.__errors.push({ path: "reels-dir-b.jsx", error: String((e && e.message) || e) }); }

// reels-dir-c.jsx
try { (() => {
// reels-dir-c.jsx — DIREÇÃO C · "Dinâmico / Punchy"
// Tipografia cinética, cortes rápidos, bordeaux × creme, shake nos beats,
// foto em recorte circular. Energia para feed.
const C3 = (() => {
  const {
    Sprite,
    Easing,
    clamp,
    useSprite,
    useTime
  } = window;
  const {
    PAL,
    FONT,
    ASTER,
    outQuint,
    useFade,
    slamAt,
    MediaReveal,
    Grain,
    Flash,
    FadeEdge,
    shakeOffset,
    BioCue
  } = window.RX;
  const EVENTS = [{
    t: 0.12,
    fn: 'boom',
    opts: {
      f: 160,
      drop: 48,
      vol: 0.9
    }
  }, {
    t: 0.85,
    fn: 'tick',
    opts: {
      f2: 247,
      vol: 0.42
    }
  }, {
    t: 1.45,
    fn: 'tick',
    opts: {
      f2: 294,
      vol: 0.44
    }
  }, {
    t: 2.05,
    fn: 'boom',
    opts: {
      f: 150,
      drop: 44,
      vol: 0.82
    }
  }, {
    t: 2.65,
    fn: 'whoosh',
    opts: {
      from: 300,
      to: 2200,
      dur: 0.4,
      vol: 0.4
    }
  }, {
    t: 2.80,
    fn: 'boom',
    opts: {
      f: 140,
      drop: 44,
      vol: 0.78
    }
  }, {
    t: 5.45,
    fn: 'whoosh',
    opts: {
      from: 400,
      to: 2600,
      dur: 0.35,
      vol: 0.42
    }
  }, {
    t: 5.55,
    fn: 'tick',
    opts: {
      f2: 330
    }
  }, {
    t: 6.85,
    fn: 'tick',
    opts: {
      f2: 392
    }
  }, {
    t: 8.15,
    fn: 'tick',
    opts: {
      f2: 440
    }
  }, {
    t: 9.50,
    fn: 'boom',
    opts: {
      f: 170,
      drop: 40,
      vol: 0.95
    }
  }, {
    t: 10.40,
    fn: 'boom',
    opts: {
      f: 150,
      drop: 44,
      vol: 0.85
    }
  }, {
    t: 11.85,
    fn: 'boom',
    opts: {
      f: 175,
      drop: 38,
      vol: 1.0
    }
  }, {
    t: 11.90,
    fn: 'shimmer',
    opts: {
      vol: 0.3
    }
  }, {
    t: 13.40,
    fn: 'tick',
    opts: {
      f2: 523,
      vol: 0.4
    }
  }];
  const IMPACTS = [0.12, 2.05, 2.80, 5.55, 6.85, 8.15, 9.50, 10.40, 11.85];

  // FASE 1 — gancho cinético em bordeaux
  function P1() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.01, 0.18);
    const W = (txt, st, big) => {
      const s = slamAt(localTime, st, 0.24);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          ...s,
          fontSize: big ? 200 : 150,
          fontWeight: 700,
          letterSpacing: '-0.045em',
          lineHeight: 0.9,
          color: big ? PAL.honeyLt : PAL.cream,
          fontStyle: big ? 'italic' : 'normal'
        }
      }, txt);
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.bordeaux,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 90,
        right: 90,
        top: 560,
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, W('DESENVOLVER', 0.1), W('GENTE', 0.7), W('de verdade.', 1.3, true)));
  }

  // FASE 2 — foto circular + nome + chips
  const CHIPS = ['Liderança', 'Comunicação', 'RH'];
  function P2() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.12, 0.2);
    const nm = slamAt(localTime, 0.7, 0.34);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.cream,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 1180,
        textAlign: 'center',
        padding: '0 90px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...nm
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        margin: 0,
        fontSize: 110,
        fontWeight: 700,
        letterSpacing: '-0.035em',
        lineHeight: 0.96,
        color: PAL.ink
      }
    }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
      style: {
        fontStyle: 'italic',
        color: PAL.bordeaux
      }
    }, "Fi\xF3rio"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 18,
        marginTop: 44
      }
    }, CHIPS.map((c, i) => {
      const s = slamAt(localTime, 1.15 + i * 0.18, 0.26);
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          ...s,
          fontSize: 34,
          fontWeight: 600,
          color: PAL.sage,
          border: `2px solid ${PAL.sage}`,
          borderRadius: 9999,
          padding: '14px 34px'
        }
      }, c);
    }))));
  }

  // FASE 3 — lista cinética (palavra gigante troca a cada beat)
  const BIG = [{
    w: 'TRILHA',
    s: '7 temas de liderança'
  }, {
    w: 'LABORATÓRIO',
    s: '15+ dinâmicas prontas'
  }, {
    w: 'BIBLIOTECA',
    s: 'curadoria de materiais'
  }];
  function P3() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.1, 0.18);
    const seg = 1.3;
    const idx = Math.min(BIG.length - 1, Math.floor(localTime / seg));
    const local = localTime - idx * seg;
    const s = slamAt(local, 0.0, 0.26);
    const it = BIG[idx];
    const alt = idx % 2 === 1;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: alt ? PAL.sage900 : PAL.cream,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 90,
        right: 90,
        top: 720
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 56,
        fontWeight: 700,
        fontStyle: 'italic',
        color: PAL.honey,
        marginBottom: 18,
        ...slamAt(local, 0.06, 0.26)
      }
    }, `0${idx + 1}`), /*#__PURE__*/React.createElement("div", {
      style: {
        ...s,
        fontSize: 168,
        fontWeight: 700,
        letterSpacing: '-0.05em',
        lineHeight: 0.9,
        color: alt ? PAL.cream : PAL.bordeaux
      }
    }, it.w), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24,
        fontSize: 44,
        fontWeight: 500,
        color: alt ? PAL.mutedLt : PAL.inkSoft,
        ...slamAt(local, 0.14, 0.3)
      }
    }, it.s)));
  }

  // FASE 4 — punch final
  function P4() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.04, 0.16);
    const l1 = slamAt(localTime, 0.05, 0.26);
    const l2 = slamAt(localTime, 0.62, 0.3);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.bordeaux,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 90,
        right: 90,
        top: 700
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        ...l1,
        fontSize: 168,
        fontWeight: 700,
        letterSpacing: '-0.05em',
        lineHeight: 0.9,
        color: PAL.cream
      }
    }, "SAI DO SLIDE."), /*#__PURE__*/React.createElement("div", {
      style: {
        ...l2,
        fontSize: 200,
        fontWeight: 700,
        fontStyle: 'italic',
        letterSpacing: '-0.05em',
        lineHeight: 0.9,
        color: PAL.honeyLt,
        marginTop: 10
      }
    }, "na pr\xE1tica.")));
  }

  // FASE 5 — CTA
  function P5() {
    const {
      localTime
    } = useSprite();
    const o = useFade(0.05, 0.01);
    const slam = slamAt(localTime, 0.1, 0.36);
    const arrow = Math.sin(Math.max(0, localTime - 0.6) * 3.4) * 7;
    const bio = clamp((localTime - 0.9) / 0.5, 0, 1);
    const sign = clamp((localTime - 1.7) / 0.6, 0, 1);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        opacity: o,
        background: PAL.cream,
        fontFamily: FONT
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 720,
        textAlign: 'center',
        padding: '0 90px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 54,
        color: PAL.honey,
        marginBottom: 30,
        ...slamAt(localTime, 0.0, 0.3)
      }
    }, ASTER), /*#__PURE__*/React.createElement("div", {
      style: {
        ...slam
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 20,
        background: PAL.bordeaux,
        color: '#fff',
        padding: '34px 64px',
        borderRadius: 9999,
        fontSize: 56,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        boxShadow: '0 24px 54px rgba(179,66,89,0.3)'
      }
    }, "EXPLORE O PORTAL ", /*#__PURE__*/React.createElement("span", {
      style: {
        transform: `translateX(${arrow}px)`,
        fontSize: 56
      }
    }, "\u2192"))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 48,
        opacity: bio,
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(BioCue, null))), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 250,
        textAlign: 'center',
        opacity: sign,
        transform: `translateY(${(1 - sign) * 16}px)`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 28,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: PAL.muted
      }
    }, "Ana Paula Fi\xF3rio")));
  }
  function Comp() {
    const time = useTime();
    const sh = shakeOffset(time, IMPACTS);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        transform: `translate(${sh.x}px, ${sh.y}px)`
      }
    }, /*#__PURE__*/React.createElement(MediaReveal, {
      slotId: "apf-foto",
      shape: "circle",
      radius: 0,
      start: 2.6,
      end: 5.4,
      x: "50%",
      y: "34%",
      w: 620,
      h: 620,
      kenBurns: true,
      fadeIn: 0.35,
      fadeOut: 0.3,
      placeholder: "foto da Ana Paula",
      frameStyle: {
        boxShadow: '0 24px 60px rgba(60,30,30,0.22)'
      }
    }), /*#__PURE__*/React.createElement(Sprite, {
      start: 0,
      end: 2.65
    }, /*#__PURE__*/React.createElement(P1, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 2.6,
      end: 5.45
    }, /*#__PURE__*/React.createElement(P2, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 5.4,
      end: 9.5
    }, /*#__PURE__*/React.createElement(P3, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 9.45,
      end: 11.85
    }, /*#__PURE__*/React.createElement(P4, null)), /*#__PURE__*/React.createElement(Sprite, {
      start: 11.8,
      end: 15
    }, /*#__PURE__*/React.createElement(P5, null)), /*#__PURE__*/React.createElement(Grain, {
      opacity: 0.05,
      blend: "overlay"
    }), /*#__PURE__*/React.createElement(Flash, {
      impacts: IMPACTS,
      max: 0.14
    }), /*#__PURE__*/React.createElement(FadeEdge, {
      color: PAL.bordeaux,
      inEnd: 0.35,
      outStart: 14.5,
      outEnd: 15
    }));
  }
  return {
    id: 'C',
    name: 'Dinâmico',
    desc: 'Kinetic type · cortes rápidos · energia',
    bg: PAL.bordeaux,
    Comp,
    EVENTS,
    IMPACTS
  };
})();
window.REELS = window.REELS || {};
window.REELS.C = C3;
})(); } catch (e) { __ds_ns.__errors.push({ path: "reels-dir-c.jsx", error: String((e && e.message) || e) }); }

// reels-shared.jsx
try { (() => {
// reels-shared.jsx — base compartilhada dos Reels verticais (1080×1920)
// Paleta, fontes, dimensões, helpers de animação, overlays e o slot de mídia.
// Reusa window.Sprite / Easing / clamp / useSprite / useTime do animations.jsx.

const {
  Easing,
  clamp
} = window;

// ── Dimensões (Reels / Stories 9:16) ─────────────────────────────────────
const RW = 1080,
  RH = 1920;
const PADX = 96; // margem lateral segura
const SAFE_TOP = 250,
  SAFE_BOT = 320; // zonas de UI do Instagram

const FONT = "'Poppins', system-ui, sans-serif";
const ASTER = '\u2733'; // ✳ marca

// ── Paleta (do design system Bordeaux + Sage + Mel) ───────────────────────
const PAL = {
  cream: 'hsl(40 38% 97%)',
  paper: 'hsl(40 30% 95%)',
  paperWarm: 'hsl(40 34% 92%)',
  ink: 'hsl(60 8% 9%)',
  inkSoft: 'hsl(45 7% 28%)',
  bordeaux: 'hsl(348 46% 48%)',
  bordeauxDk: 'hsl(348 48% 40%)',
  bordeauxLt: 'hsl(348 52% 66%)',
  sage: 'hsl(155 20% 34%)',
  sage800: 'hsl(155 18% 19%)',
  sage900: 'hsl(155 16% 12%)',
  sageInk: 'hsl(150 14% 9%)',
  honey: 'hsl(40 60% 60%)',
  honeyLt: 'hsl(40 68% 74%)',
  muted: 'hsl(40 6% 46%)',
  mutedLt: 'hsl(40 14% 70%)'
};
const outQuint = t => 1 - Math.pow(1 - t, 5);

// fade de entrada/saída relativo ao Sprite
function useFade(inDur = 0.18, outDur = 0.3) {
  const {
    localTime,
    duration
  } = window.useSprite();
  let o = 1;
  if (localTime < inDur) o = clamp(localTime / inDur, 0, 1);
  if (localTime > duration - outDur) o = Math.min(o, 1 - clamp((localTime - (duration - outDur)) / outDur, 0, 1));
  return o;
}
// "golpe" — entra com escala + blur que assenta
function slamAt(localTime, start, dur = 0.32) {
  const p = clamp((localTime - start) / dur, 0, 1);
  const e = outQuint(p);
  return {
    opacity: clamp(p * 1.7, 0, 1),
    transform: `scale(${1.14 - 0.14 * e})`,
    filter: `blur(${(1 - e) * 12}px)`
  };
}
// sobe de baixo de uma máscara (palavra editorial)
function riseUp(localTime, start, dur = 0.6) {
  const p = clamp((localTime - start) / dur, 0, 1);
  return (1 - outQuint(p)) * 115; // % translateY
}

// ── Container vertical centralizado, respeitando zonas seguras ────────────
function Stack({
  children,
  justify = 'center',
  align = 'flex-start',
  padX = PADX,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: SAFE_TOP,
      bottom: SAFE_BOT,
      padding: `0 ${padX}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: align,
      fontFamily: FONT,
      ...style
    }
  }, children);
}

// poça de luz radial sobre uma base
function Pool({
  x = '50%',
  y = '42%',
  size = 1100,
  color,
  base
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(${size}px ${size}px at ${x} ${y}, ${color}, rgba(0,0,0,0) 64%), ${base}`
    }
  });
}

// ── Slot de mídia (foto/vídeo real, arrastável) ───────────────────────────
// Fica SEMPRE montado dentro da direção (fora de <Sprite>) para o <image-slot>
// não remontar a cada loop. A janela [start,end] controla opacidade/transform.
function MediaReveal({
  slotId,
  shape = 'rounded',
  radius = 28,
  mask,
  start,
  end,
  x = '50%',
  y = '50%',
  w,
  h,
  kenBurns = true,
  fadeIn = 0.5,
  fadeOut = 0.4,
  placeholder = 'arraste foto ou vídeo',
  frameStyle = {},
  dim = 0,
  zIndex = 5
}) {
  const time = window.useTime();
  const local = time - start;
  const span = end - start;
  let opacity = 0,
    scale = 1;
  if (local >= -0.001 && local <= span) {
    if (local < fadeIn) {
      const t = Easing.easeOutCubic(clamp(local / fadeIn, 0, 1));
      opacity = t;
      scale = 1.02 - 0.02 * t;
    } else if (local > span - fadeOut) {
      const t = Easing.easeInCubic(clamp((local - (span - fadeOut)) / fadeOut, 0, 1));
      opacity = 1 - t;
      scale = 1 + (kenBurns ? 0.05 : 0) + 0.015 * t;
    } else {
      opacity = 1;
      const hs = span - fadeIn - fadeOut;
      const ht = hs > 0 ? (local - fadeIn) / hs : 0;
      scale = 1 + (kenBurns ? 0.05 * ht : 0);
    }
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      transform: `translate(-50%,-50%) scale(${scale})`,
      transformOrigin: 'center',
      opacity,
      pointerEvents: opacity > 0.9 ? 'auto' : 'none',
      overflow: 'hidden',
      borderRadius: shape === 'circle' ? '50%' : shape === 'pill' ? 9999 : radius,
      zIndex,
      ...frameStyle
    }
  }, /*#__PURE__*/React.createElement("image-slot", {
    id: slotId,
    shape: shape,
    radius: String(radius),
    mask: mask,
    placeholder: placeholder,
    style: {
      width: '100%',
      height: '100%',
      display: 'block'
    }
  }), dim > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: `linear-gradient(180deg, rgba(10,12,11,${dim * 0.55}) 0%, rgba(10,12,11,${dim * 0.1}) 38%, rgba(10,12,11,${dim * 0.35}) 72%, rgba(10,12,11,${dim * 0.9}) 100%)`
    }
  }));
}

// ── Overlays globais ──────────────────────────────────────────────────────
function Grain({
  opacity = 0.06,
  blend = 'overlay'
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 72,
      pointerEvents: 'none',
      opacity,
      mixBlendMode: blend,
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
    }
  });
}
function Vignette({
  strength = 0.5
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      pointerEvents: 'none',
      background: `radial-gradient(116% 100% at 50% 44%, rgba(0,0,0,0) 50%, rgba(0,0,0,${strength}) 100%)`
    }
  });
}
function Flash({
  impacts = [],
  color = 'rgba(255,251,243,0.95)',
  max = 0.18
}) {
  const time = window.useTime();
  let inten = 0;
  for (const b of impacts) {
    const dt = time - b;
    if (dt >= 0 && dt < 0.22) inten = Math.max(inten, 1 - dt / 0.22);
  }
  if (inten <= 0.01) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 78,
      pointerEvents: 'none',
      opacity: inten * max,
      background: `radial-gradient(85% 70% at 50% 45%, ${color}, rgba(255,255,255,0) 72%)`
    }
  });
}
// fade no fim/início sobre uma cor
function FadeEdge({
  color = '#000',
  inEnd = 0.5,
  outStart = 14.2,
  outEnd = 15
}) {
  const time = window.useTime();
  let o = 0;
  if (time < inEnd) o = 1 - Easing.easeInOutCubic(clamp(time / inEnd, 0, 1));else if (time > outStart) o = Easing.easeInOutCubic(clamp((time - outStart) / (outEnd - outStart), 0, 1));
  if (o <= 0.001) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      background: color,
      opacity: o,
      pointerEvents: 'none'
    }
  });
}
// shake leve nos impactos
function shakeOffset(time, impacts) {
  let amp = 0;
  for (const b of impacts) {
    const dt = time - b;
    if (dt >= 0 && dt < 0.26) amp = Math.max(amp, (1 - dt / 0.26) * 10);
  }
  if (amp <= 0.01) return {
    x: 0,
    y: 0
  };
  return {
    x: Math.sin(time * 140) * amp,
    y: Math.cos(time * 120) * amp * 0.6
  };
}

// linha CTA pill reutilizável
function CTAPill({
  children,
  bg = PAL.bordeaux,
  fg = '#fff',
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 18,
      background: bg,
      color: fg,
      padding: '30px 58px',
      borderRadius: 9999,
      fontSize: 42,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      boxShadow: '0 22px 48px rgba(0,0,0,0.18)',
      fontFamily: FONT,
      ...style
    }
  }, children);
}
// "link na bio" com seta para cima
function BioCue({
  color = PAL.muted,
  arrow = PAL.bordeaux,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: FONT,
      fontSize: 30,
      fontWeight: 500,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: arrow,
      fontSize: 32
    }
  }, "\u2191"), " link na bio");
}
window.RX = {
  RW,
  RH,
  PADX,
  SAFE_TOP,
  SAFE_BOT,
  FONT,
  ASTER,
  PAL,
  outQuint,
  useFade,
  slamAt,
  riseUp,
  Stack,
  Pool,
  MediaReveal,
  Grain,
  Vignette,
  Flash,
  FadeEdge,
  shakeOffset,
  CTAPill,
  BioCue
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "reels-shared.jsx", error: String((e && e.message) || e) }); }

// scenes-cine.jsx
try { (() => {
// scenes-cine.jsx — Portal Ana Paula Fiório · FILME (corte cinematográfico)
// Preto cinematográfico, letterbox, dissolves no preto, push-ins lentos,
// vinheta + grão + poeira, tipografia com blur/máscara. Paleta do design system.

const W = 1920,
  H = 1080;
const BAR = 142; // letterbox 2.39:1
const TOP = BAR,
  BOT = H - BAR; // banda visível

const C = {
  ink: '#13120d',
  // preto quente (base do filme)
  inkDeep: '#0b0a07',
  forest: '#18211c',
  // forest profundo
  forestDk: '#10160f',
  cream: '#f3efe6',
  creamWarm: '#efe7d8',
  bordeaux: '#c25668',
  // bordeaux luminoso (p/ fundo escuro)
  bordeauxGl: '#d3697b',
  honey: '#d9b56b',
  honeyGl: '#e7c47e',
  sage: '#7c9085',
  muted: '#9b9382',
  warm400: '#6f6a5c'
};
const FONT = "'Poppins', system-ui, sans-serif";
const ASTERISK = '\u2733';

// ── easings / helpers ───────────────────────────────────────────────────────
const outQuint = t => 1 - Math.pow(1 - t, 5);
const outExpo = t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
function rev(localTime, start, dur, {
  y = 28,
  blur = 10,
  ease = outQuint
} = {}) {
  const p = ease(clamp((localTime - start) / dur, 0, 1));
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * y}px)`,
    filter: `blur(${(1 - p) * blur}px)`
  };
}
function useEnv(fadeIn = 0.8, fadeOut = 0.8) {
  const {
    localTime,
    duration
  } = useSprite();
  if (localTime < fadeIn) return Easing.easeOutCubic(clamp(localTime / fadeIn, 0, 1));
  if (localTime > duration - fadeOut) return 1 - Easing.easeInCubic(clamp((localTime - (duration - fadeOut)) / fadeOut, 0, 1));
  return 1;
}

// Cena cinematográfica: fundo próprio + câmera (push-in lento) + dissolve.
function CineScene({
  children,
  bg = null,
  camera,
  fadeIn = 0.9,
  fadeOut = 0.9
}) {
  const {
    localTime,
    duration
  } = useSprite();
  const o = useEnv(fadeIn, fadeOut);
  const p = clamp(localTime / duration, 0, 1);
  const cam = camera ? camera(p, localTime) : `scale(${1 + 0.055 * Easing.easeOutSine(p)})`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: o,
      fontFamily: FONT
    }
  }, bg, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      transform: cam,
      transformOrigin: '50% 50%',
      willChange: 'transform'
    }
  }, children));
}

// Banda de conteúdo dentro do letterbox.
function Band({
  children,
  justify = 'center',
  align = 'flex-start',
  padX = 220,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: TOP,
      height: BOT - TOP,
      padding: `0 ${padX}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: align,
      ...style
    }
  }, children);
}

// Poça de luz quente (radial) — dá profundidade ao fundo escuro.
function LightPool({
  x = '50%',
  y = '42%',
  size = 1300,
  color = 'rgba(217,181,107,0.16)',
  base = C.ink
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(${size}px ${size * 0.8}px at ${x} ${y}, ${color}, rgba(0,0,0,0) 62%), ${base}`
    }
  });
}

// ════════════════════════════════════════════════════════════════════════
// CENA 1 — Cold open no preto
// ════════════════════════════════════════════════════════════════════════
function SceneCold() {
  const {
    localTime
  } = useSprite();
  const glow = Easing.easeOutCubic(clamp((localTime - 0.4) / 2.2, 0, 1));
  const aster = Easing.easeOutCubic(clamp((localTime - 0.9) / 1.6, 0, 1));
  const asterPulse = 1 + Math.sin(localTime * 1.1) * 0.03;
  const labelR = rev(localTime, 2.3, 1.4, {
    y: 14,
    blur: 6
  });
  const line = Easing.easeInOutCubic(clamp((localTime - 2.6) / 1.6, 0, 1));
  const bg = /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: C.inkDeep
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: glow,
      background: 'radial-gradient(900px 760px at 50% 46%, rgba(217,181,107,0.14), rgba(0,0,0,0) 60%)'
    }
  }));
  return /*#__PURE__*/React.createElement(CineScene, {
    bg: bg,
    fadeIn: 0.01,
    camera: p => `scale(${1.06 - 0.06 * Easing.easeOutSine(p)})`
  }, /*#__PURE__*/React.createElement(Band, {
    justify: "center",
    align: "center"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 92,
      color: C.honeyGl,
      lineHeight: 1,
      opacity: aster,
      transform: `scale(${aster * asterPulse})`,
      textShadow: '0 0 34px rgba(217,181,107,0.55)'
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      width: 360 * line,
      background: 'linear-gradient(90deg, rgba(217,181,107,0) 0%, rgba(217,181,107,0.7) 50%, rgba(217,181,107,0) 100%)',
      margin: '40px 0 34px'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 23,
      fontWeight: 500,
      letterSpacing: '0.42em',
      textTransform: 'uppercase',
      color: C.creamWarm,
      ...labelR
    }
  }, "Ana Paula Fi\xF3rio")));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 2 — Manifesto (linha a linha, blur-in)
// ════════════════════════════════════════════════════════════════════════
const LINHAS = [[{
  t: 'Educação corporativa'
}], [{
  t: 'que sai do slide'
}], [{
  t: 'e chega à '
}, {
  t: 'prática.',
  em: true
}]];
function SceneManifesto() {
  const {
    localTime
  } = useSprite();
  const kicker = rev(localTime, 0.3, 1.0, {
    y: 12,
    blur: 5
  });
  const bg = /*#__PURE__*/React.createElement(LightPool, {
    x: "32%",
    y: "40%",
    size: 1500,
    color: "rgba(217,181,107,0.13)",
    base: C.ink
  });
  return /*#__PURE__*/React.createElement(CineScene, {
    bg: bg,
    camera: p => `translateX(${-p * 26}px) scale(${1.0 + 0.05 * p})`
  }, /*#__PURE__*/React.createElement(Band, {
    justify: "center",
    align: "flex-start"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      margin: '0 0 44px',
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: C.honey,
      ...kicker
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      letterSpacing: 0
    }
  }, ASTERISK), " O portal na pr\xE1tica"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 120,
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1.06,
      color: C.cream
    }
  }, LINHAS.map((linha, li) => {
    const r = rev(localTime, 0.7 + li * 0.95, 1.3, {
      y: 40,
      blur: 14
    });
    return /*#__PURE__*/React.createElement("span", {
      key: li,
      style: {
        display: 'block',
        overflow: 'hidden',
        paddingBottom: '0.06em'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        opacity: r.opacity,
        transform: r.transform,
        filter: r.filter
      }
    }, linha.map((w, wi) => /*#__PURE__*/React.createElement("span", {
      key: wi,
      style: w.em ? {
        fontStyle: 'italic',
        color: C.bordeauxGl,
        textShadow: '0 0 38px rgba(194,86,104,0.45)'
      } : null
    }, w.t))));
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      ...rev(localTime, 3.6, 1.2, {
        y: 18,
        blur: 8
      }),
      margin: '54px 0 0',
      maxWidth: 760,
      fontSize: 27,
      lineHeight: 1.55,
      color: C.muted
    }
  }, "Conte\xFAdo, ferramentas e din\xE2micas para quem desenvolve pessoas.")));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 3 — Provas em números (hairline cresce, contadores)
// ════════════════════════════════════════════════════════════════════════
const NUMS = [{
  v: 20,
  s: '+',
  r: 'anos de sala de aula'
}, {
  v: 7,
  s: '',
  r: 'temas de liderança'
}, {
  v: 15,
  s: '',
  r: 'dinâmicas prontas'
}, {
  v: 8,
  s: '',
  r: 'ferramentas de gestão'
}];
function SceneNumeros() {
  const {
    localTime
  } = useSprite();
  const kicker = rev(localTime, 0.3, 1.0, {
    y: 12,
    blur: 5
  });
  const lineH = outExpo(clamp((localTime - 0.7) / 1.6, 0, 1));
  const bg = /*#__PURE__*/React.createElement(LightPool, {
    x: "64%",
    y: "50%",
    size: 1300,
    color: "rgba(124,144,133,0.14)",
    base: C.forestDk
  });
  return /*#__PURE__*/React.createElement(CineScene, {
    bg: bg,
    camera: p => `scale(${1.0 + 0.05 * p}) translateY(${-p * 14}px)`
  }, /*#__PURE__*/React.createElement(Band, {
    justify: "center",
    align: "flex-start",
    padX: 240
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      margin: '0 0 50px',
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: C.honey,
      ...kicker
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      letterSpacing: 0
    }
  }, ASTERISK), " Vinte anos, condensados"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 64
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 2,
      background: 'linear-gradient(180deg, rgba(217,181,107,0.7), rgba(217,181,107,0.05))',
      transform: `scaleY(${lineH})`,
      transformOrigin: 'top',
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 30
    }
  }, NUMS.map((n, i) => {
    const t0 = 1.0 + i * 0.5;
    const r = rev(localTime, t0, 1.0, {
      y: 26,
      blur: 10
    });
    const cnt = clamp((localTime - t0) / 1.1, 0, 1);
    const val = Math.round(Easing.easeOutCubic(cnt) * n.v);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 30,
        ...r
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 92,
        fontWeight: 700,
        lineHeight: 0.95,
        letterSpacing: '-0.04em',
        color: C.bordeauxGl,
        minWidth: 170,
        textShadow: '0 0 30px rgba(194,86,104,0.3)'
      }
    }, val, cnt >= 1 ? n.s : ''), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 28,
        color: C.creamWarm,
        letterSpacing: '0.01em'
      }
    }, n.r));
  })))));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 4 — Por onde começar (dividers que varrem)
// ════════════════════════════════════════════════════════════════════════
const PORTAS = ['Educação Corporativa', 'Comunicação no Mercado', 'Liderança', 'Laboratório de Dinâmicas'];
function ScenePortas() {
  const {
    localTime
  } = useSprite();
  const head = rev(localTime, 0.3, 1.1, {
    y: 22,
    blur: 9
  });
  const hi = 2; // Liderança ganha brilho
  const hiOn = Easing.easeInOutCubic(clamp((localTime - 4.0) / 0.7, 0, 1));
  const bg = /*#__PURE__*/React.createElement(LightPool, {
    x: "50%",
    y: "38%",
    size: 1400,
    color: "rgba(217,181,107,0.1)",
    base: C.ink
  });
  return /*#__PURE__*/React.createElement(CineScene, {
    bg: bg,
    camera: p => `scale(${1.0 + 0.045 * p}) translateY(${-p * 18}px)`
  }, /*#__PURE__*/React.createElement(Band, {
    justify: "center",
    align: "flex-start",
    padX: 240
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 18px',
      fontSize: 74,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      color: C.cream,
      ...head
    }
  }, "Por onde ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeauxGl
    }
  }, "come\xE7ar")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, PORTAS.map((p, i) => {
    const t0 = 0.9 + i * 0.42;
    const wipe = outExpo(clamp((localTime - t0) / 0.9, 0, 1));
    const tr = rev(localTime, t0 + 0.15, 1.0, {
      y: 20,
      blur: 8
    });
    const isHi = i === hi ? hiOn : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        padding: '38px 0 32px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: 1,
        width: `${wipe * 100}%`,
        background: `linear-gradient(90deg, ${C.honey}, rgba(217,181,107,0.15))`
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 40,
        ...tr
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 28,
        fontStyle: 'italic',
        fontWeight: 600,
        color: isHi > 0.5 ? C.honeyGl : C.warm400,
        minWidth: 56
      }
    }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 52,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color: isHi > 0.5 ? C.bordeauxGl : C.cream,
        textShadow: isHi > 0.5 ? '0 0 40px rgba(194,86,104,0.4)' : 'none'
      }
    }, p), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 34,
        color: isHi > 0.5 ? C.bordeauxGl : C.warm400,
        transform: `translate(${isHi * 8}px, ${isHi * -8}px)`
      }
    }, "\u2197")));
  }))));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 5 — Trilha + ferramentas (brasas)
// ════════════════════════════════════════════════════════════════════════
const CHIPS = ['Pipeline de Liderança', 'Feedback Estruturado', 'Matriz RACI', 'Ciclo PDCA', 'Método 5W2H', 'Check-in 1:1', 'Modelo SMART', 'Conversas Difíceis'];
function SceneTrilha() {
  const {
    localTime
  } = useSprite();
  const kicker = rev(localTime, 0.3, 1.0, {
    y: 12,
    blur: 5
  });
  const head = rev(localTime, 0.7, 1.4, {
    y: 30,
    blur: 12
  });
  const lab = rev(localTime, 2.4, 0.9, {
    y: 12,
    blur: 6
  });
  const bg = /*#__PURE__*/React.createElement(LightPool, {
    x: "40%",
    y: "34%",
    size: 1500,
    color: "rgba(124,144,133,0.16)",
    base: C.forest
  });
  return /*#__PURE__*/React.createElement(CineScene, {
    bg: bg,
    camera: p => `scale(${1.0 + 0.05 * p}) translateX(${p * 22}px)`
  }, /*#__PURE__*/React.createElement(Band, {
    justify: "center",
    align: "flex-start",
    padX: 240
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      margin: '0 0 26px',
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: '0.32em',
      textTransform: 'uppercase',
      color: C.honey,
      ...kicker
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      letterSpacing: 0
    }
  }, ASTERISK), " Trilha de lideran\xE7a"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 64,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      lineHeight: 1.14,
      maxWidth: 1280,
      color: C.cream,
      ...head
    }
  }, "Sete temas, um m\xE9todo:", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeauxGl
    }
  }, "conceito, exemplo, ferramenta, pr\xE1tica.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 64
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 26px',
      fontSize: 20,
      fontWeight: 500,
      letterSpacing: '0.24em',
      textTransform: 'uppercase',
      color: C.sage,
      ...lab
    }
  }, "Para usar amanh\xE3"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 18,
      maxWidth: 1420
    }
  }, CHIPS.map((c, i) => {
    const t0 = 2.7 + i * 0.16;
    const p = clamp((localTime - t0) / 0.7, 0, 1);
    const e = Easing.easeOutCubic(p);
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: 'inline-block',
        padding: '15px 30px',
        borderRadius: 999,
        border: '1.5px solid rgba(217,181,107,0.32)',
        color: C.creamWarm,
        fontSize: 26,
        fontWeight: 500,
        opacity: e,
        transform: `translateY(${(1 - e) * 16}px) scale(${0.94 + 0.06 * e})`,
        filter: `blur(${(1 - e) * 6}px)`,
        boxShadow: `0 0 ${28 * e}px rgba(217,181,107,${0.1 * e})`
      }
    }, c);
  })))));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 6 — Chamada final + cartela de marca
// ════════════════════════════════════════════════════════════════════════
function SceneCTA() {
  const {
    localTime,
    duration
  } = useSprite();
  const aster = Easing.easeOutCubic(clamp((localTime - 0.3) / 1.0, 0, 1));
  const head = rev(localTime, 0.7, 1.4, {
    y: 30,
    blur: 14
  });
  const sub = rev(localTime, 2.0, 1.0, {
    y: 16,
    blur: 7
  });
  const btn = rev(localTime, 2.7, 0.9, {
    y: 14,
    blur: 6
  });
  const arrow = Math.sin(Math.max(0, localTime - 3.0) * 2.0) * 6;
  // cartela final: a CTA recua e a marca surge
  const ctaOut = Easing.easeInOutCubic(clamp((localTime - 5.6) / 1.0, 0, 1));
  const sign = rev(localTime, 6.4, 1.6, {
    y: 22,
    blur: 10
  });
  const tag = rev(localTime, 7.2, 1.6, {
    y: 14,
    blur: 6
  });
  const bg = /*#__PURE__*/React.createElement(LightPool, {
    x: "50%",
    y: "46%",
    size: 1400,
    color: "rgba(194,86,104,0.12)",
    base: C.ink
  });
  return /*#__PURE__*/React.createElement(CineScene, {
    bg: bg,
    fadeOut: 1.4,
    camera: p => `scale(${1.0 + 0.04 * p})`
  }, /*#__PURE__*/React.createElement(Band, {
    justify: "center",
    align: "center"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: 1 - ctaOut,
      transform: `translateY(${ctaOut * -34}px) scale(${1 - ctaOut * 0.06})`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: ctaOut >= 1 ? 'absolute' : 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 52,
      color: C.honeyGl,
      lineHeight: 1,
      opacity: aster,
      transform: `scale(${aster})`,
      textShadow: '0 0 28px rgba(217,181,107,0.5)'
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '32px 0 0',
      textAlign: 'center',
      fontSize: 88,
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1.08,
      maxWidth: 1320,
      color: C.cream,
      ...head
    }
  }, "Quer um treinamento que a equipe", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeauxGl,
      textShadow: '0 0 40px rgba(194,86,104,0.45)'
    }
  }, "aplica na segunda?")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '30px 0 0',
      textAlign: 'center',
      fontSize: 27,
      lineHeight: 1.5,
      color: C.muted,
      maxWidth: 720,
      ...sub
    }
  }, "Palestras, treinamentos in company e consultoria em educa\xE7\xE3o corporativa."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 50,
      ...btn,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      background: C.bordeaux,
      color: '#fff',
      padding: '22px 46px',
      borderRadius: 999,
      fontSize: 25,
      fontWeight: 500,
      boxShadow: '0 0 50px rgba(194,86,104,0.35)'
    }
  }, "Fale comigo ", /*#__PURE__*/React.createElement("span", {
    style: {
      transform: `translateX(${arrow}px)`,
      fontSize: 26
    }
  }, "\u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      textAlign: 'center',
      opacity: ctaOut
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      color: C.honeyGl,
      ...sign
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '26px 0 0',
      fontSize: 58,
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: C.cream,
      ...sign
    }
  }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeauxGl
    }
  }, "Fi\xF3rio")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      fontSize: 20,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: C.muted,
      ...tag
    }
  }, "Educa\xE7\xE3o corporativa que sai do slide"))));
}

// ── overlays globais (cinema) ────────────────────────────────────────────────
function Letterbox() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: BAR,
      background: '#000',
      zIndex: 80
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: BAR,
      background: '#000',
      zIndex: 80
    }
  }));
}
function Vignette() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      pointerEvents: 'none',
      background: 'radial-gradient(120% 110% at 50% 45%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.55) 100%)'
    }
  });
}
function Grain() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 72,
      pointerEvents: 'none',
      opacity: 0.07,
      mixBlendMode: 'overlay',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
    }
  });
}

// poeira no ar — partículas lentas
const SEED = (() => {
  let s = 7;
  const r = () => (s = s * 16807 % 2147483647) / 2147483647;
  return Array.from({
    length: 34
  }, () => ({
    x: r() * 100,
    y: r() * 100,
    r: 1 + r() * 2.4,
    sp: 0.4 + r() * 1.1,
    ph: r() * 100,
    drift: (r() - 0.5) * 8
  }));
})();
function Dust() {
  const time = useTime();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 71,
      pointerEvents: 'none'
    }
  }, SEED.map((d, i) => {
    const y = (d.y - time * d.sp * 1.6) % 100;
    const yy = y < 0 ? y + 100 : y;
    const x = d.x + Math.sin(time * 0.3 + d.ph) * d.drift;
    const op = (0.10 + 0.10 * Math.sin(time * 0.8 + d.ph)) * (yy > 6 && yy < 94 ? 1 : 0.2);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: `${x}%`,
        top: `${yy}%`,
        width: d.r,
        height: d.r,
        borderRadius: '50%',
        background: '#e7c47e',
        opacity: Math.max(0, op),
        filter: 'blur(0.5px)',
        boxShadow: '0 0 6px rgba(231,196,126,0.6)'
      }
    });
  }));
}

// fades no preto (abertura/fechamento)
function FadeBlack({
  inEnd = 1.2,
  outStart = 44.6,
  outEnd = 46
}) {
  const time = useTime();
  let o = 0;
  if (time < inEnd) o = 1 - Easing.easeInOutCubic(clamp(time / inEnd, 0, 1));else if (time > outStart) o = Easing.easeInOutCubic(clamp((time - outStart) / (outEnd - outStart), 0, 1));
  if (o <= 0.001) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      background: '#000',
      opacity: o,
      pointerEvents: 'none'
    }
  });
}
function TimeLabeler() {
  const time = useTime();
  React.useEffect(() => {
    const root = document.getElementById('video-root');
    if (root) root.setAttribute('data-screen-label', `${Math.floor(time)}s`);
  }, [Math.floor(time)]);
  return null;
}
Object.assign(window, {
  CINE: C,
  SceneCold,
  SceneManifesto,
  SceneNumeros,
  ScenePortas,
  SceneTrilha,
  SceneCTA,
  Letterbox,
  Vignette,
  Grain,
  Dust,
  FadeBlack,
  TimeLabeler
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "scenes-cine.jsx", error: String((e && e.message) || e) }); }

// scenes-teaser.jsx
try { (() => {
// scenes-teaser.jsx — Teaser 15s do Portal Ana Paula Fiório (com SFX sincronizados)
// Reusa o engine (window.Sprite / Easing / clamp / TimelineContext) e os overlays
// cinematográficos (window.Letterbox / Vignette / Grain / Dust / CINE).

const {
  Sprite,
  Easing,
  clamp,
  TimelineContext
} = window;
// Paleta TEMA CLARO (papel) — nomes herdados; valores invertidos p/ fundo claro.
const C = {
  cream: '#1b1a12',
  // texto primário (tinta quente)
  creamWarm: '#4a443a',
  // rótulos secundários
  ink: '#f7f4ef',
  // base de fundo (papel)
  inkDeep: '#f5f1e9',
  // papel levemente mais quente
  forestDk: '#f1ece2',
  // fundo cena de números
  bordeaux: '#b34259',
  bordeauxGl: '#b34259',
  honey: '#bf8f33',
  honeyGl: '#bf8f33',
  muted: '#5b574d',
  warm400: '#a69e93'
};
const FONT = "'Poppins', system-ui, sans-serif";
const ASTERISK = '\u2733';
const W = 1920,
  H = 1080,
  BAR = 142,
  TOP = BAR,
  BOT = H - BAR;
const DURATION = 15;
const outQuint = t => 1 - Math.pow(1 - t, 5);

// trilha sonora — tempos em segundos
const EVENTS = [{
  t: 0.20,
  fn: 'boom',
  opts: {
    f: 150,
    drop: 46,
    vol: 0.95
  }
}, {
  t: 0.45,
  fn: 'whoosh',
  opts: {
    from: 200,
    to: 2600,
    dur: 0.55,
    vol: 0.42
  }
}, {
  t: 2.35,
  fn: 'whoosh',
  opts: {
    from: 2600,
    to: 320,
    dur: 0.4,
    vol: 0.4
  }
}, {
  t: 2.60,
  fn: 'boom',
  opts: {
    f: 130,
    drop: 44,
    vol: 0.8
  }
}, {
  t: 3.55,
  fn: 'boom',
  opts: {
    f: 120,
    drop: 42,
    vol: 0.8
  }
}, {
  t: 5.15,
  fn: 'boom',
  opts: {
    f: 165,
    drop: 40,
    vol: 1.0
  }
}, {
  t: 5.18,
  fn: 'shimmer',
  opts: {
    vol: 0.28
  }
}, {
  t: 7.25,
  fn: 'whoosh',
  opts: {
    from: 400,
    to: 3200,
    dur: 0.5,
    vol: 0.45
  }
}, {
  t: 7.55,
  fn: 'tick',
  opts: {
    f2: 262
  }
}, {
  t: 8.30,
  fn: 'tick',
  opts: {
    f2: 330
  }
}, {
  t: 8.70,
  fn: 'riser',
  opts: {
    dur: 1.6,
    vol: 0.36
  }
}, {
  t: 9.05,
  fn: 'tick',
  opts: {
    f2: 392
  }
}, {
  t: 10.30,
  fn: 'boom',
  opts: {
    f: 175,
    drop: 38,
    vol: 1.05
  }
}, {
  t: 10.34,
  fn: 'shimmer',
  opts: {
    vol: 0.30
  }
}, {
  t: 12.00,
  fn: 'tick',
  opts: {
    f2: 440,
    vol: 0.4
  }
}, {
  t: 12.90,
  fn: 'boom',
  opts: {
    f: 140,
    drop: 44,
    vol: 0.85
  }
}, {
  t: 12.95,
  fn: 'shimmer',
  opts: {
    vol: 0.30
  }
}];
const IMPACTS = [0.20, 2.60, 3.55, 5.15, 10.30, 12.90];

// ── helpers visuais ──────────────────────────────────────────────────────
function useFade(inDur = 0.18, outDur = 0.3) {
  const {
    localTime,
    duration
  } = window.useSprite();
  let o = 1;
  if (localTime < inDur) o = clamp(localTime / inDur, 0, 1);
  if (localTime > duration - outDur) o = Math.min(o, 1 - clamp((localTime - (duration - outDur)) / outDur, 0, 1));
  return o;
}
function slamAt(localTime, start, dur = 0.32) {
  const p = clamp((localTime - start) / dur, 0, 1);
  const e = outQuint(p);
  return {
    opacity: clamp(p * 1.6, 0, 1),
    transform: `scale(${1.16 - 0.16 * e})`,
    filter: `blur(${(1 - e) * 13}px)`
  };
}
function Band({
  children,
  justify = 'center',
  align = 'center',
  padX = 200,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: TOP,
      height: BOT - TOP,
      padding: `0 ${padX}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: align,
      fontFamily: FONT,
      ...style
    }
  }, children);
}
function Pool({
  x = '50%',
  y = '46%',
  size = 1400,
  color,
  base
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(${size}px ${size * 0.8}px at ${x} ${y}, ${color}, rgba(0,0,0,0) 62%), ${base}`
    }
  });
}

// ── FASE 1 — Logo (0–2.55) ───────────────────────────────────────────────
function PhaseLogo() {
  const {
    localTime
  } = window.useSprite();
  const o = useFade(0.01, 0.32);
  const glow = Easing.easeOutCubic(clamp((localTime - 0.1) / 1.2, 0, 1));
  const ap = clamp((localTime - 0.2) / 0.35, 0, 1);
  const aster = Easing.easeOutBack(ap);
  const lab = clamp((localTime - 0.5) / 0.5, 0, 1);
  const line = clamp((localTime - 0.55) / 0.7, 0, 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: o
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: C.inkDeep
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: glow,
      background: 'radial-gradient(780px 660px at 50% 46%, rgba(217,181,107,0.18), rgba(0,0,0,0) 60%)'
    }
  })), /*#__PURE__*/React.createElement(Band, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 96,
      lineHeight: 1,
      color: C.honeyGl,
      opacity: ap,
      transform: `scale(${aster})`,
      textShadow: '0 0 24px rgba(191,143,51,0.28)'
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1.5,
      width: 420 * outQuint(line),
      background: 'linear-gradient(90deg, rgba(217,181,107,0), rgba(217,181,107,0.85), rgba(217,181,107,0))',
      margin: '38px 0 30px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'hidden',
      paddingBottom: 6
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 30,
      fontWeight: 500,
      letterSpacing: '0.46em',
      textTransform: 'uppercase',
      color: C.cream,
      transform: `translateY(${(1 - outQuint(lab)) * 110}%)`
    }
  }, "Ana\xA0Paula\xA0Fi\xF3rio"))));
}

// ── FASE 2 — Manifesto em dois golpes (2.4–5.2) ──────────────────────────
function PhaseLines() {
  const {
    localTime
  } = window.useSprite();
  const o = useFade(0.12, 0.22);
  const l1 = slamAt(localTime, 0.2, 0.3); // 2.6 abs
  const l2 = slamAt(localTime, 1.15, 0.3); // 3.55 abs
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: o
    }
  }, /*#__PURE__*/React.createElement(Pool, {
    x: "34%",
    y: "42%",
    size: 1500,
    color: "rgba(217,181,107,0.13)",
    base: C.ink
  }), /*#__PURE__*/React.createElement(Band, {
    justify: "center",
    align: "flex-start",
    padX: 220
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 132,
      fontWeight: 700,
      letterSpacing: '-0.04em',
      lineHeight: 1.02,
      color: C.cream
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      ...l1
    }
  }, "Educa\xE7\xE3o corporativa"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      ...l2
    }
  }, "que sai do slide"))));
}

// ── FASE 3 — "prática." (5.05–7.45) ──────────────────────────────────────
function PhasePratica() {
  const {
    localTime
  } = window.useSprite();
  const o = useFade(0.04, 0.3);
  const kick = clamp((localTime - 0.0) / 0.4, 0, 1);
  const slam = slamAt(localTime, 0.1, 0.34);
  const pulse = 1 + Math.max(0, Math.sin((localTime - 0.1) * 3)) * 0.012 * clamp(1 - (localTime - 0.1), 0, 1);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: o
    }
  }, /*#__PURE__*/React.createElement(Pool, {
    x: "50%",
    y: "48%",
    size: 1500,
    color: "rgba(194,86,104,0.16)",
    base: C.ink
  }), /*#__PURE__*/React.createElement(Band, null, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 40,
      fontWeight: 500,
      color: C.cream,
      opacity: kick,
      letterSpacing: '0.02em'
    }
  }, "e chega \xE0"), /*#__PURE__*/React.createElement("div", {
    style: {
      ...slam,
      transform: `${slam.transform} scale(${pulse})`
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '6px 0 0',
      fontSize: 230,
      fontWeight: 700,
      fontStyle: 'italic',
      letterSpacing: '-0.05em',
      lineHeight: 0.95,
      color: C.bordeauxGl,
      textShadow: 'none'
    }
  }, "pr\xE1tica."))));
}

// ── FASE 4 — Números (7.3–10.35) ─────────────────────────────────────────
const NUMS = [{
  v: '20+',
  r: 'anos de sala de aula'
}, {
  v: '7',
  r: 'temas de liderança'
}, {
  v: '15',
  r: 'dinâmicas prontas'
}];
function PhaseNums() {
  const {
    localTime
  } = window.useSprite();
  const o = useFade(0.1, 0.18);
  const zoom = 1 + 0.07 * Easing.easeInQuad(clamp((localTime - 1.4) / 1.6, 0, 1)); // riser → tensão
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: o
    }
  }, /*#__PURE__*/React.createElement(Pool, {
    x: "58%",
    y: "50%",
    size: 1300,
    color: "rgba(199,154,58,0.10)",
    base: C.forestDk
  }), /*#__PURE__*/React.createElement(Band, {
    align: "flex-start",
    padX: 240,
    style: {
      transform: `scale(${zoom})`,
      transformOrigin: '40% 50%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, NUMS.map((n, i) => {
    const st = 0.25 + i * 0.75; // 7.55 / 8.30 / 9.05 abs
    const s = slamAt(localTime, st, 0.26);
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 30,
        ...s
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 128,
        fontWeight: 700,
        lineHeight: 0.9,
        letterSpacing: '-0.05em',
        color: C.bordeauxGl,
        minWidth: 230,
        textShadow: 'none'
      }
    }, n.v), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 36,
        color: C.creamWarm
      }
    }, n.r));
  }))));
}

// ── FASE 5 — CTA + marca (10.3–15) ───────────────────────────────────────
function PhaseCTA() {
  const {
    localTime
  } = window.useSprite();
  const o = useFade(0.04, 0.01);
  const kick = clamp((localTime - 0.1) / 0.5, 0, 1);
  const slam = slamAt(localTime, 0.0, 0.34); // 10.3 abs
  const btn = slamAt(localTime, 1.7, 0.4); // 12.0 abs
  const arrow = Math.sin(Math.max(0, localTime - 1.9) * 3) * 6;
  const ctaOut = Easing.easeInOutCubic(clamp((localTime - 2.3) / 0.5, 0, 1)); // recua p/ a marca
  const sign = slamAt(localTime, 2.6, 0.5); // 12.9 abs
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: o
    }
  }, /*#__PURE__*/React.createElement(Pool, {
    x: "50%",
    y: "46%",
    size: 1450,
    color: "rgba(194,86,104,0.13)",
    base: C.ink
  }), /*#__PURE__*/React.createElement(Band, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      opacity: 1 - ctaOut,
      transform: `translateY(${ctaOut * -28}px) scale(${1 - ctaOut * 0.05})`,
      position: ctaOut >= 1 ? 'absolute' : 'relative'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 34,
      fontWeight: 500,
      color: C.cream,
      opacity: kick,
      letterSpacing: '0.01em'
    }
  }, "Um treinamento que a equipe"), /*#__PURE__*/React.createElement("div", {
    style: slam
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '10px 0 0',
      fontSize: 132,
      fontWeight: 700,
      fontStyle: 'italic',
      letterSpacing: '-0.045em',
      lineHeight: 0.98,
      color: C.bordeauxGl,
      textShadow: 'none'
    }
  }, "aplica na segunda?")), /*#__PURE__*/React.createElement("div", {
    style: {
      ...btn,
      marginTop: 50,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      background: C.bordeaux,
      color: '#fff',
      padding: '22px 48px',
      borderRadius: 999,
      fontSize: 27,
      fontWeight: 500,
      boxShadow: '0 16px 34px rgba(179,66,89,0.22)'
    }
  }, "Fale comigo ", /*#__PURE__*/React.createElement("span", {
    style: {
      transform: `translateX(${arrow}px)`,
      fontSize: 28
    }
  }, "\u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      textAlign: 'center',
      opacity: ctaOut
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      color: C.honeyGl,
      ...sign
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '24px 0 0',
      fontSize: 70,
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: C.cream,
      ...sign
    }
  }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeauxGl
    }
  }, "Fi\xF3rio")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 22,
      fontSize: 22,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: C.muted,
      ...sign
    }
  }, "Educa\xE7\xE3o corporativa na pr\xE1tica"))));
}

// ── overlays sincronizados ───────────────────────────────────────────────
function Flash() {
  const time = window.useTime();
  let inten = 0;
  for (const b of IMPACTS) {
    const dt = time - b;
    if (dt >= 0 && dt < 0.22) inten = Math.max(inten, 1 - dt / 0.22);
  }
  if (inten <= 0.01) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 78,
      pointerEvents: 'none',
      opacity: inten * 0.16,
      background: 'radial-gradient(85% 85% at 50% 45%, rgba(255,251,243,0.95), rgba(255,251,243,0) 70%)'
    }
  });
}
function LightVignette() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      pointerEvents: 'none',
      background: 'radial-gradient(122% 116% at 50% 42%, rgba(0,0,0,0) 58%, rgba(74,58,38,0.13) 100%)'
    }
  });
}
function shakeOffset(time) {
  let amp = 0;
  for (const b of IMPACTS) {
    const dt = time - b;
    if (dt >= 0 && dt < 0.28) amp = Math.max(amp, (1 - dt / 0.28) * 9);
  }
  if (amp <= 0.01) return {
    x: 0,
    y: 0
  };
  return {
    x: Math.sin(time * 140) * amp,
    y: Math.cos(time * 120) * amp * 0.6
  };
}
function FadeBlackT() {
  const time = window.useTime();
  let o = 0;
  if (time < 0.12) o = 1 - time / 0.12;else if (time > 14.2) o = clamp((time - 14.2) / 0.8, 0, 1);
  if (o <= 0.001) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      background: '#f7f4ef',
      opacity: o,
      pointerEvents: 'none'
    }
  });
}

// ── transporte + palco ───────────────────────────────────────────────────
function ShakeWrap({
  children
}) {
  const time = window.useTime();
  const s = shakeOffset(time);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      transform: `translate(${s.x}px, ${s.y}px)`
    }
  }, children);
}
function Teaser() {
  const [started, setStarted] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [ended, setEnded] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [scale, setScale] = React.useState(0.5);
  const wrapRef = React.useRef(null);
  const audioRef = React.useRef(null);
  const startPerf = React.useRef(0);
  const rafRef = React.useRef(null);
  const intRef = React.useRef(null);

  // escala p/ caber na viewport
  React.useEffect(() => {
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return;
      setScale(Math.max(0.1, Math.min(el.clientWidth / W, el.clientHeight / H)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  // tick: calcula tempo absoluto de performance.now() (idempotente).
  // Retorna true quando terminou.
  const tick = React.useCallback(() => {
    const t = (performance.now() - startPerf.current) / 1000;
    if (t >= DURATION) {
      setTime(DURATION);
      setEnded(true);
      return true;
    }
    setTime(t);
    return false;
  }, []);
  const loop = React.useCallback(() => {
    if (tick()) {
      cancelAnimationFrame(rafRef.current);
      clearInterval(intRef.current);
      return;
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [tick]);
  const start = React.useCallback(() => {
    if (!audioRef.current) audioRef.current = new window.TeaserAudio();
    audioRef.current.init();
    if (audioRef.current.ctx.state === 'suspended') audioRef.current.ctx.resume();
    audioRef.current.setMuted(muted);
    audioRef.current.schedule(EVENTS);
    setStarted(true);
    setEnded(false);
    startPerf.current = performance.now();
    cancelAnimationFrame(rafRef.current);
    clearInterval(intRef.current);
    // fallback p/ quando rAF é congelado (aba em segundo plano)
    intRef.current = setInterval(() => {
      if (tick()) clearInterval(intRef.current);
    }, 33);
    rafRef.current = requestAnimationFrame(loop);
  }, [loop, tick, muted]);
  React.useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(intRef.current);
  }, []);
  const toggleMute = () => {
    setMuted(m => {
      const nm = !m;
      if (audioRef.current) audioRef.current.setMuted(nm);
      return nm;
    });
  };
  const ctx = {
    time,
    duration: DURATION,
    playing: started && !ended
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: wrapRef,
    style: {
      position: 'fixed',
      inset: 0,
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: W,
      height: H,
      position: 'relative',
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      background: '#000',
      overflow: 'hidden',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(TimelineContext.Provider, {
    value: ctx
  }, /*#__PURE__*/React.createElement(ShakeWrap, null, /*#__PURE__*/React.createElement(Sprite, {
    start: 0,
    end: 2.55
  }, /*#__PURE__*/React.createElement(PhaseLogo, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 2.4,
    end: 5.18
  }, /*#__PURE__*/React.createElement(PhaseLines, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 5.05,
    end: 7.45
  }, /*#__PURE__*/React.createElement(PhasePratica, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 7.3,
    end: 10.35
  }, /*#__PURE__*/React.createElement(PhaseNums, null)), /*#__PURE__*/React.createElement(Sprite, {
    start: 10.3,
    end: 15
  }, /*#__PURE__*/React.createElement(PhaseCTA, null)), /*#__PURE__*/React.createElement(window.Grain, null), /*#__PURE__*/React.createElement(LightVignette, null)), /*#__PURE__*/React.createElement(window.Letterbox, null), /*#__PURE__*/React.createElement(Flash, null), /*#__PURE__*/React.createElement(FadeBlackT, null)), !started && /*#__PURE__*/React.createElement("div", {
    onClick: start,
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 120,
      background: 'radial-gradient(1000px 760px at 50% 44%, rgba(191,143,51,0.12), #f7f4ef 62%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontFamily: FONT
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 64,
      color: C.honeyGl
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 26,
      fontSize: 64,
      fontWeight: 700,
      letterSpacing: '-0.025em',
      color: C.cream
    }
  }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeauxGl
    }
  }, "Fi\xF3rio")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      fontSize: 22,
      letterSpacing: '0.3em',
      textTransform: 'uppercase',
      color: C.muted
    }
  }, "Teaser \xB7 15s \xB7 com som"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 50,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      background: C.bordeaux,
      color: '#fff',
      padding: '20px 46px',
      borderRadius: 999,
      fontSize: 26,
      fontWeight: 600,
      boxShadow: '0 16px 34px rgba(179,66,89,0.24)'
    }
  }, "\u25B6 Tocar com som"))), started && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 22,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 130,
      fontFamily: FONT
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: toggleMute,
    style: btnStyle
  }, muted ? '🔇 Som off' : '🔊 Som on'), ended && /*#__PURE__*/React.createElement("button", {
    onClick: start,
    style: btnStyle
  }, "\u21BB Repetir"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 220,
      height: 4,
      borderRadius: 2,
      background: 'rgba(255,255,255,0.15)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: `${time / DURATION * 100}%`,
      background: C.honey
    }
  }))));
}
const btnStyle = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: '#f3efe6',
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 500,
  padding: '8px 16px',
  borderRadius: 999,
  cursor: 'pointer'
};
window.Teaser = Teaser;
})(); } catch (e) { __ds_ns.__errors.push({ path: "scenes-teaser.jsx", error: String((e && e.message) || e) }); }

// scenes.jsx
try { (() => {
// scenes.jsx — Portal Ana Paula Fiório · filme de lançamento
// Cenas compostas sobre o engine de animação (animations.jsx).
// Paleta e tipografia fiéis ao design system do portal.

const W = 1920,
  H = 1080;
const C = {
  cream: '#f7f4ef',
  // warm-50 — papel
  creamSoft: '#efe9df',
  card: '#fefdfa',
  ink: '#17160f',
  // warm-950
  bordeaux: '#b34259',
  // rose-500
  bordeauxDk: '#8f3147',
  // rose-600
  rosePale: '#d99aa9',
  // rose-300 (tema escuro)
  sage900: '#202c27',
  // forest profundo
  sage700: '#2c3b34',
  sage400: '#6e8278',
  honey: '#d6b166',
  // mel
  muted: '#5b574d',
  // muted-foreground
  warm400: '#a69e93',
  border: '#e4ddd2',
  // warm-200
  borderDk: '#39463f'
};
const FONT = "'Poppins', system-ui, sans-serif";
const ASTERISK = '\u2733'; // ✳

// ── helpers ───────────────────────────────────────────────────────────────
const bezOutQuint = t => 1 - Math.pow(1 - t, 5);
function useEnvelope(fadeIn = 0.55, fadeOut = 0.55) {
  const {
    localTime,
    duration
  } = useSprite();
  if (localTime < fadeIn) return Easing.easeOutCubic(clamp(localTime / fadeIn, 0, 1));
  if (localTime > duration - fadeOut) return 1 - Easing.easeInCubic(clamp((localTime - (duration - fadeOut)) / fadeOut, 0, 1));
  return 1;
}
function Frame({
  children,
  justify = 'center',
  align = 'flex-start',
  padX = 168,
  padY = 120,
  opacity = 1,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      padding: `${padY}px ${padX}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: justify,
      alignItems: align,
      opacity,
      fontFamily: FONT,
      color: C.ink,
      ...style
    }
  }, children);
}
function Kicker({
  text,
  color = C.muted,
  mark = C.honey,
  size = 21
}) {
  return /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontSize: size,
      fontWeight: 500,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color,
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: mark,
      letterSpacing: 0
    }
  }, ASTERISK), text);
}

// ── selo girante (texto circular) ─────────────────────────────────────────
function SeloGirante({
  size = 360,
  text,
  color = C.muted,
  speed = 9,
  ring = C.warm400
}) {
  const time = useTime();
  const r = size / 2 - 26;
  const cx = size / 2,
    cy = size / 2;
  const pid = 'selo-path';
  const d = `M ${cx},${cy} m -${r},0 a ${r},${r} 0 1,1 ${2 * r},0 a ${r},${r} 0 1,1 -${2 * r},0`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      transform: `rotate(${time * speed}deg)`
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    viewBox: `0 0 ${size} ${size}`
  }, /*#__PURE__*/React.createElement("circle", {
    cx: cx,
    cy: cy,
    r: r + 13,
    fill: "none",
    stroke: ring,
    strokeWidth: "1.25",
    strokeDasharray: "3 5",
    opacity: "0.7"
  }), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("path", {
    id: pid,
    d: d
  })), /*#__PURE__*/React.createElement("text", {
    fill: color,
    style: {
      fontFamily: FONT,
      fontSize: 18,
      fontWeight: 500,
      letterSpacing: '0.34em',
      textTransform: 'uppercase'
    }
  }, /*#__PURE__*/React.createElement("textPath", {
    href: `#${pid}`,
    startOffset: "0"
  }, text))));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 1 — Abertura de marca
// ════════════════════════════════════════════════════════════════════════
function SceneBrand() {
  const {
    localTime
  } = useSprite();
  const o = useEnvelope(0.6, 0.6);
  const aster = Easing.easeOutBack(clamp((localTime - 0.2) / 0.7, 0, 1));
  const nameRise = bezOutQuint(clamp((localTime - 0.75) / 0.9, 0, 1));
  const subO = Easing.easeOutCubic(clamp((localTime - 1.7) / 0.8, 0, 1));
  const groupScale = interpolate([0, 1], [0.965, 1], Easing.easeOutCubic)(clamp(localTime / 4.8, 0, 1));
  return /*#__PURE__*/React.createElement(Frame, {
    justify: "center",
    align: "center",
    opacity: o
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      transform: `scale(${groupScale})`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute'
    }
  }, /*#__PURE__*/React.createElement(SeloGirante, {
    size: 560,
    text: `${ASTERISK}  EDUCAÇÃO CORPORATIVA NA PRÁTICA   ·   LIDERANÇA   ·   COMUNICAÇÃO   `
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 84,
      lineHeight: 1,
      color: C.honey,
      transform: `scale(${aster}) rotate(${(1 - aster) * -40}deg)`,
      opacity: aster
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: 'hidden',
      paddingBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 116,
      fontWeight: 700,
      letterSpacing: '-0.03em',
      lineHeight: 1,
      transform: `translateY(${(1 - nameRise) * 116}%)`,
      whiteSpace: 'nowrap'
    }
  }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeaux
    }
  }, "Fi\xF3rio"))), /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: subO,
      transform: `translateY(${(1 - subO) * 12}px)`
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    text: "Especialista em educa\xE7\xE3o corporativa",
    size: 22
  })))));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 2 — Manifesto (headline palavra a palavra)
// ════════════════════════════════════════════════════════════════════════
const MANIFESTO = [{
  t: 'Educação'
}, {
  t: 'corporativa'
}, {
  t: 'que'
}, {
  t: 'sai'
}, {
  t: 'do'
}, {
  t: 'slide'
}, {
  t: 'e'
}, {
  t: 'chega'
}, {
  t: 'à'
}, {
  t: 'prática.',
  em: true
}];
function RisingWords({
  words,
  start = 0,
  stagger = 0.085,
  dur = 0.82,
  size = 124
}) {
  const {
    localTime
  } = useSprite();
  return /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.04,
      letterSpacing: '-0.035em',
      maxWidth: 1480,
      display: 'flex',
      flexWrap: 'wrap',
      columnGap: '0.28em',
      rowGap: '0.04em'
    }
  }, words.map((w, i) => {
    const local = clamp((localTime - (start + i * stagger)) / dur, 0, 1);
    const e = bezOutQuint(local);
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: 'inline-block',
        overflow: 'hidden',
        paddingBottom: '0.12em',
        marginBottom: '-0.12em',
        verticalAlign: 'bottom'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        transform: `translateY(${(1 - e) * 112}%)`,
        fontStyle: w.em ? 'italic' : 'normal',
        color: w.em ? C.bordeaux : C.ink
      }
    }, w.t));
  }));
}
function SceneManifesto() {
  const {
    localTime
  } = useSprite();
  const o = useEnvelope(0.5, 0.55);
  const kO = Easing.easeOutCubic(clamp(localTime / 0.6, 0, 1));
  const subO = Easing.easeOutCubic(clamp((localTime - 1.85) / 0.8, 0, 1));
  const ctaO = Easing.easeOutCubic(clamp((localTime - 2.45) / 0.7, 0, 1));
  const arrow = Math.sin(Math.max(0, localTime - 2.6) * 2.2) * 6;
  return /*#__PURE__*/React.createElement(Frame, {
    justify: "center",
    align: "flex-start",
    opacity: o
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: kO,
      marginBottom: 46
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    text: "Ana Paula Fi\xF3rio",
    size: 22
  })), /*#__PURE__*/React.createElement(RisingWords, {
    words: MANIFESTO,
    start: 0.35
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '52px 0 0',
      maxWidth: 880,
      fontSize: 30,
      lineHeight: 1.5,
      color: C.muted,
      fontWeight: 400,
      opacity: subO,
      transform: `translateY(${(1 - subO) * 14}px)`
    }
  }, "Conte\xFAdo, ferramentas e din\xE2micas para quem desenvolve pessoas \u2014 tudo estruturado para funcionar depois que a sala de aula fecha."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 56,
      opacity: ctaO,
      transform: `translateY(${(1 - ctaO) * 14}px)`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      background: C.ink,
      color: C.cream,
      padding: '20px 38px',
      borderRadius: 999,
      fontSize: 23,
      fontWeight: 500
    }
  }, "Ver o acervo", /*#__PURE__*/React.createElement("span", {
    style: {
      transform: `translateX(${arrow}px)`,
      fontSize: 24
    }
  }, "\u2192")));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 3 — Provas em números
// ════════════════════════════════════════════════════════════════════════
const NUMEROS = [{
  valor: 7,
  suf: '',
  rotulo: 'temas de liderança'
}, {
  valor: 8,
  suf: '',
  rotulo: 'ferramentas de gestão'
}, {
  valor: 15,
  suf: '',
  rotulo: 'dinâmicas prontas'
}, {
  valor: 20,
  suf: '+',
  rotulo: 'anos de sala de aula'
}];
function Rule({
  p
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1.5,
      background: C.border,
      transform: `scaleX(${p})`,
      transformOrigin: 'left',
      width: '100%'
    }
  });
}
function SceneNumeros() {
  const {
    localTime
  } = useSprite();
  const o = useEnvelope(0.5, 0.55);
  const headO = Easing.easeOutCubic(clamp(localTime / 0.6, 0, 1));
  const ruleTop = bezOutQuint(clamp((localTime - 0.5) / 0.9, 0, 1));
  const ruleBot = bezOutQuint(clamp((localTime - 1.4) / 1.0, 0, 1));
  return /*#__PURE__*/React.createElement(Frame, {
    justify: "center",
    align: "flex-start",
    opacity: o
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: headO,
      transform: `translateY(${(1 - headO) * 12}px)`,
      marginBottom: 60
    }
  }, /*#__PURE__*/React.createElement(Kicker, {
    text: "Vinte anos de sala, condensados"
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '26px 0 0',
      fontSize: 70,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      lineHeight: 1.08,
      maxWidth: 1200
    }
  }, "Um acervo que vira ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeaux
    }
  }, "repert\xF3rio"), " de quem desenvolve gente.")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Rule, {
    p: ruleTop
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)'
    }
  }, NUMEROS.map((n, i) => {
    const t0 = 0.7 + i * 0.18;
    const cnt = clamp((localTime - t0) / 1.0, 0, 1);
    const val = Math.round(Easing.easeOutCubic(cnt) * n.valor);
    const colO = Easing.easeOutCubic(clamp((localTime - (t0 - 0.1)) / 0.6, 0, 1));
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: '46px 0 40px',
        paddingLeft: i === 0 ? 0 : 46,
        borderLeft: i === 0 ? 'none' : `1px solid ${C.border}`,
        opacity: colO
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 104,
        fontWeight: 700,
        color: C.bordeaux,
        lineHeight: 1,
        letterSpacing: '-0.04em'
      }
    }, val, cnt >= 1 ? n.suf : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 18,
        fontSize: 25,
        color: C.muted
      }
    }, n.rotulo));
  })), /*#__PURE__*/React.createElement(Rule, {
    p: ruleBot
  })));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 4 — Por onde começar (lista editorial numerada)
// ════════════════════════════════════════════════════════════════════════
const PORTAS = [{
  titulo: 'Educação Corporativa',
  desc: 'Construir uma cultura de aprendizagem que sustenta resultados.'
}, {
  titulo: 'Comunicação no Mercado',
  desc: 'Da escuta ativa às conversas difíceis: as habilidades que destravam equipes.'
}, {
  titulo: 'Liderança',
  desc: 'Do Pipeline de Liderança ao desenvolvimento de sucessores.'
}, {
  titulo: 'Laboratório de Dinâmicas',
  desc: 'Escolha o tema, receba a dinâmica testada em sala — com passo a passo.'
}];
function ScenePortas() {
  const {
    localTime
  } = useSprite();
  const o = useEnvelope(0.5, 0.55);
  const headO = Easing.easeOutCubic(clamp(localTime / 0.6, 0, 1));
  // destaca a 3ª porta (Liderança) em estado hover
  const hoverIdx = 2;
  const hoverOn = clamp((localTime - 3.4) / 0.5, 0, 1);
  return /*#__PURE__*/React.createElement(Frame, {
    justify: "center",
    align: "flex-start",
    opacity: o
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      width: '100%',
      opacity: headO,
      transform: `translateY(${(1 - headO) * 12}px)`,
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 78,
      fontWeight: 600,
      letterSpacing: '-0.03em'
    }
  }, "Por onde ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeaux
    }
  }, "come\xE7ar")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 360,
      fontSize: 23,
      lineHeight: 1.5,
      color: C.muted,
      textAlign: 'right'
    }
  }, "Quatro portas de entrada. Escolha pelo desafio que est\xE1 na sua mesa hoje.")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%'
    }
  }, PORTAS.map((p, i) => {
    const t0 = 0.6 + i * 0.16;
    const rowP = bezOutQuint(clamp((localTime - t0) / 0.8, 0, 1));
    const isHover = i === hoverIdx ? hoverOn : 0;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        alignItems: 'baseline',
        gap: 44,
        padding: `34px ${24 * isHover}px`,
        borderTop: `1px solid ${C.border}`,
        borderBottom: i === PORTAS.length - 1 ? `1px solid ${C.border}` : 'none',
        background: `rgba(254,253,250,${isHover})`,
        opacity: rowP,
        transform: `translateY(${(1 - rowP) * 22}px)`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 30,
        fontStyle: 'italic',
        fontWeight: 600,
        color: isHover > 0.5 ? C.honey : C.warm400
      }
    }, String(i + 1).padStart(2, '0')), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 44,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color: isHover > 0.5 ? C.bordeaux : C.ink
      }
    }, p.titulo), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        marginTop: 10,
        fontSize: 23,
        lineHeight: 1.45,
        color: C.muted,
        maxWidth: 760
      }
    }, p.desc)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 34,
        color: isHover > 0.5 ? C.bordeaux : C.warm400,
        transform: `translate(${isHover * 6}px, ${isHover * -6}px)`
      }
    }, "\u2197"));
  })));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 5 — Trilha de liderança + ferramentas (bloco escuro)
// ════════════════════════════════════════════════════════════════════════
const CHIPS = ['Pipeline de Liderança', 'Feedback Estruturado', 'Matriz RACI', 'Ciclo PDCA', 'Método 5W2H', 'Check-in 1:1', 'Modelo SMART', 'Conversas Difíceis', 'Gestão de Conflitos'];
function DarkBG() {
  const o = useEnvelope(0.45, 0.5);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: C.sage900,
      opacity: o
    }
  });
}
function SceneTrilha() {
  const {
    localTime
  } = useSprite();
  const o = useEnvelope(0.5, 0.5);
  const headO = Easing.easeOutCubic(clamp(localTime / 0.7, 0, 1));
  const chipLabelO = Easing.easeOutCubic(clamp((localTime - 1.6) / 0.6, 0, 1));
  return /*#__PURE__*/React.createElement(Frame, {
    justify: "center",
    align: "flex-start",
    opacity: o,
    style: {
      color: '#f3efe6'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      color: C.honey,
      margin: 0,
      opacity: headO
    }
  }, /*#__PURE__*/React.createElement("span", null, ASTERISK), " Trilha de lideran\xE7a"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '28px 0 0',
      fontSize: 66,
      fontWeight: 600,
      letterSpacing: '-0.03em',
      lineHeight: 1.12,
      maxWidth: 1300,
      color: '#f3efe6',
      opacity: headO,
      transform: `translateY(${(1 - headO) * 14}px)`
    }
  }, "Sete temas, um m\xE9todo:", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.rosePale
    }
  }, "conceito, exemplo, ferramenta, pr\xE1tica.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 70
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 21,
      fontWeight: 500,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      color: C.sage400,
      margin: '0 0 26px',
      opacity: chipLabelO
    }
  }, "Para usar amanh\xE3"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 18,
      maxWidth: 1500
    }
  }, CHIPS.map((c, i) => {
    const t0 = 1.9 + i * 0.11;
    const pop = Easing.easeOutBack(clamp((localTime - t0) / 0.5, 0, 1));
    const fill = clamp((localTime - (t0 + 2.0)) / 0.4, 0, 1); // alguns preenchem depois
    const filled = i % 3 === 1 ? fill : 0;
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        display: 'inline-block',
        padding: '16px 30px',
        borderRadius: 999,
        border: `1.5px solid ${filled > 0.5 ? C.sage400 : C.borderDk}`,
        background: filled > 0.5 ? C.sage700 : 'transparent',
        color: filled > 0.5 ? '#f3efe6' : '#d9d4c9',
        fontSize: 27,
        fontWeight: 500,
        opacity: clamp(pop, 0, 1),
        transform: `scale(${0.6 + 0.4 * clamp(pop, 0, 1.2)})`
      }
    }, c);
  }))));
}

// ════════════════════════════════════════════════════════════════════════
// CENA 6 — Chamada final
// ════════════════════════════════════════════════════════════════════════
function SceneCTA() {
  const {
    localTime
  } = useSprite();
  const o = useEnvelope(0.5, 0.6);
  const aster = Easing.easeOutBack(clamp(localTime / 0.6, 0, 1));
  const headO = Easing.easeOutCubic(clamp((localTime - 0.35) / 0.8, 0, 1));
  const subO = Easing.easeOutCubic(clamp((localTime - 1.2) / 0.7, 0, 1));
  const btnO = Easing.easeOutBack(clamp((localTime - 1.8) / 0.6, 0, 1));
  const arrow = Math.sin(Math.max(0, localTime - 2.0) * 2.2) * 6;
  const signO = Easing.easeOutCubic(clamp((localTime - 3.4) / 1.0, 0, 1));
  return /*#__PURE__*/React.createElement(Frame, {
    justify: "center",
    align: "center",
    opacity: o,
    padY: 110
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 56,
      color: C.honey,
      lineHeight: 1,
      opacity: aster,
      transform: `scale(${aster})`
    }
  }, ASTERISK), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '34px 0 0',
      textAlign: 'center',
      fontSize: 92,
      fontWeight: 700,
      letterSpacing: '-0.035em',
      lineHeight: 1.08,
      maxWidth: 1380,
      opacity: headO,
      transform: `translateY(${(1 - headO) * 16}px)`
    }
  }, "Quer um treinamento que a equipe", ' ', /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeaux
    }
  }, "aplica na segunda?")), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '34px 0 0',
      textAlign: 'center',
      fontSize: 28,
      lineHeight: 1.5,
      color: C.muted,
      maxWidth: 720,
      opacity: subO
    }
  }, "Palestras, treinamentos in company e consultoria em educa\xE7\xE3o corporativa. Conte o desafio que est\xE1 na sua mesa."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 52,
      opacity: clamp(btnO, 0, 1),
      transform: `scale(${0.85 + 0.15 * clamp(btnO, 0, 1.2)})`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 16,
      background: C.bordeaux,
      color: '#fff',
      padding: '22px 46px',
      borderRadius: 999,
      fontSize: 25,
      fontWeight: 500
    }
  }, "Fale comigo", /*#__PURE__*/React.createElement("span", {
    style: {
      transform: `translateX(${arrow}px)`,
      fontSize: 26
    }
  }, "\u2192")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 90,
      textAlign: 'center',
      opacity: signO
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 40,
      fontWeight: 700,
      letterSpacing: '-0.02em'
    }
  }, "Ana Paula ", /*#__PURE__*/React.createElement("em", {
    style: {
      fontStyle: 'italic',
      color: C.bordeaux
    }
  }, "Fi\xF3rio")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: 19,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: C.warm400
    }
  }, "Educa\xE7\xE3o corporativa que sai do slide")));
}

// ── overlays ───────────────────────────────────────────────────────────────
function Grain() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 60,
      pointerEvents: 'none',
      opacity: 0.05,
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"
    }
  });
}
function TimeLabeler() {
  const time = useTime();
  React.useEffect(() => {
    const root = document.getElementById('video-root');
    if (root) root.setAttribute('data-screen-label', `${Math.floor(time)}s`);
  }, [Math.floor(time)]);
  return null;
}
Object.assign(window, {
  C_PALETTE: C,
  SceneBrand,
  SceneManifesto,
  SceneNumeros,
  ScenePortas,
  SceneTrilha,
  SceneCTA,
  DarkBG,
  Grain,
  TimeLabeler
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "scenes.jsx", error: String((e && e.message) || e) }); }

// site-preview/apf-data.js
try { (() => {
/* apf-data.js — dados reais do portal (gerado a partir de data/*.ts) */
window.APF = window.APF || {};

/* ===== data/lideranca.ts ===== */
window.APF.temasLideranca = [{
  slug: "pipeline-de-lideranca",
  titulo: "Pipeline de Liderança",
  resumo: "As seis passagens que transformam um colaborador individual em um líder de líderes — e por que cada transição exige novas habilidades, novos valores e nova gestão do tempo.",
  conceito: "Criado por Ram Charan, Stephen Drotter e James Noel, o Pipeline de Liderança descreve as transições de carreira como passagens: de gerenciar a si mesmo a gerenciar outros, de gerenciar outros a gerenciar gestores, e assim por diante. Em cada passagem, o que trouxe a pessoa até ali deixa de ser suficiente — e pode até atrapalhar. A ideia central é que liderança não é um único salto, mas uma sequência de mudanças de identidade profissional.",
  exemploReal: "Uma analista excelente é promovida a coordenadora e continua fazendo o trabalho técnico que dominava, enquanto a equipe fica sem direção. O resultado: ela trabalha doze horas por dia e o time não evolui. Ao entender a primeira passagem do pipeline, ela percebe que seu novo trabalho é planejar, delegar e desenvolver pessoas — não executar mais rápido que todos.",
  ferramenta: "Mapa de Passagens: para cada nível de liderança da sua organização, descreva em três colunas as habilidades exigidas, os valores de trabalho (o que a pessoa precisa passar a valorizar) e a aplicação do tempo (com o que a agenda deve ser preenchida).",
  exercicioPratico: "Identifique em qual passagem do pipeline você está hoje. Liste três atividades que você ainda executa e que pertencem ao nível anterior. Para cada uma, defina: delegar para quem, até quando e com qual acompanhamento."
}, {
  slug: "lideranca-situacional",
  titulo: "Liderança Situacional",
  resumo: "Não existe um único estilo certo de liderar: o líder eficaz ajusta direção e apoio conforme a maturidade da pessoa para cada tarefa específica.",
  conceito: "O modelo de Hersey e Blanchard propõe que o estilo de liderança deve variar conforme o nível de prontidão do liderado — combinação de competência e confiança para uma tarefa específica. São quatro estilos: direção (muita instrução), treinamento (instrução + apoio), apoio (pouca instrução, muito encorajamento) e delegação (autonomia). A mesma pessoa pode precisar de estilos diferentes em tarefas diferentes.",
  exemploReal: "Um gestor trata um vendedor sênior recém-transferido como autônomo em tudo. Nas vendas, funciona; nos relatórios do novo sistema, ele se perde e não pede ajuda por orgulho. O gestor aprende a separar: delegação total no comercial, direção próxima no administrativo — sem que isso signifique desconfiança.",
  ferramenta: "Matriz Pessoa × Tarefa: liste as principais entregas de cada membro da equipe e classifique a prontidão (P1 a P4) em cada uma. Em seguida, anote o estilo de liderança adequado para cada célula da matriz.",
  exercicioPratico: "Escolha um liderado e duas tarefas dele: uma que domina e outra em que ainda patina. Descreva como você o lidera hoje em cada uma. Há descompasso entre estilo e prontidão? Ajuste uma conversa de alinhamento para esta semana."
}, {
  slug: "lideranca-humanizada",
  titulo: "Liderança Humanizada",
  resumo: "Resultados sustentáveis nascem de relações de confiança: liderar pessoas inteiras, com escuta, empatia e segurança psicológica — sem abrir mão da responsabilidade.",
  conceito: "Liderança humanizada é a prática de enxergar o colaborador como pessoa completa, não apenas como função. Envolve segurança psicológica (as pessoas podem errar, discordar e perguntar sem medo), escuta genuína e cuidado com o desenvolvimento. Importante: humanizar não é abrir mão de metas ou evitar conversas difíceis — é tratá-las com respeito e clareza.",
  exemploReal: "Em uma equipe de operações, os erros eram escondidos até virarem crises. A nova gestora instituiu reuniões quinzenais de 'erros e aprendizados' começando pelos próprios erros dela. Em seis meses, os problemas passaram a aparecer dias antes, quando ainda eram baratos de resolver.",
  ferramenta: "Check-in estruturado de 1:1: roteiro de conversa individual com quatro blocos — como você está (pessoa), como está o trabalho (entregas), o que está travando (obstáculos) e como posso ajudar (apoio do líder).",
  exercicioPratico: "Na próxima reunião de equipe, abra com uma rodada de check-in de duas palavras (como cada um chega à reunião). Depois, observe: as pessoas falam de problemas abertamente ou só de boas notícias? Anote o que isso revela sobre a segurança psicológica do time."
}, {
  slug: "lideranca-estrategica",
  titulo: "Liderança Estratégica",
  resumo: "Sair do operacional para enxergar o todo: traduzir a estratégia da organização em prioridades claras para a equipe e tomar decisões olhando para o longo prazo.",
  conceito: "Liderança estratégica é a capacidade de conectar o trabalho do dia a dia com a direção de longo prazo da organização. Envolve três movimentos: compreender o contexto (mercado, cliente, números), traduzir a estratégia em prioridades concretas para o time e proteger a agenda para pensar — não apenas executar. Líderes estratégicos dizem 'não' com frequência, porque sabem o que é prioridade.",
  exemploReal: "Uma coordenadora de RH recebia demandas de todas as áreas e tentava atender tudo. Ao alinhar com a diretoria os três objetivos do ano, passou a filtrar pedidos pela pergunta 'isso contribui para qual objetivo?'. A área deixou de ser vista como balcão de tarefas e ganhou assento nas decisões.",
  ferramenta: "Cascata de prioridades: documento de uma página que conecta objetivos da empresa, objetivos da área e as três prioridades do trimestre da equipe, com um indicador simples para cada uma.",
  exercicioPratico: "Pergunte a três pessoas da sua equipe: 'quais são as prioridades do nosso time neste trimestre?'. Se as respostas forem diferentes entre si — ou diferentes da sua —, você encontrou seu próximo trabalho estratégico: alinhar e comunicar."
}, {
  slug: "delegacao",
  titulo: "Delegação",
  resumo: "Delegar não é repassar tarefa: é transferir responsabilidade com clareza de resultado, autonomia adequada e acompanhamento combinado.",
  conceito: "Delegação eficaz exige definir o quê (resultado esperado), o porquê (contexto e importância), o até quando (prazo) e o nível de autonomia (decide sozinho, decide e informa, ou propõe e valida). O erro mais comum é delegar a tarefa e reter a decisão — gerando idas e vindas que frustram os dois lados. Delegar é também uma ferramenta de desenvolvimento: a tarefa certa, para a pessoa certa, no nível certo de desafio.",
  exemploReal: "Um gerente reclamava que 'ninguém resolvia nada sem ele'. Ao mapear, descobriu que toda compra acima de cem reais passava por sua aprovação. Definiu alçadas claras por valor e tipo de decisão. Em um mês, seu volume de e-mails caiu pela metade — e a equipe passou a trazer soluções em vez de perguntas.",
  ferramenta: "Contrato de delegação: meia página com resultado esperado, prazo, nível de autonomia, recursos disponíveis e pontos de verificação combinados. Assinado simbolicamente pelos dois lados.",
  exercicioPratico: "Liste tudo o que só você faz hoje. Marque com D o que poderia ser delegado nos próximos 30 dias e com E o que delegado desenvolveria alguém do time. Escolha um item DE e monte o contrato de delegação esta semana."
}, {
  slug: "gestao-de-equipes",
  titulo: "Gestão de Equipes",
  resumo: "Transformar um grupo de pessoas em um time: papéis claros, rituais que funcionam, acordos de convivência e foco em resultado coletivo.",
  conceito: "Equipes de alta performance compartilham quatro fundamentos: clareza de propósito (por que existimos), clareza de papéis (quem faz o quê), rituais eficazes (reuniões e cerimônias que agregam valor) e acordos explícitos de convivência (como tratamos prazos, conflitos e comunicação). A gestão de equipes é o trabalho contínuo de construir e manter esses fundamentos — não um evento de integração anual.",
  exemploReal: "Um time de projetos vivia em conflito porque duas pessoas achavam que a mesma decisão era sua. Uma dinâmica simples de matriz de responsabilidades (quem decide, quem executa, quem é consultado, quem é informado) em cada frente de trabalho dissolveu em duas horas um atrito de seis meses.",
  ferramenta: "Matriz RACI simplificada: para cada processo ou entrega relevante do time, defina quem é Responsável, quem Aprova, quem é Consultado e quem é Informado. Revise a cada mudança de escopo ou de pessoas.",
  exercicioPratico: "Avalie as reuniões recorrentes do seu time: para cada uma, responda — tem objetivo claro? Gera decisão ou ação? Poderia ser mais curta ou virar mensagem? Elimine ou redesenhe pelo menos uma reunião neste mês."
}, {
  slug: "desenvolvimento-de-sucessores",
  titulo: "Desenvolvimento de Sucessores",
  resumo: "O legado de um líder é medido pelas pessoas que ele preparou: identificar potenciais, criar experiências de desenvolvimento e abrir espaço deliberadamente.",
  conceito: "Desenvolver sucessores é um processo intencional: identificar pessoas com potencial (não apenas desempenho atual), expô-las gradualmente a desafios do próximo nível e dar feedback constante sobre a jornada. A regra 70-20-10 orienta o caminho: 70% do desenvolvimento vem de experiências práticas, 20% de trocas e mentoria, 10% de cursos formais. Líder que não forma sucessor fica refém do próprio cargo — e trava a carreira de todos abaixo dele.",
  exemploReal: "Uma supervisora queria ser promovida, mas a diretoria respondia: 'não temos quem a substitua'. Ela montou um plano de 9 meses para preparar dois analistas — passou a levá-los a reuniões de resultado, delegou a gestão de um turno e estruturou feedbacks quinzenais. Foi promovida; um dos analistas assumiu o posto dela.",
  ferramenta: "Plano de sucessão individual: para cada potencial sucessor, defina as lacunas em relação ao próximo cargo, três experiências práticas que as endereçam (projetos, substituições temporárias, apresentações) e marcos de avaliação trimestrais.",
  exercicioPratico: "Responda por escrito: se você fosse promovido amanhã, quem assumiria seu lugar? Se a resposta for 'ninguém está pronto', escolha um nome com potencial e defina a primeira experiência de exposição que você pode proporcionar ainda neste mês."
}];

/* ===== data/ferramentas.ts ===== */
window.APF.ferramentas = [{
  slug: "pdca",
  nome: "PDCA",
  categoria: "Gestão",
  descricao: "Ciclo de melhoria contínua em quatro etapas: Planejar (definir objetivo e plano), Fazer (executar), Checar (medir resultados) e Agir (corrigir e padronizar). Simples e poderoso para qualquer processo que precisa evoluir de forma consistente.",
  quandoUsar: "Quando um processo apresenta resultados instáveis ou quando você quer implantar uma melhoria de forma estruturada, com aprendizado a cada ciclo."
}, {
  slug: "5w2h",
  nome: "5W2H",
  categoria: "Gestão",
  descricao: "Plano de ação completo em sete perguntas: o quê (What), por quê (Why), onde (Where), quando (When), quem (Who), como (How) e quanto custa (How much). Elimina ambiguidades e garante que nada essencial fique sem dono ou prazo.",
  quandoUsar: "Ao transformar uma decisão de reunião em ação concreta, ou quando planos anteriores falharam por falta de clareza sobre responsáveis e prazos."
}, {
  slug: "swot",
  nome: "Análise SWOT",
  categoria: "Análise",
  descricao: "Mapa estratégico que cruza o ambiente interno (Forças e Fraquezas) com o externo (Oportunidades e Ameaças). A versão completa cruza os quadrantes para gerar estratégias: usar forças para capturar oportunidades, corrigir fraquezas que expõem a ameaças.",
  quandoUsar: "No planejamento anual da área ou da carreira, antes de lançar um projeto relevante, ou quando o contexto mudou e a estratégia precisa ser revisitada."
}, {
  slug: "matriz-gut",
  nome: "Matriz GUT",
  categoria: "Análise",
  descricao: "Priorização de problemas por três critérios pontuados de 1 a 5: Gravidade (impacto se nada for feito), Urgência (prazo para agir) e Tendência (vai piorar?). A multiplicação dos três gera um ranking objetivo do que atacar primeiro.",
  quandoUsar: "Quando há mais problemas do que capacidade de resolver e a equipe discute prioridades com base em opinião, não em critério."
}, {
  slug: "ishikawa",
  nome: "Diagrama de Ishikawa",
  categoria: "Análise",
  descricao: "Também chamado de espinha de peixe ou diagrama de causa e efeito: organiza as possíveis causas de um problema em categorias (método, mão de obra, máquina, material, medição, meio ambiente) para encontrar a causa raiz em vez de tratar sintomas.",
  quandoUsar: "Quando um problema se repete apesar das correções, sinal de que a equipe está tratando o sintoma e não a causa raiz."
}, {
  slug: "plano-de-desenvolvimento-de-carreira",
  nome: "Plano de Desenvolvimento de Carreira",
  categoria: "Pessoas",
  descricao: "Documento vivo que conecta onde a pessoa está, onde quer chegar e o caminho entre os dois pontos: competências a desenvolver, experiências a buscar (regra 70-20-10) e marcos de progresso com datas.",
  quandoUsar: "Em ciclos de avaliação de desempenho, em conversas de carreira ou quando um talento dá sinais de estagnação e precisa de horizonte."
}, {
  slug: "feedback-estruturado",
  nome: "Feedback Estruturado",
  categoria: "Pessoas",
  descricao: "Roteiro para conversas de feedback baseado em comportamento observável: Situação (quando e onde), Comportamento (o que a pessoa fez, sem julgamento) e Impacto (consequência concreta). Fecha com acordo sobre o próximo passo.",
  quandoUsar: "Sempre que um comportamento — positivo ou a corrigir — merece ser nomeado. O modelo evita generalizações ('você sempre...') que geram defensividade."
}, {
  slug: "plano-de-acao",
  nome: "Plano de Ação",
  categoria: "Gestão",
  descricao: "Estrutura mínima para tirar decisões do papel: lista de ações com responsável único, prazo definido e status visível. Pode ser tão simples quanto uma planilha compartilhada — o valor está na revisão periódica, não na ferramenta.",
  quandoUsar: "Ao final de toda reunião que gera decisões, em planos de melhoria pós-avaliação e no acompanhamento de metas da equipe."
}];

/* ===== data/insights.ts ===== */
window.APF.posts = [{
  slug: "o-erro-dos-lideres-que-nao-delegam",
  titulo: "O erro dos líderes que não delegam",
  categoria: "Liderança",
  data: "2026-05-28",
  tempoLeitura: "4 min",
  resumo: "Centralizar parece zelo, mas custa caro: o líder vira gargalo, a equipe não cresce e a empresa fica refém de uma única agenda.",
  conteudo: ["Existe um padrão que se repete em quase toda organização: o profissional brilhante é promovido e leva junto o hábito que o fez brilhar — fazer tudo com as próprias mãos. Só que o jogo mudou. O que era virtude no cargo anterior vira gargalo no novo.", "O líder que não delega manda três recados silenciosos para a equipe: não confio em vocês, não preciso de vocês para decidir e não há espaço para crescer aqui. Nenhum desses recados aparece em discurso, mas todos aparecem no comportamento — e comportamento é o que a equipe lê.", "Delegar bem não é repassar tarefa e torcer. É definir o resultado esperado, dar o contexto do porquê, combinar o nível de autonomia e estabelecer pontos de verificação. Quando a delegação falha, em geral não faltou capacidade ao liderado: faltou contrato claro ao líder.", "Comece pequeno: escolha uma atividade que só você faz, que outra pessoa poderia aprender, e monte essa entrega como um projeto de desenvolvimento — não como um descarte de trabalho. A diferença entre as duas coisas é a presença do líder no processo."]
}, {
  slug: "como-desenvolver-sucessores",
  titulo: "Como desenvolver sucessores",
  categoria: "Liderança",
  data: "2026-05-14",
  tempoLeitura: "5 min",
  resumo: "Sem sucessor preparado, sua promoção trava, suas férias viram crise e seu legado se resume a apagar incêndios. Formar gente é o trabalho.",
  conteudo: ["Pergunta desconfortável: se você fosse promovido amanhã, quem assumiria seu lugar? Se a resposta é 'ninguém está pronto', você descobriu o motivo pelo qual talvez a promoção não venha. Organizações maduras não tiram um líder de uma posição sem reposição à altura.", "Desenvolver sucessores começa por separar desempenho de potencial. O melhor técnico do time não é automaticamente o próximo líder — liderança exige outro conjunto de habilidades e, principalmente, outra relação com o trabalho dos outros.", "A regra 70-20-10 é o caminho prático: 70% do desenvolvimento vem de experiências reais (liderar um projeto, substituir você nas férias, apresentar para a diretoria), 20% de troca e mentoria, 10% de cursos. Se o seu plano de sucessão é só uma lista de treinamentos, ele não é um plano de sucessão.", "E há o componente que ninguém conta: desenvolver sucessor exige abrir mão de palco. Levar o liderado para a reunião importante, deixá-lo apresentar o resultado que vocês construíram juntos, dar crédito em público. Líderes inseguros não formam sucessores — formam dependentes."]
}, {
  slug: "comunicacao-que-gera-resultados",
  titulo: "Comunicação que gera resultados",
  categoria: "Comunicação",
  data: "2026-04-30",
  tempoLeitura: "4 min",
  resumo: "Times não falham por falta de talento, falham por desalinhamento. A comunicação que funciona é a que confirma entendimento, não a que apenas transmite.",
  conteudo: ["A maioria dos problemas chamados de 'falha de comunicação' é, na verdade, falha de validação. A mensagem foi enviada, o e-mail foi lido, a reunião aconteceu — mas ninguém confirmou se o entendimento de quem recebeu era o mesmo de quem enviou.", "Comunicação eficaz no trabalho tem três camadas: clareza (a mensagem é específica? tem prazo, responsável e critério de pronto?), canal (esse assunto pede conversa, mensagem ou documento?) e confirmação (a outra pessoa consegue explicar com as próprias palavras o que foi combinado?).", "Para líderes, há uma camada extra: a comunicação repetida. O que você falou uma vez, a equipe ainda não ouviu. As prioridades do trimestre precisam ser ditas na reunião geral, repetidas nas 1:1s, refletidas nas decisões. Quando você estiver cansado de repetir, a mensagem está começando a chegar.", "Um teste simples para esta semana: ao final de cada alinhamento importante, peça — 'me conta o que você entendeu que vamos fazer?'. As respostas vão surpreender. E cada surpresa é um problema que você acabou de evitar."]
}, {
  slug: "o-futuro-da-aprendizagem-corporativa",
  titulo: "O futuro da aprendizagem corporativa",
  categoria: "Educação Corporativa",
  data: "2026-04-16",
  tempoLeitura: "5 min",
  resumo: "O treinamento como evento isolado morreu. O futuro é a aprendizagem no fluxo de trabalho: contínua, aplicada e conectada aos desafios reais do negócio.",
  conteudo: ["Durante décadas, educação corporativa significou tirar pessoas do trabalho para colocá-las em uma sala. O modelo tinha um problema conhecido: semanas depois, a maior parte do conteúdo havia evaporado, porque aprendizado sem aplicação imediata não fixa.", "A virada em curso é a aprendizagem no fluxo de trabalho: conteúdos curtos no momento da necessidade, projetos reais como sala de aula, líderes atuando como educadores das próprias equipes. A pergunta deixou de ser 'qual curso oferecer?' e passou a ser 'qual desafio do negócio pode ensinar isso?'.", "Isso não mata o treinamento formal — redefine o papel dele. Fundamentos, certificações e momentos de imersão continuam valiosos. O que muda é a arquitetura: o curso é o início da jornada, não a jornada inteira. O que vem depois (prática, feedback, comunidade) é o que transforma informação em competência.", "Para quem lidera T&D, o indicador também muda: menos horas de treinamento realizadas, mais problemas de negócio resolvidos por gente que aprendeu fazendo. Educação corporativa madura se mede no resultado, não na lista de presença."]
}, {
  slug: "o-que-o-pipeline-de-lideranca-ensina-sobre-carreira",
  titulo: "O que o Pipeline de Liderança ensina sobre carreira",
  categoria: "Carreira",
  data: "2026-04-02",
  tempoLeitura: "4 min",
  resumo: "Cada subida de degrau na carreira exige abandonar parte do que te trouxe até aqui. Quem não entende isso sobe de cargo, mas não de nível.",
  conteudo: ["O Pipeline de Liderança, de Ram Charan e coautores, tem uma tese simples e incômoda: a carreira não é uma escada contínua, é uma série de passagens — e cada passagem exige abandonar habilidades, valores e usos do tempo que funcionavam no nível anterior.", "O exemplo clássico é a primeira passagem: de gerenciar a si mesmo a gerenciar outros. O novo gestor que continua competindo em execução com a própria equipe não fez a passagem — apenas mudou de crachá. O sintoma é visível: agenda lotada, time parado, tudo passa por ele.", "A lição vale para quem nem quer liderar pessoas: especialistas também têm passagens (de executar a influenciar, de resolver a antecipar). Em qualquer trilha, a pergunta de carreira mais útil não é 'o que preciso aprender?', mas 'o que preciso parar de fazer?'.", "Use o conceito como diagnóstico: olhe sua semana e identifique quanto do seu tempo está no trabalho do seu nível atual e quanto ficou preso no nível anterior. A distância entre os dois é o tamanho da sua próxima conversa de desenvolvimento."]
}];

/* ===== data/biblioteca.ts ===== */
window.APF.categoriasBiblioteca = ["Livros", "Filmes", "Podcasts", "Artigos"];
window.APF.itensBiblioteca = [{
  titulo: "Pipeline de Liderança",
  autor: "Ram Charan, Stephen Drotter e James Noel",
  categoria: "Livros",
  resumo: "Apresenta as seis passagens de carreira que transformam um colaborador individual em líder de uma organização, mostrando que cada transição exige novas habilidades, novos valores e nova gestão do tempo.",
  aplicacaoPratica: "Use o mapa de passagens para diagnosticar onde você (ou seus liderados) estão presos: quais atividades do nível anterior ainda ocupam a agenda e precisam ser delegadas."
}, {
  titulo: "Os 7 Hábitos das Pessoas Altamente Eficazes",
  autor: "Stephen Covey",
  categoria: "Livros",
  resumo: "Clássico do desenvolvimento pessoal que organiza a eficácia em sete hábitos, da vitória privada (proatividade, começar com o fim em mente, primeiro o mais importante) à vitória pública (ganha-ganha, compreender antes de ser compreendido, sinergia).",
  aplicacaoPratica: "Comece pela matriz urgente × importante (hábito 3): classifique sua semana e meça quanto tempo você passa no quadrante importante e não urgente — onde mora a prevenção e o desenvolvimento."
}, {
  titulo: "Comece pelo Porquê",
  autor: "Simon Sinek",
  categoria: "Livros",
  resumo: "Propõe o Círculo Dourado: organizações e líderes inspiradores comunicam de dentro para fora — primeiro o porquê (propósito), depois o como (processo) e só então o quê (produto). Pessoas não compram o que você faz, compram o porquê você faz.",
  aplicacaoPratica: "Antes de comunicar uma mudança à equipe, escreva o porquê em uma frase. Se você não consegue, a equipe também não vai entender — e vai resistir."
}, {
  titulo: "Mindset",
  autor: "Carol Dweck",
  categoria: "Livros",
  resumo: "Diferencia o mindset fixo (acreditar que talento é inato) do mindset de crescimento (acreditar que habilidades se desenvolvem com esforço e estratégia), e mostra como essa crença molda carreiras, equipes e culturas inteiras.",
  aplicacaoPratica: "Revise como você elogia: trocar 'você é muito inteligente' por 'você se esforçou e encontrou um bom caminho' desloca o foco do talento para o processo — em filhos, alunos e equipes."
}, {
  titulo: "O Monge e o Executivo",
  autor: "James C. Hunter",
  categoria: "Livros",
  resumo: "Por meio de uma fábula, apresenta a liderança servidora: liderar é identificar e atender as necessidades legítimas das pessoas, construindo autoridade por meio de serviço e sacrifício, e não pelo poder do cargo.",
  aplicacaoPratica: "Separe necessidade de vontade ao atender a equipe: dar o que as pessoas precisam para crescer (feedback, desafio, limites) nem sempre é dar o que elas querem."
}, {
  titulo: "Fome de Poder",
  autor: "Direção: John Lee Hancock",
  categoria: "Filmes",
  resumo: "Conta a história de Ray Kroc e a transformação do McDonald's em franquia global. Levanta questões sobre visão de negócio, persistência, escala — e os limites éticos da ambição.",
  aplicacaoPratica: "Ótimo para discutir em grupo: onde termina a visão estratégica e começa a quebra de confiança? Use em treinamentos sobre ética e negociação."
}, {
  titulo: "O Estagiário",
  autor: "Direção: Nancy Meyers",
  categoria: "Filmes",
  resumo: "Um aposentado de 70 anos torna-se estagiário em uma startup de moda. O filme trata de diversidade geracional, mentoria reversa, escuta e da diferença entre experiência e relevância.",
  aplicacaoPratica: "Use como gatilho para discutir convivência entre gerações no trabalho: o que cada geração da sua equipe tem a ensinar — e a aprender?"
}, {
  titulo: "Divã de CNPJ",
  autor: "Vários episódios sobre gestão e carreira",
  categoria: "Podcasts",
  resumo: "Conversas sobre os bastidores da vida corporativa brasileira: liderança, conflitos, carreira e saúde mental no trabalho, com convidados que trazem casos reais.",
  aplicacaoPratica: "Selecione um episódio por mês para ouvir com a equipe e discutir em 30 minutos: o que do episódio acontece aqui? O que faríamos diferente?"
}, {
  titulo: "Café com ADM",
  autor: "Podcast sobre administração e gestão",
  categoria: "Podcasts",
  resumo: "Entrevistas com gestores e empreendedores brasileiros sobre administração na prática: processos, pessoas, finanças e os erros que não aparecem nos livros.",
  aplicacaoPratica: "Indique episódios específicos como conteúdo de apoio em trilhas de desenvolvimento de novos gestores — funciona bem no trajeto ou na academia."
}, {
  titulo: "A diferença entre treinamento e desenvolvimento",
  autor: "Artigo de referência em Educação Corporativa",
  categoria: "Artigos",
  resumo: "Treinamento resolve uma lacuna específica de curto prazo (operar um sistema, atender um protocolo); desenvolvimento prepara a pessoa para desafios futuros (liderar, decidir, influenciar). Organizações maduras investem nos dois, com objetivos distintos.",
  aplicacaoPratica: "Audite o orçamento de T&D da sua área: quanto vai para treinamento (necessidade atual) e quanto para desenvolvimento (futuro)? O desequilíbrio extremo para qualquer lado é sinal de alerta."
}, {
  titulo: "Segurança psicológica e desempenho de equipes",
  autor: "Baseado nas pesquisas de Amy Edmondson",
  categoria: "Artigos",
  resumo: "Síntese das pesquisas que mostram que o maior preditor de desempenho de uma equipe não é o talento individual, mas a segurança psicológica: a crença compartilhada de que ninguém será punido por perguntar, errar ou discordar.",
  aplicacaoPratica: "Faça o teste silencioso: na última reunião do seu time, quantas pessoas discordaram abertamente de algo? Zero discordância raramente significa concordância — costuma significar medo ou desengajamento."
}];

/* ===== data/dinamicas.ts ===== */
window.APF.temasDinamicas = ["Liderança", "Comunicação", "Trabalho em equipe", "Produtividade", "Cultura"];
window.APF.dinamicas = [{
  titulo: "O Líder Cego",
  tema: "Liderança",
  duracao: "30 min",
  participantes: "8 a 20 pessoas, em duplas",
  objetivo: "Vivenciar a diferença entre dar ordens e orientar com clareza, e o impacto da confiança na relação líder-liderado.",
  comoConduzir: "Forme duplas: um participante vendado (liderado) e um guia (líder). O guia deve conduzir o vendado por um percurso com obstáculos usando apenas a voz. Na segunda rodada, inverta os papéis e proíba instruções diretas — só perguntas. No debrief, explore: como foi confiar? Que tipo de instrução funcionou melhor? O que isso revela sobre delegação?"
}, {
  titulo: "Delegação em Camadas",
  tema: "Liderança",
  duracao: "45 min",
  participantes: "Grupos de 4 a 6",
  objetivo: "Praticar os níveis de autonomia na delegação: executar, propor, decidir e informar, decidir com autonomia total.",
  comoConduzir: "Apresente um cenário de trabalho (ex.: organizar um evento interno). Cada grupo recebe a mesma tarefa, mas com um nível de autonomia diferente, descrito em um cartão secreto. Após 20 minutos de planejamento, os grupos apresentam e a plateia tenta adivinhar o nível de autonomia de cada um. Debrief: como o nível de autonomia mudou o engajamento e a qualidade?"
}, {
  titulo: "Telefone com Tradução",
  tema: "Comunicação",
  duracao: "25 min",
  participantes: "10 a 30 pessoas",
  objetivo: "Evidenciar como a mensagem se distorce a cada repasse e a importância de validar o entendimento.",
  comoConduzir: "Versão adulta do telefone sem fio: a mensagem inicial é uma instrução de trabalho realista com três detalhes críticos (prazo, responsável, condição). Compare a mensagem final com a original e calcule quantos detalhes sobreviveram. Na segunda rodada, permita que cada pessoa faça uma pergunta de validação antes de repassar. Compare os resultados e conecte com a prática de confirmar entendimentos em handoffs reais."
}, {
  titulo: "Feedback em Três Atos",
  tema: "Comunicação",
  duracao: "50 min",
  participantes: "Trios",
  objetivo: "Praticar o modelo Situação-Comportamento-Impacto em um ambiente seguro, com observador.",
  comoConduzir: "Em trios: A dá feedback a B sobre um caso fictício sorteado; C observa com um checklist (foi específico? descreveu comportamento ou julgou a pessoa? nomeou o impacto?). Rotacione os papéis três vezes. Feche com cada participante registrando um feedback real que precisa dar na semana seguinte — e a quem."
}, {
  titulo: "Escuta de Dois Minutos",
  tema: "Comunicação",
  duracao: "20 min",
  participantes: "Duplas",
  objetivo: "Experimentar escuta ativa sem interrupção e perceber o quanto normalmente escutamos para responder, não para compreender.",
  comoConduzir: "Em duplas, A fala por dois minutos sobre um desafio real de trabalho; B só escuta — sem interromper, aconselhar ou completar frases. Ao final, B resume o que entendeu e A avalia a precisão. Inverta. Debrief: o que foi mais difícil, falar sem ser interrompido ou escutar sem responder?"
}, {
  titulo: "Torre de Papel",
  tema: "Trabalho em equipe",
  duracao: "40 min",
  participantes: "Grupos de 4 a 6",
  objetivo: "Observar papéis emergentes (quem planeja, quem executa, quem é deixado de fora) e a relação entre planejamento e ação sob pressão de tempo.",
  comoConduzir: "Cada grupo recebe 20 folhas de papel e fita adesiva para construir a torre mais alta que fique em pé sozinha, em 15 minutos. Proibido falar nos primeiros 5 minutos (só planejamento por gestos ou desenho). No debrief: quem assumiu qual papel? O plano sobreviveu ao contato com a execução? Alguém ficou sem função?"
}, {
  titulo: "Quebra-cabeça Coletivo",
  tema: "Trabalho em equipe",
  duracao: "35 min",
  participantes: "3 a 5 grupos",
  objetivo: "Revelar que a meta da organização é maior que a meta de cada equipe — e que silos atrasam todo mundo.",
  comoConduzir: "Distribua quebra-cabeças entre os grupos, mas misture secretamente peças entre os envelopes. Os grupos só completam a tarefa quando percebem que precisam negociar e trocar peças entre si. Debrief: quanto tempo levou para alguém olhar para fora do próprio grupo? O que isso espelha na empresa?"
}, {
  titulo: "Leilão de Tempo",
  tema: "Produtividade",
  duracao: "40 min",
  participantes: "8 a 25 pessoas",
  objetivo: "Tornar visíveis as escolhas de alocação de tempo e provocar reflexão sobre prioridades reais versus declaradas.",
  comoConduzir: "Cada participante recebe 100 pontos representando suas horas semanais de trabalho e uma lista de atividades típicas (reuniões, e-mails, execução, planejamento, desenvolvimento de pessoas, apagar incêndios). Primeiro distribui os pontos como a semana é hoje; depois, como deveria ser. As maiores diferenças viram compromissos de mudança com prazo."
}, {
  titulo: "A Matriz na Parede",
  tema: "Produtividade",
  duracao: "45 min",
  participantes: "Equipes intactas de até 12",
  objetivo: "Aplicar a matriz urgente × importante ao backlog real da equipe e tomar decisões de corte coletivamente.",
  comoConduzir: "Monte a matriz de Eisenhower em uma parede com fita. Cada pessoa escreve suas atividades recorrentes em post-its e as posiciona. Em grupo, desafiem os posicionamentos: isso é urgente para quem? Importante para qual objetivo? Feche com três decisões coletivas: o que delegar, o que agendar e o que eliminar."
}, {
  titulo: "Linha do Tempo da Cultura",
  tema: "Cultura",
  duracao: "60 min",
  participantes: "Equipes intactas de até 15",
  objetivo: "Reconstruir coletivamente os momentos que formaram a cultura do time e nomear o que deve ser preservado ou mudado.",
  comoConduzir: "Em uma linha do tempo na parede, cada pessoa adiciona post-its com momentos marcantes da história da equipe (conquistas, crises, chegadas e saídas). Em grupo, identifiquem: que valores esses momentos revelam na prática? Quais comportamentos queremos levar adiante e quais queremos aposentar? Registre os acordos em um manifesto de uma página."
}, {
  titulo: "Valores em Cena",
  tema: "Cultura",
  duracao: "50 min",
  participantes: "Grupos de 4 a 6",
  objetivo: "Traduzir valores organizacionais abstratos em comportamentos observáveis do dia a dia.",
  comoConduzir: "Cada grupo sorteia um valor da empresa e prepara duas cenas curtas: uma em que o valor é vivido e outra em que é violado — ambas com situações realistas do cotidiano. Após cada apresentação, a plateia identifica o valor e discute: essa violação acontece aqui? O que toleramos que contradiz o que pregamos?"
}];

/* ===== data/comunicacao.ts ===== */
window.APF.subtemasComunicacao = [{
  titulo: "Comunicação empresarial",
  descricao: "Como a informação circula (ou trava) dentro das organizações: canais, fluxos, comunicação institucional e o custo invisível do desalinhamento entre áreas."
}, {
  titulo: "Comunicação assertiva",
  descricao: "Dizer o que precisa ser dito com clareza e respeito — nem agressividade que rompe relações, nem passividade que acumula ressentimento."
}, {
  titulo: "Tipos de feedback",
  descricao: "Feedback positivo, de desenvolvimento e de correção: quando usar cada um, como estruturar a conversa e por que elogio genérico não desenvolve ninguém."
}, {
  titulo: "Escuta ativa",
  descricao: "A habilidade mais subestimada da liderança: escutar para compreender (e não para responder), validar entendimento e fazer perguntas que abrem a conversa."
}, {
  titulo: "Comunicação não violenta",
  descricao: "O método de Marshall Rosenberg em quatro passos — observação, sentimento, necessidade e pedido — aplicado a conflitos e conversas tensas no trabalho."
}, {
  titulo: "Comunicação para líderes",
  descricao: "O líder comunica o tempo todo, inclusive quando silencia: alinhamento de prioridades, comunicação de mudanças e a arte de repetir a mensagem sem perder a equipe."
}, {
  titulo: "Conversas difíceis",
  descricao: "Como preparar e conduzir conversas que adiamos: desempenho abaixo do esperado, comportamentos inadequados, desligamentos e negociações delicadas."
}, {
  titulo: "Alinhamento de expectativas",
  descricao: "A maior parte das frustrações no trabalho nasce de expectativas nunca verbalizadas. Como explicitar combinados sobre entregas, papéis e prioridades."
}, {
  titulo: "Gestão de conflitos",
  descricao: "Conflito não é problema — conflito mal conduzido é. Estilos de resposta ao conflito, mediação entre pares e como transformar divergência em decisão melhor."
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "site-preview/apf-data.js", error: String((e && e.message) || e) }); }

// site-preview/apf.js
try { (() => {
/* apf.js — Portal Ana Paula Fiório (versão estática navegável)
   Config do Tailwind (Play CDN) + navbar/footer compartilhados + interações + renderizadores de página. */

/* ===================== Tailwind config (tokens via CSS vars) ===================== */
(function configTailwind() {
  const c = v => `hsl(var(${v}) / <alpha-value>)`;
  const cfg = {
    theme: {
      extend: {
        colors: {
          background: c('--background'),
          foreground: c('--foreground'),
          card: {
            DEFAULT: c('--card'),
            foreground: c('--card-foreground')
          },
          popover: {
            DEFAULT: c('--popover'),
            foreground: c('--popover-foreground')
          },
          primary: {
            DEFAULT: c('--primary'),
            foreground: c('--primary-foreground'),
            dark: c('--primary-dark')
          },
          secondary: {
            DEFAULT: c('--secondary'),
            foreground: c('--secondary-foreground'),
            dark: c('--secondary-dark')
          },
          muted: {
            DEFAULT: c('--muted'),
            foreground: c('--muted-foreground')
          },
          accent: {
            DEFAULT: c('--accent'),
            foreground: c('--accent-foreground')
          },
          destructive: {
            DEFAULT: c('--destructive'),
            foreground: c('--destructive-foreground')
          },
          border: c('--border'),
          input: c('--input'),
          ring: c('--ring'),
          rose: {
            100: c('--rose-100'),
            300: c('--rose-300'),
            500: c('--rose-500'),
            600: c('--rose-600'),
            700: c('--rose-700')
          },
          sage: {
            200: c('--sage-200'),
            400: c('--sage-400'),
            600: c('--sage-600'),
            800: c('--sage-800'),
            900: c('--sage-900')
          },
          honey: {
            300: c('--honey-300'),
            500: c('--honey-500')
          },
          warm: {
            50: c('--warm-50'),
            100: c('--warm-100'),
            200: c('--warm-200'),
            400: c('--warm-400'),
            600: c('--warm-600'),
            900: c('--warm-900'),
            950: c('--warm-950')
          }
        },
        fontFamily: {
          heading: ['Poppins', 'system-ui', 'sans-serif'],
          body: ['Poppins', 'system-ui', 'sans-serif'],
          sans: ['Poppins', 'system-ui', 'sans-serif']
        },
        borderRadius: {
          lg: '0.75rem',
          xl: '1rem',
          '2xl': '1rem'
        },
        maxWidth: {
          '6xl': '72rem'
        }
      }
    }
  };
  if (window.tailwind) window.tailwind.config = cfg;else window.tailwind = {
    config: cfg
  };
})();

/* ===================== helpers ===================== */
const ico = (name, cls) => `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ''}></i>`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const num = i => String(i + 1).padStart(2, '0');
function qs(name) {
  return new URLSearchParams(location.search).get(name);
}

/* ===================== navbar + footer ===================== */
const TEMAS = [{
  href: 'educacao-corporativa.html',
  label: 'Educação Corporativa'
}, {
  href: 'comunicacao.html',
  label: 'Comunicação'
}, {
  href: 'lideranca.html',
  label: 'Liderança'
}];
const CONTEUDO = [{
  href: 'ferramentas.html',
  label: 'Ferramentas'
}, {
  href: 'biblioteca.html',
  label: 'Biblioteca'
}, {
  href: 'laboratorio.html',
  label: 'Laboratório'
}, {
  href: 'insights.html',
  label: 'Insights'
}, {
  href: 'sala-do-instrutor.html',
  label: 'Sala do Instrutor'
}];
function aqui() {
  return location.pathname.split('/').pop() || 'index.html';
}
function renderNavbar() {
  const atual = aqui();
  const ativoTema = h => atual === h;
  const conteudoAtivo = CONTEUDO.some(l => atual === l.href);
  return `
  <header class="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
    <nav aria-label="Navegação principal" class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
      <a href="index.html" class="font-heading text-lg tracking-tight text-foreground">Ana Paula <em class="text-primary not-italic font-semibold" style="font-style:italic">Fiório</em></a>
      <ul class="hidden items-center gap-5 lg:flex">
        ${TEMAS.map(l => `<li><a href="${l.href}" ${ativoTema(l.href) ? 'aria-current="page"' : ''} class="link-vivo text-sm transition-colors hover:text-foreground ${ativoTema(l.href) ? 'font-medium text-primary' : 'font-normal text-muted-foreground'}">${l.label}</a></li>`).join('')}
        <li class="relative" id="grupo-conteudo">
          <button type="button" aria-haspopup="true" aria-expanded="false" class="inline-flex items-center gap-1 text-sm transition-colors hover:text-foreground ${conteudoAtivo ? 'font-medium text-primary' : 'font-normal text-muted-foreground'}">
            Conteúdo ${ico('chevron-down', 'h-3.5 w-3.5 transition-transform')}
          </button>
          <div class="dropdown-conteudo absolute right-0 top-full mt-2 hidden min-w-52 rounded-lg border border-border bg-popover p-2 shadow-lg shadow-foreground/5">
            <ul class="flex flex-col">
              ${CONTEUDO.map(l => `<li><a href="${l.href}" class="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted ${atual === l.href ? 'font-medium text-primary' : 'text-foreground'}">${l.label}</a></li>`).join('')}
            </ul>
          </div>
        </li>
        <li><a href="contato.html" class="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-primary hover:text-primary-foreground">Fale comigo</a></li>
      </ul>
      <button type="button" id="btn-mobile" class="rounded-lg p-2 text-foreground lg:hidden" aria-expanded="false" aria-label="Abrir menu">${ico('menu')}</button>
    </nav>
    <div id="menu-mobile" class="hidden border-t border-border lg:hidden">
      <ul class="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
        ${TEMAS.map(l => `<li><a href="${l.href}" class="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">${l.label}</a></li>`).join('')}
        <li class="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Conteúdo</li>
        ${CONTEUDO.map(l => `<li><a href="${l.href}" class="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted">${l.label}</a></li>`).join('')}
        <li class="pt-2"><a href="contato.html" class="block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">Fale comigo</a></li>
      </ul>
    </div>
  </header>`;
}
function renderFooter() {
  const colunas = [{
    titulo: 'Conteúdos',
    links: [['educacao-corporativa.html', 'Educação Corporativa'], ['comunicacao.html', 'Comunicação'], ['lideranca.html', 'Liderança'], ['insights.html', 'Insights']]
  }, {
    titulo: 'Na prática',
    links: [['ferramentas.html', 'Ferramentas'], ['laboratorio.html', 'Laboratório de Dinâmicas'], ['biblioteca.html', 'Biblioteca'], ['sala-do-instrutor.html', 'Sala do Instrutor']]
  }];
  const redes = [['#', 'Instagram', 'instagram'], ['#', 'LinkedIn', 'linkedin'], ['#', 'YouTube', 'youtube'], ['contato.html', 'Contato por e-mail', 'mail']];
  return `
  <footer class="dark border-t border-border bg-background text-foreground">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
      <div>
        <p class="font-heading text-xl">Ana Paula <em class="text-primary">Fiório</em></p>
        <p class="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">Conteúdo, ferramentas e dinâmicas para quem desenvolve pessoas. Com método, sem jargão.</p>
        <ul class="mt-6 flex gap-3">
          ${redes.map(([href, label, icon]) => `<li><a href="${href}" aria-label="${label}" class="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">${ico(icon, 'h-4 w-4')}</a></li>`).join('')}
        </ul>
      </div>
      ${colunas.map(col => `
        <nav aria-label="${col.titulo}">
          <h2 class="font-body text-sm font-medium uppercase tracking-wider text-accent">${col.titulo}</h2>
          <ul class="mt-4 space-y-2">
            ${col.links.map(([h, l]) => `<li><a href="${h}" class="text-sm text-muted-foreground transition-colors hover:text-primary">${l}</a></li>`).join('')}
          </ul>
        </nav>`).join('')}
    </div>
    <div class="border-t border-border">
      <p class="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">© ${new Date().getFullYear()} Ana Paula Fiório · Educação Corporativa, comunicação e liderança. Todos os direitos reservados.</p>
    </div>
  </footer>`;
}

/* ===================== cabeçalho editorial de páginas internas ===================== */
function pageHeader({
  rotulo,
  titulo,
  descricao
}) {
  return `
  <section class="border-b border-border">
    <div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div class="revelar">
        <p class="flex items-center gap-3 text-sm font-medium uppercase tracking-[0.25em] text-muted-foreground"><span class="text-accent" aria-hidden="true">✳</span>${rotulo}</p>
        <h1 class="mt-6 max-w-4xl font-heading leading-[1.05]" style="font-size:clamp(2.2rem,5.5vw,4rem)">${titulo}</h1>
        <p class="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">${descricao}</p>
      </div>
    </div>
  </section>`;
}

/* ===================== renderizadores de páginas internas ===================== */
const PAGES = {
  lideranca() {
    const temas = window.APF.temasLideranca;
    return pageHeader({
      rotulo: 'Trilha de liderança',
      titulo: 'Liderança se aprende — e se aprende <em>na prática</em>',
      descricao: 'Sete temas essenciais, sempre na mesma estrutura: o conceito explicado sem jargão, um exemplo real, uma ferramenta aplicável e um exercício para fazer esta semana.'
    }) + `
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <ol class="grid gap-6 md:grid-cols-2">
        ${temas.map((t, i) => `
          <li><a href="lideranca-tema.html?slug=${t.slug}" class="group flex h-full flex-col rounded-lg border border-border bg-card p-7 transition-colors hover:border-primary">
            <span class="font-heading text-3xl text-accent">${num(i)}</span>
            <h3 class="mt-3 font-heading text-2xl group-hover:text-primary">${t.titulo}</h3>
            <p class="mt-3 flex-1 text-sm font-light leading-relaxed text-muted-foreground">${t.resumo}</p>
            <span class="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">Conceito, exemplo, ferramenta e exercício ${ico('arrow-right', 'h-4 w-4 transition-transform group-hover:translate-x-1')}</span>
          </a></li>`).join('')}
      </ol>
    </section>`;
  },
  'lideranca-tema'() {
    const temas = window.APF.temasLideranca;
    const slug = qs('slug') || temas[0].slug;
    const i = temas.findIndex(t => t.slug === slug);
    const tema = temas[i] || temas[0];
    const ant = temas[i - 1],
      prox = temas[i + 1];
    const blocos = [['conceito', 'Conceito', 'book-open'], ['exemploReal', 'Exemplo real', 'briefcase'], ['ferramenta', 'Ferramenta', 'wrench'], ['exercicioPratico', 'Exercício prático', 'dumbbell']];
    document.title = `${tema.titulo} | Liderança`;
    return `
    <section class="border-b border-border bg-muted/50">
      <div class="mx-auto max-w-4xl px-4 py-14 sm:px-6 md:py-16">
        <a href="lideranca.html" class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">${ico('arrow-left', 'h-4 w-4')} Trilha de liderança</a>
        <p class="mt-6 font-heading text-3xl text-accent">${num(i)}</p>
        <h1 class="mt-2 font-heading text-4xl leading-tight md:text-5xl">${tema.titulo}</h1>
        <p class="mt-5 text-lg font-light leading-relaxed text-muted-foreground">${tema.resumo}</p>
      </div>
    </section>
    <article class="mx-auto max-w-4xl space-y-8 px-4 py-14 sm:px-6">
      ${blocos.map(([k, t, icon]) => `
        <section class="rounded-lg border border-border bg-card p-7">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-secondary">${ico(icon, 'h-4 w-4')}</span>
            <h2 class="font-heading text-xl">${t}</h2>
          </div>
          <p class="mt-4 font-light leading-relaxed text-muted-foreground">${tema[k]}</p>
        </section>`).join('')}
    </article>
    <nav aria-label="Navegar entre temas" class="mx-auto flex max-w-4xl flex-wrap justify-between gap-4 border-t border-border px-4 py-10 sm:px-6">
      ${ant ? `<a href="lideranca-tema.html?slug=${ant.slug}" class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">${ico('arrow-left', 'h-4 w-4')} ${ant.titulo}</a>` : '<span></span>'}
      ${prox ? `<a href="lideranca-tema.html?slug=${prox.slug}" class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">${prox.titulo} ${ico('arrow-right', 'h-4 w-4')}</a>` : ''}
    </nav>`;
  },
  ferramentas() {
    const fs = window.APF.ferramentas;
    return pageHeader({
      rotulo: 'Ferramentas práticas',
      titulo: 'Métodos consagrados, explicados para <em>usar amanhã</em>',
      descricao: 'Cada ferramenta vem com o essencial: o que é, como funciona e — principalmente — quando faz sentido usar. Sem jargão, sem complexidade desnecessária.'
    }) + `
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div class="grid gap-6 md:grid-cols-2">
        ${fs.map(f => `
          <article class="flex h-full flex-col rounded-lg border border-border bg-card p-7">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-accent">${ico('wrench', 'h-4 w-4')}</span>
                <h3 class="font-heading text-xl">${f.nome}</h3>
              </div>
              <span class="rounded-lg bg-secondary/10 px-3 py-1 text-xs font-medium text-secondary">${f.categoria}</span>
            </div>
            <p class="mt-4 flex-1 text-sm font-light leading-relaxed text-muted-foreground">${f.descricao}</p>
            <div class="mt-5 rounded-lg bg-muted/70 p-4">
              <p class="text-xs font-medium uppercase tracking-wider text-primary">Quando usar</p>
              <p class="mt-1 text-sm font-light leading-relaxed text-muted-foreground">${f.quandoUsar}</p>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
  },
  insights() {
    const fmt = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
    const posts = window.APF.posts;
    return pageHeader({
      rotulo: 'Insights',
      titulo: 'Ideias que mudam a forma de <em>trabalhar</em>',
      descricao: 'Artigos curtos sobre liderança, comunicação e aprendizagem corporativa. Leitura de poucos minutos, reflexão para a semana inteira.'
    }) + `
    <section class="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div class="space-y-6">
        ${posts.map(p => `
          <article class="group rounded-lg border border-border bg-card p-7 transition-colors hover:border-primary">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span class="font-medium uppercase tracking-wider text-secondary">${p.categoria}</span><span>·</span>
              <time datetime="${p.data}">${fmt.format(new Date(p.data))}</time><span>·</span><span>${p.tempoLeitura} de leitura</span>
            </div>
            <h3 class="mt-3 font-heading text-2xl leading-snug"><a href="insights-post.html?slug=${p.slug}" class="group-hover:text-primary">${p.titulo}</a></h3>
            <p class="mt-2 font-light leading-relaxed text-muted-foreground">${p.resumo}</p>
            <a href="insights-post.html?slug=${p.slug}" class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">Ler artigo ${ico('arrow-right', 'h-4 w-4 transition-transform group-hover:translate-x-1')}</a>
          </article>`).join('')}
      </div>
    </section>`;
  },
  'insights-post'() {
    const fmt = new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
    const posts = window.APF.posts;
    const slug = qs('slug') || posts[0].slug;
    const p = posts.find(x => x.slug === slug) || posts[0];
    document.title = `${p.titulo} | Ana Paula Fiório`;
    return `
    <article>
      <header class="border-b border-border bg-muted/50">
        <div class="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <a href="insights.html" class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">${ico('arrow-left', 'h-4 w-4')} Todos os insights</a>
          <div class="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span class="font-medium uppercase tracking-wider text-secondary">${p.categoria}</span><span>·</span>
            <time datetime="${p.data}">${fmt.format(new Date(p.data))}</time><span>·</span><span>${p.tempoLeitura} de leitura</span>
          </div>
          <h1 class="mt-4 font-heading text-4xl leading-tight md:text-5xl">${p.titulo}</h1>
          <p class="mt-5 text-lg font-light leading-relaxed text-muted-foreground">${p.resumo}</p>
        </div>
      </header>
      <div class="mx-auto max-w-3xl space-y-6 px-4 py-14 sm:px-6">
        ${p.conteudo.map(par => `<p class="font-light leading-relaxed text-foreground/90 md:text-lg">${par}</p>`).join('')}
      </div>
      <footer class="mx-auto max-w-3xl border-t border-border px-4 py-10 sm:px-6">
        <p class="font-light text-muted-foreground">Gostou da reflexão? Leve esse tema para a sua equipe em um <a href="contato.html" class="font-medium text-primary hover:underline">treinamento in company</a>.</p>
      </footer>
    </article>`;
  },
  comunicacao() {
    const subs = window.APF.subtemasComunicacao;
    return pageHeader({
      rotulo: 'Comunicação no Mercado',
      titulo: 'A habilidade que define carreiras: <em>comunicar bem</em>',
      descricao: 'Da escuta ativa às conversas que adiamos: nove subtemas para quem precisa alinhar expectativas, dar feedback que desenvolve e transformar conflito em decisão melhor.'
    }) + `
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p class="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground"><span class="text-accent">✳</span> Conteúdos destes temas em produção — a estrutura abaixo mostra o que está chegando.</p>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        ${subs.map((s, i) => `
          <article class="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-secondary">
            <span class="font-heading text-2xl text-accent">${num(i)}</span>
            <h3 class="mt-3 font-heading text-lg">${s.titulo}</h3>
            <p class="mt-2 text-sm font-light leading-relaxed text-muted-foreground">${s.descricao}</p>
          </article>`).join('')}
      </div>
    </section>
    <section class="dark bg-background py-16 text-foreground">
      <div class="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 class="mx-auto max-w-3xl font-heading text-2xl leading-snug md:text-3xl">“A maior parte dos problemas chamados de <em>falha de comunicação</em> é, na verdade, falha de validação: ninguém confirmou o entendimento.”</h2>
        <p class="mt-4 text-sm text-muted-foreground">Princípio que atravessa todos os conteúdos desta seção</p>
      </div>
    </section>`;
  },
  'educacao-corporativa'() {
    const fundamentos = [['O que é Educação Corporativa', 'É a estratégia que conecta o desenvolvimento das pessoas aos objetivos do negócio. Vai além de oferecer cursos: envolve diagnosticar lacunas, desenhar trilhas, formar líderes-educadores e medir o impacto da aprendizagem nos resultados. Quando bem feita, transforma a empresa em uma escola viva do próprio negócio.'], ['Treinamento × Desenvolvimento', 'Treinamento resolve o agora: uma lacuna específica, de curto prazo — operar um sistema, cumprir um protocolo, vender um novo produto. Desenvolvimento prepara o depois: amplia repertório para desafios futuros, como liderar, decidir sob ambiguidade e influenciar. Confundir os dois é o erro mais comum dos planos de T&D — e a razão de tanto orçamento mal investido.'], ['Aprendizagem contínua', 'O conhecimento que sustenta uma carreira não cabe mais em uma formação inicial. Aprendizagem contínua é tratar o aprender como hábito de trabalho: micro-conteúdos no fluxo do dia, projetos como sala de aula, erro tratado como dado e não como culpa. A regra 70-20-10 resume bem: a maior parte do aprendizado acontece fazendo.'], ['Cultura de aprendizagem', 'Cultura de aprendizagem não se decreta em mural — se constrói em comportamento: líderes que perguntam “o que aprendemos com isso?” depois de cada projeto, espaço seguro para admitir que não se sabe, conhecimento que circula entre áreas em vez de ficar trancado em silos. O sinal de maturidade é simples: as pessoas ensinam umas às outras sem que o RH precise organizar.']];
    const formatos = [['file-text', 'Artigos', 'Como diagnosticar necessidades reais de treinamento', 'Antes de contratar o curso, descubra se o problema é de conhecimento, de processo ou de gestão — porque treinamento não conserta processo quebrado.'], ['pie-chart', 'Infográfico', 'A regra 70-20-10 visualizada', 'Um mapa visual de onde o aprendizado realmente acontece: experiências práticas, trocas com outras pessoas e educação formal — e como combinar os três.'], ['play-circle', 'Vídeo curto', 'Treinamento ou desenvolvimento? Decida em 3 perguntas', 'Em menos de cinco minutos: as três perguntas que classificam qualquer demanda de T&D e evitam investir no formato errado.'], ['file-text', 'Artigos', 'Líder-educador: o multiplicador que toda empresa já tem', 'Por que o gestor direto é o maior canal de aprendizagem da organização — e como prepará-lo para esse papel sem sobrecarregar a agenda.'], ['pie-chart', 'Infográfico', 'Jornada de aprendizagem: do curso ao comportamento', 'As etapas entre assistir uma aula e mudar a forma de trabalhar: prática guiada, feedback, reforço e medição de impacto.'], ['play-circle', 'Vídeo curto', 'Como medir resultado de treinamento sem planilha mágica', 'Os quatro níveis de avaliação explicados com exemplos do dia a dia: reação, aprendizado, comportamento e resultado.']];
    return pageHeader({
      rotulo: 'Fundamentos',
      titulo: 'Educação Corporativa, do conceito à <em>cultura</em>',
      descricao: 'Entenda o que sustenta a aprendizagem nas organizações: a diferença entre treinar e desenvolver, o hábito da aprendizagem contínua e a construção de uma cultura que aprende.'
    }) + `
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div class="grid gap-6 md:grid-cols-2">
        ${fundamentos.map(([t, txt], i) => `
          <article class="rounded-lg border border-border bg-card p-7">
            <span class="font-heading text-2xl text-accent">${num(i)}</span>
            <h3 class="mt-3 font-heading text-xl">${t}</h3>
            <p class="mt-3 text-sm font-light leading-relaxed text-muted-foreground">${txt}</p>
          </article>`).join('')}
      </div>
    </section>
    <section class="dark bg-background py-16 text-foreground md:py-20">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <p class="text-sm font-medium uppercase tracking-widest text-accent">Conteúdos</p>
        <h2 class="mt-3 font-heading text-3xl md:text-4xl">Conteúdo que <em>cabe na rotina</em></h2>
        <p class="mt-3 max-w-2xl font-light text-muted-foreground">Artigos, infográficos e vídeos curtos — formatos pensados para absorver no intervalo, na viagem ou na preparação de uma aula. Todos em produção, temas já definidos abaixo.</p>
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          ${formatos.map(([icon, tipo, t, d]) => `
            <article class="rounded-lg border border-border bg-card p-6">
              <div class="flex items-center gap-2 text-accent">${ico(icon, 'h-4 w-4')}<span class="text-xs font-medium uppercase tracking-wider">${tipo}</span></div>
              <h3 class="mt-3 font-heading text-lg leading-snug">${t}</h3>
              <p class="mt-2 text-sm font-light leading-relaxed text-muted-foreground">${d}</p>
            </article>`).join('')}
        </div>
      </div>
    </section>`;
  },
  'sala-do-instrutor'() {
    const materiais = [['book-open', 'Planos de aula', 'Roteiros completos de encontros de treinamento — objetivos, sequência didática, tempo estimado e materiais necessários. Prontos para adaptar à sua turma.', ['Feedback na prática (4h)', 'Fundamentos de delegação (2h)', 'Comunicação assertiva para líderes (8h)']], ['users', 'Dinâmicas prontas', 'Atividades testadas em sala, com passo a passo de condução, perguntas de fechamento e variações para grupos pequenos e grandes.', ['Escuta em duplas', 'O nó humano', 'Mapa de expectativas']], ['clipboard-check', 'Avaliações', 'Instrumentos para medir aprendizagem antes e depois do treinamento — questionários de reação, testes de conhecimento e roteiros de observação de comportamento.', ['Avaliação de reação (modelo Kirkpatrick)', 'Pré e pós-teste de conteúdo', 'Roteiro de observação de feedback']]];
    return pageHeader({
      rotulo: 'Sala do Instrutor',
      titulo: 'Materiais de quem ensina para <em>quem ensina</em>',
      descricao: 'Um acervo de planos de aula, dinâmicas e instrumentos de avaliação para instrutores, facilitadores e profissionais de T&D que querem chegar prontos em sala.'
    }) + `
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div class="mb-12 flex items-start gap-4 rounded-lg border border-accent/60 bg-accent/10 p-5">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">${ico('hammer', 'h-4 w-4')}</span>
        <div><p class="font-medium">Materiais em preparação</p>
          <p class="mt-1 text-sm font-light leading-relaxed text-muted-foreground">Os planos de aula, dinâmicas e avaliações estão sendo finalizados. Abaixo, o que está chegando. Quer ser avisado quando publicarmos? <a href="contato.html" class="font-medium text-primary underline-offset-2 hover:underline">Manda uma mensagem.</a></p>
        </div>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        ${materiais.map(([icon, t, d, ex]) => `
          <article class="flex h-full flex-col rounded-lg border border-border bg-card p-7">
            <span class="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-accent">${ico(icon, 'h-4 w-4')}</span>
            <h3 class="mt-4 font-heading text-xl">${t}</h3>
            <p class="mt-3 flex-1 text-sm font-light leading-relaxed text-muted-foreground">${d}</p>
            <div class="mt-5 rounded-lg bg-muted/70 p-4">
              <p class="text-xs font-medium uppercase tracking-wider text-primary">Em breve</p>
              <ul class="mt-2 space-y-1">${ex.map(e => `<li class="text-sm font-light leading-relaxed text-muted-foreground">${e}</li>`).join('')}</ul>
            </div>
          </article>`).join('')}
      </div>
    </section>`;
  },
  biblioteca() {
    return pageHeader({
      rotulo: 'Biblioteca de conteúdos',
      titulo: 'Curadoria com <em>aplicação prática</em>',
      descricao: 'Não é só uma lista de recomendações: cada livro, filme, podcast ou artigo vem com um resumo honesto e uma sugestão concreta de como aplicar no seu trabalho.'
    }) + `<section class="mx-auto max-w-6xl px-4 py-16 sm:px-6"><div id="filtro-biblioteca"></div></section>`;
  },
  laboratorio() {
    return pageHeader({
      rotulo: 'Laboratório de Dinâmicas',
      titulo: 'Dinâmicas testadas, prontas para <em>aplicar</em>',
      descricao: 'Escolha o tema do seu treinamento e encontre dinâmicas com objetivo claro, passo a passo de condução e perguntas de debrief — porque a dinâmica sem reflexão é só brincadeira.'
    }) + `<section class="mx-auto max-w-6xl px-4 py-16 sm:px-6"><div id="filtro-dinamicas"></div></section>`;
  },
  contato() {
    const redes = [['linkedin', 'LinkedIn', '/anapaulafiorio'], ['instagram', 'Instagram', '@anapaulafiorio'], ['mail', 'E-mail', 'contato@anapaulafiorio.com.br']];
    return pageHeader({
      rotulo: 'Fale comigo',
      titulo: 'Vamos conversar sobre o <em>desenvolvimento</em> do seu time?',
      descricao: 'Treinamentos in company, palestras, consultoria em educação corporativa e programas de desenvolvimento de líderes. Conte o que você precisa — respondo pessoalmente.'
    }) + `
    <section class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div class="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 class="font-heading text-2xl">Escreva o seu desafio</h2>
          <p class="mt-2 text-sm font-light leading-relaxed text-muted-foreground">Respondo pessoalmente — em geral em até dois dias úteis.</p>
          <div class="mt-8" id="form-contato-slot">
            <form id="form-contato" class="space-y-5">
              <div><label for="nome" class="block text-sm font-medium">Nome</label><input id="nome" required class="mt-2 w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"></div>
              <div><label for="email" class="block text-sm font-medium">E-mail</label><input id="email" type="email" required class="mt-2 w-full rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"></div>
              <div><label for="mensagem" class="block text-sm font-medium">Qual o seu desafio?</label><textarea id="mensagem" required rows="5" class="mt-2 w-full resize-y rounded-lg border border-input bg-card px-4 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"></textarea></div>
              <button type="submit" class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-dark">Enviar mensagem ${ico('send', 'h-4 w-4')}</button>
            </form>
          </div>
        </div>
        <aside aria-label="Outros canais de contato">
          <h2 class="font-heading text-2xl">Outros canais</h2>
          <ul class="mt-8 space-y-4">
            ${redes.map(([icon, nome, desc]) => `<li><a href="#" class="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-accent">${ico(icon, 'h-4 w-4')}</span><span><span class="block text-sm font-medium">${nome}</span><span class="block text-sm font-light text-muted-foreground">${desc}</span></span></a></li>`).join('')}
          </ul>
        </aside>
      </div>
    </section>`;
  }
};

/* ===================== filtros interativos ===================== */
function montarFiltroBiblioteca() {
  const wrap = document.getElementById('filtro-biblioteca');
  if (!wrap) return;
  const icones = {
    Livros: 'book-open',
    Filmes: 'film',
    Podcasts: 'mic',
    Artigos: 'newspaper'
  };
  const cats = ['Todos', ...window.APF.categoriasBiblioteca];
  let atual = 'Todos';
  function render() {
    const itens = atual === 'Todos' ? window.APF.itensBiblioteca : window.APF.itensBiblioteca.filter(i => i.categoria === atual);
    wrap.innerHTML = `
      <div role="group" aria-label="Filtrar por categoria" class="flex flex-wrap gap-2">
        ${cats.map(cat => `<button type="button" data-cat="${cat}" class="rounded-lg px-4 py-2 text-sm font-medium transition-colors ${atual === cat ? 'bg-secondary text-secondary-foreground' : 'border border-border bg-card text-muted-foreground hover:border-secondary hover:text-secondary'}">${cat}</button>`).join('')}
      </div>
      <p class="mt-4 text-sm text-muted-foreground">${itens.length} ${itens.length === 1 ? 'item' : 'itens'}${atual !== 'Todos' ? ' em ' + atual : ''}</p>
      <ul class="mt-6 grid gap-6 md:grid-cols-2">
        ${itens.map(item => `
          <li><article class="flex h-full flex-col rounded-lg border border-border bg-card p-7">
            <div class="flex items-center gap-2 text-secondary">${ico(icones[item.categoria], 'h-4 w-4')}<span class="text-xs font-medium uppercase tracking-wider">${item.categoria}</span></div>
            <h3 class="mt-3 font-heading text-xl">${item.titulo}</h3>
            <p class="mt-1 text-sm text-muted-foreground">${item.autor}</p>
            <p class="mt-3 flex-1 text-sm font-light leading-relaxed text-muted-foreground">${item.resumo}</p>
            <div class="mt-5 rounded-lg bg-muted/70 p-4"><p class="text-xs font-medium uppercase tracking-wider text-primary">Aplicação prática</p><p class="mt-1 text-sm font-light leading-relaxed text-muted-foreground">${item.aplicacaoPratica}</p></div>
          </article></li>`).join('')}
      </ul>`;
    wrap.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => {
      atual = b.dataset.cat;
      render();
      lucide.createIcons();
    }));
    lucide.createIcons();
  }
  render();
}
function montarFiltroDinamicas() {
  const wrap = document.getElementById('filtro-dinamicas');
  if (!wrap) return;
  let atual = 'Liderança';
  function render() {
    const lista = window.APF.dinamicas.filter(d => d.tema === atual);
    wrap.innerHTML = `
      <fieldset>
        <legend class="font-heading text-xl">Escolha um <em>tema</em></legend>
        <div class="mt-4 flex flex-wrap gap-2">
          ${window.APF.temasDinamicas.map(t => `<button type="button" data-tema="${t}" class="rounded-lg px-4 py-2 text-sm font-medium transition-colors ${atual === t ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary'}">${t}</button>`).join('')}
        </div>
      </fieldset>
      <p class="mt-5 text-sm text-muted-foreground">${lista.length} ${lista.length === 1 ? 'dinâmica' : 'dinâmicas'} de ${atual}</p>
      <ul class="mt-6 grid gap-6 md:grid-cols-2">
        ${lista.map(d => `
          <li><article class="flex h-full flex-col rounded-lg border border-border bg-card p-7">
            <h3 class="font-heading text-xl">${d.titulo}</h3>
            <dl class="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div class="flex items-center gap-1.5">${ico('clock', 'h-4 w-4 text-accent')}<dd>${d.duracao}</dd></div>
              <div class="flex items-center gap-1.5">${ico('users', 'h-4 w-4 text-accent')}<dd>${d.participantes}</dd></div>
            </dl>
            <p class="mt-4 text-sm font-light leading-relaxed text-muted-foreground"><strong class="font-medium text-foreground">Objetivo: </strong>${d.objetivo}</p>
            <div class="mt-4 flex-1 rounded-lg bg-muted/70 p-4"><p class="text-xs font-medium uppercase tracking-wider text-primary">Como conduzir</p><p class="mt-1 text-sm font-light leading-relaxed text-muted-foreground">${d.comoConduzir}</p></div>
          </article></li>`).join('')}
      </ul>`;
    wrap.querySelectorAll('[data-tema]').forEach(b => b.addEventListener('click', () => {
      atual = b.dataset.tema;
      render();
      lucide.createIcons();
    }));
    lucide.createIcons();
  }
  render();
}

/* ===================== interações globais ===================== */
function montarInteracoes() {
  // dropdown "Conteúdo"
  const grupo = document.getElementById('grupo-conteudo');
  if (grupo) {
    const btn = grupo.querySelector('button');
    const drop = grupo.querySelector('.dropdown-conteudo');
    const chev = grupo.querySelector('[data-lucide="chevron-down"]') || grupo.querySelector('svg');
    const abrir = v => {
      drop.classList.toggle('hidden', !v);
      btn.setAttribute('aria-expanded', String(v));
      if (chev) chev.style.transform = v ? 'rotate(180deg)' : '';
    };
    grupo.addEventListener('mouseenter', () => abrir(true));
    grupo.addEventListener('mouseleave', () => abrir(false));
    btn.addEventListener('click', () => abrir(drop.classList.contains('hidden')));
  }
  // menu mobile
  const btnM = document.getElementById('btn-mobile');
  const menuM = document.getElementById('menu-mobile');
  if (btnM && menuM) btnM.addEventListener('click', () => {
    const aberto = menuM.classList.toggle('hidden') === false;
    btnM.setAttribute('aria-expanded', String(aberto));
    btnM.innerHTML = aberto ? ico('x') : ico('menu');
    lucide.createIcons();
  });

  // reveal on scroll
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        io.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });
  document.querySelectorAll('.revelar').forEach(el => io.observe(el));

  // hero accordion (expansão no hover)
  document.querySelectorAll('[data-accordion]').forEach(acc => {
    const paineis = [...acc.querySelectorAll('[data-painel]')];
    const set = idx => paineis.forEach((p, i) => {
      p.style.flex = i === idx ? '6 1 0%' : '1 1 0%';
      p.querySelector('[data-legenda]').style.opacity = i === idx ? '1' : '0';
      p.querySelector('[data-rotulo]').style.opacity = i === idx ? '0' : '1';
    });
    paineis.forEach((p, i) => p.addEventListener('mouseenter', () => set(i)));
    set(0);
  });

  // cursor aditivo (anel)
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(pointer: fine)').matches) {
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(ring);
    let rx = 0,
      ry = 0,
      x = 0,
      y = 0;
    addEventListener('mousemove', e => {
      x = e.clientX;
      y = e.clientY;
      ring.style.opacity = '1';
    });
    addEventListener('mouseleave', () => {
      ring.style.opacity = '0';
    });
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      requestAnimationFrame(tick);
    };
    tick();
    const hov = 'a, button, [data-painel], input, textarea, label';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hov)) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hov)) ring.classList.remove('is-hover');
    });
  }

  // formulário de contato
  const form = document.getElementById('form-contato');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    document.getElementById('form-contato-slot').innerHTML = `
      <div class="flex items-start gap-4 rounded-lg border border-secondary/40 bg-secondary/10 p-6">
        ${ico('circle-check-big', 'h-5 w-5 shrink-0 text-secondary')}
        <div><p class="font-medium">Mensagem recebida</p><p class="mt-1 text-sm font-light leading-relaxed text-muted-foreground">Obrigada! Respondo pessoalmente em até dois dias úteis.</p></div>
      </div>`;
    lucide.createIcons();
  });

  // hero: animação palavra a palavra
  document.querySelectorAll('[data-hero-titulo]').forEach(el => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = el.innerHTML;
    // envolve cada palavra de texto em máscara (preserva o <em>)
    const frag = document.createElement('div');
    frag.innerHTML = html;
    let idx = 0;
    const wrapWords = (node, emphasis) => {
      const out = [];
      node.textContent.split(/(\s+)/).forEach(tok => {
        if (/^\s+$/.test(tok) || tok === '') {
          out.push(tok);
          return;
        }
        const delay = (idx++ * 0.045).toFixed(3);
        out.push(`<span class="palavra-mascara"><span style="--atraso:${delay}s${emphasis ? ';font-style:italic;color:hsl(var(--primary))' : ''}">${tok}</span></span>`);
      });
      return out.join('');
    };
    let result = '';
    frag.childNodes.forEach(n => {
      if (n.nodeType === 3) result += wrapWords(n, false);else if (n.tagName === 'EM') result += wrapWords(n, true);else result += n.outerHTML;
    });
    el.innerHTML = result;
  });
}

/* ===================== seções dinâmicas da home ===================== */
function montarHome() {
  // Painéis do hero-accordion
  const acc = document.querySelector('[data-accordion]');
  if (acc) {
    const paineis = [['Liderança', 'lideranca.html', 'photo-1552664730-d307ca884978'], ['Comunicação', 'comunicacao.html', 'photo-1475721027785-f74eccf877e2'], ['Educação Corporativa', 'educacao-corporativa.html', 'photo-1524178232363-1fb2b075b655'], ['Ferramentas', 'ferramentas.html', 'photo-1454165804606-c3d57bc86b40'], ['Sala do Instrutor', 'sala-do-instrutor.html', 'photo-1517245386807-bb43f82c33c4']];
    acc.innerHTML = paineis.map(([nome, href, foto]) => `
      <a href="${href}" data-painel aria-label="${nome}" class="group relative overflow-hidden rounded-2xl min-w-[52px]" style="flex:1 1 0%;transition:flex .7s cubic-bezier(0.16,1,0.3,1)">
        <img src="https://images.unsplash.com/${foto}?w=800&q=80&fit=crop&crop=center" alt="" aria-hidden="true" class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]">
        <div class="absolute inset-0 bg-gradient-to-t from-sage-900/85 via-sage-900/25 to-transparent"></div>
        <div data-legenda class="absolute inset-x-0 bottom-0 p-6 transition-opacity duration-300" style="opacity:0">
          <p class="mb-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-honey-300"><span aria-hidden="true">✳ </span>área</p>
          <h3 class="text-xl font-semibold leading-snug text-warm-50">${nome}</h3>
          <span class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-warm-50/60 transition-colors group-hover:text-honey-300">Explorar ${ico('arrow-up-right', 'h-3.5 w-3.5')}</span>
        </div>
        <div data-rotulo aria-hidden="true" class="absolute inset-0 flex items-center justify-center transition-opacity duration-200">
          <span class="rotate-90 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] text-warm-50/55">${nome}</span>
        </div>
      </a>`).join('');
  }

  // Faixa marquee
  const fx = document.getElementById('faixa-marquee');
  if (fx) {
    const itens = ['Pipeline de Liderança', 'Comunicação não violenta', 'Cultura de aprendizagem', 'Feedback estruturado', 'Conversas difíceis', 'Gestão de conflitos'];
    const seq = () => `<ul class="flex shrink-0 items-center">${itens.map(it => `<li class="flex items-center whitespace-nowrap px-6 font-heading text-lg italic">${it}<span class="ml-12 text-accent" aria-hidden="true">✳</span></li>`).join('')}</ul>`;
    fx.innerHTML = seq() + seq();
  }

  // Por onde começar
  const pe = document.getElementById('home-portas');
  if (pe) {
    const portas = [['educacao-corporativa.html', 'Educação Corporativa', 'O que diferencia treinamento de desenvolvimento — e como construir uma cultura de aprendizagem que sustenta resultados.'], ['comunicacao.html', 'Comunicação no Mercado', 'Da escuta ativa às conversas difíceis: as habilidades que definem carreiras e destravam equipes.'], ['lideranca.html', 'Liderança', 'Do Pipeline de Liderança ao desenvolvimento de sucessores — sempre com conceito, exemplo, ferramenta e prática.'], ['laboratorio.html', 'Laboratório de Dinâmicas', 'Escolha o tema, receba a dinâmica: atividades testadas em sala, com passo a passo de condução.']];
    pe.innerHTML = portas.map(([href, t, d], i) => `
      <div class="revelar"><a href="${href}" class="group grid grid-cols-[auto_1fr_auto] items-baseline gap-5 border-t border-border py-7 transition-all last:border-b hover:bg-card hover:px-5 md:gap-10 md:py-9">
        <span class="font-heading text-lg italic text-warm-400 transition-colors group-hover:text-accent">${num(i)}</span>
        <span><span class="font-heading text-2xl transition-colors group-hover:text-primary md:text-3xl">${t}</span>
        <span class="mt-2 block max-w-xl text-sm leading-relaxed text-muted-foreground">${d}</span></span>
        ${ico('arrow-up-right', 'h-5 w-5 self-center text-warm-400 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary')}
      </a></div>`).join('');
  }

  // Método (painéis empilhados)
  const mt = document.getElementById('metodo-track');
  if (mt) {
    const passos = [['01', 'Conceito', 'Entender o porquê antes do como. O fundamento que sustenta a decisão, sem jargão.'], ['02', 'Exemplo', 'Ver o conceito vivo num caso real, do mundo de quem está na sala todo dia.'], ['03', 'Ferramenta', 'Um instrumento concreto para levar pra mesa de trabalho já amanhã.'], ['04', 'Prática', 'Fazer, errar seguro, ajustar. É aqui que o aprendizado vira hábito.']];
    mt.innerHTML = passos.map(([n, t, f]) => `<article class="metodo-panel"><span class="font-heading text-7xl italic text-warm-400 md:text-8xl">${n}</span><h3 class="mt-4 font-heading text-3xl md:text-4xl">${t}</h3><p class="mt-4 max-w-sm text-lg leading-relaxed text-muted-foreground">${f}</p></article>`).join('');
  }

  // Trilha de liderança — primeiros 6 temas
  const trilha = document.getElementById('home-trilha');
  if (trilha) {
    trilha.innerHTML = window.APF.temasLideranca.slice(0, 6).map((t, i) => `
      <div class="revelar">
        <a href="lideranca-tema.html?slug=${t.slug}" class="group flex items-baseline gap-6 border-b border-border py-6">
          <span class="font-heading text-xl italic text-accent">${num(i)}</span>
          <span class="flex-1">
            <span class="font-heading text-xl transition-colors group-hover:text-primary">${t.titulo}</span>
            <span class="mt-1 block text-sm leading-relaxed text-muted-foreground" style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${t.resumo}</span>
          </span>
          ${ico('arrow-right', 'h-4 w-4 shrink-0 self-center opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100')}
        </a>
      </div>`).join('');
  }
  // Ferramentas — chips
  const chips = document.getElementById('home-ferramentas');
  if (chips) {
    chips.innerHTML = window.APF.ferramentas.map(f => `<li><a href="ferramentas.html" class="inline-block rounded-full border border-foreground/25 px-5 py-2.5 font-heading text-lg transition-all hover:border-secondary hover:bg-secondary hover:text-secondary-foreground">${f.nome}</a></li>`).join('');
  }
  // Insights — destaque + lista
  const ins = document.getElementById('home-insights');
  if (ins) {
    const posts = window.APF.posts;
    const p0 = posts[0];
    ins.innerHTML = `
      <div class="revelar">
        <article class="group relative flex h-full flex-col justify-between rounded-lg border border-border bg-card p-7 transition-colors hover:border-primary md:p-9">
          <div>
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-secondary">${p0.categoria} · ${p0.tempoLeitura}</p>
            <h3 class="mt-4 font-heading text-3xl leading-snug md:text-4xl"><a href="insights-post.html?slug=${p0.slug}" class="transition-colors group-hover:text-primary">${p0.titulo}</a></h3>
            <p class="mt-4 max-w-lg leading-relaxed text-muted-foreground">${p0.resumo}</p>
          </div>
          <a href="insights-post.html?slug=${p0.slug}" class="link-vivo mt-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-primary">Ler o artigo ${ico('arrow-right', 'h-4 w-4')}</a>
        </article>
      </div>
      <div>
        ${posts.slice(1, 4).map(p => `
          <div class="revelar"><article class="group border-t border-border py-6 first:border-t-0 first:pt-0">
            <p class="text-xs font-medium uppercase tracking-[0.2em] text-secondary">${p.categoria} · ${p.tempoLeitura}</p>
            <h3 class="mt-2 font-heading text-xl leading-snug"><a href="insights-post.html?slug=${p.slug}" class="transition-colors group-hover:text-primary">${p.titulo}</a></h3>
          </article></div>`).join('')}
        <div class="revelar"><a href="insights.html" class="link-vivo mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">Ver todos os artigos ${ico('arrow-right', 'h-4 w-4')}</a></div>
      </div>`;
  }
}

/* ===================== bootstrap ===================== */
function montarPagina() {
  const navSlot = document.getElementById('apf-nav');
  if (navSlot) navSlot.outerHTML = renderNavbar();
  const main = document.getElementById('conteudo');
  const page = document.body.dataset.page;
  if (main && page && PAGES[page]) main.innerHTML = PAGES[page]();
  const footSlot = document.getElementById('apf-footer');
  if (footSlot) footSlot.outerHTML = renderFooter();
  montarFiltroBiblioteca();
  montarFiltroDinamicas();
  if (page === 'index') montarHome();
  montarInteracoes();
  if (window.lucide) lucide.createIcons();else window.addEventListener('load', () => {
    if (window.lucide) lucide.createIcons();
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montarPagina);else montarPagina();
})(); } catch (e) { __ds_ns.__errors.push({ path: "site-preview/apf.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tag = __ds_scope.Tag;

})();
