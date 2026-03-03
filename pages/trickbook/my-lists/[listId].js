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
  Plus,
  StickyNote,
  Trash2,
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
  updateTrickList,
  updateTrickStatus,
} from '../../../lib/apiTrickLists';

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
    </>
  );
}
