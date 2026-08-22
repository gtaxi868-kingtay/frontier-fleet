import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { useSensitiveUnlock } from "@/hooks/useSensitiveUnlock";

interface SensitiveGateProps {
  context: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function SensitiveGate({
  context,
  title = "Sensitive Data Locked",
  description = "This screen shows serial numbers and ammunition details. Confirm your password or PIN to continue.",
  children,
}: SensitiveGateProps) {
  const { unlocked, unlock } = useSensitiveUnlock();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (unlocked) return <>{children}</>;

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
  };

  return (
    <Card className="border-warning/40 bg-warning/5 max-w-md mx-auto">
      <CardContent className="p-6 space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-warning/15 flex items-center justify-center">
          <Lock className="h-6 w-6 text-warning" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="space-y-2 text-left">
          <Label>Password / PIN</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Button className="w-full" onClick={handleUnlock} disabled={submitting || !password}>
          {submitting ? "Verifying..." : "Unlock"}
        </Button>
      </CardContent>
    </Card>
  );
}
