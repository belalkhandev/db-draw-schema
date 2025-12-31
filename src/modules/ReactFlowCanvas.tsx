import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  type Connection,
  type ReactFlowInstance,
  useNodesState,
  useEdgesState,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Panel,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useAppSelector, useAppDispatch } from '../store/hooks';
import {
  updateTablePosition,
  deleteTable,
  selectTable,
  selectColumn,
  deleteRelationship,
  addRelationship,
} from '../store/schemaSlice';
import { AlertDialog } from '../components';
import ReactFlowTableNode from './ReactFlowTableNode';
import ReactFlowRelationshipEdge from './ReactFlowRelationshipEdge';
import RelationshipTypeModal from './RelationshipTypeModal';
import type { RelationshipType } from '../types';

// Define custom node and edge types
const nodeTypes = {
  tableNode: ReactFlowTableNode,
};

const edgeTypes = {
  relationshipEdge: ReactFlowRelationshipEdge,
};

export const ReactFlowCanvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentSchema, selectedTableId } = useAppSelector(
    (state) => state.schema
  );

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [zoom, setZoom] = useState(100);

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

  const [pendingConnection, setPendingConnection] = useState<{
    isOpen: boolean;
    connection: Connection | null;
  }>({
    isOpen: false,
    connection: null,
  });

  // Handle spacebar for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacePressed && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSpacePressed]);

  // Define callbacks first
  const handleTableEdit = useCallback((tableId: string) => {
    dispatch(selectTable(tableId));
  }, [dispatch]);

  const handleTableDelete = useCallback((tableId: string) => {
    const table = currentSchema?.tables.find((t) => t.id === tableId);
    if (table) {
      setDeleteConfirm({
        isOpen: true,
        tableId: tableId,
        tableName: table.name,
      });
    }
  }, [currentSchema?.tables]);

  const confirmTableDelete = useCallback(() => {
    if (deleteConfirm.tableId) {
      dispatch(deleteTable(deleteConfirm.tableId));
      setDeleteConfirm({ isOpen: false, tableId: null, tableName: '' });
    }
  }, [deleteConfirm.tableId, dispatch]);

  const handleColumnClick = useCallback((tableId: string, columnId: string) => {
    dispatch(selectTable(tableId));
    dispatch(selectColumn(columnId));
  }, [dispatch]);

  const handleEdgeDeleteClick = useCallback((edgeId: string) => {
    const relationship = currentSchema?.relationships.find((r) => r.id === edgeId);
    if (relationship) {
      const sourceTable = currentSchema?.tables.find(
        (t) => t.id === relationship.sourceTableId
      );
      const targetTable = currentSchema?.tables.find(
        (t) => t.id === relationship.targetTableId
      );
      setDeleteRelationshipConfirm({
        isOpen: true,
        relationshipId: edgeId,
        relationshipName: `${sourceTable?.name} → ${targetTable?.name}`,
      });
    }
  }, [currentSchema?.relationships, currentSchema?.tables]);

  const confirmRelationshipDelete = useCallback(() => {
    if (deleteRelationshipConfirm.relationshipId) {
      dispatch(deleteRelationship(deleteRelationshipConfirm.relationshipId));
      setDeleteRelationshipConfirm({
        isOpen: false,
        relationshipId: null,
        relationshipName: '',
      });
    }
  }, [deleteRelationshipConfirm.relationshipId, dispatch]);

  // Convert tables to React Flow nodes
  useEffect(() => {
    if (!currentSchema) {
      setNodes([]);
      return;
    }

    const newNodes: Node[] = currentSchema.tables.map((table) => ({
      id: table.id,
      type: 'tableNode',
      position: { x: table.position.x, y: table.position.y },
      data: {
        table,
        isSelected: selectedTableId === table.id,
        onEdit: handleTableEdit,
        onDelete: handleTableDelete,
        onColumnClick: handleColumnClick,
      },
    }));

    setNodes(newNodes);
  }, [currentSchema?.tables, selectedTableId, handleTableEdit, handleTableDelete, handleColumnClick]);

  // Convert relationships to React Flow edges
  useEffect(() => {
    if (!currentSchema) {
      setEdges([]);
      return;
    }

    const newEdges: Edge[] = currentSchema.relationships.map((relationship) => ({
      id: relationship.id,
      source: relationship.sourceTableId,
      target: relationship.targetTableId,
      sourceHandle: `${relationship.sourceTableId}-${relationship.sourceColumnId}-source`,
      targetHandle: `${relationship.targetTableId}-${relationship.targetColumnId}-target`,
      type: 'relationshipEdge',
      data: {
        relationshipType: relationship.type,
        onDelete: handleEdgeDeleteClick,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
    }));

    setEdges(newEdges);
  }, [currentSchema?.relationships, handleEdgeDeleteClick]);

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      dispatch(
        updateTablePosition({
          tableId: node.id,
          position: { x: node.position.x, y: node.position.y },
        })
      );
    },
    [dispatch]
  );

  // Handle connection start - when user starts dragging from a handle
  const onConnect = useCallback((connection: Connection) => {
    // Open modal to select relationship type
    setPendingConnection({
      isOpen: true,
      connection,
    });
  }, []);

  const handleRelationshipTypeConfirm = useCallback(
    (
      relationshipType: RelationshipType,
      cascadeOnDelete: boolean,
      cascadeOnUpdate: boolean
    ) => {
      if (!pendingConnection.connection) return;

      const { source, target, sourceHandle, targetHandle } = pendingConnection.connection;

      if (!source || !target || !sourceHandle || !targetHandle) return;

      // Extract column IDs from handles
      // Handle format: `${tableId}-${columnId}-source` or `${tableId}-${columnId}-target`
      // We know the tableId (source/target), so remove it from the start and the type from the end
      const sourceColumnId = sourceHandle.replace(`${source}-`, '').replace('-source', '');
      const targetColumnId = targetHandle.replace(`${target}-`, '').replace('-target', '');

      // Create the relationship
      dispatch(
        addRelationship({
          sourceTableId: source,
          targetTableId: target,
          sourceColumnId,
          targetColumnId,
          type: relationshipType,
          onDelete: cascadeOnDelete ? ('CASCADE' as const) : undefined,
          onUpdate: cascadeOnUpdate ? ('CASCADE' as const) : undefined,
        })
      );

      setPendingConnection({ isOpen: false, connection: null });
    },
    [pendingConnection.connection, dispatch]
  );

  const getPendingConnectionInfo = useCallback(() => {
    if (!pendingConnection.connection || !currentSchema) {
      return {
        sourceTable: '',
        targetTable: '',
        sourceColumn: '',
        targetColumn: '',
      };
    }

    const { source, target, sourceHandle, targetHandle } = pendingConnection.connection;

    const sourceTable = currentSchema.tables.find((t) => t.id === source);
    const targetTable = currentSchema.tables.find((t) => t.id === target);

    if (!sourceHandle || !targetHandle) {
      return {
        sourceTable: sourceTable?.name || '',
        targetTable: targetTable?.name || '',
        sourceColumn: '',
        targetColumn: '',
      };
    }

    // Extract column IDs from handles
    // Handle format: `${tableId}-${columnId}-source` or `${tableId}-${columnId}-target`
    const sourceColumnId = sourceHandle.replace(`${source}-`, '').replace('-source', '').replace('-target', '');
    const targetColumnId = targetHandle.replace(`${target}-`, '').replace('-source', '').replace('-target', '');

    const sourceColumn = sourceTable?.columns.find((c) => c.id === sourceColumnId);
    const targetColumn = targetTable?.columns.find((c) => c.id === targetColumnId);

    return {
      sourceTable: sourceTable?.name || '',
      targetTable: targetTable?.name || '',
      sourceColumn: sourceColumn?.name || '',
      targetColumn: targetColumn?.name || '',
    };
  }, [pendingConnection.connection, currentSchema]);

  const connectionInfo = getPendingConnectionInfo();

  // Auto-rearrange tables with masonry layout (like Pinterest)
  const handleRearrange = useCallback(() => {
    if (!currentSchema) return;

    const tables = currentSchema.tables;
    const tableCount = tables.length;

    // Calculate estimated heights for each table
    const tableData = tables.map((table) => {
      const headerHeight = 50; // Table header
      const columnHeight = table.columns.length * 40; // Each column ~40px
      const commentHeight = table.comment ? 30 : 0;
      const totalHeight = headerHeight + columnHeight + commentHeight + 20; // +20 for padding

      return {
        table,
        width: 300, // Estimated width
        height: totalHeight,
      };
    });

    // Masonry layout configuration
    const columnCount = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(tableCount))));
    const columnWidth = 300; // Table width
    const horizontalGap = 100;
    const verticalGap = 80;
    const startX = 50;
    const startY = 50;

    // Initialize column heights array - tracks the current Y position of each column
    const columnHeights = Array(columnCount).fill(startY);
    const columnXPositions = Array(columnCount)
      .fill(0)
      .map((_, i) => startX + i * (columnWidth + horizontalGap));

    // Place each table in the shortest column (masonry algorithm)
    tableData.forEach((data) => {
      // Find the column with minimum height
      const minHeight = Math.min(...columnHeights);
      const columnIndex = columnHeights.indexOf(minHeight);

      // Add some randomness for natural look
      const randomXOffset = Math.random() * 20 - 10; // -10 to +10
      const randomYOffset = Math.random() * 15 - 7; // -7 to +7

      // Position the table in the shortest column
      const x = columnXPositions[columnIndex] + randomXOffset;
      const y = columnHeights[columnIndex] + randomYOffset;

      dispatch(
        updateTablePosition({
          tableId: data.table.id,
          position: { x, y },
        })
      );

      // Update the column height (add table height + vertical gap)
      columnHeights[columnIndex] += data.height + verticalGap;
    });
  }, [currentSchema, dispatch]);

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  }, [reactFlowInstance]);

  // Track zoom level
  const handleMove = useCallback((_event: any, viewport: any) => {
    setZoom(Math.round(viewport.zoom * 100));
  }, []);

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
    <div className="flex-1 relative bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        onMove={handleMove}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        minZoom={0.3}
        maxZoom={2}
        nodesDraggable={!isLocked}
        nodesConnectable={!isLocked}
        elementsSelectable={!isLocked}
        panOnDrag={isSpacePressed}
        style={{ cursor: isSpacePressed ? 'grab' : 'default' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />

        {/* Custom Zoom Controls */}
        <Panel position="bottom-right" className="!m-4">
          <div className="flex items-center gap-1.5 bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-2">
            {/* Fit View */}
            <button
              onClick={handleFitView}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Fit all tables in view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            <div className="w-px h-6 bg-gray-300" />

            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>

            {/* Zoom Percentage */}
            <span className="text-xs text-gray-700 font-medium min-w-[42px] text-center px-1">
              {zoom}%
            </span>

            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>

            <div className="w-px h-6 bg-gray-300" />

            {/* Lock/Unlock */}
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-2 rounded transition-colors ${
                isLocked
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={isLocked ? 'Unlock (enable editing)' : 'Lock (prevent changes)'}
            >
              {isLocked ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {/* Rearrange */}
            <button
              onClick={handleRearrange}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Auto-arrange tables in smart grid layout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
            </button>
          </div>
        </Panel>
      </ReactFlow>

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

      <RelationshipTypeModal
        isOpen={pendingConnection.isOpen}
        onClose={() => setPendingConnection({ isOpen: false, connection: null })}
        onConfirm={handleRelationshipTypeConfirm}
        sourceTable={connectionInfo.sourceTable}
        targetTable={connectionInfo.targetTable}
        sourceColumn={connectionInfo.sourceColumn}
        targetColumn={connectionInfo.targetColumn}
      />
    </div>
  );
};
