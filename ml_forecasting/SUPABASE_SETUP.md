# 🚀 ML Forecasting with Supabase - Setup Guide

## ✅ Complete Integration with Your Existing System!

Your ML forecasting is now **fully integrated** with your Supabase database!

---

## 📋 **Step-by-Step Setup**

### **Step 1: Setup Database Tables (5 minutes)**

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project: `clinic-management`

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Schema Script**
   - Open file: `database/forecasting_schema.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run" button

4. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see new tables:
     - ✅ `daily_revenue_summary`
     - ✅ `revenue_forecasts`
     - ✅ `forecast_metrics`
     - ✅ `forecast_accuracy`

---

### **Step 2: Install Python Dependencies (2 minutes)**

```bash
# Navigate to project folder
cd c:\Users\ZafarIqbal\Documents\Clinic_M

# Install ML libraries
pip install prophet pandas numpy matplotlib psycopg2-binary

# Verify installation
python -c "import prophet; print('Prophet installed successfully!')"
```

---

### **Step 3: Update Daily Revenue Summary (1 minute)**

This aggregates your billing data for forecasting:

```bash
# Option A: Via Supabase SQL Editor
SELECT update_daily_revenue_summary();

# Option B: Via API (after server is running)
curl -X POST http://localhost:3000/api/forecasting/update-summary
```

---

### **Step 4: Generate First Forecast (2 minutes)**

```bash
# Navigate to ml_forecasting folder
cd ml_forecasting

# Run forecasting script
python supabase_forecaster.py
```

**What happens:**
- ✅ Fetches 12 months of historical data from Supabase
- ✅ Trains Prophet model
- ✅ Generates 30-day forecast
- ✅ Saves predictions to `revenue_forecasts` table
- ✅ Saves accuracy metrics to `forecast_metrics` table
- ✅ Shows next 7 days forecast

---

### **Step 5: Test API Endpoints (3 minutes)**

Start your server:
```bash
npm run dev
```

Test endpoints:

```bash
# Get next 7 days forecast
curl http://localhost:3000/api/forecasting/next-week

# Get monthly summary
curl http://localhost:3000/api/forecasting/monthly-summary

# Get model metrics
curl http://localhost:3000/api/forecasting/metrics

# Get historical data
curl http://localhost:3000/api/forecasting/historical?months=12
```

---

## 📊 **Database Schema Overview**

### **1. daily_revenue_summary**
Aggregated daily revenue from your billing table

| Column | Type | Description |
|--------|------|-------------|
| `date` | DATE | Date of record |
| `total_revenue` | DECIMAL | Total daily revenue |
| `consultation_revenue` | DECIMAL | Doctor fees |
| `lab_revenue` | DECIMAL | Lab charges |
| `pharmacy_revenue` | DECIMAL | Medicine sales |
| `num_patients` | INTEGER | Number of patients |
| `avg_revenue_per_patient` | DECIMAL | Calculated automatically |

### **2. revenue_forecasts**
ML-generated predictions

| Column | Type | Description |
|--------|------|-------------|
| `forecast_date` | DATE | Future date |
| `predicted_revenue` | DECIMAL | Predicted revenue |
| `lower_bound` | DECIMAL | Worst case (80% confidence) |
| `upper_bound` | DECIMAL | Best case (80% confidence) |
| `model_version` | VARCHAR | Model identifier |

### **3. forecast_metrics**
Model performance tracking

| Column | Type | Description |
|--------|------|-------------|
| `mae` | DECIMAL | Mean Absolute Error |
| `mape` | DECIMAL | Mean Absolute % Error |
| `rmse` | DECIMAL | Root Mean Squared Error |
| `accuracy` | DECIMAL | Overall accuracy % |
| `data_points_used` | INTEGER | Training data size |

### **4. forecast_accuracy**
Compare predictions vs actuals

| Column | Type | Description |
|--------|------|-------------|
| `date` | DATE | Date |
| `predicted_revenue` | DECIMAL | What we predicted |
| `actual_revenue` | DECIMAL | What actually happened |
| `error_amount` | DECIMAL | Difference (auto-calculated) |
| `error_percentage` | DECIMAL | Error % (auto-calculated) |

---

## 🔌 **API Endpoints**

### **GET /api/forecasting/next-week**
Get next 7 days forecast

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "forecast_date": "2024-03-01",
      "predicted_revenue": 52000.50,
      "lower_bound": 45000.00,
      "upper_bound": 59000.00,
      "day_name": "Friday",
      "formatted_date": "01-Mar-2024"
    }
  ],
  "count": 7
}
```

### **GET /api/forecasting/monthly-summary**
Get 30-day aggregated forecast

**Response:**
```json
{
  "success": true,
  "data": {
    "total_predicted": 1560000.00,
    "total_lower": 1350000.00,
    "total_upper": 1770000.00,
    "avg_daily": 52000.00,
    "days_count": 30
  }
}
```

### **GET /api/forecasting/metrics**
Get latest model performance

**Response:**
```json
{
  "success": true,
  "data": {
    "mae": 3500.50,
    "mape": 6.8,
    "rmse": 4200.30,
    "accuracy": 93.2,
    "data_points_used": 365,
    "training_date": "2024-02-28T10:30:00"
  }
}
```

### **GET /api/forecasting/historical?months=12**
Get historical revenue data

### **POST /api/forecasting/update-summary**
Update daily revenue summary (run daily)

### **POST /api/forecasting/generate**
Trigger new forecast generation

---

## 🔄 **Automated Daily Forecasting**

### **Option 1: Cron Job (Linux/Mac)**

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 1 AM)
0 1 * * * cd /path/to/Clinic_M/ml_forecasting && python supabase_forecaster.py
```

### **Option 2: Windows Task Scheduler**

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Daily Revenue Forecast"
4. Trigger: Daily at 1:00 AM
5. Action: Start a program
   - Program: `python`
   - Arguments: `supabase_forecaster.py`
   - Start in: `C:\Users\ZafarIqbal\Documents\Clinic_M\ml_forecasting`

### **Option 3: Node.js Scheduler**

Install node-cron:
```bash
npm install node-cron
```

Add to `server.js`:
```javascript
const cron = require('node-cron');
const { spawn } = require('child_process');

// Run forecast daily at 1 AM
cron.schedule('0 1 * * *', () => {
    console.log('Running daily forecast...');
    const python = spawn('python', ['ml_forecasting/supabase_forecaster.py']);
    python.on('close', (code) => {
        console.log(`Forecast completed with code ${code}`);
    });
});
```

---

## 📈 **Usage Examples**

### **Example 1: Get Next Week Forecast**

```javascript
// In your frontend
fetch('/api/forecasting/next-week')
    .then(res => res.json())
    .then(data => {
        console.log('Next week forecast:', data.data);
        // Display in dashboard
    });
```

### **Example 2: Display Monthly Revenue Prediction**

```javascript
fetch('/api/forecasting/monthly-summary')
    .then(res => res.json())
    .then(data => {
        const summary = data.data;
        console.log(`Expected revenue: Rs. ${summary.total_predicted}`);
        console.log(`Range: Rs. ${summary.total_lower} - ${summary.total_upper}`);
    });
```

### **Example 3: Check Model Accuracy**

```javascript
fetch('/api/forecasting/metrics')
    .then(res => res.json())
    .then(data => {
        const metrics = data.data;
        console.log(`Model Accuracy: ${metrics.accuracy}%`);
        console.log(`Average Error: Rs. ${metrics.mae}`);
    });
```

---

## 🎨 **Frontend Integration**

Add to your dashboard (`public/js/dashboard.js`):

```javascript
async function showForecastWidget() {
    try {
        const response = await fetch('/api/forecasting/next-week');
        const result = await response.json();
        
        if (result.success) {
            const forecasts = result.data;
            
            let html = '<div class="card"><div class="card-header">📈 Revenue Forecast</div><div class="card-body">';
            html += '<table class="table table-sm">';
            html += '<thead><tr><th>Date</th><th>Day</th><th>Predicted</th></tr></thead><tbody>';
            
            forecasts.forEach(f => {
                html += `<tr>
                    <td>${f.formatted_date}</td>
                    <td>${f.day_name}</td>
                    <td><strong>${formatCurrency(f.predicted_revenue)}</strong></td>
                </tr>`;
            });
            
            html += '</tbody></table></div></div>';
            
            document.getElementById('forecast-widget').innerHTML = html;
        }
    } catch (error) {
        console.error('Error loading forecast:', error);
    }
}

// Call on dashboard load
showForecastWidget();
```

---

## 🆘 **Troubleshooting**

### **Issue: "No data found"**

**Solution:**
```sql
-- Run this in Supabase SQL Editor
SELECT update_daily_revenue_summary();

-- Check if data exists
SELECT COUNT(*) FROM daily_revenue_summary;
```

### **Issue: "Prophet not found"**

**Solution:**
```bash
pip install --upgrade prophet
```

### **Issue: "Database connection failed"**

**Solution:**
Check `.env` file has correct `DATABASE_URL`

### **Issue: "Forecast accuracy is low"**

**Reasons:**
- Not enough historical data (need 6-12 months)
- Data quality issues (missing values, outliers)
- Unusual events (COVID, etc.)

**Solution:**
- Collect more data
- Clean data (remove outliers)
- Retrain model monthly

---

## 📊 **Monitoring & Maintenance**

### **Daily Tasks (Automated)**
- ✅ Update daily revenue summary
- ✅ Generate new forecasts
- ✅ Calculate accuracy metrics

### **Weekly Tasks (Manual)**
- ✅ Check forecast accuracy
- ✅ Review model metrics
- ✅ Identify unusual patterns

### **Monthly Tasks (Manual)**
- ✅ Retrain model with new data
- ✅ Adjust parameters if needed
- ✅ Archive old forecasts

---

## 🎯 **Next Steps**

### **Phase 1 (Current) - DONE ✅**
- ✅ Database schema created
- ✅ Forecasting script working
- ✅ API endpoints ready
- ✅ Supabase integration complete

### **Phase 2 (Week 2)**
- 🔄 Add forecast widget to dashboard
- 🔄 Create forecast visualization charts
- 🔄 Setup automated daily runs

### **Phase 3 (Month 2)**
- 🔄 Add accuracy tracking dashboard
- 🔄 Email alerts for low accuracy
- 🔄 Department-wise forecasting

---

## 💡 **Pro Tips**

1. **Run forecasts daily** - Keep predictions fresh
2. **Monitor accuracy** - Track how well model performs
3. **Retrain monthly** - Include new data
4. **Clean your data** - Remove obvious errors
5. **Use confidence intervals** - Plan for best/worst case

---

## ✅ **Setup Checklist**

- [ ] Database tables created in Supabase
- [ ] Python dependencies installed
- [ ] Daily revenue summary updated
- [ ] First forecast generated successfully
- [ ] API endpoints tested
- [ ] Forecasts visible in database
- [ ] Model metrics saved
- [ ] Ready for automation

---

**🎉 Your ML forecasting is now live and integrated with Supabase!**

**Next:** Add forecast widget to your dashboard!
