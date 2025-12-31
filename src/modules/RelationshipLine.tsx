import React, { useState } from 'react';
import type { Relationship, Table } from '../types';

interface RelationshipLineProps {
  relationship: Relationship;
  tables: Table[];
  onDelete?: (id: string, relationshipName: string) => void;
}

export const RelationshipLine: React.FC<RelationshipLineProps> = ({
  relationship,
  tables,
  onDelete,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sourceTable = tables.find((t) => t.id === relationship.sourceTableId);
  const targetTable = tables.find((t) => t.id === relationship.targetTableId);

  if (!sourceTable || !targetTable) return null;

  // Find the specific columns involved
  const sourceColumn = sourceTable.columns.find(
    (c) => c.id === relationship.sourceColumnId
  );
  const targetColumn = targetTable.columns.find(
    (c) => c.id === relationship.targetColumnId
  );

  if (!sourceColumn || !targetColumn) return null;

  // Calculate column positions (approximate based on column index in table)
  const sourceColumnIndex = sourceTable.columns.indexOf(sourceColumn);
  const targetColumnIndex = targetTable.columns.indexOf(targetColumn);

  // Base positions for tables
  const tableWidth = 250;
  const headerHeight = 40;
  const columnHeight = 35;

  // Calculate connection points at the right edge of source and left edge of target
  const sourceX = sourceTable.position.x + tableWidth;
  const sourceY =
    sourceTable.position.y + headerHeight + sourceColumnIndex * columnHeight + columnHeight / 2;
  const targetX = targetTable.position.x;
  const targetY =
    targetTable.position.y + headerHeight + targetColumnIndex * columnHeight + columnHeight / 2;

  // Create a smooth curved path
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;

  const relationshipName = `${sourceTable.name}.${sourceColumn.name} → ${targetTable.name}.${targetColumn.name}`;

  return (
    <g
      className="relationship-line"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Line with gradient */}
      <path
        d={path}
        stroke={isHovered ? '#4f46e5' : '#6366f1'}
        strokeWidth={isHovered ? '3' : '2.5'}
        fill="none"
        markerEnd="url(#arrowhead)"
        className="transition-all cursor-pointer"
        strokeDasharray="0"
      />

      {/* Connection points */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r="4"
        fill="#6366f1"
        className="pointer-events-none"
      />
      <circle
        cx={targetX}
        cy={targetY}
        r="4"
        fill="#6366f1"
        className="pointer-events-none"
      />

      {/* Relationship type label with background */}
      <rect
        x={midX - (isHovered ? 40 : 25)}
        y={midY - 12}
        width={isHovered ? '80' : '50'}
        height="24"
        fill="white"
        stroke={isHovered ? '#4f46e5' : '#6366f1'}
        strokeWidth="1.5"
        rx="4"
        className="transition-all"
      />
      <text
        x={isHovered ? midX - 15 : midX}
        y={midY + 4}
        fill={isHovered ? '#4f46e5' : '#6366f1'}
        fontSize="11"
        fontWeight="600"
        textAnchor="middle"
        className="pointer-events-none select-none transition-all"
      >
        {relationship.type === 'ONE_TO_ONE' && '1:1'}
        {relationship.type === 'ONE_TO_MANY' && '1:N'}
        {relationship.type === 'MANY_TO_MANY' && 'N:M'}
      </text>

      {/* Delete button (shown on hover) */}
      {isHovered && onDelete && (
        <g
          onClick={() => onDelete(relationship.id, relationshipName)}
          className="cursor-pointer"
        >
          <circle
            cx={midX + 20}
            cy={midY}
            r="10"
            fill="#ef4444"
            className="hover:fill-red-600 transition-colors"
          />
          <line
            x1={midX + 16}
            y1={midY - 4}
            x2={midX + 24}
            y2={midY + 4}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={midX + 24}
            y1={midY - 4}
            x2={midX + 16}
            y2={midY + 4}
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

export const RelationshipsSVG: React.FC<{
  relationships: Relationship[];
  tables: Table[];
  onDeleteRelationship?: (id: string, relationshipName: string) => void;
}> = ({ relationships, tables, onDeleteRelationship }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Arrow marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#6366f1" />
        </marker>
      </defs>

      {/* Render all relationships */}
      {relationships.map((rel) => (
        <RelationshipLine
          key={rel.id}
          relationship={rel}
          tables={tables}
          onDelete={onDeleteRelationship}
        />
      ))}
    </svg>
  );
};
