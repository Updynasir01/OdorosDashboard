# Data Processing Scripts

Python scripts for ingesting and processing drought monitoring data from various sources.

## Data Sources

- **CHIRPS**: Climate Hazards Group InfraRed Precipitation with Station data
- **NASA MODIS/Sentinel**: NDVI (Normalized Difference Vegetation Index)
- **FEWS NET**: Famine Early Warning Systems Network
- **FAO Somalia**: Food and Agriculture Organization data
- **UN OCHA**: United Nations Office for the Coordination of Humanitarian Affairs

## Setup

```bash
pip install -r requirements.txt
```

## Scripts

### `ingest_chirps.py`
Downloads and processes CHIRPS rainfall data.

### `ingest_ndvi.py`
Downloads and processes NDVI data from NASA MODIS/Sentinel.

### `process_drought_indicators.py`
Calculates drought indicators from raw data.

### `predict_drought.py`
ML model for drought prediction (1-3 months ahead).

### `update_database.py`
Updates PostgreSQL database with processed data.

## Usage

Run scripts individually or use a scheduler (cron, systemd timer) to run them periodically:

```bash
python ingest_chirps.py
python ingest_ndvi.py
python process_drought_indicators.py
python predict_drought.py
python update_database.py
```

