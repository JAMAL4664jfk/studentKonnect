// API route for Gazoo AI chat
// This should be deployed as a serverless function or backend API
// For now, we'll use a simple proxy approach

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: 'You are Gazoo AI, an intelligent student companion for Student Konnect app. You help students with studying, budgeting, career advice, wellness tips, academic support, and campus life. Be friendly, encouraging, and provide practical advice. Keep responses concise and helpful. You can help with homework, exam prep, financial planning, mental health, career guidance, and social connections.',
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Gazoo AI API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
