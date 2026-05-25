export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(500).json({ error: `APIエラー: ${response.status}` });
    }

    const data = await response.json();
    const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";

    if (!text) {
      console.error("Empty response from API:", JSON.stringify(data));
      return res.status(500).json({ error: "AIからの応答が空でした。もう一度お試しください。" });
    }

    let clean = text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      clean = jsonMatch[0];
    } else {
      clean = text.replace(/```json|```/g, "").trim();
    }

    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    console.error("Handler error:", e);
    res.status(500).json({ error: "AIの提案取得に失敗しました。もう一度お試しください。" });
  }
}
