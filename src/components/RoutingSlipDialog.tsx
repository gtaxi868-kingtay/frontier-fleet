import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { generateRoutingSlip, downloadPdf, todayFormatted, type RoutingSlipOptions } from "@/lib/pdfForms";

interface RoutingSlipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSubject?: string;
}

const ROUTING_ACTIONS: RoutingSlipOptions["action"][] = [
  "For your information",
  "For follow up action",
  "Immediate Feedback",
  "For Comments",
  "For Action",
  "Note and Return",
  "For Discussion",
  "Noted-File",
  "BU on File",
];

export function RoutingSlipDialog({ open, onOpenChange, defaultSubject = "" }: RoutingSlipDialogProps) {
  const { profile } = useAuth();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState(defaultSubject);
  const [action, setAction] = useState<RoutingSlipOptions["action"]>("For Action");
  const [comments, setComments] = useState("");

  const handleGenerate = () => {
    if (!to.trim()) {
      toast.error("Please enter who this is being routed to");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    const doc = generateRoutingSlip({
      to,
      from: profile?.name || "",
      date: todayFormatted(),
      subject,
      action,
      comments,
    });
    downloadPdf(doc, `Routing-Slip-${todayFormatted().replace(/\s/g, "-")}`);
    toast.success("Routing slip generated");
    onOpenChange(false);
    setTo("");
    setSubject(defaultSubject);
    setAction("For Action");
    setComments("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Generate Routing Slip</DialogTitle>
          <DialogDescription>
            Direct a report or letter to the appropriate office per standing orders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="routing-to">To *</Label>
            <Input
              id="routing-to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g., Officer Commanding, Support Squadron"
            />
          </div>

          <div>
            <Label htmlFor="routing-subject">Subject *</Label>
            <Input
              id="routing-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject of the report or letter"
            />
          </div>

          <div>
            <Label>Routing Action</Label>
            <RadioGroup value={action} onValueChange={(v) => setAction(v as RoutingSlipOptions["action"])} className="grid grid-cols-2 gap-2 mt-2">
              {ROUTING_ACTIONS.map((a) => (
                <div key={a} className="flex items-center space-x-2">
                  <RadioGroupItem value={a} id={`action-${a}`} />
                  <Label htmlFor={`action-${a}`} className="font-normal text-sm">{a}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="routing-comments">Comments</Label>
            <Textarea
              id="routing-comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleGenerate}>
              Generate PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
