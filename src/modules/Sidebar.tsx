import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  addTable,
  addColumn,
  deleteColumn,
  updateColumn,
  selectTable,
  updateTable,
  reorderTables,
  reorderColumns,
} from '../store/schemaSlice';
import { AlertDialog, Popover } from '../components';
import { TableModal } from './TableModal';
import { DraggableTableList } from './DraggableTableList';
import { DraggableColumnList } from './DraggableColumnList';
import { TableListItem } from './TableListItem';
import { ColumnListItem } from './ColumnListItem';
import { ColumnOptionsMenu } from './ColumnOptionsMenu';
import { AddColumnRow } from './AddColumnRow';
import { Plus, MoreVertical } from 'lucide-react';
import type { ColumnDataType, Column, Table } from '../types';
import { toast } from 'sonner';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentSchema } = useAppSelector((state) => state.schema);

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

  const [deleteColumnConfirm, setDeleteColumnConfirm] = useState<{
    isOpen: boolean;
    tableId: string | null;
    columnId: string | null;
    columnName: string;
  }>({
    isOpen: false,
    tableId: null,
    columnId: null,
    columnName: '',
  });

  const [columnMenuOpen, setColumnMenuOpen] = useState<string | null>(null);

  const handleDeleteColumn = (tableId: string, columnId: string, columnName: string) => {
    setDeleteColumnConfirm({
      isOpen: true,
      tableId,
      columnId,
      columnName,
    });
  };

  const confirmDeleteColumn = () => {
    const { tableId, columnId, columnName } = deleteColumnConfirm as {
      tableId: string;
      columnId: string;
      columnName: string;
    };
    if (tableId && columnId) {
      dispatch(deleteColumn({ tableId, columnId }));
      setDeleteColumnConfirm({ isOpen: false, columnId: null, columnName: '', tableId: null });
      toast.success(`Column "${columnName}" deleted successfully`);
    }
  };

  const handleColumnUpdate = (tableId: string, columnId: string, updates: Partial<Column>) => {
    dispatch(updateColumn({ tableId, columnId, updates }));
  };

  const handleTableReorder = (tables: Table[]) => {
    dispatch(reorderTables(tables));
  };

  const handleColumnReorder = (tableId: string, columns: Column[]) => {
    dispatch(reorderColumns({ tableId, columns }));
  };

  const handleAddColumn = (tableId: string, name: string, dataType: ColumnDataType) => {
    const table = currentSchema?.tables.find((t) => t.id === tableId);
    if (!table) return;

    const duplicateColumn = table.columns.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateColumn) {
      toast.error(`Column "${name}" already exists in this table`);
      return;
    }

    dispatch(
      addColumn({
        tableId,
        column: {
          name,
          dataType,
          nullable: true,
          primaryKey: false,
          unique: false,
          autoIncrement: false,
        },
      })
    );
    toast.success(`Column "${name}" created successfully`);
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
          <DraggableTableList
            tables={currentSchema.tables}
            onReorder={handleTableReorder}
          >
            {currentSchema.tables.map((table) => {
              const isExpanded = expandedTableId === table.id;
              return (
                <TableListItem
                  key={table.id}
                  table={table}
                  isExpanded={isExpanded}
                  onClick={() => handleTableClick(table.id)}
                  onEdit={(e) => handleEditTable(table.id, table.name, e)}
                >
                  {isExpanded && (
                    <div className="bg-white">
                      <DraggableColumnList
                        columns={table.columns}
                        onReorder={(columns) => handleColumnReorder(table.id, columns)}
                      >
                        {table.columns.map((column) => (
                          <ColumnListItem
                            key={column.id}
                            column={column}
                            onUpdate={(updates) => handleColumnUpdate(table.id, column.id, updates)}
                            menuButton={
                              <Popover
                                trigger={
                                  <button className="p-1 hover:bg-gray-200 rounded flex-shrink-0">
                                    <MoreVertical size={12} className="text-gray-400" />
                                  </button>
                                }
                                open={columnMenuOpen === column.id}
                                onOpenChange={(open) => setColumnMenuOpen(open ? column.id : null)}
                              >
                                <ColumnOptionsMenu
                                  column={column}
                                  onClose={() => setColumnMenuOpen(null)}
                                  onUpdate={(updates) => handleColumnUpdate(table.id, column.id, updates)}
                                  onDelete={() => {
                                    setColumnMenuOpen(null);
                                    handleDeleteColumn(table.id, column.id, column.name);
                                  }}
                                />
                              </Popover>
                            }
                          />
                        ))}
                      </DraggableColumnList>
                      <AddColumnRow onAdd={(name, dataType) => handleAddColumn(table.id, name, dataType)} />
                    </div>
                  )}
                </TableListItem>
              );
            })}
          </DraggableTableList>
        )}
      </div>

      <AlertDialog
        isOpen={deleteColumnConfirm.isOpen}
        onClose={() =>
          setDeleteColumnConfirm({
            isOpen: false,
            tableId: null,
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
