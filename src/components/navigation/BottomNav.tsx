import React from 'react';
import { useApp, ViewType } from '../../context/AppContext';
import { t } from '../../utils/translations';
import { Home, Compass, BookOpen, Users, User, ShieldCheck } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, language, user } = useApp();

  const navItems: { view: ViewType; icon: React.ElementType; labelKey: string }[] = [
    { view: 'home', icon: Home, labelKey: 'nav.home' },
    { view: 'explore', icon: Compass, labelKey: 'nav.explore' },
    { view: 'mylearning', icon: BookOpen, labelKey: 'nav.mylearning' },
    { view: 'community', icon: Users, labelKey: 'nav.community' },
    { view: user.role === 'admin' ? 'admin' : 'profile', icon: user.role === 'admin' ? ShieldCheck : User, labelKey: user.role === 'admin' ? 'nav.admin' : 'nav.profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#14243A]/95 backdrop-blur-md border-t border-white/10 shadow-lg">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.view ||
            (item.view === 'explore' && currentView === 'course_details') ||
            (item.view === 'mylearning' && (currentView === 'learning_room' || currentView === 'certificate_view'));

          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className="min-h-[44px] min-w-[44px] flex flex-col items-center justify-center relative transition-transform active:scale-95"
            >
              <div
                className={`p-1 rounded-xl transition-colors ${
                  isActive ? 'text-[#C7A66A]' : 'text-white/60 hover:text-white/90'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span
                className={`text-[10px] font-medium leading-tight tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'text-[#C7A66A] font-semibold' : 'text-white/60'
                }`}
              >
                {t(item.labelKey, language)}
              </span>
              {isActive && (
                <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-[#C7A66A]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
