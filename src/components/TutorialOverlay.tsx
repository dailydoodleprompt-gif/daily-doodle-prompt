import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TutorialStep {
  id: string;
  targetSelector: string; // CSS selector for the element to highlight
  mobileTargetSelector?: string; // Optional different selector for mobile
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  mobilePosition?: 'top' | 'bottom' | 'left' | 'right';
  // Optional: navigate to a specific view before showing this step
  requiresView?: string;
  // Optional: action to trigger (like opening mobile menu)
  beforeShow?: () => void;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  isActive: boolean;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function TutorialOverlay({
  steps,
  isActive,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
  currentView,
  onNavigate,
}: TutorialOverlayProps) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Get the target element and update position
  const updateTargetPosition = useCallback(() => {
    if (!step || !isActive) return;

    const selector = isMobile && step.mobileTargetSelector
      ? step.mobileTargetSelector
      : step.targetSelector;

    const targetElement = document.querySelector(selector);

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [step, isActive, isMobile]);

  // Calculate tooltip position based on target and preferred position
  useEffect(() => {
    if (!targetRect || !tooltipRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const position = isMobile && step?.mobilePosition ? step.mobilePosition : step?.position || 'bottom';
    const padding = 12;
    const arrowSize = 8;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - padding - arrowSize;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + padding + arrowSize;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - padding - arrowSize;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + padding + arrowSize;
        break;
    }

    // Keep tooltip within viewport
    const viewportPadding = 16;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));

    setTooltipPosition({ top, left });
  }, [targetRect, step, isMobile]);

  // Update position on scroll, resize, and when step changes
  useEffect(() => {
    if (!isActive) return;

    // Run beforeShow if defined
    if (step?.beforeShow) {
      step.beforeShow();
    }

    // Small delay to allow DOM to update after beforeShow
    const timer = setTimeout(updateTargetPosition, 100);

    window.addEventListener('scroll', updateTargetPosition, true);
    window.addEventListener('resize', updateTargetPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updateTargetPosition, true);
      window.removeEventListener('resize', updateTargetPosition);
    };
  }, [isActive, currentStep, updateTargetPosition, step]);

  // Navigate to required view if needed
  useEffect(() => {
    if (!isActive || !step?.requiresView) return;

    if (currentView !== step.requiresView) {
      onNavigate(step.requiresView);
    }
  }, [isActive, step, currentView, onNavigate]);

  if (!isActive || !step) return null;

  const position = isMobile && step.mobilePosition ? step.mobilePosition : step.position;

  // Arrow positioning classes based on tooltip position relative to target
  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45';
      case 'bottom':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45';
      case 'left':
        return 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 rotate-45';
      case 'right':
        return 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45';
      default:
        return '';
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* Backdrop with cutout for target element */}
      <div className="absolute inset-0">
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />

        {/* Spotlight cutout for target element */}
        {targetRect && (
          <div
            className="absolute bg-transparent rounded-lg ring-4 ring-primary ring-offset-4 ring-offset-transparent transition-all duration-300"
            style={{
              top: targetRect.top - 4,
              left: targetRect.left - 4,
              width: targetRect.width + 8,
              height: targetRect.height + 8,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[101] w-80 max-w-[calc(100vw-32px)] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 transition-all duration-300",
          !targetRect && "opacity-0"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Arrow */}
        <div
          className={cn(
            "absolute w-3 h-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800",
            position === 'top' && "border-r border-b",
            position === 'bottom' && "border-l border-t",
            position === 'left' && "border-t border-r",
            position === 'right' && "border-b border-l",
            getArrowClasses()
          )}
        />

        {/* Content */}
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-base">
              {step.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mr-1 -mt-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              onClick={onSkip}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            {step.content}
          </p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-zinc-300 dark:bg-zinc-700"
                )}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevious}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={isLastStep ? onComplete : onNext}
              className="flex-1"
            >
              {isLastStep ? "Got it!" : "Next"}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Skip link */}
          <button
            onClick={onSkip}
            className="w-full mt-3 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
