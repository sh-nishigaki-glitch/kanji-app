export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { form } = req.body;
  if (!form) return res.status(400).json({ error: "No form data provided" });

  const areaMap = {
    "新橋・汐留": "SS10", "銀座・有楽町": "SS10", "丸の内・大手町": "SS10",
    "渋谷・恵比寿": "SS13", "新宿・四谷": "SS12", "六本木・赤坂": "SS11",
    "品川・目黒": "SS14", "上野・秋葉原": "SS09",
  };

  const genreMap = {
    "焼き鳥": "G008", "海鮮・魚介": "G011", "焼肉": "G008",
    "韓国料理": "G017", "中華・餃子": "G004", "イタリアン": "G006",
    "和食・割烹": "G002", "鍋料理": "G015", "フレンチ": "G005",
    "スペイン料理": "G007", "しゃぶしゃぶ・すき焼き": "G003",
    "寿司・鮨": "G001", "鉄板焼き・ステーキ": "G016", "ダイニングバー": "G013",
  };

  try {
    const serviceArea = areaMap[form.area] || "SS10";
    const genre = form.foods?.length > 0 && form.foods[0] !== "何でもOK"
      ? genreMap[form.foods[0]] || "" : "";

    const params = new URLSearchParams({
      key: process.env.HOTPEPPER_API_KEY,
      service_area: serviceArea,
      count: 10,
      format: "json",
      ...(genre && { genre }),
      ...(form.budget > 0 && { budget: getBudgetCode(form.budget) }),
      ...(form.smoking === "禁煙希望" && { non_smoking: 1 }),
      ...(form.count >= 20 && { party_capacity: form.count }),
    });

    const hpRes = await fetch(`https://webservice.recruit.co.jp/hotpepper/restaurant/v1/?${params}`);
    const hpData = await hpRes.json();
    const shops = hpData?.results?.shop || [];

    if (shops.length === 0) {
      return res.status(200).json({ shops: [], empty: true });
    }

    const shopSummaries = shops.slice(0, 10).map(s => ({
      name: s.name,
      address: s.address,
      genre: s.genre?.name,
      budget: s.budget?.average,
      capacity: s.capacity,
      access: s.mobile_access,
      privateRoom: s.private_room,
      freeDrink: s.free_drink,
      smoking: s.non_smoking,
      urls: s.urls?.pc,
      photo: s.photo?.mobile?.l,
      catch: s.catch,
      open: s.open,
    }));

    const prompt = `あなたは幹事アシスタントです。以下の条件と店舗リストから、最適な3件を選んで分析してください。

会の条件:
- 目的: ${form.purpose}
- 人数: ${form.count}名
- 予算: 1人${form.budget.toLocaleString()}円
- 料理: ${form.foods?.join("・") || "何でもOK"}
- 席タイプ: ${form.seatType || "こだわりなし"}
- 喫煙: ${form.smoking}
- 滞在時間: ${form.duration}

店舗リスト:
${JSON.stringify(shopSummaries, null, 2)}

以下のJSON形式のみで返してください（説明文なし、バッククォートなし）:
{
  "shops": [
    {
      "name": "店名（店舗リストから）",
      "catch": "一言キャッチ",
      "address": "住所（店舗リストから）",
      "genre": "ジャンル",
      "budget": "予算感",
      "capacity": "収容人数",
      "seatDetail": "席の詳細",
      "courseDetail": "コース・飲み放題情報",
      "draftBeerInfo": "生ビール情報",
      "smokingInfo": "喫煙情報",
      "durationInfo": "利用時間",
      "reservationNote": "予約に関する補足",
      "url": "URLをそのまま（店舗リストのurls）",
      "photo": "photoをそのまま（店舗リストのphoto）",
      "recommend": "この会の目的に推す理由（2〜3文）",
      "caution": "注意点（なければ空文字）",
      "score": 評価スコア（85〜98の整数）
    }
  ]
}`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    const text = aiData.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    res.status(200).json(parsed);

  } catch (e) {
    console.error("Handler error:", e);
    res.status(500).json({ error: "AIの提案取得に失敗しました。もう一度お試しください。" });
  }
}

function getBudgetCode(budget) {
  if (budget <= 2000) return "B009";
  if (budget <= 3000) return "B010";
  if (budget <= 4000) return "B011";
  if (budget <= 5000) return "B001";
  if (budget <= 7000) return "B002";
  if (budget <= 10000) return "B003";
  if (budget <= 15000) return "B008";
  if (budget <= 20000) return "B004";
  return "B005";
}
