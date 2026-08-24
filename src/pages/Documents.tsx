import { useEffect, useRef, useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Camera, FileText, Check, X, Loader2, ScanText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type DocumentCapture = Database["public"]["Tables"]["document_captures"]["Row"] & {
  captured_by_profile?: { name: string; rank: string | null } | null;
};

export default function Documents() {
  const { user, profile, role } = useAuth();
  const canCapture = role === "S4" || role === "S4_ADMIN";
  const canApprove = role === "S4";

  const [documents, setDocuments] = useState<DocumentCapture[]>([]);
  const [loading, setLoading] = useState(true);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentCapture | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("document_captures")
      .select("*, captured_by_profile:profiles!document_captures_captured_by_fkey(name, rank)")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load documents");
    } else {
      setDocuments((data as DocumentCapture[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();

    const channel = supabase
      .channel("document-captures-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "document_captures" }, () => fetchDocuments())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const openPreview = async (doc: DocumentCapture) => {
    setPreviewDoc(doc);
    const { data } = await supabase.storage.from("document-captures").createSignedUrl(doc.storage_path, 300);
    setPreviewUrl(data?.signedUrl || null);
  };

  const closePreview = () => {
    setPreviewDoc(null);
    setPreviewUrl(null);
    setRejectReason("");
  };

  const handleApprove = async (doc: DocumentCapture) => {
    const { error } = await supabase
      .from("document_captures")
      .update({ status: "approved", reviewed_by: user!.id, reviewed_at: new Date().toISOString() })
      .eq("id", doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Document approved — now visible to everyone");
    closePreview();
    fetchDocuments();
  };

  const handleReject = async (doc: DocumentCapture) => {
    const { error } = await supabase
      .from("document_captures")
      .update({
        status: "rejected",
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectReason || null,
      })
      .eq("id", doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Document rejected");
    closePreview();
    fetchDocuments();
  };

  const pending = documents.filter((d) => d.status === "pending");
  const approved = documents.filter((d) => d.status === "approved");

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
              <p className="text-muted-foreground">
                Captured forms and paperwork, reviewed by S4 before the battalion can see them
              </p>
            </div>
          </div>
          {canCapture && (
            <Button onClick={() => setCaptureOpen(true)}>
              <Camera className="h-4 w-4 mr-2" />
              Capture Document
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            {canApprove && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending Review {pending.length > 0 && `(${pending.length})`}
                </h2>
                {pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing awaiting review.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pending.map((doc) => (
                      <DocumentCard key={doc.id} doc={doc} onClick={() => openPreview(doc)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Document Library {approved.length > 0 && `(${approved.length})`}
              </h2>
              {approved.length === 0 ? (
                <p className="text-sm text-muted-foreground">No approved documents yet.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {approved.map((doc) => (
                    <DocumentCard key={doc.id} doc={doc} onClick={() => openPreview(doc)} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {canCapture && (
        <CaptureDialog
          open={captureOpen}
          onOpenChange={setCaptureOpen}
          userId={user!.id}
          unitId={profile?.unit_id ?? null}
          onCaptured={fetchDocuments}
        />
      )}

      <Dialog open={!!previewDoc} onOpenChange={(v) => !v && closePreview()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {previewDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {previewDoc.title}
                  <StatusBadge status={previewDoc.status} />
                </DialogTitle>
                <DialogDescription>
                  {previewDoc.category && `${previewDoc.category} · `}
                  Captured {formatDistanceToNow(new Date(previewDoc.created_at), { addSuffix: true })}
                  {previewDoc.captured_by_profile &&
                    ` by ${previewDoc.captured_by_profile.rank ?? ""} ${previewDoc.captured_by_profile.name}`}
                </DialogDescription>
              </DialogHeader>

              {previewUrl && (
                <img src={previewUrl} alt={previewDoc.title} className="w-full rounded-lg border" />
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ScanText className="h-4 w-4" />
                  Extracted Text
                  {previewDoc.extraction_status === "processing" && (
                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                  {previewDoc.extraction_status === "failed" && (
                    <Badge variant="destructive" className="text-xs">Extraction failed</Badge>
                  )}
                </div>
                {previewDoc.extraction_status === "done" && previewDoc.extracted_text ? (
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {previewDoc.extracted_text}
                  </p>
                ) : previewDoc.extraction_status === "failed" ? (
                  <p className="text-sm text-muted-foreground">{previewDoc.extraction_error}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Reading document…</p>
                )}

                {previewDoc.extracted_fields && Object.keys(previewDoc.extracted_fields as object).length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {Object.entries(previewDoc.extracted_fields as Record<string, string>).map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}:</span>{" "}
                        <span className="font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {canApprove && previewDoc.status === "pending" && (
                <>
                  <div className="space-y-2">
                    <Label>Rejection reason (optional)</Label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Only needed if you're rejecting this document"
                      rows={2}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => handleReject(previewDoc)}>
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(previewDoc)}>
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </DialogFooter>
                </>
              )}

              {previewDoc.status === "rejected" && previewDoc.rejection_reason && (
                <p className="text-sm text-destructive">Rejected: {previewDoc.rejection_reason}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline" className="text-amber-600 border-amber-500/30">Pending</Badge>;
}

function DocumentCard({ doc, onClick }: { doc: DocumentCapture; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="truncate">{doc.title}</span>
          </CardTitle>
          <StatusBadge status={doc.status} />
        </div>
        {doc.category && <CardDescription className="capitalize">{doc.category}</CardDescription>}
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
        </p>
      </CardContent>
    </Card>
  );
}

function CaptureDialog({
  open,
  onOpenChange,
  userId,
  unitId,
  onCaptured,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: string;
  unitId: string | null;
  onCaptured: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setTitle("");
    setCategory("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) {
      toast.error("Add a title and a photo");
      return;
    }
    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("document-captures")
        .upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;

      const { data: inserted, error: insertError } = await supabase
        .from("document_captures")
        .insert({
          title: title.trim(),
          category: category.trim() || null,
          storage_path: path,
          captured_by: userId,
          unit_id: unitId,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      supabase.functions.invoke("extract-document", { body: { document_id: inserted.id } }).catch((err) => {
        console.error("[Documents] extraction invoke failed:", err);
      });

      toast.success("Document captured — reading it now, then it'll wait for S4 approval");
      reset();
      onOpenChange(false);
      onCaptured();
    } catch (error: any) {
      toast.error(error.message || "Failed to capture document");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Capture Document
          </DialogTitle>
          <DialogDescription>
            Snap or upload a photo. It'll be read automatically, then held for S4 approval before anyone else can see it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <Label>Photo</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <div className="relative mt-1">
                <img src={previewUrl} alt="Preview" className="w-full rounded-lg border max-h-64 object-contain" />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Retake
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full mt-1 h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-5 w-5 mr-2" />
                Take or choose a photo
              </Button>
            )}
          </div>

          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., TTR 21 — Clothing Equipment" />
          </div>

          <div>
            <Label>Category (optional)</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., TTR Form, Ledger, Receipt" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !file || !title.trim()}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
