"""
Ingest CHIRPS (Climate Hazards Group InfraRed Precipitation with Station) data
for Somalia regions.

CHIRPS provides high-resolution precipitation data that is critical for
drought monitoring.
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

# CHIRPS data URL (example - actual URL structure may vary)
CHIRPS_BASE_URL = "https://data.chc.ucsb.edu/products/CHIRPS-2.0/"

def download_chirps_data(region: str, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Download CHIRPS precipitation data for a specific region and date range.
    
    Args:
        region: Region name or coordinates
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
    
    Returns:
        DataFrame with precipitation data
    """
    # This is a placeholder - actual implementation would:
    # 1. Construct proper CHIRPS API URLs
    # 2. Download NetCDF or GeoTIFF files
    # 3. Extract data for Somalia regions
    # 4. Convert to time series format
    
    print(f"Downloading CHIRPS data for {region} from {start_date} to {end_date}")
    
    # Mock data structure - replace with actual API calls
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    data = {
        'date': dates,
        'precipitation': np.random.uniform(0, 50, len(dates)),  # Mock data
        'region': region,
    }
    
    return pd.DataFrame(data)

def calculate_rainfall_anomaly(df: pd.DataFrame, historical_period: int = 30) -> float:
    """
    Calculate rainfall anomaly as percentage deviation from historical average.
    
    Args:
        df: DataFrame with precipitation data
        historical_period: Number of years for historical average
    
    Returns:
        Rainfall anomaly percentage
    """
    if len(df) == 0:
        return 0.0
    
    current_avg = df['precipitation'].mean()
    # In production, this would compare to actual historical data
    historical_avg = 25.0  # Placeholder
    
    if historical_avg == 0:
        return 0.0
    
    anomaly = ((current_avg - historical_avg) / historical_avg) * 100
    return round(anomaly, 2)

def process_somalia_regions() -> dict:
    """
    Process CHIRPS data for all Somalia regions.
    
    Returns:
        Dictionary with region data
    """
    regions = [
        'banadir', 'bay', 'bakool', 'hiiraan', 'middle-jubba',
        'lower-jubba', 'gedo', 'middle-shebelle', 'lower-shebelle',
        'galgaduud', 'mudug', 'nugaal', 'bari', 'sanaag', 'sool',
        'togdheer', 'woqooyi-galbeed'
    ]
    
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=90)).strftime('%Y-%m-%d')
    
    results = {}
    
    for region in regions:
        try:
            df = download_chirps_data(region, start_date, end_date)
            anomaly = calculate_rainfall_anomaly(df)
            
            results[region] = {
                'rainfall_anomaly': anomaly,
                'last_rainfall_date': df[df['precipitation'] > 0]['date'].max().strftime('%Y-%m-%d') if len(df[df['precipitation'] > 0]) > 0 else None,
                'total_precipitation': df['precipitation'].sum(),
            }
            
            print(f"Processed {region}: Anomaly = {anomaly}%")
        except Exception as e:
            print(f"Error processing {region}: {e}")
            results[region] = None
    
    return results

if __name__ == '__main__':
    print("Starting CHIRPS data ingestion...")
    results = process_somalia_regions()
    print(f"Processed {len(results)} regions")
    # Save results to database or file
    # save_to_database(results)

