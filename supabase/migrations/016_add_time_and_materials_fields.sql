-- Migration to add time and materials (régie) contract fields to project_contracts table
-- These fields are used for time-based billing contracts as opposed to fixed-price contracts

-- Add daily_rate column (TJM - Taux Journalier Moyen)
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10, 2) DEFAULT NULL;

-- Add estimated_days column (volume prévisionnel)
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS estimated_days INTEGER DEFAULT NULL;

-- Add work_location column (lieu d'exécution)
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS work_location VARCHAR(50) DEFAULT NULL;

-- Add contract_duration column (durée du contrat)
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS contract_duration VARCHAR(50) DEFAULT NULL;

-- Add notice_period column (préavis de résiliation)
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS notice_period VARCHAR(50) DEFAULT NULL;

-- Add billing_frequency column (fréquence de facturation)
ALTER TABLE project_contracts
ADD COLUMN IF NOT EXISTS billing_frequency VARCHAR(50) DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN project_contracts.daily_rate IS 'Daily rate (TJM) in EUR for time and materials contracts';
COMMENT ON COLUMN project_contracts.estimated_days IS 'Estimated number of days for time and materials contracts (indicative)';
COMMENT ON COLUMN project_contracts.work_location IS 'Work location: client, remote, or hybrid';
COMMENT ON COLUMN project_contracts.contract_duration IS 'Contract duration: 3_months, 6_months, 12_months, or custom';
COMMENT ON COLUMN project_contracts.notice_period IS 'Notice period for termination: 15_days or 1_month';
COMMENT ON COLUMN project_contracts.billing_frequency IS 'Billing frequency: weekly or monthly';
