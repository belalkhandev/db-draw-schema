import SchemaModel, { ISchema } from '../models/Schema.model.js';

export class SchemaService {
  async createSchema(data: Partial<ISchema>): Promise<ISchema> {
    const schema = new SchemaModel(data);
    return await schema.save();
  }

  async getAllSchemas(): Promise<ISchema[]> {
    return await SchemaModel.find().sort({ updatedAt: -1 });
  }

  async getSchemaById(id: string): Promise<ISchema | null> {
    return await SchemaModel.findById(id);
  }

  async updateSchema(id: string, data: Partial<ISchema>): Promise<ISchema | null> {
    return await SchemaModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteSchema(id: string): Promise<ISchema | null> {
    return await SchemaModel.findByIdAndDelete(id);
  }
}

export default new SchemaService();
