import express from "express";
import { verifyPayment, initializePayment } from "../controllers/paymentController.js";
import { validateSignature } from "../middlewares/validateSignature.js";

const router = express.Router();

router.get("/verify/:reference", verifyPayment);

router.post("/initialize", initializePayment);

export default router;
