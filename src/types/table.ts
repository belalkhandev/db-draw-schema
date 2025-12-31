import type { Column } from './column';

export interface Position {
  x: number;
  y: number;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  position: Position;
  color?: string;
  comment?: string;
}

export type CreateTableInput = Omit<Table, 'id' | 'columns' | 'position'> & {
  position?: Position;
};
export type UpdateTableInput = Partial<Omit<Table, 'id'>>;
