/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, lazy } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LiveScoreSection } from './components/LiveScoreSection';
import { CategoryPrizeSection } from './components/CategoryPrizeSection';
import { ScheduleBracketSection } from './components/ScheduleBracketSection';
import { VenueLocationSection } from './components/VenueLocationSection';
import { SponsorSection } from './components/SponsorSection';
import { Footer } from './components/Footer';
import { TournamentCategory } from './types';

// Lazy-load modal and admin components to reduce initial JavaScript payload by >500 KiB
const RegistrationForm = lazy(() =>
  import('./components/RegistrationForm').then((module) => ({ default: module.RegistrationForm }))
);
const CheckStatusModal = lazy(() =>
  import('./components/CheckStatusModal').then((module) => ({ default: module.CheckStatusModal }))
);
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((module) => ({ default: module.AdminDashboard }))
);

const MainLayout: React.FC = () => {
  const { config, isInitialLoading } = useTournament();
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regCategory, setRegCategory] = useState<TournamentCategory>('SMA');
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleOpenRegistration = (category?: TournamentCategory) => {
    if (category) {
      setRegCategory(category);
    }
    setIsRegModalOpen(true);
  };

  const visibility = config.sectionsVisibility || {
    hero: true,
    liveScore: true,
    categories: true,
    bracket: true,
    venue: true,
    sponsors: true,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors duration-200">
      {/* INITIAL SERVER SYNC PROGRESS BAR */}
      {isInitialLoading && (
        <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
          <div className="h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse w-full shadow-sm shadow-red-500/30" />
        </div>
      )}

      {/* NAVBAR */}
      <Navbar
        onOpenRegister={() => handleOpenRegistration()}
        onOpenRegistration={() => handleOpenRegistration()}
        onOpenCheckStatus={() => setIsCheckStatusOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* HERO SECTION */}
      {visibility.hero !== false && (
        <Hero
          onOpenRegister={() => handleOpenRegistration()}
          onOpenRegistration={() => handleOpenRegistration()}
          onOpenCheckStatus={() => setIsCheckStatusOpen(true)}
        />
      )}

      {/* LIVE SCORE & TICKER SECTION */}
      {visibility.liveScore !== false && <LiveScoreSection />}

      {/* TOURNAMENT CATEGORIES & PRIZES */}
      {visibility.categories !== false && (
        <CategoryPrizeSection
          onSelectCategoryToRegister={(cat) => handleOpenRegistration(cat)}
        />
      )}

      {/* TOURNAMENT BRACKET & FULL SCHEDULE & TEAMS DIRECTORY */}
      {visibility.bracket !== false && (
        <ScheduleBracketSection
          onOpenRegister={(cat) => handleOpenRegistration(cat)}
        />
      )}

      {/* VENUE LOCATION & GOOGLE MAPS */}
      {visibility.venue !== false && <VenueLocationSection />}

      {/* SPONSORSHIP & OFFICIAL PARTNERS */}
      {visibility.sponsors !== false && <SponsorSection />}

      {/* FOOTER */}
      <Footer
        onOpenCheckStatus={() => setIsCheckStatusOpen(true)}
        onOpenRegistration={() => handleOpenRegistration()}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* LAZY LOADED MODALS (Loaded on-demand to keep initial bundle tiny) */}
      <Suspense fallback={null}>
        {isRegModalOpen && (
          <RegistrationForm
            isOpen={isRegModalOpen}
            onClose={() => setIsRegModalOpen(false)}
            preselectedCategory={regCategory}
          />
        )}

        {isCheckStatusOpen && (
          <CheckStatusModal
            isOpen={isCheckStatusOpen}
            onClose={() => setIsCheckStatusOpen(false)}
          />
        )}

        {isAdminOpen && (
          <AdminDashboard onClose={() => setIsAdminOpen(false)} />
        )}
      </Suspense>
    </div>
  );
};

export default function App() {
  return (
    <TournamentProvider>
      <MainLayout />
    </TournamentProvider>
  );
}
