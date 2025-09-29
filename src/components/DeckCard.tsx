import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DeckWithStats } from "@/types/flashcards";
import { useDeleteDeck } from "@/hooks/useDecks";
import { BookOpen, Calendar, Star, Plus, ChevronDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";

interface DeckCardProps {
  deck: DeckWithStats;
  onStudy: (deckId: string) => void;
  onEdit: (deckId: string) => void;
  onManageCards: (deckId: string) => void;
  onDelete: (deckId: string) => void;
  level: number;
}

export function DeckCard({ deck, onStudy, onEdit, onManageCards, onDelete, level }: DeckCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasCardsToReview = deck.cards_to_review > 0;
  const hasSubdecks = deck.sub_decks.length > 0;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasSubdecks) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div
        className="group relative transition-all duration-300 hover:shadow-soft hover:scale-105"
        style={{ 
          marginLeft: `${level * 1.5}rem`,
        }}
      >
        <CollapsibleTrigger asChild>
          <Card
            className="w-full cursor-pointer bg-gradient-card border-border/50"
            style={{ 
              borderLeftColor: deck.color,
              borderLeftWidth: '4px',
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex items-center">
                    {deck.name}
                    {hasSubdecks && (
                      <ChevronDown
                        className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    )}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onStudy(deck.id);
                  }}
                  className="flex-1"
                  disabled={deck.total_cards === 0}
                >
                  {hasCardsToReview ? 'Estudar' : 'Revisar'}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onManageCards(deck.id);
                    }}>
                      <Plus className="mr-2 h-4 w-4" /> Gerenciar Flashcards
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit(deck.id);
                    }}>
                      <Edit className="mr-2 h-4 w-4" /> Editar Deck
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Tem certeza que deseja excluir este deck e todos os seus cards?")) {
                          onDelete(deck.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir Deck
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </div>
            </CardContent>
          </Card>
        </CollapsibleTrigger>
        
        {hasSubdecks && (
          <CollapsibleContent className="mt-4 space-y-4">
            {deck.sub_decks.map((subDeck) => (
              <DeckCard
                key={subDeck.id}
                deck={subDeck}
                onStudy={onStudy}
                onEdit={onEdit}
                onManageCards={onManageCards}
                onDelete={onDelete}
                level={level + 1}
              />
            ))}
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  );
}