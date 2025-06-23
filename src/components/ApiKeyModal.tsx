import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useApiKey } from "@/hooks/useApiKey";

export default function ApiKeyModal() {
  const { apiKey, saveApiKey, deleteApiKey } = useApiKey();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  // Modal öffnen, wenn kein Key vorhanden ist
  useEffect(() => {
    setOpen(!apiKey);
  }, [apiKey]);

  const handleSave = () => {
    if (!input.trim()) {
      setError("API-Key darf nicht leer sein.");
      return;
    }
    saveApiKey(input.trim());
    setInput("");
    setError("");
    // Modal schließen nach Speichern
    setOpen(false);
  };

  const handleDelete = () => {
    deleteApiKey();
    setInput("");
    setError("");
    setOpen(true);
  };

  // Wenn kein apiKey vorhanden ist, blockiere das Schließen
  const handleOpenChange = (val: boolean) => {
    if (!apiKey) {
      setOpen(true);
    } else {
      setOpen(val);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>OpenAI API-Key erforderlich</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="sk-..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full"
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button className="w-full" onClick={handleSave}>
            Speichern
          </Button>
          {apiKey && (
            <Button variant="destructive" className="w-full" onClick={handleDelete}>
              API-Key löschen
            </Button>
          )}
          <div className="text-xs text-muted-foreground mt-2">
            Dein OpenAI-Key wird nur lokal im Browser gespeichert und für GPT-Anfragen verwendet.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 