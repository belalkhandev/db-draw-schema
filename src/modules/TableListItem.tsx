import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Edit, Settings, MoreVertical } from 'lucide-react';
import type { Table } from '../types';

interface TableListItemProps {
  table: Table;
  isExpanded: boolean;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}

export const TableListItem: React.FC<TableListItemProps> = ({
  table,
  isExpanded,
  onClick,
  onEdit,
  children,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: table.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={isExpanded ? 'bg-blue-50' : ''}>
      <div
        className={`px-3 py-2.5 flex items-center gap-2 cursor-pointer border-b border-gray-100 transition-colors ${
          isExpanded ? 'bg-blue-100 hover:bg-blue-100' : 'hover:bg-gray-50'
        }`}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1"
        >
          <GripVertical size={14} className={isExpanded ? 'text-blue-400' : 'text-gray-400'} />
        </div>

        <span className={`text-sm flex-1 ${isExpanded ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
          {table.name}
        </span>

        <div className="flex items-center gap-1">
          <AnimatePresence>
            {(isHovered || isExpanded) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <button
                  className={`p-1 rounded transition-colors ${
                    isExpanded ? 'hover:bg-blue-200' : 'hover:bg-gray-200'
                  }`}
                  onClick={onEdit}
                >
                  <Edit size={14} className={isExpanded ? 'text-blue-600' : 'text-gray-600'} />
                </button>
                <button
                  className={`p-1 rounded transition-colors ${
                    isExpanded ? 'hover:bg-blue-200' : 'hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Settings size={14} className={isExpanded ? 'text-blue-600' : 'text-gray-600'} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            className={`p-1 rounded transition-colors ${
              isExpanded ? 'hover:bg-blue-200' : 'hover:bg-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={14} className={isExpanded ? 'text-blue-600' : 'text-gray-400'} />
          </button>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
