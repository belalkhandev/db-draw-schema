import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { ColumnDataType } from '../types';

interface AddColumnRowProps {
  onAdd: (name: string, dataType: ColumnDataType) => void;
}

export const AddColumnRow: React.FC<AddColumnRowProps> = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [dataType, setDataType] = useState<ColumnDataType>('VARCHAR');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isAdding]);

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim(), dataType);
      setName('');
      setDataType('VARCHAR');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDataType('VARCHAR');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const dataTypes: ColumnDataType[] = [
    'VARCHAR',
    'INT',
    'BIGINT',
    'TEXT',
    'DATE',
    'DATETIME',
    'TIMESTAMP',
    'BOOLEAN',
    'DECIMAL',
    'FLOAT',
    'ENUM',
    'JSON',
  ];

  return (
    <div className="border-t border-gray-200 bg-white">
      <AnimatePresence mode="wait">
        {!isAdding ? (
          <motion.div
            key="button"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 flex justify-end"
          >
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Plus size={14} />
              <span>Add Column</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 py-2 flex items-center gap-2 bg-blue-50"
          >
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="column_name"
              className="flex-1 bg-white border border-blue-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as ColumnDataType)}
              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none w-24"
            >
              {dataTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={handleAdd}
                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                title="Add"
              >
                Add
              </button>
              <button
                onClick={handleCancel}
                className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                title="Cancel"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
