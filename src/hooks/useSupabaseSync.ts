
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useFlashcardStore } from '@/store/flashcardStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseSync = () => {
  const { user } = useAuth();
  const { cards, addCard, updateCard, deleteCard } = useFlashcardStore();

  // Sync local cards to Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    const syncLocalCardsToSupabase = async () => {
      try {
        // Get existing cards from Supabase
        const { data: existingCards } = await supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', user.id);

        // If no cards in Supabase but we have local cards, sync them
        if ((!existingCards || existingCards.length === 0) && cards.length > 0) {
          console.log('Syncing local cards to Supabase...');
          
          for (const card of cards) {
            await supabase.from('flashcards').insert({
              user_id: user.id,
              question: card.question,
              answer: card.answer,
              subject: card.subject,
              week: card.week,
              difficulty: card.difficulty,
              correct_count: card.correctCount,
              incorrect_count: card.incorrectCount,
              is_starred: card.isStarred,
              last_reviewed: card.lastReviewed ? new Date(card.lastReviewed).toISOString() : null,
              next_review: card.nextReview ? new Date(card.nextReview).toISOString() : null,
            });
          }
          
          toast.success('Local cards synced to your account!');
        }
      } catch (error) {
        console.error('Error syncing cards:', error);
        toast.error('Failed to sync cards');
      }
    };

    syncLocalCardsToSupabase();
  }, [user, cards]);

  // Load cards from Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    const loadCardsFromSupabase = async () => {
      try {
        const { data: supabaseCards, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (supabaseCards && supabaseCards.length > 0) {
          // Clear local store and load from Supabase
          const store = useFlashcardStore.getState();
          store.cards = [];
          
          supabaseCards.forEach(card => {
            addCard({
              question: card.question,
              answer: card.answer,
              subject: card.subject || undefined,
              week: card.week || undefined,
              difficulty: card.difficulty as 'easy' | 'medium' | 'hard' | undefined,
              lastReviewed: card.last_reviewed ? new Date(card.last_reviewed).getTime() : undefined,
              nextReview: card.next_review ? new Date(card.next_review).getTime() : undefined,
            });
          });
        }
      } catch (error) {
        console.error('Error loading cards:', error);
        toast.error('Failed to load your cards');
      }
    };

    loadCardsFromSupabase();
  }, [user]);

  // Save study session to Supabase
  const saveStudySession = async (session: {
    totalCards: number;
    correctAnswers: number;
    incorrectAnswers: number;
    durationMinutes: number;
  }) => {
    if (!user) return;

    try {
      const accuracy = session.totalCards > 0 
        ? (session.correctAnswers / session.totalCards) * 100 
        : 0;

      await supabase.from('study_sessions').insert({
        user_id: user.id,
        total_cards: session.totalCards,
        correct_answers: session.correctAnswers,
        incorrect_answers: session.incorrectAnswers,
        accuracy_percentage: accuracy,
        duration_minutes: session.durationMinutes,
      });

      // Update user stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (currentStats) {
        await supabase
          .from('user_stats')
          .update({
            total_study_time_minutes: (currentStats.total_study_time_minutes || 0) + session.durationMinutes,
            last_study_date: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  };

  return { saveStudySession };
};
