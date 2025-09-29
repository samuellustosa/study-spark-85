import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flashcard, DIFFICULTY_LABELS } from "@/types/flashcards";
import { useReviewCard } from "@/hooks/useFlashcards";
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface StudyModeProps {
  cards: Flashcard[];
  deckId: string;
  onExit: () => void;
}

export function StudyMode({ cards, deckId, onExit }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(new Set());
  
  const reviewCard = useReviewCard();
  
  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;
  const isLastCard = currentIndex === cards.length - 1;
  
  if (!currentCard) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center p-8 bg-gradient-card">
          <CardContent className="space-y-4">
            <CheckCircle className="h-16 w-16 text-study-easy mx-auto" />
            <h2 className="text-2xl font-bold">Parabéns!</h2>
            <p className="text-muted-foreground">Você completou todos os cards disponíveis para estudo.</p>
            <Button onClick={onExit}>Voltar ao Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const handleAnswer = async (wasCorrect: boolean) => {
    if (!isFlipped) {
      toast({
        title: "Vire o card primeiro",
        description: "Clique em 'Mostrar Resposta' antes de avaliar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await reviewCard.mutateAsync({
        cardId: currentCard.id,
        deckId,
        difficulty: currentCard.difficulty,
        wasCorrect,
      });
      
      setStudiedCards(prev => new Set(prev).add(currentCard.id));
      
      if (isLastCard) {
        toast({
          title: "Sessão concluída!",
          description: "Você terminou todos os cards desta sessão.",
        });
      } else {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar resposta",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 0: return 'bg-study-new';
      case 1: return 'bg-study-easy';
      case 2: return 'bg-study-medium';
      case 3: return 'bg-study-hard';
      default: return 'bg-muted';
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onExit}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Sair do Estudo
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline">
            {currentIndex + 1} de {cards.length}
          </Badge>
          <Badge className={getDifficultyColor(currentCard.difficulty)}>
            {DIFFICULTY_LABELS[currentCard.difficulty as keyof typeof DIFFICULTY_LABELS]}
          </Badge>
        </div>
      </div>
      
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso da sessão</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      {/* Flashcard */}
      <Card 
        className={`relative overflow-hidden cursor-pointer transition-all duration-500 min-h-[300px] ${
          isFlipped ? 'animate-flip-card' : ''
        }`}
        onClick={flipCard}
      >
        <CardContent className="p-8 h-full flex flex-col justify-center">
          <div className="text-center space-y-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              {isFlipped ? 'Resposta' : 'Pergunta'}
            </div>
            <div className="text-xl md:text-2xl font-medium leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </div>
            {!isFlipped && (
              <div className="flex items-center justify-center text-sm text-muted-foreground pt-4">
                <Eye className="h-4 w-4 mr-2" />
                Clique para ver a resposta
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Actions */}
      <div className="space-y-4">
        {!isFlipped ? (
          <Button onClick={flipCard} className="w-full" size="lg">
            <Eye className="h-4 w-4 mr-2" />
            Mostrar Resposta
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleAnswer(false)}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              size="lg"
              disabled={reviewCard.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Errei
            </Button>
            <Button 
              onClick={() => handleAnswer(true)}
              className="bg-study-easy hover:bg-study-easy/90"
              size="lg"
              disabled={reviewCard.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Acertei
            </Button>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          onClick={flipCard}
          className="w-full"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Virar Card
        </Button>
      </div>
    </div>
  );
}