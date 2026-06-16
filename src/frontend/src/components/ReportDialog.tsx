import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useSubmitReport } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportDialog({ isOpen, onClose }: ReportDialogProps) {
  const { user, isLoggedIn } = useAuth();
  const submitReport = useSubmitReport();
  const [category, setCategory] = useState<"bug" | "suggestion" | "other">("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Please sign in or register to submit reports.");
      return;
    }
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await submitReport.mutateAsync({
        userId: user!.id,
        userName: user!.name,
        category,
        message: message.trim(),
      });
      toast.success("Feedback submitted successfully. Thank you!");
      setMessage("");
      onClose();
    } catch {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-5 border border-border">
        <DialogHeader className="border-b border-border pb-3 flex flex-row items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary animate-bounce" />
          <div>
            <DialogTitle className="text-base font-bold font-display">Report Issue / Bug</DialogTitle>
            <DialogDescription className="text-xs">
              Tell our admin team about issues, suggestions, or bugs.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Feedback Type</Label>
            <select
              className="w-full border border-border bg-card p-2 rounded-md text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
            >
              <option value="bug">Bug Report / Error</option>
              <option value="suggestion">New Feature Suggestion</option>
              <option value="other">General Feedback</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="rep-message" className="text-xs font-semibold">Message Detail</Label>
            <Textarea
              id="rep-message"
              placeholder="Describe the issue or suggestion in detail..."
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isLoggedIn}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !isLoggedIn || !message.trim()}>
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
