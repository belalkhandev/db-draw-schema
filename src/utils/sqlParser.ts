import { v4 as uuidv4 } from 'uuid';
import type { Table, Column, Relationship, ColumnDataType } from '../types';

interface ParsedTable {
  name: string;
  columns: Omit<Column, 'id'>[];
  foreignKeys: {
    columnName: string;
    referencedTable: string;
    referencedColumn: string;
  }[];
}

export const parseSQL = (sql: string): { tables: Table[]; relationships: Relationship[] } => {
  const tables: Table[] = [];
  const relationships: Relationship[] = [];
  const tableMap = new Map<string, Table>();

  const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(([\s\S]*?)\);/gi;
  const matches = [...sql.matchAll(createTableRegex)];

  matches.forEach((match, index) => {
    const tableName = match[1];
    const tableContent = match[2];

    const parsedTable = parseTableContent(tableName, tableContent);

    const table: Table = {
      id: uuidv4(),
      name: parsedTable.name,
      columns: parsedTable.columns.map(col => ({
        id: uuidv4(),
        ...col,
      })),
      position: {
        x: 100 + (index % 3) * 350,
        y: 100 + Math.floor(index / 3) * 300,
      },
    };

    tables.push(table);
    tableMap.set(tableName, table);
  });

  tables.forEach(table => {
    const tableContent = matches.find(m => m[1] === table.name)?.[2] || '';
    const parsed = parseTableContent(table.name, tableContent);

    parsed.foreignKeys.forEach(fk => {
      const referencedTable = tableMap.get(fk.referencedTable);
      if (referencedTable) {
        const sourceColumn = table.columns.find(c => c.name === fk.columnName);
        const targetColumn = referencedTable.columns.find(c => c.name === fk.referencedColumn);

        if (sourceColumn && targetColumn) {
          relationships.push({
            id: uuidv4(),
            type: 'ONE_TO_MANY',
            sourceTableId: referencedTable.id,
            sourceColumnId: targetColumn.id,
            targetTableId: table.id,
            targetColumnId: sourceColumn.id,
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          });
        }
      }
    });
  });

  return { tables, relationships };
};

const parseTableContent = (tableName: string, content: string): ParsedTable => {
  const columns: Omit<Column, 'id'>[] = [];
  const foreignKeys: ParsedTable['foreignKeys'] = [];

  const lines = content.split(/,(?![^()]*\))/);

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.startsWith('PRIMARY KEY')) return;
    if (trimmed.startsWith('KEY')) return;
    if (trimmed.startsWith('INDEX')) return;
    if (trimmed.startsWith('UNIQUE')) return;

    if (trimmed.startsWith('FOREIGN KEY') || trimmed.startsWith('CONSTRAINT')) {
      const fkMatch = trimmed.match(/FOREIGN\s+KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)/i);
      if (fkMatch) {
        foreignKeys.push({
          columnName: fkMatch[1],
          referencedTable: fkMatch[2],
          referencedColumn: fkMatch[3],
        });
      }
      return;
    }

    const columnMatch = trimmed.match(/^`?(\w+)`?\s+([\w()]+)\s*(.*)/i);
    if (columnMatch) {
      const columnName = columnMatch[1];
      const dataTypeRaw = columnMatch[2].toUpperCase();
      const attributes = columnMatch[3].toUpperCase();

      const lengthMatch = dataTypeRaw.match(/(\w+)\((\d+)\)/);
      let dataType: ColumnDataType = 'VARCHAR';
      let length: number | undefined;

      if (lengthMatch) {
        dataType = mapDataType(lengthMatch[1]);
        length = parseInt(lengthMatch[2]);
      } else {
        dataType = mapDataType(dataTypeRaw);
      }

      const column: Omit<Column, 'id'> = {
        name: columnName,
        dataType,
        length,
        nullable: !attributes.includes('NOT NULL'),
        primaryKey: attributes.includes('PRIMARY KEY') || attributes.includes('AUTO_INCREMENT'),
        unique: attributes.includes('UNIQUE'),
        autoIncrement: attributes.includes('AUTO_INCREMENT'),
      };

      columns.push(column);
    }
  });

  return { name: tableName, columns, foreignKeys };
};

const mapDataType = (sqlType: string): ColumnDataType => {
  const typeMap: { [key: string]: ColumnDataType } = {
    'INT': 'INT',
    'INTEGER': 'INT',
    'BIGINT': 'BIGINT',
    'VARCHAR': 'VARCHAR',
    'CHAR': 'CHAR',
    'TEXT': 'TEXT',
    'TINYTEXT': 'TEXT',
    'MEDIUMTEXT': 'TEXT',
    'LONGTEXT': 'TEXT',
    'DATE': 'DATE',
    'DATETIME': 'DATETIME',
    'TIMESTAMP': 'TIMESTAMP',
    'BOOLEAN': 'BOOLEAN',
    'BOOL': 'BOOLEAN',
    'TINYINT': 'INT',
    'SMALLINT': 'INT',
    'MEDIUMINT': 'INT',
    'DECIMAL': 'DECIMAL',
    'NUMERIC': 'DECIMAL',
    'FLOAT': 'FLOAT',
    'DOUBLE': 'DOUBLE',
    'ENUM': 'ENUM',
    'JSON': 'JSON',
    'BLOB': 'BLOB',
    'LONGBLOB': 'BLOB',
    'MEDIUMBLOB': 'BLOB',
    'TINYBLOB': 'BLOB',
  };

  return typeMap[sqlType] || 'VARCHAR';
};
