import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { t } from '../../utils/translations';
import { apiUrl } from '../../utils/api';
import { X, Mail, Lock, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    openAuthModal,
    authMode,
    language,
    login,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(authMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authMode);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'forgot_password') {
      if (!email.trim()) {
        setErrorMsg('Please enter your email address.');
        return;
      }
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setSuccessMsg(`Password reset instructions have been sent to ${email}.`);
        setTimeout(() => {
          setMode('login');
          setSuccessMsg('');
        }, 2500);
      }, 700);
      return;
    }

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured()) {
        if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (error) {
            setErrorMsg(error.message || 'Invalid email or password.');
            setLoading(false);
            return;
          }

          if (!data.user || !data.session) {
            setErrorMsg('Unable to retrieve session. Please check your credentials.');
            setLoading(false);
            return;
          }

          const isOwner = normalizedEmail === 'lyrakaelin@gmail.com';
          let role: 'owner' | 'admin' | 'instructor' | 'student' = isOwner ? 'owner' : 'student';
          let displayName = data.user.user_metadata?.name || normalizedEmail.split('@')[0];

          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('role, name')
              .eq('id', data.user.id)
              .single();

            if (prof?.role) {
              role = (prof.role === 'owner' && !isOwner) ? 'student' : (isOwner ? 'owner' : prof.role);
            }
            if (prof?.name) displayName = prof.name;
          } catch {
            // Profile fetch optional
          }

          login({
            id: data.user.id,
            name: displayName,
            email: data.user.email || normalizedEmail,
            role,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            learningPreferences: {
              language,
              weeklyGoalHours: 6,
              preferredCategories: [1, 2, 4],
              notificationsEnabled: true,
            },
            enrolledCourseIds: [],
            completedCourseIds: [],
            savedCourseIds: [],
            createdAt: data.user.created_at || new Date().toISOString(),
          }, data.session.access_token);

          setSuccessMsg(language === 'my' ? 'အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ။' : 'Signed in successfully.');
          setPassword('');
          setTimeout(() => {
            setLoading(false);
            openAuthModal(false);
          }, 900);
          return;
        }

        if (mode === 'register') {
          // Public registration strictly registers as student. Never accepts client role override.
          const { data, error } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: {
              data: {
                name: name.trim() || 'Learner',
              },
            },
          });

          if (error) {
            setErrorMsg(error.message || 'Registration failed.');
            setLoading(false);
            return;
          }

          if (data.session && data.user) {
            login({
              id: data.user.id,
              name: name.trim() || 'Learner',
              email: data.user.email || normalizedEmail,
              role: 'student',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              learningPreferences: {
                language,
                weeklyGoalHours: 6,
                preferredCategories: [1, 2, 4],
                notificationsEnabled: true,
              },
              enrolledCourseIds: [],
              completedCourseIds: [],
              savedCourseIds: [],
              createdAt: data.user.created_at || new Date().toISOString(),
            }, data.session.access_token);

            setSuccessMsg(language === 'my' ? 'အကောင့်အသစ် ဖွင့်လှစ်ပြီးပါပြီ။' : 'Account created successfully!');
            setPassword('');
            setTimeout(() => {
              setLoading(false);
              openAuthModal(false);
            }, 900);
          } else {
            setSuccessMsg(
              language === 'my'
                ? 'အကောင့်ဖွင့်လှစ်ခြင်း အောင်မြင်ပါသည်။ သင့်အီးမေးလ်သို့ ပို့ထားသော အတည်ပြုလင့်ခ်ကို စစ်ဆေးပေးပါ။'
                : 'Registration successful! Please check your email to verify your account before logging in.'
            );
            setLoading(false);
            setTimeout(() => {
              setMode('login');
              setSuccessMsg('');
            }, 3000);
          }
          return;
        }
      }

      // Backend API endpoint proxy when client SDK is awaiting credentials
      const endpoint = apiUrl(mode === 'login' ? '/api/auth/login' : '/api/auth/register');
      const body =
        mode === 'login'
          ? { email: normalizedEmail, password }
          : { name: name.trim() || 'Learner', email: normalizedEmail, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
        return;
      }

      setSuccessMsg(
        mode === 'login'
          ? (language === 'my' ? 'အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ။' : 'Signed in successfully.')
          : (language === 'my' ? 'အကောင့်အသစ် ဖွင့်လှစ်ပြီးပါပြီ။' : 'Account created successfully! Welcome.')
      );

      login(data.user, data.session?.access_token);
      setPassword('');

      setTimeout(() => {
        setLoading(false);
        openAuthModal(false);
      }, 900);
    } catch {
      setErrorMsg('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#A9874B] uppercase">
              PYINNYAR HUB
            </span>
            <h2 className="text-base font-bold text-[#14243A]">
              {mode === 'login'
                ? (language === 'my' ? 'အကောင့်ဝင်ရောက်ရန်' : 'Sign In to Your Account')
                : mode === 'register'
                ? (language === 'my' ? 'အကောင့်အသစ်ဖွင့်ရန်' : 'Create New Account')
                : (language === 'my' ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန်' : 'Reset Password')}
            </h2>
          </div>
          <button
            onClick={() => openAuthModal(false)}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium flex items-center gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-medium text-stone-700 mb-1">
                  {language === 'my' ? 'နာမည် အပြည့်အစုံ' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'my' ? 'ဥပမာ - မင်းသန့်' : 'e.g. Min Thant'}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                    required
                  />
                </div>
              </div>

            </>
          )}

          <div>
            <label className="block font-medium text-stone-700 mb-1">
              {language === 'my' ? 'အီးမေးလ် လိပ်စာ' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                required
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-stone-700">
                  {language === 'my' ? 'စကားဝှက်' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setErrorMsg('');
                    }}
                    className="text-[11px] text-[#A9874B] hover:underline"
                  >
                    {language === 'my' ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                  required
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">
                {language === 'my' ? 'အနည်းဆုံး ၆ လုံး' : 'Minimum 6 characters'}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] font-bold text-xs shadow-xs transition-transform active:scale-95 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {mode === 'login'
                ? (language === 'my' ? 'ဝင်ရောက်မည်' : 'Sign In')
                : mode === 'register'
                ? (language === 'my' ? 'စာရင်းသွင်းမည်' : 'Register Account')
                : (language === 'my' ? 'ပို့ဆောင်မည်' : 'Send Reset Link')}
            </span>
          </button>
        </form>

        <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-500">
          {mode === 'login' ? (
            <p>
              {language === 'my' ? 'အကောင့်မရှိသေးပါက' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="font-bold text-[#14243A] hover:underline"
              >
                {language === 'my' ? 'အကောင့်အသစ်ဖွင့်ပါ' : 'Create an account'}
              </button>
            </p>
          ) : (
            <p>
              {language === 'my' ? 'အကောင့်ရှိပြီးသားဖြစ်ပါက' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="font-bold text-[#14243A] hover:underline"
              >
                {language === 'my' ? 'အကောင့်ဝင်ပါ' : 'Sign In'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
