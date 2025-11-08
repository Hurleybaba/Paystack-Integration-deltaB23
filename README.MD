# Paystack Subscription & Payment Management App

A comprehensive Node.js + Express application that integrates with **Paystack** for managing **plans**, **subscriptions**, **transactions**, **installments**, and **webhooks**. The application includes automated cron jobs for subscription expiry monitoring and installment payment tracking, along with email notifications and a complete HTML front-end for testing and demonstration.

---

## 🚀 Features

### Core Features

- ✅ **Paystack Plans Management** - Create, list, fetch, and update subscription plans
- ✅ **Subscription Management** - Create, list, and disable subscriptions
- ✅ **Payment Processing** - Initialize and verify transactions
- ✅ **Transaction Listing** - View all transactions with pagination
- ✅ **Webhook Handling** - Secure webhook processing with signature validation
- ✅ **Installment Payment System** - Create and manage installment payment plans with auto-charging
- ✅ **Automated Cron Jobs** - Monitor subscription expiry and installment due dates
- ✅ **Email Notifications** - Send subscription expiry reminders via email
- ✅ **PostgreSQL Database** - Store users, subscriptions, and installments
- ✅ **HTML Front-end** - Complete demo pages for testing all features

---

## 📂 Project Structure

```
project/
├── config/
│   ├── db.js                    # PostgreSQL database connection
│   └── paystackConfig.js        # Axios config for Paystack API calls
│
├── controllers/
│   ├── installmentController.js # Handles installment creation, payments, and auto-charging
│   ├── paymentController.js     # Handles transaction initialization and verification
│   ├── planController.js        # Handles plan CRUD operations
│   ├── subscriptionController.js # Handles subscription creation, listing, and disabling
│   └── webhookController.js     # Handles Paystack webhook events
│
├── middlewares/
│   ├── errorHandler.js          # Global error handler middleware
│   └── validateSignature.js     # Paystack webhook signature validator
│
├── public/                       # Static HTML pages for demonstration
│   ├── index.html               # Main dashboard
│   ├── create-plan.html         # Create subscription plans
│   ├── list-plans.html          # View all plans
│   ├── create-subscription.html # Create subscriptions
│   ├── list-subscriptions.html  # View all subscriptions
│   ├── delete-subscription.html # Disable subscriptions
│   ├── list-transactions.html   # View transactions
│   ├── test-payment.html        # Initialize payments
│   ├── verify-payment.html      # Verify payment status
│   ├── installmental-form.html  # Create installment plans
│   ├── view-installments.html   # View active installments
│   ├── installment-dashboard.html # Installment management dashboard
│   ├── signin.html              # User sign in page
│   ├── signup.html              # User sign up page
│   ├── success.html             # Payment success page
│   ├── failed.html              # Payment failure page
│   └── webhook-test.html        # Webhook testing page
│
├── routes/
│   ├── installmentRoutes.js     # Installment API routes
│   ├── paymentRoutes.js         # Payment API routes
│   ├── planRoutes.js            # Plan API routes
│   ├── subscriptionRoutes.js     # Subscription API routes
│   └── webhookRoutes.js         # Webhook endpoint
│
├── utils/
│   ├── cronJobTest.js           # Subscription expiry checker cron job
│   ├── dbUtils.js               # Database utility functions
│   ├── emailService.js          # Email sending service (Nodemailer)
│   ├── installmentCronJob.js    # Installment monitoring cron job
│   └── subscriptionReminder.js  # Subscription reminder utilities
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore file
├── app.js                       # Express server setup and configuration
├── package.json                 # Project dependencies and scripts
├── schema.sql                   # PostgreSQL database schema
├── TODOS.txt                    # Development tasks
└── README.md                    # This file
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- Paystack account (test or live keys)
- Gmail account (for email notifications - optional)

### 2. Clone and Install

```bash
git clone <repo-url>
cd <repo-folder>
npm install
```

### 3. Database Setup

1. Create a PostgreSQL database
2. Run the schema file to create tables:

```bash
psql -U your_username -d your_database -f schema.sql
```

Or manually execute the SQL commands in `schema.sql` to create:

- `users` table
- `subscriptions` table
- `installments` table
- `installment_payments` table

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5001

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
PAYSTACK_BASE_URL=https://api.paystack.co

# PostgreSQL Database Configuration
PGHOST=localhost
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=your_database
PGPORT=5432

# Email Configuration (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Note:** For Gmail, you'll need to generate an [App Password](https://support.google.com/accounts/answer/185833) if 2FA is enabled.

### 5. Run the Server

**Production mode:**

```bash
npm run node
```

**Development mode (with auto-reload):**

```bash
npm run dev
```

The server will start on `http://localhost:5001` (or your configured PORT).

### 6. Access the Dashboard

Open your browser and navigate to:

```
http://localhost:5001
```

---

## 📡 API Endpoints

### Payment Endpoints

| Method | Endpoint                          | Description                             |
| ------ | --------------------------------- | --------------------------------------- |
| `POST` | `/api/payments/initialize`        | Initialize a payment transaction        |
| `GET`  | `/api/payments/verify/:reference` | Verify a payment transaction            |
| `GET`  | `/api/payments/list`              | List all transactions (with pagination) |

**Example: Initialize Payment**

```bash
POST /api/payments/initialize
Content-Type: application/json

{
  "email": "customer@example.com",
  "amount": 5000
}
```

### Plan Endpoints

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| `POST` | `/api/plans/create`      | Create a new subscription plan |
| `GET`  | `/api/plans/list`        | List all plans (with filters)  |
| `GET`  | `/api/plans/:id_or_code` | Get plan details by ID or code |
| `PUT`  | `/api/plans/:id_or_code` | Update a plan                  |

**Example: Create Plan**

```bash
POST /api/plans/create
Content-Type: application/json

{
  "name": "Monthly Premium",
  "amount": 10000,
  "interval": "monthly",
  "description": "Premium monthly subscription"
}
```

### Subscription Endpoints

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| `POST` | `/api/subscriptions/subscribe` | Create a new subscription     |
| `GET`  | `/api/subscriptions/list`      | List all subscriptions        |
| `POST` | `/api/subscriptions/disable`   | Disable/cancel a subscription |

**Example: Create Subscription**

```bash
POST /api/subscriptions/subscribe
Content-Type: application/json

{
  "email": "customer@example.com",
  "plan": "PLN_xxxxx",
  "authorization": "AUTH_xxxxx"
}
```

### Installment Endpoints

| Method | Endpoint                         | Description                                   |
| ------ | -------------------------------- | --------------------------------------------- |
| `POST` | `/api/installments`              | Create a new installment plan                 |
| `GET`  | `/api/installments/active`       | Get all active installments (filter by email) |
| `GET`  | `/api/installments/:id`          | Get installment details                       |
| `GET`  | `/api/installments/:id/payments` | Get payment history for an installment        |
| `POST` | `/api/installments/auto-pay`     | Auto-charge an installment (cron job)         |
| `POST` | `/api/installments/manual-pay`   | Process manual installment payment            |

**Example: Create Installment**

```bash
POST /api/installments
Content-Type: application/json

{
  "email": "customer@example.com",
  "totalAmount": 100000,
  "monthlyPayment": 10000
}
```

### Webhook Endpoint

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| `POST` | `/api/webhooks` | Paystack webhook endpoint |

**Note:** This endpoint requires raw body parsing for signature validation.

---

## 🔐 Paystack Webhook Setup

### 1. Configure Webhook URL

Go to [Paystack Dashboard](https://dashboard.paystack.com) → Settings → API → Webhooks

Set your webhook URL:

- **Production:** `https://yourdomain.com/api/webhooks`
- **Development (ngrok):** `https://<your-ngrok-id>.ngrok.io/api/webhooks`

### 2. Webhook Events Handled

The application handles the following Paystack webhook events:

- `subscription.create` - Creates subscription record in database
- `charge.success` - Updates user authorization and customer codes
- `invoice.payment_failed` - Logs failed payment attempts
- `subscription.not_renew` - Marks subscription as inactive
- `subscription.enable` - Marks subscription as active

### 3. Signature Validation

The webhook endpoint automatically validates Paystack signatures using HMAC SHA512 to ensure requests are authentic.

---

## 🤖 Automated Cron Jobs

### 1. Subscription Expiry Checker

**File:** `utils/cronJobTest.js`

- **Schedule:** Runs every 1 minute
- **Function:** Checks for subscriptions expiring within the next 10 minutes
- **Action:** Sends email reminders to users
- **Status:** Currently commented out in `app.js` (line 55)

To enable:

```javascript
subscriptionExpiryCheckerCron();
```

### 2. Installment Monitor

**File:** `utils/installmentCronJob.js`

- **Schedule:** Runs every 5 minutes
- **Function:**
  - Checks for fully paid installments and marks them as completed
  - Updates next payment dates for active installments
  - Logs payment reminders
- **Status:** Active by default

---

## 💾 Database Schema

### Users Table

Stores user information and Paystack authorization codes.

### Subscriptions Table

Tracks subscription status, plan codes, and next payment dates.

### Installments Table

Manages installment payment plans with:

- Total amount and monthly payment
- Amount paid and remaining balance
- Next payment date
- Status (active, completed, overdue)

### Installment Payments Table

Records all installment payment transactions.

See `schema.sql` for complete table definitions and triggers.

---

## 📧 Email Notifications

The application uses Nodemailer to send email notifications for:

- Subscription expiry reminders (10 minutes before expiry)

**Configuration:**

- Service: Gmail (configurable)
- Requires: `EMAIL_USER` and `EMAIL_PASS` in `.env`

---

## 🧪 Testing

### Using HTML Pages

Navigate to `http://localhost:5001` to access the dashboard with links to:

- Create and manage plans
- Create and manage subscriptions
- Initialize and verify payments
- Create and view installments
- Test webhooks

### Using API Clients

Use tools like Postman, cURL, or Thunder Client to test API endpoints directly.

**Example cURL:**

```bash
curl -X POST http://localhost:5001/api/payments/initialize \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "amount": 5000}'
```

---

## 🛠️ Technologies Used

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Payment Gateway:** Paystack API
- **Email Service:** Nodemailer
- **Task Scheduling:** node-cron
- **HTTP Client:** Axios
- **Environment Variables:** dotenv

---

## 📝 Development Notes

- The application uses ES6 modules (`import/export`)
- Raw body parsing is configured for webhook signature validation
- All amounts are converted to kobo (multiply by 100) for Paystack API
- Installment payment dates handle month-end edge cases automatically

---

## 🔒 Security Considerations

1. **Never commit `.env` file** - Contains sensitive keys
2. **Validate webhook signatures** - Prevents unauthorized requests
3. **Use HTTPS in production** - Required for webhook endpoints
4. **Sanitize user inputs** - Prevent SQL injection
5. **Use environment-specific keys** - Separate test and live keys

---

## 📄 License

ISC

---

## 👥 Contributors

Built by **Delta Team** — Paystack Integration Test

---

## 🐛 Troubleshooting

### Webhook not receiving events

- Verify webhook URL is accessible (use ngrok for local testing)
- Check Paystack dashboard for webhook delivery logs
- Ensure signature validation is working correctly

### Database connection errors

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database and tables exist

### Email not sending

- Verify Gmail App Password is correct
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Ensure 2FA is enabled and App Password is generated

### Installment cron not running

- Check server logs for cron job initialization
- Verify cron schedule syntax
- Ensure database connection is active

---

## 📚 Additional Resources

- [Paystack API Documentation](https://paystack.com/docs/api)
- [Paystack Webhooks Guide](https://paystack.com/docs/payments/webhooks)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
