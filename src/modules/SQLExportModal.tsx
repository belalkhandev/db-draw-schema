import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../components';
import type { Schema } from '../types';
import {
  generateMySQLExport,
  downloadSQLFile,
  copySQLToClipboard,
} from '../utils/sqlExport';
import { Copy, Download, Check } from 'lucide-react';

interface SQLExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: Schema;
}

export const SQLExportModal: React.FC<SQLExportModalProps> = ({
  isOpen,
  onClose,
  schema,
}) => {
  const [sql, setSql] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const generatedSQL = generateMySQLExport(schema);
      setSql(generatedSQL);
      setCopied(false);
    }
  }, [isOpen, schema]);

  const handleCopy = async () => {
    const success = await copySQLToClipboard(sql);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const filename = `${schema.name.replace(/\s+/g, '_').toLowerCase()}.sql`;
    downloadSQLFile(sql, filename);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export SQL" size="xl">
      <div className="space-y-4">
        {/* SQL Preview */}
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] text-sm font-mono">
            {sql}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleCopy} variant="ghost">
            {copied ? (
              <>
                <Check size={16} className="mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={16} className="mr-1" />
                Copy to Clipboard
              </>
            )}
          </Button>
          <Button onClick={handleDownload}>
            <Download size={16} className="mr-1" />
            Download SQL
          </Button>
        </div>
      </div>
    </Modal>
  );
};
