
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject?: string;
  week?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: number;
  nextReview?: number;
  correctCount: number;
  incorrectCount: number;
  isStarred: boolean;
}

interface FlashcardStore {
  stage: number;
  cards: Flashcard[];
  currentCardIndex: number;
  points: number;
  streak: number;
  level: number;
  lastStudyDate: string;
  nextReviewTime: number | null;
  studySession: {
    correct: number;
    incorrect: number;
    total: number;
  };
  
  // Actions
  setStage: (stage: number) => void;
  addCard: (card: Omit<Flashcard, 'id' | 'correctCount' | 'incorrectCount' | 'isStarred'>) => void;
  updateCard: (id: string, updates: Partial<Flashcard>) => void;
  deleteCard: (id: string) => void;
  markCardCorrect: (id: string) => void;
  markCardIncorrect: (id: string) => void;
  toggleStar: (id: string) => void;
  nextCard: () => void;
  resetSession: () => void;
  updateStreak: () => void;
  addPoints: (points: number) => void;
  setNextReviewTime: (time: number) => void;
  generateCardsFromContent: (content: any) => void;
}

export const useFlashcardStore = create<FlashcardStore>()(
  persist(
    (set, get) => ({
      stage: 1,
      cards: [],
      currentCardIndex: 0,
      points: 0,
      streak: 0,
      level: 1,
      lastStudyDate: '',
      nextReviewTime: null,
      studySession: {
        correct: 0,
        incorrect: 0,
        total: 0,
      },

      setStage: (stage) => set({ stage }),

      addCard: (cardData) => {
        const newCard: Flashcard = {
          ...cardData,
          id: crypto.randomUUID(),
          correctCount: 0,
          incorrectCount: 0,
          isStarred: false,
        };
        set((state) => ({ cards: [...state.cards, newCard] }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          ),
        }));
      },

      deleteCard: (id) => {
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        }));
      },

      markCardCorrect: (id) => {
        const state = get();
        const now = Date.now();
        const nextReview = now + (5 * 24 * 60 * 60 * 1000); // 5 days later
        
        state.updateCard(id, {
          correctCount: state.cards.find(c => c.id === id)!.correctCount + 1,
          lastReviewed: now,
          nextReview,
        });
        state.addPoints(30);
        set((state) => ({
          studySession: {
            ...state.studySession,
            correct: state.studySession.correct + 1,
            total: state.studySession.total + 1,
          },
        }));
      },

      markCardIncorrect: (id) => {
        const state = get();
        const now = Date.now();
        const nextReview = now + (24 * 60 * 60 * 1000); // 1 day later
        
        state.updateCard(id, {
          incorrectCount: state.cards.find(c => c.id === id)!.incorrectCount + 1,
          lastReviewed: now,
          nextReview,
        });
        state.addPoints(-10);
        set((state) => ({
          studySession: {
            ...state.studySession,
            incorrect: state.studySession.incorrect + 1,
            total: state.studySession.total + 1,
          },
        }));
      },

      toggleStar: (id) => {
        const state = get();
        const card = state.cards.find(c => c.id === id);
        if (card) {
          state.updateCard(id, { isStarred: !card.isStarred });
        }
      },

      nextCard: () => {
        set((state) => ({
          currentCardIndex: (state.currentCardIndex + 1) % state.cards.length,
        }));
      },

      resetSession: () => {
        set({
          currentCardIndex: 0,
          studySession: {
            correct: 0,
            incorrect: 0,
            total: 0,
          },
        });
      },

      updateStreak: () => {
        const today = new Date().toDateString();
        const state = get();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (state.lastStudyDate === yesterday) {
          set((state) => ({ 
            streak: state.streak + 1,
            lastStudyDate: today 
          }));
        } else if (state.lastStudyDate !== today) {
          set({ streak: 1, lastStudyDate: today });
        }
      },

      addPoints: (pointsToAdd) => {
        set((state) => {
          const newPoints = Math.max(0, state.points + pointsToAdd);
          const newLevel = Math.floor(newPoints / 500) + 1;
          return { 
            points: newPoints,
            level: newLevel
          };
        });
      },

      setNextReviewTime: (time) => {
        set({ nextReviewTime: time });
      },

      generateCardsFromContent: (content) => {
        // Simulate AI generation
        const sampleCards = [
          {
            question: "What is the main concept discussed?",
            answer: "The main concept relates to the uploaded content analysis.",
            subject: "General",
            difficulty: 'medium' as const,
          },
          {
            question: "What are the key points to remember?",
            answer: "Key points include the primary themes and supporting details.",
            subject: "General",
            difficulty: 'medium' as const,
          },
          {
            question: "How does this relate to broader topics?",
            answer: "This connects to wider subject areas through shared principles.",
            subject: "General",
            difficulty: 'hard' as const,
          },
        ];

        sampleCards.forEach(card => get().addCard(card));
      },
    }),
    {
      name: 'flashcard-storage',
    }
  )
);
