import os
import joblib
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

PREMIUM_MODEL = None
PREMIUM_SCALER = None
PAYOUT_MODEL = None

try:
    if os.path.exists('models/premium_model.pkl'):
        PREMIUM_MODEL = joblib.load('models/premium_model.pkl')
    if os.path.exists('models/premium_scaler.pkl'):
        PREMIUM_SCALER = joblib.load('models/premium_scaler.pkl')
    if os.path.exists('models/payout_model.pkl'):
        PAYOUT_MODEL = joblib.load('models/payout_model.pkl')
except Exception as e:
    print(f"Failed to load models: {e}")

class PayoutRequest(BaseModel):
    earnings_baseline_hourly: float
    disruption_type: int
    severity_score: float
    hours_affected: float
    coverage_hours_per_day: float
    max_weekly_payout: float
    trust_score: float
    zone_historical_impact: float

class PremiumRequest(BaseModel):
    zone_risk_score: float
    earnings_baseline: float
    rain_forecast_7d: float
    heat_forecast_7d: float
    aqi_forecast_7d: float
    trust_score: float
    historical_claim_rate: float
    plan_type: int
    worker_tenure_weeks: float
    
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict-payout")
def predict_payout(data: PayoutRequest):
    if not PAYOUT_MODEL:
        return {"error": "Payout model not loaded. Run train.py first."}
        
    features = [[
        data.earnings_baseline_hourly,
        data.disruption_type,
        data.severity_score,
        data.hours_affected,
        data.coverage_hours_per_day,
        data.max_weekly_payout,
        data.trust_score,
        data.zone_historical_impact
    ]]
    
    amount = PAYOUT_MODEL.predict(features)[0]
    return {"payout_amount": round(amount, 2)}

@app.post("/predict-premium")
def predict_premium(data: PremiumRequest):
    if not PREMIUM_MODEL or not PREMIUM_SCALER:
        return {"error": "Premium model or scaler not loaded. Run train.py first."}
        
    features = [[
        data.zone_risk_score,
        data.earnings_baseline,
        data.rain_forecast_7d,
        data.heat_forecast_7d,
        data.aqi_forecast_7d,
        data.trust_score,
        data.historical_claim_rate,
        data.plan_type,
        data.worker_tenure_weeks
    ]]
    
    features_scaled = PREMIUM_SCALER.transform(features)
    amount = PREMIUM_MODEL.predict(features_scaled)[0]
    return {"weekly_premium": round(amount, 2)}

# Backward Compatibility for existing mock system
@app.post("/predict")
def predict(data: dict):
    print(f"Received disruption & worker data: {data}")
    severity = data.get("severity", 0.5)
    baseline = data.get("earnings_baseline_hourly", 100)
    hours = data.get("hours", 4)
    
    calculated_payout = severity * baseline * hours
    
    return {
        "score": severity,
        "label": "disruption_approved",
        "calculated_payout": calculated_payout
    }
