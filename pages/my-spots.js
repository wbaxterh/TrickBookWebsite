import { Folder, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import {
  createSpotList,
  deleteSpotList,
  getSpotLists,
  getSpotUsage,
  updateSpotList,
} from '../lib/apiSpots';

export default function MySpots() {
  const router = useRouter();
  const { loggedIn, token } = useContext(AuthContext);

  const [spotLists, setSpotLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState(null);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create');
  const [editingList, setEditingList] = useState(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn) {
      router.push('/login');
      return;
    }

    fetchData();
  }, [loggedIn, router, fetchData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lists, usageData] = await Promise.all([getSpotLists(token), getSpotUsage(token)]);
      setSpotLists(lists);
      setUsage(usageData);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogMode('create');
    setListName('');
    setListDescription('');
    setEditingList(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (list, e) => {
    e.stopPropagation();
    setDialogMode('edit');
    setListName(list.name);
    setListDescription(list.description || '');
    setEditingList(list);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setListName('');
    setListDescription('');
    setEditingList(null);
  };

  const handleSaveList = async () => {
    if (!listName.trim()) return;

    setSaving(true);
    try {
      if (dialogMode === 'create') {
        await createSpotList(listName, listDescription, token);
      } else {
        await updateSpotList(editingList._id, listName, listDescription, token);
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save list');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (list, e) => {
    e.stopPropagation();
    setListToDelete(list);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!listToDelete) return;

    try {
      await deleteSpotList(listToDelete._id, token);
      setDeleteDialogOpen(false);
      setListToDelete(null);
      fetchData();
    } catch (_error) {
      alert('Failed to delete list');
    }
  };

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

  return (
    <>
      <Head>
        <title>My Spot Lists - The Trick Book</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content="Manage your saved skate spot lists" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="border-b border-border">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Folder className="h-6 w-6 text-yellow-500" />
                <h1 className="text-3xl font-bold text-foreground">My Spot Lists</h1>
              </div>

              <Button
                onClick={handleOpenCreateDialog}
                className="bg-yellow-500 text-black hover:bg-yellow-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New List
              </Button>
            </div>

            {/* Usage Info */}
            {usage && (
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {usage.spotListCount} of{' '}
                  {usage.maxSpotLists === -1 ? 'Unlimited' : usage.maxSpotLists} lists
                </span>
                {usage.maxSpotLists !== -1 && (
                  <span>
                    {usage.totalSpotsCount} of{' '}
                    {usage.maxTotalSpots === -1 ? 'Unlimited' : usage.maxTotalSpots} total spots
                  </span>
                )}
                {usage.subscription !== 'premium' && (
                  <Link
                    href="/pricing"
                    className="text-yellow-500 hover:text-yellow-400 no-underline"
                  >
                    Upgrade for unlimited
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Lists Grid */}
        <section className="container py-8">
          {spotLists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {spotLists.map((list) => (
                <Card
                  key={list._id}
                  className="group cursor-pointer hover:border-yellow-500 transition-colors"
                  onClick={() => router.push(`/my-spots/${list._id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Folder className="h-8 w-8 text-yellow-500" />
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-yellow-500 transition-colors">
                            {list.name}
                          </h3>
                          <Badge variant="secondary" className="mt-1">
                            {list.spotCount || 0} spot{list.spotCount !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => handleOpenEditDialog(list, e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => handleDeleteClick(list, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {list.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {list.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Folder className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold text-foreground mb-2">No spot lists yet</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Create a list to start saving your favorite skate spots
              </p>
              <Button
                onClick={handleOpenCreateDialog}
                className="bg-yellow-500 text-black hover:bg-yellow-400"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First List
              </Button>
            </div>
          )}
        </section>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogMode === 'create' ? 'Create New List' : 'Edit List'}</DialogTitle>
              <DialogDescription>
                {dialogMode === 'create'
                  ? 'Create a new list to organize your favorite skate spots.'
                  : 'Update your list details.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">List Name</label>
                <Input
                  placeholder="My Favorite Parks"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Description (optional)
                </label>
                <Input
                  placeholder="The best skate spots in my area"
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveList}
                disabled={!listName.trim() || saving}
                className="bg-yellow-500 text-black hover:bg-yellow-400"
              >
                {saving ? 'Saving...' : dialogMode === 'create' ? 'Create' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete List</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{listToDelete?.name}&quot;? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
