import { useState, useEffect, useCallback } from 'react';
import { THEME, LABELS } from '../data/config';

/**
 * PIN MODAL COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Apple-style secure entry interface for administrative access.
 */

interface PinModalProps {
  isModalOpen: boolean;
  authorizedPinCode: string;
  onAuthenticationSuccess: () => void;
  onModalClose: () => void;
}

export default function PinModal({ 
  isModalOpen, 
  authorizedPinCode, 
  onAuthenticationSuccess, 
  onModalClose 
}: PinModalProps) {
  const [currentPinAttempt, setCurrentPinAttempt] = useState('');
  const [hasAuthError, setHasAuthError] = useState(false);

  const theme = THEME.pinModal;
  const globalIcons = THEME.icons;

  // Process PIN when it reaches 4 digits
  useEffect(() => {
    if (currentPinAttempt.length === 4) {
      if (currentPinAttempt === authorizedPinCode) {
        onAuthenticationSuccess();
        setCurrentPinAttempt('');
      } else {
        setHasAuthError(true);
        // Standard iPhone haptic error feedback duration
        const errorResetTimeout = setTimeout(() => {
          setHasAuthError(false);
          setCurrentPinAttempt('');
        }, 500);
        return () => clearTimeout(errorResetTimeout);
      }
    }
  }, [currentPinAttempt, authorizedPinCode, onAuthenticationSuccess]);

  const handleDigitEntry = useCallback((digit: string) => {
    if (currentPinAttempt.length < 4 && !hasAuthError) {
      setCurrentPinAttempt(previousPin => previousPin + digit);
    }
  }, [currentPinAttempt.length, hasAuthError]);

  const handleDeleteDigit = useCallback(() => {
    if (!hasAuthError) {
      setCurrentPinAttempt(previousPin => previousPin.slice(0, -1));
    }
  }, [hasAuthError]);

  if (!isModalOpen) return null;

  return (
    <div className={theme.overlay} role="dialog">
      {/* BACKGROUND DISMISSAL AREA */}
      <div className="absolute inset-0" onClick={onModalClose} />

      <div 
        className={`${theme.container} ${hasAuthError ? theme.animations.shake : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        
        {/* HEADER SECTION */}
        <div className={theme.headerWrapper}>
          <div className={theme.headerIconWrapper}>
            <div className={theme.headerIconSize}>
              {globalIcons.lock}
            </div>
          </div>
          <h2 className={theme.typography.title}>Giriş Yapın</h2>
          <p className={theme.typography.subtitle}>Mağaza yönetim şifrenizi girin</p>
        </div>

        {/* PIN STATUS INDICATORS (APPLE STYLE) */}
        <div className={theme.dotsWrapper}>
          {[0, 1, 2, 3].map(index => (
            <div 
              key={index}
              className={`
                ${theme.dotBase} 
                ${currentPinAttempt.length > index ? theme.dotActive : theme.dotInactive} 
                ${hasAuthError ? theme.dotError : ''}
              `}
            />
          ))}
        </div>

        {/* SECURE NUMBER PAD */}
        <div className={theme.keyboardGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
            <button
              key={number}
              onClick={() => handleDigitEntry(String(number))}
              className={theme.keyButton}
            >
              <span className={theme.typography.keyText}>{number}</span>
            </button>
          ))}
          
          {/* DISMISS ACTION */}
          <button 
            onClick={onModalClose}
            className={theme.cancelButton}
          >
            {LABELS.pinModal.cancelLabel}
          </button>

          {/* ZERO KEY */}
          <button
            onClick={() => handleDigitEntry('0')}
            className={theme.keyButton}
          >
            <span className={theme.typography.keyText}>0</span>
          </button>

          {/* BACKSPACE ACTION */}
          <button
            onClick={handleDeleteDigit}
            className={theme.deleteButton}
          >
            <div className={theme.deleteIconSize}>
              {globalIcons.backspace}
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
