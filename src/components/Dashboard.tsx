import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDecks } from "@/hooks/useDecks";
import { useStudyCards } from "@/hooks/useFlashcards";
import { DeckCard } from "./DeckCard";
import { StudyMode } from "./StudyMode";
import { CreateDeckDialog } from "./CreateDeckDialog";
import { FlashcardManager } from "./FlashcardManager";
import { Plus, BookOpen, Calendar, TrendingUp, Zap } from "lucide-react";

type ViewMode = 'dashboard' | 'study' | 'manage-cards';

export function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [selectedDeckId, setSelectedDeckId] = useState<string>("");
  const [showCreateDeck, setShowCreateDeck] = useState(false);
  
  const { data: decks = [], isLoading } = useDecks();
  const { data: studyCards = [] } = useStudyCards(selectedDeckId);
  
  if (viewMode === 'study' && selectedDeckId) {
    return (
      <StudyMode
        cards={studyCards}
        deckId={selectedDeckId}
        onExit={() => {
          setViewMode('dashboard');
          setSelectedDeckId("");
        }}
      />
    );
  }
  
  if (viewMode === 'manage-cards' && selectedDeckId) {
    return (
      <FlashcardManager
        deckId={selectedDeckId}
        onBack={() => {
          setViewMode('dashboard');
          setSelectedDeckId("");
        }}
      />
    );
  }
  
  const totalCards = decks.reduce((sum, deck) => sum + deck.total_cards, 0);
  const cardsToReview = decks.reduce((sum, deck) => sum + deck.cards_to_review, 0);
  const newCards = decks.reduce((sum, deck) => sum + deck.new_cards, 0);
  
  const handleStudy = (deckId: string) => {
    setSelectedDeckId(deckId);
    setViewMode('study');
  };
  
  const handleManageCards = (deckId: string) => {
    setSelectedDeckId(deckId);
    setViewMode('manage-cards');
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          StudyCards
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sistema inteligente de flashcards com repetição espaçada para maximizar seu aprendizado
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Decks</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{decks.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cards</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCards}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para Revisar</CardTitle>
            <Calendar className="h-4 w-4 text-study-new" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-study-new">{cardsToReview}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cards Novos</CardTitle>
            <TrendingUp className="h-4 w-4 text-study-easy" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-study-easy">{newCards}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Study Section */}
      {cardsToReview > 0 && (
        <Card className="bg-gradient-accent border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sessão de Estudo Disponível
            </CardTitle>
            <CardDescription>
              Você tem {cardsToReview} cards prontos para revisar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                const deckWithCards = decks.find(deck => deck.cards_to_review > 0);
                if (deckWithCards) handleStudy(deckWithCards.id);
              }}
              className="w-full md:w-auto"
            >
              <Zap className="h-4 w-4 mr-2" />
              Começar Estudo
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Decks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Meus Decks</h2>
          <Button onClick={() => setShowCreateDeck(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Deck
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : decks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum deck encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Crie seu primeiro deck para começar a estudar com flashcards
              </p>
              <Button onClick={() => setShowCreateDeck(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Deck
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStudy={handleStudy}
                onEdit={(id) => console.log('Edit deck:', id)}
                onManageCards={handleManageCards}
              />
            ))}
          </div>
        )}
      </div>
      
      <CreateDeckDialog
        open={showCreateDeck}
        onOpenChange={setShowCreateDeck}
      />
    </div>
  );
}