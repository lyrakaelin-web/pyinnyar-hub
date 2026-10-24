import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';
import { AiAssistantDrawer } from './components/ai/AiAssistantDrawer';
import { PaymentModal } from './components/modals/PaymentModal';
import { AuthModal } from './components/modals/AuthModal';

import { HomeView } from './views/HomeView';
import { ExploreView } from './views/ExploreView';
import { CourseDetailsView } from './views/CourseDetailsView';
import { LearningRoomView } from './views/LearningRoomView';
import { MyLearningView } from './views/MyLearningView';
import { CommunityView } from './views/CommunityView';
import { OpportunitiesView } from './views/OpportunitiesView';
import { ProfileView } from './views/ProfileView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { CertificateView } from './views/CertificateView';

const MainLayout: React.FC = () => {
  const { currentView, setCurrentView, language } = useApp();

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#14243A] flex flex-col font-sans selection:bg-[#C7A66A]/30">
      {/* Top Header compliant with Top Bar Contract */}
      <Header />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentView === 'home' && <HomeView />}
        {currentView === 'explore' && <ExploreView />}
        {currentView === 'course_details' && <CourseDetailsView />}
        {currentView === 'learning_room' && <LearningRoomView />}
        {currentView === 'mylearning' && <MyLearningView />}
        {currentView === 'community' && <CommunityView />}
        {currentView === 'opportunities' && <OpportunitiesView />}
        {currentView === 'profile' && <ProfileView />}
        {currentView === 'admin' && <AdminDashboardView />}
        {currentView === 'certificate_view' && <CertificateView />}
      </main>

      {/* Clean Brand Footer (desktop & mobile) */}
      <footer className="mt-auto border-t border-stone-200/90 bg-white py-8 px-4 sm:px-6 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wider text-[#14243A]">PYINNYAR HUB</span>
            <span aria-hidden="true">·</span>
            <span>{language === 'my' ? 'အကန့်အသတ်မဲ့ လေ့လာစူးစမ်းပါ' : 'Learn Without Limits'}</span>
          </div>

          <div className="flex items-center gap-6 text-stone-600">
            <button onClick={() => setCurrentView('explore')} className="hover:text-[#14243A]">30 Categories</button>
            <button onClick={() => setCurrentView('opportunities')} className="hover:text-[#14243A]">Scholarships</button>
            <button onClick={() => setCurrentView('certificate_view')} className="hover:text-[#14243A]">Verify Certificate</button>
            <button onClick={() => setCurrentView('community')} className="hover:text-[#14243A]">Community Guidelines</button>
          </div>

          <div className="text-[11px] text-stone-400">
            © 2026 PYINNYAR HUB. Dedicated to Myanmar learners worldwide.
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav />

      {/* Modals & Overlays */}
      <AiAssistantDrawer />
      <PaymentModal />
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
