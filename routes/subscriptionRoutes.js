import { Router } from "express";
import {
  createSubscription,
  listSubscriptions,
  disableSubscription,
} from "../controllers/subscriptionController.js";

const router = Router();

router.post("/subscribe", createSubscription);
router.post("/cancel", disableSubscription);
router.get("/list/:email", listSubscriptions);

export default router;

