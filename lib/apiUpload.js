import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.thetrickbook.com/api';

/**
 * Create a video entry and get upload credentials
 */
export async function createVideoEntry(title, token) {
  const response = await axios.post(
    `${API_BASE_URL}/upload/video/create`,
    { title },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

/**
 * Check video processing status
 */
export async function getVideoStatus(videoId) {
  const response = await axios.get(`${API_BASE_URL}/upload/video/${videoId}/status`);
  return response.data;
}

/**
 * Delete a video
 */
export async function deleteVideo(videoId, token) {
  const response = await axios.delete(`${API_BASE_URL}/upload/video/${videoId}`, {
    headers: {
      'x-auth-token': token,
    },
  });
  return response.data;
}

/**
 * Upload video using TUS resumable upload protocol
 * This uploads directly to Bunny.net CDN
 */
export async function uploadVideoTUS(file, credentials, onProgress) {
  // Dynamic import of tus-js-client
  const tus = await import('tus-js-client');

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: credentials.tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: credentials.headers.AuthorizationSignature,
        AuthorizationExpire: credentials.headers.AuthorizationExpire,
        VideoId: credentials.headers.VideoId,
        LibraryId: credentials.headers.LibraryId,
      },
      metadata: {
        filename: file.name,
        filetype: file.type,
      },
      onError: (error) => {
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        onProgress?.(parseFloat(percentage), bytesUploaded, bytesTotal);
      },
      onSuccess: () => {
        resolve({
          videoId: credentials.videoId,
          success: true,
        });
      },
    });

    // Check for previous uploads to resume
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });
  });
}

/**
 * Poll for video processing completion
 */
export async function waitForVideoProcessing(videoId, maxAttempts = 60, intervalMs = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await getVideoStatus(videoId);

    if (status.isReady) {
      return status;
    }

    if (status.status === 'error' || status.status === 'upload_failed') {
      throw new Error(`Video processing failed: ${status.status}`);
    }

    // Wait before next check
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Video processing timed out');
}

// =============================================
// IMAGE UPLOAD FUNCTIONS
// =============================================

/**
 * Get a presigned URL for uploading an image to S3
 */
export async function getImageUploadUrl(filename, contentType, token) {
  const response = await axios.post(
    `${API_BASE_URL}/upload/image/presign`,
    { filename, contentType },
    {
      headers: {
        'x-auth-token': token,
      },
    },
  );
  return response.data;
}

/**
 * Upload an image file directly to S3 using presigned URL
 */
export async function uploadImageToS3(file, token, onProgress) {
  // Step 1: Get presigned URL
  const { uploadUrl, fileUrl, key } = await getImageUploadUrl(file.name, file.type, token);

  // Step 2: Upload directly to S3
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      const percentage = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
      onProgress?.(parseFloat(percentage), progressEvent.loaded, progressEvent.total);
    },
  });

  return {
    fileUrl,
    key,
  };
}

/**
 * Delete an image from S3
 */
export async function deleteImage(key, token) {
  const response = await axios.delete(`${API_BASE_URL}/upload/image`, {
    headers: {
      'x-auth-token': token,
    },
    data: { key },
  });
  return response.data;
}
