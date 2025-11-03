import express from 'express';
import dotenv from 'dotenv';
import subscriptionRoutes from "./routes/subscriptionRoutes.js"

dotenv.config();


const app = express();
app.use(express.json());

// Routes
app.use('api/subcriptions', subscriptionRoutes)

app.listen(process.env.PORT || 5001, () => {
  console.log(`Server is running on port ${process.env.PORT || 5001}`);
});
