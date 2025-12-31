import type { Schema, Table, Column, Relationship } from '../types';

const getColumnType = (column: Column): string => {
  let typeStr = column.dataType;

  if (column.length && ['VARCHAR', 'CHAR'].includes(column.dataType)) {
    typeStr += `(${column.length})`;
  }

  if (column.dataType === 'DECIMAL' && column.precision) {
    typeStr += `(${column.precision}${column.scale ? `, ${column.scale}` : ''})`;
  }

  return typeStr;
};

const generateColumnDefinition = (column: Column): string => {
  let sql = `  \`${column.name}\` ${getColumnType(column)}`;

  if (!column.nullable) {
    sql += ' NOT NULL';
  }

  if (column.autoIncrement) {
    sql += ' AUTO_INCREMENT';
  }

  if (column.unique && !column.primaryKey) {
    sql += ' UNIQUE';
  }

  if (column.defaultValue) {
    sql += ` DEFAULT ${column.defaultValue}`;
  }

  if (column.comment) {
    sql += ` COMMENT '${column.comment.replace(/'/g, "\\'")}'`;
  }

  return sql;
};

const generateTableSQL = (table: Table, relationships: Relationship[]): string => {
  let sql = `CREATE TABLE \`${table.name}\` (\n`;

  const columnDefs = table.columns.map((col) => generateColumnDefinition(col));
  sql += columnDefs.join(',\n');

  const primaryKeys = table.columns.filter((col) => col.primaryKey);
  if (primaryKeys.length > 0) {
    const pkColumns = primaryKeys.map((col) => `\`${col.name}\``).join(', ');
    sql += `,\n  PRIMARY KEY (${pkColumns})`;
  }

  const uniqueColumns = table.columns.filter((col) => col.unique && !col.primaryKey);
  uniqueColumns.forEach((col) => {
    sql += `,\n  UNIQUE KEY \`${col.name}_UNIQUE\` (\`${col.name}\`)`;
  });

  const tableForeignKeys = relationships.filter((rel) => rel.sourceTableId === table.id);
  tableForeignKeys.forEach((fk) => {
    const sourceColumn = table.columns.find((col) => col.id === fk.sourceColumnId);
    if (sourceColumn) {
      const fkName = fk.name || `fk_${table.name}_${sourceColumn.name}`;
      sql += `,\n  CONSTRAINT \`${fkName}\` FOREIGN KEY (\`${sourceColumn.name}\`)`;
    }
  });

  sql += '\n)';

  if (table.comment) {
    sql += ` COMMENT='${table.comment.replace(/'/g, "\\'")}'`;
  }

  sql += ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';

  return sql;
};

const generateForeignKeySQL = (
  schema: Schema,
  relationship: Relationship
): string | null => {
  const sourceTable = schema.tables.find((t) => t.id === relationship.sourceTableId);
  const targetTable = schema.tables.find((t) => t.id === relationship.targetTableId);

  if (!sourceTable || !targetTable) return null;

  const sourceColumn = sourceTable.columns.find((c) => c.id === relationship.sourceColumnId);
  const targetColumn = targetTable.columns.find((c) => c.id === relationship.targetColumnId);

  if (!sourceColumn || !targetColumn) return null;

  const fkName = relationship.name || `fk_${sourceTable.name}_${sourceColumn.name}`;

  let sql = `ALTER TABLE \`${sourceTable.name}\`\n`;
  sql += `  ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`${sourceColumn.name}\`)\n`;
  sql += `  REFERENCES \`${targetTable.name}\` (\`${targetColumn.name}\`)`;

  if (relationship.onDelete) {
    sql += `\n  ON DELETE ${relationship.onDelete}`;
  }

  if (relationship.onUpdate) {
    sql += `\n  ON UPDATE ${relationship.onUpdate}`;
  }

  sql += ';';

  return sql;
};

export const generateMySQLExport = (schema: Schema): string => {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    return '-- No tables to export';
  }

  let sql = '';

  sql += `-- SchemaCraft MySQL Export\n`;
  sql += `-- Schema: ${schema.name}\n`;
  if (schema.description) {
    sql += `-- Description: ${schema.description}\n`;
  }
  sql += `-- Generated: ${new Date().toISOString()}\n\n`;

  sql += `-- Disable foreign key checks for import\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

  schema.tables.forEach((table) => {
    sql += `-- Table: ${table.name}\n`;
    sql += generateTableSQL(table, schema.relationships);
    sql += '\n\n';
  });

  if (schema.relationships && schema.relationships.length > 0) {
    sql += `-- Foreign Key Constraints\n`;
    schema.relationships.forEach((rel) => {
      const fkSQL = generateForeignKeySQL(schema, rel);
      if (fkSQL) {
        sql += fkSQL;
        sql += '\n\n';
      }
    });
  }

  sql += `-- Re-enable foreign key checks\n`;
  sql += `SET FOREIGN_KEY_CHECKS = 1;\n`;

  return sql;
};

export const downloadSQLFile = (sql: string, filename: string = 'schema.sql'): void => {
  const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copySQLToClipboard = async (sql: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(sql);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
