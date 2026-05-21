// footnotes.js
export const footnotesData = {
  soybeanPriceCard: {
    text: 'This chart summarizes monthly soybean price data (2015–2024) from the World Bank Pink Sheet. It highlights each year’s minimum, maximum, average, and 99th‐percentile values, helping identify peak pricing periods and overall trends.',
  },
  usMap: {
    text: `“Cash receipts” are the farm sector’s cash income from commodity sales. The USDA Economic Research Service (ERS) revised its methodology in August 2015 to address confidentiality gaps in National Agricultural Statistics Service (NASS) data. By allocating “Other States” totals to individual States using publicly available Census of Agriculture variables (e.g., sales, inventory), ERS is able to provide more detailed, State-level cash receipts—including soybeans. These expanded data serve as a useful proxy for identifying which States’ soybean producers may be most vulnerable to retaliatory tariffs, by showing how much each State contributes to the overall soybean cash receipts.
    `,
    linkURL:
      'https://ers.usda.gov/data-products/farm-income-and-wealth-statistics/documentation-for-the-farm-sector-cash-receipts-estimation',
  },
  exports2partnerQTY: `Export volumes (in million tonnes) and year‐over‐year (YoY) percent changes are derived from FAO’s Detailed Trade Matrix for the 2010–2018 period (with future updates planned). Users can toggle “Enable Exporter Comparison” to switch between single‐exporter or dual‐exporter views to a selected importer. Tracking shifts in export volumes can highlight the effects of retaliatory tariffs and demand changes.
    `,
  exports2partnerVAL: `Export values (in Billions USD) and year‐over‐year (YoY) percent changes are derived from FAO’s Detailed Trade Matrix for the 2010–2018 period (with future updates planned). Users can toggle “Enable Exporter Comparison” to switch between single‐exporter or dual‐exporter views to a selected importer. Tracking shifts in export values can highlight the effects of retaliatory tariffs and demand changes.
    `,
  chimportshareChart: {
    text: 'Using IFPRI’s Food trade dependence index methodology, this chart measures the dependence of an importer (e.g., China) on a specific exporter (e.g., the US) for commodity soybean. The use of this card in the Trade War Analysis quantifies dependency ratios aids in assessing China’s reliance on the US for essential agricultural goods. Higher dependency values suggest potential vulnerabilities in supply chains and trade imbalances, making this a crucial metric for trade policy impact.',
    linkURL: 'https://www.foodsecurityportal.org/node/1787',
  },
  fewsPriceChart: {
    text: 'Soybean Monthly Price Data in USD per tonne is shown in purple while the price a year ago is shown in red. This chart shows price trends, which are key indicators of market responses to trade policies and can provide a piece for understanding market disruptions. ',
  },
  piieTradeWarTariffRates: {
    text: 'This chart visualizes trade-weighted average tariffs (2018–2023) between the US, China, and the rest of the world (ROW). Tariff rates are computed from product-level (6-digit HS) tariff and trade data, weighted by 2017 global export values. US tariffs on ROW exports remain constant when Section 232 tariffs on steel or aluminum are converted to quotas or tariff-rate quotas. Data sources include UN Comtrade, ITC Trade Map, Market Access Map, and official announcements from China’s Ministry of Finance and the US Trade Representative. Source: Peterson Institute for International Economics (PIIE), uploaded to Harvest Portal.',
  },
  piieTradeSub2Tariff: {
    text: 'All data from this chart was obtained from Peterson Institute for International Economics (PIIE). This chart visualizes the percent of trade subject to tariffs during the US-China trade war (2018–2023) in percentage. Trade-weighted average tariffs are computed from product-level (6-digit HS) tariff and trade data, weighted by 2017 global exports. Data sources include UN Comtrade, ITC Trade Map, Market Access Map, and announcements from China’s Ministry of Finance and the US Trade Representative. The chart highlights the impact of trade policies on US and Chinese exports, providing critical context for understanding bilateral trade tensions.',
  },
  soySubstitution: {
    text: "This chart quantifies the projected changes in soybean exports under different tariff scenarios, illustrating Brazil's gain and the US's loss from retaliatory tariffs. At the peak of the US-China trade war in 2018, US soybean exports to China dropped by 74.48%, while Brazil's exports rose by 34.1%, reflecting an elasticity of substitution of -2.2 (Steinbach et al., 2024). For every 1% reduction in US exports to China, Brazilian exports increased by 0.5% (Steinbach et al., 2024). The analysis highlights the impact of trade policies on global export dynamics, focusing on Brazil’s ability to fill gaps in Chinese demand.",
  },
  soyProjection: {
    text: 'This chart projects US soybean export values (2025-2034) under distinct retaliatory tariff scenarios. The baseline is derived from World Agricultural Outlook Board data. Scenarios model potential export impacts: Scenario 1 assumes a 20% Chinese tariff; Scenario 2a assumes a 10% tariff by the rest of the world; Scenario 2b combines a 60% Chinese tariff with a 10% tariff by the rest of the world; Scenario 3 models a 9.5% Chinese tariff increase (Steinbach et al., 2024). These projections quantify the long-term effects of retaliatory tariffs on US soybean exports. ',
  },
  grantTradeEffects: {
    text: 'This chart estimates the trade impacts of retaliatory tariffs on US agricultural exports to selected countries (e.g., China, EU-28, Canada, Mexico, Turkey, and India) during the 2018/2019 period, based on Grant et al. (2021). Results demonstrate the negative effects of retaliatory tariffs on US agricultural exports, highlighting key commodities and markets most impacted.',
  },
  reporterAcresChart: {
    text: 'This chart visualizes soybean yield trends (tonnes/hectare) from 2010 to 2023, based on OECD data. Yield is calculated as production divided by harvested area, reflecting productivity influenced by factors like crop genetics, sunlight, water, nutrients, pests, and weeds. Insights from yield trends can inform trade analyses, particularly when changes align with shifts in export volumes. ',
  },
  usAgriPriceShocks: {
    heading1: 'Purpose of the Analysis:',
    text1:
      'This dataset presents the results of a simulation analyzing the impact of agricultural price fluctuations on household financial burdens across U.S. states. Specifically, the study simulates a 100% price increase in the production of 14 major agricultural sectors, estimating how this shock affects households in different income brackets.',
    metrics: {
      heading2: 'Key Metrics:',
      text2:
        'Burden (in 2025 USD): The absolute increase in household expenditures due to price shocks. Burden Rate (%): The relative increase in the cost of living, calculated as the additional burden divided by total household expenditures.',
    },
  },
  tvBalticDryIndex: {
    heading1: 'Baltic Dry Index (BDI):',
    linkURL: 'https://www.balticexchange.com/',
    text1:
      ' (ticker: BDI) is a shipping and trade index created by the Baltic Exchange. The Baltic Exchange calculates the index based on shipping rates across more than 20 routes for each of the BDI component vessels.',
  },
  tvCassFreightIndex: {
    heading1: 'Cass Freight Index:',
    linkText: 'cassinfo.com',
    linkURL:
      'https://www.cassinfo.com/freight-audit-payment/cass-transportation-indexes/cass-freight-index',
    text1:
      '(ticker:FRGSHPUSM649NCIS) is provided by the St. Louis FRED (https://fred.stlouisfed.org/) and reflects various freight modes in the United States.',
  },
  tvCrudeOil: {
    heading1: 'WTI Crude Oil Futures:',
    linkURL:
      'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.html',
    text1:
      'reflects the West Texas Instrument (WTI) spot futures contract mid-price, in USD, per barrel (bbl).',
  },
  tvExchangeRates: {
    heading1: 'Foreign Exchange Rates:',
    text1:
      'Foreign Exchange (Forex / FX) rates indicate the current mid-price of current conversions to USD, according to IDC or OANDA, as indicated per-chart. OANDA data feeds also include daily trading volume. All charts are provided courtesy of TradingView and are for informational purposes only.',
  },
  tvFreightTSI: {
    heading1: 'Freight Transportation Services Index (TSI):',
    text1:
      '(TSI, ticker: TSIFRGHT) is calculated monthly by the St. Louis FRED and is a reflection of intra-continental shipping costs within North America.',
    linkURL: 'https://fred.stlouisfed.org/',
  },
  tvNutrienFutures: {
    heading1: 'Nutrien Fertilizer Futures:',
    linkURL:
      'https://www.nutrienltd.com/investors/financial-information/market-data/commodity-prices',
    text1:
    " EUREX:POCF1! is the ticker for Nutrien's fertilizer futures contract, which is traded on the EUREX exchange. The chart displays the mid-price in USD per tonne, reflecting the market's expectations for future fertilizer prices. Nutrien is a major global supplier of agricultural products and services, including fertilizers.",
  },
  FSPMap1: {
    //Footnote for FSPMap1 and FSPShareCaloric
    heading1: 'Understanding Total Caloric Intake (%)',
    text1:
      'The Total Caloric Intake (%) represents the caloric share of commodity i in country c, expressed as a percentage. It is calculated by dividing the daily calories per person from commodity i in country c by the total daily calories per person from all 90 food commodities in the FAO database.',
    heading2: 'For (All 15 staple foods):',
    text2:
      ' The percentage represents the combined share of daily calories that comes from the 15 selected staple foods (eg., wheat, rice, maize, etc.) out of the total daily caloric intake from all foods in the FAO database. ',
    heading3: 'For each single commodity (eg., wheat, soybean, etc.):',
    text3:
      ' The percentage represents the individual share of daily calories from that specific commodity alone, again as a fraction of total daily calories from all foods.',
    linkURL: 'https://www.foodsecurityportal.org/node/2505',
  },
  FSPMap2: {
    // Footnote for FSPMap2 and FSPDependenceRadial
    heading1: 'Understanding Food Import Dependence Ratio:',
    text1:
      'The Food Import Dependence Ratio (%) measures the extent to which a country relies on food imports, based on data from the FAO Food Balance Sheet. It is calculated as (Imports − Exports) divided by Domestic Supply. Domestic Supply is defined by the FAO as the sum of domestic production, net imports, and net stock changes, minus losses.',

    heading2: 'For All 15 Staple Foods:',
    text2:
      "The percentage represents the combined import dependence ratio for 15 key staple foods, including cereals, roots and tubers, legumes, sugar, and oils. It reflects a country's overall reliance on external sources for essential food commodities.",

    heading3: 'For Each Single Commodity (e.g., wheat, soybean, etc.):',
    text3:
      'The percentage indicates the import dependence ratio for an individual staple food, helping identify which specific commodities a country imports most versus those it produces domestically or exports.',

    heading4: 'Negative Values:',
    text4:
      'Negative values indicate a net exporter, where exports exceed imports. A ratio below -5% reflects strong export orientation. Countries with values between -5% and 5% are considered approximately self-sufficient in that commodity.',

    linkURL: 'https://www.foodsecurityportal.org/node/2505',
  },
  FSPMap3: {
    heading1: 'Understanding Food Insecurity Values:',
    text1:
      'The values shown represent the percentage of the population experiencing moderate to severe food insecurity, based on data from the FAO Suite of Food Security Indicators. These figures are derived from household survey data using the Food Insecurity Experience Scale (FIES), which captures individuals’ access to sufficient and nutritious food.',

    heading2: 'Interpolated Estimates:',
    text2:
      'For 41 countries without direct FIES data, values are estimated using regression models based on indicators such as per capita GDP (PPP), undernourishment prevalence, poverty rates, and income inequality (Gini coefficient). These models explain a large portion of the variance in food insecurity and provide reasonable estimates for countries lacking direct survey data.',
    linkURL: 'https://www.foodsecurityportal.org/node/2505',
  },
  FSPVUlIndex: {
    //footnote for FSPVulIndex abd and FSPFoodImmportVulIndex
    heading1: 'Understanding Food Import Vulnerability Index (FIVI):',
    text1:
      "FIVI assesses a country's vulnerability to international food price shocks and calculated using three components: 1) Share of Caloric Intake from staple foods, 2) Import Dependence Ratio of these staple foods, and 3) Prevalence of moderate or severe food insecurity in a countries population.",
    text2:
      'The FIVI is calculated as a multiplicative geometric mean, meaning if any one of the 3 components is 0 the resulting FIVI is also zero. ',
    heading2: 'For (All 15 staple foods):',
    text3:
      "The national FIVI reflects a country's overall vulnerability to increases in world food prices across 15 key staple foods. A high national FIVI indicates that a country relies heavily on  food imports for its caloric intake and has a large share of population experiencing food insecurity. A low national FIVI means most staple food calories are domestically produced or food insecurity levels are low.",
    heading3: 'For each single commodity (eg., wheat, soybean, etc.):',
    text4:
      "The commodity-level FIVI measures a country's specific vulnerability to international price increases of that single staple food. A high commodity-level FIVI can be interpretedthat The commodity makes up a significant portion of the national diet, a large share of the commodity is imported, and the country has high food insecurity. A FIVI of 0 for a commodity indicates the country is a net exporter of that food , or the commodity plays no role om the population diet or the population is not food insecure.",
    linkURL: 'https://www.foodsecurityportal.org/node/2505',
  },
  CropMonitorEventsTable: {
    heading1: ' Understanding Crop Monitor Events Table',
    text1:
     'Crop Monitor Events are a subset of GEOGLAM Crop Monitor.',
     linkURL1: 'https://www.cropmonitor.org/',
     text2: 'Due to Crop Monitor reports being published monthly, an additional mid-season alert system has been developed to track significant events that may impact crop conditions. These alerts provide timely updates on climate and socio-economic factors affecting crop production, detailing affected regions, key drivers (e.g., drought, extreme weather, conflict), and relevant resources. Crop Monitor team members submit observations through an online interface, and mid-month alerts are incorporated into the Supply Chains Dashboard, with further details included in the next Crop Monitor report.',
     text3: 'Crop Monitor events occuring in the last 30 days are visible in the Quick Status Panel (3D globe). The symbology reflects the drivers reported. Once a crop monitor event has been clicked this triggers a modal which provides further details on the selected crop monitor event.',
     reportURL: 'https://www.cropmonitor.org/global-crop-monitor'

  },
  GlobalCropConditionsMap: {
    heading2: 'Crop Monitor for Early Warning Crop Condition Classes',
    condition1: 'Exceptional',
    exceptionalDef: 'Conditions are much better than average* at the time of reporting. This label is used only during the grain-filling through harvest stages.',
    condition2: 'Favourable',
    favourableDef: 'Conditions range from slightly below to slightly above-average* at reporting time.',
    condition3: 'Watch',
    watchDef: 'Conditions are not far from average* but there is a potential risk to final yields. There is still time and possibility for the crop to recover to average conditions if the ground situation improves. This label is only used during the planting-early vegetative and the vegetative-reproductive stages.',
    condition4: 'Poor',
    poorDef: 'Crop conditions are well below average*. Crop yields are likely to be 10-25% below-average*. This is used when crops are not likely to recover, and impact on yields is likely.',
    condition5: 'Failure',
    failureDef: 'Crop conditions are extremely poor. Crop yields are likely to be 25% or more below-average*.',
    condition6: 'Out-of-Season',
    outofseasonDef: 'Crops are not currently planted or in development during this time.',
    condition7: 'No Data',
    nodataDef: '	No reliable source of data is available at this time.',
    avgDef: '* “Average” refers to the mean conditions over the most recent 5 years. In areas where conflict is a driver of crop conditions, current conditions are compared to the pre-conflict average rather than the average conditions over the past 5 years. In areas where conflict is protracted, based on expert analysis on a case by case basis, crop conditions will be compared to the average conditions over the past 5 years. ',
    linkURL: 'https://www.cropmonitor.org/early-warning-classification-system',
    reportURL: 'https://www.cropmonitor.org/global-crop-monitor'
    
  },
  GlobalTotalCropConditionsPieChart:{
  heading2: 'Crop Monitor for Early Warning Crop Condition Classes',
  condition1: 'Exceptional',
  exceptionalDef: 'Conditions are much better than average* at the time of reporting. This label is used only during the grain-filling through harvest stages.',
  condition2: 'Favourable',
  favourableDef: 'Conditions range from slightly below to slightly above-average* at reporting time.',
  condition3: 'Watch',
  watchDef: 'Conditions are not far from average* but there is a potential risk to final yields. There is still time and possibility for the crop to recover to average conditions if the ground situation improves. This label is only used during the planting-early vegetative and the vegetative-reproductive stages.',
  condition4: 'Poor',
  poorDef: 'Crop conditions are well below average*. Crop yields are likely to be 10-25% below-average*. This is used when crops are not likely to recover, and impact on yields is likely.',
  condition5: 'Failure',
  failureDef: 'Crop conditions are extremely poor. Crop yields are likely to be 25% or more below-average*.',
  condition6: 'Out-of-Season',
  outofseasonDef: 'Crops are not currently planted or in development during this time.',
  condition7: 'No Data',
  nodataDef: '	No reliable source of data is available at this time.',
  avgDef: '* “Average” refers to the mean conditions over the most recent 5 years. In areas where conflict is a driver of crop conditions, current conditions are compared to the pre-conflict average rather than the average conditions over the past 5 years. In areas where conflict is protracted, based on expert analysis on a case by case basis, crop conditions will be compared to the average conditions over the past 5 years. ',
  linkURL: 'https://www.cropmonitor.org/early-warning-classification-system',
  reportURL: 'https://www.cropmonitor.org/global-crop-monitor'
  

  },
  GlobalPastCropConditionsChart: {

    heading2: 'Crop Monitor for Early Warning Crop Condition Classes',
  condition1: 'Exceptional',
  exceptionalDef: 'Conditions are much better than average* at the time of reporting. This label is used only during the grain-filling through harvest stages.',
  condition2: 'Favourable',
  favourableDef: 'Conditions range from slightly below to slightly above-average* at reporting time.',
  condition3: 'Watch',
  watchDef: 'Conditions are not far from average* but there is a potential risk to final yields. There is still time and possibility for the crop to recover to average conditions if the ground situation improves. This label is only used during the planting-early vegetative and the vegetative-reproductive stages.',
  condition4: 'Poor',
  poorDef: 'Crop conditions are well below average*. Crop yields are likely to be 10-25% below-average*. This is used when crops are not likely to recover, and impact on yields is likely.',
  condition5: 'Failure',
  failureDef: 'Crop conditions are extremely poor. Crop yields are likely to be 25% or more below-average*.',
  condition6: 'Out-of-Season',
  outofseasonDef: 'Crops are not currently planted or in development during this time.',
  condition7: 'No Data',
  nodataDef: '	No reliable source of data is available at this time.',
  avgDef: '* “Average” refers to the mean conditions over the most recent 5 years. In areas where conflict is a driver of crop conditions, current conditions are compared to the pre-conflict average rather than the average conditions over the past 5 years. In areas where conflict is protracted, based on expert analysis on a case by case basis, crop conditions will be compared to the average conditions over the past 5 years. ',
  linkURL: 'https://www.cropmonitor.org/early-warning-classification-system',
  reportURL: 'https://www.cropmonitor.org/global-crop-monitor'
  

  },
  amisDefinitions:{
    productionDef: 'Production refers to the full amount of the harvest before any deductions are made for post-harvest losses, seed use, etc. Production of wheat, maize and soybeans is in terms of product weight. For rice, paddy is converted to milled equivalent.',
    utilizationDef: 'Total Utilization is calculated as Domestic Utilization plus Exports plus Closing Stocks. In the specific case of World, total utilization is the global sum of countries’ Domestic Utilizations and Closing Stocks only.',
    closingStocksDef:'Closing (or ending or carry-over) Stocks: Quantity of stocks at the end of the marketing year (before the following year’s harvest) held at all levels within the food system, both by governments and the private sector (incl. farm holdings and households). Closing stocks of a given marketing year are always identical to the opening stocks of the following year.',
    stocks2UseDef: 'A convenient measure of the adequacy of stocks is to normalize them in the form of the stocks-to-use ratio (SUR), the ratio of stocks to consumption, broadly defined.',
    areaHarvestedDef:'The area harvested over the crop year.',
    importsDef: 'Imports include commercial purchases from abroad as well as food aid deliveries.',
    exportsDef: '	Exports refer to all shipments outside the country, including food aid.',
    amisCountriesDef: 'AMIS is composed of G20 members plus Spain and eight additional major exporting and importing countries of agricultural commodities. Together, AMIS participants represent a large share of global production, consumption and trade volumes of the targeted crops, typically in the range of 80-90 percent.',
    maize: 'Maize includes yellow and white maize.',
    rice: '	All values are presented on a milled equivalent basis, unless otherwise stated.',
    soybean: 'Soybeans production data from all three sources (FAO-AMIS, IGC and USDA-PSD) encompass production in the northern hemisphere occurring during the first year of the season (e.g. 2018 for the 2018/19 marketing season), as well as crops harvested in the southern hemisphere during the second year of the season (e.g. 2019 for the 2018/19 marketing season) .',
    wheat: 'Wheat includes soft and durum wheat',
    marketYear: 'Commodity balances apply a marketing year (or marketing season) approach, meaning that values refer to a twelve month period that starts with the harvest of the main crop (which may or may not coincide with the calendar year).',
    linkURL: 'https://www.amis-outlook.org/',
    amisOverviewLink: 'https://www.amis-outlook.org/about/overview'
  },
  cmDriverDefinitions: {
    driver1: 'Wet',
    driver1Def: '	Wetter than average (includes water logging and floods).',
    driver1sym: '#60a5fa',
    driver2: 'Dry',
    driver2Def: 'Drier than average',
    driver2sym: '#eab308',
    driver3: 'Hot',
    driver3Def: 'Hotter than average.',
    driver3sym: '#fbbf24',
    driver4: 'Cold',
    driver4Def: 'Colder than average or frost damage.',
    driver4sym: '#b4d3ef',
    driver5: 'Extreme Event',
    driver5Def: 'Catch-all for all other climate risks (i.e. hurricane, typhoon, frost, hail, winter kill, wind damage, etc.). When this category is used the analyst will also specify the type of extreme event in the text.',
    driver5sym: '#dc2626',  
    driver6: 'Delayed Onset',
    driver6Def: 'A late enough start to the season that it may impact full crop development.',
    driver6sym: '#71717a',
    driver7: 'Socioeconomic',
    driver7Def: 'Social or economic factors that impact crop conditions (i.e. policy changes, agricultural subsidies, government intervention, etc.)',
    driver7sym: '#16a34a',
    driver8: 'Conflict',
    driver8Def: 'Armed conflict or civil unrest that is preventing the planting, working, or harvesting of the fields by the farmers.',
    driver8sym: '#f472b6',
    driver9: 'No Driver Reported',
    driver9Def: 'No driver was reported for this crop monitor event.',
    driver9sym: '#9333ea',
    driver10:'Multiple Drivers',
    driver10Def: 'Multiple drivers were reported for this crop monitor event. The symbology will be a combination of the different drivers reported.',
    driver10sym: '#511111',
    linkURL: 'https://www.cropmonitor.org/global-classification-system',
}

};
