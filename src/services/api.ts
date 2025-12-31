import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Schema } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5550/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createSchema(data: Partial<Schema>): Promise<Schema> {
    const response = await this.api.post<Schema>('/schemas', data);
    return response.data;
  }

  async getAllSchemas(): Promise<Schema[]> {
    const response = await this.api.get<Schema[]>('/schemas');
    return response.data;
  }

  async getSchemaById(id: string): Promise<Schema> {
    const response = await this.api.get<Schema>(`/schemas/${id}`);
    return response.data;
  }

  async updateSchema(id: string, data: Partial<Schema>): Promise<Schema> {
    const response = await this.api.put<Schema>(`/schemas/${id}`, data);
    return response.data;
  }

  async deleteSchema(id: string): Promise<void> {
    await this.api.delete(`/schemas/${id}`);
  }
}

export default new ApiService();
