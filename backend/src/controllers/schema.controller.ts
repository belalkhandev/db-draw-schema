import { Request, Response } from 'express';
import schemaService from '../services/schema.service.js';

export class SchemaController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const schema = await schemaService.createSchema(req.body);
      res.status(201).json(schema.toJSON());
    } catch (error) {
      res.status(500).json({ error: 'Failed to create schema', details: error });
    }
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const schemas = await schemaService.getAllSchemas();
      res.status(200).json(schemas.map(s => s.toJSON()));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schemas', details: error });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const schema = await schemaService.getSchemaById(req.params.id);
      if (!schema) {
        res.status(404).json({ error: 'Schema not found' });
        return;
      }
      res.status(200).json(schema.toJSON());
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch schema', details: error });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const schema = await schemaService.updateSchema(req.params.id, req.body);
      if (!schema) {
        res.status(404).json({ error: 'Schema not found' });
        return;
      }
      res.status(200).json(schema.toJSON());
    } catch (error) {
      res.status(500).json({ error: 'Failed to update schema', details: error });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const schema = await schemaService.deleteSchema(req.params.id);
      if (!schema) {
        res.status(404).json({ error: 'Schema not found' });
        return;
      }
      res.status(200).json({ message: 'Schema deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete schema', details: error });
    }
  }
}

export default new SchemaController();
