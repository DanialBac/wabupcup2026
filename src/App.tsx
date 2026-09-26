/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Suspense, lazy } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { usePdfPreloader } from './hooks/usePdfPreloader';
import { ErrorBoundary } from './components/common/ErrorBoundary';
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
  
  // Preload critical tournament regulation PDFs as Blobs in persistent cache during idle time
  usePdfPreloader();

  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regCategory, setRegCategory] = useState<TournamentCategory>('SMA');
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminInstanceKey, setAdminInstanceKey] = useState<number>(0);

  const handleOpenAdmin = () => {
    setAdminInstanceKey(prev => prev + 1);
    setIsAdminOpen(true);
  };

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
        onOpenAdmin={handleOpenAdmin}
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
        onOpenAdmin={handleOpenAdmin}
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
          <ErrorBoundary
            key={adminInstanceKey}
            name="AdminDashboard"
            fallbackRender={(err, reset) => (
              <div className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
                  <h3 className="text-base font-bold text-white">Sesi Panel Admin Terhambat</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{err.message || 'Terjadi kesalahan tidak terduga pada salah satu komponen admin.'}</p>
                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setAdminInstanceKey(k => k + 1);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Muat Ulang Panel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        reset();
                        setIsAdminOpen(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      Kembali ke Beranda
                    </button>
                  </div>
                </div>
              </div>
            )}
          >
            <AdminDashboard
              key={adminInstanceKey}
              onClose={() => setIsAdminOpen(false)}
            />
          </ErrorBoundary>
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
