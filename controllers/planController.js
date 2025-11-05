import paystack from "../config/paystackConfig.js";

/**
 * Create a new Plan
 */
export const createPlan = async (req, res) => {
  try {
    const {
      name,
      amount,
      interval,
      description,
      send_invoices,
      send_sms,
      invoice_limit,
    } = req.body;

    if (!name || !amount || !interval) {
      return res.status(400).json({
        status: false,
        message: "name, amount and interval are required",
      });
    }

    const body = {
      name,
      amount: amount * 100, // Convert to kobo
      interval,
      currency: "NGN", // ✅ Always use NGN
    };

    if (description !== undefined) body.description = description;
    if (send_invoices !== undefined) body.send_invoices = send_invoices;
    if (send_sms !== undefined) body.send_sms = send_sms;
    if (invoice_limit !== undefined) body.invoice_limit = invoice_limit;

    const response = await paystack.post("/plan", body);
    const data = response.data.data;

    return res.status(201).json({
      status: true,
      message: "Plan successfully created",
      data,
    });
  } catch (error) {
    console.error("createPlan Error:", error.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Failed to create plan",
      error: error.response?.data || error.message,
    });
  }
};


/**
 * List Plans (with optional filters)
 */
export const listPlans = async (req, res) => {
  try {
    const { page, perPage, status, interval, amount } = req.query;
    const params = {};
    if (page) params.page = page;
    if (perPage) params.perPage = perPage;
    if (status) params.status = status;
    if (interval) params.interval = interval;
    if (amount) params.amount = amount;

    const response = await paystack.get("/plan", { params });

    const data = response.data.data;
    const meta = response.data.meta;

    return res.status(200).json({
      status: true,
      message: "Plans retrieved",
      data,
      meta,
    });
  } catch (error) {
    console.error("listPlans Error:", error.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Failed to list plans",
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Fetch a single Plan by ID or Plan Code
 */
export const fetchPlan = async (req, res) => {
  try {
    const { id_or_code } = req.params;
    if (!id_or_code) {
      return res.status(400).json({
        status: false,
        message: "Plan id or code is required",
      });
    }

    const response = await paystack.get(`/plan/${id_or_code}`);
    const data = response.data.data;

    return res.status(200).json({
      status: true,
      message: "Plan retrieved successfully",
      data,
    });
  } catch (error) {
    console.error("fetchPlan Error:", error.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch plan",
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Update a Plan
 */
export const updatePlan = async (req, res) => {
  try {
    const { id_or_code } = req.params;
    const {
      name,
      amount,
      interval,
      description,
      send_invoices,
      send_sms,
      currency,
      invoice_limit,
      update_existing_subscriptions,
    } = req.body;

    if (!id_or_code) {
      return res.status(400).json({
        status: false,
        message: "Plan id or code is required",
      });
    }

    const body = {};
    if (name !== undefined) body.name = name;
    if (amount !== undefined) body.amount = amount * 100;
    if (interval !== undefined) body.interval = interval;
    if (description !== undefined) body.description = description;
    if (send_invoices !== undefined) body.send_invoices = send_invoices;
    if (send_sms !== undefined) body.send_sms = send_sms;
    if (currency !== undefined) body.currency = currency;
    if (invoice_limit !== undefined) body.invoice_limit = invoice_limit;
    if (update_existing_subscriptions !== undefined)
      body.update_existing_subscriptions = update_existing_subscriptions;

    const response = await paystack.put(`/plan/${id_or_code}`, body);
    const data = response.data.data;

    return res.status(200).json({
      status: true,
      message: "Plan updated successfully",
      data,
    });
  } catch (error) {
    console.error("updatePlan Error:", error.response?.data || error);
    return res.status(500).json({
      status: false,
      message: "Failed to update plan",
      error: error.response?.data || error.message,
    });
  }
};
