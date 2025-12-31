import { useState } from 'react';
import { Modal, Button } from '../components';
import { FileUp, AlertCircle } from 'lucide-react';
import { parseSQL } from '../utils/sqlParser';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { importTablesFromSQL } from '../store/schemaSlice';
import { toast } from 'sonner';

interface ImportSQLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportSQLModal: React.FC<ImportSQLModalProps> = ({
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { currentSchema } = useAppSelector((state) => state.schema);
  const [sqlContent, setSqlContent] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    if (!currentSchema) {
      toast.error('Please create or select a schema first');
      return;
    }

    if (!sqlContent.trim()) {
      setError('Please enter SQL code');
      return;
    }

    try {
      const { tables, relationships } = parseSQL(sqlContent);

      if (tables.length === 0) {
        setError('No valid CREATE TABLE statements found');
        return;
      }

      dispatch(importTablesFromSQL({ tables, relationships }));

      toast.success(`Successfully imported ${tables.length} table${tables.length > 1 ? 's' : ''}`);
      setSqlContent('');
      setError('');
      onClose();
    } catch (err) {
      console.error('SQL parsing error:', err);
      setError('Failed to parse SQL. Please check your SQL syntax.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setSqlContent(content);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleClose = () => {
    setSqlContent('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import SQL" size="lg">
      <div className="space-y-5">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Import Instructions:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Paste your SQL CREATE TABLE statements</li>
                <li>Tables with the same name will be overridden</li>
                <li>New tables will be added to the current schema</li>
                <li>Foreign key relationships will be automatically detected</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              SQL Code
            </label>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".sql"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <FileUp size={16} />
                Upload .sql file
              </span>
            </label>
          </div>
          <textarea
            value={sqlContent}
            onChange={(e) => {
              setSqlContent(e.target.value);
              setError('');
            }}
            placeholder="Paste your SQL CREATE TABLE statements here..."
            className="w-full h-96 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white
              transition-all duration-200 font-mono text-sm resize-none"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!sqlContent.trim()}>
            Import Tables
          </Button>
        </div>
      </div>
    </Modal>
  );
};
