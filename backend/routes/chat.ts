import { Router, Response } from 'express';
import { body } from 'express-validator';
import { Trip } from '../models/Trip';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { handleValidationErrors } from '../utils/validation';

const router = Router();

router.post(
  '/:id',
  authenticateToken,
  [body('message').notEmpty().withMessage('Message is required')],
  handleValidationErrors,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
      const trip = await Trip.findOne({
        _id: req.params.id,
        userId: req.user!.userId,
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      if (!GROQ_API_KEY) {
        res.status(500).json({ error: 'Groq API Key not configured' });
        return;
      }

      const { message, history = [] } = req.body;

      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      const systemPrompt = `You are Wandr, an AI travel assistant. The user is planning a trip:
- Destination: ${trip.destination}
- Duration: ${trip.days} days
- Budget: ${trip.budget}
- Interests: ${trip.interests.join(', ')}
- Quick Facts: ${JSON.stringify(trip.quickFacts)}

Provide helpful, contextual travel advice. Be concise and actionable.
Your responses are streamed to the user.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.map((msg: any) => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: message },
          ],
          temperature: 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body from Groq API');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices[0]?.delta?.content;
                if (content) {
                  res.write(`data: ${JSON.stringify({ type: 'delta', text: content })}\n\n`);
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      } finally {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error('Chat error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', text: 'Sorry, I encountered an error.' })}\n\n`);
      res.end();
    }
  }
);

export default router;
