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

import { getActiveStoreSlug } from '../utils/store';

export interface Slide {
  id: number;
  src: string;
  bg: string;
  label: string;
  sub: string;
}

const STORE_SLUG = getActiveStoreSlug();

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
    if (STORE_SLUG === 'main-site') {
      setIsCarouselContentLoading(false);
      return;
    }
    
    setIsCarouselContentLoading(true);
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('carousel_data')
      .eq('slug', STORE_SLUG)
      .single();

    if (storeData && !fetchError && storeData.carousel_data?.slides) {
      setMarketingSlides(storeData.carousel_data.slides);
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
    let finalizedSlides: Slide[] = [];

    setMarketingSlides(previousSlides => {
      finalizedSlides = previousSlides.map(slide => 
        slide.id === slideId ? { ...slide, ...contentChanges } : slide
      );
      return finalizedSlides;
    });

    // Persistent update for administrative actions
    if (isAdministrativeModeActive) {
      // Small timeout to ensure finalizedSlides is populated from the functional update if needed, 
      // but in this case we can compute it directly to be safe.
      const currentSlides = marketingSlides.map(slide => 
        slide.id === slideId ? { ...slide, ...contentChanges } : slide
      );

      const { error: updateError } = await supabase
        .from('stores')
        .update({ carousel_data: { slides: currentSlides } })
        .eq('slug', STORE_SLUG);

      if (updateError) console.error('Persistent carousel update failed:', updateError);
    }
  }, [isAdministrativeModeActive, marketingSlides]);

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

  /**
   * addNewSlide: Inserts a new placeholder slide for admin to customize.
   */
  const addNewSlide = useCallback(async () => {
    const nextId = marketingSlides.length > 0 
      ? Math.max(...marketingSlides.map(s => s.id)) + 1 
      : 1;
    
    const newSlide: Slide = {
      id: nextId,
      src: '',
      bg: 'bg-stone-200',
      label: 'Yeni Başlık',
      sub: 'Açıklama metni buraya gelecek.'
    };

    const updatedSlides = [...marketingSlides, newSlide];
    setMarketingSlides(updatedSlides);

    if (isAdministrativeModeActive) {
      const { error } = await supabase
        .from('stores')
        .update({ carousel_data: { slides: updatedSlides } })
        .eq('slug', STORE_SLUG);
      
      if (error) console.error('Failed to save new slide:', error);
    }
  }, [isAdministrativeModeActive, marketingSlides, STORE_SLUG]);

  return { 
    slides: marketingSlides, 
    updateSlide: modifySlideContent, 
    uploadHeroImage: uploadHeroVisualAsset, 
    addSlide: addNewSlide,
    loading: isCarouselContentLoading 
  };
}
