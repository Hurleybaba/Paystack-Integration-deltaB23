import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import webhookRoutes from "./routes/webhookRoutes.js";

dotenv.config();
const app = express();
app.use("/api/webhook", webhookRoutes);
app.use(express.static("public"));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.get("/", (req, res) => {
  res.send("Paystack Webhook Active");
});

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(process.env.PORT || 5001, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT || 5001}`);
});
