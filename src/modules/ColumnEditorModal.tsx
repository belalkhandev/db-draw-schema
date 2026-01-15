import { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { Button, Input, Select, Checkbox } from '../components';
import { X } from 'lucide-react';
import type { Column, ColumnDataType } from '../types';

interface ColumnEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (columnData: Partial<Column>) => void;
  tableId: string;
  column?: Column;
  mode: 'create' | 'edit';
}

export const ColumnEditorModal = ({
  isOpen,
  onClose,
  onSave,
  tableId,
  column,
  mode,
}: ColumnEditorModalProps) => {
  const { currentSchema } = useAppSelector((state) => state.schema);

  const [columnForm, setColumnForm] = useState({
    name: '',
    dataType: 'VARCHAR' as ColumnDataType,
    length: 255,
    nullable: true,
    primaryKey: false,
    unique: false,
    autoIncrement: false,
    comment: '',
    enumValues: '',
    hasRelation: false,
    foreignKey: {
      tableId: '',
      columnId: '',
      relationshipType: 'ONE_TO_MANY' as 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY',
      onDelete: 'CASCADE' as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION',
      onUpdate: 'CASCADE' as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION',
    },
  });

  useEffect(() => {
    if (mode === 'edit' && column) {
      setColumnForm({
        name: column.name,
        dataType: column.dataType,
        length: column.length || 255,
        nullable: column.nullable,
        primaryKey: column.primaryKey,
        unique: column.unique,
        autoIncrement: column.autoIncrement || false,
        comment: column.comment || '',
        enumValues: column.enumValues?.join(', ') || '',
        hasRelation: !!column.foreignKey,
        foreignKey: {
          tableId: column.foreignKey?.tableId || '',
          columnId: column.foreignKey?.columnId || '',
          relationshipType: column.foreignKey?.relationshipType || 'ONE_TO_MANY',
          onDelete: column.foreignKey?.onDelete || 'CASCADE',
          onUpdate: column.foreignKey?.onUpdate || 'CASCADE',
        },
      });
    } else {
      setColumnForm({
        name: '',
        dataType: 'VARCHAR',
        length: 255,
        nullable: true,
        primaryKey: false,
        unique: false,
        autoIncrement: false,
        comment: '',
        enumValues: '',
        hasRelation: false,
        foreignKey: {
          tableId: '',
          columnId: '',
          relationshipType: 'ONE_TO_MANY',
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
      });
    }
  }, [column, mode, isOpen]);

  const dataTypes: { value: ColumnDataType; label: string }[] = [
    { value: 'VARCHAR', label: 'VARCHAR' },
    { value: 'INT', label: 'INT' },
    { value: 'BIGINT', label: 'BIGINT' },
    { value: 'TEXT', label: 'TEXT' },
    { value: 'DATE', label: 'DATE' },
    { value: 'DATETIME', label: 'DATETIME' },
    { value: 'TIMESTAMP', label: 'TIMESTAMP' },
    { value: 'BOOLEAN', label: 'BOOLEAN' },
    { value: 'DECIMAL', label: 'DECIMAL' },
    { value: 'FLOAT', label: 'FLOAT' },
    { value: 'ENUM', label: 'ENUM' },
    { value: 'JSON', label: 'JSON' },
  ];

  const handleSave = () => {
    if (!columnForm.name.trim()) return;

    const columnData = {
      name: columnForm.name.trim(),
      dataType: columnForm.dataType,
      length: columnForm.length,
      nullable: columnForm.nullable,
      primaryKey: columnForm.primaryKey,
      unique: columnForm.unique,
      autoIncrement: columnForm.autoIncrement,
      comment: columnForm.comment.trim() || undefined,
      enumValues: columnForm.dataType === 'ENUM' && columnForm.enumValues.trim()
        ? columnForm.enumValues.split(',').map(v => v.trim()).filter(v => v.length > 0)
        : undefined,
      foreignKey: columnForm.hasRelation && columnForm.foreignKey.tableId && columnForm.foreignKey.columnId
        ? columnForm.foreignKey
        : undefined,
    };

    onSave(columnData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600">
          <h3 className="text-lg font-semibold text-white">
            {mode === 'create' ? 'Add Column' : 'Edit Column'}
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Input
            label="Column Name"
            placeholder="column_name"
            value={columnForm.name}
            onChange={(e) =>
              setColumnForm({ ...columnForm, name: e.target.value })
            }
            required
          />

          <Select
            label="Data Type"
            options={dataTypes}
            value={columnForm.dataType}
            onChange={(e) =>
              setColumnForm({
                ...columnForm,
                dataType: e.target.value as ColumnDataType,
              })
            }
          />

          {['VARCHAR', 'CHAR'].includes(columnForm.dataType) && (
            <Input
              label="Length"
              type="number"
              placeholder="255"
              value={columnForm.length}
              onChange={(e) =>
                setColumnForm({
                  ...columnForm,
                  length: parseInt(e.target.value) || 255,
                })
              }
            />
          )}

          {columnForm.dataType === 'ENUM' && (
            <Input
              label="Enum Values"
              placeholder="value1, value2, value3"
              value={columnForm.enumValues}
              onChange={(e) =>
                setColumnForm({
                  ...columnForm,
                  enumValues: e.target.value,
                })
              }
            />
          )}

          <Input
            label="Comment (Optional)"
            placeholder="Add a description..."
            value={columnForm.comment}
            onChange={(e) =>
              setColumnForm({
                ...columnForm,
                comment: e.target.value,
              })
            }
          />

          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium text-gray-700">Options</div>
            <Checkbox
              label="Primary Key"
              checked={columnForm.primaryKey}
              onChange={(e) =>
                setColumnForm({
                  ...columnForm,
                  primaryKey: e.target.checked,
                  nullable: !e.target.checked,
                })
              }
            />
            <Checkbox
              label="Auto Increment"
              checked={columnForm.autoIncrement}
              onChange={(e) =>
                setColumnForm({
                  ...columnForm,
                  autoIncrement: e.target.checked,
                })
              }
            />
            <Checkbox
              label="Unique"
              checked={columnForm.unique}
              onChange={(e) =>
                setColumnForm({ ...columnForm, unique: e.target.checked })
              }
            />
            <Checkbox
              label="Nullable"
              checked={columnForm.nullable}
              disabled={columnForm.primaryKey}
              onChange={(e) =>
                setColumnForm({ ...columnForm, nullable: e.target.checked })
              }
            />
          </div>

          <div className="pt-4 border-t">
            <Checkbox
              label="Add Foreign Key Relation"
              checked={columnForm.hasRelation}
              onChange={(e) =>
                setColumnForm({
                  ...columnForm,
                  hasRelation: e.target.checked,
                })
              }
            />
          </div>

          {columnForm.hasRelation && (
            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
              <Select
                label="Target Table"
                options={
                  currentSchema?.tables
                    .filter((t) => t.id !== tableId)
                    .map((t) => ({ value: t.id, label: t.name })) || []
                }
                value={columnForm.foreignKey.tableId}
                onChange={(e) =>
                  setColumnForm({
                    ...columnForm,
                    foreignKey: { ...columnForm.foreignKey, tableId: e.target.value, columnId: '' },
                  })
                }
                placeholder="Select table"
              />

              {columnForm.foreignKey.tableId && (
                <>
                  <Select
                    label="Target Column"
                    options={
                      currentSchema?.tables
                        .find((t) => t.id === columnForm.foreignKey.tableId)
                        ?.columns.map((c) => ({ value: c.id, label: `${c.name} (${c.dataType})` })) || []
                    }
                    value={columnForm.foreignKey.columnId}
                    onChange={(e) =>
                      setColumnForm({
                        ...columnForm,
                        foreignKey: { ...columnForm.foreignKey, columnId: e.target.value },
                      })
                    }
                    placeholder="Select column"
                  />

                  <Select
                    label="Relationship Type"
                    options={[
                      { value: 'ONE_TO_ONE', label: 'One to One (1:1)' },
                      { value: 'ONE_TO_MANY', label: 'One to Many (1:N)' },
                      { value: 'MANY_TO_MANY', label: 'Many to Many (N:M)' },
                    ]}
                    value={columnForm.foreignKey.relationshipType}
                    onChange={(e) =>
                      setColumnForm({
                        ...columnForm,
                        foreignKey: { ...columnForm.foreignKey, relationshipType: e.target.value as any },
                      })
                    }
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Select
                      label="ON DELETE"
                      options={[
                        { value: 'CASCADE', label: 'CASCADE' },
                        { value: 'SET NULL', label: 'SET NULL' },
                        { value: 'RESTRICT', label: 'RESTRICT' },
                        { value: 'NO ACTION', label: 'NO ACTION' },
                      ]}
                      value={columnForm.foreignKey.onDelete}
                      onChange={(e) =>
                        setColumnForm({
                          ...columnForm,
                          foreignKey: { ...columnForm.foreignKey, onDelete: e.target.value as any },
                        })
                      }
                    />

                    <Select
                      label="ON UPDATE"
                      options={[
                        { value: 'CASCADE', label: 'CASCADE' },
                        { value: 'SET NULL', label: 'SET NULL' },
                        { value: 'RESTRICT', label: 'RESTRICT' },
                        { value: 'NO ACTION', label: 'NO ACTION' },
                      ]}
                      value={columnForm.foreignKey.onUpdate}
                      onChange={(e) =>
                        setColumnForm({
                          ...columnForm,
                          foreignKey: { ...columnForm.foreignKey, onUpdate: e.target.value as any },
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
            disabled={!columnForm.name.trim()}
          >
            {mode === 'create' ? 'Add Column' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </>
  );
};
