import { useState, useRef, useEffect } from "react";

const HOURS = Array.from({length:7},(_,i)=>i+17);
const MINS = [0,5,10,15,20,25,30,35,40,45,50,55];
const ITEM_H = 44;
const VISIBLE = 5;

const triggerHaptic = () => {
  if (navigator?.vibrate) navigator.vibrate(8);
  if (window?.webkit?.messageHandlers?.haptic) {
    try { window.webkit.messageHandlers.haptic.postMessage("selection"); } catch(e) {}
  }
};

function PickerColumn({ items, selected, onSelect }) {
  const ref = useRef(null);
  const selIdx = items.indexOf(selected);
  const lastIdx = useRef(selIdx);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = selIdx * ITEM_H;
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    clearTimeout(ref.current._t);
    ref.current._t = setTimeout(() => {
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      ref.current.scrollTo({ top: clamped * ITEM_H, behavior: "smooth" });
      if (clamped !== lastIdx.current) {
        lastIdx.current = clamped;
        triggerHaptic();
        onSelect(items[clamped]);
      }
    }, 80);
  };

  return (
    <div style={{ position:"relative", flex:1, overflow:"hidden", height: ITEM_H * VISIBLE }}>
      <div style={{ position:"absolute", top:"50%", left:4, right:4, height:ITEM_H, transform:"translateY(-50%)", background:"rgba(247,151,30,0.15)", borderTop:"1.5px solid rgba(247,151,30,0.6)", borderBottom:"1.5px solid rgba(247,151,30,0.6)", borderRadius:8, pointerEvents:"none", zIndex:2 }}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:ITEM_H*2, background:"linear-gradient(to bottom, rgba(13,11,30,0.95) 0%, transparent 100%)", pointerEvents:"none", zIndex:3 }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:ITEM_H*2, background:"linear-gradient(to top, rgba(13,11,30,0.95) 0%, transparent 100%)", pointerEvents:"none", zIndex:3 }}/>
      <div ref={ref} onScroll={handleScroll} style={{ height:"100%", overflowY:"scroll", scrollSnapType:"y mandatory", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        <style>{`div::-webkit-scrollbar{display:none}`}</style>
        <div style={{height: ITEM_H * 2}}/>
        {items.map((item, i) => (
          <div key={item} onClick={() => { ref.current.scrollTo({ top: i * ITEM_H, behavior:"smooth" }); triggerHaptic(); onSelect(item); }}
            style={{ height: ITEM_H, display:"flex", alignItems:"center", justifyContent:"center", scrollSnapAlign:"center", cursor:"pointer", fontSize: item === selected ? 24 : 17, fontWeight: item === selected ? 900 : 400, color: item === selected ? "#ffd200" : "rgba(255,255,255,0.28)", transition:"font-size 0.1s, color 0.1s", userSelect:"none" }}>{item}</div>
        ))}
        <div style={{height: ITEM_H * 2}}/>
      </div>
    </div>
  );
}

function ScrollPicker({ value, onChange }) {
  const hourVal = value.split(":")[0];
  const minVal  = value.split(":")[1];
  const hours = HOURS.map(h => String(h).padStart(2,"0"));
  const mins  = MINS.map(m  => String(m).padStart(2,"0"));
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, background:"rgba(255,255,255,0.05)", borderRadius:16, border:"1px solid rgba(255,255,255,0.1)", overflow:"hidden", padding:"0 8px" }}>
      <PickerColumn items={hours} selected={hourVal} onSelect={h => onChange(`${h}:${minVal}`)}/>
      <div style={{ fontSize:28, fontWeight:900, color:"rgba(255,255,255,0.6)", padding:"0 4px", userSelect:"none" }}>:</div>
      <PickerColumn items={mins}  selected={minVal}  onSelect={m => onChange(`${hourVal}:${m}`)}/>
    </div>
  );
}

const PURPOSES = [
  { id: "接待", label: "取引先接待", icon: "🤝" },
  { id: "打ち上げ", label: "打ち上げ", icon: "🎉" },
  { id: "懇親会", label: "社内懇親会", icon: "🏢" },
  { id: "忘年会", label: "忘年会・新年会", icon: "🎍" },
  { id: "送別会", label: "送別会・歓迎会", icon: "🌸" },
];

const AREAS = [
  "新橋・汐留", "銀座・有楽町", "渋谷・恵比寿", "新宿・四谷",
  "六本木・赤坂", "品川・目黒", "丸の内・大手町", "上野・秋葉原",
];

const FOOD_TYPES = [
  { id: "焼き鳥", label: "焼き鳥", icon: "🍡" },
  { id: "海鮮・魚介", label: "海鮮・魚介", icon: "🐟" },
  { id: "焼肉", label: "焼肉", icon: "🥩" },
  { id: "韓国料理", label: "韓国料理", icon: "🇰🇷" },
  { id: "中華・餃子", label: "中華・餃子", icon: "🥟" },
  { id: "イタリアン", label: "イタリアン", icon: "🍝" },
  { id: "和食・割烹", label: "和食・割烹", icon: "🍱" },
  { id: "鍋料理", label: "鍋料理", icon: "🍲" },
  { id: "フレンチ", label: "フレンチ", icon: "🥂" },
  { id: "スペイン料理", label: "スペイン料理", icon: "🥘" },
  { id: "しゃぶしゃぶ・すき焼き", label: "しゃぶしゃぶ", icon: "🫕" },
  { id: "寿司・鮨", label: "寿司・鮨", icon: "🍣" },
  { id: "鉄板焼き・ステーキ", label: "鉄板・ステーキ", icon: "🥗" },
  { id: "ダイニングバー", label: "ダイニングバー", icon: "🍸" },
  { id: "何でもOK", label: "何でもOK", icon: "✨" },
];

const SEAT_TYPES = [
  { id: "フロア貸切", label: "フロア貸切", icon: "🏠", sub: "全フロア独占" },
  { id: "完全個室", label: "完全個室", icon: "🚪", sub: "壁で仕切られた個室" },
  { id: "半個室", label: "半個室", icon: "🪟", sub: "仕切りあり・開放感も" },
  { id: "テーブル席", label: "テーブル席", icon: "🪑", sub: "通常テーブル" },
  { id: "座敷", label: "座敷", icon: "🎌", sub: "畳・掘りごたつ" },
  { id: "こだわりなし", label: "こだわりなし", icon: "🔓", sub: "おまかせ" },
];

const COURSE_TYPES = [
  { id: "飲み放題付きコース", label: "飲み放題付きコース", icon: "🍻", sub: "定番・最も人気" },
  { id: "単品注文", label: "単品注文", icon: "📋", sub: "自由に選びたい" },
  { id: "料理コースのみ", label: "料理コースのみ", icon: "🍽", sub: "飲み物は別途" },
];

const SMOKE_OPTIONS = [
  { id: "禁煙希望", label: "禁煙", icon: "🚭", sub: "完全禁煙の店のみ" },
  { id: "喫煙可希望", label: "喫煙可", icon: "🚬", sub: "喫煙できる店" },
  { id: "どちらでも", label: "どちらでも", icon: "🔄", sub: "こだわらない" },
];

const DURATION_OPTIONS = [
  { id: "2時間", label: "2時間", icon: "⏱" },
  { id: "2時間半", label: "2時間半", icon: "⏱" },
  { id: "3時間", label: "3時間", icon: "⏳" },
  { id: "おまかせ", label: "おまかせ", icon: "🔄" },
];

const formatBudget = (v) => {
  if (v === 0) return "予算なし";
  if (v < 10000) return `${v.toLocaleString()}円`;
  return `${(v / 10000).toFixed(v % 10000 === 0 ? 0 : 1)}万円`;
};

export default function KanjiApp() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    purpose: "", area: "", count: 20, budget: 0, foods: [],
    seatType: "", courseType: "飲み放題付きコース", draftBeer: true,
    smoking: "禁煙希望", duration: "2時間", reservationTime: "19:00", secondParty: false,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("first");

  const toggleSelect = (key, val) => setForm(f => ({ ...f, [key]: f[key] === val ? "" : val }));
  const toggleFood = (id) => setForm(f => ({
    ...f, foods: f.foods.includes(id) ? f.foods.filter(x => x !== id) : [...f.foods, id]
  }));

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    const foodLabel = form.foods.length > 0 ? form.foods.join("・") : "何でもOK";
    const prompt = `あなたは東京の飲食店に詳しい幹事アシスタントです。
以下の条件に合う架空のお店を3件提案してください（実在しない架空の店名・情報でOK）。

条件:
- 会の目的: ${form.purpose}
- エリア: ${form.area}
- 人数: ${form.count}名
- 予算: 1人${form.budget.toLocaleString()}円
- 料理ジャンル: ${foodLabel}
- 席タイプ: ${form.seatType || "こだわりなし"}
- コース: ${form.courseType}
- 生ビール: ${form.draftBeer ? "生ビール含む飲み放題を希望" : "生ビールは不問"}
- 喫煙: ${form.smoking}
- 滞在時間: ${form.duration}
- 予約希望時間: ${form.reservationTime}
- 二次会提案: ${form.secondParty ? "一次会とセットで二次会も提案してほしい" : "不要"}

以下のJSON形式のみで返してください（説明文なし、バッククォートなし、マークダウンなし）:
{
  "shops": [
    {
      "name": "店名",
      "catch": "一言キャッチコピー",
      "address": "エリア内の架空の住所・ビル名",
      "genre": "ジャンル",
      "budget": "予算感（例: 5,000〜8,000円／人）",
      "capacity": "最大収容人数（例: 最大40名）",
      "seatDetail": "席の詳細（例: フロア貸切可・20名〜、テーブル4名×5卓）",
      "courseDetail": "コース内容（例: 全8品＋飲み放題2時間 8,000円）",
      "draftBeerInfo": "生ビール情報（例: 生ビール含む120種飲み放題）",
      "smokingInfo": "喫煙情報（例: 全席禁煙・店外喫煙スペースあり）",
      "durationInfo": "利用時間（例: 2時間制、延長30分500円）",
      "reservationNote": "予約時間に関する補足（例: 19時〜の予約が取りやすい・要前日予約）",
      "recommend": "この会の目的に推す理由（2〜3文）",
      "caution": "注意点・ハズしリスク（なければ空文字）",
      "score": 評価スコア（85〜98の整数）
    }
  ]${form.secondParty ? `,
  "secondParty": {
    "concept": "二次会のコンセプト提案（1文）",
    "spots": [
      {
        "name": "二次会店名",
        "genre": "バー/カラオケ/ダーツバー等",
        "address": "近隣の架空の住所",
        "budget": "1人予算",
        "smokingInfo": "喫煙情報",
        "description": "説明（2文）"
      }
    ]
  }` : ""}
}`;

    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.error) setResult({ error: data.error });
      else setResult(data);
    } catch (e) {
      setResult({ error: "提案の取得に失敗しました。もう一度お試しください。" });
    }
    setLoading(false);
  };

  const canNext = () => {
    if (step === 1) return form.purpose && form.area;
    if (step === 2) return form.count > 0 && form.foods.length > 0;
    if (step === 3) return form.seatType && form.courseType && form.smoking && form.duration;
    return true;
  };

  const resetAll = () => {
    setResult(null); setStep(1); setActiveTab("first");
    setForm({ purpose: "", area: "", count: 20, budget: 0, foods: [], seatType: "", courseType: "飲み放題付きコース", draftBeer: true, smoking: "禁煙希望", duration: "2時間", reservationTime: "19:00", secondParty: false });
  };

  const card = (selected) => ({
    borderRadius: 12, cursor: "pointer", transition: "all 0.18s",
    background: selected ? "rgba(247,151,30,0.18)" : "rgba(255,255,255,0.06)",
    border: selected ? "1.5px solid #f7971e" : "1.5px solid rgba(255,255,255,0.1)",
    color: selected ? "#ffd200" : "rgba(255,255,255,0.8)",
  });

  const chip = (selected) => ({
    padding: "9px 14px", borderRadius: 20, border: "none", cursor: "pointer",
    background: selected ? "linear-gradient(135deg,#f7971e,#ffd200)" : "rgba(255,255,255,0.07)",
    color: selected ? "#000" : "rgba(255,255,255,0.7)",
    fontWeight: selected ? 800 : 500, fontSize: 13, transition: "all 0.18s",
    border: selected ? "none" : "1px solid rgba(255,255,255,0.1)",
  });

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#0d0b1e 0%,#1a1535 50%,#0f1a2e 100%)", fontFamily:"'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif", color:"#fff", paddingBottom:60 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        input[type=range] { accent-color: #f7971e; }
        button:active { transform: scale(0.97); }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* Header */}
      <div style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"18px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 }}>
        <div style={{ width:38, height:38, borderRadius:11, background:"linear-gradient(135deg,#f7971e,#ffd200)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🍽</div>
        <div>
          <div style={{ fontWeight:800, fontSize:17 }}>幹事AI</div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", letterSpacing:1 }}>TOKYO PARTY PLANNER</div>
        </div>
      </div>

      <div style={{ maxWidth:560, margin:"0 auto", padding:"24px 16px" }}>

        {/* Step Indicator */}
        {!result && !loading && (
          <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
            {[1,2,3].map((s,i) => (
              <div key={s} style={{ display:"flex", alignItems:"center", flex: i<2?1:"none" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", flexShrink:0, background: step>s?"linear-gradient(135deg,#f7971e,#ffd200)":step===s?"rgba(247,151,30,0.3)":"rgba(255,255,255,0.08)", border: step===s?"1.5px solid #f7971e":"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color: step>s?"#000":step===s?"#ffd200":"rgba(255,255,255,0.3)" }}>{step>s?"✓":s}</div>
                {i<2 && <div style={{ flex:1, height:2, margin:"0 6px", background: step>s?"linear-gradient(90deg,#f7971e,#ffd200)":"rgba(255,255,255,0.08)" }}/>}
              </div>
            ))}
            <div style={{ marginLeft:12, fontSize:12, color:"rgba(255,255,255,0.4)" }}>
              {["目的・エリア","人数・予算・料理","席・コース設定"][step-1]}
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step===1 && !result && !loading && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <h2 style={{ fontSize:21, fontWeight:800, marginBottom:4 }}>会の目的とエリア</h2>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:24 }}>どんな会ですか？</p>
            <div style={{ marginBottom:26 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>会の目的</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
                {PURPOSES.map(p=>(
                  <button key={p.id} onClick={()=>toggleSelect("purpose",p.id)} style={{ ...card(form.purpose===p.id), padding:"13px 10px", display:"flex", alignItems:"center", gap:8, fontWeight:700, fontSize:13 }}>
                    <span style={{fontSize:18}}>{p.icon}</span>{p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>エリア</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {AREAS.map(a=>(
                  <button key={a} onClick={()=>toggleSelect("area",a)} style={{ ...card(form.area===a), padding:"11px 10px", fontWeight: form.area===a?700:400, fontSize:13 }}>{a}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step===2 && !result && !loading && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <h2 style={{ fontSize:21, fontWeight:800, marginBottom:4 }}>人数・予算・料理</h2>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:24 }}>具体的な条件を入力してください</p>

            {/* 人数 */}
            <div style={{ marginBottom:20, background:"rgba(255,255,255,0.04)", borderRadius:14, padding:16 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:12 }}>人数</div>
              <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center" }}>
                <button onClick={()=>setForm(f=>({...f,count:Math.max(1,f.count-1)}))} style={{ width:40, height:40, borderRadius:10, border:"none", cursor:"pointer", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:22, fontWeight:700, flexShrink:0 }}>−</button>
                <div style={{ textAlign:"center", minWidth:90 }}>
                  <span style={{ fontSize:38, fontWeight:900, color:"#ffd200" }}>{form.count}</span>
                  <span style={{ fontSize:14, color:"rgba(255,255,255,0.5)", marginLeft:4 }}>名</span>
                </div>
                <button onClick={()=>setForm(f=>({...f,count:Math.min(200,f.count+1)}))} style={{ width:40, height:40, borderRadius:10, border:"none", cursor:"pointer", background:"rgba(255,255,255,0.1)", color:"#fff", fontSize:22, fontWeight:700, flexShrink:0 }}>＋</button>
              </div>
              <div style={{ display:"flex", gap:8, justifyContent:"center", marginTop:12, flexWrap:"wrap" }}>
                {[5,10,15,20,30,50].map(n=>(
                  <button key={n} onClick={()=>setForm(f=>({...f,count:n}))} style={{ ...chip(form.count===n), padding:"6px 14px" }}>{n}名</button>
                ))}
              </div>
            </div>

            {/* 予算 */}
            <div style={{ marginBottom:20, background:"rgba(255,255,255,0.04)", borderRadius:14, padding:16 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:4 }}>1人あたり予算</div>
              <div style={{ fontSize:30, fontWeight:900, color:"#ffd200", marginBottom:10 }}>
                {formatBudget(form.budget)}<span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}> /人</span>
              </div>
              <input type="range" min={0} max={30000} step={500} value={form.budget} onChange={e=>setForm(f=>({...f,budget:Number(e.target.value)}))} style={{ width:"100%" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>
                <span>0円</span><span>3万円</span>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12, flexWrap:"wrap" }}>
                {[{v:4000,l:"4,000円"},{v:5000,l:"5,000円"},{v:6000,l:"6,000円"},{v:8000,l:"8,000円"},{v:10000,l:"1万円"},{v:15000,l:"1万5千円"}].map(b=>(
                  <button key={b.v} onClick={()=>setForm(f=>({...f,budget:b.v}))} style={{ ...chip(form.budget===b.v), padding:"6px 12px", fontSize:12 }}>{b.l}</button>
                ))}
              </div>
            </div>

            {/* 料理ジャンル */}
            <div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:6 }}>料理ジャンル</div>
              <div style={{ fontSize:11, color:"rgba(247,151,30,0.7)", marginBottom:10 }}>複数選択できます</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {FOOD_TYPES.map(f=>(
                  <button key={f.id} onClick={()=>toggleFood(f.id)} style={{ ...card(form.foods.includes(f.id)), padding:"11px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:4, position:"relative" }}>
                    {form.foods.includes(f.id) && <div style={{ position:"absolute", top:5, right:5, width:14, height:14, borderRadius:"50%", background:"linear-gradient(135deg,#f7971e,#ffd200)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:8, color:"#000", fontWeight:900 }}>✓</div>}
                    <span style={{fontSize:20}}>{f.icon}</span>
                    <span style={{fontSize:11, fontWeight: form.foods.includes(f.id)?700:400, textAlign:"center", lineHeight:1.3}}>{f.label}</span>
                  </button>
                ))}
              </div>
              {form.foods.length > 0 && (
                <div style={{ marginTop:10, padding:"8px 12px", borderRadius:8, background:"rgba(247,151,30,0.1)", border:"1px solid rgba(247,151,30,0.3)", fontSize:12, color:"#ffd200" }}>
                  選択中: {form.foods.join(" · ")}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3 && !result && !loading && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            <h2 style={{ fontSize:21, fontWeight:800, marginBottom:4 }}>席・コース設定</h2>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, marginBottom:20 }}>こだわり条件を選んでください</p>

            {/* 予約希望時間 */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>予約希望時間</div>
              <ScrollPicker value={form.reservationTime} onChange={t=>setForm(f=>({...f,reservationTime:t}))}/>
              <div style={{ textAlign:"center", marginTop:8, fontSize:13, color:"rgba(255,255,255,0.4)" }}>
                選択中: <span style={{color:"#ffd200", fontWeight:700}}>{form.reservationTime}</span>
              </div>
            </div>

            {/* 席タイプ */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>席のタイプ</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {SEAT_TYPES.map(s=>(
                  <button key={s.id} onClick={()=>toggleSelect("seatType",s.id)} style={{ ...card(form.seatType===s.id), padding:"12px 10px", display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
                    <span style={{fontSize:20}}>{s.icon}</span>
                    <div>
                      <div style={{fontWeight:700, fontSize:13}}>{s.label}</div>
                      <div style={{fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:1}}>{s.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* コース */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>注文スタイル</div>
              {COURSE_TYPES.map(c=>(
                <button key={c.id} onClick={()=>toggleSelect("courseType",c.id)} style={{ ...card(form.courseType===c.id), width:"100%", padding:"13px 14px", marginBottom:8, display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                  <span style={{fontSize:22}}>{c.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700, fontSize:14}}>{c.label}</div>
                    <div style={{fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:2}}>{c.sub}</div>
                  </div>
                  {form.courseType===c.id && <span style={{color:"#ffd200"}}>✓</span>}
                </button>
              ))}
            </div>

            {/* 生ビール */}
            {form.courseType==="飲み放題付きコース" && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>生ビール</div>
                <div style={{ display:"flex", gap:10 }}>
                  {[{v:true,l:"生ビール含む",icon:"🍺"},{v:false,l:"含まなくてOK",icon:"🍻"}].map(o=>(
                    <button key={String(o.v)} onClick={()=>setForm(f=>({...f,draftBeer:o.v}))} style={{ ...chip(form.draftBeer===o.v), flex:1, padding:"11px 8px", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <span style={{fontSize:18}}>{o.icon}</span>{o.l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 滞在時間 */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>希望滞在時間</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {DURATION_OPTIONS.map(d=>(
                  <button key={d.id} onClick={()=>toggleSelect("duration",d.id)} style={{ ...chip(form.duration===d.id), flex:1, padding:"11px 8px", display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
                    <span style={{fontSize:16}}>{d.icon}</span>{d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 喫煙 */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:10 }}>喫煙・禁煙</div>
              <div style={{ display:"flex", gap:8 }}>
                {SMOKE_OPTIONS.map(o=>(
                  <button key={o.id} onClick={()=>toggleSelect("smoking",o.id)} style={{ ...chip(form.smoking===o.id), flex:1, padding:"10px 6px", display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
                    <span style={{fontSize:18}}>{o.icon}</span>
                    <span style={{fontSize:12}}>{o.label}</span>
                    <span style={{fontSize:9, opacity:0.6}}>{o.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 二次会 */}
            <button onClick={()=>setForm(f=>({...f,secondParty:!f.secondParty}))} style={{ width:"100%", padding:"14px 16px", borderRadius:12, cursor:"pointer", background: form.secondParty?"rgba(247,151,30,0.15)":"rgba(255,255,255,0.05)", border: form.secondParty?"1.5px solid #f7971e":"1.5px solid rgba(255,255,255,0.1)", display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
              <span style={{fontSize:24}}>🎵</span>
              <div style={{flex:1, textAlign:"left"}}>
                <div style={{color:"#fff", fontWeight:700, fontSize:14}}>二次会の提案もほしい</div>
                <div style={{color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:2}}>近隣のバー・カラオケなど</div>
              </div>
              <div style={{ width:22, height:22, borderRadius:"50%", background: form.secondParty?"linear-gradient(135deg,#f7971e,#ffd200)":"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#000" }}>{form.secondParty?"✓":""}</div>
            </button>

            {/* Summary */}
            <div style={{ padding:14, borderRadius:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>📋 検索条件まとめ</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5px 16px", fontSize:12 }}>
                {[["目的",form.purpose],["エリア",form.area],["人数",`${form.count}名`],["予算",`${formatBudget(form.budget)}/人`],["料理",form.foods.length>0?form.foods.join("・"):"未選択"],["予約時間",form.reservationTime],["席",form.seatType||"おまかせ"],["時間",form.duration],["喫煙",form.smoking]].map(([k,v])=>(
                  <div key={k} style={{display:"flex", gap:4}}>
                    <span style={{color:"rgba(255,255,255,0.35)"}}>{k}:</span>
                    <span style={{color:"#ffd200", fontWeight:700, fontSize:11}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign:"center", padding:"70px 0", animation:"fadeIn 0.3s ease" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", border:"3px solid rgba(255,255,255,0.08)", borderTop:"3px solid #f7971e", animation:"spin 0.9s linear infinite", margin:"0 auto 20px" }}/>
            <div style={{color:"rgba(255,255,255,0.8)", fontSize:16, fontWeight:700}}>AIがお店を探しています...</div>
            <div style={{color:"rgba(255,255,255,0.35)", fontSize:12, marginTop:6}}>条件に合う最適なお店を提案中</div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div style={{ animation:"fadeIn 0.3s ease" }}>
            {result.error ? (
              <div style={{ padding:20, background:"rgba(255,100,100,0.1)", borderRadius:12, color:"#ff8080" }}>{result.error}</div>
            ) : (
              <>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
                  <h2 style={{ fontSize:20, fontWeight:800 }}>🎯 提案結果</h2>
                  <button onClick={resetAll} style={{ padding:"8px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.2)", background:"transparent", color:"#fff", cursor:"pointer", fontSize:12 }}>最初から</button>
                </div>
                {result.secondParty && (
                  <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                    {["first","second"].map(t=>(
                      <button key={t} onClick={()=>setActiveTab(t)} style={{ padding:"10px 0", flex:1, borderRadius:20, border:"none", cursor:"pointer", background: activeTab===t?"linear-gradient(135deg,#f7971e,#ffd200)":"rgba(255,255,255,0.07)", color: activeTab===t?"#000":"rgba(255,255,255,0.7)", fontWeight: activeTab===t?800:500, fontSize:13 }}>
                        {t==="first"?"🍽 一次会":"🎵 二次会"}
                      </button>
                    ))}
                  </div>
                )}
                {activeTab==="first" && result.shops?.map((shop,i)=>(
                  <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:16, padding:18, marginBottom:14, border: i===0?"1.5px solid rgba(247,151,30,0.5)":"1.5px solid rgba(255,255,255,0.08)", position:"relative" }}>
                    {i===0 && <div style={{ position:"absolute", top:-11, left:14, background:"linear-gradient(135deg,#f7971e,#ffd200)", color:"#000", fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:20 }}>⭐ おすすめ No.1</div>}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:16, fontWeight:800 }}>{shop.name}</div>
                        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginTop:2 }}>{shop.genre} · {shop.address}</div>
                      </div>
                      <div style={{ background: shop.score>=95?"linear-gradient(135deg,#f7971e,#ffd200)":"rgba(255,255,255,0.1)", color: shop.score>=95?"#000":"#fff", borderRadius:8, padding:"4px 10px", fontSize:14, fontWeight:800, flexShrink:0 }}>{shop.score}</div>
                    </div>
                    <div style={{ background:"rgba(247,151,30,0.1)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#ffd200", marginBottom:12, fontWeight:600 }}>"{shop.catch}"</div>
                    {[["💰","予算",shop.budget],["👥","収容",shop.capacity],["🪑","席・配置",shop.seatDetail],["📋","コース",shop.courseDetail],["🍺","生ビール",shop.draftBeerInfo],["🚭","喫煙",shop.smokingInfo],["⏱","利用時間",shop.durationInfo],["🕐","予約補足",shop.reservationNote]].map(([icon,label,val])=> val && (
                      <div key={label} style={{ display:"flex", gap:8, fontSize:12, padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                        <span style={{flexShrink:0}}>{icon}</span>
                        <span style={{color:"rgba(255,255,255,0.4)", minWidth:70, flexShrink:0}}>{label}</span>
                        <span style={{color:"rgba(255,255,255,0.85)", lineHeight:1.5}}>{val}</span>
                      </div>
                    ))}
                    <div style={{ marginTop:12, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.04)", fontSize:12, lineHeight:1.8, color:"rgba(255,255,255,0.75)" }}>💡 {shop.recommend}</div>
                    {shop.caution && <div style={{ marginTop:8, padding:"8px 12px", borderRadius:8, background:"rgba(255,120,80,0.1)", fontSize:11, color:"rgba(255,160,120,0.9)", border:"1px solid rgba(255,120,80,0.2)" }}>⚠️ {shop.caution}</div>}
                  </div>
                ))}
                {activeTab==="second" && result.secondParty && (
                  <div>
                    <div style={{ padding:14, borderRadius:12, marginBottom:14, background:"rgba(247,151,30,0.1)", border:"1px solid rgba(247,151,30,0.3)", fontSize:13, color:"#ffd200", fontWeight:600 }}>🎯 {result.secondParty.concept}</div>
                    {result.secondParty.spots?.map((spot,i)=>(
                      <div key={i} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, border:"1px solid rgba(255,255,255,0.08)", padding:16, marginBottom:12 }}>
                        <div style={{ fontSize:15, fontWeight:800, marginBottom:3 }}>{spot.name}</div>
                        <div style={{ color:"rgba(255,255,255,0.4)", fontSize:11, marginBottom:10 }}>{spot.genre} · {spot.address}</div>
                        <div style={{ display:"flex", gap:12, fontSize:12, marginBottom:8 }}>
                          <span style={{color:"#ffd200"}}>💰 {spot.budget}</span>
                          <span style={{color:"rgba(255,255,255,0.5)"}}>{spot.smokingInfo}</span>
                        </div>
                        <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)", lineHeight:1.7 }}>{spot.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        {!result && !loading && (
          <div style={{ display:"flex", gap:10, marginTop:28 }}>
            {step>1 && <button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:"15px", borderRadius:12, border:"1px solid rgba(255,255,255,0.15)", background:"transparent", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:14 }}>← 戻る</button>}
            <button onClick={()=>step<3?setStep(s=>s+1):handleSearch()} disabled={!canNext()} style={{ flex:2, padding:"15px", borderRadius:12, border:"none", cursor: canNext()?"pointer":"not-allowed", background: canNext()?"linear-gradient(135deg,#f7971e,#ffd200)":"rgba(255,255,255,0.08)", color: canNext()?"#000":"rgba(255,255,255,0.2)", fontWeight:800, fontSize:15, transition:"all 0.2s" }}>
              {step<3?"次へ →":"🔍 お店を探す"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
