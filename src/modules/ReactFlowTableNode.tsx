import React, { memo, useState } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Trash2, Edit, ChevronDown, ChevronUp, Key } from 'lucide-react';
import type { Table } from '../types';

interface TableNodeData {
  table: Table;
  isSelected: boolean;
  onEdit: (tableId: string) => void;
  onDelete: (tableId: string) => void;
  onColumnClick: (tableId: string, columnId: string) => void;
}

const ReactFlowTableNode: React.FC<NodeProps<TableNodeData>> = ({ data, selected }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { table, isSelected, onEdit, onDelete, onColumnClick } = data;

  return (
    <div
      className={`bg-white rounded-lg shadow-lg border-2 transition-all ${
        selected || isSelected ? 'border-blue-500 shadow-xl' : 'border-gray-200'
      }`}
      style={{
        minWidth: '280px',
        maxWidth: '400px',
      }}
    >
      {/* Table Header */}
      <div
        className="px-4 py-3 rounded-t-lg flex items-center justify-between cursor-move"
        style={{ backgroundColor: table.color || '#3b82f6' }}
      >
        <h3 className="font-semibold text-white text-lg">{table.name}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(table.id);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Edit Table"
          >
            <Edit className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(table.id);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Delete Table"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-white" />
            ) : (
              <ChevronDown className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Comment */}
      {table.comment && (
        <div className="px-4 py-2 text-sm text-gray-600 bg-gray-50 border-b border-gray-200">
          {table.comment}
        </div>
      )}

      {/* Columns */}
      {isExpanded && (
        <div className="divide-y divide-gray-100">
          {table.columns.map((column) => {
            const isPrimaryKey = column.primaryKey;
            const isUnique = column.unique;

            return (
              <div
                key={column.id}
                className="relative px-4 py-2.5 hover:bg-blue-50 transition-colors cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  onColumnClick(table.id, column.id);
                }}
              >
                {/* Source Handle (Left side) - visible on hover or when selected */}
                <Handle
                  type="source"
                  position={Position.Left}
                  id={`${table.id}-${column.id}-source`}
                  className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    left: '-6px',
                  }}
                />

                {/* Target Handle (Right side) - visible on hover or when selected */}
                <Handle
                  type="target"
                  position={Position.Right}
                  id={`${table.id}-${column.id}-target`}
                  className="!w-3 !h-3 !bg-green-500 !border-2 !border-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    right: '-6px',
                  }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {/* Icons */}
                    <div className="flex items-center gap-1">
                      {isPrimaryKey && (
                        <Key className="w-3.5 h-3.5 text-yellow-500" />
                      )}
                      {isUnique && !isPrimaryKey && (
                        <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-600 rounded">
                          U
                        </span>
                      )}
                    </div>

                    {/* Column Name */}
                    <span className="font-medium text-gray-800 truncate">{column.name}</span>
                  </div>

                  {/* Column Type and Details */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 ml-2">
                    <span className="font-mono">
                      {column.dataType}
                      {column.length ? `(${column.length})` : ''}
                    </span>
                    {!column.nullable && (
                      <span className="text-red-500 font-semibold" title="Not Null">
                        *
                      </span>
                    )}
                  </div>
                </div>

                {/* Default Value */}
                {column.defaultValue && (
                  <div className="text-xs text-gray-500 mt-1 ml-6">
                    Default: {column.defaultValue}
                  </div>
                )}

                {/* Foreign Key Reference */}
                {column.foreignKey && (
                  <div className="text-xs text-purple-600 mt-1 ml-6">
                    → {column.foreignKey.tableId}.{column.foreignKey.columnId}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Column Count when Collapsed */}
      {!isExpanded && (
        <div className="px-4 py-2 text-sm text-gray-500 text-center bg-gray-50">
          {table.columns.length} column{table.columns.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default memo(ReactFlowTableNode);
