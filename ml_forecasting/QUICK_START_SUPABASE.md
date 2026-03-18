# ⚡ Quick Start - ML Forecasting with Supabase

## 🎯 Get ML Forecasting Running in 15 Minutes!

---

## ✅ **Prerequisites Check**

Before starting, make sure you have:
- [x] Supabase project created
- [x] DATABASE_URL in `.env` file
- [x] Billing data in your database
- [x] Python installed (v3.8+)

---

## 🚀 **5 Simple Steps**

### **Step 1: Setup Database (3 minutes)**

```bash
# 1. Open Supabase Dashboard
Go to: https://app.supabase.com → Your Project

# 2. Open SQL Editor
Click "SQL Editor" → "New query"

# 3. Copy and run this file:
Open: database/forecasting_schema.sql
Copy ALL content → Paste in SQL Editor → Click "Run"

# 4. Verify
Click "Table Editor" → See new tables:
- daily_revenue_summary ✅
- revenue_forecasts ✅
- forecast_metrics ✅
- forecast_accuracy ✅
```

---

### **Step 2: Install Python Libraries (2 minutes)**

```bash
# Open terminal in project folder
cd c:\Users\ZafarIqbal\Documents\Clinic_M

# Install Prophet and dependencies
pip install prophet pandas numpy matplotlib psycopg2-binary

# Test installation
python -c "import prophet; print('✅ Prophet installed!')"
```

---

### **Step 3: Populate Revenue Data (1 minute)**

```bash
# Option A: In Supabase SQL Editor
SELECT update_daily_revenue_summary();

# Option B: Via your terminal (after server starts)
curl -X POST http://localhost:3000/api/forecasting/update-summary
```

This aggregates your billing data into daily summaries for forecasting.

---

### **Step 4: Generate First Forecast (2 minutes)**

```bash
# Navigate to ml_forecasting folder
cd ml_forecasting

# Run forecasting script
python supabase_forecaster.py
```

**What you'll see:**
```
📊 Fetching 12 months of historical data from Supabase...
✅ Fetched 365 days of data
🤖 Training forecasting model...
✅ Model trained successfully!
📊 Evaluating model performance...
   MAE: Rs. 3,500.50
   MAPE: 6.8%
   Accuracy: 93.2%
💾 Saving forecasts to Supabase...
✅ Saved 30 forecasts to database

📅 Next 7 Days Forecast:
   Date          Day        Predicted Revenue
   01-Mar-2024   Friday     Rs. 52,000.50
   02-Mar-2024   Saturday   Rs. 48,500.00
   ...
```

---

### **Step 5: Test API Endpoints (2 minutes)**

```bash
# Start your server
npm run dev

# In another terminal, test endpoints:

# Get next week forecast
curl http://localhost:3000/api/forecasting/next-week

# Get monthly summary
curl http://localhost:3000/api/forecasting/monthly-summary

# Get model accuracy
curl http://localhost:3000/api/forecasting/metrics
```

---

## ✅ **Verification Checklist**

After completing all steps:

- [ ] Tables created in Supabase ✅
- [ ] Prophet installed successfully ✅
- [ ] Daily revenue summary has data ✅
- [ ] Forecasts generated (30 days) ✅
- [ ] API endpoints returning data ✅
- [ ] Model accuracy > 70% ✅

---

## 📊 **What You Now Have**

### **1. Forecasting Database Tables**
```
✅ daily_revenue_summary  → Historical data
✅ revenue_forecasts      → 30-day predictions
✅ forecast_metrics       → Model accuracy
✅ forecast_accuracy      → Tracking over time
```

### **2. API Endpoints**
```
✅ GET  /api/forecasting/next-week
✅ GET  /api/forecasting/monthly-summary
✅ GET  /api/forecasting/metrics
✅ GET  /api/forecasting/historical
✅ POST /api/forecasting/update-summary
✅ POST /api/forecasting/generate
```

### **3. Python Scripts**
```
✅ supabase_forecaster.py  → Main forecasting script
✅ revenue_forecast.py     → Standalone version
```

---

## 🎯 **Quick Test**

### **Test 1: Check Data**
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM daily_revenue_summary;
-- Should show number of days with data

SELECT * FROM daily_revenue_summary 
ORDER BY date DESC 
LIMIT 7;
-- Should show last 7 days
```

### **Test 2: Check Forecasts**
```sql
SELECT * FROM revenue_forecasts 
WHERE forecast_date >= CURRENT_DATE
ORDER BY forecast_date
LIMIT 7;
-- Should show next 7 days predictions
```

### **Test 3: Check API**
```bash
# Open browser and go to:
http://localhost:3000/api/forecasting/next-week

# Should see JSON with 7 days forecast
```

---

## 🔄 **Daily Usage**

### **Manual Run (When Needed)**
```bash
cd ml_forecasting
python supabase_forecaster.py
```

### **Automated Run (Setup Once)**

**Windows Task Scheduler:**
1. Open Task Scheduler
2. Create Task: "Daily Forecast"
3. Trigger: Daily at 1:00 AM
4. Action: Run `python supabase_forecaster.py`

**Or add to your server (Node.js):**
```bash
npm install node-cron

# Add to server.js (see SUPABASE_SETUP.md)
```

---

## 📈 **View Results**

### **In Supabase Dashboard**
1. Go to Table Editor
2. Select `revenue_forecasts`
3. See all predictions

### **Via API**
```javascript
// In your frontend
fetch('/api/forecasting/next-week')
    .then(res => res.json())
    .then(data => console.log(data));
```

### **In Python**
```python
from supabase_forecaster import SupabaseRevenueForecaster

forecaster = SupabaseRevenueForecaster()
next_week = forecaster.get_next_week_forecast_from_db()
print(next_week)
```

---

## 🆘 **Common Issues**

### **Issue: "No data found"**
```sql
-- Check billing data exists
SELECT COUNT(*) FROM billing;

-- Run summary update
SELECT update_daily_revenue_summary();

-- Check again
SELECT COUNT(*) FROM daily_revenue_summary;
```

### **Issue: "Prophet not installed"**
```bash
pip install --upgrade prophet
# If fails, try:
pip install prophet --no-cache-dir
```

### **Issue: "Database connection error"**
```bash
# Check .env file
cat .env | grep DATABASE_URL

# Test connection
python -c "from database.config import pool; print('Connected!')"
```

### **Issue: "Low accuracy (<70%)"**
**Reasons:**
- Not enough data (need 6-12 months)
- Data quality issues
- Unusual events

**Solution:**
- Collect more historical data
- Clean outliers
- Wait for more data

---

## 💡 **Pro Tips**

1. **First Time Setup**
   - Run `update_daily_revenue_summary()` first
   - Check you have at least 3 months of data
   - Expect lower accuracy with less data

2. **Daily Maintenance**
   - Run forecast generation daily
   - Monitor accuracy metrics
   - Retrain monthly with new data

3. **Improving Accuracy**
   - Collect 12+ months of data
   - Remove obvious data errors
   - Add holiday indicators
   - Consider seasonal patterns

---

## 🎊 **Success!**

If you completed all steps, you now have:

✅ **ML forecasting integrated with Supabase**  
✅ **30-day revenue predictions**  
✅ **API endpoints for your dashboard**  
✅ **Automated forecasting capability**  
✅ **Accuracy tracking**  

---

## 📚 **Next Steps**

### **Today**
- [x] Setup complete
- [ ] Test all endpoints
- [ ] View forecasts in Supabase

### **This Week**
- [ ] Add forecast widget to dashboard
- [ ] Setup automated daily runs
- [ ] Monitor accuracy

### **This Month**
- [ ] Collect more historical data
- [ ] Improve model accuracy
- [ ] Add forecast charts

---

## 🔗 **Quick Links**

| Resource | Location |
|----------|----------|
| **Detailed Setup** | `SUPABASE_SETUP.md` |
| **API Docs** | `../API_DOCUMENTATION.md` |
| **ML Guide** | `ML_FORECASTING_GUIDE.md` |
| **Troubleshooting** | `README.md` |

---

**🎉 You're all set! Your clinic now has ML-powered revenue forecasting!**

**Questions?** Check `SUPABASE_SETUP.md` for detailed documentation.

**Ready to automate?** See the "Automated Daily Forecasting" section in `SUPABASE_SETUP.md`.
