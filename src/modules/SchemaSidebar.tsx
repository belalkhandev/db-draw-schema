import React, { useState } from 'react';
import { X, Trash2, Calendar } from 'lucide-react';
import { AlertDialog } from '../components';
import type { Schema } from '../types';

interface SchemaSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  schemas: Schema[];
  currentSchemaId: string | null;
  onLoadSchema: (schemaId: string) => void;
  onDeleteSchema: (schemaId: string) => void;
}

export const SchemaSidebar: React.FC<SchemaSidebarProps> = ({
  isOpen,
  onClose,
  schemas,
  currentSchemaId,
  onLoadSchema,
  onDeleteSchema,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    schemaId: string | null;
    schemaName: string;
  }>({
    isOpen: false,
    schemaId: null,
    schemaName: '',
  });

  const handleDeleteClick = (schemaId: string, schemaName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({
      isOpen: true,
      schemaId,
      schemaName,
    });
  };

  const confirmDelete = () => {
    if (deleteConfirm.schemaId) {
      onDeleteSchema(deleteConfirm.schemaId);
      setDeleteConfirm({ isOpen: false, schemaId: null, schemaName: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 cursor-pointer" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col pointer-events-auto">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">All Schemas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {schemas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No schemas found</p>
              <p className="text-gray-400 text-xs mt-1">Create a new schema to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {schemas.map((schema) => (
                <div
                  key={schema.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    currentSchemaId === schema.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                  onClick={() => {
                    onLoadSchema(schema.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {schema.name}
                      </h3>
                      {schema.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {schema.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                            <rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            <rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            <rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                            <rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                          </svg>
                          {schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(schema.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(schema.id, schema.name, e)}
                      className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete schema"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, schemaId: null, schemaName: '' })}
        onConfirm={confirmDelete}
        title="Delete Schema"
        description={`Are you sure you want to delete the schema "${deleteConfirm.schemaName}"? This action cannot be undone and will permanently remove all tables, columns, and relationships.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};
