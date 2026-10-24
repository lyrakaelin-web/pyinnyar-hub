import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { X, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    openAuthModal,
    authMode,
    language,
    updateUserProfile,
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(authMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      updateUserProfile({ email: email || 'student@pyinnyarhub.edu.mm' });
      setSuccessMsg('Signed in successfully.');
      setTimeout(() => openAuthModal(false), 1200);
    } else if (mode === 'register') {
      updateUserProfile({
        name: name || 'New Learner',
        email: email || 'learner@pyinnyarhub.edu.mm',
      });
      setSuccessMsg('Account registered successfully! Welcome to PYINNYAR HUB.');
      setTimeout(() => openAuthModal(false), 1400);
    } else {
      setSuccessMsg('Password reset instructions sent to your email.');
      setTimeout(() => setMode('login'), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#A9874B] uppercase">
              Account Authentication
            </span>
            <h2 className="text-base font-bold text-[#14243A]">
              {mode === 'login'
                ? 'Sign In to PYINNYAR HUB'
                : mode === 'register'
                ? 'Create Student Account'
                : 'Reset Account Password'}
            </h2>
          </div>
          <button
            onClick={() => openAuthModal(false)}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {successMsg ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <div>
                <label className="block font-medium text-stone-700 mb-1">Your Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Min Thant"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium text-stone-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-medium text-stone-700">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot_password')}
                      className="text-[11px] text-[#A9874B] hover:underline"
                    >
                      Forgot password?
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] font-bold text-xs shadow-xs transition-transform active:scale-95 mt-2"
            >
              {mode === 'login' ? 'Sign In' : mode === 'register' ? 'Register Account' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="pt-2 border-t border-stone-100 text-center text-xs text-stone-500">
          {mode === 'login' ? (
            <p>
              New learner?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-[#14243A] hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-[#14243A] hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
