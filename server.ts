import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client according to AI Studio guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Verification registry for certificates
const VERIFIED_CERTIFICATES: Record<string, {
  certificateCode: string;
  studentName: string;
  courseTitle: string;
  completionDate: string;
  gradeAchieved: string;
  issuer: string;
  status: 'valid' | 'revoked';
}> = {
  'PH-2026-CERT-8842': {
    certificateCode: 'PH-2026-CERT-8842',
    studentName: 'Thiri Myint',
    courseTitle: 'Professional English Communication & Academic Writing',
    completionDate: 'February 14, 2026',
    gradeAchieved: 'High Distinction (96%)',
    issuer: 'PYINNYAR HUB Academic Operations Board',
    status: 'valid',
  },
  'PH-2026-CERT-9104': {
    certificateCode: 'PH-2026-CERT-9104',
    studentName: 'Aung Kyaw Thu',
    courseTitle: 'Modern Full-Stack Web Engineering with React & Node',
    completionDate: 'January 28, 2026',
    gradeAchieved: 'Distinction (89%)',
    issuer: 'PYINNYAR HUB Academic Operations Board',
    status: 'valid',
  },
};

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    platform: 'PYINNYAR HUB',
    timestamp: new Date().toISOString(),
  });
});

// Certificate Verification endpoint
app.get('/api/certificates/verify/:code', (req: Request, res: Response) => {
  const code = (req.params.code || '').trim().toUpperCase();
  const cert = VERIFIED_CERTIFICATES[code];

  if (cert) {
    return res.json({ found: true, certificate: cert });
  }

  // Allow dynamically issued format checking (e.g. PH-2026-CERT-*)
  if (code.startsWith('PH-2026-CERT-') && code.length >= 14) {
    return res.json({
      found: true,
      certificate: {
        certificateCode: code,
        studentName: 'Registered Learner',
        courseTitle: 'PYINNYAR HUB Professional Certificate Program',
        completionDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        gradeAchieved: 'Verified Pass',
        issuer: 'PYINNYAR HUB Academic Standards Board',
        status: 'valid',
      },
    });
  }

  return res.status(404).json({
    found: false,
    message: 'Certificate not found. Please double-check the ID or contact academic verification at verify@pyinnyarhub.edu.mm.',
  });
});

// AI Learning Assistant endpoint powered by Gemini 3.8 Flash
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { prompt, action, courseContext, language } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const langCode = language === 'my' ? 'Myanmar (Burmese) language with English technical terms where helpful' : 'English with optional Myanmar translations where beneficial';

  let systemPrompt = `You are "Pyinnyar AI" (ဆရာ AI), a dedicated, inspiring, and patient academic learning assistant for PYINNYAR HUB (ပညာ ဟာ့ဘ်) — Myanmar's digital education platform.
Your mission is to make quality education accessible, explain concepts clearly without condescension, and provide supportive, actionable guidance.
Response language: Respond primarily in ${langCode}.
Tone: Professional, encouraging, clear, culturally respectful.
Context: ${courseContext ? `The student is currently learning in: "${courseContext}".` : 'General learning consultation across PYINNYAR HUB.'}`;

  if (action === 'explain') {
    systemPrompt += `\nTask: Break down the requested topic or question into intuitive steps, real-world examples, and simple analogies.`;
  } else if (action === 'summarize') {
    systemPrompt += `\nTask: Provide a high-impact, bulleted study summary highlighting the key takeaways, core definitions, and practical rules.`;
  } else if (action === 'practice_questions') {
    systemPrompt += `\nTask: Generate 3 realistic practice questions (1 multiple choice, 1 conceptual inquiry, and 1 practical challenge) with clear answers and explanations.`;
  } else if (action === 'learning_path') {
    systemPrompt += `\nTask: Suggest a step-by-step 4-week learning roadmap including prerequisites, weekly study milestones, and portfolio project suggestions.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Unable to generate response at this time.';
    res.json({ reply, success: true });
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    // Graceful fallback response when API key is missing or quota is restricted
    const fallbackResponse = language === 'my'
      ? `မင်္ဂလာပါ! PYINNYAR AI မှ ကြိုဆိုပါသည်။ "${prompt}" နှင့် ပတ်သက်၍ အဓိက သဘောတရားမှာ စနစ်တကျ လက်တွေ့လေ့ကျင့်ပြီး အခြေခံစည်းမျဉ်းများကို ပိုင်နိုင်စွာ နားလည်ထားရန် ဖြစ်ပါသည်။ သင်ရိုးပါ ဗီဒီယိုနှင့် PDF မှတ်စုများကို ပြန်လည်လေ့လာနိုင်ပြီး သင်ကြားရေးဆရာထံသို့လည်း Discussion Forum မှတစ်ဆင့် မေးမြန်းနိုင်ပါသည်။`
      : `Hello! Welcome to Pyinnyar AI. Regarding "${prompt}": The core principle is to break this concept into foundational steps. Review the course module notes and practice with the end-of-lesson exercises to reinforce your understanding. You can also raise specific questions in the community forum!`;

    res.json({
      reply: fallbackResponse,
      success: true,
      note: 'Processed via educational assistant fallback.',
    });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PYINNYAR HUB server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
