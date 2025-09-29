import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flashcard } from "@/types/flashcards";
import { toast } from "@/hooks/use-toast";

export function useFlashcards(deckId: string) {
  return useQuery({
    queryKey: ["flashcards", deckId],
    queryFn: async (): Promise<Flashcard[]> => {
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Flashcard[];
    },
    enabled: !!deckId,
  });
}

export function useStudyCards(deckId: string) {
  return useQuery({
    queryKey: ["study-cards", deckId],
    queryFn: async (): Promise<Flashcard[]> => {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .lte("next_review", now)
        .order("next_review", { ascending: true })
        .limit(20);

      if (error) throw error;
      return (data || []) as Flashcard[];
    },
    enabled: !!deckId,
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (flashcard: Omit<Flashcard, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("flashcards")
        .insert([flashcard])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", variables.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Flashcard criado!",
        description: "Seu novo flashcard foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar flashcard",
        description: "Não foi possível criar o flashcard. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, deck_id, ...updates }: Partial<Flashcard> & { id: string; deck_id: string }) => {
      const { data, error } = await supabase
        .from("flashcards")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", variables.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["study-cards", variables.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, deck_id }: { id: string; deck_id: string }) => {
      const { error } = await supabase
        .from("flashcards")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", variables.deck_id] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Flashcard excluído!",
        description: "O flashcard foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir flashcard",
        description: "Não foi possível excluir o flashcard.",
        variant: "destructive",
      });
    },
  });
}

// Sistema de repetição espaçada
export function useReviewCard() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      cardId, 
      deckId, 
      difficulty, 
      wasCorrect 
    }: { 
      cardId: string; 
      deckId: string; 
      difficulty: number; 
      wasCorrect: boolean;
    }) => {
      let newDifficulty = difficulty;
      let intervalDays = 1;

      // Algoritmo de repetição espaçada simplificado
      if (wasCorrect) {
        switch (difficulty) {
          case 0: // novo -> fácil
            newDifficulty = 1;
            intervalDays = 1;
            break;
          case 1: // fácil
            intervalDays = 3;
            break;
          case 2: // médio
            intervalDays = 7;
            break;
          case 3: // difícil
            intervalDays = 14;
            break;
        }
      } else {
        // Se errou, volta a ser difícil e revisa amanhã
        newDifficulty = Math.max(0, difficulty - 1);
        intervalDays = 1;
      }

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + intervalDays);

      // Primeiro, buscar o card atual para incrementar review_count
      const { data: currentCard, error: fetchError } = await supabase
        .from("flashcards")
        .select("review_count")
        .eq("id", cardId)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from("flashcards")
        .update({
          difficulty: newDifficulty,
          next_review: nextReview.toISOString(),
          review_count: (currentCard?.review_count || 0) + 1
        })
        .eq("id", cardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flashcards", variables.deckId] });
      queryClient.invalidateQueries({ queryKey: ["study-cards", variables.deckId] });
      queryClient.invalidateQueries({ queryKey: ["decks"] });
    },
  });
}