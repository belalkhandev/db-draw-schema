import mongoose, { Schema, Document } from 'mongoose';

interface IColumn {
  id: string;
  name: string;
  dataType: string;
  length?: number;
  precision?: number;
  scale?: number;
  nullable: boolean;
  primaryKey: boolean;
  unique: boolean;
  autoIncrement: boolean;
  defaultValue?: string;
  comment?: string;
}

interface ITable {
  id: string;
  name: string;
  columns: IColumn[];
  position: {
    x: number;
    y: number;
  };
  color?: string;
  comment?: string;
}

interface IRelationship {
  id: string;
  name?: string;
  type: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  onDelete?: string;
  onUpdate?: string;
}

export interface ISchema extends Document {
  name: string;
  description?: string;
  tables: ITable[];
  relationships: IRelationship[];
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  dataType: { type: String, required: true },
  length: { type: Number },
  precision: { type: Number },
  scale: { type: Number },
  nullable: { type: Boolean, default: false },
  primaryKey: { type: Boolean, default: false },
  unique: { type: Boolean, default: false },
  autoIncrement: { type: Boolean, default: false },
  defaultValue: { type: String },
  comment: { type: String },
});

const TableSchema = new Schema<ITable>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  columns: [ColumnSchema],
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  color: { type: String },
  comment: { type: String },
});

const RelationshipSchema = new Schema<IRelationship>({
  id: { type: String, required: true },
  name: { type: String },
  type: { type: String, required: true },
  sourceTableId: { type: String, required: true },
  sourceColumnId: { type: String, required: true },
  targetTableId: { type: String, required: true },
  targetColumnId: { type: String, required: true },
  onDelete: { type: String },
  onUpdate: { type: String },
});

const SchemaSchema = new Schema<ISchema>(
  {
    name: { type: String, required: true },
    description: { type: String },
    tables: [TableSchema],
    relationships: [RelationshipSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<ISchema>('Schema', SchemaSchema);
