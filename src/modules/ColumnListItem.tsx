import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Link as LinkIcon } from 'lucide-react';
import type { Column, ColumnDataType } from '../types';

interface ColumnListItemProps {
  column: Column;
  onUpdate: (updates: Partial<Column>) => void;
  menuButton: React.ReactNode;
}

type IndexType = 'primary' | 'unique' | 'index' | 'none';

export const ColumnListItem: React.FC<ColumnListItemProps> = ({
  column,
  onUpdate,
  menuButton,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingType, setIsEditingType] = useState(false);
  const [localName, setLocalName] = useState(column.name);
  const [showIndexMenu, setShowIndexMenu] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    setLocalName(column.name);
  }, [column.name]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (localName.trim() && localName !== column.name) {
      onUpdate({ name: localName.trim() });
    } else {
      setLocalName(column.name);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setLocalName(column.name);
      setIsEditingName(false);
    }
  };

  const handleTypeChange = (newType: ColumnDataType) => {
    onUpdate({ dataType: newType });
    setIsEditingType(false);
  };

  const handleIndexTypeChange = (type: IndexType) => {
    if (type === 'primary') {
      onUpdate({ primaryKey: true, unique: true, nullable: false });
    } else if (type === 'unique') {
      onUpdate({ primaryKey: false, unique: true });
    } else if (type === 'index') {
      onUpdate({ primaryKey: false, unique: false });
    } else {
      onUpdate({ primaryKey: false, unique: false });
    }
    setShowIndexMenu(false);
  };

  const getIndexType = (): IndexType => {
    if (column.primaryKey) return 'primary';
    if (column.unique) return 'unique';
    return 'none';
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

  const indexType = getIndexType();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 hover:bg-gray-50 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={14} className="text-gray-400" />
      </div>

      <div className="w-[140px]">
        {isEditingName ? (
          <input
            ref={nameInputRef}
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <input
            type="text"
            value={column.name}
            readOnly
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingName(true);
            }}
            className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none hover:border-blue-300 cursor-text"
          />
        )}
      </div>

      <div className="w-[100px]">
        {isEditingType ? (
          <select
            value={column.dataType}
            onChange={(e) => handleTypeChange(e.target.value as ColumnDataType)}
            onBlur={() => setIsEditingType(false)}
            autoFocus
            className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            {dataTypes.map((type) => (
              <option key={type} value={type}>
                {type.toLowerCase()}
              </option>
            ))}
          </select>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingType(true);
            }}
            className="w-full bg-gray-100 border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 hover:border-blue-300 cursor-pointer"
          >
            {column.dataType.toLowerCase()}
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdate({ nullable: !column.nullable });
        }}
        className={`w-6 h-6 flex items-center justify-center text-xs font-semibold rounded transition-colors ${
          column.nullable
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
        }`}
      >
        N
      </button>

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowIndexMenu(!showIndexMenu);
          }}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={indexType === 'none' ? 'text-gray-400' : 'text-blue-500'}>
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            {indexType === 'primary' && <circle cx="7" cy="7" r="3" fill="currentColor"/>}
            {indexType === 'unique' && <path d="M7 4L9 7L7 10L5 7Z" fill="currentColor"/>}
          </svg>
        </button>

        <AnimatePresence>
          {showIndexMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full right-0 mt-1 w-40 bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50"
            >
              <div className="py-1">
                <button
                  onClick={() => handleIndexTypeChange('primary')}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    indexType === 'primary' ? 'bg-teal-600 hover:bg-teal-600' : ''
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L10 6L14 8L10 10L8 14L6 10L2 8L6 6L8 2Z" fill="currentColor"/>
                  </svg>
                  Primary key
                </button>
                <button
                  onClick={() => handleIndexTypeChange('unique')}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    indexType === 'unique' ? 'bg-teal-600 hover:bg-teal-600' : ''
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L11 8L8 14L5 8L8 2Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                  Unique key
                </button>
                <button
                  onClick={() => handleIndexTypeChange('index')}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                  Index
                </button>
                <button
                  onClick={() => handleIndexTypeChange('none')}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                    indexType === 'none' ? 'bg-teal-600 hover:bg-teal-600' : ''
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M5 8H11" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  None
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {column.foreignKey?.tableId && column.foreignKey?.columnId && (
        <div className="w-6 h-6 flex items-center justify-center">
          <LinkIcon size={14} className="text-green-500" />
        </div>
      )}

      <div onClick={(e) => e.stopPropagation()} className="flex items-center ml-auto">
        {menuButton}
      </div>
    </div>
  );
};
