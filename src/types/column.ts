export type ColumnDataType =
  | 'INT'
  | 'BIGINT'
  | 'VARCHAR'
  | 'TEXT'
  | 'DATE'
  | 'DATETIME'
  | 'TIMESTAMP'
  | 'BOOLEAN'
  | 'DECIMAL'
  | 'FLOAT'
  | 'DOUBLE'
  | 'CHAR'
  | 'ENUM'
  | 'JSON'
  | 'BLOB';

export interface Column {
  id: string;
  name: string;
  dataType: ColumnDataType;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  autoIncrement: boolean;
  defaultValue?: string;
  comment?: string;
  foreignKey?: {
    tableId: string;
    columnId: string;
    relationshipType?: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
    onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
    onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  };
}

export type CreateColumnInput = Omit<Column, 'id'>;
export type UpdateColumnInput = Partial<Omit<Column, 'id'>>;
