export type RelationshipType = 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';

export interface Relationship {
  id: string;
  name?: string;
  type: RelationshipType;

  sourceTableId: string;
  sourceColumnId: string;

  targetTableId: string;
  targetColumnId: string;

  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
}

export type CreateRelationshipInput = Omit<Relationship, 'id'>;
