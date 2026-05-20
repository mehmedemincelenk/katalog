import { useRef, useState, useEffect, memo } from 'react';
import { THEME } from '../../data/config';
import { MarqueeTextProps } from '../../types';

export const MarqueeText = memo(
  ({
    text,
    textClass,
    isAdmin,
    editableProps = {},
    onClick,
  }: MarqueeTextProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const {
      className: editableClassName = '',
      onClick: internalOnClick,
      ...restEditableProps
    } = editableProps;
    const marqueeTheme = THEME.typography.marquee;

    useEffect(() => {
      const element = containerRef.current;
      if (!element) return;
      const checkOverflow = () =>
        setIsOverflowing(element.scrollWidth > element.clientWidth + 2);
      checkOverflow();
      const observer = new ResizeObserver(checkOverflow);
      observer.observe(element);
      return () => observer.disconnect();
    }, [text]);

    return (
      <div
        ref={containerRef}
        onClick={(e) => {
          if (internalOnClick)
            (internalOnClick as React.MouseEventHandler<HTMLDivElement>)(e);
          if (onClick) onClick(e);
        }}
        className={`${isAdmin ? marqueeTheme.adminMode : marqueeTheme.container} ${textClass} ${editableClassName}`}
        {...restEditableProps}
      >
        {isOverflowing && !isAdmin ? (
          <span className={marqueeTheme.track}>
            {text}&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;
          </span>
        ) : (
          <span>{text}</span>
        )}
      </div>
    );
  },
);
