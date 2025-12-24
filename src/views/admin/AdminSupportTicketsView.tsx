// @ts-nocheck
import { useState, useEffect } from 'react';
import { type SupportTicket, type SupportTicketNote, type SupportTicketStatus, type SupportTicketCategory, type Doodle } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  MessageSquare,
  User,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Image as ImageIcon,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface AdminSupportTicketsViewProps {
  onBack: () => void;
}

export function AdminSupportTicketsView({ onBack }: AdminSupportTicketsViewProps) {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<SupportTicketCategory | 'all'>('all');
  const [newNote, setNewNote] = useState('');
  const [newNoteInternal, setNewNoteInternal] = useState(true);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const getAllTickets = useAppStore((state) => state.getAllTickets);
  const getTicketNotes = useAppStore((state) => state.getTicketNotes);
  const addTicketNote = useAppStore((state) => state.addTicketNote);
  const updateTicketStatus = useAppStore((state) => state.updateTicketStatus);
  const getTicketWithUser = useAppStore((state) => state.getTicketWithUser);
  const moderateDoodle = useAppStore((state) => state.moderateDoodle);
  const getDoodles = useAppStore((state) => state.getDoodles);

  const tickets = getAllTickets();

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false;
    return true;
  });

  // Sort by created_at descending (newest first)
  const sortedTickets = [...filteredTickets].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const ticketDetails = selectedTicket ? getTicketWithUser(selectedTicket.id) : null;
  const ticketNotes = selectedTicket ? getTicketNotes(selectedTicket.id) : [];
  const ticketDoodle = selectedTicket?.related_doodle_id
    ? getDoodles().find((d) => d.id === selectedTicket.related_doodle_id)
    : null;

  const handleAddNote = async () => {
    if (!selectedTicket || !newNote.trim()) return;

    setLoading(true);
    try {
      const result = await addTicketNote(selectedTicket.id, newNote.trim(), newNoteInternal);
      if (result.success) {
        toast.success(newNoteInternal ? 'Internal note added' : 'Reply sent to user');
        setNewNote('');
        // Refresh ticket details
        const refreshed = getAllTickets().find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      } else {
        throw new Error(result.error || 'Failed to add note');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: SupportTicketStatus) => {
    if (!selectedTicket) return;

    // Require resolution summary when closing
    if (status === 'closed' && !resolutionSummary.trim()) {
      toast.error('Please provide a resolution summary');
      return;
    }

    setLoading(true);
    try {
      const result = await updateTicketStatus(
        selectedTicket.id,
        status,
        status === 'closed' ? resolutionSummary.trim() : undefined
      );

      if (result.success) {
        toast.success(`Ticket marked as ${status}`);
        setResolutionSummary('');
        // Refresh ticket
        const refreshed = getAllTickets().find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleModerateDoodle = async (action: 'no_action' | 'remove_warn' | 'remove_ban') => {
    if (!selectedTicket || !selectedTicket.related_doodle_id) return;

    if (!resolutionSummary.trim()) {
      toast.error('Please provide a resolution summary');
      return;
    }

    // Get reporter user ID from the doodle flag
    const flags = useAppStore.getState().getDoodleFlags(selectedTicket.related_doodle_id);
    const relevantFlag = flags.find((f) => f.ticket_id === selectedTicket.id);

    if (!relevantFlag) {
      toast.error('Could not find associated flag record');
      return;
    }

    setLoading(true);
    try {
      const result = await moderateDoodle(
        selectedTicket.related_doodle_id,
        action,
        relevantFlag.reporter_user_id,
        selectedTicket.id,
        resolutionSummary.trim()
      );

      if (result.success) {
        const actionLabels = {
          no_action: 'No action taken',
          remove_warn: 'Doodle removed and user warned',
          remove_ban: 'Doodle removed and user banned',
        };
        toast.success(actionLabels[action]);
        setResolutionSummary('');
        setSelectedTicket(null);
      } else {
        throw new Error(result.error || 'Failed to moderate doodle');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to moderate doodle');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SupportTicketStatus) => {
    const variants = {
      open: { variant: 'default' as const, icon: AlertCircle, label: 'Open' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
      closed: { variant: 'outline' as const, icon: CheckCircle2, label: 'Closed' },
    };
    const config = variants[status];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getCategoryBadge = (category: SupportTicketCategory) => {
    const colors = {
      account: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      billing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      bug: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      doodle_flag: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      prompt_idea: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };

    const labels = {
      account: 'Account',
      billing: 'Billing',
      bug: 'Bug',
      doodle_flag: 'Doodle Flag',
      prompt_idea: 'Prompt Idea',
      other: 'Other',
    };

    return (
      <Badge className={cn('text-xs', colors[category])} variant="outline">
        {labels[category]}
      </Badge>
    );
  };

  return (
    <div className="container max-w-7xl py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground mt-1">
            Manage user support requests and content moderation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Tickets ({sortedTickets.length})</CardTitle>
            <div className="space-y-2 pt-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SupportTicketStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as SupportTicketCategory | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="doodle_flag">Doodle Flag</SelectItem>
                  <SelectItem value="prompt_idea">Prompt Idea</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div className="space-y-1 p-4 pt-0">
                {sortedTickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No tickets found
                  </p>
                ) : (
                  sortedTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        selectedTicket?.id === ticket.id
                          ? 'bg-accent border-primary'
                          : 'hover:bg-accent/50'
                      )}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        {getStatusBadge(ticket.status)}
                        {getCategoryBadge(ticket.category)}
                      </div>
                      <p className="font-medium text-sm line-clamp-1 mb-1">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        <Card className="lg:col-span-2">
          {selectedTicket && ticketDetails ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(selectedTicket.status)}
                      {getCategoryBadge(selectedTicket.category)}
                    </div>
                    <CardTitle className="text-xl">{selectedTicket.subject}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {ticketDetails.user?.username || 'Anonymous'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(selectedTicket.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTicket(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Original Message */}
                <div>
                  <Label className="text-sm font-semibold">Original Message</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* Doodle Preview for doodle_flag category */}
                {selectedTicket.category === 'doodle_flag' && ticketDoodle && (
                  <div>
                    <Label className="text-sm font-semibold">Flagged Doodle</Label>
                    <Card className="mt-2">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden shrink-0">
                            <img
                              src={ticketDoodle.image_url}
                              alt={ticketDoodle.prompt_title}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{ticketDoodle.prompt_title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              By: {ticketDetails.user?.username || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {ticketDoodle.likes_count} likes
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notes Timeline */}
                <div>
                  <Label className="text-sm font-semibold">Notes & Replies</Label>
                  <ScrollArea className="h-[200px] mt-2">
                    <div className="space-y-3">
                      {ticketNotes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No notes yet
                        </p>
                      ) : (
                        ticketNotes.map((note) => (
                          <div
                            key={note.id}
                            className={cn(
                              'p-3 rounded-lg border',
                              note.is_internal ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' : 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={note.is_internal ? 'secondary' : 'default'} className="text-xs">
                                {note.is_internal ? 'Internal' : 'Reply to User'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                {/* Actions based on ticket type and status */}
                {selectedTicket.status !== 'closed' && (
                  <Tabs defaultValue="note" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="note">Add Note/Reply</TabsTrigger>
                      <TabsTrigger value="status">Update Status</TabsTrigger>
                    </TabsList>

                    <TabsContent value="note" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-note">Note Content</Label>
                        <Textarea
                          id="new-note"
                          placeholder="Add a note or reply to the user..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="flex items-center gap-4">
                        <Label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newNoteInternal}
                            onChange={(e) => setNewNoteInternal(e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Internal note (user won't see this)</span>
                        </Label>
                      </div>

                      <Button
                        onClick={handleAddNote}
                        disabled={!newNote.trim() || loading}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {newNoteInternal ? 'Add Internal Note' : 'Send Reply to User'}
                      </Button>
                    </TabsContent>

                    <TabsContent value="status" className="space-y-4">
                      {selectedTicket.category === 'doodle_flag' && ticketDoodle ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="resolution">Resolution Summary *</Label>
                            <Textarea
                              id="resolution"
                              placeholder="Explain the moderation decision..."
                              value={resolutionSummary}
                              onChange={(e) => setResolutionSummary(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <Button
                              variant="outline"
                              onClick={() => handleModerateDoodle('no_action')}
                              disabled={loading || !resolutionSummary.trim()}
                            >
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              No Action
                            </Button>
                            <Button
                              variant="outline"
                              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                              onClick={() => handleModerateDoodle('remove_warn')}
                              disabled={loading || !resolutionSummary.trim()}
                            >
                              <ShieldAlert className="h-4 w-4 mr-1" />
                              Remove & Warn
                            </Button>
                            <Button
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                              onClick={() => handleModerateDoodle('remove_ban')}
                              disabled={loading || !resolutionSummary.trim()}
                            >
                              <ShieldX className="h-4 w-4 mr-1" />
                              Remove & Ban
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {selectedTicket.status === 'open' && (
                            <Button
                              variant="outline"
                              onClick={() => handleUpdateStatus('pending')}
                              disabled={loading}
                              className="w-full"
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Mark as Pending
                            </Button>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="close-resolution">Resolution Summary (required to close)</Label>
                            <Textarea
                              id="close-resolution"
                              placeholder="Summarize how this ticket was resolved..."
                              value={resolutionSummary}
                              onChange={(e) => setResolutionSummary(e.target.value)}
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={() => handleUpdateStatus('closed')}
                            disabled={loading || !resolutionSummary.trim()}
                            className="w-full"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Close Ticket
                          </Button>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                )}

                {/* Closed ticket info */}
                {selectedTicket.status === 'closed' && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-semibold">Resolution Summary</Label>
                    <p className="text-sm mt-2">{selectedTicket.resolution_summary || 'No summary provided'}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Closed {formatDistanceToNow(new Date(selectedTicket.closed_at!), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a ticket to view details</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
