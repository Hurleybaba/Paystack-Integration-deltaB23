import express from "express";
import {
  createSubscription,
  listSubscriptions,
  disableSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/subscribe", createSubscription);
router.post("/disable", disableSubscription);
router.get("/list", listSubscriptions);

export default router;

