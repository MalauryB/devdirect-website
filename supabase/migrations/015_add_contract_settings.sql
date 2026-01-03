-- Migration to add delivery_delay and payment_schedule columns to project_contracts table
-- These fields are used for automatic contract PDF generation

-- Add delivery_delay column
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS delivery_delay VARCHAR(50) DEFAULT '3_months';

-- Add payment_schedule column
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS payment_schedule VARCHAR(50) DEFAULT '30-40-30';

-- Add comment for documentation
COMMENT ON COLUMN project_contracts.delivery_delay IS 'Delivery delay option: 1_month, 2_months, 3_months, 6_months, or custom';
COMMENT ON COLUMN project_contracts.payment_schedule IS 'Payment schedule option: 30-40-30, 50-50, 30-70, or 100';
