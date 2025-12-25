-- Migration to add 'time_and_materials' to the contract_type enum
-- This enables the "contrat en régie" functionality

-- Add the new enum value
ALTER TYPE contract_type ADD VALUE IF NOT EXISTS 'time_and_materials';

-- Add delivery_delay and payment_schedule columns for service_agreement contracts
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS delivery_delay VARCHAR(50) DEFAULT NULL;

ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS payment_schedule VARCHAR(50) DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN project_contracts.delivery_delay IS 'Delivery delay for fixed-price contracts: 1_month, 2_months, 3_months, 6_months, or custom';
COMMENT ON COLUMN project_contracts.payment_schedule IS 'Payment schedule for fixed-price contracts: 30-40-30, 50-50, 30-70, or 100';
