import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence } from 'framer-motion';

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = 'start',
  side = 'right',
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    const newState = !isOpen;
    if (isControlled) {
      onOpenChange?.(newState);
    } else {
      setInternalOpen(newState);
    }
  };

  const handleClose = () => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !contentRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      if (side === 'right') {
        left = triggerRect.right + 8;
        if (align === 'start') {
          top = triggerRect.top;
        } else if (align === 'end') {
          top = triggerRect.bottom - contentRect.height;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        }

        if (left + contentRect.width > viewportWidth) {
          left = triggerRect.left - contentRect.width - 8;
        }
      } else if (side === 'left') {
        left = triggerRect.left - contentRect.width - 8;
        if (align === 'start') {
          top = triggerRect.top;
        } else if (align === 'end') {
          top = triggerRect.bottom - contentRect.height;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
        }
      } else if (side === 'bottom') {
        top = triggerRect.bottom + 8;
        if (align === 'start') {
          left = triggerRect.left;
        } else if (align === 'end') {
          left = triggerRect.right - contentRect.width;
        } else {
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        }
      } else if (side === 'top') {
        top = triggerRect.top - contentRect.height - 8;
        if (align === 'start') {
          left = triggerRect.left;
        } else if (align === 'end') {
          left = triggerRect.right - contentRect.width;
        } else {
          left = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
        }
      }

      if (top + contentRect.height > viewportHeight) {
        top = viewportHeight - contentRect.height - 8;
      }
      if (top < 8) {
        top = 8;
      }
      if (left < 8) {
        left = 8;
      }
      if (left + contentRect.width > viewportWidth) {
        left = viewportWidth - contentRect.width - 8;
      }

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, side, align]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} className="inline-block" onClick={handleToggle}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen &&
          createPortal(
            <div
              ref={contentRef}
              className="fixed z-[9999]"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
              }}
            >
              {children}
            </div>,
            document.body
          )}
      </AnimatePresence>
    </>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
}

export const PopoverContent: React.FC<PopoverContentProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`bg-gray-800 text-gray-100 rounded-lg shadow-lg border border-gray-700 overflow-hidden min-w-[200px] ${className}`}
    >
      {children}
    </div>
  );
};

interface PopoverItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const PopoverItem: React.FC<PopoverItemProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

interface PopoverSeparatorProps {
  className?: string;
}

export const PopoverSeparator: React.FC<PopoverSeparatorProps> = ({
  className = '',
}) => {
  return <div className={`h-px bg-gray-700 my-1 ${className}`} />;
};
