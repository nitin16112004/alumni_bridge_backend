const Groq = require('groq-sdk');

const conversationHistory = new Map();

let groqClient = null;
const getGroq = () => {
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
};

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.status(503).json({ message: 'AI service is not configured. Please add a GROQ_API_KEY to the backend .env file.' });
    }
    const userId = String(req.user._id);

    if (!conversationHistory.has(userId)) {
      conversationHistory.set(userId, [
        {
          role: 'system',
          content:
            'You are an AI career assistant for Alumni Bridge, a college alumni networking platform. Help students with career guidance, skill roadmaps, interview preparation, and mentorship advice. Be concise, practical, and encouraging.',
        },
      ]);
    }

    const history = conversationHistory.get(userId);
    history.push({ role: 'user', content: message });

    if (history.length > 21) {
      history.splice(1, history.length - 21);
    }

    const completion = await getGroq().chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama3-8b-8192',
      messages: history,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    history.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearHistory = async (req, res) => {
  conversationHistory.delete(String(req.user._id));
  res.json({ message: 'Conversation history cleared' });
};
