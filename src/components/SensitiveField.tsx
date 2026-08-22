import { useState } from "react";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSensitiveUnlock } from "@/hooks/useSensitiveUnlock";

interface SensitiveFieldProps {
  value: string;
  context: string;
}

// Inline variant of the sensitive-data gate for a single field (e.g. a
// weapon serial number in a list) rather than a whole page — reveals the
// real value once the session is unlocked, without blocking routine stock
// browsing for the rest of the page.
export function SensitiveField({ value, context }: SensitiveFieldProps) {
  const { unlocked, unlock } = useSensitiveUnlock();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (unlocked) return <>{value}</>;

  const handleUnlock = async () => {
    if (!password) return;
    setSubmitting(true);
    setError("");
    const res = await unlock(password, context);
    setSubmitting(false);
    if (!res.success) {
      setError(res.error || "Failed to unlock");
      return;
    }
    setPassword("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Lock className="h-3 w-3" /> ••••••
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 space-y-2" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs text-muted-foreground">Confirm your password/PIN to reveal</p>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
          autoFocus
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button size="sm" className="w-full" onClick={handleUnlock} disabled={submitting || !password}>
          Unlock
        </Button>
      </PopoverContent>
    </Popover>
  );
}
