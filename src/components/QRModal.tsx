import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { DEFAULT_COMPANY } from '../data/config';
import Button from './Button';
import BaseModal from './BaseModal';

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

  const footer = (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={handleCopy}
          variant="secondary"
          className="!py-3"
          mode="rectangle"
        >
          <span className="text-[10px] font-black uppercase tracking-widest">{copied ? 'KOPYALANDI' : 'KOPYALA'}</span>
        </Button>
        <Button 
          onClick={handleShare}
          variant="primary"
          className="!py-3"
          mode="rectangle"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-white">PAYLAŞ</span>
        </Button>
      </div>
      <button 
        onClick={onClose}
        className="text-[10px] font-black text-stone-300 hover:text-stone-900 transition-colors uppercase tracking-[0.2em] mt-2 block w-full text-center"
      >
        Kapat
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[320px]"
      title={DEFAULT_COMPANY.name}
      subtitle={displayUrl}
      footer={footer}
      hideCloseButton={true}
    >
      <div className="flex justify-center my-2">
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
    </BaseModal>
  );
};

export default QRModal;
