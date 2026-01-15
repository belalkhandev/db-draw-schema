import SchemaModel, { ISchema } from '../models/Schema.model.js';

export class SchemaService {
  async createSchema(userId: string, data: Partial<ISchema>): Promise<ISchema> {
    const schema = new SchemaModel({ ...data, userId });
    return await schema.save();
  }

  async getAllSchemas(userId: string): Promise<ISchema[]> {
    return await SchemaModel.find({ userId }).sort({ updatedAt: -1 });
  }

  async getSchemaById(id: string, userId: string): Promise<ISchema | null> {
    return await SchemaModel.findOne({ _id: id, userId });
  }

  async updateSchema(id: string, userId: string, data: Partial<ISchema>): Promise<ISchema | null> {
    return await SchemaModel.findOneAndUpdate({ _id: id, userId }, data, { new: true });
  }

  async deleteSchema(id: string, userId: string): Promise<ISchema | null> {
    return await SchemaModel.findOneAndDelete({ _id: id, userId });
  }
}

export default new SchemaService();
