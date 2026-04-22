// FILE ROLE: Visual Asset Orchestrator (Processing, Compression, URL Resolution)
// DEPENDS ON: TECH constants, THEME colors, FileReader API
// CONSUMED BY: ProductCard.tsx, HeroCarousel.tsx, AddProductModal.tsx
import { TECH, LABELS, THEME } from '../data/config';

/**
 * resolveVisualAssetUrl: Harmonizes raw storage paths into valid public URLs.
 */
export const resolveVisualAssetUrl = (assetPath: string | null | undefined): string | null => {
  if (!assetPath) return null;
  // Early exit if the path is already an absolute URL or data URI
  if (assetPath.startsWith('http') || assetPath.startsWith('data:')) return assetPath;
  
  const applicationBaseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const standardizedPath = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  return `${applicationBaseUrl}${standardizedPath}`;
};

// Centralized placeholder for products without images
export const PLACEHOLDER_VISUAL_SYMBOL = TECH.storage.placeholderEmoji;

/**
 * transformFileToVisualElement: Asynchronously converts a raw File object to an HTML Image.
 */
const transformFileToVisualElement = (visualFile: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      const visualElement = new Image();
      visualElement.onload = () => resolve(visualElement);
      visualElement.onerror = () => reject(new Error(LABELS.errors.imageLoad));
      visualElement.src = event.target?.result as string;
    };
    fileReader.onerror = () => reject(new Error(LABELS.errors.fileRead));
    fileReader.readAsDataURL(visualFile);
  });
};

/**
 * processDualQualityVisuals: Generates high-definition and preview-optimized copies from a single file.
 */
export async function processDualQualityVisuals(visualFile: File, hqMaxWidth?: number): Promise<{ hq: Blob, lq: Blob }> {
  const visualElement = await transformFileToVisualElement(visualFile);
  
  /**
   * generateOptimizedBlob: Resizes and compresses the image into a specific Blob tier.
   */
  const generateOptimizedBlob = (maximumDimension: number, compressionQuality: number): Promise<Blob> => {
    return new Promise((resolve) => {
      const drawingCanvas = document.createElement('canvas');
      let { width: originalWidth, height: originalHeight } = visualElement;

      // Aspect-Ratio Preserving Downscaling Logic
      if (originalWidth > originalHeight && originalWidth > maximumDimension) {
        originalHeight = Math.round((originalHeight * maximumDimension) / originalWidth);
        originalWidth = maximumDimension;
      } else if (originalHeight > maximumDimension) {
        originalWidth = Math.round((originalWidth * maximumDimension) / originalHeight);
        originalHeight = maximumDimension;
      }

      drawingCanvas.width = originalWidth;
      drawingCanvas.height = originalHeight;
      const drawingContext = drawingCanvas.getContext('2d');
      
      if (drawingContext) {
        // Fallback Background: Prevents transparency issues in JPEGs
        drawingContext.fillStyle = THEME.colors.visualFallback;
        drawingContext.fillRect(0, 0, originalWidth, originalHeight);
        drawingContext.drawImage(visualElement, 0, 0, originalWidth, originalHeight);
      }
      
      drawingCanvas.toBlob((optimizedBlob) => resolve(optimizedBlob!), 'image/jpeg', compressionQuality);
    });
  };

  // Tier 1: High-Definition Asset for Zoom/Detail views
  const hqLimit = hqMaxWidth || TECH.storage.productHqWidth;
  const highDefinitionAsset = await generateOptimizedBlob(hqLimit, TECH.storage.hqQuality);
  
  // Tier 2: Lightweight Preview Asset for Catalog/Grid views
  const previewLightweightAsset = await generateOptimizedBlob(TECH.storage.productLqWidth, TECH.storage.lqQuality);

  return { hq: highDefinitionAsset, lq: previewLightweightAsset };
}

/**
 * compressVisualToDataUri: Legacy-compatible compression for immediate Base64 feedback.
 */
export async function compressVisualToDataUri(visualFile: File, maximumDimension: number, compressionQuality: number): Promise<string> {
  const visualElement = await transformFileToVisualElement(visualFile);
  const drawingCanvas = document.createElement('canvas');
  let { width: originalWidth, height: originalHeight } = visualElement;

  if (originalWidth > originalHeight && originalWidth > maximumDimension) {
    originalHeight = Math.round((originalHeight * maximumDimension) / originalWidth);
    originalWidth = maximumDimension;
  } else if (originalHeight > maximumDimension) {
    originalWidth = Math.round((originalWidth * maximumDimension) / originalHeight);
    originalHeight = maximumDimension;
  }

  drawingCanvas.width = originalWidth;
  drawingCanvas.height = originalHeight;
  const drawingContext = drawingCanvas.getContext('2d');
  
  if (drawingContext) {
    drawingContext.fillStyle = THEME.colors.visualFallback;
    drawingContext.fillRect(0, 0, originalWidth, originalHeight);
    drawingContext.drawImage(visualElement, 0, 0, originalWidth, originalHeight);
  }
  
  return drawingCanvas.toDataURL('image/jpeg', compressionQuality);
}
/**
 * resizeImageForAI: Downscales image to AI-friendly dimensions to prevent 413 errors.
 */
export async function resizeImageForAI(imageFile: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(imageFile);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      const maxSize = 1024;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Resize failed'));
        URL.revokeObjectURL(img.src);
      }, 'image/jpeg', 0.82);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(img.src);
      reject(err);
    };
  });
}
