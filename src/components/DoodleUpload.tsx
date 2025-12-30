import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore, useIsPremium, useIsAuthenticated } from '@/store/app-store';
import { Upload, Image, AlertCircle, Lock, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface DoodleUploadProps {
  promptId: string;
  promptTitle: string;
  onUploadSuccess?: (data: { imageUrl: string; promptTitle: string }) => void;
  onAuthRequired?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export function DoodleUpload({ promptId, promptTitle, onUploadSuccess, onAuthRequired }: DoodleUploadProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthenticated = useIsAuthenticated();
  const isPremium = useIsPremium();
  const uploadDoodle = useAppStore((state) => state.uploadDoodle);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a JPG or PNG image only.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB.');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !preview) return;

    setIsUploading(true);
    setError(null);

    try {
      // Caption is always the prompt title (not customizable)
      const result = await uploadDoodle(
        promptId,
        promptTitle,
        preview,
        promptTitle, // Caption is always the prompt title
        isPublic
      );

      if (result.success) {
        const imageUrlToUse = result.imageUrl || preview || '';
        setOpen(false);
        resetForm();
        // Pass data to parent to show success dialog
        onUploadSuccess?.({ imageUrl: imageUrlToUse, promptTitle });
      } else {
        setError(result.error || 'Failed to upload doodle. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setIsPublic(true);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  // Not authenticated - prompt to sign in
  if (!isAuthenticated) {
    const handleSignInPrompt = () => {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast.info('Sign in Required', {
          description: 'Create a free account to upload doodles.',
        });
      }
    };

    return (
      <Button variant="outline" onClick={handleSignInPrompt} className="gap-2">
        <Upload className="h-4 w-4" />
        Upload Doodle
      </Button>
    );
  }

  // Not premium - show upgrade prompt on click (no auto-display tooltip)
  if (!isPremium) {
    const handlePremiumPrompt = () => {
      toast('Premium Feature', {
        description: 'Unlock lifetime access to upload doodles and share your artwork with the community.',
        icon: <Crown className="h-4 w-4 text-amber-500" />,
      });
    };

    return (
      <Button
        variant="outline"
        onClick={handlePremiumPrompt}
        className="gap-2"
      >
        <Lock className="h-4 w-4" />
        <Crown className="h-3 w-3 text-amber-500" />
        Upload Doodle
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Doodle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Your Doodle</DialogTitle>
          <DialogDescription>
            Share your artwork for &quot;{promptTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="doodle-file">Select Image</Label>
            <Input
              id="doodle-file"
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPG, PNG (max 5MB)
            </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-lg overflow-hidden border bg-muted">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Caption Info (Read-only - prompt title) */}
          <div className="space-y-2">
            <Label>Caption</Label>
            <div className="p-3 rounded-md border bg-muted/50">
              <p className="text-sm text-foreground">{promptTitle}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Caption is automatically set to the prompt title
            </p>
          </div>

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="public-toggle" className="text-base">
                Public Doodle
              </Label>
              <p className="text-sm text-muted-foreground">
                {isPublic
                  ? 'Visible on prompt page and your profile'
                  : 'Only visible to you'}
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {/* Safety Notice */}
          <p className="text-xs text-muted-foreground">
            By uploading, you confirm your doodle follows our community guidelines.
            Content containing inappropriate material will be blocked.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Image className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
