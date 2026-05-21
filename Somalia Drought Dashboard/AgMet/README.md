# AgMet Graphics API Guide

## Overview

The AgMet Graphics API provides access to available AgMet indicators metadata and plots URLs.

**Base URL**

```text
https://agmet.cropmonitortools.org/api
```

## Workflow

A common workflow is:

1. Get available admin systems
2. Get available countries for a specific admin system
3. Get available crops
4. Get available seasons
5. Get available crop/season/year combinations
6. Get available admin units for a selected combination
7. Get the final chart URL

---

## 1. Get available systems

### Endpoint

```text
GET /GetAdminTypeCodes
```

### Example request

```bash
curl "https://agmet.cropmonitortools.org/api/GetAdminTypeCodes"
```

### Example response

```json
[
  {
    "adminName": "Administrative Level 1",
    "adminType": "adm1"
  },
  {
    "adminName": "Crop Monitor",
    "adminType": "cm"
  }
]
```

---

## 2. Get available countries

### Endpoint

```text
GET /GetCountryCodes?adminType=cm
```

### Parameters

- `adminType` required
- Valid values: `adm1`, `cm`

### Example request

```bash
curl "https://agmet.cropmonitortools.org/api/GetCountryCodes?adminType=adm1"
```

### Example response

```json
[
  {
    "countryName": "Afghanistan",
    "countryCode": "746"
  },
  {
    "countryName": "Ethiopia",
    "countryCode": "749"
  },
  [...]
  {
    "countryName": "Somalia",
    "countryCode": "963"
  }
]
```
### IMPORTANT: Country codes are different depending on the admin type selected. 
### Example response for admin type = 'adm1' for Somalia

```json
[
  
  {
    "countryName": "Somalia",
    "countryCode": "963"
  }
]
```

### Example response for admin type = 'cm' for Somalia

```json
[
  
  {
    "countryName": "Somalia",
    "countryCode": "62"
  }
]
```

#### IMPORTANT: The same will apply for sub-national codes. 
---

## 3. Get available crop codes

### Endpoint

```text
GET /GetCropCodes
```

### Description

Returns the list of crop codes available in the system. Optional filters can be applied to limit the results to a specific country or administrative unit.

### Parameters

- `country` optional
- `adminType` optional
- `adminUnitCode` optional, and should be used together with `adminType`

### Example: get all crops

```text
https://agmet.cropmonitortools.org/api/GetCropCodes
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetCropCodes"
```

### Example response

```json
[
  {
    "displayName": "Winter Wheat",
    "cropCode": "ww"
  },
  {
    "displayName": "Spring Wheat",
    "cropCode": "sw"
  },
  {
    "displayName": "Maize",
    "cropCode": "mz"
  },
  {
    "displayName": "Soy Beans",
    "cropCode": "sb"
  },
  {
    "displayName": "Rice",
    "cropCode": "rc"
  }
]
```

### Example: filter by country

```text
https://agmet.cropmonitortools.org/api/GetCropCodes?country=963
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetCropCodes?country=963"
```

### Example: filter by country and admin system

```text
https://agmet.cropmonitortools.org/api/GetCropCodes?country=963&adminType=adm1
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetCropCodes?country=963&adminType=adm1"
```

---

## 4. Get available season codes

### Endpoint

```text
GET /GetSeasonCodes
```

### Description

Returns the list of season codes available for crops. Optional filters allow retrieving seasons for a specific crop or geographic scope.

### Parameters

- `cropCode` optional
- `country` optional
- `adminType` optional
- `adminUnitCode` optional, and should be used together with `adminType`

### Example: get all seasons

```text
https://agmet.cropmonitortools.org/api/GetSeasonCodes
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetSeasonCodes"
```

### Example response

```json
[
  {
    "displayName": "Season 1",
    "seasonCode": "s1"
  },
  {
    "displayName": "Season 2",
    "seasonCode": "s2"
  }
]
```

### Example: filter by crop

```text
https://agmet.cropmonitortools.org/api/GetSeasonCodes?cropCode=ww
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetSeasonCodes?cropCode=ww"
```

### Example: filter by crop and country

```text
https://agmet.cropmonitortools.org/api/GetSeasonCodes?cropCode=mz&country=963
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetSeasonCodes?cropCode=mz&country=963"
```

---

## 5. Get available crop/season/year combinations

### Endpoint

```text
GET /GetCropSeasonYearCodes?countryCode=963&adminTypeCode=adm1
```

### Parameters

- `countryCode` required
- `adminTypeCode` required

### Example request

```bash
curl "https://agmet.cropmonitortools.org/api/GetCropSeasonYearCodes?countryCode=963&adminTypeCode=adm1"
```

### Example response

```json
[
  {
    "cropDisplayName": "Maize",
    "seasonDisplayName": "Season 2",
    "yearDisplayName": "2026",
    "cropSeasonYearCode": "mz_s2_2026"
  }
]
```

---

## 6. Get available subnational admin units

### Endpoint

```text
GET /GetSubnationalAdminUnitCodes?countryCode=963&adminTypeCode=adm1&cropSeasonYearCode=mz_s2_2026
```

### Parameters

- `countryCode` required
- `adminTypeCode` required
- `cropSeasonYearCode` required

### Example request

```bash
curl "https://agmet.cropmonitortools.org/api/GetSubnationalAdminUnitCodes?countryCode=963&adminTypeCode=adm1&cropSeasonYearCode=mz_s2_2026"
```

### Example response

```json
[
  {
    "displayName": "Awdal",
    "adminUnitCode": "10036"
  },
  {
    "displayName": "Banadir",
    "adminUnitCode": "10040"
  },
  {
    "displayName": "Bay",
    "adminUnitCode": "10039"
  },
  {
    "displayName": "Gedo",
    "adminUnitCode": "10042"
  },
  {
    "displayName": "Hiraan",
    "adminUnitCode": "10043"
  },
  {
    "displayName": "Juba Dhexe",
    "adminUnitCode": "10046"
  },
  {
    "displayName": "Juba Hoose",
    "adminUnitCode": "10044"
  },
  {
    "displayName": "Shabelle Dhexe",
    "adminUnitCode": "10047"
  },
  {
    "displayName": "Shabelle Hoose",
    "adminUnitCode": "10045"
  },
  {
    "displayName": "Woqooyi Galbeed",
    "adminUnitCode": "10053"
  }
]
```

---

## 7. Get the plot URL

### Endpoint

```text
GET /GetAgMetGraphic?countryCode=963&adminTypeCode=adm1&cropSeasonYearCode=mz_s2_2026&adminUnitCode=10053
```

### Parameters

- `countryCode` required
- `cropSeasonYearCode` required
- `adminTypeCode` required
- `adminUnitCode` required

### Example request

```bash
curl "https://agmet.cropmonitortools.org/api/GetAgMetGraphic?countryCode=963&adminTypeCode=adm1&cropSeasonYearCode=mz_s2_2026&adminUnitCode=10053"
```

### Example response

```json
{
  "url": "https://cropmonitortools.org/agmet/somalia/mz_s2_2026/condition/adm1/woqooyi_galbeed.jpg",
  "error": null
}
```

---

## Python example

```python
import requests

BASE_URL = "https://agmet.cropmonitortools.org/api"

systems = requests.get(f"{BASE_URL}/GetSystemCodes").json()
print("Systems:", systems)

countries = requests.get(
    f"{BASE_URL}/GetCountryCodes",
    params={"adminType": "adm1"}
).json()

country_code = countries[0]["countryCode"]

crops = requests.get(
    f"{BASE_URL}/GetCropCodes",
    params={
        "country": country_code,
        "adminType": "adm1"
    }
).json()

seasons = requests.get(
    f"{BASE_URL}/GetSeasonCodes",
    params={
        "cropCode": crops[0]["cropCode"],
        "country": country_code,
        "adminType": "adm1"
    }
).json()

crop_season_years = requests.get(
    f"{BASE_URL}/GetCropSeasonYearCodes",
    params={
        "countryCode": country_code,
        "adminTypeCode": "adm1"
    }
).json()

crop_season_year_code = crop_season_years[0]["cropSeasonYearCode"]

admin_units = requests.get(
    f"{BASE_URL}/GetSubnationalAdminUnitCodes",
    params={
        "countryCode": country_code,
        "adminTypeCode": "adm1",
        "cropSeasonYearCode": crop_season_year_code
    }
).json()

admin_unit_code = admin_units[0]["adminUnitCode"]

graphic = requests.get(
    f"{BASE_URL}/GetAgMetGraphic",
    params={
        "countryCode": country_code,
        "cropSeasonYearCode": crop_season_year_code,
        "adminTypeCode": "adm1",
        "adminUnitCode": admin_unit_code
    }
).json()

print("Available crops:", crops)
print("Available seasons:", seasons)
print("Graphic URL:", graphic["url"])
```

---

## Discovering available charts directly

The `GetAvailableAgMetGraphics` endpoint can be used to retrieve all available charts, or a filtered subset.

### Helper endpoints

These two helper endpoints are useful before querying `GetAvailableAgMetGraphics`:

- `GetCropCodes`
- `GetSeasonCodes`

They can be used to discover valid crop and season values before applying filters.

### Endpoint

```text
GET /GetAvailableAgMetGraphics
```

### Response fields

Each item in the response includes:

- `cropSeasonYearCode`
- `countryCode`
- `adminTypeCode`
- `adminUnitCode`
- `url`

### Example: all available graphics

```text
https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics"
```

### Example: filter by country

```text
https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics?countryCode=963
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics?countryCode=963"
```

### Example: filter by crop and season

```text
https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics?cropCode=ww&seasonCode=s1
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics?cropCode=ww&seasonCode=s1"
```

### Example: filter by crop, season, year, country, admin type, and admin unit

```text
https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics?cropCode=mz&seasonCode=s2&year=2026&countryCode=963&adminTypeCode=adm1&adminUnitCode=10036
```

```bash
curl "https://agmet.cropmonitortools.org/api/GetAvailableAgMetGraphics?cropCode=mz&seasonCode=s2&year=2026&countryCode=963&adminTypeCode=adm1&adminUnitCode=10036"
```

### Example response

```json
[
  {
    "cropSeasonYearCode": "mz_s2_2026",
    "countryCode": "963",
    "adminTypeCode": "adm1",
    "adminUnitCode": "10036",
    "url": "https://cropmonitortools.org/agmet/somalia/mz_s2_2026/condition/adm1/awdal.jpg"
  }
]
```

### Notes on filtering

- If no parameters are provided, the endpoint returns all available graphics.
- If one or more parameters are provided, the endpoint returns only matching graphics.
- `adminUnitCode` should be used together with `adminTypeCode`.

---

## Error handling

Example validation error:

```json
{
  "detail": "Invalid adminTypeCode. Must be 'adm1' or 'cm'"
}
```

Example file lookup error:

```json
{
  "url": null,
  "error": "Graphic file not found"
}
```

---

## Notes

- Use `?` to start query parameters.
- Use `&` for additional query parameters.
- `adminType` / `adminTypeCode` valid values are `adm1` and `cm`.
- `cropSeasonYearCode` combines crop, season, and year into one value such as `ww_s1_2026`.
