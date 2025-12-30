import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PartyPopper } from 'lucide-react';

interface DoodleUploadSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  promptTitle: string;
}

export function DoodleUploadSuccessDialog({
  open,
  onOpenChange,
  imageUrl,
  promptTitle,
}: DoodleUploadSuccessDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <PartyPopper className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Doodle Uploaded!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your artwork has been shared with the community
          </DialogDescription>
        </DialogHeader>

        {/* Doodle Preview */}
        {imageUrl && (
          <div className="flex justify-center my-4">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
              <img
                src={imageUrl}
                alt={promptTitle}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Prompt Title */}
        <p className="text-center text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{promptTitle}</span>
        </p>

        {/* Close Button */}
        <div className="mt-4">
          <Button
            variant="default"
            onClick={handleClose}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
