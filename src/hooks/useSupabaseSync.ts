
import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useFlashcardStore } from '@/store/flashcardStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseSync = () => {
  const { user } = useAuth();
  const { cards, addCard, setStage } = useFlashcardStore();

  // Load cards from Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadCardsFromSupabase = async () => {
      try {
        console.log('Loading cards from Supabase for user:', user.id);
        
        const { data: supabaseCards, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading cards:', error);
          return;
        }

        if (!isMounted) return;

        console.log('Loaded cards from Supabase:', supabaseCards?.length || 0);

        if (supabaseCards && supabaseCards.length > 0) {
          // Clear local store first
          const store = useFlashcardStore.getState();
          store.cards = [];
          
          // Add each card from Supabase
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
        console.error('Error in loadCardsFromSupabase:', error);
      }
    };

    loadCardsFromSupabase();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only depend on user.id to prevent loops

  // Sync local cards to Supabase when user logs in (only if no cards exist in Supabase)
  useEffect(() => {
    if (!user || cards.length === 0) return;

    let isMounted = true;

    const syncLocalCardsToSupabase = async () => {
      try {
        console.log('Checking if sync is needed...');
        
        // Check if user already has cards in Supabase
        const { data: existingCards, error: fetchError } = await supabase
          .from('flashcards')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (fetchError) {
          console.error('Error checking existing cards:', fetchError);
          return;
        }

        if (!isMounted) return;

        // Only sync if no cards exist in Supabase
        if (!existingCards || existingCards.length === 0) {
          console.log('Syncing local cards to Supabase...');
          
          for (const card of cards) {
            const { error: insertError } = await supabase.from('flashcards').insert({
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

            if (insertError) {
              console.error('Error inserting card:', insertError);
            }
          }
          
          if (isMounted) {
            toast.success('Local cards synced to your account!');
          }
        }
      } catch (error) {
        console.error('Error in syncLocalCardsToSupabase:', error);
      }
    };

    // Add a delay to prevent race conditions
    const timeoutId = setTimeout(syncLocalCardsToSupabase, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [user?.id, cards.length]); // Depend on cards.length to trigger when cards are available

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
