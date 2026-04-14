import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CAROUSEL, TECH } from '../data/config';

export interface Slide {
  id: number;
  src: string;
  bg: string;
  label: string;
  sub: string;
}

const STORE_SLUG = import.meta.env.VITE_STORE_SLUG;

/**
 * USE CAROUSEL HOOK (TECHNICAL TOKENS & A-LEVEL ENGLISH)
 * -----------------------------------------------------------
 * Orchestrates the hero visual experience and marketing slide synchronization.
 */
export function useCarousel(isAdministrativeModeActive: boolean) {
  const [marketingSlides, setMarketingSlides] = useState<Slide[]>(CAROUSEL.slides);
  const [isCarouselContentLoading, setIsCarouselContentLoading] = useState(true);

  /**
   * synchronizeCarouselSlides: Fetches remote slide data from Supabase repository.
   */
  const synchronizeCarouselSlides = useCallback(async () => {
    setIsCarouselContentLoading(true);
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('carousel_slides')
      .eq('slug', STORE_SLUG)
      .single();

    if (storeData && !fetchError && storeData.carousel_slides) {
      setMarketingSlides(storeData.carousel_slides);
    }
    setIsCarouselContentLoading(false);
  }, []);

  useEffect(() => {
    synchronizeCarouselSlides();
  }, [synchronizeCarouselSlides]);

  /**
   * modifySlideContent: Updates local state and persists changes to Supabase if admin.
   */
  const modifySlideContent = useCallback(async (slideId: number, contentChanges: Partial<Slide>) => {
    setMarketingSlides(previousSlides => {
      const updatedSlides = previousSlides.map(slide => 
        slide.id === slideId ? { ...slide, ...contentChanges } : slide
      );
      
      // Persistent update for administrative actions
      if (isAdministrativeModeActive) {
        supabase
          .from('stores')
          .update({ carousel_slides: updatedSlides })
          .eq('slug', STORE_SLUG)
          .then(({ error: updateError }) => {
            if (updateError) console.error('Persistent carousel update failed:', updateError);
          });
      }
      
      return updatedSlides;
    });
  }, [isAdministrativeModeActive]);

  /**
   * uploadHeroVisualAsset: Processes and uploads a new high-quality image for a slide.
   */
  const uploadHeroVisualAsset = useCallback(async (slideId: number, visualFile: File) => {
    try {
      const { processDualQualityVisuals } = await import('../utils/image');
      // Technical Token: Professional resolution defined in config
      const { hq: optimizedVisual } = await processDualQualityVisuals(visualFile, TECH.storage.heroWidth);

      const visualFileName = `hero-${STORE_SLUG}-${slideId}-${Date.now()}.jpg`;
      const storagePath = `${TECH.storage.heroFolder}/${visualFileName}`;

      const { error: storageUploadError } = await supabase.storage
        .from(TECH.storage.bucket)
        .upload(storagePath, optimizedVisual, { 
          upsert: true, 
          cacheControl: TECH.storage.cacheControl 
        });

      if (storageUploadError) throw storageUploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(TECH.storage.bucket)
        .getPublicUrl(storagePath);

      // Cache busting suffix for immediate visual feedback
      const finalizedVisualUrl = `${publicUrl}?t=${Date.now()}`;
      await modifySlideContent(slideId, { src: finalizedVisualUrl });
      return finalizedVisualUrl;

    } catch (criticalError) {
      console.error('Hero visual asset deployment failed:', criticalError);
      throw criticalError;
    }
  }, [modifySlideContent]);

  return { 
    slides: marketingSlides, 
    updateSlide: modifySlideContent, 
    uploadHeroImage: uploadHeroVisualAsset, 
    loading: isCarouselContentLoading 
  };
}
