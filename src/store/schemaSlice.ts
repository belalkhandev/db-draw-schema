import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type {
  Schema,
  SchemaState,
  Table,
  Column,
  Relationship,
  Position,
  CreateTableInput,
  CreateRelationshipInput,
} from '../types';

const initialState: SchemaState = {
  currentSchema: null,
  schemas: [],
  selectedTableId: null,
  selectedColumnId: null,
  loading: false,
  error: null,
};

const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    createSchema: (state, action: PayloadAction<{ name: string; description?: string }>) => {
      const newSchema: Schema = {
        id: uuidv4(), // Temporary client-side ID until saved to database
        name: action.payload.name,
        description: action.payload.description,
        tables: [],
        relationships: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.currentSchema = newSchema;
      // Don't add to schemas array until saved to database
      // The schemas array represents only database-persisted schemas
    },

    loadSchema: (state, action: PayloadAction<Schema | null>) => {
      state.currentSchema = action.payload;
    },

    updateSchemaMetadata: (
      state,
      action: PayloadAction<{ name?: string; description?: string }>
    ) => {
      if (state.currentSchema) {
        if (action.payload.name) state.currentSchema.name = action.payload.name;
        if (action.payload.description !== undefined)
          state.currentSchema.description = action.payload.description;
        state.currentSchema.updatedAt = new Date().toISOString();
      }
    },

    addTable: (state, action: PayloadAction<CreateTableInput>) => {
      if (state.currentSchema) {
        const idColumn: Column = {
          id: uuidv4(),
          name: 'id',
          dataType: 'BIGINT',
          nullable: false,
          primaryKey: true,
          unique: true,
          autoIncrement: true,
        };

        const newTable: Table = {
          id: uuidv4(),
          name: action.payload.name,
          columns: [idColumn],
          position: action.payload.position || { x: 100, y: 100 },
          color: action.payload.color,
          comment: action.payload.comment,
        };
        state.currentSchema.tables.push(newTable);
        state.currentSchema.updatedAt = new Date().toISOString();
      }
    },

    updateTable: (
      state,
      action: PayloadAction<{ tableId: string; updates: Partial<Omit<Table, 'id'>> }>
    ) => {
      if (state.currentSchema) {
        const table = state.currentSchema.tables.find((t) => t.id === action.payload.tableId);
        if (table) {
          Object.assign(table, action.payload.updates);
          state.currentSchema.updatedAt = new Date().toISOString();
        }
      }
    },

    updateTablePosition: (
      state,
      action: PayloadAction<{ tableId: string; position: Position }>
    ) => {
      if (state.currentSchema) {
        const table = state.currentSchema.tables.find((t) => t.id === action.payload.tableId);
        if (table) {
          table.position = action.payload.position;
          state.currentSchema.updatedAt = new Date().toISOString();
        }
      }
    },

    deleteTable: (state, action: PayloadAction<string>) => {
      if (state.currentSchema) {
        state.currentSchema.tables = state.currentSchema.tables.filter(
          (t) => t.id !== action.payload
        );
        state.currentSchema.relationships = state.currentSchema.relationships.filter(
          (r) => r.sourceTableId !== action.payload && r.targetTableId !== action.payload
        );
        state.currentSchema.updatedAt = new Date().toISOString();
      }
    },

    reorderTables: (state, action: PayloadAction<Table[]>) => {
      if (state.currentSchema) {
        state.currentSchema.tables = action.payload;
        state.currentSchema.updatedAt = new Date().toISOString();
      }
    },

    addColumn: (state, action: PayloadAction<{ tableId: string; column: Omit<Column, 'id'> }>) => {
      if (state.currentSchema) {
        const table = state.currentSchema.tables.find((t) => t.id === action.payload.tableId);
        if (table) {
          const newColumn: Column = {
            id: uuidv4(),
            ...action.payload.column,
          };
          table.columns.push(newColumn);

          if (newColumn.foreignKey?.tableId && newColumn.foreignKey?.columnId) {
            const newRelationship: Relationship = {
              id: uuidv4(),
              type: newColumn.foreignKey.relationshipType || 'ONE_TO_MANY',
              sourceTableId: newColumn.foreignKey.tableId,
              sourceColumnId: newColumn.foreignKey.columnId,
              targetTableId: action.payload.tableId,
              targetColumnId: newColumn.id,
              onDelete: newColumn.foreignKey.onDelete || 'CASCADE',
              onUpdate: newColumn.foreignKey.onUpdate || 'CASCADE',
            };
            state.currentSchema.relationships.push(newRelationship);
          }

          state.currentSchema.updatedAt = new Date().toISOString();
        }
      }
    },

    updateColumn: (
      state,
      action: PayloadAction<{
        tableId: string;
        columnId: string;
        updates: Partial<Omit<Column, 'id'>>;
      }>
    ) => {
      if (state.currentSchema) {
        const table = state.currentSchema.tables.find((t) => t.id === action.payload.tableId);
        if (table) {
          const column = table.columns.find((c) => c.id === action.payload.columnId);
          if (column) {
            const newForeignKey = action.payload.updates.foreignKey;

            state.currentSchema.relationships = state.currentSchema.relationships.filter(
              (r) => r.targetColumnId !== action.payload.columnId
            );

            Object.assign(column, action.payload.updates);

            if (newForeignKey?.tableId && newForeignKey?.columnId) {
              const newRelationship: Relationship = {
                id: uuidv4(),
                type: newForeignKey.relationshipType || 'ONE_TO_MANY',
                sourceTableId: newForeignKey.tableId,
                sourceColumnId: newForeignKey.columnId,
                targetTableId: action.payload.tableId,
                targetColumnId: action.payload.columnId,
                onDelete: newForeignKey.onDelete || 'CASCADE',
                onUpdate: newForeignKey.onUpdate || 'CASCADE',
              };
              state.currentSchema.relationships.push(newRelationship);
            }

            state.currentSchema.updatedAt = new Date().toISOString();
          }
        }
      }
    },

    deleteColumn: (state, action: PayloadAction<{ tableId: string; columnId: string }>) => {
      if (state.currentSchema) {
        const table = state.currentSchema.tables.find((t) => t.id === action.payload.tableId);
        if (table) {
          table.columns = table.columns.filter((c) => c.id !== action.payload.columnId);
          state.currentSchema.relationships = state.currentSchema.relationships.filter(
            (r) =>
              r.sourceColumnId !== action.payload.columnId &&
              r.targetColumnId !== action.payload.columnId
          );
          state.currentSchema.updatedAt = new Date().toISOString();
        }
      }
    },

    reorderColumn: (
      state,
      action: PayloadAction<{ tableId: string; columnId: string; newIndex: number }>
    ) => {
      if (state.currentSchema) {
        const table = state.currentSchema.tables.find((t) => t.id === action.payload.tableId);
        if (table) {
          const columnIndex = table.columns.findIndex((c) => c.id === action.payload.columnId);
          if (columnIndex !== -1) {
            const [column] = table.columns.splice(columnIndex, 1);
            table.columns.splice(action.payload.newIndex, 0, column);
            state.currentSchema.updatedAt = new Date().toISOString();
          }
        }
      }
    },

    reorderColumns: (
      state,
      action: PayloadAction<{ tableId: string; columns: Column[] }>
    ) => {
      if (state.currentSchema) {
        const table = state.currentSchema.tables.find((t) => t.id === action.payload.tableId);
        if (table) {
          table.columns = action.payload.columns;
          state.currentSchema.updatedAt = new Date().toISOString();
        }
      }
    },

    addRelationship: (state, action: PayloadAction<CreateRelationshipInput>) => {
      if (state.currentSchema) {
        const newRelationship: Relationship = {
          id: uuidv4(),
          ...action.payload,
        };
        state.currentSchema.relationships.push(newRelationship);
        state.currentSchema.updatedAt = new Date().toISOString();
      }
    },

    deleteRelationship: (state, action: PayloadAction<string>) => {
      if (state.currentSchema) {
        state.currentSchema.relationships = state.currentSchema.relationships.filter(
          (r) => r.id !== action.payload
        );
        state.currentSchema.updatedAt = new Date().toISOString();
      }
    },

    selectTable: (state, action: PayloadAction<string | null>) => {
      state.selectedTableId = action.payload;
    },

    selectColumn: (state, action: PayloadAction<string | null>) => {
      state.selectedColumnId = action.payload;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setSchemas: (state, action: PayloadAction<Schema[]>) => {
      state.schemas = action.payload;
    },

    updateSchemaDetails: (state, action: PayloadAction<Schema>) => {
      const index = state.schemas.findIndex((s) => s.id === action.payload.id);
      if (index !== -1) {
        state.schemas[index] = action.payload;
      }
      if (state.currentSchema?.id === action.payload.id) {
        state.currentSchema = action.payload;
      }
    },

    importTablesFromSQL: (
      state,
      action: PayloadAction<{ tables: Table[]; relationships: Relationship[] }>
    ) => {
      if (state.currentSchema) {
        action.payload.tables.forEach((newTable) => {
          const lowerName = newTable.name.toLowerCase();
          const existingTableIndex = state.currentSchema!.tables.findIndex(
            (t) => t.name.toLowerCase() === lowerName
          );

          if (existingTableIndex !== -1) {
            state.currentSchema!.relationships = state.currentSchema!.relationships.filter(
              (r) =>
                r.sourceTableId !== state.currentSchema!.tables[existingTableIndex].id &&
                r.targetTableId !== state.currentSchema!.tables[existingTableIndex].id
            );
            state.currentSchema!.tables[existingTableIndex] = newTable;
          } else {
            state.currentSchema!.tables.push(newTable);
          }
        });

        action.payload.relationships.forEach((rel) => {
          state.currentSchema!.relationships.push(rel);
        });

        state.currentSchema.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  createSchema,
  loadSchema,
  updateSchemaMetadata,
  addTable,
  updateTable,
  updateTablePosition,
  deleteTable,
  reorderTables,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumn,
  reorderColumns,
  addRelationship,
  deleteRelationship,
  selectTable,
  selectColumn,
  setLoading,
  setError,
  setSchemas,
  updateSchemaDetails,
  importTablesFromSQL,
} = schemaSlice.actions;

export default schemaSlice.reducer;
