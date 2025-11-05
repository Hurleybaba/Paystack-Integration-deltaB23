import paystack from "../config/paystackConfig.js";

// Create a subscription
export const createSubscription = async (req, res) => {
  try {
    console.log("createSubscription Request Body:", req.body);
    const { email: customer, plan, authorization, start_date } = req.body;

    const body = { customer, plan };
    if (authorization) body.authorization = authorization;
    if (start_date) body.start_date = start_date;

    const response = await paystack.post("/subscription", {...body});

    const data = response.data.data;
    console.log("createSubscription Response Data:", data);

    // Optionally: save subscription data into your DB here
    // e.g., subscription_code = data.subscription_code, status = data.status, etc.

    return res.status(200).json({
      status: true,
      message: "Subscription successfully created",
      data: data,
      metadata: {
        email: customer,
        plan: plan,
      }
    });
  } catch (error) {
    console.error("createSubscription Error:", error.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Failed to create subscription",
      error: error.response?.data || error.message,
    });
  }
};

// List subscriptions (with optional filters)
export const listSubscriptions = async (req, res) => {
  try {
    const { page, perPage, customer, plan } = req.query;
    const params = {};

    if (page) params.page = page;
    if (perPage) params.perPage = perPage;
    if (customer) params.customer = customer;
    if (plan) params.plan = plan;

    // Axios get with params
    const response = await paystack.get("/subscription", { params });

    const data = response.data.data;

    return res.status(200).json({
      status: true,
      message: "Subscriptions retrieved",
      data: data,
      meta: response.data.meta,  // as Paystack returns meta info
    });
  } catch (error) {
    console.error("listSubscriptions Error:", error.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Failed to list subscriptions",
      error: error.response?.data || error.message,
    });
  }
};


// Disable a subscription (cancel)
export const disableSubscription = async (req, res) => {
  try {
    const { plan_code: code, email: token } = req.body;

    if (!code || !token) {
      return res.status(400).json({
        status: false,
        message: "Subscription code and token are required",
      });
    }

    const response = await paystack.post("/subscription/disable", { code, token });

    return res.status(200).json({
      status: true,
      message: "Subscription disabled successfully",
      data: response.data.data ?? null,
    });
  } catch (error) {
    console.error("disableSubscription Error:", error.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Failed to disable subscription",
      error: error.response?.data || error.message,
    });
  }
};
