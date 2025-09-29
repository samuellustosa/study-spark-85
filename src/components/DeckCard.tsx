import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeckWithStats } from "@/types/flashcards";
import { BookOpen, Calendar, Star, Plus } from "lucide-react";

interface DeckCardProps {
  deck: DeckWithStats;
  onStudy: (deckId: string) => void;
  onEdit: (deckId: string) => void;
  onManageCards: (deckId: string) => void;
}

export function DeckCard({ deck, onStudy, onEdit, onManageCards }: DeckCardProps) {
  const hasCardsToReview = deck.cards_to_review > 0;
  
  return (
    <Card 
      className="group relative overflow-hidden transition-all duration-300 hover:shadow-soft hover:scale-105 bg-gradient-card border-border/50"
      style={{ 
        borderTopColor: deck.color,
        borderTopWidth: '4px'
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {deck.name}
            </CardTitle>
            {deck.description && (
              <CardDescription className="mt-1 text-sm text-muted-foreground">
                {deck.description}
              </CardDescription>
            )}
          </div>
          {hasCardsToReview && (
            <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
              {deck.cards_to_review} para revisar
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{deck.total_cards} cards</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{deck.new_cards} novos</span>
          </div>
        </div>
        
        {hasCardsToReview && (
          <div className="flex items-center gap-1 text-sm text-study-new">
            <Calendar className="h-4 w-4" />
            <span>Prontos para estudo</span>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onStudy(deck.id)}
            className="flex-1"
            disabled={deck.total_cards === 0}
          >
            {hasCardsToReview ? 'Estudar' : 'Revisar'}
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onManageCards(deck.id)}
            className="hover:bg-accent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}