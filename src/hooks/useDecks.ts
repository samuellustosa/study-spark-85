import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Deck, DeckWithStats } from "@/types/flashcards";
import { toast } from "@/hooks/use-toast";

interface DeckTree {
  [key: string]: DeckWithStats;
}

// Função utilitária para construir a árvore de decks
const buildDeckTree = (decks: DeckWithStats[]): DeckWithStats[] => {
  const deckMap: DeckTree = {};

  decks.forEach(deck => {
    deckMap[deck.id] = { ...deck, sub_decks: [] };
  });

  const tree: DeckWithStats[] = [];

  decks.forEach(deck => {
    if (deck.parent_deck_id && deckMap[deck.parent_deck_id]) {
      deckMap[deck.parent_deck_id].sub_decks.push(deckMap[deck.id]);
    } else {
      tree.push(deckMap[deck.id]);
    }
  });

  return tree;
};

export function useDecks() {
  return useQuery({
    queryKey: ["decks"],
    queryFn: async (): Promise<DeckWithStats[]> => {
      const { data: decks, error } = await supabase
        .from("decks")
        .select(`
          *,
          flashcards (
            id,
            difficulty,
            next_review
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const decksWithStats = (decks || []).map((deck) => {
        const cards = deck.flashcards || [];
        const now = new Date().toISOString();
        
        return {
          ...deck,
          flashcards: undefined,
          total_cards: cards.length,
          cards_to_review: cards.filter((card: any) => card.next_review <= now).length,
          new_cards: cards.filter((card: any) => card.difficulty === 0).length,
          sub_decks: [],
        };
      });

      return buildDeckTree(decksWithStats);
    },
  });
}

export function useDeck(id: string) {
  return useQuery({
    queryKey: ["deck", id],
    queryFn: async (): Promise<Deck> => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDeck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (deck: Omit<Deck, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("decks")
        .insert([deck])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Deck criado!",
        description: "Seu novo deck foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar deck",
        description: "Não foi possível criar o deck. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateDeck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Deck> & { id: string }) => {
      const { data, error } = await supabase
        .from("decks")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Deck atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar deck",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteDeck() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("decks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decks"] });
      toast({
        title: "Deck excluído!",
        description: "O deck foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir deck",
        description: "Não foi possível excluir o deck.",
        variant: "destructive",
      });
    },
  });
}