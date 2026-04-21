// FILE: src/hooks/useCarousel.ts
// ROLE: Manages fetching, updating, uploading images, and reordering hero carousel slides
// READS FROM: src/lib/supabase, src/data/config, src/utils/store
// USED BY: HeroCarousel

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CAROUSEL, TECH } from '../data/config';
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

// ARCHITECTURE: useCarousel
// PURPOSE: Encapsulates all state and API interactions for the Hero Carousel (read/write slides)
// DEPENDENCIES: supabase, CAROUSEL default config, processDualQualityVisuals
// CONSUMERS: HeroCarousel component
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
  // ⚠️ CRITICAL: Dynamic Import Risk
  // RISK: `processDualQualityVisuals` is dynamically imported but errors are caught globally. If the chunk fails to load due to network, it will fail silently or throw an unhandled promise rejection depending on Vite's setup.
  // EVIDENCE: `const { processDualQualityVisuals } = await import('../utils/image');`
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
  }, [isAdministrativeModeActive, marketingSlides]);

  /**
   * removeSlide: Deletes a specific slide from the carousel.
   */
  const removeSlide = useCallback(async (slideId: number) => {
    if (!window.confirm('Bu görseli silmek istediğinize emin misiniz?')) return;
    
    const updatedSlides = marketingSlides.filter(s => s.id !== slideId);
    setMarketingSlides(updatedSlides);

    if (isAdministrativeModeActive) {
      const { error } = await supabase
        .from('stores')
        .update({ carousel_data: { slides: updatedSlides } })
        .eq('slug', STORE_SLUG);
      
      if (error) console.error('Failed to delete slide:', error);
    }
  }, [isAdministrativeModeActive, marketingSlides]);

  /**
   * reorderSlides: Moves a slide to a specific index within the sequence.
   */
  const reorderSlides = useCallback(async (slideId: number, newDisplayIndex: number) => {
    const currentIndex = marketingSlides.findIndex(s => s.id === slideId);
    if (currentIndex === -1) return;

    // Convert 1-based display index to 0-based array index
    const targetedIndex = Math.max(0, Math.min(newDisplayIndex - 1, marketingSlides.length - 1));
    if (currentIndex === targetedIndex) return;

    const updatedSlides = [...marketingSlides];
    const [capturedSlide] = updatedSlides.splice(currentIndex, 1);
    updatedSlides.splice(targetedIndex, 0, capturedSlide);

    setMarketingSlides(updatedSlides);

    if (isAdministrativeModeActive) {
      const { error } = await supabase
        .from('stores')
        .update({ carousel_data: { slides: updatedSlides } })
        .eq('slug', STORE_SLUG);
      
      if (error) console.error('Failed to reorder slides:', error);
    }
  }, [isAdministrativeModeActive, marketingSlides]);

  return { 
    slides: marketingSlides, 
    updateSlide: modifySlideContent, 
    uploadHeroImage: uploadHeroVisualAsset, 
    addSlide: addNewSlide,
    deleteSlide: removeSlide,
    reorderSlides,
    loading: isCarouselContentLoading 
  };
}
