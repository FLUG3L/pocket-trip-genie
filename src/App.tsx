
import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { BottomNav } from '@/components/navigation/BottomNav';
import { CommunityTab } from '@/components/tabs/CommunityTab';
import { DiscoverTab } from '@/components/tabs/DiscoverTab';
import { PlanTab } from '@/components/tabs/PlanTab';
import { BookingsTab } from '@/components/tabs/BookingsTab';
import { ProfileTab } from '@/components/tabs/ProfileTab';
import { supabase } from '@/integrations/supabase/client';

const queryClient = new QueryClient();

function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {isSignUp ? (
        <SignUpForm 
          onSwitchToLogin={() => setIsSignUp(false)}
          onSuccess={() => setShowOnboarding(true)}
        />
      ) : (
        <LoginForm onSwitchToSignUp={() => setIsSignUp(true)} />
      )}
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading } = useAuth();
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (data && !data.preferences?.onboardingCompleted) {
          setNeedsOnboarding(true);
        }
      }
    };

    checkOnboarding();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✈️</div>
          <h1 className="text-2xl font-bold text-blue-600 mb-2">PocketTrip</h1>
          <p className="text-gray-600">Loading your travel adventures...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <OnboardingFlow onComplete={() => setNeedsOnboarding(false)} />
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home': return <CommunityTab />;
      case 'recommend': return <DiscoverTab />;
      case 'plan': return <PlanTab />;
      case 'bookings': return <BookingsTab />;
      case 'profile': return <ProfileTab />;
      default: return <CommunityTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderActiveTab()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/*" element={<MainApp />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
