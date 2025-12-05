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
import { Progress } from '@/components/ui/progress';
import { ONBOARDING_SLIDES } from '@/types';
import { useAppStore } from '@/store/app-store';
import { Pencil, Lightbulb, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react';

const slideIcons = [Pencil, Lightbulb, TrendingUp];

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const slide = ONBOARDING_SLIDES[currentSlide];
  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1;
  const isFirstSlide = currentSlide === 0;
  const progress = ((currentSlide + 1) / ONBOARDING_SLIDES.length) * 100;

  const handleNext = () => {
    if (isLastSlide) {
      completeOnboarding();
      onOpenChange(false);
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    completeOnboarding();
    onOpenChange(false);
  };

  const Icon = slideIcons[currentSlide];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl">{slide.title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {slide.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground mt-2">
            {currentSlide + 1} of {ONBOARDING_SLIDES.length}
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <div className="flex gap-2 w-full">
            {!isFirstSlide && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {isLastSlide ? "Let's Go!" : 'Next'}
              {!isLastSlide && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full text-muted-foreground"
          >
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
