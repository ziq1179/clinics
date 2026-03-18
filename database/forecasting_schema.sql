-- Revenue Forecasting Tables for Supabase
-- Run this in Supabase SQL Editor

-- 1. Daily Revenue Summary Table (aggregated from billing)
CREATE TABLE IF NOT EXISTS daily_revenue_summary (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    consultation_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    lab_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    pharmacy_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    other_revenue DECIMAL(10,2) NOT NULL DEFAULT 0,
    num_patients INTEGER NOT NULL DEFAULT 0,
    num_appointments INTEGER NOT NULL DEFAULT 0,
    avg_revenue_per_patient DECIMAL(10,2) GENERATED ALWAYS AS (
        CASE WHEN num_patients > 0 THEN total_revenue / num_patients ELSE 0 END
    ) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Revenue Forecasts Table (stores predictions)
CREATE TABLE IF NOT EXISTS revenue_forecasts (
    id SERIAL PRIMARY KEY,
    forecast_date DATE NOT NULL,
    predicted_revenue DECIMAL(10,2) NOT NULL,
    lower_bound DECIMAL(10,2) NOT NULL,
    upper_bound DECIMAL(10,2) NOT NULL,
    confidence_level DECIMAL(5,2) DEFAULT 80.0,
    model_version VARCHAR(50) DEFAULT 'prophet_v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(forecast_date, model_version)
);

-- 3. Model Performance Metrics Table
CREATE TABLE IF NOT EXISTS forecast_metrics (
    id SERIAL PRIMARY KEY,
    metric_date DATE NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    mae DECIMAL(10,2),  -- Mean Absolute Error
    mape DECIMAL(10,2), -- Mean Absolute Percentage Error
    rmse DECIMAL(10,2), -- Root Mean Squared Error
    accuracy DECIMAL(5,2), -- Accuracy percentage
    data_points_used INTEGER,
    training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Forecast Accuracy Tracking (compare predictions vs actuals)
CREATE TABLE IF NOT EXISTS forecast_accuracy (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    predicted_revenue DECIMAL(10,2) NOT NULL,
    actual_revenue DECIMAL(10,2),
    error_amount DECIMAL(10,2) GENERATED ALWAYS AS (actual_revenue - predicted_revenue) STORED,
    error_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN actual_revenue > 0 
        THEN ABS((actual_revenue - predicted_revenue) / actual_revenue * 100) 
        ELSE 0 END
    ) STORED,
    model_version VARCHAR(50) DEFAULT 'prophet_v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_revenue_date ON daily_revenue_summary(date);
CREATE INDEX IF NOT EXISTS idx_forecasts_date ON revenue_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_accuracy_date ON forecast_accuracy(date);

-- Create function to update daily revenue summary
CREATE OR REPLACE FUNCTION update_daily_revenue_summary()
RETURNS void AS $$
BEGIN
    INSERT INTO daily_revenue_summary (
        date,
        total_revenue,
        consultation_revenue,
        lab_revenue,
        pharmacy_revenue,
        other_revenue,
        num_patients,
        num_appointments
    )
    SELECT 
        DATE(bill_date) as date,
        SUM(net_amount) as total_revenue,
        SUM(consultation_fee) as consultation_revenue,
        SUM(lab_charges) as lab_revenue,
        SUM(medicine_charges) as pharmacy_revenue,
        SUM(other_charges) as other_revenue,
        COUNT(DISTINCT patient_id) as num_patients,
        COUNT(DISTINCT appointment_id) as num_appointments
    FROM billing
    WHERE bill_date >= CURRENT_DATE - INTERVAL '2 years'
    GROUP BY DATE(bill_date)
    ON CONFLICT (date) 
    DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        consultation_revenue = EXCLUDED.consultation_revenue,
        lab_revenue = EXCLUDED.lab_revenue,
        pharmacy_revenue = EXCLUDED.pharmacy_revenue,
        other_revenue = EXCLUDED.other_revenue,
        num_patients = EXCLUDED.num_patients,
        num_appointments = EXCLUDED.num_appointments,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update daily summary when billing changes
CREATE OR REPLACE FUNCTION trigger_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_daily_revenue_summary();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Uncomment to enable auto-update (optional - may impact performance)
-- DROP TRIGGER IF EXISTS billing_update_summary ON billing;
-- CREATE TRIGGER billing_update_summary
--     AFTER INSERT OR UPDATE OR DELETE ON billing
--     FOR EACH STATEMENT
--     EXECUTE FUNCTION trigger_update_daily_summary();

-- Initial population of daily revenue summary
SELECT update_daily_revenue_summary();

-- Create view for easy forecasting data access
CREATE OR REPLACE VIEW forecasting_data AS
SELECT 
    date as ds,
    total_revenue as y,
    num_patients,
    consultation_revenue,
    lab_revenue,
    pharmacy_revenue,
    avg_revenue_per_patient
FROM daily_revenue_summary
ORDER BY date;

COMMENT ON TABLE daily_revenue_summary IS 'Aggregated daily revenue data for ML forecasting';
COMMENT ON TABLE revenue_forecasts IS 'ML-generated revenue predictions';
COMMENT ON TABLE forecast_metrics IS 'Model performance tracking';
COMMENT ON TABLE forecast_accuracy IS 'Prediction vs actual comparison';
COMMENT ON VIEW forecasting_data IS 'Prophet-ready data format';
