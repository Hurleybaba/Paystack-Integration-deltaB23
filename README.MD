# Paystack Subscription & Payment Management App

This project is a simple Node.js + Express application that integrates with **Paystack** for managing **plans**, **subscriptions**, **transactions**, and **webhooks**.  
It also includes HTML demo pages for creating, listing, and testing subscriptions and plans.

---

## 🚀 Features

- Create and manage **Paystack Plans**
- Create and manage **Subscriptions**
- View **Transactions** with pagination
- Handle **Paystack Webhooks** securely
- Test payments directly from the browser
- Simple HTML front-end for demonstration

---

## 📂 Project Structure

project/
├── config/
│ └── paystackConfig.js # Axios config for Paystack API calls
│
├── controllers/
│ ├── paymentController.js # Handles transactions
│ ├── planController.js # Handles plan creation and listing
│ ├── subscriptionController.js # Handles subscribe/disable actions
│ └── webhookController.js # Handles Paystack webhook events
│
├── middlewares/
│ ├── errorHandler.js # Global error handler
│ └── validateSignature.js # (Optional) Paystack webhook signature validator
│
├── public/ # Static HTML pages for demonstration
│ ├── index.html
│ ├── create-plan.html
│ ├── list-plans.html
│ ├── create-subscription.html
│ ├── delete-subscription.html
│ ├── list-subscriptions.html
│ ├── list-transactions.html
│ ├── test-payment.html
│ ├── verify-payment.html
│ ├── success.html
│ ├── failed.html
│ └── webhook-test.html
│
├── routes/
│ ├── paymentRoutes.js
│ ├── planRoutes.js
│ ├── subscriptionRoutes.js
│ └── webhookRoutes.js
│
│
├── .env # Environment variables
├── app.js # Express server setup
├── package.json
└── README.md

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repo-url>
cd <repo-folder>
npm install
```

### 2. Clone and Install

PORT=5001
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

### 3. Run the server

```bash
npm start
```

Or for development:

```bash
npx nodemon app.js
```

### 4. Open your browser

```bash
http://localhost:5001
```

## 🔐 Paystack Webhook Setup

Go to Paystack Dashboard → Settings → API → Webhooks

Set your webhook URL as:

```bash
https://yourdomain.com/api/webhooks/paystack
```

or locally (with a tunneling tool like ngrok):
https://<your-ngrok-id>.ngrok.io/api/webhooks/paystack

Make sure app.use(bodyParser.raw({ type: 'application/json' })) is configured before JSON parsing to verify signatures correctly.
