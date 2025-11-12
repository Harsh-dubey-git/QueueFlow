import React, { useState, useCallback, createContext } from "react";
import { View } from "./types";
import { useQueueState, QueueState } from "./hooks/useQueueState";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import RoomPage from "./components/RoomPage";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

// Create a context to share queue state and actions throughout the app.
// This avoids prop drilling and acts as our central state management.
export const QueueContext = createContext<QueueState | null>(null);

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.Landing);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const queueState = useQueueState();
  const { state, actions } = queueState;

  const handleLoginSuccess = useCallback(() => {
    actions.setIsAuthenticated(true);
    setView(View.Admin);
  }, [actions]);

  const handleLogout = useCallback(() => {
    actions.setIsAuthenticated(false);
    setView(View.Landing);
  }, [actions]);

  const navigateToRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
    setView(View.Room);
  }, []);

  const navigateToAdmin = useCallback(() => {
    setActiveRoomId(null);
    setView(View.Admin);
  }, []);

  const navigateToLogin = useCallback(() => {
    setView(View.Login);
  }, []);

  const renderView = () => {
    if (!state.isAuthenticated) {
      switch (view) {
        case View.Login:
          return <LoginPage onLoginSuccess={handleLoginSuccess} />;
        default:
          return <LandingPage />;
      }
    }

    // Authenticated views
    switch (view) {
      case View.Admin:
        return <AdminDashboard onNavigateToRoom={navigateToRoom} />;
      case View.Room:
        if (activeRoomId) {
          return <RoomPage roomId={activeRoomId} onBack={navigateToAdmin} />;
        }
        // Fallback to admin if no room is selected
        setView(View.Admin);
        return <AdminDashboard onNavigateToRoom={navigateToRoom} />;
      case View.Landing: // Allow landing page when authenticated
        return <LandingPage />;
      default:
        // If authenticated but on a "public" page like login, redirect to admin
        setView(View.Admin);
        return <AdminDashboard onNavigateToRoom={navigateToRoom} />;
    }
  };

  return (
    <QueueContext.Provider value={queueState}>
      <div className="min-h-screen font-sans text-slate-800 flex flex-col">
        <Header
          isAuthenticated={state.isAuthenticated}
          onLogout={handleLogout}
          onHomeClick={() => setView(View.Landing)}
          onLoginClick={navigateToLogin}
          currentView={view}
          onDashboardClick={navigateToAdmin}
        />
        <main className="flex-1">{renderView()}</main>
        {view === View.Landing && <Footer />}
      </div>
    </QueueContext.Provider>
  );
};

export default App;
