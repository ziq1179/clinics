"""
Revenue Forecasting for Clinic Management System
Using Facebook Prophet for Time Series Forecasting
"""

import pandas as pd
import numpy as np
from prophet import Prophet
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class ClinicRevenueForecaster:
    """
    Revenue forecasting model for clinic management system
    Uses Facebook Prophet for time series analysis
    """
    
    def __init__(self):
        self.model = None
        self.forecast = None
        
    def prepare_data(self, df):
        """
        Prepare data for Prophet model
        
        Args:
            df: DataFrame with columns:
                - date: Date of record
                - total_revenue: Total daily revenue
                - consultation_revenue: Doctor consultation fees
                - lab_revenue: Laboratory test charges
                - pharmacy_revenue: Medicine sales
                - num_patients: Number of patients
        
        Returns:
            DataFrame formatted for Prophet
        """
        # Rename columns for Prophet (requires 'ds' and 'y')
        prophet_df = pd.DataFrame({
            'ds': pd.to_datetime(df['date']),
            'y': df['total_revenue'],
            'patients': df['num_patients'],
            'consultation': df['consultation_revenue'],
            'lab': df['lab_revenue'],
            'pharmacy': df['pharmacy_revenue']
        })
        
        # Add derived features
        prophet_df['avg_revenue_per_patient'] = (
            prophet_df['y'] / prophet_df['patients'].replace(0, 1)
        )
        
        # Sort by date
        prophet_df = prophet_df.sort_values('ds').reset_index(drop=True)
        
        return prophet_df
    
    def add_holidays(self):
        """
        Define Pakistan public holidays
        Adjust for your country/region
        """
        holidays = pd.DataFrame({
            'holiday': 'pakistan_holiday',
            'ds': pd.to_datetime([
                '2024-03-23',  # Pakistan Day
                '2024-04-10',  # Eid ul Fitr (approximate)
                '2024-05-01',  # Labour Day
                '2024-06-17',  # Eid ul Adha (approximate)
                '2024-08-14',  # Independence Day
                '2024-09-16',  # Milad un Nabi (approximate)
                '2024-11-09',  # Iqbal Day
                '2024-12-25',  # Quaid Day / Christmas
            ]),
            'lower_window': -1,  # Day before holiday
            'upper_window': 1,   # Day after holiday
        })
        return holidays
    
    def train_model(self, df, forecast_days=30):
        """
        Train Prophet model and generate forecast
        
        Args:
            df: Prepared DataFrame
            forecast_days: Number of days to forecast ahead
        
        Returns:
            Forecast DataFrame
        """
        print("🤖 Training Revenue Forecasting Model...")
        
        # Initialize Prophet model
        self.model = Prophet(
            yearly_seasonality=True,      # Capture yearly patterns
            weekly_seasonality=True,      # Capture weekly patterns
            daily_seasonality=False,      # Not needed for daily data
            seasonality_mode='multiplicative',  # Better for revenue data
            changepoint_prior_scale=0.05  # Flexibility in trend changes
        )
        
        # Add custom seasonalities
        self.model.add_seasonality(
            name='monthly',
            period=30.5,
            fourier_order=5
        )
        
        # Add holidays
        holidays = self.add_holidays()
        self.model.holidays = holidays
        
        # Add regressors (additional features)
        self.model.add_regressor('patients')
        self.model.add_regressor('avg_revenue_per_patient')
        
        # Fit model
        self.model.fit(df)
        
        # Create future dataframe
        future = self.model.make_future_dataframe(periods=forecast_days)
        
        # Add regressor values for future dates
        # For future dates, use recent averages
        recent_avg_patients = df['patients'].tail(30).mean()
        recent_avg_per_patient = df['avg_revenue_per_patient'].tail(30).mean()
        
        future['patients'] = future['ds'].apply(
            lambda x: df[df['ds'] == x]['patients'].values[0] 
            if x in df['ds'].values 
            else recent_avg_patients
        )
        
        future['avg_revenue_per_patient'] = future['ds'].apply(
            lambda x: df[df['ds'] == x]['avg_revenue_per_patient'].values[0]
            if x in df['ds'].values
            else recent_avg_per_patient
        )
        
        # Generate forecast
        self.forecast = self.model.predict(future)
        
        print("✅ Model trained successfully!")
        return self.forecast
    
    def evaluate_model(self, actual_df):
        """
        Evaluate model accuracy on historical data
        
        Args:
            actual_df: DataFrame with actual values
        
        Returns:
            Dictionary with accuracy metrics
        """
        # Merge actual and predicted
        comparison = actual_df.merge(
            self.forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']],
            on='ds',
            how='inner'
        )
        
        # Calculate metrics
        mae = np.mean(np.abs(comparison['y'] - comparison['yhat']))
        mape = np.mean(np.abs((comparison['y'] - comparison['yhat']) / comparison['y'])) * 100
        rmse = np.sqrt(np.mean((comparison['y'] - comparison['yhat']) ** 2))
        
        metrics = {
            'MAE': mae,
            'MAPE': mape,
            'RMSE': rmse,
            'Accuracy': 100 - mape
        }
        
        print("\n📊 Model Performance:")
        print(f"   Mean Absolute Error (MAE): Rs. {mae:,.2f}")
        print(f"   Mean Absolute Percentage Error (MAPE): {mape:.2f}%")
        print(f"   Root Mean Squared Error (RMSE): Rs. {rmse:,.2f}")
        print(f"   Accuracy: {100 - mape:.2f}%")
        
        return metrics
    
    def plot_forecast(self, save_path=None):
        """
        Visualize forecast with confidence intervals
        """
        if self.model is None or self.forecast is None:
            print("❌ Model not trained yet!")
            return
        
        # Create figure
        fig = self.model.plot(self.forecast, figsize=(14, 6))
        plt.title('Revenue Forecast - Next 30 Days', fontsize=16, fontweight='bold')
        plt.xlabel('Date', fontsize=12)
        plt.ylabel('Revenue (Rs.)', fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()
    
    def plot_components(self, save_path=None):
        """
        Plot trend, seasonality, and other components
        """
        if self.model is None or self.forecast is None:
            print("❌ Model not trained yet!")
            return
        
        fig = self.model.plot_components(self.forecast, figsize=(14, 10))
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
        
        plt.show()
    
    def get_next_week_forecast(self):
        """
        Get forecast for next 7 days
        
        Returns:
            DataFrame with daily forecasts
        """
        if self.forecast is None:
            print("❌ Model not trained yet!")
            return None
        
        # Get future dates only
        future_forecast = self.forecast[self.forecast['ds'] > datetime.now()]
        next_week = future_forecast.head(7)
        
        # Format output
        result = pd.DataFrame({
            'Date': next_week['ds'].dt.strftime('%Y-%m-%d'),
            'Day': next_week['ds'].dt.day_name(),
            'Predicted Revenue': next_week['yhat'].round(2),
            'Lower Bound': next_week['yhat_lower'].round(2),
            'Upper Bound': next_week['yhat_upper'].round(2)
        })
        
        return result
    
    def get_monthly_forecast(self):
        """
        Get aggregated monthly forecast
        
        Returns:
            Total predicted revenue for next month
        """
        if self.forecast is None:
            print("❌ Model not trained yet!")
            return None
        
        # Get next 30 days
        future_forecast = self.forecast[self.forecast['ds'] > datetime.now()]
        next_month = future_forecast.head(30)
        
        total_revenue = next_month['yhat'].sum()
        lower_bound = next_month['yhat_lower'].sum()
        upper_bound = next_month['yhat_upper'].sum()
        
        return {
            'Total Predicted Revenue': total_revenue,
            'Lower Bound': lower_bound,
            'Upper Bound': upper_bound,
            'Average Daily Revenue': total_revenue / 30
        }


# Example usage
def example_usage():
    """
    Example of how to use the forecaster
    """
    
    # Generate sample data (replace with your actual data)
    print("📊 Generating sample clinic revenue data...\n")
    
    dates = pd.date_range(start='2023-01-01', end='2024-02-28', freq='D')
    np.random.seed(42)
    
    # Simulate realistic revenue patterns
    base_revenue = 50000
    trend = np.linspace(0, 20000, len(dates))  # Growing trend
    weekly_pattern = 5000 * np.sin(np.arange(len(dates)) * 2 * np.pi / 7)  # Weekly cycle
    monthly_pattern = 8000 * np.sin(np.arange(len(dates)) * 2 * np.pi / 30)  # Monthly cycle
    noise = np.random.normal(0, 3000, len(dates))
    
    total_revenue = base_revenue + trend + weekly_pattern + monthly_pattern + noise
    total_revenue = np.maximum(total_revenue, 10000)  # Minimum revenue
    
    # Create sample dataframe
    sample_data = pd.DataFrame({
        'date': dates,
        'total_revenue': total_revenue,
        'consultation_revenue': total_revenue * 0.4,
        'lab_revenue': total_revenue * 0.3,
        'pharmacy_revenue': total_revenue * 0.3,
        'num_patients': np.random.randint(30, 80, len(dates))
    })
    
    # Initialize forecaster
    forecaster = ClinicRevenueForecaster()
    
    # Prepare data
    prepared_data = forecaster.prepare_data(sample_data)
    
    # Train model
    forecast = forecaster.train_model(prepared_data, forecast_days=30)
    
    # Evaluate model
    metrics = forecaster.evaluate_model(prepared_data)
    
    # Get next week forecast
    print("\n📅 Next 7 Days Forecast:")
    next_week = forecaster.get_next_week_forecast()
    print(next_week.to_string(index=False))
    
    # Get monthly forecast
    print("\n📈 Next 30 Days Summary:")
    monthly = forecaster.get_monthly_forecast()
    for key, value in monthly.items():
        print(f"   {key}: Rs. {value:,.2f}")
    
    # Plot forecast
    print("\n📊 Generating visualizations...")
    forecaster.plot_forecast()
    forecaster.plot_components()


if __name__ == "__main__":
    example_usage()
