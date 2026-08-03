import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ═══════════════════════ 팔레트 ═══════════════════════ */
const C = {
  bg: "#EDF0F3",
  card: "#FFFFFF",
  ink: "#16202B",
  muted: "#66757F",
  faint: "#B6C0C8",
  line: "#DFE5EA",
  ribbon: "#7A1F2B",
  bubble: "#FBEFA6",
};

const SRC = {
  essence: {
    name: "성경에센스",
    color: "#B08430",
    tint: "#FBF4E5",
    channel: "https://www.youtube.com/@BibleEssence",
  },
  tongdok: {
    name: "CGN 성경통독",
    color: "#2A6382",
    tint: "#EBF3F8",
    channel: "https://www.youtube.com/channel/UCvLBLb1EobX94kP4ohDWjKg",
    playlist:
      "https://www.youtube.com/playlist?list=PLghoOxePMNT59HLrPyB-w6GcOzzCGBWVX",
    playlistName: "2023년 성경 일독 함께해요 (368개)",
  },
  min20: {
    name: "공동체성경읽기",
    color: "#3E7355",
    tint: "#EDF5F0",
    channel: "https://www.youtube.com/channel/UCISl2wEDnzYeg-k_kElfN4Q",
    playlist:
      "https://www.youtube.com/playlist?list=PLVcVykBcFZTT1_acDnoLUJ_DHvyPLA5Ue",
    playlistName: "NEW 20분 신구약 함께 읽기 (357회차)",
  },
};

const DISPLAY = "'Nanum Myeongjo', 'Apple SD Gothic Neo', serif";
const BODY = "'IBM Plex Sans KR', 'Apple SD Gothic Neo', system-ui, sans-serif";
const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=IBM+Plex+Sans+KR:wght@300;400;500;600&display=swap');`;

/* ═══════════════════════ 날짜 ═══════════════════════ */
const WEEK = ["주일", "월", "화", "수", "목", "금", "토"];
const WEEK_S = ["일", "월", "화", "수", "목", "금", "토"];
const doy = (d) => Math.round((d - new Date(d.getFullYear(), 0, 1)) / 86400000) + 1;
const dateOfDay = (year, day) => new Date(year, 0, day);
const bookOf = (r) => {
  if (!r) return "";
  const f = String(r).split(",")[0].trim();
  const m = f.match(/^([^\d]+)/);
  return m ? m[1].trim() : f;
};

/* ═══════════════════════ 성경 순서 ═══════════════════════ */
const OT = [
  ["창세기","창",50],["출애굽기","출",40],["레위기","레",27],["민수기","민",36],
  ["신명기","신",34],["여호수아","수",24],["사사기","삿",21],["룻기","룻",4],
  ["사무엘상","삼상",31],["사무엘하","삼하",24],["열왕기상","왕상",22],["열왕기하","왕하",25],
  ["역대상","대상",29],["역대하","대하",36],["에스라","스",10],["느헤미야","느",13],
  ["에스더","에",10],["욥기","욥",42],["잠언","잠",31],["전도서","전",12],
  ["아가","아",8],["이사야","사",66],["예레미야","렘",52],["예레미야애가","애",5],
  ["에스겔","겔",48],["다니엘","단",12],["호세아","호",14],["요엘","욜",3],
  ["아모스","암",9],["오바댜","옵",1],["요나","욘",4],["미가","미",7],
  ["나훔","나",3],["하박국","합",3],["스바냐","습",3],["학개","학",2],
  ["스가랴","슥",14],["말라기","말",4],
];
const NT = [
  ["마태복음","마",28],["마가복음","막",16],["누가복음","눅",24],["요한복음","요",21],
  ["사도행전","행",28],["로마서","롬",16],["고린도전서","고전",16],["고린도후서","고후",13],
  ["갈라디아서","갈",6],["에베소서","엡",6],["빌립보서","빌",4],["골로새서","골",4],
  ["데살로니가전서","살전",5],["데살로니가후서","살후",3],["디모데전서","딤전",6],
  ["디모데후서","딤후",4],["디도서","딛",3],["빌레몬서","몬",1],["히브리서","히",13],
  ["야고보서","약",5],["베드로전서","벧전",5],["베드로후서","벧후",3],
  ["요한일서","요일",5],["요한이서","요이",1],["요한삼서","요삼",1],["유다서","유",1],
  ["요한계시록","계",22],
];
const findBook = (list, n) => list.findIndex((b) => b[0] === n || b[1] === n);

function makeCursor(list, bookName, startCh, sizes) {
  let bi = findBook(list, bookName), ch = startCh, si = 0;
  return (short) => {
    if (bi < 0 || bi >= list.length) return "";
    const size = sizes[si++ % sizes.length];
    const [full, abbr, total] = list[bi];
    const from = ch, to = Math.min(ch + size - 1, total);
    const label = short ? abbr : full;
    const text = from === to ? `${label} ${from}` : `${label} ${from}-${to}`;
    ch = to + 1;
    if (ch > total) { bi++; ch = 1; }
    return text;
  };
}
function makePsalm(start) {
  let p = start;
  return (short) => {
    const t = `${short ? "시" : "시편"} ${p}`;
    p = p >= 150 ? 1 : p + 1;
    return t;
  };
}

function generatePlan(fromDay, days) {
  const tOT = makeCursor(OT, "예레미야", 6, [3, 2]);
  const tPs = makePsalm(60);
  const mOT = makeCursor(OT, "느헤미야", 4, [3, 2]);
  const mNT = makeCursor(NT, "베드로후서", 3, [1]);
  const mPs = makePsalm(65);
  const out = {};
  for (let i = 0; i < days; i++) {
    out[fromDay + i] = {
      tongdok: `${tOT(false)}, ${tPs(false)}`,
      tongdokUrl: "",
      min20: `${mOT(true)}, ${mNT(true)}, ${mPs(true)}`,
      min20Url: "",
      auto: true,
    };
  }
  return out;
}

const CONFIRMED = {
  213: {
    tongdok: "예레미야 1-3, 시편 58",
    tongdokUrl: "https://youtu.be/Gto5ncC75Y8?si=ajpcPeNKNLUPjnqQ",
    min20: "스 9-10, 벧후 1, 시 63",
    min20Url: "https://youtu.be/tKWQxiEylzA?si=oxlgqLoxnjg1vXOc",
  },
  214: {
    tongdok: "예레미야 4-5, 시편 59",
    tongdokUrl: "https://youtu.be/3_Mgufm5Zu0?si=dRCZc4ahuaAGwfLG",
    min20: "느 1-3, 벧후 2, 시 64",
    min20Url: "https://youtu.be/4SIhDOyl4ak?si=l4E_bhBsjoDF0N7h",
  },
};

const SEED = {
  plan: { ...generatePlan(215, 180), ...CONFIRMED },
  essence: { 예레미야: "https://youtu.be/aIdhIm9vXsY?si=ajpcPeNKNLUPjnqQ" },
};

const PLAN_KEY = "singal-bible-plan";
const NOTE_KEY = "singal-bible-notes";

/* ═══════════════════════ 공유문 ═══════════════════════ */
function build(date, plan, essence) {
  const n = doy(date);
  const t = plan[n];
  if (!t || !t.tongdok) return null;
  const book = bookOf(t.tongdok);
  const prev = plan[n - 1];
  const newBook = book && book !== (prev ? bookOf(prev.tongdok) : null);

  /* 그날에 직접 넣은 개관 링크가 있으면 그걸 씁니다.
     없으면 권이 바뀌는 날에만 권별 목록에서 찾아 붙입니다. */
  const manualBook = (t.essenceBook || "").trim() || book;
  const head = t.essenceUrl
    ? { book: manualBook, url: t.essenceUrl }
    : newBook
    ? { book: book, url: essence[book] || "" }
    : null;

  let s = `${date.getMonth() + 1}월 ${date.getDate()}일(${WEEK[date.getDay()]}) ${n}일차\n`;
  if (head) s += `\n성경에센스_${head.book}\n${head.url || "(링크 준비 중)"}\n`;
  s += `\n배경설명 후 통독\n(${t.tongdok})\n${t.tongdokUrl || "(링크 준비 중)"}\n`;
  s += `\n20분 신구약 함께 읽기\n(${t.min20})\n${t.min20Url || "(링크 준비 중)"}`;

  return {
    text: s,
    book,
    head,
    hasHead: !!head,
    essenceUrl: head ? head.url : "",
    day: n,
    d: t,
  };
}

const videoId = (url) => {
  const m = String(url || "").match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};

/* ═══════════════════════ 영상 ═══════════════════════ */
/**
 * 썸네일을 먼저 보여주고, 누르면 그 자리에서 재생합니다.
 * 기기나 브라우저가 삽입 재생을 막는 경우를 대비해 항상 바깥 링크를 함께 둡니다.
 */
const Player = React.memo(function Player({ url, accent, tint }) {
  const [inline, setInline] = useState(false);
  const [thumb, setThumb] = useState(0);
  const id = videoId(url);

  useEffect(() => { setInline(false); setThumb(0); }, [url]);

  if (!id) return null;

  const thumbs = [
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
  ];

  return (
    <div className="mb-4">
      <div
        className="rounded-xl overflow-hidden relative"
        style={{ border: `1px solid ${C.line}`, aspectRatio: "16 / 9", background: "#111" }}
      >
        {inline ? (
          <iframe
            key={id}
            src={`https://www.youtube.com/embed/${id}?playsinline=1&rel=0`}
            title="영상"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: 0, display: "block" }}
          />
        ) : (
          /* 누르면 유튜브 앱으로 넘어갑니다. 앱 안에서의 재생은 막히는 환경이 있어서
             이쪽을 기본으로 둡니다. */
          <a href={url} target="_blank" rel="noreferrer" className="block w-full h-full relative">
            {thumb < thumbs.length && (
              <img
                src={thumbs[thumb]}
                alt=""
                onError={() => setThumb((t) => t + 1)}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            )}
            <span className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span
                className="flex items-center justify-center rounded-full"
                style={{ width: 62, height: 62, background: "rgba(255,255,255,0.95)" }}
              >
                <span
                  style={{
                    width: 0, height: 0, marginLeft: 4,
                    borderLeft: `18px solid ${C.ribbon}`,
                    borderTop: "11px solid transparent",
                    borderBottom: "11px solid transparent",
                  }}
                />
              </span>
              <span className="text-[11px] mt-2.5" style={{ color: "#fff", fontWeight: 500 }}>
                유튜브 앱에서 재생
              </span>
            </span>
          </a>
        )}
      </div>

      {!inline && (
        <button
          onClick={() => setInline(true)}
          className="w-full text-center text-[11px] mt-2 py-2.5 rounded-lg"
          style={{ background: tint, color: accent, fontWeight: 600 }}
        >
          여기서 바로 재생해보기
        </button>
      )}
      {inline && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="block text-center text-[11px] mt-2 py-2.5 rounded-lg"
          style={{ background: tint, color: accent, fontWeight: 600 }}
        >
          화면이 까맣다면 유튜브 앱에서 열기 ↗
        </a>
      )}
    </div>
  );
});

/* ═══════════════════════ 주소를 눌러서 열기 ═══════════════════════ */
/**
 * 공유문 안의 유튜브 주소를 누를 수 있게 만듭니다.
 * 휴대폰에서는 유튜브 앱이 이 주소를 넘겨받아 바로 열립니다.
 */
function Linkify({ text }) {
  const parts = String(text).split(/(https?:\/\/\S+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#1B5E8C", textDecoration: "underline", wordBreak: "break-all" }}
          >
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ═══════════════════════ 접이식 ═══════════════════════ */
function Fold({ title, sub, open, onToggle, accent, children }) {
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={{ background: C.card, border: `1px solid ${C.line}` }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between px-4 py-3.5 text-left">
        <span>
          <span className="text-sm block" style={{ fontWeight: 600 }}>{title}</span>
          {sub && <span className="text-xs" style={{ color: C.muted }}>{sub}</span>}
        </span>
        <span
          className="text-lg leading-none"
          style={{ color: accent || C.muted, transform: open ? "rotate(45deg)" : "none", transition: "transform .2s" }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════ 트랙 화면 (성경통독 · 신구약 함께 읽기) ═══════════════════════ */
/* 최상위에 둡니다. 안쪽에 두면 화면이 갱신될 때마다 새로 만들어져 재생이 끊깁니다. */
const TrackScreen = React.memo(function TrackScreen({ which, view, sel, notes, open, toggle, writeNote }) {
  const s = SRC[which];
  const isT = which === "tongdok";
  const range = view ? (isT ? view.d.tongdok : view.d.min20) : "";
  const url = view ? (isT ? view.d.tongdokUrl : view.d.min20Url) : "";
  const label = isT ? "배경설명 후 통독" : "20분 신구약 함께 읽기";
  const key = `${sel}:${which}`;

  if (!view)
    return <div className="px-4 py-16 text-center text-sm" style={{ color: C.muted }}>{sel}일차 일정이 없습니다.</div>;

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: s.tint, color: s.color, fontWeight: 600 }}>
          {s.name}
        </span>
        <a href={s.channel} target="_blank" rel="noreferrer" className="text-[11px]" style={{ color: C.muted }}>
          채널 열기 ↗
        </a>
      </div>

      <div className="text-xs mb-1" style={{ color: C.muted }}>{sel}일차 · {label}</div>
      <h2 className="text-xl mb-4" style={{ fontFamily: DISPLAY, fontWeight: 800 }}>{range}</h2>

      {url ? (
        <Player url={url} accent={s.color} tint={s.tint} />
      ) : (
        <div
          className="rounded-xl mb-4 px-4 py-10 text-center text-sm"
          style={{ background: C.card, border: `1px solid ${C.line}`, color: C.muted, lineHeight: 1.8 }}
        >
          이 날 영상 링크가 아직 없습니다
          <br />
          <a href={s.playlist} target="_blank" rel="noreferrer" style={{ color: s.color, fontWeight: 600 }}>
            {s.playlistName} 열기 ↗
          </a>
        </div>
      )}

      <Fold title="성경 본문" sub={range} accent={s.color} open={!!open[`b${key}`]} onToggle={() => toggle(`b${key}`)}>
        <div className="space-y-2">
          <a
            href="https://www.bskorea.or.kr/bible/korbibReadpage.php"
            target="_blank" rel="noreferrer"
            className="block text-center py-2.5 rounded-lg text-sm"
            style={{ background: s.tint, color: s.color, fontWeight: 600 }}
          >
            대한성서공회 성경에서 열기
          </a>
          <a
            href={"https://bible.godpeople.com/?q=" + encodeURIComponent(range)}
            target="_blank" rel="noreferrer"
            className="block text-center py-2.5 rounded-lg text-sm"
            style={{ background: "#F4F6F8", color: C.ink, fontWeight: 600 }}
          >
            갓피플 성경에서 열기
          </a>
          <p className="text-[11px] pt-1" style={{ color: C.muted, lineHeight: 1.7 }}>
            한글 번역본은 대한성서공회가 저작권을 가지고 있어 본문을 앱 안에 직접 담지
            못했습니다. 교회 이름으로 사용 허락을 받으면 여기에 본문을 넣을 수 있습니다.
          </p>
        </div>
      </Fold>

      <Fold
        title="묵상노트"
        sub={notes[key] ? "작성함" : "마음에 남은 말씀을 적어보세요"}
        accent={s.color}
        open={!!open[`n${key}`]}
        onToggle={() => toggle(`n${key}`)}
      >
        <textarea
          value={notes[key] || ""}
          onChange={(e) => writeNote(key, e.target.value)}
          rows={7}
          placeholder="읽으면서 마음에 남은 구절, 떠오른 생각, 기도 제목을 적어보세요."
          className="w-full px-3 py-3 rounded-lg text-sm outline-none"
          style={{ border: `1px solid ${C.line}`, background: "#FAFBFC", lineHeight: 1.8, resize: "vertical" }}
        />
        <p className="text-[11px] mt-2" style={{ color: C.muted }}>
          자동으로 저장되며, 본인만 볼 수 있습니다.
        </p>
      </Fold>
    </div>
  );
});

/* ═══════════════════════ 메인 ═══════════════════════ */
export default function SingalBibleApp() {
  const [tab, setTab] = useState("home");
  const [data, setData] = useState(SEED);
  const [notes, setNotes] = useState({});
  const [sel, setSel] = useState(doy(new Date()));
  const [year] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [open, setOpen] = useState({});
  const [toast, setToast] = useState("");
  const [ready, setReady] = useState(false);
  const [edit, setEdit] = useState(false);
  const [bulk, setBulk] = useState("");
  const [unsaved, setUnsaved] = useState(false);
  const noteTimer = useRef(null);

  const date = dateOfDay(year, sel);
  const view = useMemo(() => build(date, data.plan, data.essence), [sel, data]);
  const todayDoy = doy(new Date());

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2200); };
  const toggle = useCallback((k) => setOpen((o) => ({ ...o, [k]: !o[k] })), []);

  useEffect(() => {
    (async () => {
      let plan = { ...SEED.plan };
      let essence = { ...SEED.essence };
      for (const isShared of [true, false]) {
        try {
          const r = await window.storage.get(PLAN_KEY, isShared);
          if (r?.value) {
            const v = JSON.parse(r.value);
            plan = { ...plan, ...(v.plan || {}) };
            essence = { ...essence, ...(v.essence || {}) };
          }
        } catch { /* 그쪽에는 저장된 자료가 없습니다 */ }
      }
      try {
        const raw = window.localStorage.getItem(PLAN_KEY);
        if (raw) {
          const v = JSON.parse(raw);
          plan = { ...plan, ...(v.plan || {}) };
          essence = { ...essence, ...(v.essence || {}) };
        }
      } catch { /* 브라우저 저장도 없습니다 */ }
      setData({ plan, essence });
      try {
        const r = await window.storage.get(NOTE_KEY, false);
        if (r?.value) setNotes(JSON.parse(r.value));
      } catch { /* 노트 없음 */ }
      setReady(true);
    })();
  }, []);

  /** 손으로 고친 날만 뽑아냅니다. 자동 생성분은 저장할 필요가 없습니다. */
  const editedOnly = (d) => {
    const edited = {};
    Object.keys(d.plan).forEach((k) => {
      if (!d.plan[k].auto) edited[k] = d.plan[k];
    });
    return { plan: edited, essence: d.essence };
  };

  /**
   * 저장할 곳을 순서대로 시도합니다.
   * 모두 막히면 화면에는 남아 있으니, 내보내기로 옮겨두시면 됩니다.
   */
  const savePlan = async (next) => {
    setData(next);
    const payload = JSON.stringify(editedOnly(next));

    try {
      await window.storage.set(PLAN_KEY, payload, true);
      setUnsaved(false);
      return flash("저장했습니다. 모두에게 반영됩니다");
    } catch { /* 다음 방법으로 */ }

    try {
      await window.storage.set(PLAN_KEY, payload, false);
      setUnsaved(false);
      return flash("이 기기에만 저장했습니다");
    } catch { /* 다음 방법으로 */ }

    try {
      window.localStorage.setItem(PLAN_KEY, payload);
      setUnsaved(false);
      return flash("이 브라우저에 저장했습니다");
    } catch { /* 마지막 안내로 */ }

    setUnsaved(true);
    flash("저장할 곳이 없습니다. 아래 내보내기로 복사해 두세요");
  };

  /** 지금까지 고친 내용을 통째로 복사합니다. 다시 붙여넣으면 그대로 살아납니다. */
  const exportAll = async () => {
    const payload = JSON.stringify(editedOnly(data), null, 2);
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = payload;
      document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
    }
    flash("복사했습니다. 메모장에 붙여넣어 보관하세요");
  };

  const writeNote = useCallback((key, text) => {
    setNotes((prev) => {
      const next = { ...prev, [key]: text };
      clearTimeout(noteTimer.current);
      noteTimer.current = setTimeout(() => {
        window.storage.set(NOTE_KEY, JSON.stringify(next), false).catch(() => {});
      }, 700);
      return next;
    });
  }, []);

  const share = async () => {
    if (!view) return;
    if (navigator.share) {
      try { await navigator.share({ text: view.text }); return; }
      catch (e) { if (e && e.name === "AbortError") return; }
    }
    try {
      await navigator.clipboard.writeText(view.text);
      flash("복사했습니다. 붙여넣기 하세요");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = view.text;
      document.body.appendChild(ta);
      ta.select(); document.execCommand("copy"); ta.remove();
      flash("복사했습니다. 붙여넣기 하세요");
    }
  };

  const upd = (k, v) =>
    setData((d) => ({ ...d, plan: { ...d.plan, [sel]: { ...(d.plan[sel] || {}), [k]: v, auto: false } } }));

  const importBulk = () => {
    const raw = bulk.trim();
    const next = { plan: { ...data.plan }, essence: { ...data.essence } };

    // 내보내기로 복사해 둔 내용이면 그대로 되살립니다
    if (raw.startsWith("{")) {
      try {
        const v = JSON.parse(raw);
        next.plan = { ...next.plan, ...(v.plan || {}) };
        next.essence = { ...next.essence, ...(v.essence || {}) };
        setBulk("");
        return savePlan(next);
      } catch {
        return flash("내용을 읽지 못했습니다. 복사한 전체를 붙여넣어 주세요");
      }
    }

    let ok = 0;
    bulk.split("\n").map((l) => l.trim()).filter(Boolean).forEach((line) => {
      const p = line.split("|").map((s) => s.trim());
      if (p.length < 5) return;
      const day = +p[0];
      if (!day) return;
      next.plan[day] = { tongdok: p[1], tongdokUrl: p[2], min20: p[3], min20Url: p[4], auto: false };
      ok++;
    });
    if (!ok) return flash("형식에 맞는 줄이 없습니다");
    setBulk("");
    savePlan(next);
  };

  const cells = useMemo(() => {
    const pad = new Date(year, month, 1).getDay();
    const len = new Date(year, month + 1, 0).getDate();
    const arr = Array(pad).fill(null);
    for (let i = 1; i <= len; i++) arr.push(i);
    return arr;
  }, [year, month]);


  const TABS = [
    ["home", "오늘"],
    ["tongdok", "성경통독"],
    ["min20", "신구약 함께 읽기"],
  ];

  return (
    <div className="min-h-screen w-full pb-24" style={{ background: C.bg, color: C.ink, fontFamily: BODY }}>
      <style>{FONTS}</style>

      <header className="px-5 pt-6 pb-4" style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-lg mx-auto flex items-start justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em]" style={{ color: SRC.essence.color }}>
              SINGAL CENTRAL CHURCH
            </div>
            <h1 className="text-xl mt-1" style={{ fontFamily: DISPLAY, fontWeight: 800 }}>
              신갈중앙교회 성경통독
            </h1>
          </div>
          <div className="text-right">
            <div style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 800, color: C.ribbon, lineHeight: 1 }}>{sel}</div>
            <div className="text-[10px]" style={{ color: C.muted }}>일차</div>
          </div>
        </div>
      </header>

      <nav style={{ background: C.card, borderBottom: `1px solid ${C.line}` }}>
        <div className="max-w-lg mx-auto flex">
          {TABS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="flex-1 py-3 text-[13px]"
              style={{
                color: tab === k ? C.ribbon : C.muted,
                fontWeight: tab === k ? 600 : 400,
                borderBottom: `2px solid ${tab === k ? C.ribbon : "transparent"}`,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-lg mx-auto">
        {!ready ? (
          <div className="px-4 py-20 text-center text-sm" style={{ color: C.muted }}>불러오는 중입니다</div>
        ) : tab === "home" ? (
          <main className="px-4 pt-4">
            <section className="rounded-xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="flex items-center justify-between mb-3">
                <button onClick={() => setMonth((m) => Math.max(0, m - 1))} className="px-3 py-1 text-lg" style={{ color: C.muted }}>‹</button>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{year}년 {month + 1}월</span>
                <button onClick={() => setMonth((m) => Math.min(11, m + 1))} className="px-3 py-1 text-lg" style={{ color: C.muted }}>›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEK_S.map((w, i) => (
                  <div key={w} className="text-center text-[10px] py-1" style={{ color: i === 0 ? C.ribbon : C.faint }}>{w}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} />;
                  const dn = doy(new Date(year, month, day));
                  const on = dn === sel;
                  const has = !!data.plan[dn];
                  return (
                    <button
                      key={i}
                      onClick={() => setSel(dn)}
                      className="aspect-square rounded-lg flex items-center justify-center"
                      style={{
                        background: on ? C.ribbon : dn === todayDoy ? "#F2F4F6" : "transparent",
                        color: on ? "#fff" : has ? C.ink : C.faint,
                      }}
                    >
                      <span className="text-sm" style={{ fontFamily: DISPLAY, fontWeight: on ? 700 : 400 }}>{day}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {view ? (
              <>
                <div className="flex items-baseline justify-between mb-2 px-1">
                  <span className="text-sm" style={{ color: C.muted }}>
                    {date.getMonth() + 1}월 {date.getDate()}일({WEEK[date.getDay()]}) · {sel}일차
                  </span>
                  {view.d.auto && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "#FBF4E5", color: "#8A6620" }}>
                      자동 생성 · 확인 필요
                    </span>
                  )}
                </div>

                <div
                  className="rounded-xl px-4 py-3.5 text-[13px] whitespace-pre-wrap break-all mb-3"
                  style={{ background: C.bubble, lineHeight: 1.75, borderTopLeftRadius: 4 }}
                >
                  <Linkify text={view.text} />
                </div>

                {/* 영상 바로가기 */}
                <div className="flex gap-2 mb-4">
                  {view.essenceUrl && (
                    <a
                      href={view.essenceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2.5 rounded-lg text-xs"
                      style={{ background: SRC.essence.tint, color: SRC.essence.color, fontWeight: 600 }}
                    >
                      개관 영상
                    </a>
                  )}
                  {view.d.tongdokUrl && (
                    <a
                      href={view.d.tongdokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2.5 rounded-lg text-xs"
                      style={{ background: SRC.tongdok.tint, color: SRC.tongdok.color, fontWeight: 600 }}
                    >
                      통독 영상
                    </a>
                  )}
                  {view.d.min20Url && (
                    <a
                      href={view.d.min20Url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2.5 rounded-lg text-xs"
                      style={{ background: SRC.min20.tint, color: SRC.min20.color, fontWeight: 600 }}
                    >
                      20분 영상
                    </a>
                  )}
                </div>

                {/* 재생목록 */}
                <div className="flex gap-2 mb-4">
                  {["tongdok", "min20"].map((k) => (
                    <a
                      key={k}
                      href={SRC[k].playlist}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2.5 rounded-lg text-[11px]"
                      style={{ border: `1px solid ${C.line}`, color: C.muted }}
                    >
                      {SRC[k].name} 재생목록 ↗
                    </a>
                  ))}
                </div>

                {unsaved && (
                  <div
                    className="rounded-lg px-3 py-2.5 mb-3 text-[11px]"
                    style={{ background: "#FBF4E5", color: "#8A6620", lineHeight: 1.7 }}
                  >
                    이 기기에서는 저장이 되지 않습니다. 고친 내용은 화면에만 남아 있으니
                    아래 [일정 · 링크 넣기] → [내용 내보내기]로 복사해 두세요.
                  </div>
                )}

                <button
                  onClick={() => setEdit((e) => !e)}
                  className="w-full py-2.5 rounded-lg text-xs mb-3"
                  style={{ border: `1px solid ${C.line}`, color: C.muted }}
                >
                  {edit ? "닫기" : "일정 · 링크 넣기"}
                </button>

                {edit && (
                  <>
                    <section className="rounded-xl p-4 mb-3 space-y-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                      <div className="text-sm" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>{sel}일차</div>
                      {[
                        ["통독 범위", "tongdok", "예레미야 6-7, 시편 60"],
                        ["통독 링크 (CGN 성경통독)", "tongdokUrl", "https://youtu.be/..."],
                        ["20분 범위", "min20", "느 4-6, 벧후 3, 시 65"],
                        ["20분 링크 (공동체성경읽기)", "min20Url", "https://youtu.be/..."],
                      ].map(([label, k, ph]) => (
                        <label key={k} className="block">
                          <span className="block text-xs mb-1" style={{ color: C.muted }}>{label}</span>
                          <input
                            value={data.plan[sel]?.[k] || ""}
                            onChange={(e) => upd(k, e.target.value)}
                            placeholder={ph}
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                            style={{ border: `1px solid ${C.line}`, background: "#FAFBFC" }}
                          />
                        </label>
                      ))}
                      {/* 개관 영상은 언제든 넣을 수 있습니다. 넣으면 공유문 맨 위로 올라갑니다. */}
                      <div className="pt-1" style={{ borderTop: `1px solid ${C.line}` }}>
                        <div className="text-xs pt-3 mb-2" style={{ color: SRC.essence.color, fontWeight: 600 }}>
                          개관 영상 (성경에센스)
                        </div>
                        <label className="block mb-3">
                          <span className="block text-xs mb-1" style={{ color: C.muted }}>
                            권 이름
                          </span>
                          <input
                            value={data.plan[sel]?.essenceBook ?? ""}
                            onChange={(e) => upd("essenceBook", e.target.value)}
                            placeholder={view.book || "예레미야"}
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                            style={{ border: `1px solid ${C.line}`, background: "#FAFBFC" }}
                          />
                        </label>
                        <label className="block">
                          <span className="block text-xs mb-1" style={{ color: C.muted }}>
                            개관 영상 링크
                          </span>
                          <input
                            value={data.plan[sel]?.essenceUrl ?? ""}
                            onChange={(e) => upd("essenceUrl", e.target.value)}
                            placeholder="https://youtu.be/..."
                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                            style={{ border: `1px solid ${C.line}`, background: "#FAFBFC" }}
                          />
                        </label>
                        <p className="text-[11px] mt-2" style={{ color: C.muted, lineHeight: 1.7 }}>
                          링크를 넣으면 이 날 공유문 맨 위에 개관 영상이 들어갑니다.
                          권 이름을 비워두면 그날 통독하는 권 이름을 씁니다.
                        </p>
                      </div>
                      <button
                        onClick={() => { savePlan(data); setEdit(false); }}
                        className="w-full py-3 rounded-lg text-sm"
                        style={{ background: C.ribbon, color: "#fff", fontWeight: 600 }}
                      >
                        저장
                      </button>
                    </section>

                    <section className="rounded-xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
                      <div className="text-sm mb-1" style={{ fontFamily: DISPLAY, fontWeight: 700 }}>
                        여러 날 한번에 넣기
                      </div>
                      <p className="text-xs mb-3" style={{ color: C.muted, lineHeight: 1.7 }}>
                        한 줄에 하루씩, 세로줄(|)로 나눕니다.
                        <br />
                        일차 | 통독범위 | 통독링크 | 20분범위 | 20분링크
                      </p>
                      <textarea
                        value={bulk}
                        onChange={(e) => setBulk(e.target.value)}
                        rows={5}
                        placeholder="215 | 예레미야 6-7, 시편 60 | https://youtu.be/xxxxxxxxxxx | 느 4-6, 벧후 3, 시 65 | https://youtu.be/xxxxxxxxxxx"
                        className="w-full px-3 py-2 rounded-lg text-xs outline-none mb-3"
                        style={{ border: `1px solid ${C.line}`, background: "#FAFBFC" }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={importBulk}
                          className="flex-1 py-3 rounded-lg text-sm"
                          style={{ border: `1px solid ${C.line}`, fontWeight: 600 }}
                        >
                          등록
                        </button>
                        <button
                          onClick={exportAll}
                          className="flex-1 py-3 rounded-lg text-sm"
                          style={{ border: `1px solid ${C.line}`, fontWeight: 600, color: C.ribbon }}
                        >
                          내용 내보내기
                        </button>
                      </div>
                      <p className="text-[11px] mt-2" style={{ color: C.muted, lineHeight: 1.7 }}>
                        내보내기를 누르면 지금까지 고친 내용이 통째로 복사됩니다.
                        메모장에 붙여넣어 두었다가, 나중에 이 칸에 그대로 붙여넣으면 되살아납니다.
                      </p>
                    </section>
                  </>
                )}
              </>
            ) : (
              <div className="rounded-xl px-5 py-14 text-center text-sm" style={{ background: C.card, border: `1px solid ${C.line}`, color: C.muted }}>
                {sel}일차 일정이 없습니다
              </div>
            )}
          </main>
        ) : (
          <TrackScreen
            which={tab}
            view={view}
            sel={sel}
            notes={notes}
            open={open}
            toggle={toggle}
            writeNote={writeNote}
          />
        )}
      </div>

      {tab === "home" && view && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 py-4"
          style={{ background: "rgba(255,255,255,0.94)", borderTop: `1px solid ${C.line}`, backdropFilter: "blur(8px)" }}
        >
          <div className="max-w-lg mx-auto">
            <button
              onClick={share}
              className="w-full py-4 rounded-xl text-base"
              style={{ background: C.ribbon, color: "#fff", fontWeight: 600 }}
            >
              공유
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full text-sm shadow-lg z-50"
          style={{ background: C.ink, color: "#fff" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
