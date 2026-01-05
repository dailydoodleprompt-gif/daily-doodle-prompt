import { useState, useMemo, useEffect } from 'react';
import { useAppStore, useUser, useIsAdmin, usePreferences } from '@/store/app-store';
import { type Doodle } from '@/types';
import { LikeButton } from '@/components/LikeButton';
import { DoodleImage } from '@/components/DoodleImage';
import { BlurredDoodle } from '@/components/BlurredDoodle';
import { ShareButton } from '@/components/ShareButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  MoreVertical,
  Eye,
  EyeOff,
  Trash2,
  Image as ImageIcon,
  User,
  Shield,
  Flag,
} from 'lucide-react';
import { ReportDoodleDialog } from '@/components/ReportDoodleDialog';
import { FollowButton } from '@/components/FollowButton';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DoodleGalleryProps {
  doodles: Doodle[];
  showActions?: boolean;
  showUserCredit?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
  className?: string;
  onUserClick?: (userId: string) => void;
  onPromptClick?: (promptId: string) => void;
  onDoodleDeleted?: () => void;
  onAuthRequired?: () => void;
}

export function DoodleGallery({
  doodles,
  showActions = false,
  showUserCredit = true,
  emptyMessage = 'No doodles yet',
  columns = 3,
  className,
  onUserClick,
  onPromptClick,
  onDoodleDeleted,
  onAuthRequired,
}: DoodleGalleryProps) {
  const [selectedDoodle, setSelectedDoodle] = useState<Doodle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doodleToDelete, setDoodleToDelete] = useState<{ id: string; isAdmin: boolean } | null>(null);
  const [localDoodles, setLocalDoodles] = useState<Doodle[]>(doodles);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [doodleToReport, setDoodleToReport] = useState<string | null>(null);

  const user = useUser();
  const isAdmin = useIsAdmin();
  const preferences = usePreferences();
  const deleteDoodle = useAppStore((state) => state.deleteDoodle);
  const toggleDoodleVisibility = useAppStore((state) => state.toggleDoodleVisibility);

  // Track which doodles have been revealed (when blur is enabled)
  const [revealedDoodles, setRevealedDoodles] = useState<Set<string>>(new Set());

  const handleRevealDoodle = (doodleId: string) => {
    setRevealedDoodles(prev => new Set(prev).add(doodleId));
  };

  // Sync local doodles with props
  useEffect(() => {
    setLocalDoodles(doodles);
  }, [doodles]);

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  };

  if (doodles.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  const openDeleteDialog = (doodleId: string, asAdmin: boolean) => {
    setDoodleToDelete({ id: doodleId, isAdmin: asAdmin });
    setDeleteDialogOpen(true);
  };

  const openReportDialog = (doodleId: string) => {
    if (!user) {
      onAuthRequired?.();
      return;
    }
    setDoodleToReport(doodleId);
    setReportDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!doodleToDelete) return;

    try {
      // Use regular delete for both owner and admin
      deleteDoodle(doodleToDelete.id);
      toast.success(doodleToDelete.isAdmin ? 'Doodle deleted by admin' : 'Doodle deleted successfully');

      // Remove from local state for immediate UI update
      setLocalDoodles(prev => prev.filter(d => d.id !== doodleToDelete.id));

      // Close dialog if the deleted doodle was selected
      if (selectedDoodle?.id === doodleToDelete.id) {
        setSelectedDoodle(null);
      }

      onDoodleDeleted?.();
    } catch (error) {
      toast.error('Failed to delete doodle');
    } finally {
      setDeleteDialogOpen(false);
      setDoodleToDelete(null);
    }
  };

  const handleUserClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onUserClick?.(userId);
  };

  const handlePromptClick = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    onPromptClick?.(promptId);
  };

  return (
    <>
      <div className={cn('grid gap-4', columnClasses[columns], className)}>
        {doodles.map((doodle) => {
          const isOwn = doodle.user_id === user?.id;
          const shouldBlur = preferences?.blur_doodles && !isOwn && !revealedDoodles.has(doodle.id);

          return (
            <Card
              key={doodle.id}
              className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                // If blurred, reveal it first; otherwise open detail dialog
                if (shouldBlur) {
                  handleRevealDoodle(doodle.id);
                } else {
                  setSelectedDoodle(doodle);
                }
              }}
            >
              <div className="relative aspect-square bg-muted flex items-center justify-center">
                {shouldBlur ? (
                  <BlurredDoodle
                    imageUrl={doodle.image_url}
                    alt={doodle.caption || doodle.prompt_title}
                    className="w-full h-full"
                    isBlurred={true}
                    onReveal={() => handleRevealDoodle(doodle.id)}
                  />
                ) : (
                  <DoodleImage
                    src={doodle.image_url}
                    alt={doodle.caption || doodle.prompt_title}
                    className="w-full h-full"
                  />
                )}

                {/* Visibility Badge */}
                {isOwn && !doodle.is_public && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 left-2 gap-1"
                  >
                    <EyeOff className="h-3 w-3" />
                    Private
                  </Badge>
                )}

                {/* Actions Menu - Show for owner, admin, or any logged-in user (report) */}
                {(showActions && isOwn) || (isAdmin && doodle.is_public) || (!isOwn && user && doodle.is_public) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Owner actions */}
                      {isOwn && (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDoodleVisibility(doodle.id);
                            }}
                          >
                            {doodle.is_public ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Make Private
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Make Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(doodle.id, false);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {/* Admin actions */}
                      {isAdmin && !isOwn && (
                        <>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(doodle.id, true);
                            }}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Admin Delete
                          </DropdownMenuItem>
                        </>
                      )}
                      {/* Report option for non-owners */}
                      {!isOwn && user && (
                        <>
                          {(isOwn || isAdmin) && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              openReportDialog(doodle.id);
                            }}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}

                {/* Overlay with caption and likes */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => handlePromptClick(e, doodle.prompt_id)}
                      className={cn(
                        "text-white text-sm font-medium truncate flex-1 mr-2 text-left",
                        onPromptClick && "hover:underline cursor-pointer"
                      )}
                    >
                      {doodle.prompt_title}
                    </button>
                    <LikeButton
                      doodleId={doodle.id}
                      likesCount={doodle.likes_count}
                      isOwnDoodle={isOwn}
                      size="sm"
                      className="text-white hover:text-white"
                      onAuthRequired={onAuthRequired}
                    />
                  </div>

                  {/* User credit using embedded username */}
                  {showUserCredit && doodle.user_username && doodle.is_public && (
                    <button
                      type="button"
                      onClick={(e) => handleUserClick(e, doodle.user_id)}
                      className={cn(
                        "flex items-center gap-1.5 mt-2 text-white/80 text-xs",
                        onUserClick && "hover:text-white cursor-pointer"
                      )}
                    >
                      <User className="h-3 w-3" />
                      <span className={cn(onUserClick && "hover:underline")}>
                        {doodle.user_username}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDoodle} onOpenChange={() => setSelectedDoodle(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              <button
                type="button"
                onClick={(e) => {
                  if (selectedDoodle && onPromptClick) {
                    handlePromptClick(e, selectedDoodle.prompt_id);
                    setSelectedDoodle(null);
                  }
                }}
                className={cn(
                  onPromptClick && "hover:underline cursor-pointer hover:text-primary"
                )}
              >
                {selectedDoodle?.prompt_title}
              </button>
            </DialogTitle>
            <DialogDescription className="sr-only">
              Detailed view of doodle for {selectedDoodle?.prompt_title}
            </DialogDescription>
          </DialogHeader>

          {selectedDoodle && (
            <div className="space-y-4">
              <div className="flex items-center justify-center rounded-lg overflow-hidden">
                <DoodleImage
                  src={selectedDoodle.image_url}
                  alt={selectedDoodle.caption || selectedDoodle.prompt_title}
                  className="max-h-[80vh] rounded-lg"
                  aspectRatio="auto"
                />
              </div>

              {/* User credit in detail view using embedded username */}
              {selectedDoodle.user_username && (selectedDoodle.is_public || selectedDoodle.user_id === user?.id) && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <button
                    type="button"
                    onClick={(e) => {
                      if (onUserClick) {
                        handleUserClick(e, selectedDoodle.user_id);
                        setSelectedDoodle(null);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2",
                      onUserClick && "cursor-pointer"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {selectedDoodle.user_username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className={cn(
                      "font-medium",
                      onUserClick && "hover:underline hover:text-primary"
                    )}>
                      {selectedDoodle.user_username}
                    </span>
                  </button>
                  {/* Follow button - only show for other users' public doodles */}
                  {selectedDoodle.user_id !== user?.id && selectedDoodle.is_public && (
                    <FollowButton
                      userId={selectedDoodle.user_id}
                      username={selectedDoodle.user_username}
                      size="sm"
                      onAuthRequired={onAuthRequired}
                    />
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LikeButton
                    doodleId={selectedDoodle.id}
                    likesCount={selectedDoodle.likes_count}
                    isOwnDoodle={selectedDoodle.user_id === user?.id}
                    onAuthRequired={onAuthRequired}
                  />
                  <ShareButton
                    type="doodle"
                    doodleId={selectedDoodle.id}
                    promptTitle={selectedDoodle.prompt_title}
                    artistName={selectedDoodle.user_username}
                    variant="outline"
                    size="sm"
                  />
                  {!selectedDoodle.is_public && (
                    <Badge variant="secondary" className="gap-1">
                      <EyeOff className="h-3 w-3" />
                      Private
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Report button for non-owners */}
                  {selectedDoodle.user_id !== user?.id && user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReportDialog(selectedDoodle.id)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Report
                    </Button>
                  )}
                  {/* Delete button in detail view for owner or admin */}
                  {(selectedDoodle.user_id === user?.id || isAdmin) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(
                        selectedDoodle.id,
                        selectedDoodle.user_id !== user?.id && isAdmin
                      )}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedDoodle.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {doodleToDelete?.isAdmin ? 'Admin Delete Doodle' : 'Delete Doodle'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {doodleToDelete?.isAdmin
                ? 'You are about to permanently delete this doodle as an admin. This action cannot be undone and will remove the doodle from all feeds and galleries.'
                : 'Are you sure you want to delete this doodle? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <ReportDoodleDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
        doodleId={doodleToReport || ''}
        onReportSubmitted={() => {
          setDoodleToReport(null);
        }}
      />
    </>
  );
}
