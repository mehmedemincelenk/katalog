import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_COMPANY, THEME } from '../data/config';
import Button from './Button';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose }) => {
  const shopUrl = window.location.href;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: DEFAULT_COMPANY.name,
          url: shopUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error('Sharing failed', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shopUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const displayUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4" 
          style={{ zIndex: 10005 }}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className={`relative bg-white w-full max-w-[320px] shadow-2xl overflow-hidden ${THEME.radius.modal || 'rounded-3xl'} p-8 text-center space-y-6 z-[10006]`}
          >
            {/* Minimal Header */}
            <div className="space-y-1">
              <h3 className="font-black text-stone-900 text-sm tracking-tight uppercase">{DEFAULT_COMPANY.name}</h3>
              <p className="text-[11px] font-bold text-stone-400 break-all">{displayUrl}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-4 bg-white border border-stone-100 rounded-2xl shadow-sm">
                <QRCodeSVG 
                  value={shopUrl}
                  size={180}
                  level="H"
                  includeMargin={false}
                  imageSettings={{
                    src: DEFAULT_COMPANY.logoUrl,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                onClick={handleCopy}
                variant="secondary"
                className="!py-3"
                mode="rectangle"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'KOPYALANDI' : 'KOPYALA'}</span>
                </div>
              </Button>
              <Button 
                onClick={handleShare}
                variant="primary"
                className="!py-3"
                mode="rectangle"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">PAYLA┼×</span>
                </div>
              </Button>
            </div>

            {/* Close */}
            <button 
              onClick={onClose}
              className="text-[10px] font-black text-stone-300 hover:text-stone-900 transition-colors uppercase tracking-[0.2em]"
            >
              Kapat
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QRModal;
