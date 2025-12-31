'use client';

import { useEffect } from 'react';

type ToastProps = {
  message: string;
  onClose: () => void;
};

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timeout = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="toast">
      <span>{message}</span>
      <button type="button" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
