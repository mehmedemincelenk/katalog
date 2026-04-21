// FILE: src/components/MarqueeText.tsx
// ROLE: Renders text that auto-scrolls horizontally if it overflows its container (Marquee effect)
// READS FROM: src/data/config
// USED BY: Navbar, Footer, ProductCard, CarouselSlideUnit

import { useRef, useState, useEffect, memo } from 'react';
import { THEME } from '../data/config';

interface MarqueeTextProps {
  text: string;
  textClass: string;
  isAdmin: boolean;
  editableProps?: React.HTMLAttributes<HTMLDivElement>;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * MARQUEE TEXT COMPONENT (100% Tokenized & Professional English)
 * -----------------------------------------------------------
 * Handles overflow text with a sliding animation for customers, 
 * while keeping it editable for admins. Managed via THEME tokens.
 */
// ARCHITECTURE: MarqueeText
// PURPOSE: A robust text component that detects overflow and applies a CSS marquee animation for customers, but renders standard text (with contentEditable if needed) for admins
// DEPENDENCIES: THEME.typography.marquee
// CONSUMERS: Used anywhere dynamic text length could break layout constraints
export const MarqueeText = memo(({ 
  text, 
  textClass, 
  isAdmin, 
  editableProps = {},
  onClick
}: MarqueeTextProps) => {
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [hasTextOverflow, setHasTextOverflow] = useState(false);
  const { className: extraEditableClassName = '', onClick: internalOnClick, ...remainingEditableProps } = editableProps;

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
      onClick={(e) => {
        if (internalOnClick) (internalOnClick as React.MouseEventHandler<HTMLDivElement>)(e);
        if (onClick) onClick(e);
      }}
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
