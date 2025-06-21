
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Upload, Play, Trophy, Flame, Star } from "lucide-react";
import SetupStage from "@/components/flashcards/SetupStage";
import OrganizeStage from "@/components/flashcards/OrganizeStage";
import PracticeStage from "@/components/flashcards/PracticeStage";
import ReviewTimerStage from "@/components/flashcards/ReviewTimerStage";
import { useFlashcardStore } from "@/store/flashcardStore";

const Index = () => {
  const { 
    stage, 
    points, 
    streak, 
    level, 
    cards,
    nextReviewTime,
    setStage 
  } = useFlashcardStore();

  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    // Check if user has active cards and should skip to appropriate stage
    if (cards.length > 0 && nextReviewTime && Date.now() < nextReviewTime) {
      setStage(4); // Go to timer stage
    }
  }, []);

  const handleGetStarted = () => {
    setShowWelcome(false);
    setStage(1);
  };

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E27] via-[#1C2541] to-[#0A0E27]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="inline-block mb-8"
            >
              <Brain size={80} className="text-[#2563EB] mx-auto" />
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-[#93A5CF] to-[#2563EB] bg-clip-text text-transparent">
              FlashMaster
            </h1>
            
            <p className="text-xl md:text-2xl text-[#93A5CF] mb-12 leading-relaxed">
              Transform any content into interactive flashcards.<br />
              Learn smarter with AI-powered spaced repetition.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-3xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#1C2541] p-6 rounded-2xl border border-[#2563EB]/20"
              >
                <Upload className="text-[#2563EB] mb-4 mx-auto" size={40} />
                <h3 className="text-lg font-semibold mb-2">Smart Import</h3>
                <p className="text-[#93A5CF] text-sm">Upload PDFs, images, or video links</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#1C2541] p-6 rounded-2xl border border-[#2563EB]/20"
              >
                <Play className="text-[#2563EB] mb-4 mx-auto" size={40} />
                <h3 className="text-lg font-semibold mb-2">Tinder-Style Learning</h3>
                <p className="text-[#93A5CF] text-sm">Swipe to learn with gamified practice</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-[#1C2541] p-6 rounded-2xl border border-[#2563EB]/20"
              >
                <Trophy className="text-[#2563EB] mb-4 mx-auto" size={40} />
                <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
                <p className="text-[#93A5CF] text-sm">Streaks, levels, and spaced repetition</p>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#1E40AF] text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 shadow-lg shadow-[#2563EB]/25"
            >
              Start Learning Now 🚀
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* Header with stats */}
      <div className="bg-[#1C2541] border-b border-[#2563EB]/20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Brain className="text-[#2563EB]" size={32} />
              <h1 className="text-2xl font-bold">FlashMaster</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="text-yellow-500" size={20} />
                <span className="font-semibold">{points} XP</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500" size={20} />
                <span className="font-semibold">{streak} day streak</span>
              </div>
              <div className="bg-[#2563EB] px-3 py-1 rounded-full text-sm font-semibold">
                Level {level}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {stage === 1 && <SetupStage />}
          {stage === 2 && <OrganizeStage />}
          {stage === 3 && <PracticeStage />}
          {stage === 4 && <ReviewTimerStage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
