require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Groq = require('groq-sdk');
const db = require('./db');
const docs = require('./docs.json');

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GROQ_API_KEY?.trim();
console.log('GROQ KEY:', apiKey ? '✅ Loaded' : '❌ Missing');

if (!apiKey) {
  console.error('❌ GROQ_API_KEY is missing!');
  process.exit(1);
}

const groq = new Groq({ apiKey });

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests.' }
});
app.use('/api/', limiter);

const docsContext = docs.map(d => `### ${d.title}\n${d.content}`).join('\n\n');

// ✅ Test route
app.get('/api/test-key', async (req, res) => {
  try {
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: 'Say hello in one word' }],
      max_tokens: 10
    });
    const text = result.choices[0].message.content;
    res.json({ success: true, reply: text });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// ✅ Chat route
app.post('/api/chat', async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessionId || !message) {
    return res.status(400).json({ error: 'sessionId and message are required.' });
  }

  try {
    db.prepare(`
      INSERT INTO sessions (id) VALUES (?)
      ON CONFLICT(id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    `).run(sessionId);

    db.prepare(`
      INSERT INTO messages (session_id, role, content) VALUES (?, 'user', ?)
    `).run(sessionId, message);

    const history = db.prepare(`
      SELECT role, content FROM messages
      WHERE session_id = ?
      ORDER BY created_at DESC LIMIT 10
    `).all(sessionId).reverse();

    const systemPrompt = `You are a product support assistant. Answer ONLY using the product documentation provided below.
If the user asks something not covered in the docs, respond exactly with: "Sorry, I don't have information about that."
Do not guess, hallucinate, or use outside knowledge.

--- PRODUCT DOCUMENTATION ---
${docsContext}
--- END OF DOCUMENTATION ---`;

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: chatMessages,
      max_tokens: 512
    });

    const reply = result.choices[0].message.content;
    const tokensUsed = result.usage?.total_tokens || 0;

    db.prepare(`
      INSERT INTO messages (session_id, role, content) VALUES (?, 'assistant', ?)
    `).run(sessionId, reply);

    res.json({ reply, tokensUsed });

  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get conversation
app.get('/api/conversations/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = db.prepare(`
      SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC
    `).all(sessionId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation.' });
  }
});

// ✅ Get all sessions
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = db.prepare(`
      SELECT * FROM sessions ORDER BY updated_at DESC
    `).all();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});