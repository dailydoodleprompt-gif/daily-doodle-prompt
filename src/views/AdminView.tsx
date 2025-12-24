// @ts-nocheck
import { useState, useEffect } from 'react';
// ... rest of file
import { useState } from 'react';
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
} from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

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

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;
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
}

export function AdminView({ onBack }: AdminViewProps) {
  const user = useUser();
  const login = useAppStore((state) => state.login);
  const getAllUsers = useAppStore((state) => state.getAllUsers);
  const getAdminStats = useAppStore((state) => state.getAdminStats);
  const deleteUser = useAppStore((state) => state.deleteUser);
  const toggleUserPremium = useAppStore((state) => state.toggleUserPremium);
  const toggleUserAdmin = useAppStore((state) => state.toggleUserAdmin);
  const resetUserPassword = useAppStore((state) => state.resetUserPassword);
  const adminUpdateUsername = useAppStore((state) => state.adminUpdateUsername);
  const adminDeleteDoodle = useAppStore((state) => state.adminDeleteDoodle);
  const getAppSettings = useAppStore((state) => state.getAppSettings);
  const updateAppSettings = useAppStore((state) => state.updateAppSettings);
  const getDoodles = useAppStore((state) => state.getDoodles);
  const getUserById = useAppStore((state) => state.getUserById);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [updateUsernameDialogOpen, setUpdateUsernameDialogOpen] = useState(false);
  const [deleteDoodleDialogOpen, setDeleteDoodleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserToManage | null>(null);
  const [selectedDoodleId, setSelectedDoodleId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Force re-render key for user list
  const [refreshKey, setRefreshKey] = useState(0);

  const loginForm = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

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

  const handleLogin = async (data: AdminLoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      // Check if logged in user is admin
      const currentUser = useAppStore.getState().user;
      if (!currentUser?.is_admin) {
        setError('Access denied. Admin privileges required.');
        useAppStore.getState().logout();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    setError(null);

    try {
      await deleteUser(selectedUser.id);
      setSuccessMessage(`User "${selectedUser.username}" has been deleted.`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePremium = async (targetUser: UserToManage) => {
    setError(null);

    try {
      await toggleUserPremium(targetUser.id);
      setSuccessMessage(`${targetUser.username}'s premium status has been ${targetUser.is_premium ? 'removed' : 'granted'}.`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle premium status');
    }
  };

  const handleToggleAdmin = async (targetUser: UserToManage) => {
    setError(null);

    try {
      await toggleUserAdmin(targetUser.id);
      setSuccessMessage(`${targetUser.username}'s admin status has been ${targetUser.is_admin ? 'removed' : 'granted'}.`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle admin status');
    }
  };

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    if (!selectedUser) return;

    setActionLoading(true);
    setError(null);

    try {
      await resetUserPassword(selectedUser.id, data.newPassword);
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
      await adminUpdateUsername(selectedUser.id, data.username);
      setSuccessMessage(`Username changed from "${selectedUser.username}" to "${data.username}".`);
      setUpdateUsernameDialogOpen(false);
      setSelectedUser(null);
      updateUsernameForm.reset();
      setRefreshKey(k => k + 1);
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
      await adminDeleteDoodle(selectedDoodleId);
      setSuccessMessage('Doodle has been deleted successfully.');
      setDeleteDoodleDialogOpen(false);
      setSelectedDoodleId(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete doodle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTags = (enabled: boolean) => {
    updateAppSettings({ tags_enabled: enabled });
    setSuccessMessage(`Tags have been ${enabled ? 'enabled' : 'disabled'} globally.`);
    setRefreshKey(k => k + 1);
  };

  // Clear success message after 5 seconds
  if (successMessage) {
    setTimeout(() => setSuccessMessage(null), 5000);
  }

  // If not logged in or not admin, show login form
  if (!user?.is_admin) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Admin Login</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>
              Sign in with your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  {...loginForm.register('email')}
                  disabled={isLoading}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter your password"
                  {...loginForm.register('password')}
                  disabled={isLoading}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin dashboard
  const stats = getAdminStats();
  const allUsers = getAllUsers();

  return (
    <div className="container px-4 py-8 mx-auto max-w-5xl" key={refreshKey}>
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
        <Alert className="mb-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
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
        <CardContent>
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
                  const owner = getUserById(doodle.user_id);
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
          {allUsers.length === 0 ? (
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
                  {allUsers.map((u) => (
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
                            {u.id !== user.id && (
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
                            {u.id !== user.id && (
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
    </div>
  );
}
