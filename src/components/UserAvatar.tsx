import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/store/app-store';
import type { AvatarIconType } from '@/types';
import {
  Cat,
  Dog,
  Rocket,
  Star,
  Heart,
  Palette,
  Brush,
  Sparkles,
  Smile,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map icon types to Lucide components
const AVATAR_ICONS: Record<AvatarIconType, React.ComponentType<{ className?: string }>> = {
  cat: Cat,
  dog: Dog,
  rocket: Rocket,
  star: Star,
  heart: Heart,
  palette: Palette,
  brush: Brush,
  sparkles: Sparkles,
  smile: Smile,
  sun: Sun,
};

// Fun colors for each icon
const ICON_COLORS: Record<AvatarIconType, string> = {
  cat: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
  dog: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  rocket: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  star: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
  heart: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  palette: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  brush: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
  sparkles: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  smile: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  sun: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
};

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

const ICON_SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const TEXT_SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl',
};

export function UserAvatar({ size = 'md', className }: UserAvatarProps) {
  const user = useUser();

  if (!user) return null;

  const avatarType = user.avatar_type ?? 'initial';
  const avatarIcon = user.avatar_icon;

  const renderContent = () => {
    if (avatarType === 'icon' && avatarIcon && AVATAR_ICONS[avatarIcon]) {
      const IconComponent = AVATAR_ICONS[avatarIcon];
      return <IconComponent className={ICON_SIZE_CLASSES[size]} />;
    }

    return (
      <span className={TEXT_SIZE_CLASSES[size]}>
        {user.username.charAt(0).toUpperCase()}
      </span>
    );
  };

  const getColorClass = () => {
    if (avatarType === 'icon' && avatarIcon && ICON_COLORS[avatarIcon]) {
      return ICON_COLORS[avatarIcon];
    }
    return 'bg-primary/10 text-primary';
  };

  return (
    <Avatar className={cn(SIZE_CLASSES[size], className)}>
      <AvatarFallback className={cn(getColorClass(), 'font-medium')}>
        {renderContent()}
      </AvatarFallback>
    </Avatar>
  );
}

// Export icon options for selection UI
export const AVATAR_ICON_OPTIONS: { value: AvatarIconType; label: string }[] = [
  { value: 'cat', label: 'Cat' },
  { value: 'dog', label: 'Dog' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'star', label: 'Star' },
  { value: 'heart', label: 'Heart' },
  { value: 'palette', label: 'Palette' },
  { value: 'brush', label: 'Brush' },
  { value: 'sparkles', label: 'Sparkles' },
  { value: 'smile', label: 'Smile' },
  { value: 'sun', label: 'Sun' },
];

export { AVATAR_ICONS, ICON_COLORS };
