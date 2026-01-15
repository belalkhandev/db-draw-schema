import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import type { Column } from '../types';

interface ColumnOptionsMenuProps {
  column: Column;
  onClose: () => void;
  onUpdate: (updates: Partial<Column>) => void;
  onDelete: () => void;
}

export const ColumnOptionsMenu: React.FC<ColumnOptionsMenuProps> = ({
  column,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [autoIncrement, setAutoIncrement] = useState(column.autoIncrement || false);
  const [unique, setUnique] = useState(column.unique || false);
  const [primaryKey, setPrimaryKey] = useState(column.primaryKey || false);
  const [comment, setComment] = useState(column.comment || '');
  const [enumValues, setEnumValues] = useState(column.enumValues?.join(', ') || '');

  useEffect(() => {
    setAutoIncrement(column.autoIncrement || false);
    setUnique(column.unique || false);
    setPrimaryKey(column.primaryKey || false);
    setComment(column.comment || '');
    setEnumValues(column.enumValues?.join(', ') || '');
  }, [column]);

  const handleAutoIncrementChange = (checked: boolean) => {
    setAutoIncrement(checked);
    onUpdate({ autoIncrement: checked });
  };

  const handleUniqueChange = (checked: boolean) => {
    setUnique(checked);
    onUpdate({ unique: checked });
  };

  const handlePrimaryKeyChange = (checked: boolean) => {
    setPrimaryKey(checked);
    onUpdate({ primaryKey: checked, nullable: !checked });
  };

  const handleCommentBlur = () => {
    if (comment !== column.comment) {
      onUpdate({ comment: comment.trim() || undefined });
    }
  };

  const handleEnumValuesBlur = () => {
    if (column.dataType === 'ENUM') {
      const values = enumValues
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
      if (values.length > 0) {
        onUpdate({ enumValues: values });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="w-[320px] bg-white rounded-lg shadow-2xl border border-gray-200"
    >
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Column Options
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          <X size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`primary-key-${column.id}`}
              checked={primaryKey}
              onChange={(e) => handlePrimaryKeyChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor={`primary-key-${column.id}`} className="text-sm text-gray-700">
              Primary Key
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`auto-increment-${column.id}`}
              checked={autoIncrement}
              onChange={(e) => handleAutoIncrementChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor={`auto-increment-${column.id}`} className="text-sm text-gray-700">
              Auto Increment
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`unique-${column.id}`}
              checked={unique}
              onChange={(e) => handleUniqueChange(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor={`unique-${column.id}`} className="text-sm text-gray-700">
              Unique
            </label>
          </div>
        </div>

        {column.dataType === 'ENUM' && (
          <div className="space-y-2 pt-2 border-t border-gray-200">
            <label className="text-xs font-medium text-gray-700 uppercase">
              Enum Values
            </label>
            <input
              type="text"
              placeholder="value1, value2, value3"
              value={enumValues}
              onChange={(e) => setEnumValues(e.target.value)}
              onBlur={handleEnumValuesBlur}
              className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">Comma-separated values</p>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-gray-200">
          <label className="text-xs font-medium text-gray-700 uppercase">
            Comment
          </label>
          <textarea
            placeholder="Optional description"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={handleCommentBlur}
            rows={3}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors border border-red-200"
          >
            <Trash2 size={14} />
            Delete Column
          </button>
        </div>
      </div>
    </motion.div>
  );
};
