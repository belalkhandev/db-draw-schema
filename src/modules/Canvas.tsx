import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  updateTablePosition,
  deleteTable,
  selectTable,
  selectColumn,
  deleteRelationship,
} from '../store/schemaSlice';
import { TableCard } from './TableCard';
import { RelationshipsSVG } from './RelationshipLine';
import { AlertDialog } from '../components';

export const Canvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentSchema, selectedTableId } = useAppSelector(
    (state) => state.schema
  );

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    tableId: string | null;
    tableName: string;
  }>({
    isOpen: false,
    tableId: null,
    tableName: '',
  });

  const [deleteRelationshipConfirm, setDeleteRelationshipConfirm] = useState<{
    isOpen: boolean;
    relationshipId: string | null;
    relationshipName: string;
  }>({
    isOpen: false,
    relationshipId: null,
    relationshipName: '',
  });

  const handleTablePositionChange = (tableId: string, x: number, y: number) => {
    dispatch(updateTablePosition({ tableId, position: { x, y } }));
  };

  const handleTableSelect = (tableId: string) => {
    dispatch(selectTable(tableId));
  };

  const handleTableEdit = (tableId: string) => {
    dispatch(selectTable(tableId));
  };

  const handleColumnClick = (tableId: string, columnId: string) => {
    dispatch(selectTable(tableId));
    dispatch(selectColumn(columnId));
  };

  const handleTableDelete = (tableId: string) => {
    const table = currentSchema?.tables.find((t) => t.id === tableId);
    if (table) {
      setDeleteConfirm({
        isOpen: true,
        tableId: tableId,
        tableName: table.name,
      });
    }
  };

  const confirmTableDelete = () => {
    if (deleteConfirm.tableId) {
      dispatch(deleteTable(deleteConfirm.tableId));
      setDeleteConfirm({ isOpen: false, tableId: null, tableName: '' });
    }
  };

  const handleRelationshipDelete = (
    relationshipId: string,
    relationshipName: string
  ) => {
    setDeleteRelationshipConfirm({
      isOpen: true,
      relationshipId,
      relationshipName,
    });
  };

  const confirmRelationshipDelete = () => {
    if (deleteRelationshipConfirm.relationshipId) {
      dispatch(deleteRelationship(deleteRelationshipConfirm.relationshipId));
      setDeleteRelationshipConfirm({
        isOpen: false,
        relationshipId: null,
        relationshipName: '',
      });
    }
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((prevZoom) => Math.max(0.3, Math.min(2, prevZoom + delta)));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed) {
        setIsSpacePressed(true);
        e.preventDefault();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setZoom((prevZoom) => Math.min(2, prevZoom + 0.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom((prevZoom) => Math.max(0.3, prevZoom - 0.1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      if (canvas) {
        canvas.removeEventListener('wheel', handleWheel);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current || isSpacePressed) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (!isSpacePressed) {
      setIsPanning(false);
    }
  };

  if (!currentSchema) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 text-lg">No schema loaded</p>
          <p className="text-gray-400 text-sm mt-2">
            Create a new schema to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="flex-1 relative bg-gray-50 overflow-hidden"
      style={{ cursor: isPanning || isSpacePressed ? 'grab' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 right-4 z-50 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200">
        <div className="text-sm text-gray-700 font-medium">
          Zoom: {Math.round(zoom * 100)}%
        </div>
        <div className="text-xs text-gray-500 mt-1.5 space-y-0.5">
          <div>🖱️ Scroll to zoom</div>
          <div>🖐️ Drag canvas to pan</div>
          <div>⌨️ Space + drag to pan</div>
        </div>
      </div>

      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <div
          className="absolute"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            width: '10000px',
            height: '10000px',
            left: '-5000px',
            top: '-5000px',
          }}
        />

        <RelationshipsSVG
          relationships={currentSchema.relationships}
          tables={currentSchema.tables}
          onDeleteRelationship={handleRelationshipDelete}
        />

        {currentSchema.tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            isSelected={selectedTableId === table.id}
            onSelect={() => handleTableSelect(table.id)}
            onPositionChange={(x, y) =>
              handleTablePositionChange(table.id, x, y)
            }
            onEdit={() => handleTableEdit(table.id)}
            onDelete={() => handleTableDelete(table.id)}
            onColumnClick={(columnId) => handleColumnClick(table.id, columnId)}
          />
        ))}
      </div>

      <AlertDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() =>
          setDeleteConfirm({ isOpen: false, tableId: null, tableName: '' })
        }
        onConfirm={confirmTableDelete}
        title="Delete Table"
        description={`Are you sure you want to delete the table "${deleteConfirm.tableName}"? This action cannot be undone and will also remove all relationships associated with this table.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <AlertDialog
        isOpen={deleteRelationshipConfirm.isOpen}
        onClose={() =>
          setDeleteRelationshipConfirm({
            isOpen: false,
            relationshipId: null,
            relationshipName: '',
          })
        }
        onConfirm={confirmRelationshipDelete}
        title="Delete Relationship"
        description={`Are you sure you want to delete the relationship "${deleteRelationshipConfirm.relationshipName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
