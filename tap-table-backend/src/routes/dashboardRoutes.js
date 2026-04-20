import express from 'express';
import { getDashboardResumen } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/', getDashboardResumen);

export default router;