"""
Machine Learning model for predicting drought risk 1-3 months ahead.

Uses historical rainfall, NDVI, temperature, and other indicators
to forecast drought conditions.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import pickle
import os

class DroughtPredictor:
    """ML model for drought prediction."""
    
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
    
    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Prepare features for ML model.
        
        Args:
            df: DataFrame with historical data
        
        Returns:
            DataFrame with features
        """
        features = pd.DataFrame()
        
        # Rainfall features
        features['rainfall_avg_3m'] = df['rainfall'].rolling(3).mean()
        features['rainfall_avg_6m'] = df['rainfall'].rolling(6).mean()
        features['rainfall_trend'] = df['rainfall'].diff(3)
        
        # NDVI features
        features['ndvi_avg_3m'] = df['ndvi'].rolling(3).mean()
        features['ndvi_trend'] = df['ndvi'].diff(3)
        
        # Temperature features
        features['temp_avg_3m'] = df['temperature'].rolling(3).mean()
        features['temp_anomaly'] = df['temperature'] - df['temperature'].mean()
        
        # Seasonal features
        features['month'] = pd.to_datetime(df['date']).dt.month
        features['season'] = features['month'].apply(self._get_season)
        
        return features.fillna(0)
    
    def _get_season(self, month: int) -> int:
        """Convert month to season (0=DJF, 1=MAM, 2=JJA, 3=SON)."""
        if month in [12, 1, 2]:
            return 0  # Dry season
        elif month in [3, 4, 5]:
            return 1  # Gu season (main rainy)
        elif month in [6, 7, 8]:
            return 2  # Dry season
        else:
            return 3  # Deyr season (short rainy)
    
    def train(self, historical_data: pd.DataFrame):
        """
        Train the drought prediction model.
        
        Args:
            historical_data: DataFrame with historical features and labels
        """
        # Prepare features
        X = self.prepare_features(historical_data)
        
        # Create labels (drought level: 0=normal, 1=watch, 2=warning, 3=emergency)
        # In production, this would come from actual historical drought classifications
        y = self._create_labels(historical_data)
        
        # Remove rows with NaN labels
        valid_idx = ~y.isna()
        X = X[valid_idx]
        y = y[valid_idx]
        
        if len(X) == 0:
            print("No valid training data")
            return
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        print(f"Model trained. Train accuracy: {train_score:.3f}, Test accuracy: {test_score:.3f}")
        self.is_trained = True
    
    def _create_labels(self, df: pd.DataFrame) -> pd.Series:
        """
        Create labels from historical data.
        In production, this would use actual drought classifications.
        """
        labels = pd.Series(index=df.index, dtype=float)
        
        # Simple rule-based labeling (replace with actual data)
        for i in range(len(df)):
            rainfall = df.iloc[i]['rainfall']
            ndvi = df.iloc[i]['ndvi']
            
            if rainfall < 10 and ndvi < 0.2:
                labels.iloc[i] = 3  # Emergency
            elif rainfall < 20 and ndvi < 0.3:
                labels.iloc[i] = 2  # Warning
            elif rainfall < 30 and ndvi < 0.4:
                labels.iloc[i] = 1  # Watch
            else:
                labels.iloc[i] = 0  # Normal
        
        return labels
    
    def predict(self, current_data: pd.DataFrame, months_ahead: int = 2) -> dict:
        """
        Predict drought risk for future months.
        
        Args:
            current_data: Current data for features
            months_ahead: Number of months to predict ahead
        
        Returns:
            Dictionary with predictions
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Prepare features
        X = self.prepare_features(current_data)
        X_scaled = self.scaler.transform(X.tail(1))
        
        # Predict
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        
        risk_levels = ['normal', 'watch', 'warning', 'emergency']
        risk_level = risk_levels[int(prediction)]
        confidence = max(probabilities) * 100
        
        return {
            'risk_level': risk_level,
            'confidence': round(confidence, 1),
            'timeframe': f'Next {months_ahead * 30} days',
            'probabilities': {
                risk_levels[i]: round(p * 100, 1) for i, p in enumerate(probabilities)
            }
        }
    
    def save_model(self, filepath: str):
        """Save trained model to file."""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'scaler': self.scaler,
            }, f)
    
    def load_model(self, filepath: str):
        """Load trained model from file."""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.scaler = data['scaler']
            self.is_trained = True

def generate_mock_training_data() -> pd.DataFrame:
    """Generate mock training data for demonstration."""
    dates = pd.date_range(start='2020-01-01', end='2024-01-01', freq='M')
    
    data = {
        'date': dates,
        'rainfall': np.random.uniform(0, 100, len(dates)),
        'ndvi': np.random.uniform(0.1, 0.6, len(dates)),
        'temperature': np.random.uniform(25, 35, len(dates)),
    }
    
    return pd.DataFrame(data)

if __name__ == '__main__':
    print("Training drought prediction model...")
    
    # Generate mock data (replace with actual historical data)
    training_data = generate_mock_training_data()
    
    # Train model
    predictor = DroughtPredictor()
    predictor.train(training_data)
    
    # Save model
    os.makedirs('models', exist_ok=True)
    predictor.save_model('models/drought_predictor.pkl')
    
    print("Model trained and saved to models/drought_predictor.pkl")
    
    # Example prediction
    current_data = training_data.tail(12)  # Last 12 months
    prediction = predictor.predict(current_data, months_ahead=2)
    print(f"\nPrediction: {prediction}")

