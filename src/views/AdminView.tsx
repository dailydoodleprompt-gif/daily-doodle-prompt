import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useAppStore, useUser } from '@/store/app-store';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  TrendingUp,
  Crown,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield,
  Calendar,
  MoreHorizontal,
  Trash2,
  Key,
  Edit,
  ShieldCheck,
  ShieldOff,
  Settings,
  Tag,
  Image,
  Flag,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { type DoodleReport, type DoodleReportStatus, REPORT_REASONS } from '@/types';
import { supabase } from '@/sdk/core/supabase';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const updateUsernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type UpdateUsernameFormData = z.infer<typeof updateUsernameSchema>;

interface AdminViewProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

interface UserToManage {
  id: string;
  username: string;
  email: string;
  is_premium: boolean;
  is_admin?: boolean;
  created_at: string;
}

export function AdminView({ onBack }: AdminViewProps) {
  const currentUser = useUser();
  const getAppSettings = useAppStore((state) => state.getAppSettings);
  const updateAppSettings = useAppStore((state) => state.updateAppSettings);
  const getDoodles = useAppStore((state) => state.getDoodles);
  const deleteDoodle = useAppStore((state) => state.deleteDoodle);
  const getDoodleReports = useAppStore((state) => state.getDoodleReports);
  const updateReportStatus = useAppStore((state) => state.updateReportStatus);

  const [users, setUsers] = useState<UserToManage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [updateUsernameDialogOpen, setUpdateUsernameDialogOpen] = useState(false);
  const [deleteDoodleDialogOpen, setDeleteDoodleDialogOpen] = useState(false);
  const [editDoodleDialogOpen, setEditDoodleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserToManage | null>(null);
  const [selectedDoodleId, setSelectedDoodleId] = useState<string | null>(null);
  const [selectedDoodle, setSelectedDoodle] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Edit doodle form state
  const [editDoodleCaption, setEditDoodleCaption] = useState('');
  const [editDoodleCreatedAt, setEditDoodleCreatedAt] = useState('');
  const [editDoodlePromptTitle, setEditDoodlePromptTitle] = useState('');
  const [editDoodlePromptId, setEditDoodlePromptId] = useState('');
  const [editDoodleIsPublic, setEditDoodleIsPublic] = useState(true);

  // Report review states
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DoodleReport | null>(null);
  const [reportFilter, setReportFilter] = useState<'pending' | 'all'>('pending');

  // Force refresh key for doodles grid
  const [doodlesRefreshKey, setDoodlesRefreshKey] = useState(0);

  const resetPasswordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const updateUsernameForm = useForm<UpdateUsernameFormData>({
    resolver: zodResolver(updateUsernameSchema),
    defaultValues: {
      username: '',
    },
  });

  // Fetch all users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setUsers(data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.is_admin) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(selectedUser.id);
      if (deleteError) throw deleteError;

      setSuccessMessage(`User "${selectedUser.username}" has been deleted.`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePremium = async (targetUser: UserToManage) => {
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_premium: !targetUser.is_premium })
        .eq('id', targetUser.id);

      if (updateError) throw updateError;

      setSuccessMessage(`${targetUser.username}'s premium status has been ${targetUser.is_premium ? 'removed' : 'granted'}.`);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle premium status');
    }
  };

  const handleToggleAdmin = async (targetUser: UserToManage) => {
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: !targetUser.is_admin })
        .eq('id', targetUser.id);

      if (updateError) throw updateError;

      setSuccessMessage(`${targetUser.username}'s admin status has been ${targetUser.is_admin ? 'removed' : 'granted'}.`);
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle admin status');
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!selectedUser) return;

    setActionLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        selectedUser.id,
        { password: data.newPassword }
      );

      if (updateError) throw updateError;

      setSuccessMessage(`Password for "${selectedUser.username}" has been reset.`);
      setResetPasswordDialogOpen(false);
      setSelectedUser(null);
      resetPasswordForm.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUsername = async (data: UpdateUsernameFormData) => {
    if (!selectedUser) return;

    setActionLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: data.username })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;

      // Update username on all user's existing doodles
      const { error: doodlesError } = await supabase
        .from('doodles')
        .update({ user_username: data.username })
        .eq('user_id', selectedUser.id);

      if (doodlesError) {
        console.warn('Failed to update username on doodles:', doodlesError);
      }

      setSuccessMessage(`Username changed from "${selectedUser.username}" to "${data.username}".`);
      setUpdateUsernameDialogOpen(false);
      setSelectedUser(null);
      updateUsernameForm.reset();
      fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    } finally {
      setActionLoading(false);
    }
  };

  const openResetPasswordDialog = (targetUser: UserToManage) => {
    setSelectedUser(targetUser);
    resetPasswordForm.reset();
    setResetPasswordDialogOpen(true);
  };

  const openUpdateUsernameDialog = (targetUser: UserToManage) => {
    setSelectedUser(targetUser);
    updateUsernameForm.reset({ username: targetUser.username });
    setUpdateUsernameDialogOpen(true);
  };

  const openDeleteDialog = (targetUser: UserToManage) => {
    setSelectedUser(targetUser);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDoodle = async () => {
    if (!selectedDoodleId) return;

    setActionLoading(true);
    setError(null);

    try {
      deleteDoodle(selectedDoodleId);
      setSuccessMessage('Doodle has been deleted successfully.');
      setDeleteDoodleDialogOpen(false);
      setSelectedDoodleId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete doodle');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditDoodleDialog = (doodle: any) => {
    setSelectedDoodle(doodle);
    setEditDoodleCaption(doodle.caption || '');
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const date = new Date(doodle.created_at);
    setEditDoodleCreatedAt(date.toISOString().slice(0, 16));
    setEditDoodlePromptTitle(doodle.prompt_title || '');
    setEditDoodlePromptId(doodle.prompt_id || '');
    setEditDoodleIsPublic(doodle.is_public);
    setEditDoodleDialogOpen(true);
  };

  const handleSaveEditDoodle = async () => {
    if (!selectedDoodle) return;

    setActionLoading(true);
    setError(null);

    const newCreatedAt = new Date(editDoodleCreatedAt).toISOString();

    console.log('[AdminEdit] Saving doodle:', selectedDoodle.id);
    console.log('[AdminEdit] Old created_at:', selectedDoodle.created_at);
    console.log('[AdminEdit] New created_at:', newCreatedAt);

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('doodles')
        .update({
          caption: editDoodleCaption,
          created_at: newCreatedAt,
          prompt_title: editDoodlePromptTitle,
          prompt_id: editDoodlePromptId,
          is_public: editDoodleIsPublic,
        })
        .eq('id', selectedDoodle.id)
        .select()
        .single();

      console.log('[AdminEdit] Update result:', updatedData, updateError);

      if (updateError) throw updateError;

      // Update localStorage cache to reflect the change immediately
      const DOODLES_STORAGE_KEY = 'dailydoodle_doodles';
      try {
        const storedDoodles = localStorage.getItem(DOODLES_STORAGE_KEY);
        if (storedDoodles) {
          const doodles = JSON.parse(storedDoodles);
          const doodleIndex = doodles.findIndex((d: any) => d.id === selectedDoodle.id);
          if (doodleIndex !== -1) {
            doodles[doodleIndex] = {
              ...doodles[doodleIndex],
              caption: editDoodleCaption,
              created_at: newCreatedAt,
              prompt_title: editDoodlePromptTitle,
              prompt_id: editDoodlePromptId,
              is_public: editDoodleIsPublic,
            };
            localStorage.setItem(DOODLES_STORAGE_KEY, JSON.stringify(doodles));
            console.log('[AdminEdit] ✅ localStorage cache updated');
          }
        }
      } catch (cacheErr) {
        console.warn('[AdminEdit] Failed to update localStorage cache:', cacheErr);
      }

      // Force refresh the doodles grid
      setDoodlesRefreshKey(k => k + 1);

      setSuccessMessage('Doodle updated successfully.');
      setEditDoodleDialogOpen(false);
      setSelectedDoodle(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update doodle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTags = (enabled: boolean) => {
    updateAppSettings({ tags_enabled: enabled });
    setSuccessMessage(`Tags have been ${enabled ? 'enabled' : 'disabled'} globally.`);
  };

  // Report handling functions
  const handleReviewReport = (report: DoodleReport) => {
    setSelectedReport(report);
    setReviewDialogOpen(true);
  };

  const handleDismissReport = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      await updateReportStatus(selectedReport.id, 'dismissed', 'Report dismissed - no action taken');
      setSuccessMessage('Report has been dismissed.');
      setReviewDialogOpen(false);
      setSelectedReport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActionReport = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      // Delete the reported doodle
      deleteDoodle(selectedReport.doodle_id);
      // Mark report as actioned
      await updateReportStatus(selectedReport.id, 'actioned', 'Content removed');
      setSuccessMessage('Doodle has been removed and report marked as actioned.');
      setReviewDialogOpen(false);
      setSelectedReport(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to action report');
    } finally {
      setActionLoading(false);
    }
  };

  // Get reports based on filter
  const reports = reportFilter === 'pending'
    ? getDoodleReports('pending')
    : getDoodleReports();

  const pendingReportsCount = getDoodleReports('pending').length;

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Check if user is admin
  if (!currentUser?.is_admin) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Admin Access</h1>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  // Calculate stats
  const stats = {
    totalUsers: users.length,
    newUsersThisWeek: users.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.created_at) > weekAgo;
    }).length,
    premiumUsers: users.filter(u => u.is_premium).length,
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage users and view statistics
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 border-green-200 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-800 dark:text-green-200">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Signed up in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* App Settings */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Settings
          </CardTitle>
          <CardDescription>
            Configure global app settings and features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <Label className="text-base font-medium">Tags System</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, tags and categories are visible and clickable on prompt pages
              </p>
            </div>
            <Switch
              checked={getAppSettings().tags_enabled}
              onCheckedChange={handleToggleTags}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Reports */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Flag className="h-5 w-5" />
                Content Reports
                {pendingReportsCount > 0 && (
                  <Badge variant="destructive">{pendingReportsCount}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Review and manage reported doodles
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={reportFilter === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReportFilter('pending')}
              >
                Pending
              </Button>
              <Button
                variant={reportFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setReportFilter('all')}
              >
                All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {reportFilter === 'pending' ? 'No pending reports' : 'No reports found'}
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-start gap-4 p-4 rounded-lg border"
                >
                  {/* Doodle preview */}
                  {report.doodle && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={report.doodle.image_url}
                        alt="Reported doodle"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Report details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={report.status === 'pending' ? 'destructive' : 'secondary'}>
                        {report.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {REPORT_REASONS[report.reason]?.label || report.reason}
                      </span>
                    </div>
                    {report.details && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {report.details}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Reported by: {report.reporter_username || 'Unknown'}
                      </span>
                      <span>
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                      {report.doodle && (
                        <span>
                          Creator: {report.doodle.user_username || 'Unknown'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReviewReport(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Doodles Management */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Uploaded Doodles
          </CardTitle>
          <CardDescription>
            Manage all user-uploaded doodles - delete inappropriate content
          </CardDescription>
        </CardHeader>
        <CardContent key={doodlesRefreshKey}>
          {(() => {
            const allDoodles = getDoodles();
            if (allDoodles.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  No doodles uploaded yet
                </div>
              );
            }
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allDoodles.slice(0, 12).map((doodle) => {
                  const owner = users.find(u => u.id === doodle.user_id);
                  return (
                    <div key={doodle.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={doodle.image_url}
                          alt={doodle.prompt_title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-lg">
                        <p className="text-white text-xs text-center px-2 truncate w-full">
                          {owner?.username || 'Unknown'}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => openEditDoodleDialog(doodle)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedDoodleId(doodle.id);
                              setDeleteDoodleDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          {getDoodles().length > 12 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Showing 12 of {getDoodles().length} doodles
            </p>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Members</CardTitle>
          <CardDescription>
            View and manage all registered users - full admin controls available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users registered yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {u.username}
                          {u.is_admin && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Shield className="w-3 h-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        {u.is_premium ? (
                          <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white gap-1">
                            <Crown className="w-3 h-3" />
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openUpdateUsernameDialog(u)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Change Username
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openResetPasswordDialog(u)}>
                              <Key className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleTogglePremium(u)}>
                              <Crown className="mr-2 h-4 w-4" />
                              {u.is_premium ? 'Remove Premium' : 'Grant Premium'}
                            </DropdownMenuItem>
                            {u.id !== currentUser.id && (
                              <DropdownMenuItem onClick={() => handleToggleAdmin(u)}>
                                {u.is_admin ? (
                                  <>
                                    <ShieldOff className="mr-2 h-4 w-4" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Make Admin
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {u.id !== currentUser.id && (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => openDeleteDialog(u)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the account for <strong>{selectedUser?.username}</strong> ({selectedUser?.email})?
              This action cannot be undone and will permanently remove all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset User Password</DialogTitle>
            <DialogDescription>
              Set a new password for <strong>{selectedUser?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  {...resetPasswordForm.register('newPassword')}
                  disabled={actionLoading}
                />
                {resetPasswordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {resetPasswordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm new password"
                  {...resetPasswordForm.register('confirmPassword')}
                  disabled={actionLoading}
                />
                {resetPasswordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {resetPasswordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResetPasswordDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Username Dialog */}
      <Dialog open={updateUsernameDialogOpen} onOpenChange={setUpdateUsernameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Username</DialogTitle>
            <DialogDescription>
              Update the username for <strong>{selectedUser?.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateUsernameForm.handleSubmit(handleUpdateUsername)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">New Username</Label>
                <Input
                  id="new-username"
                  type="text"
                  placeholder="Enter new username"
                  {...updateUsernameForm.register('username')}
                  disabled={actionLoading}
                />
                {updateUsernameForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {updateUsernameForm.formState.errors.username.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  3-20 characters, letters, numbers, and underscores only
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUpdateUsernameDialogOpen(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={actionLoading}>
                {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Username
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Doodle Confirmation Dialog */}
      <AlertDialog open={deleteDoodleDialogOpen} onOpenChange={setDeleteDoodleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doodle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this doodle? This action cannot be undone and will remove the doodle from all feeds and galleries.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDoodle}
              disabled={actionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Doodle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Doodle Dialog */}
      <Dialog open={editDoodleDialogOpen} onOpenChange={setEditDoodleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Doodle
            </DialogTitle>
            <DialogDescription>
              Update doodle metadata. Changes to date will affect where it appears in feeds.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Preview */}
            {selectedDoodle && (
              <div className="rounded-lg overflow-hidden bg-muted max-h-40 flex items-center justify-center">
                <img
                  src={selectedDoodle.image_url}
                  alt="Doodle preview"
                  className="max-h-40 object-contain"
                />
              </div>
            )}

            {/* Upload Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-created-at">Upload Date & Time</Label>
              <Input
                id="edit-created-at"
                type="datetime-local"
                value={editDoodleCreatedAt}
                onChange={(e) => setEditDoodleCreatedAt(e.target.value)}
                disabled={actionLoading}
              />
              <p className="text-xs text-muted-foreground">
                Changing this date will backdate the doodle to appear on older prompts
              </p>
            </div>

            {/* Prompt ID */}
            <div className="space-y-2">
              <Label htmlFor="edit-prompt-id">Prompt ID (Date)</Label>
              <Input
                id="edit-prompt-id"
                type="text"
                placeholder="YYYY-MM-DD"
                value={editDoodlePromptId}
                onChange={(e) => setEditDoodlePromptId(e.target.value)}
                disabled={actionLoading}
              />
              <p className="text-xs text-muted-foreground">
                Format: YYYY-MM-DD (e.g., 2026-01-01)
              </p>
            </div>

            {/* Prompt Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-prompt-title">Prompt Title</Label>
              <Input
                id="edit-prompt-title"
                type="text"
                placeholder="Enter prompt title"
                value={editDoodlePromptTitle}
                onChange={(e) => setEditDoodlePromptTitle(e.target.value)}
                disabled={actionLoading}
              />
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="edit-caption">Caption</Label>
              <Input
                id="edit-caption"
                type="text"
                placeholder="Enter caption (optional)"
                value={editDoodleCaption}
                onChange={(e) => setEditDoodleCaption(e.target.value)}
                disabled={actionLoading}
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label>Public</Label>
                <p className="text-xs text-muted-foreground">
                  Visible to other users
                </p>
              </div>
              <Switch
                checked={editDoodleIsPublic}
                onCheckedChange={setEditDoodleIsPublic}
                disabled={actionLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDoodleDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEditDoodle} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Report Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Review Report
            </DialogTitle>
            <DialogDescription>
              Review this reported content and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-4 py-4">
              {/* Reported doodle preview */}
              {selectedReport.doodle && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={selectedReport.doodle.image_url}
                    alt="Reported doodle"
                    className="w-full max-h-64 object-contain"
                  />
                </div>
              )}

              {/* Report details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Reason:</span>
                  <Badge>{REPORT_REASONS[selectedReport.reason]?.label || selectedReport.reason}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {REPORT_REASONS[selectedReport.reason]?.description}
                </p>
              </div>

              {selectedReport.details && (
                <div className="space-y-1">
                  <span className="font-medium text-sm">Reporter's notes:</span>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {selectedReport.details}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Reporter:</span>
                  <p className="font-medium">{selectedReport.reporter_username || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Creator:</span>
                  <p className="font-medium">{selectedReport.doodle?.user_username || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reported:</span>
                  <p className="font-medium">{new Date(selectedReport.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Prompt:</span>
                  <p className="font-medium truncate">{selectedReport.doodle?.prompt_title || 'Unknown'}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={handleDismissReport}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Dismiss Report
            </Button>
            <Button
              variant="destructive"
              onClick={handleActionReport}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Doodle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}