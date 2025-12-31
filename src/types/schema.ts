import type { Table } from './table';
import type { Relationship } from './relationship';

export interface Schema {
  id: string;
  name: string;
  description?: string;
  tables: Table[];
  relationships: Relationship[];
  createdAt: string;
  updatedAt: string;
}

export interface SchemaState {
  currentSchema: Schema | null;
  schemas: Schema[];
  selectedTableId: string | null;
  selectedColumnId: string | null;
  loading: boolean;
  error: string | null;
}

export type CreateSchemaInput = Pick<Schema, 'name' | 'description'>;
export type UpdateSchemaInput = Partial<Omit<Schema, 'id' | 'createdAt'>>;
