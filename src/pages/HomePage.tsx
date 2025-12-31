import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { loadSchema } from '../store/schemaSlice';
import { Button } from '../components';
import { Plus, Clock, Database } from 'lucide-react';
import type { Schema } from '../types';
import apiService from '../services/api';

interface HomePageProps {
  onCreateSchema: () => void;
  onSchemaSelect: (schema: Schema) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onCreateSchema, onSchemaSelect }) => {
  const dispatch = useAppDispatch();
  const { schemas, loading } = useAppSelector((state) => state.schema);
  const [sortBy, setSortBy] = useState<'updated' | 'created'>('updated');

  const sortedSchemas = [...schemas].sort((a, b) => {
    const dateA = sortBy === 'updated' ? new Date(a.updatedAt) : new Date(a.createdAt);
    const dateB = sortBy === 'updated' ? new Date(b.updatedAt) : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  const handleSchemaClick = async (schema: Schema) => {
    try {
      const fullSchema = await apiService.getSchemaById(schema.id);
      dispatch(loadSchema(fullSchema));
      onSchemaSelect(fullSchema);
    } catch (error) {
      console.error('Failed to load schema:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Database diagrams</h1>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">My diagrams</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'updated' | 'created')}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="updated">Date updated</option>
                  <option value="created">Date created</option>
                </select>
              </div>
              <Button onClick={onCreateSchema} className="flex items-center gap-2">
                <Plus size={18} />
                New Diagram
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading diagrams...</p>
            </div>
          ) : schemas.length === 0 ? (
            <div className="text-center py-16">
              <Database size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No diagrams yet</h3>
              <p className="text-gray-500 mb-6">Create your first database diagram to get started</p>
              <Button onClick={onCreateSchema} className="flex items-center gap-2 mx-auto">
                <Plus size={18} />
                Create Your First Diagram
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedSchemas.map((schema) => (
                <div
                  key={schema.id}
                  onClick={() => handleSchemaClick(schema)}
                  className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer bg-white"
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative overflow-hidden">
                    {schema.tables.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 h-full">
                        {schema.tables.slice(0, 4).map((table) => (
                          <div
                            key={table.id}
                            className="bg-white rounded shadow-sm p-2 border border-gray-200 overflow-hidden"
                          >
                            <div className="text-xs font-semibold text-gray-700 truncate mb-1">
                              {table.name}
                            </div>
                            <div className="space-y-0.5">
                              {table.columns.slice(0, 3).map((col) => (
                                <div key={col.id} className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                  {col.primaryKey && <span className="text-yellow-600">🔑</span>}
                                  <span>{col.name}</span>
                                </div>
                              ))}
                              {table.columns.length > 3 && (
                                <div className="text-[10px] text-gray-400">+{table.columns.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Database size={48} className="text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-medium text-gray-600 shadow-sm">
                      {schema.tables.length} {schema.tables.length === 1 ? 'table' : 'tables'}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                      {schema.name}
                    </h3>
                    {schema.description && (
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">{schema.description}</p>
                    )}
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      Edited {formatDate(schema.updatedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
