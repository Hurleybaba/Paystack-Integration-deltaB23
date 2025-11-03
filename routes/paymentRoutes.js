import express from "express";
import { verifyPayment } from "../controllers/paymentController.js";
import { validateSignature } from "../middlewares/validateSignature.js";

const router = express.Router();

router.get("/verify/:reference", validateSignature, verifyPayment);

export default router;
