import React, { useRef, useState } from 'react';
import Draggable from 'react-draggable';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import type { Table } from '../types';
import { Key, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';

interface TableCardProps {
    table: Table;
    isSelected: boolean;
    onSelect: () => void;
    onPositionChange: (x: number, y: number) => void;
    onEdit: () => void;
    onDelete: () => void;
    onColumnClick?: (columnId: string) => void;
}

export const TableCard: React.FC<TableCardProps> = ({
                                                        table,
                                                        isSelected,
                                                        onSelect,
                                                        onPositionChange,
                                                        onEdit,
                                                        onDelete,
                                                        onColumnClick,
                                                    }) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleDrag = (_e: DraggableEvent, data: DraggableData) => {
        onPositionChange(data.x, data.y);
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: table.position.x, y: table.position.y }}
            onDrag={handleDrag}
            handle=".drag-handle"
        >
            <div
                ref={nodeRef}
                className={`absolute bg-white rounded-lg shadow-lg min-w-[250px] max-w-[350px] cursor-move ${
                    isSelected
                        ? 'border-2 border-blue-500'
                        : 'border-2 border-dashed border-gray-300'
                }`}
                onClick={onSelect}
                style={{ zIndex: isSelected ? 1000 : 1 }}
            >
                {/* Header */}
                <div
                    className={`drag-handle px-4 py-2 rounded-t-lg ${
                        table.color || 'bg-blue-600'
                    } text-white font-semibold flex items-center justify-between`}
                >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsCollapsed(!isCollapsed);
                            }}
                            className="p-0.5 hover:bg-white/20 rounded flex-shrink-0"
                            title={isCollapsed ? 'Expand' : 'Collapse'}
                        >
                            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                        </button>
                        <span className="truncate">{table.name}</span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit();
                            }}
                            className="p-1 hover:bg-white/20 rounded"
                            title="Edit table"
                        >
                            <Edit size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="p-1 hover:bg-white/20 rounded"
                            title="Delete table"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>

                {/* Columns */}
                {!isCollapsed && (
                    <div className="max-h-[400px] overflow-y-auto">
                        {table.columns.length === 0 ? (
                            <div className="text-gray-400 text-sm text-center py-4">
                                No columns yet
                            </div>
                        ) : (
                            <div>
                                {table.columns.map((column, index) => (
                                    <div
                                        key={column.id}
                                        className={`flex items-center px-3 py-2 hover:bg-blue-50 text-sm cursor-pointer transition-colors ${
                                            index < table.columns.length - 1 ? 'border-b border-gray-200' : ''
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onColumnClick?.(column.id);
                                        }}
                                    >
                                        {/* Icons for PK/FK */}
                                        <div className="flex gap-1 min-w-[24px]">
                                            {column.primaryKey && (
                                                <Key size={12} className="text-yellow-500" />
                                            )}
                                            {column.unique && !column.primaryKey && (
                                                <span className="text-blue-500 font-bold text-xs">
                          U
                        </span>
                                            )}
                                        </div>

                                        {/* Column name and type */}
                                        <div className="flex-1 min-w-0 flex justify-between items-center">
                                            <div className="font-medium text-gray-900 truncate">
                                                {column.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {column.dataType}
                                                {column.length ? `(${column.length})` : ''}
                                                {!column.nullable && (
                                                    <span className="ml-1 text-red-500">NOT NULL</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer with comment if available */}
                {table.comment && (
                    <div className="px-3 py-2 bg-gray-50 border-t text-xs text-gray-600 rounded-b-lg">
                        {table.comment}
                    </div>
                )}
            </div>
        </Draggable>
    );
};
