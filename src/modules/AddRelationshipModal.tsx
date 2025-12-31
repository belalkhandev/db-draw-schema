import React, { useState } from 'react';
import { Modal, Button, Select } from '../components';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addRelationship } from '../store/schemaSlice';
import type { RelationshipType } from '../types';

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRelationshipModal: React.FC<AddRelationshipModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { currentSchema } = useAppSelector((state) => state.schema);

  const [form, setForm] = useState({
    type: 'ONE_TO_MANY' as RelationshipType,
    sourceTableId: '',
    sourceColumnId: '',
    targetTableId: '',
    targetColumnId: '',
    onDelete: 'RESTRICT' as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION',
    onUpdate: 'CASCADE' as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION',
  });

  const tables = currentSchema?.tables || [];
  const sourceTable = tables.find((t) => t.id === form.sourceTableId);
  const targetTable = tables.find((t) => t.id === form.targetTableId);

  const relationshipTypes: { value: RelationshipType; label: string }[] = [
    { value: 'ONE_TO_ONE', label: 'One to One (1:1)' },
    { value: 'ONE_TO_MANY', label: 'One to Many (1:N)' },
    { value: 'MANY_TO_MANY', label: 'Many to Many (N:M)' },
  ];

  const constraintOptions = [
    { value: 'CASCADE', label: 'CASCADE' },
    { value: 'SET NULL', label: 'SET NULL' },
    { value: 'RESTRICT', label: 'RESTRICT' },
    { value: 'NO ACTION', label: 'NO ACTION' },
  ];

  const handleSubmit = () => {
    if (
      form.sourceTableId &&
      form.sourceColumnId &&
      form.targetTableId &&
      form.targetColumnId
    ) {
      dispatch(addRelationship(form));
      onClose();
      setForm({
        type: 'ONE_TO_MANY',
        sourceTableId: '',
        sourceColumnId: '',
        targetTableId: '',
        targetColumnId: '',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Relationship" size="md">
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            Create a foreign key relationship between two tables. The source (child) table will reference the target (parent) table.
          </p>
        </div>

        <Select
          label="Relationship Type"
          options={relationshipTypes}
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value as RelationshipType })
          }
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Source (Child) */}
          <div className="space-y-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-sm text-green-800 flex items-center gap-2">
              <span className="text-lg">→</span>
              Source (Child Table)
            </h4>
            <Select
              label="Table"
              options={[
                { value: '', label: 'Select table...' },
                ...tables.map((t) => ({ value: t.id, label: t.name })),
              ]}
              value={form.sourceTableId}
              onChange={(e) =>
                setForm({
                  ...form,
                  sourceTableId: e.target.value,
                  sourceColumnId: '',
                })
              }
            />
            <Select
              label="Column"
              options={[
                { value: '', label: 'Select column...' },
                ...(sourceTable?.columns.map((c) => ({
                  value: c.id,
                  label: c.name,
                })) || []),
              ]}
              value={form.sourceColumnId}
              onChange={(e) =>
                setForm({ ...form, sourceColumnId: e.target.value })
              }
              disabled={!form.sourceTableId}
            />
          </div>

          {/* Target (Parent) */}
          <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-sm text-purple-800 flex items-center gap-2">
              <span className="text-lg">←</span>
              Target (Parent Table)
            </h4>
            <Select
              label="Table"
              options={[
                { value: '', label: 'Select table...' },
                ...tables.map((t) => ({ value: t.id, label: t.name })),
              ]}
              value={form.targetTableId}
              onChange={(e) =>
                setForm({
                  ...form,
                  targetTableId: e.target.value,
                  targetColumnId: '',
                })
              }
            />
            <Select
              label="Column"
              options={[
                { value: '', label: 'Select column...' },
                ...(targetTable?.columns.map((c) => ({
                  value: c.id,
                  label: c.name,
                })) || []),
              ]}
              value={form.targetColumnId}
              onChange={(e) =>
                setForm({ ...form, targetColumnId: e.target.value })
              }
              disabled={!form.targetTableId}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="ON DELETE"
            options={constraintOptions}
            value={form.onDelete}
            onChange={(e) =>
              setForm({
                ...form,
                onDelete: e.target.value as typeof form.onDelete,
              })
            }
          />
          <Select
            label="ON UPDATE"
            options={constraintOptions}
            value={form.onUpdate}
            onChange={(e) =>
              setForm({
                ...form,
                onUpdate: e.target.value as typeof form.onUpdate,
              })
            }
          />
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Relationship</Button>
        </div>
      </div>
    </Modal>
  );
};
