import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Schema, RegisterData, LoginData, AuthResponse, User } from '../types';

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

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
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

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await this.api.get<{ user: User }>('/auth/profile');
    return response.data;
  }
}

export default new ApiService();
