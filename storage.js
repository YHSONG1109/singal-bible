/**
 * 앱이 쓰는 window.storage 를 클로드 밖에서도 동작하게 만듭니다.
 *
 *  shared = true  (일정, 영상 링크)
 *      먼저 /plan.json 을 읽습니다. 이 파일은 모든 사람이 같은 내용을 봅니다.
 *      앱에서 수정하면 이 기기에만 저장되고, 화면에 '내보내기' 안내가 뜹니다.
 *      → 깃허브에서 public/plan.json 을 바꿔 커밋하면 모두에게 반영됩니다.
 *
 *  shared = false (묵상노트)
 *      이 기기에만 저장됩니다. 원래 의도대로 본인만 봅니다.
 *
 *  나중에 여러 사람이 앱에서 직접 고치게 하려면 아래 SUPABASE 부분을 참고하세요.
 */

const LS = (key, shared) => `singal:${shared ? "s" : "p"}:${key}`;

let planCache = null;

async function loadPlanFile() {
  if (planCache !== null) return planCache;
  try {
    const res = await fetch("/plan.json", { cache: "no-store" });
    planCache = res.ok ? await res.json() : null;
  } catch {
    planCache = null;
  }
  return planCache;
}

window.storage = {
  async get(key, shared = false) {
    // 이 기기에서 고친 내용이 있으면 그걸 먼저 씁니다
    const local = localStorage.getItem(LS(key, shared));
    if (local !== null) return { key, value: local, shared };

    if (shared) {
      const file = await loadPlanFile();
      if (file) return { key, value: JSON.stringify(file), shared };
    }
    throw new Error("not found");
  },

  async set(key, value, shared = false) {
    localStorage.setItem(LS(key, shared), value);
    if (shared) {
      // 모두에게 반영하려면 이 내용을 public/plan.json 에 넣어야 합니다
      console.log("─── public/plan.json 에 넣을 내용 ───");
      console.log(value);
    }
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    localStorage.removeItem(LS(key, shared));
    return { key, deleted: true, shared };
  },

  async list(prefix = "", shared = false) {
    const head = LS(prefix, shared);
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(head)) keys.push(k);
    }
    return { keys, prefix, shared };
  },
};

/* ───────────────────────────────────────────────────────────
 *  여러 사람이 앱에서 직접 일정을 고치게 하고 싶다면
 *
 *  1. supabase.com 에서 무료 프로젝트를 만듭니다
 *  2. 테이블 하나를 만듭니다 :  kv ( key text primary key, value text )
 *  3. npm i @supabase/supabase-js
 *  4. 위 get/set 의 shared 부분을 아래처럼 바꿉니다
 *
 *     import { createClient } from '@supabase/supabase-js'
 *     const sb = createClient(URL, ANON_KEY)
 *
 *     // 읽기
 *     const { data } = await sb.from('kv').select('value').eq('key', key).single()
 *
 *     // 쓰기
 *     await sb.from('kv').upsert({ key, value })
 *
 *  주의: 익명 키만 쓰면 누구나 고칠 수 있습니다.
 *        교회에서 쓰는 정도라면 충분하지만, 잠그고 싶다면
 *        Supabase 의 Row Level Security 로 쓰기 권한을 제한하세요.
 * ─────────────────────────────────────────────────────────── */
