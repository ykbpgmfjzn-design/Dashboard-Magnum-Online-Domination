/**
 * AI-powered insights API: analyzes current dashboard data and returns
 * summary + strategic recommendations. Uses OpenAI API.
 * Set OPENAI_API_KEY in Vercel env. If missing or error, returns 503 (frontend falls back to built-in logic).
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function buildDataContext(data, lang) {
  if (!data) return "";
  const days = data.days || (data.dailyUsers && data.dailyUsers.length) || 0;
  const totalUsers = data.totalUsers || 0;
  const sessions = data.sessions || 0;
  const newUsers = data.newUsers || 0;
  const engagedSessions = data.engagedSessions || 0;
  const avgTime = data.avgTime != null ? Math.round(data.avgTime) : 0;
  const engagementRate = sessions ? ((engagedSessions / sessions) * 100).toFixed(1) : 0;
  const newUsersShare = totalUsers ? ((newUsers / totalUsers) * 100).toFixed(1) : 0;

  const daily = (data.dailyUsers || []);
  const avgDaily = days ? (totalUsers / days).toFixed(0) : 0;
  const maxDaily = daily.length ? Math.max(...daily) : 0;
  const minDaily = daily.length ? Math.min(...daily) : 0;
  const maxDay = daily.indexOf(maxDaily) + 1;
  const minDay = daily.indexOf(minDaily) + 1;
  const volatility = avgDaily ? ((maxDaily - minDaily) / avgDaily).toFixed(2) : 0;

  const channels = (data.channels || []).slice(0, 6).map((c) => ({
    name: c.label,
    users: c.users != null ? Math.round(c.users) : 0,
    share: c.value != null ? `${(c.value * 100).toFixed(0)}%` : "",
    engagementRate: c.engagementRate != null ? `${(c.engagementRate * 100).toFixed(0)}%` : "",
  }));

  const sources = (data.sources || []).slice(0, 5).map((s) => ({
    source: s[0],
    users: s[1],
    engagementRate: s[3] != null ? `${(s[3] * 100).toFixed(0)}%` : "",
  }));

  const pages = (data.pages || []).slice(0, 5).map((p) => ({
    path: p[0],
    users: p[1],
    engagementRate: p[4] != null ? `${(p[4] * 100).toFixed(0)}%` : "",
  }));

  return JSON.stringify(
    {
      period: { days, totalUsers, sessions, newUsers, engagedSessions, avgTimeSeconds: avgTime, engagementRatePercent: engagementRate, newUsersSharePercent: newUsersShare },
      daily: { avgDaily, maxDaily, minDaily, maxDay, minDay, volatility },
      channels,
      topSources: sources,
      topPages: pages,
    },
    null,
    2
  );
}

async function getAIInsights(dataContext, language) {
  const lang = language === "ru" ? "Russian" : "English";
  const systemPrompt = `You are an expert web analytics consultant. Given dashboard metrics (traffic, channels, sources, pages), produce:
1. A concise "Data Insights & Patterns" paragraph (2-4 sentences): highlight real patterns—volatility, best/worst days, channel mix, engagement, any concerning pages. Use the actual numbers provided. Write in ${lang}.
2. Three to five "Strategic Recommendations" as actionable items, specific to the data (e.g. which channel to invest in, when to post, which pages to fix). Write in ${lang}.
Respond with valid JSON only, no markdown:
{"summary":"...","recommendations":["...","...","..."]}`;

  const userPrompt = `Analyze this dashboard data and return the JSON object (summary + recommendations):\n\n${dataContext}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error: ${res.status} ${err}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty OpenAI response");
  return JSON.parse(content);
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!OPENAI_API_KEY) {
    res.status(503).json({
      error: "AI insights unavailable",
      reason: "OPENAI_API_KEY not configured",
    });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { data, language } = body;
  const lang = language === "ru" ? "ru" : "en";

  try {
    const dataContext = buildDataContext(data, lang);
    const result = await getAIInsights(dataContext, lang);
    const summary = result.summary && String(result.summary).trim();
    const recommendations = Array.isArray(result.recommendations)
      ? result.recommendations.map((r) => String(r).trim()).filter(Boolean)
      : [];

    res.status(200).json({
      summary: summary || "",
      recommendations: recommendations.length ? recommendations : [],
    });
  } catch (err) {
    console.error("Insights API error:", err);
    res.status(503).json({
      error: "AI analysis failed",
      reason: err?.message || String(err),
    });
  }
};
