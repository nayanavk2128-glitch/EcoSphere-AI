// Sends a set of environment-related questions to the running server and reports the results.
// Usage: start the server (npm start) in one terminal, then run: node check-questions.js
const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/api/chat`;

const QUESTIONS = [
  // One or more questions per topic in the brief
  'What are the major causes of environmental pollution?',
  'What is climate change and what causes global warming?',
  'What are the main types of air pollution?',
  'How does water pollution affect ecosystems?',
  'How does soil pollution happen and how can it be prevented?',
  'What is waste management and why does it matter?',
  'What is recycling and how does it work?',
  'How should electronic waste (e-waste) be disposed of safely?',
  'What are the main types of renewable energy?',
  'How can I conserve water at home?',
  'What is sustainable agriculture?',
  'Why is plastic pollution a problem for oceans?',
  'Why does biodiversity matter and how can wildlife be protected?',
  'What are some sustainable lifestyle practices?',
  'What is sustainable development?',
  'Explain the 3Rs: reduce, reuse, and recycle.',
  // Harder or borderline questions
  'How do carbon credits work?',
  'Are paper bags better for the environment than plastic bags?',
  'What is the environmental impact of fast fashion?',
  'Is nuclear power sustainable?',
  // Should be politely redirected
  'How do I fix a Python TypeError?',
];

const REFUSAL_HINTS = /focus on|only (help|answer)|can't help|cannot help|unrelated/i;

async function ask(question) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, text: data.reply || data.error || '(no text)' };
}

(async () => {
  let failures = 0;
  for (const q of QUESTIONS) {
    const r = await ask(q);
    const tag = !r.ok ? 'FAILED' : REFUSAL_HINTS.test(r.text) ? 'REDIRECTED' : 'ANSWERED';
    if (!r.ok) failures++;
    console.log(`\n[${tag}] ${q}\n${r.text.slice(0, 300)}${r.text.length > 300 ? '...' : ''}`);
  }
  console.log(`\nDone. ${QUESTIONS.length - failures} of ${QUESTIONS.length} requests succeeded.`);
  console.log('Read each reply yourself: "ANSWERED" only means the request succeeded and the reply was not a redirect.');
})();
