
import { useEffect } from "react";
import { useFlashcardStore } from "@/store/flashcardStore";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
import { Button } from "@/components/ui/button";
import { LogIn, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

// Import existing components
import SetupStage from "@/components/flashcards/SetupStage";
import OrganizeStage from "@/components/flashcards/OrganizeStage";
import PracticeStage from "@/components/flashcards/PracticeStage";
import ReviewTimerStage from "@/components/flashcards/ReviewTimerStage";

const Index = () => {
  const { stage } = useFlashcardStore();
  const { user, signOut } = useAuth();
  
  // Initialize Supabase sync
  useSupabaseSync();

  const renderStage = () => {
    switch (stage) {
      case 1:
        return <SetupStage />;
      case 2:
        return <OrganizeStage />;
      case 3:
        return <PracticeStage />;
      case 4:
        return <ReviewTimerStage />;
      default:
        return <SetupStage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27]">
      {/* Header */}
      <div className="bg-[#1C2541] border-b border-[#2563EB]/20 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Flashcard Hub</h1>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-[#93A5CF] text-sm">Welcome, {user.email}</span>
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="border-[#2563EB]/30">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button onClick={signOut} variant="outline" size="sm" className="border-red-500/30 text-red-400">
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-[#93A5CF] text-sm">
                <LogIn className="w-4 h-4" />
                <span>Sign in to save your progress and access dashboard</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {renderStage()}
    </div>
  );
};

export default Index;
