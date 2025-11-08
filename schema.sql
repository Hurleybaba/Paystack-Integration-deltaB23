-- USERS TABLE

--SUBSCRIPTION TABLE

--INSTALLMENT TABLE
CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  monthly_payment NUMERIC(12, 2) NOT NULL CHECK (monthly_payment > 0),
  amount_paid NUMERIC(12, 2) DEFAULT 0 CHECK (amount_paid >= 0),

  remaining_amount NUMERIC(12, 2)
    GENERATED ALWAYS AS (total_amount - amount_paid) STORED,

  next_payment_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'overdue')),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_installments_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_installments_updated_at
BEFORE UPDATE ON installments
FOR EACH ROW
EXECUTE FUNCTION update_installments_timestamp();


-- INSTALLMENT PAYMENTS TABLE
CREATE TABLE installment_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  installment_id UUID REFERENCES installments(id) ON DELETE CASCADE,

  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_date TIMESTAMP DEFAULT NOW()
);
