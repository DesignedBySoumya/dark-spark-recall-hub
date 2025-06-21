
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Calendar, Shuffle, Star, Edit, Trash2 } from "lucide-react";
import { useFlashcardStore, Flashcard } from "@/store/flashcardStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const OrganizeStage = () => {
  const { cards, setStage, toggleStar, deleteCard } = useFlashcardStore();
  const [viewMode, setViewMode] = useState<'subject' | 'week' | 'all'>('all');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const groupedCards = (): Record<string, Flashcard[]> => {
    if (viewMode === 'subject') {
      return cards.reduce((acc, card) => {
        const subject = card.subject || 'Uncategorized';
        if (!acc[subject]) acc[subject] = [];
        acc[subject].push(card);
        return acc;
      }, {} as Record<string, Flashcard[]>);
    } else if (viewMode === 'week') {
      return cards.reduce((acc, card) => {
        const week = card.week || 'No Week';
        if (!acc[week]) acc[week] = [];
        acc[week].push(card);
        return acc;
      }, {} as Record<string, Flashcard[]>);
    }
    return { 'All Cards': cards };
  };

  const handleStartPractice = () => {
    if (cards.length === 0) return;
    setStage(3);
  };

  const handleCardSelect = (cardId: string) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const grouped = groupedCards();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold mb-4">Organize Your Cards</h2>
        <p className="text-[#93A5CF] text-lg mb-8">
          Review and organize your flashcards before practice
        </p>

        {/* View Mode Selector */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            onClick={() => setViewMode('all')}
            className={viewMode === 'all' ? 'bg-[#2563EB]' : 'border-[#2563EB]/30'}
          >
            <BookOpen className="mr-2" size={16} />
            All Cards
          </Button>
          <Button
            variant={viewMode === 'subject' ? 'default' : 'outline'}
            onClick={() => setViewMode('subject')}
            className={viewMode === 'subject' ? 'bg-[#2563EB]' : 'border-[#2563EB]/30'}
          >
            <BookOpen className="mr-2" size={16} />
            By Subject
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'outline'}
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'bg-[#2563EB]' : 'border-[#2563EB]/30'}
          >
            <Calendar className="mr-2" size={16} />
            By Week
          </Button>
        </div>
      </motion.div>

      {/* Cards Display */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([groupName, groupCards], groupIndex) => (
          <motion.div
            key={groupName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                {viewMode === 'subject' && <BookOpen size={24} />}
                {viewMode === 'week' && <Calendar size={24} />}
                {viewMode === 'all' && <Shuffle size={24} />}
                {groupName}
                <Badge variant="secondary" className="bg-[#1C2541] text-[#93A5CF]">
                  {groupCards.length}
                </Badge>
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupCards.map((card, cardIndex) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (groupIndex * 0.1) + (cardIndex * 0.05) }}
                  className="bg-[#1C2541] rounded-xl p-6 border border-[#2563EB]/20 hover:border-[#2563EB]/40 transition-all cursor-pointer group"
                  onClick={() => handleCardSelect(card.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs mb-2 ${
                          card.difficulty === 'easy' ? 'border-green-500 text-green-400' :
                          card.difficulty === 'hard' ? 'border-red-500 text-red-400' :
                          'border-yellow-500 text-yellow-400'
                        }`}
                      >
                        {card.difficulty}
                      </Badge>
                      {card.subject && (
                        <Badge variant="secondary" className="text-xs ml-2 bg-[#0A0E27] text-[#93A5CF]">
                          {card.subject}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStar(card.id);
                        }}
                        className={`p-1 ${card.isStarred ? 'text-yellow-500' : 'text-gray-400'}`}
                      >
                        <Star size={16} fill={card.isStarred ? 'currentColor' : 'none'} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCard(card.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-[#93A5CF] mb-1">Question:</p>
                      <p className="font-medium line-clamp-2">{card.question}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-[#93A5CF] mb-1">Answer:</p>
                      <p className="text-sm text-[#B8C5D6] line-clamp-2">{card.answer}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-[#93A5CF]">
                    <span>Correct: {card.correctCount}</span>
                    <span>Incorrect: {card.incorrectCount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {cards.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BookOpen size={64} className="mx-auto text-[#93A5CF] mb-4" />
          <h3 className="text-xl font-semibold mb-2">No cards yet</h3>
          <p className="text-[#93A5CF] mb-6">Go back to create some flashcards first</p>
          <Button onClick={() => setStage(1)} variant="outline">
            Create Cards
          </Button>
        </motion.div>
      )}

      {cards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-12"
        >
          <Button
            onClick={() => setStage(1)}
            variant="outline"
            className="border-[#2563EB]/30"
          >
            ← Add More Cards
          </Button>
          <Button
            onClick={handleStartPractice}
            size="lg"
            className="bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#1E40AF] px-8"
          >
            Start Practice Session →
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default OrganizeStage;
