import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { UserRole, Language } from '../types';
import {
  User,
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
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    switchRole,
    updateUserProfile,
    logout,
    openAuthModal,
    setCurrentView,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || '');
  const [weeklyGoal, setWeeklyGoal] = useState(user.learningPreferences.weeklyGoalHours);
  const [notifications, setNotifications] = useState(user.learningPreferences.notificationsEnabled);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

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

      {/* Role-Based Permissions Switcher Simulator */}
      <div className="bg-[#FAF8F5] rounded-2xl border border-[#C7A66A]/40 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#A9874B]" />
          <h3 className="font-bold text-sm text-[#14243A]">User Roles & Access Permissions</h3>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Switch active user session to test role-based capabilities across PYINNYAR HUB:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {[
            {
              role: 'student' as UserRole,
              title: 'Student Role',
              desc: 'Enrolls in courses, takes quizzes, earns certificates, joins study groups.',
            },
            {
              role: 'instructor' as UserRole,
              title: 'Instructor Role',
              desc: 'Creates & manages courses, reviews assignments, publishes curriculum.',
            },
            {
              role: 'admin' as UserRole,
              title: 'Administrator',
              desc: 'Full platform control: verifies payments, manages users, moderates discussions.',
            },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => switchRole(item.role)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                user.role === item.role
                  ? 'border-[#14243A] bg-white shadow-xs ring-1 ring-[#14243A]'
                  : 'border-stone-200/90 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-[#14243A]">{item.title}</span>
                {user.role === item.role && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </div>
              <p className="text-[11px] text-stone-500 leading-snug">{item.desc}</p>
            </button>
          ))}
        </div>
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
