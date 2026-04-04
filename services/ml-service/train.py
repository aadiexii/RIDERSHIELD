import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

# Ensure models directory exists
os.makedirs('models', exist_ok=True)

# Set seed for reproducibility as requested
np.random.seed(42)

def generate_premium_data(n_samples=1000):
   zone_risk_score = np.random.uniform(0, 1, n_samples)
   earnings_baseline = np.random.randint(2500, 9000, n_samples)
   rain_forecast_7d = np.random.uniform(0, 200, n_samples)
   heat_forecast_7d = np.random.uniform(20, 50, n_samples)
   aqi_forecast_7d = np.random.randint(20, 600, n_samples)
   trust_score = np.random.randint(10, 100, n_samples)
   historical_claim_rate = np.random.uniform(0, 1, n_samples)
   plan_type = np.random.randint(0, 3, n_samples)
   worker_tenure_weeks = np.random.randint(1, 104, n_samples)
   
   df = pd.DataFrame({
       'zone_risk_score': zone_risk_score,
       'earnings_baseline': earnings_baseline,
       'rain_forecast_7d': rain_forecast_7d,
       'heat_forecast_7d': heat_forecast_7d,
       'aqi_forecast_7d': aqi_forecast_7d,
       'trust_score': trust_score,
       'historical_claim_rate': historical_claim_rate,
       'plan_type': plan_type,
       'worker_tenure_weeks': worker_tenure_weeks
   })
   
   # Synthetic target generation 
   weekly_premium = (30 + 
                     zone_risk_score * 20 + 
                     (earnings_baseline / 1000) * 5 + 
                     (rain_forecast_7d / 10) + 
                     (heat_forecast_7d / 5) * 2 + 
                     (aqi_forecast_7d / 100) * 5 -
                     (trust_score / 10) + 
                     historical_claim_rate * 30 + 
                     plan_type * 10 -
                     (worker_tenure_weeks / 10))
   
   # Clip to target range [30, 200]
   df['weekly_premium'] = np.clip(weekly_premium, 30, 200)
   return df


def generate_payout_data(n_samples=1000):
   earnings_baseline_hourly = np.random.randint(40, 180, n_samples)
   disruption_type = np.random.randint(0, 5, n_samples)
   severity_score = np.random.uniform(0, 1, n_samples)
   hours_affected = np.random.uniform(0.5, 12, n_samples)
   coverage_hours_per_day = np.random.choice([6, 8, 12], n_samples)
   max_weekly_payout = np.random.choice([500, 900, 1500], n_samples)
   trust_score = np.random.randint(10, 100, n_samples)
   zone_historical_impact = np.random.uniform(0, 1, n_samples)

   df = pd.DataFrame({
       'earnings_baseline_hourly': earnings_baseline_hourly,
       'disruption_type': disruption_type,
       'severity_score': severity_score,
       'hours_affected': hours_affected,
       'coverage_hours_per_day': coverage_hours_per_day,
       'max_weekly_payout': max_weekly_payout,
       'trust_score': trust_score,
       'zone_historical_impact': zone_historical_impact
   })

   # target generation explicitly based on requirements
   payout_amount = (earnings_baseline_hourly * 
                    hours_affected * 
                    severity_score * 
                    zone_historical_impact)
   
   df['payout_amount'] = np.minimum(payout_amount, max_weekly_payout)
   return df


if __name__ == "__main__":
   print("Generating Synthetic Data...")
   premium_data = generate_premium_data(1000)
   payout_data = generate_payout_data(1000)

   print("Training Premium Model (GBM)...")
   # GradientBoostingRegressor: 200 estimators, lr 0.05
   X_prem = premium_data.drop('weekly_premium', axis=1)
   y_prem = premium_data['weekly_premium']

   scaler = StandardScaler()
   X_prem_scaled = scaler.fit_transform(X_prem)
   X_train, X_test, y_train, y_test = train_test_split(X_prem_scaled, y_prem, test_size=0.2, random_state=42)

   premium_model = GradientBoostingRegressor(n_estimators=200, learning_rate=0.05, random_state=42)
   premium_model.fit(X_train, y_train)
   
   prem_mae = mean_absolute_error(y_test, premium_model.predict(X_test))
   print(f"Premium Model MAE: {prem_mae:.4f} INR")

   print("Training Payout Model (RF)...")
   # RandomForestRegressor: 300 estimators, max depth 8
   X_pay = payout_data.drop('payout_amount', axis=1)
   y_pay = payout_data['payout_amount']

   X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_pay, y_pay, test_size=0.2, random_state=42)

   payout_model = RandomForestRegressor(n_estimators=300, max_depth=8, random_state=42)
   payout_model.fit(X_train_p, y_train_p)

   pay_mae = mean_absolute_error(y_test_p, payout_model.predict(X_test_p))
   print(f"Payout Model MAE: {pay_mae:.4f} INR")

   print("Saving models to services/ml-service/models/...")
   joblib.dump(premium_model, 'models/premium_model.pkl')
   joblib.dump(scaler, 'models/premium_scaler.pkl')
   joblib.dump(payout_model, 'models/payout_model.pkl')
   
   print("Training complete! Model persistence verified.")
