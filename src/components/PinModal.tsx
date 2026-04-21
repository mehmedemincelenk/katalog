import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../data/config';
import Turnstile from './Turnstile';
import { Check } from 'lucide-react';

interface PinModalProps {
  isModalOpen: boolean;
  onVerify: (pin: string) => Promise<boolean>;
  onAuthenticationSuccess: () => void;
  onModalClose: () => void;
  isLockedOut?: boolean;
  failedAttempts?: number;
}

const PIN_LENGTH = 4;

export default function PinModal({ 
  isModalOpen, 
  onVerify, 
  onAuthenticationSuccess, 
  onModalClose,
  isLockedOut,
  failedAttempts = 0
}: PinModalProps) {
  const [currentPinAttempt, setCurrentPinAttempt] = useState('');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRobotVerified, setIsRobotVerified] = useState(false);

  const requiresCaptcha = failedAttempts >= 2;
  const isInputDisabled = isLockedOut || isVerifying || (requiresCaptcha && !isRobotVerified);

  const theme = THEME.pinModal;
  const globalIcons = THEME.icons;

  // Cleanup on close
  useEffect(() => {
    if (!isModalOpen) {
      setCurrentPinAttempt('');
      setHasAuthError(false);
    }
  }, [isModalOpen]);

  const handleDigitEntry = async (digit: string) => {
    if (isInputDisabled || currentPinAttempt.length >= PIN_LENGTH) return;
    
    const newAttempt = currentPinAttempt + digit;
    setCurrentPinAttempt(newAttempt);
    setHasAuthError(false);

    if (newAttempt.length === PIN_LENGTH) {
      setIsVerifying(true);
      const isValid = await onVerify(newAttempt);
      
      if (isValid) {
        onAuthenticationSuccess();
      } else {
        setHasAuthError(true);
        setTimeout(() => {
          setCurrentPinAttempt('');
          setHasAuthError(false);
        }, 600);
      }
      setIsVerifying(false);
    }
  };

  const handleDeleteDigit = () => {
    if (isInputDisabled) return;
    setCurrentPinAttempt(prev => prev.slice(0, -1));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={theme.overlay}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, filter: 'blur(15px)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`${theme.container} ${hasAuthError ? theme.animations.shake : ''}`}
      >
        
        {/* HEADER SECTION */}
        <div className={theme.headerWrapper}>
          <div className={theme.headerIconWrapper}>
            <div className={theme.headerIconSize}>
              {isVerifying ? (
                <div className={THEME.loading.spinner + " w-5 h-5"} />
              ) : (
                isLockedOut ? '⏳' : globalIcons.lock
              )}
            </div>
          </div>
          <h2 className={theme.typography.title}>{isLockedOut ? 'GÜVENLİK KİLİDİ' : 'ADMİN PANELİ'}</h2>
          <p className={theme.typography.subtitle}>
            {isLockedOut 
              ? 'Çok fazla yanlış deneme. Lütfen 1 dakika bekleyin.' 
              : 'Giriş yapmak için 4 haneli PIN kodunuzu girin.'}
          </p>
        </div>

        {/* DOTS INDICATOR */}
        <div className={`${theme.dotsWrapper} ${isInputDisabled ? 'opacity-20' : ''} mb-4`}>
          {[...Array(PIN_LENGTH)].map((_, i) => (
            <div 
              key={i} 
              className={`
                ${theme.dotBase} 
                ${i < currentPinAttempt.length ? theme.dotActive : theme.dotInactive}
                ${hasAuthError ? theme.dotError : ''}
              `} 
            />
          ))}
        </div>

        {/* CAPTCHA & FEEDBACK AREA (Diamond UX) */}
        {requiresCaptcha && (
          <div className="flex flex-col items-center justify-center min-h-[80px] mb-2 px-6">
            {!isRobotVerified ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
                <span className="text-[9px] font-black tracking-[0.2em] text-stone-400 uppercase mb-3 animate-pulse">
                  GÜVENLİK DOĞRULAMASI YAPILIYOR...
                </span>
                <Turnstile onVerify={() => setIsRobotVerified(true)} options={{ theme: 'light', size: 'normal' }} />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500 pt-1 pb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-100/50">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-emerald-600 uppercase">
                  GÜVENLİK DOĞRULANDI
                </span>
              </div>
            )}
          </div>
        )}

        {/* KEYBOARD GRID */}
        <div className={`${theme.keyboardGrid} ${isInputDisabled ? 'opacity-30 pointer-events-none grayscale scale-[0.98]' : 'transition-all duration-500'}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num} 
              disabled={isInputDisabled}
              onClick={() => handleDigitEntry(String(num))} 
              className={theme.keyButton}
            >
              <span className={theme.typography.keyText}>{num}</span>
            </button>
          ))}
          
          {/* BOTTOM ROW */}
          <button onClick={onModalClose} className={theme.cancelButton}>İPTAL</button>
          <button 
            disabled={isInputDisabled}
            onClick={() => handleDigitEntry('0')} 
            className={theme.keyButton}
          >
            <span className={theme.typography.keyText}>0</span>
          </button>
          <button disabled={isInputDisabled} onClick={handleDeleteDigit} className={theme.deleteButton}>
             <div className={theme.deleteIconSize}>{globalIcons.backspace}</div>
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
}
