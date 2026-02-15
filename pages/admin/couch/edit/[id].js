import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Youtube,
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../../auth/AuthContext';
import Header from '../../../../components/Header';
import { Button } from '../../../../components/ui/button';
import {
  CONTENT_TYPES,
  createBunnyVideo,
  deleteVideo,
  fetchYouTubeMetadata,
  getVideoDetails,
  SPORT_TYPES,
  updateVideo,
} from '../../../../lib/apiMedia';
import { uploadImageToS3 } from '../../../../lib/apiUpload';

const TAGS = [
  'street',
  'park',
  'vert',
  'freestyle',
  'backcountry',
  'big mountain',
  'rail',
  'jib',
  'flatground',
  'mega ramp',
  'contest',
  'documentary',
  'classic',
];

export default function EditVideo() {
  const router = useRouter();
  const { id } = router.query;
  const { loggedIn, token, role } = useContext(AuthContext);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sportTypes: [],
    type: 'film',
    tags: [],
    releaseYear: '',
    producedBy: '',
    riders: [],
    sponsors: [],
    duration: '',
    youtubeUrl: '',
    thumbnails: {
      poster: '',
      backdrop: '',
    },
    bunnyVideoId: '',
    hlsUrl: '',
    driveFileId: '',
    driveThumbnail: '',
    isPublished: false,
    isFeatured: false,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetchingYouTube, setFetchingYouTube] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailProgress, setThumbnailProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Input state for array fields
  const [riderInput, setRiderInput] = useState('');
  const [sponsorInput, setSponsorInput] = useState('');
  const [youtubeInput, setYoutubeInput] = useState('');

  useEffect(() => {
    if (loggedIn === false || (loggedIn && role !== 'admin')) {
      router.push('/login');
    }
  }, [loggedIn, role, router]);

  useEffect(() => {
    if (id && token) {
      fetchVideo();
    }
  }, [id, token, fetchVideo]);

  const fetchVideo = async () => {
    setLoading(true);
    try {
      const video = await getVideoDetails(id);
      setFormData({
        title: video.title || '',
        description: video.description || '',
        sportTypes: video.sportTypes || [],
        type: video.type || 'film',
        tags: video.tags || [],
        releaseYear: video.releaseYear || '',
        producedBy: video.producedBy || '',
        riders: video.riders || [],
        sponsors: video.sponsors || [],
        duration: video.duration || '',
        youtubeUrl: video.youtubeUrl || '',
        thumbnails: video.thumbnails || { poster: '', backdrop: '' },
        bunnyVideoId: video.bunnyVideoId || '',
        hlsUrl: video.hlsUrl || '',
        driveFileId: video.driveFileId || '',
        driveThumbnail: video.driveThumbnail || '',
        isPublished: video.isPublished || false,
        isFeatured: video.isFeatured || false,
      });
    } catch (_err) {
      setError('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSportToggle = (sport) => {
    setFormData((prev) => ({
      ...prev,
      sportTypes: prev.sportTypes.includes(sport)
        ? prev.sportTypes.filter((s) => s !== sport)
        : [...prev.sportTypes, sport],
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const addRider = () => {
    if (riderInput.trim() && !formData.riders.includes(riderInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        riders: [...prev.riders, riderInput.trim()],
      }));
      setRiderInput('');
    }
  };

  const removeRider = (rider) => {
    setFormData((prev) => ({
      ...prev,
      riders: prev.riders.filter((r) => r !== rider),
    }));
  };

  const addSponsor = () => {
    if (sponsorInput.trim() && !formData.sponsors.includes(sponsorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        sponsors: [...prev.sponsors, sponsorInput.trim()],
      }));
      setSponsorInput('');
    }
  };

  const removeSponsor = (sponsor) => {
    setFormData((prev) => ({
      ...prev,
      sponsors: prev.sponsors.filter((s) => s !== sponsor),
    }));
  };

  const handleFetchYouTube = async () => {
    if (!youtubeInput.trim()) return;

    setFetchingYouTube(true);
    setError('');

    try {
      const metadata = await fetchYouTubeMetadata(youtubeInput, token);
      setFormData((prev) => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        releaseYear: metadata.releaseYear || prev.releaseYear,
        producedBy: metadata.author || prev.producedBy,
        youtubeUrl: youtubeInput,
        thumbnails: {
          ...prev.thumbnails,
          poster: metadata.thumbnail || prev.thumbnails.poster,
        },
      }));
      setYoutubeInput('');
      setSuccess('YouTube metadata imported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (_err) {
      setError('Failed to fetch YouTube metadata. Please check the URL.');
    } finally {
      setFetchingYouTube(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!formData.title) {
      setError('Please enter a title before uploading');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // Create Bunny video first
      const bunnyVideo = await createBunnyVideo(formData.title, token);

      // Upload to Bunny.net using XMLHttpRequest for progress tracking
      const libraryId = bunnyVideo.libraryId;
      const videoId = bunnyVideo.guid;

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`);
        xhr.setRequestHeader('AccessKey', bunnyVideo.uploadKey);
        xhr.send(file);
      });

      // Update form with Bunny video info
      setFormData((prev) => ({
        ...prev,
        bunnyVideoId: videoId,
        hlsUrl: `https://${bunnyVideo.cdnHostname}/${videoId}/playlist.m3u8`,
      }));

      setUploadProgress(100);
      setSuccess('Video uploaded successfully! It may take a few minutes to process.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (_err) {
      setError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be less than 5MB');
      return;
    }

    setUploadingThumbnail(true);
    setThumbnailProgress(0);
    setError('');

    try {
      const result = await uploadImageToS3(file, token, (progress) => {
        setThumbnailProgress(progress);
      });

      // Update form with the uploaded thumbnail URL
      setFormData((prev) => ({
        ...prev,
        thumbnails: { ...prev.thumbnails, poster: result.fileUrl },
      }));

      setThumbnailProgress(100);
      setSuccess('Thumbnail uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (_err) {
      setError('Failed to upload thumbnail. Please try again.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSubmit = async (publish = null) => {
    if (!formData.title) {
      setError('Title is required');
      return;
    }

    if (formData.sportTypes.length === 0) {
      setError('Please select at least one sport type');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const videoData = {
        ...formData,
        isPublished: publish !== null ? publish : formData.isPublished,
        releaseYear: formData.releaseYear ? parseInt(formData.releaseYear, 10) : null,
        duration: formData.duration ? parseInt(formData.duration, 10) : null,
      };

      await updateVideo(id, videoData, token);
      setSuccess('Video updated successfully!');

      if (publish !== null) {
        setFormData((prev) => ({ ...prev, isPublished: publish }));
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (_err) {
      setError('Failed to update video. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${formData.title}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteVideo(id, token);
      router.push('/admin/couch');
    } catch (_err) {
      setError('Failed to delete video');
      setDeleting(false);
    }
  };

  const getVideoSource = () => {
    if (formData.hlsUrl) return 'Bunny.net (HLS)';
    if (formData.driveFileId) return 'Google Drive';
    if (formData.youtubeUrl) return 'YouTube Link';
    return 'No video source';
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
        <title>Edit: {formData.title} | Admin | Trick Book</title>
      </Head>
      <Header />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/admin/couch">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Edit Video</h1>
                <p className="text-muted-foreground">Source: {getVideoSource()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {formData.isPublished ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-500">
                  Published
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-500">
                  Draft
                </span>
              )}
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}

          <div className="space-y-8">
            {/* Video Source Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Video Source</h2>
              <div className="space-y-4">
                {formData.hlsUrl && (
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <p className="text-sm font-medium text-green-500">Bunny.net Stream</p>
                    <p className="text-xs text-muted-foreground truncate">{formData.hlsUrl}</p>
                  </div>
                )}
                {formData.driveFileId && (
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <p className="text-sm font-medium text-blue-500">Google Drive</p>
                    <p className="text-xs text-muted-foreground">ID: {formData.driveFileId}</p>
                  </div>
                )}
                {!formData.hlsUrl && !formData.driveFileId && (
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-sm font-medium text-yellow-500">No video source</p>
                    <p className="text-xs text-muted-foreground">Upload a video below</p>
                  </div>
                )}
              </div>
            </div>

            {/* YouTube Import Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                Import Metadata from YouTube
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="Paste YouTube URL to update metadata..."
                  className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <Button
                  onClick={handleFetchYouTube}
                  disabled={fetchingYouTube || !youtubeInput}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {fetchingYouTube ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                </Button>
              </div>
            </div>

            {/* Video Upload Section */}
            {!formData.hlsUrl && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Upload className="h-5 w-5 text-yellow-500" />
                  Upload to Bunny.net (Replace Drive Source)
                </h2>
                {uploading ? (
                  <div className="space-y-2">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload video file
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Basic Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Basic Information</h2>
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter video title"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter video description"
                    rows={4}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  />
                </div>

                {/* Thumbnail Section */}
                <div className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
                  <label className="block text-sm font-medium text-foreground">Thumbnail</label>

                  {/* Current Thumbnail Preview */}
                  {(formData.thumbnails?.poster || formData.driveThumbnail) && (
                    <div className="flex items-start gap-4">
                      <div className="relative w-48 h-28 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={formData.thumbnails?.poster || formData.driveThumbnail}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">Current thumbnail</p>
                        <p className="text-xs truncate max-w-xs">
                          {formData.thumbnails?.poster || formData.driveThumbnail}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Upload Thumbnail File */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a new thumbnail image:
                    </p>
                    {uploadingThumbnail ? (
                      <div className="space-y-2">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500 transition-all"
                            style={{ width: `${thumbnailProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Uploading thumbnail... {thumbnailProgress.toFixed(0)}%
                        </p>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-yellow-500 transition-colors">
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-sm text-muted-foreground">
                          Click to upload image (max 5MB)
                        </span>
                        <span className="text-xs text-muted-foreground">
                          JPG, PNG, WebP supported
                        </span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Or: Enter URL */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or enter URL</span>
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={formData.thumbnails?.poster || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          thumbnails: { ...prev.thumbnails, poster: e.target.value },
                        }))
                      }
                      placeholder="https://example.com/thumbnail.jpg"
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Categories & Tags</h2>
              <div className="space-y-6">
                {/* Sport Types */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sport Types *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_TYPES.filter((s) => s.value !== 'all').map((sport) => (
                      <button
                        key={sport.value}
                        type="button"
                        onClick={() => handleSportToggle(sport.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.sportTypes.includes(sport.value)
                            ? 'bg-yellow-500 text-black'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {sport.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Content Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    {CONTENT_TYPES.filter((t) => t.value !== 'all').map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.tags.includes(tag)
                            ? 'bg-yellow-500 text-black'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Credits */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Credits & Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Release Year */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Release Year
                  </label>
                  <input
                    type="number"
                    name="releaseYear"
                    value={formData.releaseYear}
                    onChange={handleChange}
                    placeholder="e.g. 2023"
                    min="1950"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="e.g. 3600 for 1 hour"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Produced By */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Produced By
                  </label>
                  <input
                    type="text"
                    name="producedBy"
                    value={formData.producedBy}
                    onChange={handleChange}
                    placeholder="e.g. Girl Skateboards, Brain Farm"
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                {/* Riders */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Featured Riders
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={riderInput}
                      onChange={(e) => setRiderInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRider())}
                      placeholder="Add rider name"
                      className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <Button type="button" onClick={addRider} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.riders.map((rider) => (
                      <span
                        key={rider}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                      >
                        {rider}
                        <button
                          type="button"
                          onClick={() => removeRider(rider)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Sponsors */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1">Sponsors</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={sponsorInput}
                      onChange={(e) => setSponsorInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSponsor())}
                      placeholder="Add sponsor"
                      className="flex-1 px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <Button type="button" onClick={addSponsor} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.sponsors.map((sponsor) => (
                      <span
                        key={sponsor}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm"
                      >
                        {sponsor}
                        <button
                          type="button"
                          onClick={() => removeSponsor(sponsor)}
                          className="hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Publishing Options</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-border bg-secondary text-yellow-500 focus:ring-yellow-500"
                  />
                  <div>
                    <span className="font-medium text-foreground">Featured Video</span>
                    <p className="text-sm text-muted-foreground">
                      Display prominently on The Couch homepage
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-500 mb-4">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently delete this video. This action cannot be undone.
              </p>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Video
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Link href="/admin/couch">
                <Button variant="ghost">Cancel</Button>
              </Link>
              <div className="flex gap-3">
                {formData.isPublished ? (
                  <Button onClick={() => handleSubmit(false)} disabled={saving} variant="outline">
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <EyeOff className="h-4 w-4 mr-2" />
                    )}
                    Unpublish
                  </Button>
                ) : (
                  <Button onClick={() => handleSubmit(true)} disabled={saving} variant="outline">
                    {saving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    Publish
                  </Button>
                )}
                <Button
                  onClick={() => handleSubmit()}
                  disabled={saving}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
