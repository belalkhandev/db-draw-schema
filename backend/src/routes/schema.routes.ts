import { Router } from 'express';
import schemaController from '../controllers/schema.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', (req, res) => schemaController.create(req, res));
router.get('/', (req, res) => schemaController.getAll(req, res));
router.get('/:id', (req, res) => schemaController.getById(req, res));
router.put('/:id', (req, res) => schemaController.update(req, res));
router.delete('/:id', (req, res) => schemaController.delete(req, res));

export default router;
