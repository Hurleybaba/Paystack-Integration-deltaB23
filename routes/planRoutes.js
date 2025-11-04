import express from 'express';
import {
  createPlan,
  listPlans,
  fetchPlan,
  updatePlan
} from '../controllers/planController.js';

const router = express.Router();

// Create a new plan
router.post('/create', createPlan);

// List all plans (optionally filtered)
router.get('/list', listPlans);

// Get details of a plan by id or code
router.get('/:id_or_code', fetchPlan);

// Update a plan by id or code
router.put('/:id_or_code', updatePlan);

export default router;
