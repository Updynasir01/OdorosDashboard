# AgMet API - Quick Access Guide

This guide shows how to access AgMet graphics for **Somalia Maize Season 2 (2026)** and integrate them into scripts or websites.

---

## Pulling a plot from the AGMET Indicators API

Retrieve a regional AgMet plot:
```
curl "https://agmet.cropmonitortools.org/api/GetAgMetGraphic?countryCode=963&adminTypeCode=adm1&cropSeasonYearCode=mz_s2_2026&adminUnitCode=10053"
```
Parameters:

- countryCode – Country identifier (963 = Somalia)
- adminTypeCode – Administrative level (adm1 = region)
- cropSeasonYearCode – Crop and season (mz_s2_2026 = Maize Season 2 2026)
- adminUnitCode – Region code

---

## List Available Regions
```
https://agmet.cropmonitortools.org/api/GetSubnationalAdminUnitCodes?countryCode=963&adminTypeCode=adm1&cropSeasonYearCode=mz_s2_2026
```
---

## Region Codes

| Region | adminUnitCode |
|------|------|
| Awdal | 10036 |
| Banadir | 10040 |
| Bay | 10039 |
| Gedo | 10042 |
| Hiraan | 10043 |
| Juba Dhexe | 10046 |
| Juba Hoose | 10044 |
| Shabelle Dhexe | 10047 |
| Shabelle Hoose | 10045 |
| Woqooyi Galbeed | 10053 |

---

## Example Plot Endpoint
```
https://agmet.cropmonitortools.org/api/GetAgMetGraphic?countryCode=963&adminTypeCode=adm1&cropSeasonYearCode=mz_s2_2026&adminUnitCode=10053
```
---

## Python Example

```python
import requests
import time

url = "https://agmet.cropmonitortools.org/api/GetAgMetGraphic"

params = {
    "countryCode": 963,
    "adminTypeCode": "adm1",
    "cropSeasonYearCode": "mz_s2_2026",
    "adminUnitCode": 10053,
    "t": int(time.time())   # prevents caching
}

response = requests.get(url, params=params)

with open("agmet_plot.png", "wb") as f:
    f.write(response.content)

print("Plot saved")
```
## Install dependency:
```
pip install requests
```
## JavaScript Example
``` java
const baseUrl = "https://agmet.cropmonitortools.org/api/GetAgMetGraphic";

const params = new URLSearchParams({
  countryCode: 963,
  adminTypeCode: "adm1",
  cropSeasonYearCode: "mz_s2_2026",
  adminUnitCode: 10053,
  t: Date.now()
});

fetch(`${baseUrl}?${params}`)
   .then(response => resp = response.json())
   .then(json => {
        const imgUrl = (json['url'])
        document.getElementById("agmet-plot").src = imgUrl;
   })
```
Live Example of the code above:

https://agmet.cropmonitortools.org/docs/example.html

## HTML Element required 
```
<img id="agmet-plot">
```