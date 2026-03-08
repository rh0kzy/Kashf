const { Mistral } = require('@mistralai/mistralai');

const client = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

const analyzeArticle = async (article) => {
  const prompt = `
You are a media analysis AI. Analyze the following news article and return a JSON object only, no markdown, no explanation.

Article:
Title: ${article.title}
Source: ${article.source}
Content: ${article.summary}

Return this exact JSON structure:
{
  "bias": "Left | Center-Left | Center | Center-Right | Right",
  "biasScore": <number 0-100, where 0=far left, 100=far right, 50=center>,
  "tone": "Positive | Neutral | Negative | Alarming | Sympathetic | Critical",
  "toneScore": <number 0-100, where 0=very negative, 100=very positive>,
  "framing": "<one sentence describing the narrative angle>",
  "keyVerbs": ["<verb1>", "<verb2>", "<verb3>"],
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "opinionVsFact": <number 0-100, where 0=pure fact, 100=pure opinion>,
  "summary": "<2-3 sentence neutral summary of the article>"
}
`;

  const response = await client.chat.complete({
    model: 'mistral-small-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
  });

  const raw = response.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

const analyzeMultiple = async (articles) => {
  const results = await Promise.allSettled(
    articles.map((article) => analyzeArticle(article))
  );

  return results.map((result, index) => ({
    ...articles[index],
    analysis: result.status === 'fulfilled' ? result.value : null,
    analysisError: result.status === 'rejected' ? result.reason.message : null,
  }));
};

const detectFakeNews = async (article) => {
  const prompt = `
You are a fact-checking AI. Analyze this article for credibility and return a JSON object only, no markdown, no explanation.

Article:
Title: ${article.title}
Source: ${article.source}
Content: ${article.content}

Return this exact JSON structure:
{
  "credibilityScore": <number 0-100, where 0=completely unreliable, 100=highly credible>,
  "manipulationLanguage": <number 0-100, where 0=none, 100=highly manipulative>,
  "emotionalLanguage": <number 0-100>,
  "opinionVsFact": <number 0-100, where 0=pure fact, 100=pure opinion>,
  "redFlags": ["<flag1>", "<flag2>"],
  "verifiedClaims": ["<claim1>", "<claim2>"],
  "suspiciousClaims": ["<claim1>", "<claim2>"],
  "verdict": "Credible | Likely Credible | Uncertain | Likely Misleading | Misleading",
  "explanation": "<2-3 sentence explanation of the verdict>"
}
`;

  const response = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
  });

  const raw = response.choices[0].message.content;
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
};

module.exports = {
  analyzeArticle,
  analyzeMultiple,
  detectFakeNews,
};