import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../components';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
  mode: 'create' | 'edit';
}

export const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialName = '',
  mode,
}) => {
  const [tableName, setTableName] = useState(initialName);

  useEffect(() => {
    if (isOpen) {
      setTableName(initialName);
    }
  }, [isOpen, initialName]);

  const handleSave = () => {
    if (tableName.trim()) {
      onSave(tableName.trim());
      setTableName('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Table' : 'Edit Table'}
      size="sm"
    >
      <div className="space-y-4">
        <Input
          label="Table Name"
          placeholder="Enter table name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          onKeyPress={handleKeyPress}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!tableName.trim()}>
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
