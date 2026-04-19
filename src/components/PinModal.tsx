import { useState, useEffect } from 'react';
import { THEME } from '../data/config';

interface PinModalProps {
  isModalOpen: boolean;
  onVerify: (pin: string) => Promise<boolean>;
  onAuthenticationSuccess: () => void;
  onModalClose: () => void;
  isLockedOut?: boolean;
}

const PIN_LENGTH = 4;

export default function PinModal({ 
  isModalOpen, 
  onVerify, 
  onAuthenticationSuccess, 
  onModalClose,
  isLockedOut 
}: PinModalProps) {
  const [currentPinAttempt, setCurrentPinAttempt] = useState('');
  const [hasAuthError, setHasAuthError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const theme = THEME.pinModal;
  const globalIcons = THEME.icons;

  // Cleanup on close
  useEffect(() => {
    return () => {
      setCurrentPinAttempt('');
      setHasAuthError(false);
    };
  }, [isModalOpen]);

  const handleDigitEntry = async (digit: string) => {
    if (isVerifying || currentPinAttempt.length >= PIN_LENGTH || isLockedOut) return;
    
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
    if (isVerifying || isLockedOut) return;
    setCurrentPinAttempt(prev => prev.slice(0, -1));
  };

  if (!isModalOpen) return null;

  return (
    <div className={theme.overlay}>
      <div className={`${theme.container} ${hasAuthError ? theme.animations.shake : ''}`}>
        
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
            {isLockedOut ? 'Çok fazla yanlış deneme. Lütfen 1 dakika bekleyin.' : 'Giriş yapmak için 4 haneli PIN kodunuzu girin.'}
          </p>
        </div>

        {/* DOTS INDICATOR */}
        <div className={`${theme.dotsWrapper} ${isLockedOut ? 'opacity-20' : ''}`}>
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

        {/* KEYBOARD GRID */}
        <div className={`${theme.keyboardGrid} ${isLockedOut ? theme.animations.lockout : ''}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button 
              key={num} 
              disabled={!!isLockedOut}
              onClick={() => handleDigitEntry(String(num))} 
              className={theme.keyButton}
            >
              <span className={theme.typography.keyText}>{num}</span>
            </button>
          ))}
          
          {/* BOTTOM ROW */}
          <button onClick={onModalClose} className={theme.cancelButton}>İPTAL</button>
          <button 
            disabled={!!isLockedOut}
            onClick={() => handleDigitEntry('0')} 
            className={theme.keyButton}
          >
            <span className={theme.typography.keyText}>0</span>
          </button>
          <button disabled={!!isLockedOut} onClick={handleDeleteDigit} className={theme.deleteButton}>
             <div className={theme.deleteIconSize}>{globalIcons.backspace}</div>
          </button>
        </div>

      </div>
    </div>
  );
}
