import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { UserRole, Language } from '../types';
import {
  User as UserIcon,
  Mail,
  Shield,
  Settings,
  Languages,
  Clock,
  Bell,
  LogOut,
  Camera,
  CheckCircle2,
  Key,
  LogIn,
  UserPlus,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    updateUserProfile,
    logout,
    openAuthModal,
    setCurrentView,
  } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [weeklyGoal, setWeeklyGoal] = useState(user?.learningPreferences?.weeklyGoalHours || 6);
  const [notifications, setNotifications] = useState(user?.learningPreferences?.notificationsEnabled ?? true);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setBio(user.bio || '');
      setWeeklyGoal(user.learningPreferences.weeklyGoalHours);
      setNotifications(user.learningPreferences.notificationsEnabled);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-white rounded-3xl border border-stone-200/90 shadow-sm space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#14243A] text-[#C7A66A] flex items-center justify-center mx-auto text-2xl font-black shadow-sm">
          P
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-[#A9874B] uppercase">
            PYINNYAR HUB Authentication
          </span>
          <h2 className="text-xl font-bold text-[#14243A]">
            {language === 'my' ? 'ကျောင်းသား အကောင့်သို့ ဝင်ရောက်ပါ' : 'Sign In to Your Account'}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
            {language === 'my'
              ? 'သင်၏ သင်ခန်းစာမှတ်တမ်းများ၊ လက်မှတ်များနှင့် ပရိုဖိုင်ကို ကြည့်ရှုစီမံရန် သင်၏ အီးမေးလ်နှင့် စကားဝှက်ဖြင့် ဝင်ရောက်ပါ။'
              : 'Sign in to access your student profile, view certificates, resume course progress, and configure personal study preferences.'}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={() => openAuthModal(true, 'login')}
            className="w-full py-3 bg-[#14243A] text-white rounded-xl text-xs font-bold hover:bg-[#1E3452] transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4 text-[#C7A66A]" />
            <span>{language === 'my' ? 'အကောင့်ဝင်ရောက်မည်' : 'Sign In'}</span>
          </button>
          <button
            onClick={() => openAuthModal(true, 'register')}
            className="w-full py-3 border border-stone-300 text-stone-700 bg-stone-50/50 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-stone-500" />
            <span>{language === 'my' ? 'အကောင့်အသစ် ဖွင့်မည်' : 'Create New Account'}</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      bio,
      learningPreferences: {
        ...user.learningPreferences,
        weeklyGoalHours: weeklyGoal,
        notificationsEnabled: notifications,
      },
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      {/* Header Profile Summary */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#C7A66A]"
            />
            <button
              onClick={() => {
                const newUrl = prompt('Enter image URL for profile photo:', user.avatar);
                if (newUrl) updateUserProfile({ avatar: newUrl });
              }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#14243A] text-white flex items-center justify-center hover:bg-[#1E3452] shadow-xs"
              title="Change Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#14243A]">{user.name}</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#14243A] text-[#C7A66A]">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Auth / Role action */}
        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <button
              onClick={() => setCurrentView('admin')}
              className="px-3.5 py-2 rounded-xl bg-[#14243A] text-white text-xs font-semibold hover:bg-[#1E3452]"
            >
              Open Admin Portal
            </button>
          )}
          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl border border-stone-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Verified Institutional Role & Security Status Card */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#C7A66A]/40 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#A9874B]" />
            <h3 className="font-bold text-sm text-[#14243A]">Account Role & Security Verification</h3>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Backend Verified
          </span>
        </div>

        <div className="p-4 rounded-xl border border-stone-200/80 bg-white shadow-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  user.role === 'owner'
                    ? 'bg-[#C7A66A]/20 text-[#8B6E32] border border-[#C7A66A]/50'
                    : user.role === 'admin'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : user.role === 'instructor'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                }`}>
                  {user.role === 'owner' ? 'Founder & Super Admin' : `${user.role} Role`}
                </span>
                {user.role === 'owner' && (
                  <span className="text-[11px] font-semibold text-[#A9874B]">
                    Primary Institutional Authority
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 leading-relaxed mt-1.5">
                {user.role === 'owner' &&
                  'Sole Founder & Super Admin with permanent governance authority. Controls platform architecture, financial verifications, instructor authorizations, and role assignments.'}
                {user.role === 'admin' &&
                  'Institutional Administrator account authorized by the Founder. Manages courses, verifies payment slips, and moderates platform communities.'}
                {user.role === 'instructor' &&
                  'Course Instructor account authorized by Academic Standards. Creates curriculum, evaluates student assignments, and publishes courses.'}
                {user.role === 'student' &&
                  'Enrolled Student account with access to all 30 educational categories, interactive quizzes, certificates, and community learning.'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 leading-relaxed">
          Self-service role modification is disabled. Administrator and Instructor roles must be authorized on the backend by the Founder & Super Admin.
        </p>
      </div>

      {/* Profile & Learning Preferences Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-bold text-base text-[#14243A]">Student Profile & Preferences</h2>
          {isSavedNotice && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Saved successfully!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Account Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1">Personal Bio & Academic Interests</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full p-3 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">Interface Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
            >
              <option value="en">English (International)</option>
              <option value="my">မြန်မာဘာသာ (Myanmar)</option>
            </select>
          </div>

          {/* Weekly Target Hours */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Weekly Study Goal: {weeklyGoal} Hours
            </label>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number(e.target.value))}
              className="w-full accent-[#C7A66A] mt-2"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 rounded text-[#14243A] accent-[#14243A]"
          />
          <label htmlFor="notifications" className="text-xs text-stone-700">
            Receive announcements and opportunity alerts via email
          </label>
        </div>

        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => openAuthModal(true, 'forgot_password')}
            className="text-xs text-stone-600 hover:text-[#14243A] font-medium flex items-center gap-1"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-bold shadow-xs transition-transform active:scale-95"
          >
            Save Account Settings
          </button>
        </div>
      </form>
    </div>
  );
};
