import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle className="text-red-600" size={24} />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-100',
          textColor: 'text-red-900',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="text-yellow-600" size={24} />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-100',
          textColor: 'text-yellow-900',
        };
      case 'info':
        return {
          icon: <AlertTriangle className="text-blue-600" size={24} />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
          textColor: 'text-blue-900',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="space-y-6">
        <div className={`flex items-start gap-4 p-5 rounded-xl ${styles.bgColor} border ${styles.borderColor}`}>
          <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
          <div className="flex-1">
            <h3 className={`font-semibold text-lg ${styles.textColor} mb-1.5`}>
              {title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            className={
              variant === 'warning'
                ? 'bg-yellow-600 hover:bg-yellow-700 hover:shadow-yellow-500/30'
                : ''
            }
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
