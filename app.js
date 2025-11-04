import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import bodyParser from "body-parser";

import subscriptionRoutes from "./routes/subscriptionRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import { errorHandler } from './middlewares/errorHandler.js';
import webhookRoutes from "./routes/webhookRoutes.js"


dotenv.config();
const app = express();
app.use(express.static("public"));
app.use("/api", webhookRoutes);
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());



// Routes
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});



// Error Handling Middleware
app.use(errorHandler);



app.listen(process.env.PORT || 5001, () => {
  console.log(`🚀 Server is running on port ${process.env.PORT || 5001}`)});
const PORT = process.env.PORT || 3000;


