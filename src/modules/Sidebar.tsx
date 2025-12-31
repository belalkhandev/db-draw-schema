import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  addTable,
  addColumn,
  deleteColumn,
  selectColumn,
  updateColumn,
  selectTable,
  updateTable,
} from '../store/schemaSlice';
import { Button, Input, Select, Checkbox, AlertDialog } from '../components';
import { TableModal } from './TableModal';
import { Plus, X, MoreVertical, Edit, Link as LinkIcon } from 'lucide-react';
import type { ColumnDataType } from '../types';
import { toast } from 'sonner';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentSchema, selectedTableId, selectedColumnId } = useAppSelector(
    (state) => state.schema
  );
  const selectedTable = currentSchema?.tables.find(
    (t) => t.id === selectedTableId
  );
  const selectedColumn = selectedTable?.columns.find(
    (c) => c.id === selectedColumnId
  );

  const [expandedTableId, setExpandedTableId] = useState<string | null>(null);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableModalMode, setTableModalMode] = useState<'create' | 'edit'>('create');
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState('');

  const handleTableClick = (tableId: string) => {
    if (expandedTableId === tableId) {
      setExpandedTableId(null);
      dispatch(selectTable(null));
    } else {
      setExpandedTableId(tableId);
      dispatch(selectTable(tableId));
    }
  };

  const handleColumnClick = (columnId: string, tableId: string) => {
    if (expandedTableId !== tableId) {
      setExpandedTableId(tableId);
      dispatch(selectTable(tableId));
    }
    dispatch(selectColumn(columnId));
  };

  const handleCreateTable = () => {
    setTableModalMode('create');
    setEditingTableId(null);
    setEditingTableName('');
    setShowTableModal(true);
  };

  const handleEditTable = (tableId: string, tableName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTableModalMode('edit');
    setEditingTableId(tableId);
    setEditingTableName(tableName);
    setShowTableModal(true);
  };

  const handleSaveTable = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const duplicateTable = currentSchema?.tables.find(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase() &&
             (tableModalMode === 'create' || t.id !== editingTableId)
    );

    if (duplicateTable) {
      toast.error(`Table "${trimmedName}" already exists in this schema`);
      return;
    }

    if (tableModalMode === 'create') {
      const randomX = Math.random() * 300 + 100;
      const randomY = Math.random() * 200 + 100;
      dispatch(addTable({ name: trimmedName, position: { x: randomX, y: randomY } }));
      toast.success(`Table "${trimmedName}" created successfully`);
    } else if (tableModalMode === 'edit' && editingTableId) {
      dispatch(updateTable({ tableId: editingTableId, updates: { name: trimmedName } }));
      toast.success(`Table renamed to "${trimmedName}"`);
    }
    setShowTableModal(false);
  };

  const [isEditMode, setIsEditMode] = useState(false);
  const [columnForm, setColumnForm] = useState({
    name: '',
    dataType: 'VARCHAR' as ColumnDataType,
    length: 255,
    nullable: true,
    primaryKey: false,
    unique: false,
    autoIncrement: false,
    hasRelation: false,
    foreignKey: {
      tableId: '',
      columnId: '',
      relationshipType: 'ONE_TO_MANY' as 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY',
      onDelete: 'CASCADE' as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION',
      onUpdate: 'CASCADE' as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION',
    },
  });

  const [deleteColumnConfirm, setDeleteColumnConfirm] = useState<{
    isOpen: boolean;
    columnId: string | null;
    columnName: string;
  }>({
    isOpen: false,
    columnId: null,
    columnName: '',
  });

  useEffect(() => {
    if (selectedColumn) {
      setColumnForm({
        name: selectedColumn.name,
        dataType: selectedColumn.dataType,
        length: selectedColumn.length || 255,
        nullable: selectedColumn.nullable,
        primaryKey: selectedColumn.primaryKey,
        unique: selectedColumn.unique,
        autoIncrement: selectedColumn.autoIncrement || false,
        hasRelation: !!selectedColumn.foreignKey,
        foreignKey: {
          tableId: selectedColumn.foreignKey?.tableId || '',
          columnId: selectedColumn.foreignKey?.columnId || '',
          relationshipType: selectedColumn.foreignKey?.relationshipType || 'ONE_TO_MANY',
          onDelete: selectedColumn.foreignKey?.onDelete || 'CASCADE',
          onUpdate: selectedColumn.foreignKey?.onUpdate || 'CASCADE',
        },
      });
      setIsEditMode(true);
    } else {
      setIsEditMode(false);
      setColumnForm({
        name: '',
        dataType: 'VARCHAR',
        length: 255,
        nullable: true,
        primaryKey: false,
        unique: false,
        autoIncrement: false,
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
  }, [selectedColumn]);

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
    { value: 'JSON', label: 'JSON' },
  ];

  const handleSaveColumn = () => {
    if (!selectedTableId || !columnForm.name.trim()) return;

    const table = currentSchema?.tables.find((t) => t.id === selectedTableId);
    if (!table) return;

    const duplicateColumn = table.columns.find(
      (c) => c.name.toLowerCase() === columnForm.name.trim().toLowerCase() &&
             (!isEditMode || c.id !== selectedColumnId)
    );

    if (duplicateColumn) {
      toast.error(`Column "${columnForm.name}" already exists in this table`);
      return;
    }

    const columnData = {
      name: columnForm.name.trim(),
      dataType: columnForm.dataType,
      length: columnForm.length,
      nullable: columnForm.nullable,
      primaryKey: columnForm.primaryKey,
      unique: columnForm.unique,
      autoIncrement: columnForm.autoIncrement,
      foreignKey: columnForm.hasRelation && columnForm.foreignKey.tableId && columnForm.foreignKey.columnId
        ? columnForm.foreignKey
        : undefined,
    };

    if (isEditMode && selectedColumnId) {
      dispatch(
        updateColumn({
          tableId: selectedTableId,
          columnId: selectedColumnId,
          updates: columnData,
        })
      );
      dispatch(selectColumn(null));
      toast.success(`Column "${columnData.name}" updated successfully`);
    } else {
      dispatch(
        addColumn({
          tableId: selectedTableId,
          column: columnData,
        })
      );
      toast.success(`Column "${columnData.name}" created successfully`);
    }

    setColumnForm({
      name: '',
      dataType: 'VARCHAR',
      length: 255,
      nullable: true,
      primaryKey: false,
      unique: false,
      autoIncrement: false,
      hasRelation: false,
      foreignKey: {
        tableId: '',
        columnId: '',
        relationshipType: 'ONE_TO_MANY',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    dispatch(selectColumn(null));
    setColumnForm({
      name: '',
      dataType: 'VARCHAR',
      length: 255,
      nullable: true,
      primaryKey: false,
      unique: false,
      autoIncrement: false,
      hasRelation: false,
      foreignKey: {
        tableId: '',
        columnId: '',
        relationshipType: 'ONE_TO_MANY',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    });
    setIsEditMode(false);
  };

  const handleDeleteColumn = (columnId: string, columnName: string) => {
    setDeleteColumnConfirm({
      isOpen: true,
      columnId,
      columnName,
    });
  };

  const confirmDeleteColumn = () => {
    if (selectedTableId && deleteColumnConfirm.columnId) {
      const columnName = deleteColumnConfirm.columnName;
      dispatch(
        deleteColumn({
          tableId: selectedTableId,
          columnId: deleteColumnConfirm.columnId,
        })
      );
      setDeleteColumnConfirm({ isOpen: false, columnId: null, columnName: '' });
      if (selectedColumnId === deleteColumnConfirm.columnId) {
        dispatch(selectColumn(null));
      }
      toast.success(`Column "${columnName}" deleted successfully`);
    }
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-600">
              <rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            Tables
          </h2>
          <div className="flex items-center gap-1">
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={handleCreateTable}
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

      <div className="flex-1 overflow-y-auto">
        {!currentSchema ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No schema loaded</p>
          </div>
        ) : currentSchema.tables.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">No tables yet</p>
          </div>
        ) : (
          <div>
            {currentSchema.tables.map((table) => {
              const isExpanded = expandedTableId === table.id;
              return (
                <div key={table.id} className={isExpanded ? 'bg-blue-50' : ''}>
                  <div
                    className={`px-3 py-2.5 flex items-center justify-between cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
                      isExpanded ? 'bg-blue-100 hover:bg-blue-100' : ''
                    }`}
                    onClick={() => handleTableClick(table.id)}
                  >
                    <span className={`text-sm ${isExpanded ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                      {table.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {isExpanded && (
                        <button
                          className="p-1 hover:bg-blue-200 rounded"
                          onClick={(e) => handleEditTable(table.id, table.name, e)}
                        >
                          <Edit size={14} className="text-blue-600" />
                        </button>
                      )}
                      <button className="p-1 hover:bg-gray-200 rounded">
                        <MoreVertical size={14} className={isExpanded ? 'text-blue-600' : 'text-gray-400'} />
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="bg-white">
                      {table.columns.length === 0 ? (
                        <div className="px-3 py-4 text-center">
                          <p className="text-xs text-gray-500 mb-3">No columns yet</p>
                          <button
                            onClick={() => dispatch(selectColumn(null))}
                            className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Add Column
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="divide-y divide-gray-100">
                            {table.columns.map((column) => (
                              <div
                                key={column.id}
                                className="px-3 py-2 flex items-center gap-2 hover:bg-gray-50 cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleColumnClick(column.id, table.id);
                                }}
                              >
                                <div className={`px-2 py-1 text-xs font-medium rounded border-2 flex-shrink-0 ${
                                  column.primaryKey
                                    ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                                    : 'border-green-400 bg-green-50 text-green-800'
                                }`}>
                                  {column.name}
                                </div>
                                <div className="text-xs text-gray-500 flex-shrink-0 min-w-[60px]">
                                  {column.dataType}
                                  {column.length ? `(${column.length})` : ''}
                                </div>
                                <div className="text-xs text-gray-400 flex-shrink-0 w-4">
                                  {column.nullable ? 'N' : ''}
                                </div>
                                <div className="flex-1"></div>
                                {column.foreignKey?.tableId && column.foreignKey?.columnId ? (
                                  <div className="flex items-center gap-1">
                                    <LinkIcon size={12} className="text-blue-500" />
                                    <span className="text-xs text-blue-600">FK</span>
                                  </div>
                                ) : null}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteColumn(column.id, column.name);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
                                >
                                  <MoreVertical size={12} className="text-gray-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="px-3 py-2 flex items-center gap-2 border-t border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dispatch(selectColumn(null));
                              }}
                              className="px-3 py-1.5 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                            >
                              Add Column
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedTable && isEditMode && (
        <div className="border-t bg-white p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-700 uppercase">Edit Column</h4>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="Column name"
              value={columnForm.name}
              onChange={(e) =>
                setColumnForm({ ...columnForm, name: e.target.value })
              }
            />
            <Select
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
                type="number"
                placeholder="Length"
                value={columnForm.length}
                onChange={(e) =>
                  setColumnForm({
                    ...columnForm,
                    length: parseInt(e.target.value),
                  })
                }
              />
            )}
            <div className="space-y-1.5">
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
              <Checkbox
                label="Has relations"
                checked={columnForm.hasRelation}
                onChange={(e) =>
                  setColumnForm({
                    ...columnForm,
                    hasRelation: e.target.checked,
                    foreignKey: e.target.checked ? columnForm.foreignKey : {
                      tableId: '',
                      columnId: '',
                      relationshipType: 'ONE_TO_MANY',
                      onDelete: 'CASCADE',
                      onUpdate: 'CASCADE',
                    },
                  })
                }
              />
            </div>
            {columnForm.hasRelation && (
              <div className="space-y-2 border-t pt-2">
                <Select
                  label="Target Table"
                  options={
                    currentSchema?.tables
                      .filter((t) => t.id !== selectedTableId)
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
                    {currentSchema?.tables.find((t) => t.id === columnForm.foreignKey.tableId)?.columns.length === 0 ? (
                      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                        No columns found in the selected table
                      </div>
                    ) : (
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
                          value={columnForm.foreignKey.relationshipType || 'ONE_TO_MANY'}
                          onChange={(e) =>
                            setColumnForm({
                              ...columnForm,
                              foreignKey: { ...columnForm.foreignKey, relationshipType: e.target.value as 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY' },
                            })
                          }
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            label="ON DELETE"
                            options={[
                              { value: 'CASCADE', label: 'CASCADE' },
                              { value: 'SET NULL', label: 'SET NULL' },
                              { value: 'RESTRICT', label: 'RESTRICT' },
                              { value: 'NO ACTION', label: 'NO ACTION' },
                            ]}
                            value={columnForm.foreignKey.onDelete || 'CASCADE'}
                            onChange={(e) =>
                              setColumnForm({
                                ...columnForm,
                                foreignKey: { ...columnForm.foreignKey, onDelete: e.target.value as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' },
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
                            value={columnForm.foreignKey.onUpdate || 'CASCADE'}
                            onChange={(e) =>
                              setColumnForm({
                                ...columnForm,
                                foreignKey: { ...columnForm.foreignKey, onUpdate: e.target.value as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' },
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            <Button onClick={handleSaveColumn} className="w-full bg-blue-500 hover:bg-blue-600">
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {selectedTable && !isEditMode && selectedColumnId === null && (
        <div className="border-t bg-white p-3 shadow-lg">
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Add Column</h4>
          <div className="space-y-2">
            <Input
              placeholder="Column name"
              value={columnForm.name}
              onChange={(e) =>
                setColumnForm({ ...columnForm, name: e.target.value })
              }
            />
            <div className="flex gap-2 items-center">
                <Select
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
                        type="number"
                        placeholder="Length"
                        value={columnForm.length}
                        onChange={(e) =>
                            setColumnForm({
                                ...columnForm,
                                length: parseInt(e.target.value),
                            })
                        }
                    />
                )}
            </div>
            <div className="space-y-1.5">
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
              <Checkbox
                label="Has relations"
                checked={columnForm.hasRelation}
                onChange={(e) =>
                  setColumnForm({
                    ...columnForm,
                    hasRelation: e.target.checked,
                    foreignKey: e.target.checked ? columnForm.foreignKey : {
                      tableId: '',
                      columnId: '',
                      relationshipType: 'ONE_TO_MANY',
                      onDelete: 'CASCADE',
                      onUpdate: 'CASCADE',
                    },
                  })
                }
              />
            </div>
            {columnForm.hasRelation && (
              <div className="space-y-2 border-t pt-2">
                <Select
                  label="Target Table"
                  options={
                    currentSchema?.tables
                      .filter((t) => t.id !== selectedTableId)
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
                    {currentSchema?.tables.find((t) => t.id === columnForm.foreignKey.tableId)?.columns.length === 0 ? (
                      <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded border border-amber-200">
                        No columns found in the selected table
                      </div>
                    ) : (
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
                          value={columnForm.foreignKey.relationshipType || 'ONE_TO_MANY'}
                          onChange={(e) =>
                            setColumnForm({
                              ...columnForm,
                              foreignKey: { ...columnForm.foreignKey, relationshipType: e.target.value as 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY' },
                            })
                          }
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Select
                            label="ON DELETE"
                            options={[
                              { value: 'CASCADE', label: 'CASCADE' },
                              { value: 'SET NULL', label: 'SET NULL' },
                              { value: 'RESTRICT', label: 'RESTRICT' },
                              { value: 'NO ACTION', label: 'NO ACTION' },
                            ]}
                            value={columnForm.foreignKey.onDelete || 'CASCADE'}
                            onChange={(e) =>
                              setColumnForm({
                                ...columnForm,
                                foreignKey: { ...columnForm.foreignKey, onDelete: e.target.value as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' },
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
                            value={columnForm.foreignKey.onUpdate || 'CASCADE'}
                            onChange={(e) =>
                              setColumnForm({
                                ...columnForm,
                                foreignKey: { ...columnForm.foreignKey, onUpdate: e.target.value as 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' },
                              })
                            }
                          />
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            <Button onClick={handleSaveColumn} className="w-full bg-blue-500 hover:bg-blue-600">
              Add Column
            </Button>
          </div>
        </div>
      )}

      <AlertDialog
        isOpen={deleteColumnConfirm.isOpen}
        onClose={() =>
          setDeleteColumnConfirm({
            isOpen: false,
            columnId: null,
            columnName: '',
          })
        }
        onConfirm={confirmDeleteColumn}
        title="Delete Column"
        description={`Are you sure you want to delete the column "${deleteColumnConfirm.columnName}"? This action cannot be undone and will also remove any relationships using this column.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onSave={handleSaveTable}
        initialName={editingTableName}
        mode={tableModalMode}
      />
    </div>
    </>
  );
};
