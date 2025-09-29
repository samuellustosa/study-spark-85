import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFlashcards, useCreateFlashcard, useDeleteFlashcard } from "@/hooks/useFlashcards";
import { useDeck } from "@/hooks/useDecks";
import { Flashcard, DIFFICULTY_LABELS } from "@/types/flashcards";
import { ArrowLeft, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FlashcardManagerProps {
  deckId: string;
  onBack: () => void;
}

interface CreateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deckId: string;
}

function CreateCardDialog({ open, onOpenChange, deckId }: CreateCardDialogProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  
  const createFlashcard = useCreateFlashcard();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!front.trim() || !back.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha tanto a pergunta quanto a resposta.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createFlashcard.mutateAsync({
        deck_id: deckId,
        front: front.trim(),
        back: back.trim(),
        difficulty: 0,
        next_review: new Date().toISOString(),
        review_count: 0,
      });
      
      setFront("");
      setBack("");
      onOpenChange(false);
    } catch (error) {
      // Error handled in hook
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Flashcard</DialogTitle>
          <DialogDescription>
            Adicione uma nova pergunta e resposta ao seu deck.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-front">Pergunta *</Label>
            <Textarea
              id="card-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Digite a pergunta ou termo a ser estudado..."
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="card-back">Resposta *</Label>
            <Textarea
              id="card-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Digite a resposta ou definição..."
              rows={3}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createFlashcard.isPending}
            >
              {createFlashcard.isPending ? "Criando..." : "Criar Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FlashcardItem({ card, onDelete }: { card: Flashcard; onDelete: (id: string) => void }) {
  const [showBack, setShowBack] = useState(false);
  
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 0: return 'bg-study-new text-white';
      case 1: return 'bg-study-easy text-white';
      case 2: return 'bg-study-medium text-white';
      case 3: return 'bg-study-hard text-white';
      default: return 'bg-muted';
    }
  };
  
  return (
    <Card className="group hover:shadow-soft transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base font-medium line-clamp-2">
              {card.front}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Badge className={getDifficultyColor(card.difficulty)}>
              {DIFFICULTY_LABELS[card.difficulty as keyof typeof DIFFICULTY_LABELS]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {showBack && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground mb-1">Resposta:</p>
            <p className="text-sm">{card.back}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBack(!showBack)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {showBack ? 'Ocultar' : 'Ver'} Resposta
          </Button>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(card.id)}
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Revisado {card.review_count} vezes
        </div>
      </CardContent>
    </Card>
  );
}

export function FlashcardManager({ deckId, onBack }: FlashcardManagerProps) {
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: deck } = useDeck(deckId);
  const { data: flashcards = [], isLoading } = useFlashcards(deckId);
  const deleteFlashcard = useDeleteFlashcard();
  
  const filteredCards = flashcards.filter(card =>
    card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.back.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDeleteCard = async (cardId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este flashcard?")) {
      try {
        await deleteFlashcard.mutateAsync({ id: cardId, deck_id: deckId });
      } catch (error) {
        // Error handled in hook
      }
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{deck?.name}</h1>
            <p className="text-muted-foreground">
              {flashcards.length} flashcards neste deck
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateCard(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Card
        </Button>
      </div>
      
      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por pergunta ou resposta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Cards List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground">
                    Nenhum card encontrado para "{searchTerm}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Limpar busca
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Este deck ainda não tem flashcards
                  </p>
                  <Button onClick={() => setShowCreateCard(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Card
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => (
            <FlashcardItem
              key={card.id}
              card={card}
              onDelete={handleDeleteCard}
            />
          ))}
        </div>
      )}
      
      <CreateCardDialog
        open={showCreateCard}
        onOpenChange={setShowCreateCard}
        deckId={deckId}
      />
    </div>
  );
}