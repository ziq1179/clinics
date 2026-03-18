"""
Revenue Forecasting with Database Integration (Neon / PostgreSQL)
Connects to your existing database and generates forecasts
"""

import pandas as pd
import numpy as np
from prophet import Prophet
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Import your existing database connection
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database.config import pool

class SupabaseRevenueForecaster:
    """
    Revenue forecasting integrated with Neon/PostgreSQL database
    """
    
    def __init__(self):
        self.model = None
        self.forecast = None
        self.db_pool = pool
        
    async def fetch_historical_data(self, months_back=12):
        """
        Fetch historical revenue data from database
        
        Args:
            months_back: Number of months of historical data to fetch
            
        Returns:
            DataFrame with historical revenue data
        """
        print(f"📊 Fetching {months_back} months of historical data from database...")
        
        query = """
            SELECT 
                date,
                total_revenue,
                consultation_revenue,
                lab_revenue,
                pharmacy_revenue,
                num_patients,
                avg_revenue_per_patient
            FROM daily_revenue_summary
            WHERE date >= CURRENT_DATE - INTERVAL '%s months'
            ORDER BY date
        """
        
        try:
            result = await self.db_pool.query(query, [months_back])
            
            if len(result.rows) == 0:
                print("⚠️  No data found. Running update_daily_revenue_summary()...")
                await self.db_pool.query("SELECT update_daily_revenue_summary()")
                result = await self.db_pool.query(query, [months_back])
            
            df = pd.DataFrame(result.rows)
            print(f"✅ Fetched {len(df)} days of data")
            return df
            
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            raise
    
    def fetch_historical_data_sync(self, months_back=12):
        """
        Synchronous version - fetch historical data from database
        """
        print(f"📊 Fetching {months_back} months of historical data from database...")
        
        query = f"""
            SELECT 
                date,
                total_revenue,
                consultation_revenue,
                lab_revenue,
                pharmacy_revenue,
                num_patients,
                avg_revenue_per_patient
            FROM daily_revenue_summary
            WHERE date >= CURRENT_DATE - INTERVAL '{months_back} months'
            ORDER BY date
        """
        
        try:
            result = self.db_pool.query(query)
            
            if len(result.rows) == 0:
                print("⚠️  No data found. Running update_daily_revenue_summary()...")
                self.db_pool.query("SELECT update_daily_revenue_summary()")
                result = self.db_pool.query(query)
            
            df = pd.DataFrame(result.rows)
            print(f"✅ Fetched {len(df)} days of data")
            
            # Convert date column to datetime
            df['date'] = pd.to_datetime(df['date'])
            
            return df
            
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            raise
    
    def prepare_data_for_prophet(self, df):
        """
        Prepare data in Prophet format (ds, y columns)
        """
        prophet_df = pd.DataFrame({
            'ds': pd.to_datetime(df['date']),
            'y': df['total_revenue'].astype(float),
            'patients': df['num_patients'].astype(int),
            'avg_per_patient': df['avg_revenue_per_patient'].astype(float)
        })
        
        # Remove any rows with missing values
        prophet_df = prophet_df.dropna()
        
        return prophet_df
    
    def train_model(self, df, forecast_days=30):
        """
        Train Prophet model on historical data
        """
        print("🤖 Training forecasting model...")
        
        # Initialize Prophet
        self.model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False,
            seasonality_mode='multiplicative',
            changepoint_prior_scale=0.05
        )
        
        # Add monthly seasonality
        self.model.add_seasonality(
            name='monthly',
            period=30.5,
            fourier_order=5
        )
        
        # Add regressors
        self.model.add_regressor('patients')
        self.model.add_regressor('avg_per_patient')
        
        # Fit model
        self.model.fit(df)
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=forecast_days)
        
        # Add regressor values for future dates
        recent_avg_patients = df['patients'].tail(30).mean()
        recent_avg_per_patient = df['avg_per_patient'].tail(30).mean()
        
        future['patients'] = future['ds'].apply(
            lambda x: df[df['ds'] == x]['patients'].values[0] 
            if x in df['ds'].values 
            else recent_avg_patients
        )
        
        future['avg_per_patient'] = future['ds'].apply(
            lambda x: df[df['ds'] == x]['avg_per_patient'].values[0]
            if x in df['ds'].values
            else recent_avg_per_patient
        )
        
        # Generate forecast
        self.forecast = self.model.predict(future)
        
        print("✅ Model trained successfully!")
        return self.forecast
    
    def save_forecasts_to_supabase(self, model_version='prophet_v1'):
        """
        Save forecasts to database (Neon/PostgreSQL)
        """
        print("💾 Saving forecasts to database...")
        
        if self.forecast is None:
            print("❌ No forecast to save. Train model first!")
            return
        
        # Get only future forecasts
        future_forecasts = self.forecast[self.forecast['ds'] > datetime.now()]
        
        # Prepare data for insertion
        forecasts_to_insert = []
        for _, row in future_forecasts.iterrows():
            forecasts_to_insert.append({
                'forecast_date': row['ds'].date(),
                'predicted_revenue': float(row['yhat']),
                'lower_bound': float(row['yhat_lower']),
                'upper_bound': float(row['yhat_upper']),
                'model_version': model_version
            })
        
        # Insert into database
        try:
            for forecast in forecasts_to_insert:
                query = """
                    INSERT INTO revenue_forecasts 
                    (forecast_date, predicted_revenue, lower_bound, upper_bound, model_version)
                    VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (forecast_date, model_version) 
                    DO UPDATE SET
                        predicted_revenue = EXCLUDED.predicted_revenue,
                        lower_bound = EXCLUDED.lower_bound,
                        upper_bound = EXCLUDED.upper_bound,
                        created_at = CURRENT_TIMESTAMP
                """
                self.db_pool.query(
                    query,
                    [
                        forecast['forecast_date'],
                        forecast['predicted_revenue'],
                        forecast['lower_bound'],
                        forecast['upper_bound'],
                        forecast['model_version']
                    ]
                )
            
            print(f"✅ Saved {len(forecasts_to_insert)} forecasts to database")
            
        except Exception as e:
            print(f"❌ Error saving forecasts: {e}")
            raise
    
    def evaluate_and_save_metrics(self, historical_df, model_version='prophet_v1'):
        """
        Evaluate model accuracy and save metrics to database
        """
        print("📊 Evaluating model performance...")
        
        # Merge actual and predicted
        comparison = historical_df.merge(
            self.forecast[['ds', 'yhat']],
            on='ds',
            how='inner'
        )
        
        # Calculate metrics
        mae = np.mean(np.abs(comparison['y'] - comparison['yhat']))
        mape = np.mean(np.abs((comparison['y'] - comparison['yhat']) / comparison['y'])) * 100
        rmse = np.sqrt(np.mean((comparison['y'] - comparison['yhat']) ** 2))
        accuracy = 100 - mape
        
        print(f"\n📈 Model Performance:")
        print(f"   MAE: Rs. {mae:,.2f}")
        print(f"   MAPE: {mape:.2f}%")
        print(f"   RMSE: Rs. {rmse:,.2f}")
        print(f"   Accuracy: {accuracy:.2f}%")
        
        # Save to database
        try:
            query = """
                INSERT INTO forecast_metrics 
                (metric_date, model_version, mae, mape, rmse, accuracy, data_points_used)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """
            self.db_pool.query(
                query,
                [
                    datetime.now().date(),
                    model_version,
                    float(mae),
                    float(mape),
                    float(rmse),
                    float(accuracy),
                    len(comparison)
                ]
            )
            print("✅ Metrics saved to database")
            
        except Exception as e:
            print(f"❌ Error saving metrics: {e}")
        
        return {
            'MAE': mae,
            'MAPE': mape,
            'RMSE': rmse,
            'Accuracy': accuracy
        }
    
    def get_next_week_forecast_from_db(self):
        """
        Fetch next 7 days forecast from database
        """
        query = """
            SELECT 
                forecast_date,
                predicted_revenue,
                lower_bound,
                upper_bound,
                TO_CHAR(forecast_date, 'Day') as day_name
            FROM revenue_forecasts
            WHERE forecast_date >= CURRENT_DATE
            AND forecast_date < CURRENT_DATE + INTERVAL '7 days'
            ORDER BY forecast_date
        """
        
        try:
            result = self.db_pool.query(query)
            df = pd.DataFrame(result.rows)
            return df
        except Exception as e:
            print(f"❌ Error fetching forecasts: {e}")
            return None
    
    def get_monthly_forecast_from_db(self):
        """
        Get aggregated 30-day forecast from database
        """
        query = """
            SELECT 
                SUM(predicted_revenue) as total_predicted,
                SUM(lower_bound) as total_lower,
                SUM(upper_bound) as total_upper,
                AVG(predicted_revenue) as avg_daily,
                COUNT(*) as days_count
            FROM revenue_forecasts
            WHERE forecast_date >= CURRENT_DATE
            AND forecast_date < CURRENT_DATE + INTERVAL '30 days'
        """
        
        try:
            result = self.db_pool.query(query)
            return result.rows[0] if result.rows else None
        except Exception as e:
            print(f"❌ Error fetching monthly forecast: {e}")
            return None
    
    def plot_forecast(self, save_path=None):
        """
        Visualize forecast
        """
        if self.model is None or self.forecast is None:
            print("❌ Model not trained yet!")
            return
        
        fig = self.model.plot(self.forecast, figsize=(14, 6))
        plt.title('Revenue Forecast - Supabase Data', fontsize=16, fontweight='bold')
        plt.xlabel('Date', fontsize=12)
        plt.ylabel('Revenue (Rs.)', fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()
    
    def plot_components(self, save_path=None):
        """
        Plot trend and seasonality components
        """
        if self.model is None or self.forecast is None:
            print("❌ Model not trained yet!")
            return
        
        fig = self.model.plot_components(self.forecast, figsize=(14, 10))
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()


def run_daily_forecast():
    """
    Main function to run daily forecast and save to Supabase
    Use this in a cron job or scheduled task
    """
    print("\n" + "="*60)
    print("🏥 CLINIC REVENUE FORECASTING - DAILY RUN")
    print("="*60 + "\n")
    
    try:
        # Initialize forecaster
        forecaster = SupabaseRevenueForecaster()
        
        # Fetch historical data (12 months)
        historical_data = forecaster.fetch_historical_data_sync(months_back=12)
        
        if len(historical_data) < 30:
            print("⚠️  Warning: Less than 30 days of data. Forecasts may be inaccurate.")
            print("   Collect more data for better predictions.")
        
        # Prepare data for Prophet
        prophet_data = forecaster.prepare_data_for_prophet(historical_data)
        
        # Train model
        forecast = forecaster.train_model(prophet_data, forecast_days=30)
        
        # Evaluate model
        metrics = forecaster.evaluate_and_save_metrics(prophet_data)
        
        # Save forecasts to database
        forecaster.save_forecasts_to_supabase(model_version='prophet_v1')
        
        # Display next week forecast
        print("\n📅 Next 7 Days Forecast:")
        next_week = forecaster.get_next_week_forecast_from_db()
        if next_week is not None and len(next_week) > 0:
            print(next_week.to_string(index=False))
        
        # Display monthly summary
        print("\n📈 Next 30 Days Summary:")
        monthly = forecaster.get_monthly_forecast_from_db()
        if monthly:
            print(f"   Total Predicted Revenue: Rs. {monthly['total_predicted']:,.2f}")
            print(f"   Average Daily Revenue: Rs. {monthly['avg_daily']:,.2f}")
            print(f"   Lower Bound: Rs. {monthly['total_lower']:,.2f}")
            print(f"   Upper Bound: Rs. {monthly['total_upper']:,.2f}")
        
        print("\n✅ Forecasting completed successfully!")
        print("="*60 + "\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Forecasting failed: {e}")
        print("="*60 + "\n")
        return False


if __name__ == "__main__":
    # Run the daily forecast
    run_daily_forecast()
