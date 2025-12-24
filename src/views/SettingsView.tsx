import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore, usePreferences, useUser } from '@/store/app-store';
import { TitleSelector } from '@/components/TitleSelector';
import { Bell, Sun, Mail, HelpCircle, FileText, Shield, ArrowLeft, Key, Loader2, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { type UserPreferences } from '@/types';
import { supabase } from '@/sdk/core/supabase';

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const usernameChangeSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z.string().min(1, 'Password is required to confirm this change'),
});

const usernameOAuthSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be 20 characters or less')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
});

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
type UsernameChangeFormData = z.infer<typeof usernameChangeSchema>;
type UsernameOAuthFormData = z.infer<typeof usernameOAuthSchema>;

interface SettingsViewProps {
  onBack: () => void;
  onForgotPassword?: () => void;
  onUpgrade?: () => void;
}

export function SettingsView({ onBack, onForgotPassword, onUpgrade }: SettingsViewProps) {
  const preferences = usePreferences();
  const user = useUser();
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const clearUserData = useAppStore((state) => state.clearUserData);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const usernameForm = useForm<UsernameChangeFormData>({
    resolver: zodResolver(usernameChangeSchema),
    defaultValues: {
      username: user?.username || '',
      password: '',
    },
  });

  const usernameOAuthForm = useForm<UsernameOAuthFormData>({
    resolver: zodResolver(usernameOAuthSchema),
    defaultValues: {
      username: user?.username || '',
    },
  });

  if (!preferences) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canChangePassword = user && !user.oauth_provider;
  const isOAuthUser = user?.oauth_provider != null;

  const handleToggle = (key: keyof UserPreferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleThemeChange = (value: string) => {
    updatePreferences({ theme_mode: value as 'light' | 'dark' | 'system' });
  };

  const handleNotificationTimeChange = (value: string) => {
    updatePreferences({ push_notification_time: value });
  };

  const handlePasswordChange = async (data: PasswordChangeFormData) => {
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      // Use Supabase to update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        throw error;
      }

      setPasswordSuccess(true);
      passwordForm.reset();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleUsernameChange = async (data: UsernameChangeFormData) => {
    setIsChangingUsername(true);
    setUsernameError(null);
    setUsernameSuccess(false);

    try {
      if (!user) throw new Error('Not logged in');

      // Verify password first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.password,
      });

      if (signInError) {
        throw new Error('Incorrect password');
      }

      // Update username in Supabase user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { username: data.username },
      });

      if (updateError) throw updateError;

      // Update in profiles table
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const response = await fetch('/api/me', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: data.username }),
        });

        if (!response.ok) {
          throw new Error('Failed to update username');
        }
      }

      setUsernameSuccess(true);
      usernameForm.reset({ username: data.username, password: '' });
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'Failed to change username');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleUsernameOAuthChange = async (data: UsernameOAuthFormData) => {
    setIsChangingUsername(true);
    setUsernameError(null);
    setUsernameSuccess(false);

    try {
      // Update username in Supabase user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { username: data.username },
      });

      if (updateError) throw updateError;

      // Update in profiles table
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const response = await fetch('/api/me', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: data.username }),
        });

        if (!response.ok) {
          throw new Error('Failed to update username');
        }
      }

      setUsernameSuccess(true);
      usernameOAuthForm.reset({ username: data.username });
    } catch (err) {
      setUsernameError(err instanceof Error ? err.message : 'Failed to change username');
    } finally {
      setIsChangingUsername(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearUserData();
    onBack();
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Profile Title - Premium Feature */}
      <div className="mb-6">
        <TitleSelector onUpgrade={onUpgrade} />
      </div>

      {/* Username Change */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Change Username
          </CardTitle>
          <CardDescription>
            Update your display name
            {isOAuthUser && (
              <span className="block mt-1 text-xs">
                Signed in with {user?.oauth_provider === 'google' ? 'Google' : 'Apple'}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usernameError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{usernameError}</AlertDescription>
            </Alert>
          )}

          {usernameSuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                Username changed successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* OAuth user form - no password required */}
          {isOAuthUser ? (
            <form onSubmit={usernameOAuthForm.handleSubmit(handleUsernameOAuthChange)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username-oauth">New Username</Label>
                <Input
                  id="username-oauth"
                  type="text"
                  placeholder="Enter new username"
                  {...usernameOAuthForm.register('username')}
                  disabled={isChangingUsername}
                />
                {usernameOAuthForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {usernameOAuthForm.formState.errors.username.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  3-20 characters, letters, numbers, and underscores only. Offensive language is not allowed.
                </p>
              </div>

              <Button type="submit" disabled={isChangingUsername}>
                {isChangingUsername && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Username
              </Button>
            </form>
          ) : (
            /* Regular user form - password required */
            <form onSubmit={usernameForm.handleSubmit(handleUsernameChange)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">New Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter new username"
                  {...usernameForm.register('username')}
                  disabled={isChangingUsername}
                />
                {usernameForm.formState.errors.username && (
                  <p className="text-sm text-destructive">
                    {usernameForm.formState.errors.username.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  3-20 characters, letters, numbers, and underscores only. Offensive language is not allowed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username-password">Confirm Password</Label>
                <Input
                  id="username-password"
                  type="password"
                  placeholder="Enter your password to confirm"
                  {...usernameForm.register('password')}
                  disabled={isChangingUsername}
                />
                {usernameForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {usernameForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isChangingUsername}>
                {isChangingUsername && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Username
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you want to be notified about new prompts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive daily reminders about new prompts
              </p>
            </div>
            <Switch
              id="push-notifications"
              checked={preferences.push_notifications_enabled}
              onCheckedChange={(checked) =>
                handleToggle('push_notifications_enabled', checked)
              }
            />
          </div>

          {preferences.push_notifications_enabled && (
            <div className="flex items-center justify-between pl-4 border-l-2">
              <div className="space-y-0.5">
                <Label htmlFor="notification-time">Notification Time</Label>
                <p className="text-sm text-muted-foreground">
                  When to send the daily reminder
                </p>
              </div>
              <Select
                value={preferences.push_notification_time}
                onValueChange={handleNotificationTimeChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">6:00 AM</SelectItem>
                  <SelectItem value="07:00">7:00 AM</SelectItem>
                  <SelectItem value="08:00">8:00 AM</SelectItem>
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="20:00">8:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly digest and special announcements
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications_enabled}
              onCheckedChange={(checked) =>
                handleToggle('email_notifications_enabled', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select
              value={preferences.theme_mode}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Password Change */}
      {canChangePassword && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">
                  Password changed successfully!
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter current password"
                  {...passwordForm.register('currentPassword')}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
                {onForgotPassword && (
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0 text-sm"
                    onClick={onForgotPassword}
                  >
                    Forgot your password?
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  {...passwordForm.register('newPassword')}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  {...passwordForm.register('confirmPassword')}
                  disabled={isChangingPassword}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Support & Legal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support & Legal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <HelpCircle className="h-4 w-4" />
            Help & Support
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Shield className="h-4 w-4" />
            Privacy Policy
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2">
            <FileText className="h-4 w-4" />
            Terms of Service
          </Button>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}