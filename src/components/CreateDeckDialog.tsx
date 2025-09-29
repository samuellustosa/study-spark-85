import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateDeck, useDecks } from "@/hooks/useDecks";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface CreateDeckDialogProps {
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

export function CreateDeckDialog({ open, onOpenChange }: CreateDeckDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(DECK_COLORS[0]);
  const [parentDeckId, setParentDeckId] = useState<string | undefined>(undefined);
  
  const createDeck = useCreateDeck();
  const { data: decks = [] } = useDecks();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    try {
      await createDeck.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        color: selectedColor,
        parent_deck_id: parentDeckId,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setSelectedColor(DECK_COLORS[0]);
      setParentDeckId(undefined);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Deck</DialogTitle>
          <DialogDescription>
            Crie um novo deck para organizar seus flashcards de estudo.
          </DialogDescription>
        </DialogHeader>
        
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
                {decks.map((deck) => (
                  <SelectItem key={deck.id} value={deck.id}>
                    {deck.name}
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
              disabled={!name.trim() || createDeck.isPending}
            >
              {createDeck.isPending ? "Criando..." : "Criar Deck"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}