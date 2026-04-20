import express from 'express';
import { getMesas } from '../controllers/mesasController.js';

const router = express.Router();

router.get('/', getMesas);

export default router;