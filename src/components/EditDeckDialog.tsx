import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useDeck, useDecks, useUpdateDeck } from "@/hooks/useDecks";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface EditDeckDialogProps {
  deckId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DECK_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
];

export function EditDeckDialog({ deckId, open, onOpenChange }: EditDeckDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(DECK_COLORS[0]);
  const [parentDeckId, setParentDeckId] = useState<string | undefined>(undefined);
  
  const { data: deck, isLoading, isError } = useDeck(deckId);
  const { data: allDecks = [] } = useDecks();
  const updateDeck = useUpdateDeck();
  
  // Update form fields when deck data is loaded
  useEffect(() => {
    if (deck) {
      setName(deck.name);
      setDescription(deck.description || "");
      setSelectedColor(deck.color || DECK_COLORS[0]);
      setParentDeckId(deck.parent_deck_id || undefined);
    }
  }, [deck]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Nome do Deck obrigatório",
        description: "O nome do deck não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await updateDeck.mutateAsync({
        id: deckId,
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        parent_deck_id: parentDeckId,
      });
      
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Deck</DialogTitle>
          <DialogDescription>
            Faça alterações no seu deck aqui. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-24 w-full bg-muted animate-pulse rounded-md" />
            <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
          </div>
        ) : isError || !deck ? (
          <div className="text-center text-red-500">
            Erro ao carregar deck.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deck-name">Nome do Deck *</Label>
              <Input
                id="deck-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Inglês - Vocabulário"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deck-description">Descrição (opcional)</Label>
              <Textarea
                id="deck-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrição do que será estudado neste deck..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-deck">Deck Pai (opcional)</Label>
              <Select onValueChange={setParentDeckId} value={parentDeckId}>
                <SelectTrigger id="parent-deck">
                  <SelectValue placeholder="Selecione um deck pai" />
                </SelectTrigger>
                <SelectContent>
                  {allDecks
                    .filter(d => d.id !== deckId) // Prevent a deck from being its own parent
                    .map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Cor do Deck</Label>
              <div className="flex gap-2 flex-wrap">
                {DECK_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-foreground scale-110' 
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
                disabled={!name.trim() || updateDeck.isPending}
              >
                {updateDeck.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}