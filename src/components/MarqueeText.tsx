import { useRef, useState, useEffect, memo } from 'react';
import { THEME } from '../data/config';

interface MarqueeTextProps {
  text: string;
  textClass: string;
  isAdmin: boolean;
  editableProps?: any;
}

/**
 * MARQUEE TEXT COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Handles overflow text with a sliding animation for customers, 
 * while keeping it editable for admins. Managed via THEME tokens.
 */
export const MarqueeText = memo(({ 
  text, 
  textClass, 
  isAdmin, 
  editableProps = {} 
}: MarqueeTextProps) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [hasTextOverflow, setHasTextOverflow] = useState(false);
  const { className: extraEditableClassName = '', ...remainingEditableProps } = editableProps;

  const marqueeTheme = THEME.typography.marquee;

  useEffect(() => {
    const element = textContainerRef.current;
    if (!element) return;
    
    const checkTextOverflow = () => {
      // Threshold of 2px to avoid sub-pixel rounding issues
      setHasTextOverflow(element.scrollWidth > element.clientWidth + 2);
    };
    
    checkTextOverflow();
    const overflowObserver = new ResizeObserver(checkTextOverflow);
    overflowObserver.observe(element);
    
    return () => overflowObserver.disconnect();
  }, [text]);

  return (
    <div 
      ref={textContainerRef} 
      className={`
        ${isAdmin ? marqueeTheme.adminMode : marqueeTheme.container} 
        ${textClass} 
        ${extraEditableClassName}
      `} 
      {...remainingEditableProps}
    >
      {/* ANIMATED TRACK: Only active for customers when text overflows */}
      {hasTextOverflow && !isAdmin ? (
        <span className={marqueeTheme.track}>
          {text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;
        </span>
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
});
