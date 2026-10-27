
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { apiUrl } from '../../utils/api';
import {
  X, Mail, Lock, User, CheckCircle2,
  AlertCircle, Loader2, Eye, EyeOff
} from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot_password' | 'reset_password';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    openAuthModal,
    authMode,
    language,
    login,
  } = useApp();

  const isMy = language === 'my';

  const [mode, setMode] = useState<AuthMode>(authMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authMode);
      clearMessages();
    }
  }, [authMode, isAuthModalOpen]);

  // Detect Supabase password recovery links.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset_password');
        setPassword('');
        setConfirmPassword('');
        clearMessages();
        openAuthModal(true, 'login');
      }
    });

    return () => subscription.unsubscribe();
  }, [openAuthModal]);

  if (!isAuthModalOpen) return null;

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearMessages();
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const normalizedEmail = email.trim().toLowerCase();

    if (mode !== 'reset_password' && !normalizedEmail) {
      setErrorMsg(isMy ? 'အီးမေးလ်ထည့်ပေးပါ။' : 'Please enter your email address.');
      return;
    }

    if (mode === 'forgot_password') {
      if (!isSupabaseConfigured()) {
        setErrorMsg('Password reset requires Supabase configuration.');
        return;
      }

      setLoading(true);

      try {
        const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;

        const { error } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          { redirectTo }
        );

        if (error) throw error;

        setSuccessMsg(
          isMy
            ? 'Password ပြန်သတ်မှတ်ရန် link ကို email ပို့ပြီးပါပြီ။ Inbox နှင့် Spam ကို စစ်ဆေးပါ။'
            : 'Password reset link sent. Please check your inbox and spam folder.'
        );
      } catch (error: any) {
        setErrorMsg(error.message || 'Unable to send reset email.');
      } finally {
        setLoading(false);
      }

      return;
    }

    if (mode === 'reset_password') {
      if (!isSupabaseConfigured()) {
        setErrorMsg('Supabase is not configured.');
        return;
      }

      if (password.length < 6) {
        setErrorMsg(isMy ? 'စကားဝှက် အနည်းဆုံး ၆ လုံးရှိရပါမယ်။' : 'Password must contain at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg(isMy ? 'စကားဝှက်နှစ်ခု မတူညီပါ။' : 'Passwords do not match.');
        return;
      }

      setLoading(true);

      try {
        const { error } = await supabase.auth.updateUser({ password });

        if (error) throw error;

        setSuccessMsg(
          isMy
            ? 'စကားဝှက်အသစ် ပြောင်းလဲပြီးပါပြီ။ အကောင့်ဝင်နိုင်ပါပြီ။'
            : 'Your password has been updated successfully.'
        );

        setPassword('');
        setConfirmPassword('');

        setTimeout(() => {
          switchMode('login');
        }, 1800);
      } catch (error: any) {
        setErrorMsg(error.message || 'Unable to update password. Please request a new reset link.');
      } finally {
        setLoading(false);
      }

      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg(isMy ? 'စကားဝှက် အနည်းဆုံး ၆ လုံးရှိရပါမယ်။' : 'Password must be at least 6 characters.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg(isMy ? 'စကားဝှက်နှစ်ခု မတူညီပါ။' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        if (mode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          });

          if (error) throw error;

          if (!data.user || !data.session) {
            throw new Error('Unable to retrieve your session.');
          }

          const isOwner = normalizedEmail === 'lyrakaelin@gmail.com';
          let role: 'owner' | 'admin' | 'instructor' | 'student' =
            isOwner ? 'owner' : 'student';

          let displayName =
            data.user.user_metadata?.name || normalizedEmail.split('@')[0];

          const { data: profile } = await supabase
            .from('profiles')
            .select('role, name')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile?.role) {
            role = isOwner
              ? 'owner'
              : profile.role === 'owner'
                ? 'student'
                : profile.role;
          }

          if (profile?.name) displayName = profile.name;

          login({
            id: data.user.id,
            name: displayName,
            email: data.user.email || normalizedEmail,
            role,
            avatar: '',
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

          setSuccessMsg(isMy ? 'အကောင့်ဝင်ရောက်ပြီးပါပြီ။' : 'Signed in successfully.');
          setPassword('');

          setTimeout(() => openAuthModal(false), 900);
          return;
        }

        // Public signups do not accept a role from the browser.
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { name: name.trim() || 'Learner' },
          },
        });

        if (error) throw error;

        if (data.session && data.user) {
          login({
            id: data.user.id,
            name: name.trim() || 'Learner',
            email: data.user.email || normalizedEmail,
            role: 'student',
            avatar: '',
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

          setSuccessMsg(isMy ? 'အကောင့်ဖွင့်ပြီးပါပြီ။' : 'Account created successfully!');
          setTimeout(() => openAuthModal(false), 900);
        } else {
          setSuccessMsg(
            isMy
              ? 'အကောင့်ဖွင့်ပြီးပါပြီ။ Email ထဲက verification link ကိုနှိပ်ပေးပါ။'
              : 'Registration successful. Please verify your email before signing in.'
          );
          setPassword('');
          setConfirmPassword('');
        }

        return;
      }

      // Existing backend fallback for login and registration.
      const endpoint = apiUrl(
        mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      );

      const body = mode === 'login'
        ? { email: normalizedEmail, password }
        : { name: name.trim() || 'Learner', email: normalizedEmail, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Authentication failed.');
      }

      login(result.user, result.session?.access_token);

      setSuccessMsg(
        mode === 'login'
          ? (isMy ? 'အကောင့်ဝင်ရောက်ပြီးပါပြီ။' : 'Signed in successfully.')
          : (isMy ? 'အကောင့်ဖွင့်ပြီးပါပြီ။' : 'Account created successfully!')
      );

      setTimeout(() => openAuthModal(false), 900);
    } catch (error: any) {
      setErrorMsg(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === 'login'
      ? (isMy ? 'အကောင့်ဝင်ရန်' : 'Welcome Back')
      : mode === 'register'
        ? (isMy ? 'အကောင့်အသစ်ဖွင့်ရန်' : 'Create Your Account')
        : mode === 'forgot_password'
          ? (isMy ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot Password?')
          : (isMy ? 'စကားဝှက်အသစ်သတ်မှတ်ရန်' : 'Create New Password');

  const submitLabel =
    mode === 'login'
      ? (isMy ? 'ဝင်ရောက်မည်' : 'Sign In')
      : mode === 'register'
        ? (isMy ? 'အကောင့်ဖွင့်မည်' : 'Create Account')
        : mode === 'forgot_password'
          ? (isMy ? 'Reset Link ပို့မည်' : 'Send Reset Link')
          : (isMy ? 'စကားဝှက်ပြောင်းမည်' : 'Update Password');

  const inputClass =
    'w-full pl-11 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-sm text-[#14243A] placeholder:text-stone-400 outline-none focus:border-[#C7A66A] focus:ring-2 focus:ring-[#C7A66A]/20 transition';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101B2B]/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) openAuthModal(false);
      }}
    >
      <div className="relative bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">

        <button
          type="button"
          onClick={() => openAuthModal(false)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-[#14243A]"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-7">
          <div className="text-[11px] tracking-[0.25em] font-bold text-[#A9874B] mb-2">
            PYINNYAR HUB
          </div>
          <h2 className="text-2xl font-bold text-[#14243A]">{title}</h2>
          <p className="text-xs text-stone-500 mt-2">
            {mode === 'login'
              ? (isMy ? 'သင့်ရဲ့သင်ယူမှုခရီးစဉ်ကို ဆက်လက်လေ့လာပါ။' : 'Continue your learning journey with us.')
              : mode === 'register'
                ? (isMy ? 'သင်ယူမှုအသိုင်းအဝိုင်းထဲ ပါဝင်လိုက်ပါ။' : 'Join the PYINNYAR HUB learning community.')
                : mode === 'forgot_password'
                  ? (isMy ? 'အကောင့်ဖွင့်ထားတဲ့ email ကို ထည့်ပေးပါ။' : 'Enter your account email to receive a reset link.')
                  : (isMy ? 'အကောင့်အတွက် စကားဝှက်အသစ် ထည့်ပေးပါ။' : 'Choose a new password for your account.')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-start gap-2 border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-start gap-2 border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">
                {isMy ? 'နာမည်အပြည့်အစုံ' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isMy ? 'သင့်နာမည်' : 'Your full name'}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'reset_password' && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">
                {isMy ? 'အီးမေးလ်လိပ်စာ' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                  autoComplete="email"
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-stone-600">
                  {mode === 'reset_password'
                    ? (isMy ? 'စကားဝှက်အသစ်' : 'New Password')
                    : (isMy ? 'စကားဝှက်' : 'Password')}
                </label>

                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot_password')}
                    className="text-xs font-semibold text-[#A9874B] hover:underline"
                  >
                    {isMy ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot password?'}
                  </button>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={`${inputClass} pr-11`}
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'reset_password') && (
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-2">
                {isMy ? 'စကားဝှက် ထပ်မံထည့်ပါ' : 'Confirm Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={isMy ? 'စကားဝှက် ထပ်ထည့်ပါ' : 'Enter password again'}
                  className={`${inputClass} pr-11`}
                  minLength={6}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  aria-label="Toggle confirmation visibility"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#14243A] text-white font-bold text-sm hover:bg-[#1E3452] transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-[#14243A]/10"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitLabel}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
          {mode === 'login' ? (
            <>
              {isMy ? 'အကောင့်မရှိသေးဘူးလား?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => switchMode('register')}
                className="font-bold text-[#A9874B] hover:underline"
              >
                {isMy ? 'အကောင့်ဖွင့်ပါ' : 'Create an account'}
              </button>
            </>
          ) : mode === 'reset_password' || mode === 'forgot_password' ? (
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="font-bold text-[#14243A] hover:underline"
            >
              {isMy ? 'အကောင့်ဝင်ရန် ပြန်သွားပါ' : 'Back to Sign In'}
            </button>
          ) : (
            <>
              {isMy ? 'အကောင့်ရှိပြီးသားလား?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="font-bold text-[#A9874B] hover:underline"
              >
                {isMy ? 'အကောင့်ဝင်ပါ' : 'Sign In'}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-[10px] text-stone-400 mt-5">
          Learn Without Limits.
        </p>
      </div>
    </div>
  );
};
