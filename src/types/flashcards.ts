export interface Deck {
  id: string;
  name: string;
  description?: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  difficulty: 0 | 1 | 2 | 3; // 0=new, 1=easy, 2=medium, 3=hard
  next_review: string;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface DeckWithStats extends Deck {
  total_cards: number;
  cards_to_review: number;
  new_cards: number;
}

export interface StudySession {
  deck_id: string;
  cards: Flashcard[];
  current_index: number;
  completed: boolean;
}

export type DifficultyLevel = 'new' | 'easy' | 'medium' | 'hard';

export const DIFFICULTY_COLORS = {
  0: 'study-new',    // new
  1: 'study-easy',   // easy
  2: 'study-medium', // medium
  3: 'study-hard',   // hard
} as const;

export const DIFFICULTY_LABELS = {
  0: 'Novo',
  1: 'Fácil',
  2: 'Médio',
  3: 'Difícil',
} as const;