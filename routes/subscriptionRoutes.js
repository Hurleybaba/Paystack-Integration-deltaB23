import { Router } from "express";
import {
  createSubscription,
  listSubscriptions,
  disableSubscription,
} from "../controllers/subscriptionController.js";

const router = Router();

router.post("/subscribe", createSubscription);
router.post("/disable", disableSubscription);
router.get("/list", listSubscriptions);

export default router;

