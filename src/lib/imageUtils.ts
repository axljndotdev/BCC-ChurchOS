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
