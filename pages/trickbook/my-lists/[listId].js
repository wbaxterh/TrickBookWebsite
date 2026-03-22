import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Edit2,
  ExternalLink,
  Link as LinkIcon,
  Loader2,
  MapPin,
  Play,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Video,
  X,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import {
  addTrickToList,
  deleteTrick,
  deleteTrickList,
  editTrick,
  getTricksInList,
  getUserTrickLists,
  linkSpotToTrick,
  linkVideoToTrick,
  updateTrickList,
  updateTrickStatus,
} from '../../../lib/apiTrickLists';
import { searchSpots } from '../../../lib/apiSpots';

export default function TrickListDetail() {
  const router = useRouter();
  const { listId } = router.query;
  const { loggedIn, token, userId } = useContext(AuthContext);

  const [list, setList] = useState(null);
  const [tricks, setTricks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add trick dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newTrick, setNewTrick] = useState({ name: '', link: '', notes: '' });
  const [adding, setAdding] = useState(false);

  // Edit trick dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTrick, setEditingTrick] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', link: '', notes: '' });
  const [saving, setSaving] = useState(false);

  // Delete trick confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trickToDelete, setTrickToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Delete list confirmation
  const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);
  const [deletingList, setDeletingList] = useState(false);

  // Spot search modal
  const [spotDialogOpen, setSpotDialogOpen] = useState(false);
  const [spotSearchQuery, setSpotSearchQuery] = useState('');
  const [spotSearchResults, setSpotSearchResults] = useState([]);
  const [spotSearching, setSpotSearching] = useState(false);
  const [spotTrickTarget, setSpotTrickTarget] = useState(null);
  const [linkingSpot, setLinkingSpot] = useState(false);

  // Video link modal
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTrickTarget, setVideoTrickTarget] = useState(null);
  const [linkingVideo, setLinkingVideo] = useState(false);

  // Edit list name
  const [isEditingListName, setIsEditingListName] = useState(false);
  const [editedListName, setEditedListName] = useState('');
  const [savingListName, setSavingListName] = useState(false);

  // Fetch list and tricks
  const fetchData = useCallback(async () => {
    if (!listId || !userId) return;
    setLoading(true);
    try {
      // Fetch all user's lists to find the current one
      const lists = await getUserTrickLists(userId, token);
      const currentList = lists.find((l) => l._id === listId);
      setList(currentList);

      // Fetch tricks in this list
      const tricksData = await getTricksInList(listId, token);
      setTricks(tricksData);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  }, [listId, userId, token]);

  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    if (listId) {
      fetchData();
    }
  }, [loggedIn, listId, fetchData, router]);

  // Add trick
  const handleAddTrick = async () => {
    if (!newTrick.name.trim()) return;
    setAdding(true);
    try {
      await addTrickToList(listId, newTrick, token);
      setAddDialogOpen(false);
      setNewTrick({ name: '', link: '', notes: '' });
      fetchData();
    } catch (_error) {
      alert('Failed to add trick');
    } finally {
      setAdding(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (trick) => {
    setEditingTrick(trick);
    setEditForm({
      name: trick.name || '',
      link: trick.link || '',
      notes: trick.notes || '',
    });
    setEditDialogOpen(true);
  };

  // Save edited trick
  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) return;
    setSaving(true);
    try {
      await editTrick(editingTrick._id, editForm, token);
      setEditDialogOpen(false);
      setEditingTrick(null);
      fetchData();
    } catch (_error) {
      alert('Failed to save trick');
    } finally {
      setSaving(false);
    }
  };

  // Toggle completion status (checked is a string: "To Do" = incomplete, "Completed" = done)
  const handleToggleComplete = async (trick) => {
    const isCurrentlyCompleted = isTrickCompleted(trick);
    const newStatus = isCurrentlyCompleted ? 'To Do' : 'Completed';
    try {
      await updateTrickStatus(trick._id, newStatus, token);
      // Update local state optimistically
      setTricks((prev) =>
        prev.map((t) => (t._id === trick._id ? { ...t, checked: newStatus } : t)),
      );
    } catch (_error) {}
  };

  // Delete trick
  const handleDeleteTrick = async () => {
    if (!trickToDelete) return;
    setDeleting(true);
    try {
      await deleteTrick(trickToDelete._id, token);
      setDeleteDialogOpen(false);
      setTrickToDelete(null);
      fetchData();
    } catch (_error) {
      alert('Failed to delete trick');
    } finally {
      setDeleting(false);
    }
  };

  // Delete entire list
  const handleDeleteList = async () => {
    setDeletingList(true);
    try {
      await deleteTrickList(listId, token);
      router.push('/trickbook');
    } catch (_error) {
      alert('Failed to delete list');
    } finally {
      setDeletingList(false);
      setDeleteListDialogOpen(false);
    }
  };

  // Start editing list name
  const startEditingListName = () => {
    setEditedListName(list.name);
    setIsEditingListName(true);
  };

  // Save edited list name
  const saveListName = async () => {
    if (!editedListName.trim() || editedListName === list.name) {
      setIsEditingListName(false);
      return;
    }
    setSavingListName(true);
    try {
      await updateTrickList(listId, editedListName, token);
      setList({ ...list, name: editedListName });
      setIsEditingListName(false);
    } catch (_error) {
      alert('Failed to update list name');
    } finally {
      setSavingListName(false);
    }
  };

  // Cancel editing list name
  const cancelEditingListName = () => {
    setIsEditingListName(false);
    setEditedListName('');
  };

  // Spot search handler
  const handleSpotSearch = async (query) => {
    setSpotSearchQuery(query);
    if (query.length < 2) { setSpotSearchResults([]); return; }
    setSpotSearching(true);
    try {
      const data = await searchSpots(query, '', '', '', 1, 10);
      setSpotSearchResults(data.spots || []);
    } catch (_e) {
      setSpotSearchResults([]);
    } finally {
      setSpotSearching(false);
    }
  };

  // Link spot to trick
  const handleLinkSpot = async (spot) => {
    if (!spotTrickTarget) return;
    setLinkingSpot(true);
    try {
      await linkSpotToTrick(spotTrickTarget._id, spot._id, token);
      setTricks(prev => prev.map(t =>
        t._id === spotTrickTarget._id
          ? { ...t, spotId: spot._id, spot: { name: spot.name, city: spot.city, state: spot.state } }
          : t
      ));
      setSpotDialogOpen(false);
      setSpotTrickTarget(null);
      setSpotSearchQuery('');
      setSpotSearchResults([]);
    } catch (_e) {
      alert('Failed to link spot');
    } finally {
      setLinkingSpot(false);
    }
  };

  // Unlink spot from trick
  const handleUnlinkSpot = async (trick) => {
    try {
      await linkSpotToTrick(trick._id, null, token);
      setTricks(prev => prev.map(t =>
        t._id === trick._id ? { ...t, spotId: null, spot: null } : t
      ));
    } catch (_e) {}
  };

  // Link video to trick
  const handleLinkVideo = async () => {
    if (!videoTrickTarget || !videoUrl.trim()) return;
    setLinkingVideo(true);
    try {
      await linkVideoToTrick(videoTrickTarget._id, videoUrl.trim(), null, token);
      setTricks(prev => prev.map(t =>
        t._id === videoTrickTarget._id ? { ...t, videoUrl: videoUrl.trim() } : t
      ));
      setVideoDialogOpen(false);
      setVideoTrickTarget(null);
      setVideoUrl('');
    } catch (_e) {
      alert('Failed to link video');
    } finally {
      setLinkingVideo(false);
    }
  };

  // Helper function to check if trick is completed (checked is a string, "To Do" means incomplete)
  const isTrickCompleted = (trick) => trick.checked && trick.checked !== 'To Do';

  // Calculate completion stats
  const completedCount = tricks.filter(isTrickCompleted).length;
  const totalCount = tricks.length;
  const completionPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loggedIn === null || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-semibold text-foreground mb-2">List not found</h1>
            <Button variant="outline" onClick={() => router.push('/trickbook')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trickipedia
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{list.name} - My Trick Lists | The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content={`View and manage tricks in ${list.name}`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="container py-6">
            {/* Breadcrumb */}
            <Link
              href="/trickbook"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-yellow-500 transition-colors mb-4 no-underline"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to My Trick Lists</span>
            </Link>

            <div className="flex items-start justify-between">
              <div>
                {/* Editable list name */}
                {isEditingListName ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedListName}
                      onChange={(e) => setEditedListName(e.target.value)}
                      className="text-2xl font-bold h-10 w-64"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveListName();
                        if (e.key === 'Escape') cancelEditingListName();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={saveListName}
                      disabled={savingListName}
                      className="h-8 w-8"
                    >
                      {savingListName ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={cancelEditingListName}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h1 className="text-3xl font-bold text-foreground">{list.name}</h1>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={startEditingListName}
                      className="h-8 w-8 opacity-50 hover:opacity-100 transition-opacity"
                      title="Edit list name"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-muted-foreground">
                    {totalCount} trick{totalCount !== 1 ? 's' : ''}
                  </span>
                  <Badge
                    variant="secondary"
                    className={
                      completedCount === totalCount && totalCount > 0
                        ? 'bg-green-500/20 text-green-500'
                        : ''
                    }
                  >
                    {completedCount} / {totalCount} completed
                  </Badge>
                </div>
                {/* Progress bar */}
                {totalCount > 0 && (
                  <div className="mt-3 w-64">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteListDialogOpen(true)}
                  className="text-red-500 border-red-500/50 hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete List
                </Button>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trick
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tricks List */}
        <div className="container py-6">
          {tricks.length > 0 ? (
            <div className="space-y-3">
              {tricks.map((trick) => {
                const isCompleted = isTrickCompleted(trick);
                return (
                  <Card
                    key={trick._id}
                    className={`group transition-all ${
                      isCompleted
                        ? 'bg-green-500/5 border-green-500/30'
                        : 'hover:border-yellow-500/50'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => handleToggleComplete(trick)}
                          className="mt-1 flex-shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground hover:text-yellow-500 transition-colors" />
                          )}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={`font-semibold text-lg ${
                                isCompleted
                                  ? 'text-muted-foreground line-through'
                                  : 'text-foreground'
                              }`}
                            >
                              {trick.name}
                            </h3>
                            {trick.link && (
                              <a
                                href={trick.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-500 hover:text-yellow-400"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>

                          {/* Notes */}
                          {trick.notes && (
                            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                              <StickyNote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <p>{trick.notes}</p>
                            </div>
                          )}

                          {/* Link display */}
                          {trick.link && (
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <LinkIcon className="h-4 w-4 flex-shrink-0" />
                              <a
                                href={trick.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-yellow-500 hover:underline truncate"
                              >
                                {trick.link}
                              </a>
                            </div>
                          )}

                          {/* Trickipedia link - shown when trick was added from Trickipedia */}
                          {trick.trickipediaId && (
                            <div className="mt-2">
                              <Link
                                href="/trickipedia"
                                className="inline-flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 no-underline"
                              >
                                <BookOpen className="h-4 w-4" />
                                <span>View Tutorial in Trickipedia</span>
                              </Link>
                            </div>
                          )}

                          {/* Spot + Video badges */}
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {trick.spot ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-500 rounded-full text-xs cursor-pointer hover:bg-green-500/30"
                                onClick={(e) => { e.stopPropagation(); handleUnlinkSpot(trick); }}
                                title="Click to unlink spot"
                              >
                                <MapPin className="h-3 w-3" />
                                {trick.spot.name}{trick.spot.city ? `, ${trick.spot.state || ''}` : ''}
                                <X className="h-3 w-3 ml-0.5" />
                              </span>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); setSpotTrickTarget(trick); setSpotDialogOpen(true); }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-xs hover:bg-secondary/80 hover:text-yellow-500 transition-colors"
                              >
                                <MapPin className="h-3 w-3" />
                                Add Spot
                              </button>
                            )}

                            {trick.videoUrl ? (
                              <a
                                href={trick.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs hover:bg-purple-500/30"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Play className="h-3 w-3" />
                                Video
                              </a>
                            ) : trick.feedPostId ? (
                              <Link
                                href={`/media/feed/${trick.feedPostId}`}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs hover:bg-purple-500/30 no-underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Video className="h-3 w-3" />
                                Clip
                              </Link>
                            ) : (
                              <button
                                onClick={(e) => { e.stopPropagation(); setVideoTrickTarget(trick); setVideoDialogOpen(true); }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary text-muted-foreground rounded-full text-xs hover:bg-secondary/80 hover:text-yellow-500 transition-colors"
                              >
                                <Video className="h-3 w-3" />
                                Add Video
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Actions - Always visible on mobile, hover on desktop */}
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(trick)}
                            className="h-8 w-8"
                            title="Edit trick"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setTrickToDelete(trick);
                              setDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 text-red-500 hover:text-red-600"
                            title="Delete trick"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24">
              <Circle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">No tricks yet</h2>
              <p className="text-muted-foreground mb-6">
                Add your first trick to start tracking your progress.
              </p>
              <Button
                onClick={() => setAddDialogOpen(true)}
                className="bg-yellow-500 text-black hover:bg-yellow-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Trick
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Trick Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Trick</DialogTitle>
            <DialogDescription>Add a trick to your list to track your progress.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Trick Name *</label>
              <Input
                placeholder="e.g., Kickflip"
                value={newTrick.name}
                onChange={(e) => setNewTrick({ ...newTrick, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Video Link (optional)</label>
              <Input
                placeholder="https://youtube.com/..."
                value={newTrick.link}
                onChange={(e) => setNewTrick({ ...newTrick, link: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any tips or notes..."
                value={newTrick.notes}
                onChange={(e) => setNewTrick({ ...newTrick, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddTrick}
              disabled={adding || !newTrick.name.trim()}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Trick'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Trick Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Trick</DialogTitle>
            <DialogDescription>Update the trick details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Trick Name *</label>
              <Input
                placeholder="e.g., Kickflip"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Video Link (optional)</label>
              <Input
                placeholder="https://youtube.com/..."
                value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Notes (optional)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Any tips or notes..."
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving || !editForm.name.trim()}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Trick Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trick</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{trickToDelete?.name}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTrick} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete List Confirmation Dialog */}
      <Dialog open={deleteListDialogOpen} onOpenChange={setDeleteListDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trick List</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{list?.name}&quot;? This will permanently delete
              the list and all {totalCount} trick{totalCount !== 1 ? 's' : ''} in it. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteListDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteList} disabled={deletingList}>
              {deletingList ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete List'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spot Search Dialog */}
      <Dialog open={spotDialogOpen} onOpenChange={(open) => { setSpotDialogOpen(open); if (!open) { setSpotSearchQuery(''); setSpotSearchResults([]); setSpotTrickTarget(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Spot to &quot;{spotTrickTarget?.name}&quot;</DialogTitle>
            <DialogDescription>Search for a skate spot to tag this trick.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search spots..."
                value={spotSearchQuery}
                onChange={(e) => handleSpotSearch(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            {spotSearching && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
              </div>
            )}
            {spotSearchResults.length > 0 && (
              <div className="mt-3 max-h-60 overflow-y-auto space-y-1">
                {spotSearchResults.map((spot) => (
                  <button
                    key={spot._id}
                    onClick={() => handleLinkSpot(spot)}
                    disabled={linkingSpot}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{spot.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {spot.city}{spot.state ? `, ${spot.state}` : ''}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {spotSearchQuery.length >= 2 && !spotSearching && spotSearchResults.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No spots found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Link Dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={(open) => { setVideoDialogOpen(open); if (!open) { setVideoUrl(''); setVideoTrickTarget(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Video to &quot;{videoTrickTarget?.name}&quot;</DialogTitle>
            <DialogDescription>Paste a video URL (YouTube, Instagram, etc.)</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="https://youtube.com/watch?v=..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVideoDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkVideo}
              disabled={linkingVideo || !videoUrl.trim()}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              {linkingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Link Video'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
