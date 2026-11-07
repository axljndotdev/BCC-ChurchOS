/**
 * High-performance browser-side image compression utility.
 * Resizes and encodes images to WebP/JPEG data URLs under strict byte size budgets
 * to prevent Firestore document size limit (1MB) errors.
 */

export interface CompressOptions {
  maxDimension?: number; // e.g. 1200px
  targetMaxSizeBytes?: number; // e.g. 50000 bytes (50KB)
  initialQuality?: number; // 0.7
  format?: 'image/webp' | 'image/jpeg';
}

export interface CropAdjustmentOptions {
  aspectRatio?: number | null; // e.g., 16/9, 4/3, 1, 4/5, null for free/natural
  zoom?: number; // 1 to 3
  panX?: number; // -50 to 50 (% offset)
  panY?: number; // -50 to 50 (% offset)
  rotation?: number; // 0, 90, 180, 270 degrees
  flipH?: boolean;
  flipV?: boolean;
  fitMode?: 'cover' | 'contain';
  brightness?: number; // 50 to 150 (100 default)
  contrast?: number; // 50 to 150 (100 default)
  saturation?: number; // 0 to 200 (100 default)
  targetMaxSizeBytes?: number;
  maxDimension?: number;
}

/**
 * Loads an image with crossOrigin support and generates an adjusted/cropped canvas data URL.
 */
export async function cropAndAdjustImage(
  imageSource: string | File | Blob,
  options: CropAdjustmentOptions = {}
): Promise<string> {
  const {
    aspectRatio = null,
    zoom = 1,
    panX = 0,
    panY = 0,
    rotation = 0,
    flipH = false,
    flipV = false,
    fitMode = 'cover',
    brightness = 100,
    contrast = 100,
    saturation = 100,
    maxDimension = 1400,
    targetMaxSizeBytes = 180 * 1024
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;

    img.onload = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }

      try {
        const origW = img.naturalWidth || img.width;
        const origH = img.naturalHeight || img.height;

        // Determine destination canvas dimensions
        let destW = origW;
        let destH = origH;

        if (aspectRatio && aspectRatio > 0) {
          if (destW / destH > aspectRatio) {
            destW = Math.round(destH * aspectRatio);
          } else {
            destH = Math.round(destW / aspectRatio);
          }
        }

        // Clamp to max dimension
        if (destW > maxDimension || destH > maxDimension) {
          if (destW > destH) {
            destH = Math.round((destH * maxDimension) / destW);
            destW = maxDimension;
          } else {
            destW = Math.round((destW * maxDimension) / destH);
            destH = maxDimension;
          }
        }

        destW = Math.max(10, destW);
        destH = Math.max(10, destH);

        const canvas = document.createElement('canvas');
        canvas.width = destW;
        canvas.height = destH;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }

        // Fill background
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, destW, destH);

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

        // Canvas transformations (Center origin)
        ctx.save();
        ctx.translate(destW / 2, destH / 2);

        // Rotation & Flips
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        // Calculate scaling
        let scale = 1;
        if (fitMode === 'contain') {
          scale = Math.min(destW / origW, destH / origH) * zoom;
        } else {
          // cover
          scale = Math.max(destW / origW, destH / origH) * zoom;
        }

        const drawW = origW * scale;
        const drawH = origH * scale;

        // Apply Pan offsets (panX and panY are in percentage of destination dimensions)
        const offsetX = (panX / 100) * destW;
        const offsetY = (panY / 100) * destH;

        ctx.drawImage(
          img,
          -drawW / 2 + offsetX,
          -drawH / 2 + offsetY,
          drawW,
          drawH
        );

        ctx.restore();

        // Convert to web-optimized data URL
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Compression loop
        for (let i = 0; i < 4; i++) {
          const byteLen = Math.round((dataUrl.length * 3) / 4);
          if (byteLen <= targetMaxSizeBytes || quality <= 0.4) break;
          quality -= 0.15;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      } catch (err) {
        console.warn('Canvas export failed, likely CORS issue. Falling back to original URL.', err);
        if (typeof imageSource === 'string') {
          resolve(imageSource);
        } else {
          reject(err);
        }
      }
    };

    img.onerror = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      if (typeof imageSource === 'string') {
        resolve(imageSource);
      } else {
        reject(new Error('Failed to load image for cropping'));
      }
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      objectUrlToRevoke = URL.createObjectURL(imageSource);
      img.src = objectUrlToRevoke;
    }
  });
}

export async function compressImageToDataUrl(
  input: File | Blob | string,
  options: CompressOptions = {}
): Promise<string> {
  const {
    maxDimension = 1200,
    targetMaxSizeBytes = 55 * 1024, // 55KB max
    initialQuality = 0.7,
    format = 'image/webp'
  } = options;

  // If already a remote HTTP URL, return as-is
  if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
    return input;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    let objectUrlToRevoke: string | null = null;

    img.onload = () => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }

      try {
        let { width, height } = img;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          return reject(new Error('Could not obtain canvas 2D rendering context.'));
        }

        // Fill white background for transparent images when converting to jpeg/webp
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Iterative compression to satisfy targetMaxSizeBytes
        let currentQuality = initialQuality;
        let resultDataUrl = '';

        // Try preferred format (webp or jpeg fallback)
        const mimeTypes: ('image/webp' | 'image/jpeg')[] = [format, 'image/jpeg'];
        let selectedMime = format;

        for (let attempt = 0; attempt < 5; attempt++) {
          resultDataUrl = canvas.toDataURL(selectedMime, currentQuality);

          // If browser returned PNG because webp isn't supported, switch to JPEG
          if (resultDataUrl.startsWith('data:image/png') && selectedMime === 'image/webp') {
            selectedMime = 'image/jpeg';
            resultDataUrl = canvas.toDataURL(selectedMime, currentQuality);
          }

          // Approximate byte size of base64
          const byteLength = Math.round((resultDataUrl.length * 3) / 4);

          if (byteLength <= targetMaxSizeBytes || currentQuality <= 0.35) {
            break;
          }

          // Reduce quality
          currentQuality -= 0.15;
          if (currentQuality < 0.35) {
            // Also scale canvas down by 25% if quality alone is insufficient
            width = Math.round(width * 0.75);
            height = Math.round(height * 0.75);
            canvas.width = Math.max(1, width);
            canvas.height = Math.max(1, height);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            currentQuality = 0.55;
          }
        }

        resolve(resultDataUrl);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => {
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
      reject(new Error('Failed to load image for compression: ' + e));
    };

    if (typeof input === 'string') {
      img.src = input;
    } else {
      objectUrlToRevoke = URL.createObjectURL(input);
      img.src = objectUrlToRevoke;
    }
  });
}
