import {
  Eye,
  EyeOff,
  Film,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import Header from '../../../components/Header';
import { Button } from '../../../components/ui/button';
import { deleteVideo, getAdminVideos, syncFromDrive, updateVideo } from '../../../lib/apiMedia';

export default function AdminCouch() {
  const router = useRouter();
  const { loggedIn, token, role } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const data = await getAdminVideos(token);
      setVideos(data);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn === false || (loggedIn && role !== 'admin')) {
      router.push('/login');
      return;
    }

    if (loggedIn && role === 'admin' && token) {
      fetchVideos();
    }
  }, [loggedIn, role, token, router, fetchVideos]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncFromDrive(token);
      alert(result.message);
      fetchVideos();
    } catch (error) {
      alert(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const handleTogglePublish = async (video) => {
    try {
      await updateVideo(video._id, { isPublished: !video.isPublished }, token);
      setVideos((prev) =>
        prev.map((v) => (v._id === video._id ? { ...v, isPublished: !v.isPublished } : v)),
      );
    } catch (_error) {}
  };

  const handleToggleFeatured = async (video) => {
    try {
      await updateVideo(video._id, { isFeatured: !video.isFeatured }, token);
      setVideos((prev) =>
        prev.map((v) => (v._id === video._id ? { ...v, isFeatured: !v.isFeatured } : v)),
      );
    } catch (_error) {}
  };

  const handleDelete = async (video) => {
    if (!confirm(`Are you sure you want to delete "${video.title}"?`)) return;

    try {
      await deleteVideo(video._id, token);
      setVideos((prev) => prev.filter((v) => v._id !== video._id));
    } catch (_error) {}
  };

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.sportTypes?.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const _formatDuration = (seconds) => {
    if (!seconds) return '-';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  if (loading || loggedIn === null) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Manage The Couch | Admin | Trick Book</title>
      </Head>
      <Header />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">The Couch</h1>
              <p className="text-muted-foreground">Manage videos, collections, and content</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync from Drive
              </Button>
              <Link href="/admin/couch/add">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Video
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm">Total Videos</p>
              <p className="text-2xl font-bold text-foreground">{videos.length}</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm">Published</p>
              <p className="text-2xl font-bold text-green-500">
                {videos.filter((v) => v.isPublished).length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm">Unpublished</p>
              <p className="text-2xl font-bold text-yellow-500">
                {videos.filter((v) => !v.isPublished).length}
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4">
              <p className="text-muted-foreground text-sm">Featured</p>
              <p className="text-2xl font-bold text-foreground">
                {videos.filter((v) => v.isFeatured).length}
              </p>
            </div>
          </div>

          {/* Video List */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-16">
              <Film className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">No videos yet</h2>
              <p className="text-muted-foreground mb-6">
                Add videos manually or sync from Google Drive.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Video
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                      Sport
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                      Year
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                      Size
                    </th>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVideos.map((video) => (
                    <tr key={video._id} className="border-t border-border hover:bg-secondary/50">
                      <td className="p-4">
                        <Link
                          href={`/admin/couch/edit/${video._id}`}
                          className="flex items-center gap-3 group"
                        >
                          <div className="w-16 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                            {video.thumbnails?.poster || video.driveThumbnail ? (
                              <img
                                src={video.thumbnails?.poster || video.driveThumbnail}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-xs group-hover:text-yellow-500 transition-colors">
                              {video.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {video.hlsUrl
                                ? 'Bunny.net'
                                : video.driveFileId
                                  ? 'Google Drive'
                                  : 'No source'}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm text-foreground capitalize">
                          {video.sportTypes?.join(', ') || '-'}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-foreground">{video.releaseYear || '-'}</span>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {formatSize(video.size)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {video.isPublished ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-500">
                              Draft
                            </span>
                          )}
                          {video.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleTogglePublish(video)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            title={video.isPublished ? 'Unpublish' : 'Publish'}
                          >
                            {video.isPublished ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(video)}
                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                            title={video.isFeatured ? 'Remove featured' : 'Set featured'}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                video.isFeatured
                                  ? 'text-yellow-500 fill-current'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          </button>
                          <Link href={`/admin/couch/edit/${video._id}`}>
                            <button
                              className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors"
                              title="Edit metadata"
                            >
                              <Pencil className="h-4 w-4 text-yellow-500" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(video)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
