import React from 'react';
import { useApp } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Sparkles, Shield, UserCircle, Search, Compass, BookOpen, Users, Briefcase } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    currentView,
    setCurrentView,
    openAiAssistant,
    switchRole,
    searchQuery,
    setSearchQuery,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-[#14243A] text-white border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[#C7A66A] flex items-center justify-center text-[#14243A] font-extrabold text-base shadow-sm">
            P
          </div>
          <div>
            <span className="block font-bold leading-none tracking-wider text-base">PYINNYAR HUB</span>
            <span className="text-[10px] text-[#C7A66A] font-normal tracking-wide">
              {language === 'my' ? 'အကန့်အသတ်မဲ့ လေ့လာစူးစမ်းပါ' : 'Learn Without Limits'}
            </span>
          </div>
        </button>

        {/* Zone 2: 4-5 clean single-line nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-white/80 whitespace-nowrap">
          <button
            onClick={() => setCurrentView('home')}
            className={`transition-colors hover:text-white ${
              currentView === 'home' ? 'text-[#C7A66A] font-semibold' : ''
            }`}
          >
            {t('nav.home', language)}
          </button>
          <button
            onClick={() => setCurrentView('explore')}
            className={`transition-colors hover:text-white ${
              currentView === 'explore' ? 'text-[#C7A66A] font-semibold' : ''
            }`}
          >
            {t('nav.explore', language)}
          </button>
          <button
            onClick={() => setCurrentView('mylearning')}
            className={`transition-colors hover:text-white ${
              currentView === 'mylearning' ? 'text-[#C7A66A] font-semibold' : ''
            }`}
          >
            {t('nav.mylearning', language)}
          </button>
          <button
            onClick={() => setCurrentView('opportunities')}
            className={`transition-colors hover:text-white ${
              currentView === 'opportunities' ? 'text-[#C7A66A] font-semibold' : ''
            }`}
          >
            {t('nav.opportunities', language)}
          </button>
          <button
            onClick={() => setCurrentView('community')}
            className={`transition-colors hover:text-white ${
              currentView === 'community' ? 'text-[#C7A66A] font-semibold' : ''
            }`}
          >
            {t('nav.community', language)}
          </button>
        </nav>

        {/* Zone 3: Actions (Language toggle, AI Assistant, Role switcher, User Avatar) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}
            className="h-9 px-2.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/90 flex items-center gap-1.5 transition-colors"
            title="Toggle English / Myanmar language"
          >
            <span>{language === 'en' ? 'မြန်မာ' : 'ENG'}</span>
          </button>

          {/* AI Learning Assistant trigger button */}
          <button
            onClick={() => openAiAssistant(true)}
            className="h-9 px-3 rounded-lg bg-[#C7A66A] text-[#14243A] hover:bg-[#D8B77B] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#14243A]" />
            <span className="hidden sm:inline">Pyinnyar AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Quick Role Switcher for verification */}
          <div className="relative group">
            <button
              onClick={() => {
                if (user.role === 'student') switchRole('admin');
                else if (user.role === 'admin') switchRole('instructor');
                else switchRole('student');
              }}
              className="h-9 px-2.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-xs text-white/80 flex items-center gap-1.5 transition-colors"
              title="Click to cycle role: Student -> Admin -> Instructor"
            >
              <Shield className="w-3.5 h-3.5 text-[#C7A66A]" />
              <span className="capitalize font-medium text-[11px] hidden sm:inline">{user.role}</span>
            </button>
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={() => setCurrentView('profile')}
            className="w-9 h-9 rounded-full ring-2 ring-[#C7A66A]/60 overflow-hidden hover:opacity-90 transition-opacity shrink-0 flex items-center justify-center bg-[#1E3452]"
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle className="w-6 h-6 text-white/70" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
