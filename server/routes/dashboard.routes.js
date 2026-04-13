import express from 'express';
import {
  getMetrics,
  getFilterOptions,
  getLeadsTable,
  getChartData
} from '../controllers/dashboard.controller.js';

import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Routes
router.get('/metrics', getMetrics);
router.get('/filters', getFilterOptions);
router.get('/table', getLeadsTable);
router.get('/chart', getChartData);

export default router;