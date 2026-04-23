import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { TECH } from '../data/config';

/**
 * USE PRODUCT STORAGE HOOK (ASSET DEPLOYMENT SERVICE)
 * -----------------------------------------------------------
 * Specialized service for processing and managing remote visual assets.
 */
export function useProductStorage() {
  /**
   * uploadProductVisual: Processes and deploys dual-quality images to storage.
   * @param targetProduct - The product entity associated with the visual.
   * @param visualFile - The raw image file selected for upload.
   */
  const uploadProductVisual = useCallback(
    async (targetProduct: Product, visualFile: File) => {
      try {
        const { processDualQualityVisuals } = await import('../utils/image');
        const { hq: highQualityAsset, lq: previewAsset } =
          await processDualQualityVisuals(visualFile);

        // Storage Hygiene: Identify and remove legacy assets before new deployment
        if (targetProduct.image_url) {
          try {
            const assetUrl = new URL(targetProduct.image_url);
            const legacyFileName = assetUrl.pathname.split('/').pop();
            if (legacyFileName && !legacyFileName.includes('placeholder')) {
              await supabase.storage
                .from(TECH.storage.bucket)
                .remove([
                  `${TECH.storage.lqFolder}/${legacyFileName}`,
                  `${TECH.storage.hqFolder}/${legacyFileName}`,
                ]);
            }
          } catch {
            // Non-critical: hygiene failure doesn't block deployment
          }
        }

        // SEO-Optimized Naming Strategy
        const turkishCharMap: Record<string, string> = {
          ç: 'c',
          ğ: 'g',
          ı: 'i',
          ö: 'o',
          ş: 's',
          ü: 'u',
          Ç: 'C',
          Ğ: 'G',
          İ: 'I',
          Ö: 'O',
          Ş: 'S',
          Ü: 'U',
        };
        const sanitizedProductName = targetProduct.name
          .replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => turkishCharMap[char])
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]+/g, '')
          .substring(0, TECH.products.maxFileNameLength);

        const uniqueSuffix = Math.random()
          .toString(36)
          .substring(2, 2 + TECH.products.uniqueIdSuffixLength);
        const storageFileName = `${sanitizedProductName}-${targetProduct.id.substring(0, 4)}-${uniqueSuffix}.jpg`;

        const lqStoragePath = `${TECH.storage.lqFolder}/${storageFileName}`;
        const hqStoragePath = `${TECH.storage.hqFolder}/${storageFileName}`;

        // Concurrent Deployment: LQ and HQ assets uploaded in parallel
        const [lqUploadResponse, hqUploadResponse] = await Promise.all([
          supabase.storage
            .from(TECH.storage.bucket)
            .upload(lqStoragePath, previewAsset, {
              upsert: true,
              cacheControl: TECH.storage.cacheControl,
            }),
          supabase.storage
            .from(TECH.storage.bucket)
            .upload(hqStoragePath, highQualityAsset, {
              upsert: true,
              cacheControl: TECH.storage.cacheControl,
            }),
        ]);

        if (lqUploadResponse.error) throw lqUploadResponse.error;
        if (hqUploadResponse.error) throw hqUploadResponse.error;

        // Generate Finalized URL with cache-busting timestamp
        const {
          data: { publicUrl },
        } = supabase.storage
          .from(TECH.storage.bucket)
          .getPublicUrl(lqStoragePath);
        return `${publicUrl}?t=${Date.now()}`;
      } catch (criticalError: unknown) {
        console.error('Visual asset deployment failed:', criticalError);
        throw criticalError;
      }
    },
    [],
  );

  /**
   * removeProductVisual: Completely deletes associated visuals from storage tiers.
   * @param visualUrl - The public URL of the asset to be decommissioned.
   */
  const removeProductVisual = useCallback(async (visualUrl: string) => {
    try {
      const assetUrl = new URL(visualUrl);
      const fileName = assetUrl.pathname.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from(TECH.storage.bucket)
          .remove([
            `${TECH.storage.lqFolder}/${fileName}`,
            `${TECH.storage.hqFolder}/${fileName}`,
          ]);
      }
    } catch (cleanupError) {
      console.error('Visual asset decommission failed:', cleanupError);
    }
  }, []);

  return {
    uploadImage: uploadProductVisual,
    deleteImage: removeProductVisual,
  };
}
