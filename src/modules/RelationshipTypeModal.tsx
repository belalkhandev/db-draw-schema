import React, { useState } from 'react';
import { Modal } from '../components';
import type { RelationshipType } from '../types';

interface RelationshipTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (relationshipType: RelationshipType, cascadeOnDelete: boolean, cascadeOnUpdate: boolean) => void;
  sourceTable: string;
  targetTable: string;
  sourceColumn: string;
  targetColumn: string;
}

const RelationshipTypeModal: React.FC<RelationshipTypeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  sourceTable,
  targetTable,
  sourceColumn,
  targetColumn,
}) => {
  const [selectedType, setSelectedType] = useState<RelationshipType>('ONE_TO_MANY');
  const [cascadeOnDelete, setCascadeOnDelete] = useState(false);
  const [cascadeOnUpdate, setCascadeOnUpdate] = useState(false);

  const handleConfirm = () => {
    onConfirm(selectedType, cascadeOnDelete, cascadeOnUpdate);
    // Reset to defaults
    setSelectedType('ONE_TO_MANY');
    setCascadeOnDelete(false);
    setCascadeOnUpdate(false);
  };

  const handleClose = () => {
    // Reset to defaults
    setSelectedType('ONE_TO_MANY');
    setCascadeOnDelete(false);
    setCascadeOnUpdate(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Relationship">
      <div className="space-y-4">
        {/* Connection Info */}
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{sourceTable}.{sourceColumn}</span>
          {' → '}
          <span className="font-semibold text-gray-900">{targetTable}.{targetColumn}</span>
        </div>

        {/* Relationship Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Relationship Type
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                borderColor: selectedType === 'ONE_TO_ONE' ? '#10b981' : '#e5e7eb',
                backgroundColor: selectedType === 'ONE_TO_ONE' ? '#f0fdf4' : 'white',
              }}
            >
              <input
                type="radio"
                name="relationshipType"
                value="ONE_TO_ONE"
                checked={selectedType === 'ONE_TO_ONE'}
                onChange={(e) => setSelectedType(e.target.value as RelationshipType)}
                className="w-4 h-4 text-green-600"
              />
              <span className="font-medium text-gray-900">One to One (1:1)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                borderColor: selectedType === 'ONE_TO_MANY' ? '#3b82f6' : '#e5e7eb',
                backgroundColor: selectedType === 'ONE_TO_MANY' ? '#eff6ff' : 'white',
              }}
            >
              <input
                type="radio"
                name="relationshipType"
                value="ONE_TO_MANY"
                checked={selectedType === 'ONE_TO_MANY'}
                onChange={(e) => setSelectedType(e.target.value as RelationshipType)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-medium text-gray-900">One to Many (1:N)</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors hover:bg-gray-50"
              style={{
                borderColor: selectedType === 'MANY_TO_MANY' ? '#8b5cf6' : '#e5e7eb',
                backgroundColor: selectedType === 'MANY_TO_MANY' ? '#faf5ff' : 'white',
              }}
            >
              <input
                type="radio"
                name="relationshipType"
                value="MANY_TO_MANY"
                checked={selectedType === 'MANY_TO_MANY'}
                onChange={(e) => setSelectedType(e.target.value as RelationshipType)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="font-medium text-gray-900">Many to Many (N:M)</span>
            </label>
          </div>
        </div>

        {/* Cascade Options */}
        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cascadeOnDelete}
              onChange={(e) => setCascadeOnDelete(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Cascade on delete</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cascadeOnUpdate}
              onChange={(e) => setCascadeOnUpdate(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-700">Cascade on update</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RelationshipTypeModal;
