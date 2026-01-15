# Real API Setup Guide

This guide explains how to connect to real drought monitoring data sources.

## 1. CHIRPS (Climate Hazards Group InfraRed Precipitation)

**What it provides:** High-resolution precipitation data

**Access:**
- **Free and Open** - No API key required!
- Data available via FTP and HTTP
- Website: https://data.chc.ucsb.edu/products/CHIRPS-2.0/

**How to access:**
1. Direct download from: `https://data.chc.ucsb.edu/products/CHIRPS-2.0/`
2. Use their FTP server: `ftp://ftp.chg.ucsb.edu/pub/org/chg/products/CHIRPS-2.0/`
3. Or use their API endpoints (documented on their website)

**Data format:** NetCDF or GeoTIFF files

## 2. NASA MODIS/Sentinel (NDVI Data)

**What it provides:** Vegetation health (NDVI) from satellite imagery

**Access:**
- **Free** - Requires NASA Earthdata account (free registration)
- Website: https://earthdata.nasa.gov/
- MODIS API: https://modis.ornl.gov/rst/api/v1/

**How to get access:**
1. Go to https://urs.earthdata.nasa.gov/
2. Create a free account
3. Generate an application token (optional but recommended)
4. Use your username/password for API authentication

**Alternative - Sentinel Hub:**
- Website: https://www.sentinel-hub.com/
- Free tier available (limited requests)
- Requires registration

## 3. FEWS NET (Famine Early Warning Systems Network)

**What it provides:** Food security, rainfall, and drought monitoring data

**Access:**
- **Free** - Public data feeds
- Website: https://fews.net/
- Data Portal: https://fews.net/fews-data/33

**How to access:**
1. Visit https://fews.net/
2. Navigate to "Data" section
3. Access public datasets (some require registration)
4. Use their REST API endpoints (if available)

**Note:** FEWS NET data is often available as downloadable files rather than REST APIs

## 4. FAO Somalia

**What it provides:** Food security, agriculture, and livestock data

**Access:**
- **Free** - Public datasets
- Website: http://www.fao.org/somalia/en/
- FAOSTAT: http://www.fao.org/faostat/en/

**How to access:**
1. Visit FAOSTAT: http://www.fao.org/faostat/en/
2. Browse Somalia-specific datasets
3. Download CSV/JSON data
4. Some data available via API (check documentation)

## 5. UN OCHA (Humanitarian Data Exchange - HDX)

**What it provides:** Humanitarian data including IDPs, population, water points

**Access:**
- **Free** - Open data platform
- Website: https://data.humdata.org/
- API: https://data.humdata.org/api

**How to access:**
1. Visit https://data.humdata.org/
2. Search for "Somalia" datasets
3. Use their REST API (no key required for public data)
4. Example: `https://data.humdata.org/api/3/action/package_search?q=somalia`

## Quick Start - API Keys Needed

**Required:**
- NASA Earthdata account (free) - for MODIS/Sentinel data

**Optional but Recommended:**
- Sentinel Hub account (free tier) - for easier satellite data access

**Not Required:**
- CHIRPS - Completely open, no registration
- FEWS NET - Public data, no API key
- FAO - Public data
- HDX - Public API, no key needed

## Next Steps

1. Create NASA Earthdata account (if you want satellite data)
2. Test API connections using the scripts in `backend/src/services/dataIngestion/`
3. Set up environment variables for any API keys
4. Run data ingestion scripts to populate MongoDB

