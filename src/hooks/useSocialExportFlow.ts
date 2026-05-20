import { useState, useEffect, useMemo, RefObject } from 'react';
import html2canvas from 'html2canvas';
import { useStore } from '../store';
import { getActiveStoreSlug } from '../utils/core';
import { Product } from '../types';
import { MarketingGallery } from '../components/layout/MarketingGallery';

export function useSocialExportFlow(
  isOpen: boolean,
  products: Product[],
  designRef: RefObject<HTMLDivElement | null>,
) {
  const { settings } = useStore();
  const storeName = settings?.title || 'EKATALOG';
  const slug = getActiveStoreSlug();
  const storeUrl = `${slug}.ekatalog.site`;

  const [designIndex, setDesignIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [aspectRatio] = useState<'STORY' | 'POST'>('STORY');

  useEffect(() => {
    if (isOpen && products.length > 0 && !selectedProductId) {
      setSelectedProductId(
        products[Math.floor(Math.random() * products.length)].id,
      );
    }
  }, [isOpen, products, selectedProductId]);

  const activeProduct = useMemo(() => {
    if (!selectedProductId) return products[0] || null;
    return (
      products.find((p) => p.id === selectedProductId) || products[0] || null
    );
  }, [selectedProductId, products]);

  const handleNextDesign = () => {
    setDesignIndex((prev) => (prev + 1) % MarketingGallery.length);
  };

  const handleProductChange = () => {
    if (products.length <= 1) return;
    let nextIdx;
    const currentIdx = products.findIndex((p) => p.id === selectedProductId);
    do {
      nextIdx = Math.floor(Math.random() * products.length);
    } while (nextIdx === currentIdx);
    setSelectedProductId(products[nextIdx].id);
  };

  const handleDownload = async () => {
    if (!designRef.current) return;
    setIsExporting(true);

    const isPost = aspectRatio === 'POST';
    const width = isPost ? 640 : 360;
    const height = isPost ? 360 : 640;

    const captureEl = document.createElement('div');
    captureEl.style.position = 'fixed';
    captureEl.style.left = '-9999px';
    captureEl.style.top = '0';
    captureEl.style.width = `${width}px`;
    captureEl.style.height = `${height}px`;
    captureEl.style.zIndex = '-1';
    captureEl.innerHTML = designRef.current.innerHTML;
    document.body.appendChild(captureEl);

    try {
      const canvas = await html2canvas(captureEl, {
        scale: 3,
        useCORS: true,
        width: width,
        height: height,
        logging: false,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `EKATALOG_${aspectRatio}_${Date.now()}.jpg`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(captureEl);
      setIsExporting(false);
    }
  };

  const CurrentDesign = MarketingGallery[designIndex];

  return {
    storeName,
    storeUrl,
    isExporting,
    aspectRatio,
    activeProduct,
    CurrentDesign,
    handleNextDesign,
    handleProductChange,
    handleDownload,
  };
}
