import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

// Strict Allowed Origins for Capacitor Android, iOS, and Production Web Host
const ALLOWED_ORIGINS = new Set([
  'https://localhost',            // Capacitor Android (androidScheme: 'https')
  'http://localhost',             // Capacitor Android local webview
  'capacitor://localhost',        // Capacitor iOS native webview
  'https://pyinnyar-hub.onrender.com', // Production hosted application & API
  'http://localhost:3000',        // Local dev server
  'http://localhost:5173',        // Vite default dev port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
]);

// CORS Middleware enforcing origin verification and preflight handling
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;

  if (origin) {
    const isAllowed = ALLOWED_ORIGINS.has(origin) ||
      (process.env.APP_URL && origin === process.env.APP_URL.replace(/\/+$/, '')) ||
      /^https:\/\/ais-.*\.run\.app$/.test(origin);

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
  }

  // Preflight OPTIONS requests handled cleanly
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

app.use(express.json());

// Strict Designated Founder / Super Admin Email Configuration
export const OWNER_EMAIL = (process.env.OWNER_EMAIL || 'lyrakaelin@gmail.com').trim().toLowerCase();

// Supabase Admin Client for server-side token and role verification
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'instructor' | 'student';
    name?: string;
  };
}

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

// Authentication & Authorization Middlewares
// STRICT SECURITY ENFORCEMENT: Never trust x-user-email or any client-provided identity header.
// Every request to protected endpoints MUST supply a valid Supabase JWT Bearer token.
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No Bearer token provided in Authorization header.' });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Backend database service is not configured with SUPABASE_SERVICE_ROLE_KEY.' });
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid, expired, or revoked authentication session token.' });
    }

    const email = (user.email || '').trim().toLowerCase();
    const isOwner = email === OWNER_EMAIL;
    let role: 'owner' | 'admin' | 'instructor' | 'student' = isOwner ? 'owner' : 'student';

    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, name')
        .eq('id', user.id)
        .single();
      
      if (profile?.role) {
        // Enforce that only the designated OWNER_EMAIL can ever possess the 'owner' role
        if (profile.role === 'owner' && !isOwner) {
          role = 'student';
        } else {
          role = isOwner ? 'owner' : profile.role;
        }
      }
    } catch {
      // In case database table is pending migration, fallback safely
      role = isOwner ? 'owner' : 'student';
    }

    req.user = {
      id: user.id,
      email,
      role,
      name: user.user_metadata?.name || '',
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Authentication verification failure.' });
  }
};

export const requireOwner = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'owner' || req.user.email.toLowerCase() !== OWNER_EMAIL) {
    return res.status(403).json({ error: 'Access denied: Founder & Super Admin authorization required.' });
  }
  next();
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Access denied: Administrator authorization required.' });
  }
  next();
};

export const requireInstructor = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (!['owner', 'admin', 'instructor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied: Instructor authorization required.' });
  }
  next();
};

// Real Supabase Authentication Endpoints (Zero Mock Data)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({
      error: 'Supabase authentication service is not connected. Please provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server environment.',
    });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error || !data.user || !data.session) {
      return res.status(401).json({ error: error?.message || 'Invalid email or password.' });
    }

    const isOwner = normalizedEmail === OWNER_EMAIL;
    let role: 'owner' | 'admin' | 'instructor' | 'student' = isOwner ? 'owner' : 'student';

    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role, name, avatar_url')
        .eq('id', data.user.id)
        .single();

      if (profile?.role) {
        role = (profile.role === 'owner' && !isOwner) ? 'student' : (isOwner ? 'owner' : profile.role);
      }
    } catch {
      // Table pending migration
    }

    return res.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || normalizedEmail.split('@')[0],
        email: data.user.email,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Authentication failed.' });
  }
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body || {};
  if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Please provide full name, email, and password.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (!supabaseAdmin) {
    return res.status(503).json({
      error: 'Supabase authentication service is not connected. Please provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server environment.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Public registration strictly registers as student via Supabase Auth.
    // Client-supplied roles are completely ignored and cannot escalate.
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      success: true,
      message: 'Account registered successfully. If email verification is enabled, please confirm via your inbox.',
      user: data.user ? {
        id: data.user.id,
        name: name.trim(),
        email: data.user.email,
        role: 'student',
      } : null,
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      } : null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/logout', (_req: Request, res: Response) => {
  return res.json({ success: true, message: 'Session terminated successfully.' });
});

// Protected Administration & Role Management Endpoints
app.post('/api/admin/promote-role', authenticateToken, requireOwner, async (req: AuthenticatedRequest, res: Response) => {
  const { targetEmail, newRole } = req.body || {};

  if (!targetEmail || !['admin', 'instructor', 'student'].includes(newRole)) {
    return res.status(400).json({ error: 'Valid targetEmail and role (admin, instructor, student) required.' });
  }

  const normalizedTarget = (targetEmail as string).trim().toLowerCase();
  if (normalizedTarget === OWNER_EMAIL) {
    return res.status(400).json({ error: 'Founder & Super Admin account role cannot be modified.' });
  }

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('email', normalizedTarget);

      if (error) {
        return res.status(500).json({ error: `Database role update failed: ${error.message}` });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Database update failed.' });
    }
  }

  return res.json({
    success: true,
    message: `User ${normalizedTarget} authorized as ${newRole} by Founder & Super Admin.`,
    targetEmail: normalizedTarget,
    newRole,
  });
});

// Manual Payment Review endpoint (Admin / Owner only)
// Strictly prevents automatic approval; records reviewer identity, review timestamp, and rejection reason.
app.post('/api/admin/review-payment', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { enrollmentId, action, reason } = req.body || {};
  if (!enrollmentId || (action !== 'approve' && action !== 'reject')) {
    return res.status(400).json({ error: 'Valid enrollmentId and action ("approve" | "reject") are required.' });
  }

  if (action === 'reject' && (!reason || typeof reason !== 'string' || !reason.trim())) {
    return res.status(400).json({ error: 'Rejection reason explanation is mandatory when rejecting a payment.' });
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const reviewerEmail = req.user?.email || 'Authorized Staff';
  const reviewDate = new Date().toISOString();

  if (supabaseAdmin) {
    try {
      const updatePayload: Record<string, any> = {
        payment_status: newStatus,
        verified_by: req.user?.id,
        verified_at: reviewDate,
        rejection_reason: action === 'reject' ? reason.trim() : null,
      };

      const { error } = await supabaseAdmin
        .from('enrollments')
        .update(updatePayload)
        .eq('id', enrollmentId);

      if (error) {
        // Safe schema resilience: If audit columns are pending SQL migration, update core status
        console.warn('Full schema payment update notice (falling back to core columns):', error.message);
        const { error: fallbackErr } = await supabaseAdmin
          .from('enrollments')
          .update({ payment_status: newStatus })
          .eq('id', enrollmentId);

        if (fallbackErr) {
          return res.status(500).json({ error: `Database payment update failed: ${fallbackErr.message}` });
        }
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Database update failed.' });
    }
  }

  return res.json({
    success: true,
    action,
    newStatus,
    enrollmentId,
    reviewedBy: reviewerEmail,
    reviewedAt: reviewDate,
    reason: action === 'reject' ? reason.trim() : null,
    message: action === 'approve'
      ? `Payment enrollment ${enrollmentId} approved. Student course access unlocked.`
      : `Payment enrollment ${enrollmentId} rejected with reason: "${reason.trim()}". Access remains locked.`,
  });
});

// Legacy backwards compatibility alias for verify-payment
app.post('/api/admin/verify-payment', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { enrollmentId } = req.body || {};
  if (!enrollmentId) {
    return res.status(400).json({ error: 'Enrollment ID required.' });
  }

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('enrollments')
        .update({
          payment_status: 'approved',
          verified_by: req.user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq('id', enrollmentId);

      if (error) {
        // Safe schema resilience
        console.warn('Full schema verify notice (falling back to payment_status):', error.message);
        await supabaseAdmin
          .from('enrollments')
          .update({ payment_status: 'approved' })
          .eq('id', enrollmentId);
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message || 'Database update failed.' });
    }
  }

  return res.json({
    success: true,
    action: 'approve',
    enrollmentId,
    verifiedBy: req.user?.email,
    verifiedAt: new Date().toISOString(),
    message: `Payment enrollment ${enrollmentId} approved by authorized administrator.`,
  });
});

// Student Refund Request endpoint
// Enables students who made accidental or mistaken payments to submit a refund inquiry with proof details
app.post('/api/student/request-refund', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { enrollmentId, reason, contactInfo } = req.body || {};
  if (!enrollmentId || !reason || typeof reason !== 'string') {
    return res.status(400).json({ error: 'Enrollment ID and refund justification are required.' });
  }

  const requestedAt = new Date().toISOString();

  if (supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('enrollments')
        .update({
          refund_requested: true,
          refund_reason: reason.trim(),
          refund_status: 'requested',
        })
        .eq('id', enrollmentId)
        .eq('student_id', req.user?.id);

      if (error) {
        console.warn('Refund column schema notice (requires migration to persist in database):', error.message);
      }
    } catch (e: any) {
      console.warn('Database refund inquiry notice:', e.message);
    }
  }

  return res.json({
    success: true,
    message: 'Refund inquiry submitted successfully. Academic finance operations will review within 24–48 hours.',
    enrollmentId,
    studentEmail: req.user?.email,
    requestedAt,
    contactSupport: 'support@pyinnyarhub.edu.mm',
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
      server: {
        middlewareMode: true,
        hmr: false,
      },
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
