// FILE ROLE: Hero Carousel Data & Image Upload Persistence
// DEPENDS ON: Supabase, Image Utils, TECH config
// CONSUMED BY: HeroCarousel.tsx
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CAROUSEL, TECH } from '../data/config';
import { getActiveStoreSlug } from '../utils/store';

import { CarouselSlide } from '../types';

/**
 * USE CAROUSEL HOOK (TECHNICAL TOKENS & A-LEVEL ENGLISH)
 * -----------------------------------------------------------
 * Orchestrates the hero visual experience and marketing slide synchronization.
 */
export function useCarousel(isAdministrativeModeActive: boolean) {
  const [marketingSlides, setMarketingSlides] = useState<CarouselSlide[]>(
    CAROUSEL.slides,
  );
  const [isCarouselContentLoading, setIsCarouselContentLoading] =
    useState(true);

  const activeStoreSlug = getActiveStoreSlug();

  /**
   * persistCarouselData: Pushes the updated slides to the Supabase stores table.
   */
  const persistCarouselData = useCallback(
    async (updatedSlides: CarouselSlide[]) => {
      if (!isAdministrativeModeActive || activeStoreSlug === 'main-site')
        return;

      try {
        const { data: storeData } = await supabase
          .from('stores')
          .select('carousel_data')
          .eq('slug', activeStoreSlug)
          .single();

        const currentCarouselData = storeData?.carousel_data || {};

        const { error } = await supabase
          .from('stores')
          .update({
            carousel_data: {
              ...currentCarouselData,
              slides: updatedSlides,
            },
          })
          .eq('slug', activeStoreSlug);

        if (error) throw error;
      } catch (err) {
        console.error('Supabase carousel update failed:', err);
      }
    },
    [isAdministrativeModeActive, activeStoreSlug],
  );

  /**
   * synchronizeCarouselSlides: Fetches remote slide data from Supabase repository.
   */
  const synchronizeCarouselSlides = useCallback(async () => {
    if (activeStoreSlug === 'main-site') {
      setIsCarouselContentLoading(false);
      return;
    }

    setIsCarouselContentLoading(true);
    const { data: storeData, error: fetchError } = await supabase
      .from('stores')
      .select('carousel_data')
      .eq('slug', activeStoreSlug)
      .single();

    if (storeData && !fetchError && storeData.carousel_data?.slides) {
      setMarketingSlides(storeData.carousel_data.slides);
    }
    setIsCarouselContentLoading(false);
  }, [activeStoreSlug]);

  useEffect(() => {
    synchronizeCarouselSlides();
  }, [synchronizeCarouselSlides]);

  /**
   * modifySlideContent: Updates local state and persists changes.
   */
  const modifySlideContent = useCallback(
    async (slideId: number, contentChanges: Partial<CarouselSlide>) => {
      setMarketingSlides((prev) => {
        const updated = prev.map((slide) =>
          slide.id === slideId ? { ...slide, ...contentChanges } : slide,
        );
        persistCarouselData(updated);
        return updated;
      });
    },
    [persistCarouselData],
  );

  /**
   * uploadHeroVisualAsset: Processes and uploads a new high-quality image for a slide.
   */
  const uploadHeroVisualAsset = useCallback(
    async (slideId: number, visualFile: File) => {
      try {
        const { processDualQualityVisuals } = await import('../utils/image');
        const { hq: optimizedVisual } = await processDualQualityVisuals(
          visualFile,
          TECH.storage.heroWidth,
        );

        const visualFileName = `hero-${activeStoreSlug}-${slideId}-${Date.now()}.jpg`;
        const storagePath = `${TECH.storage.heroFolder}/${visualFileName}`;

        const { error: storageUploadError } = await supabase.storage
          .from(TECH.storage.bucket)
          .upload(storagePath, optimizedVisual, {
            upsert: true,
            cacheControl: TECH.storage.cacheControl,
          });

        if (storageUploadError) throw storageUploadError;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(TECH.storage.bucket)
          .getPublicUrl(storagePath);

        const finalizedVisualUrl = `${publicUrl}?t=${Date.now()}`;
        await modifySlideContent(slideId, { src: finalizedVisualUrl });
        return finalizedVisualUrl;
      } catch (criticalError) {
        console.error('Hero visual asset deployment failed:', criticalError);
        throw criticalError;
      }
    },
    [modifySlideContent, activeStoreSlug],
  );

  /**
   * addNewSlide: Inserts a new placeholder slide.
   */
  const addNewSlide = useCallback(async () => {
    setMarketingSlides((prev) => {
      const nextId =
        prev.length > 0 ? Math.max(...prev.map((s) => s.id)) + 1 : 1;
      const newSlide: CarouselSlide = {
        id: nextId,
        src: '',
        bg: 'bg-stone-200',
        label: 'Yeni Başlık',
        sub: 'Açıklama metni buraya gelecek.',
      };

      const updated = [...prev, newSlide];
      persistCarouselData(updated);
      return updated;
    });
  }, [persistCarouselData]);

  /**
   * removeSlide: Deletes a specific slide.
   */
  const removeSlide = useCallback(
    async (slideId: number) => {
      // RATIONAL: window.confirm was removed due to reliability issues.
      // Deletion is now direct and responsive.
      setMarketingSlides((prev) => {
        const updatedSlides = prev.filter((s) => s.id !== slideId);
        persistCarouselData(updatedSlides);
        return updatedSlides;
      });
    },
    [persistCarouselData],
  );

  /**
   * reorderSlides: Moves a slide to a specific index.
   */
  const reorderSlides = useCallback(
    async (slideId: number, newDisplayIndex: number) => {
      setMarketingSlides((prev) => {
        const currentIndex = prev.findIndex((s) => s.id === slideId);
        if (currentIndex === -1) return prev;

        const targetedIndex = Math.max(
          0,
          Math.min(newDisplayIndex - 1, prev.length - 1),
        );
        if (currentIndex === targetedIndex) return prev;

        const updatedSlides = [...prev];
        const [capturedSlide] = updatedSlides.splice(currentIndex, 1);
        updatedSlides.splice(targetedIndex, 0, capturedSlide);

        persistCarouselData(updatedSlides);
        return updatedSlides;
      });
    },
    [persistCarouselData],
  );

  return {
    slides: marketingSlides,
    updateSlide: modifySlideContent,
    uploadHeroImage: uploadHeroVisualAsset,
    addSlide: addNewSlide,
    deleteSlide: removeSlide,
    reorderSlides,
    loading: isCarouselContentLoading,
  };
}
