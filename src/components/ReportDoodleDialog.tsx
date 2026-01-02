import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { type DoodleReportReason, REPORT_REASONS } from '@/types';
import { Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';

interface ReportDoodleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doodleId: string;
  onReportSubmitted?: () => void;
}

export function ReportDoodleDialog({
  open,
  onOpenChange,
  doodleId,
  onReportSubmitted,
}: ReportDoodleDialogProps) {
  const [reason, setReason] = useState<DoodleReportReason | ''>('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReport = useAppStore((state) => state.submitDoodleReport);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason for your report');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport(doodleId, reason, details || undefined);
      toast.success('Report submitted', {
        description: 'Thank you for helping keep our community safe.',
      });
      onOpenChange(false);
      onReportSubmitted?.();
      // Reset form
      setReason('');
      setDetails('');
    } catch (error) {
      toast.error('Failed to submit report', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setReason('');
      setDetails('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Report Doodle
          </DialogTitle>
          <DialogDescription>
            Help us keep the community safe by reporting inappropriate content.
            All reports are reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Why are you reporting this?</Label>
            <RadioGroup
              value={reason}
              onValueChange={(value) => setReason(value as DoodleReportReason)}
              className="space-y-2"
            >
              {(Object.keys(REPORT_REASONS) as DoodleReportReason[]).map((key) => (
                <div
                  key={key}
                  className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setReason(key)}
                >
                  <RadioGroupItem value={key} id={key} className="mt-0.5" />
                  <Label htmlFor={key} className="flex-1 cursor-pointer">
                    <span className="font-medium">{REPORT_REASONS[key].label}</span>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {REPORT_REASONS[key].description}
                    </p>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details" className="text-sm font-medium">
              Additional details (optional)
            </Label>
            <Textarea
              id="details"
              placeholder="Provide any additional context that might help us review this report..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {details.length}/500
            </p>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              False reports may result in action against your account. Please only report
              content that violates our community guidelines.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
