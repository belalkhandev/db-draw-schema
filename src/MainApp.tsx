import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  createSchema,
  loadSchema,
  setSchemas,
  setLoading,
} from './store/schemaSlice';
import { Sidebar } from './modules/Sidebar';
import { ReactFlowCanvas } from './modules/ReactFlowCanvas';
import { SQLExportModal } from './modules/SQLExportModal';
import { AddRelationshipModal } from './modules/AddRelationshipModal';
import { ImportSQLModal } from './modules/ImportSQLModal';
import { HomePage } from './pages/HomePage';
import { Modal, Button, Input, Header } from './components';
import apiService from './services/api';
import { toast } from 'sonner';

export const MainApp = () => {
  const dispatch = useAppDispatch();
  const { currentSchema, schemas, loading } = useAppSelector(
    (state) => state.schema
  );

  const [showNewSchemaModal, setShowNewSchemaModal] = useState(false);
  const [showSQLExportModal, setShowSQLExportModal] = useState(false);
  const [showImportSQLModal, setShowImportSQLModal] = useState(false);
  const [showAddRelationshipModal, setShowAddRelationshipModal] =
    useState(false);
  const [showHomePage, setShowHomePage] = useState(true);

  const [newSchemaName, setNewSchemaName] = useState('');
  const [newSchemaDescription, setNewSchemaDescription] = useState('');

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    try {
      dispatch(setLoading(true));
      const fetchedSchemas = await apiService.getAllSchemas();
      dispatch(setSchemas(fetchedSchemas));
    } catch (error) {
      console.error('Failed to load schemas:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCreateSchema = () => {
    if (newSchemaName.trim()) {
      dispatch(
        createSchema({
          name: newSchemaName,
          description: newSchemaDescription,
        })
      );
      setNewSchemaName('');
      setNewSchemaDescription('');
      setShowNewSchemaModal(false);
      setShowHomePage(false);
    }
  };

  const handleSaveSchema = async () => {
    if (!currentSchema) return;

    try {
      dispatch(setLoading(true));

      const existsInDatabase = schemas.find((s) => s.id === currentSchema.id);

      if (existsInDatabase && currentSchema.id) {
        const updatedSchema = await apiService.updateSchema(currentSchema.id, currentSchema);
        dispatch(loadSchema(updatedSchema));
      } else {
        const { id, ...schemaData } = currentSchema;
        const createdSchema = await apiService.createSchema(schemaData);
        dispatch(loadSchema(createdSchema));
      }

      await loadSchemas();
      toast.success('Schema saved successfully!');
    } catch (error) {
      console.error('Failed to save schema:', error);
      toast.error('Failed to save schema');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSchemaSelect = () => {
    setShowHomePage(false);
  };

  const handleGoHome = () => {
    setShowHomePage(true);
    dispatch(loadSchema(null));
  };

  const handleOpenCreateModal = () => {
    setShowNewSchemaModal(true);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        currentSchema={currentSchema}
        loading={loading}
        onSave={handleSaveSchema}
        onAddRelationship={() => setShowAddRelationshipModal(true)}
        onExportSQL={() => setShowSQLExportModal(true)}
        onImportSQL={() => setShowImportSQLModal(true)}
        onGoHome={handleGoHome}
      />

      {showHomePage ? (
        <HomePage
          onCreateSchema={handleOpenCreateModal}
          onSchemaSelect={handleSchemaSelect}
        />
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <ReactFlowCanvas />
        </div>
      )}

      <Modal
        isOpen={showNewSchemaModal}
        onClose={() => setShowNewSchemaModal(false)}
        title="Create New Schema"
        size="md"
      >
        <div className="space-y-5">
          <Input
            label="Schema Name"
            placeholder="My Database Schema"
            value={newSchemaName}
            onChange={(e) => setNewSchemaName(e.target.value)}
          />
          <Input
            label="Description (Optional)"
            placeholder="A brief description of your schema"
            value={newSchemaDescription}
            onChange={(e) => setNewSchemaDescription(e.target.value)}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setShowNewSchemaModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSchema}>Create</Button>
          </div>
        </div>
      </Modal>

      {currentSchema && (
        <SQLExportModal
          isOpen={showSQLExportModal}
          onClose={() => setShowSQLExportModal(false)}
          schema={currentSchema}
        />
      )}

      <AddRelationshipModal
        isOpen={showAddRelationshipModal}
        onClose={() => setShowAddRelationshipModal(false)}
      />

      <ImportSQLModal
        isOpen={showImportSQLModal}
        onClose={() => setShowImportSQLModal(false)}
      />
    </div>
  );
};
