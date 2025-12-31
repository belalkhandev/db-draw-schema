import React, { memo } from 'react';
import {
  type EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from 'reactflow';
import { X } from 'lucide-react';
import type { RelationshipType } from '../types';

interface RelationshipEdgeData {
  relationshipType: RelationshipType;
  onDelete?: (edgeId: string) => void;
}

const ReactFlowRelationshipEdge: React.FC<EdgeProps<RelationshipEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const relationshipType = data?.relationshipType || 'ONE_TO_MANY';
  const onDelete = data?.onDelete;

  // Map relationship type to display text
  const getRelationshipLabel = (type: RelationshipType): string => {
    switch (type) {
      case 'ONE_TO_ONE':
        return '1:1';
      case 'ONE_TO_MANY':
        return '1:N';
      case 'MANY_TO_MANY':
        return 'N:M';
      default:
        return '1:N';
    }
  };

  // Color based on relationship type
  const getRelationshipColor = (type: RelationshipType): string => {
    switch (type) {
      case 'ONE_TO_ONE':
        return '#10b981'; // green
      case 'ONE_TO_MANY':
        return '#3b82f6'; // blue
      case 'MANY_TO_MANY':
        return '#8b5cf6'; // purple
      default:
        return '#3b82f6';
    }
  };

  const edgeColor = selected
    ? '#f59e0b' // orange when selected
    : getRelationshipColor(relationshipType);

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: edgeColor,
          strokeWidth: selected ? 3 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div className="flex items-center gap-2 bg-white border-2 rounded-lg shadow-lg px-3 py-1.5"
            style={{
              borderColor: edgeColor,
            }}
          >
            {/* Relationship Type Label */}
            <span
              className="text-xs font-semibold"
              style={{ color: edgeColor }}
            >
              {getRelationshipLabel(relationshipType)}
            </span>

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="p-0.5 hover:bg-red-100 rounded transition-colors group"
                title="Delete Relationship"
              >
                <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600" />
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default memo(ReactFlowRelationshipEdge);
