"""
Process and calculate drought indicators from various data sources.

Combines rainfall, NDVI, temperature, and other data to compute
comprehensive drought indicators.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List

def calculate_drought_level(indicators: Dict) -> str:
    """
    Calculate overall drought level from multiple indicators.
    
    Args:
        indicators: Dictionary with indicator values
    
    Returns:
        Drought level: 'normal', 'watch', 'warning', or 'emergency'
    """
    rainfall_deficit = indicators.get('rainfall_deficit', 0)
    ndvi = indicators.get('ndvi', 0.5)
    water_scarcity = indicators.get('water_scarcity', 0)
    
    # Emergency: Severe conditions
    if rainfall_deficit > 70 or ndvi < 0.2 or water_scarcity > 85:
        return 'emergency'
    
    # Warning: Moderate to severe
    if rainfall_deficit > 50 or ndvi < 0.3 or water_scarcity > 70:
        return 'warning'
    
    # Watch: Early signs
    if rainfall_deficit > 30 or ndvi < 0.4 or water_scarcity > 50:
        return 'watch'
    
    # Normal: No significant drought
    return 'normal'

def calculate_temperature_anomaly(current_temp: float, historical_avg: float) -> float:
    """
    Calculate temperature anomaly.
    
    Args:
        current_temp: Current temperature
        historical_avg: Historical average temperature
    
    Returns:
        Temperature anomaly in degrees Celsius
    """
    return round(current_temp - historical_avg, 2)

def calculate_water_scarcity(water_sources: Dict) -> float:
    """
    Calculate water scarcity percentage.
    
    Args:
        water_sources: Dictionary with water source data
    
    Returns:
        Water scarcity percentage (0-100)
    """
    # In production, this would use actual water point data
    # For now, estimate based on drought conditions
    functional_sources = water_sources.get('functional', 0)
    total_sources = water_sources.get('total', 1)
    
    if total_sources == 0:
        return 100.0
    
    scarcity = (1 - (functional_sources / total_sources)) * 100
    return round(scarcity, 1)

def calculate_livestock_risk(indicators: Dict) -> float:
    """
    Calculate livestock risk level.
    
    Args:
        indicators: Dictionary with relevant indicators
    
    Returns:
        Livestock risk percentage (0-100)
    """
    rainfall_deficit = indicators.get('rainfall_deficit', 0)
    ndvi = indicators.get('ndvi', 0.5)
    water_scarcity = indicators.get('water_scarcity', 0)
    
    # Combine factors
    risk = (rainfall_deficit * 0.4) + ((1 - ndvi) * 100 * 0.3) + (water_scarcity * 0.3)
    
    return min(100, round(risk, 1))

def process_region_indicators(region_data: Dict) -> Dict:
    """
    Process all indicators for a region.
    
    Args:
        region_data: Dictionary with raw region data
    
    Returns:
        Dictionary with processed indicators
    """
    indicators = {
        'rainfall_deficit': region_data.get('rainfall_deficit', 0),
        'ndvi': region_data.get('ndvi', 0.5),
        'temperature_anomaly': region_data.get('temperature_anomaly', 0),
        'water_scarcity': region_data.get('water_scarcity', 0),
    }
    
    # Calculate livestock risk
    indicators['livestock_risk'] = calculate_livestock_risk(indicators)
    
    # Calculate overall drought level
    indicators['drought_level'] = calculate_drought_level(indicators)
    
    return indicators

def process_all_regions(regions_data: List[Dict]) -> List[Dict]:
    """
    Process indicators for all regions.
    
    Args:
        regions_data: List of dictionaries with raw region data
    
    Returns:
        List of dictionaries with processed indicators
    """
    processed = []
    
    for region_data in regions_data:
        try:
            indicators = process_region_indicators(region_data)
            processed.append({
                'region_id': region_data.get('region_id'),
                'region_name': region_data.get('region_name'),
                **indicators,
            })
        except Exception as e:
            print(f"Error processing {region_data.get('region_id')}: {e}")
    
    return processed

if __name__ == '__main__':
    # Example usage
    sample_data = [
        {
            'region_id': 'bay',
            'region_name': 'Bay',
            'rainfall_deficit': 78,
            'ndvi': 0.18,
            'temperature_anomaly': 2.1,
            'water_scarcity': 85,
        },
        {
            'region_id': 'bari',
            'region_name': 'Bari',
            'rainfall_deficit': 15,
            'ndvi': 0.48,
            'temperature_anomaly': 0.5,
            'water_scarcity': 30,
        },
    ]
    
    processed = process_all_regions(sample_data)
    
    for region in processed:
        print(f"\n{region['region_name']}:")
        print(f"  Drought Level: {region['drought_level']}")
        print(f"  Livestock Risk: {region['livestock_risk']}%")

