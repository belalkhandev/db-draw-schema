import { Button } from './Button';
import { Database, Save, Link, FileCode, Home, FileUp } from 'lucide-react';
import type { Schema } from '../types';

interface HeaderProps {
  currentSchema: Schema | null;
  loading: boolean;
  onSave: () => void;
  onAddRelationship: () => void;
  onExportSQL: () => void;
  onImportSQL: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSchema,
  loading,
  onSave,
  onAddRelationship,
  onExportSQL,
  onImportSQL,
  onGoHome,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
        >
          <Database size={28} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-700">SchemaCraft</span>
        </button>
      </div>

      {currentSchema && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 bg-gray-50 px-6 py-2 rounded-lg border border-gray-200">
            <Database size={18} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">{currentSchema.name}</h2>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        {currentSchema && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={loading}
            >
              <Save size={16} className="mr-1" />
              Save
            </Button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onAddRelationship}
              disabled={currentSchema.tables.length < 2}
            >
              <Link size={16} className="mr-1" />
              Add Relationship
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onImportSQL}
            >
              <FileUp size={16} className="mr-1" />
              Import SQL
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onExportSQL}
              disabled={currentSchema.tables.length === 0}
            >
              <FileCode size={16} className="mr-1" />
              Export SQL
            </Button>
          </>
        )}
        {!currentSchema && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onGoHome}
          >
            <Home size={16} className="mr-1" />
            Home
          </Button>
        )}
      </div>
    </header>
  );
};
