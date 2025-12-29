import { useMemo, useState, useEffect } from 'react';
import { type Prompt } from '@/hooks/use-google-sheets';
import { PromptCard } from '@/components/PromptCard';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsPremium, useAppStore } from '@/store/app-store';
import {
  Search,
  Filter,
  Shuffle,
  AlertCircle,
  Archive,
  Lock,
  X,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { getTodayEST, getDateOffsetFromBase } from '@/lib/timezone';

interface ArchiveViewProps {
  prompts: Prompt[];
  isLoading: boolean;
  error: Error | null;
  onUpgrade: () => void;
  initialPromptId?: string;
  onAuthRequired?: () => void;
}

export function ArchiveView({
  prompts,
  isLoading,
  error,
  onUpgrade,
  initialPromptId,
  onAuthRequired,
}: ArchiveViewProps) {
  const isPremium = useIsPremium();
  const getAppSettings = useAppStore((state) => state.getAppSettings);
  const tagsEnabled = getAppSettings().tags_enabled;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Auto-open dialog when initialPromptId is provided
  useEffect(() => {
    if (initialPromptId && prompts.length > 0) {
      const prompt = prompts.find(p => p.id === initialPromptId);
      if (prompt) {
        setSelectedPrompt(prompt);
        setDialogOpen(true);
      }
    }
  }, [initialPromptId, prompts]);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDialogOpen(true);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? 'all' : category);
  };

  const today = getTodayEST();
  const threeDaysAgo = getDateOffsetFromBase(today, -2);

  // Get unique categories and tags
  const { categories, tags } = useMemo(() => {
    const categorySet = new Set<string>();
    const tagSet = new Set<string>();
    prompts.forEach((p) => {
      if (p.category) categorySet.add(p.category);
      p.tags.forEach((t) => tagSet.add(t));
    });
    return {
      categories: Array.from(categorySet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [prompts]);

  // Filter prompts
  const filteredPrompts = useMemo(() => {
    let filtered = [...prompts]
      .filter((p) => p.publish_date <= today)
      .sort(
        (a, b) =>
          new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
      );

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter((p) => p.tags.includes(selectedTag));
    }

    return filtered;
  }, [prompts, searchQuery, selectedCategory, selectedTag, today]);

  // Check if prompt is accessible for free users
  const isPromptAccessible = (prompt: Prompt) => {
    if (isPremium) return true;
    return prompt.publish_date >= threeDaysAgo;
  };

  // Get random prompt
  const handleSurpriseMe = () => {
    const accessiblePrompts = filteredPrompts.filter(isPromptAccessible);
    if (accessiblePrompts.length === 0) return;
    const randomPrompt =
      accessiblePrompts[Math.floor(Math.random() * accessiblePrompts.length)];
    // Scroll to the prompt
    const element = document.getElementById(`prompt-${randomPrompt.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
  };

  const hasActiveFilters =
    searchQuery || selectedCategory !== 'all' || selectedTag;

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load archive. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prompt Archive</h1>
          <p className="text-muted-foreground">
            {isPremium
              ? `${filteredPrompts.length} prompts available`
              : `${filteredPrompts.filter(isPromptAccessible).length} of ${filteredPrompts.length} prompts accessible`}
          </p>
        </div>
        <Button variant="outline" onClick={handleSurpriseMe} className="gap-2">
          <Shuffle className="w-4 h-4" />
          Surprise Me
        </Button>
      </div>

      {/* Free tier notice */}
      {!isPremium && (
        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Free users can only access prompts from the last 3 days.</span>
            <Button size="sm" variant="outline" onClick={onUpgrade}>
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn('gap-2', showFilters && 'bg-muted')}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                Active
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        )}

        {/* Tag chips - only show if tags are enabled */}
        {tagsEnabled && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Badge>
            ))}
            {tags.length > 10 && (
              <span className="text-sm text-muted-foreground">
                +{tags.length - 10} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Prompts Grid */}
      {filteredPrompts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Archive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Prompts Found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <div key={prompt.id} id={`prompt-${prompt.id}`}>
              <PromptCard
                prompt={prompt}
                variant="compact"
                isLocked={!isPromptAccessible(prompt)}
                showBookmark={isPromptAccessible(prompt)}
                showShare={isPromptAccessible(prompt)}
                onClick={isPromptAccessible(prompt) ? () => handlePromptClick(prompt) : undefined}
                onTagClick={handleTagClick}
                onCategoryClick={handleCategoryClick}
                onAuthRequired={onAuthRequired}
              />
            </div>
          ))}
        </div>
      )}

      {/* Prompt Detail Dialog with upload support and tag handlers */}
      <PromptDetailDialog
        prompt={selectedPrompt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onTagClick={handleTagClick}
        onCategoryClick={handleCategoryClick}
        onAuthRequired={onAuthRequired}
      />
    </div>
  );
}
