# 🤖 Revenue Forecasting Module

## Overview

This module implements **Machine Learning-based revenue forecasting** for the Clinic Management System using Facebook Prophet.

---

## 🎯 Features

- ✅ **Time Series Forecasting** - Predict future revenue
- ✅ **Seasonality Detection** - Weekly, monthly, yearly patterns
- ✅ **Holiday Effects** - Account for public holidays
- ✅ **Confidence Intervals** - Upper and lower bounds
- ✅ **Multiple Regressors** - Patient count, revenue breakdown
- ✅ **Visual Analytics** - Beautiful charts and graphs

---

## 📊 What It Predicts

1. **Daily Revenue** - Next 7, 15, 30 days
2. **Revenue Components** - Consultation, Lab, Pharmacy
3. **Confidence Intervals** - Best/worst case scenarios
4. **Trend Analysis** - Growth patterns
5. **Seasonality** - Day-of-week, monthly patterns

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to ml_forecasting folder
cd ml_forecasting

# Install dependencies
pip install -r requirements.txt
```

### Basic Usage

```python
from revenue_forecast import ClinicRevenueForecaster
import pandas as pd

# Load your data
data = pd.read_csv('your_revenue_data.csv')

# Initialize forecaster
forecaster = ClinicRevenueForecaster()

# Prepare data
prepared_data = forecaster.prepare_data(data)

# Train model
forecast = forecaster.train_model(prepared_data, forecast_days=30)

# Get predictions
next_week = forecaster.get_next_week_forecast()
print(next_week)

# Visualize
forecaster.plot_forecast()
forecaster.plot_components()
```

---

## 📁 Required Data Format

Your CSV/database should have these columns:

```csv
date,total_revenue,consultation_revenue,lab_revenue,pharmacy_revenue,num_patients
2024-01-01,45000,18000,13500,13500,45
2024-01-02,52000,20800,15600,15600,52
2024-01-03,48000,19200,14400,14400,48
...
```

### Column Descriptions

| Column | Type | Description |
|--------|------|-------------|
| `date` | Date | Date of record (YYYY-MM-DD) |
| `total_revenue` | Float | Total daily revenue (Rs.) |
| `consultation_revenue` | Float | Doctor consultation fees |
| `lab_revenue` | Float | Laboratory test charges |
| `pharmacy_revenue` | Float | Medicine sales |
| `num_patients` | Integer | Number of patients |

---

## 🎓 How It Works

### 1. Data Preparation
```python
# Converts your data to Prophet format
# Adds derived features (avg revenue per patient)
# Handles missing values
prepared_data = forecaster.prepare_data(raw_data)
```

### 2. Model Training
```python
# Trains on historical patterns
# Detects seasonality (weekly, monthly, yearly)
# Accounts for holidays
# Learns from patient count correlation
forecast = forecaster.train_model(prepared_data)
```

### 3. Prediction
```python
# Generates future predictions
# Provides confidence intervals
# Accounts for trends and seasonality
next_week = forecaster.get_next_week_forecast()
```

---

## 📈 Model Performance

### Accuracy Metrics

The model provides several accuracy metrics:

- **MAE** (Mean Absolute Error) - Average prediction error in Rs.
- **MAPE** (Mean Absolute Percentage Error) - Error as percentage
- **RMSE** (Root Mean Squared Error) - Penalizes large errors
- **Accuracy** - Overall prediction accuracy (100 - MAPE)

### Expected Performance

| Data Quality | Expected Accuracy |
|--------------|-------------------|
| **Excellent** (2+ years, complete) | 85-95% |
| **Good** (1 year, mostly complete) | 75-85% |
| **Fair** (6 months, some gaps) | 65-75% |
| **Poor** (<6 months, many gaps) | 50-65% |

---

## 🔧 Customization

### Adjust Forecast Period

```python
# Forecast 7 days
forecast = forecaster.train_model(data, forecast_days=7)

# Forecast 60 days
forecast = forecaster.train_model(data, forecast_days=60)
```

### Add Custom Holidays

```python
# Edit in revenue_forecast.py
holidays = pd.DataFrame({
    'holiday': 'custom_holiday',
    'ds': pd.to_datetime(['2024-12-25', '2024-01-01']),
    'lower_window': -1,
    'upper_window': 1,
})
```

### Change Seasonality Settings

```python
# More flexible trend
model = Prophet(changepoint_prior_scale=0.1)  # Default: 0.05

# Stronger seasonality
model = Prophet(seasonality_prior_scale=15)  # Default: 10
```

---

## 📊 Integration with Clinic System

### Option 1: Daily Automated Forecast

```python
# Add to your daily cron job
from revenue_forecast import ClinicRevenueForecaster
from database.config import pool

# Fetch last 12 months data
query = """
    SELECT 
        DATE(bill_date) as date,
        SUM(net_amount) as total_revenue,
        SUM(consultation_fee) as consultation_revenue,
        SUM(lab_charges) as lab_revenue,
        SUM(medicine_charges) as pharmacy_revenue,
        COUNT(DISTINCT patient_id) as num_patients
    FROM billing
    WHERE bill_date >= CURRENT_DATE - INTERVAL '12 months'
    GROUP BY DATE(bill_date)
    ORDER BY date
"""

data = pd.read_sql(query, pool)

# Generate forecast
forecaster = ClinicRevenueForecaster()
prepared_data = forecaster.prepare_data(data)
forecast = forecaster.train_model(prepared_data)

# Save to database
next_week = forecaster.get_next_week_forecast()
# Insert into forecasts table
```

### Option 2: On-Demand API Endpoint

```python
# Add to routes/forecasting.js
from flask import Flask, jsonify
from revenue_forecast import ClinicRevenueForecaster

@app.route('/api/forecast/revenue', methods=['GET'])
def get_revenue_forecast():
    # Load data
    data = load_revenue_data()
    
    # Generate forecast
    forecaster = ClinicRevenueForecaster()
    prepared_data = forecaster.prepare_data(data)
    forecast = forecaster.train_model(prepared_data)
    
    # Return JSON
    next_week = forecaster.get_next_week_forecast()
    return jsonify(next_week.to_dict('records'))
```

---

## 🎨 Visualization Examples

### 1. Revenue Forecast Plot
Shows historical data + future predictions with confidence intervals

### 2. Components Plot
Breaks down:
- **Trend** - Long-term growth/decline
- **Weekly Seasonality** - Day-of-week patterns
- **Yearly Seasonality** - Monthly/seasonal patterns
- **Holidays** - Holiday effects

---

## 🆘 Troubleshooting

### Issue: "Model accuracy is low"

**Solutions:**
1. Collect more historical data (aim for 12+ months)
2. Check for data quality issues (missing values, outliers)
3. Add more relevant features (weather, holidays)
4. Adjust model parameters

### Issue: "Predictions are too conservative"

**Solution:**
```python
# Increase uncertainty
model = Prophet(interval_width=0.95)  # Default: 0.80
```

### Issue: "Model doesn't capture weekly patterns"

**Solution:**
```python
# Strengthen weekly seasonality
model.add_seasonality(
    name='weekly',
    period=7,
    fourier_order=10  # Increase from default 3
)
```

---

## 📚 Further Reading

### Prophet Documentation
- Official Docs: https://facebook.github.io/prophet/
- Quick Start: https://facebook.github.io/prophet/docs/quick_start.html
- Seasonality: https://facebook.github.io/prophet/docs/seasonality,_holiday_effects,_and_regressors.html

### Time Series Forecasting
- "Forecasting: Principles and Practice" - Free online book
- Kaggle Time Series Courses
- YouTube: StatQuest Time Series

---

## 🎯 Next Steps

### Phase 1 (Current)
- ✅ Basic revenue forecasting
- ✅ Weekly/monthly predictions
- ✅ Visualization

### Phase 2 (Future)
- 🔄 Patient count forecasting
- 🔄 Department-wise forecasting
- 🔄 Doctor-wise revenue prediction
- 🔄 Inventory demand forecasting

### Phase 3 (Advanced)
- 🔄 Real-time model updates
- 🔄 Anomaly detection
- 🔄 What-if scenarios
- 🔄 Automated alerts

---

## 💡 Pro Tips

1. **Start Simple** - Use Prophet first, then try advanced models
2. **More Data = Better** - Aim for 12+ months of clean data
3. **Regular Retraining** - Retrain model monthly with new data
4. **Monitor Accuracy** - Track predictions vs actuals
5. **Domain Knowledge** - Add clinic-specific features (flu season, etc.)

---

## 📞 Support

For questions or issues:
1. Check this README
2. Review code comments in `revenue_forecast.py`
3. Consult Prophet documentation
4. Open an issue on GitHub

---

**Happy Forecasting! 📈**
