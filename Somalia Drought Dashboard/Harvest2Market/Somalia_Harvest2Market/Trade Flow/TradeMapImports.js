import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Select,
  VStack,
  Checkbox,
  Text,
  Card,
  Tooltip,
  useTheme,
  Spinner,
  Center,
  Link,
  HStack,
  Heading,
  Badge,
  Grid,
  GridItem,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react';
import {CiGlobe } from 'react-icons/ci';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Sphere,
  Marker,
  ZoomableGroup,
  useZoomPanContext,
} from 'react-simple-maps';
import { SpatialSankeyImports, LegendImports } from './SpatialSankeyImports';
import geom from '../../data/geoBoundariesCGAZ_ADM0.json';
import faostatCodes from '../../data/faostat-country-codes.json';
import isoCodes from '../../data/iso-3166-country-codes.json';
import { feature } from 'topojson-client';
import simpleGeom from '../../data/cgaz_adm0_simple.json';
import centerOfMass from '@turf/center-of-mass';
import area from '@turf/area';
import { ciInitialLayout } from '../Utils/ciLayout';
import { MdOutlineBarChart } from "react-icons/md";


// Hardcoded for Somalia
const COUNTRY_ID = 'SOM';
const COUNTRY_LABEL = 'Somalia';

const formatNumber = (num) => {
  if (num >= 1000000) {
    const divided = num / 1000000;
    const formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1);
    return `$${formatted} Billion`;
  } else if (num >= 1000) {
    const divided = num / 1000;
    const formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1);
    return `$${formatted} Million`;
  } else if (num >= 100) {
    const divided = num / 100;
    const formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1);
    return `$${formatted} Thousand`;
  } else if (num >= 10) {
    const divided = num / 10;
    const formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1);
    return `$${formatted} hundred`;
  } else {
    return `$${num % 1 === 0 ? num.toFixed(0) : num.toFixed(1)}`;
  }
};

// Convert TopoJSON to GeoJSON
const geoData = feature(geom, geom.objects.globalADM0);

// Create mapping objects
const m49ToIso3 = faostatCodes.reduce((acc, cur) => {
  acc[cur['ResourceTrade_M49']] = cur['ISO3 Code'];
  return acc;
}, {});

const iso3ToM49 = faostatCodes.reduce((acc, cur) => {
  acc[cur['ISO3 Code']] = cur['ResourceTrade_M49'];
  return acc;
}, {});

// Get country centroid function
const getCountryCentroid = (iso3Code) => {
  const country = geoData.features.find(f =>
    f.properties.shapeGroup === iso3Code
  );

  if (!country?.geometry) return null;

  try {
    let mainGeometry = country.geometry;

    if (country.geometry.type === 'MultiPolygon') {
      const polygons = country.geometry.coordinates.map(poly => ({
        type: 'Polygon',
        coordinates: poly
      }));

      let largestArea = -Infinity;
      let largestPolygon = null;

      polygons.forEach(poly => {
        const polyArea = area(poly);
        if (polyArea > largestArea) {
          largestArea = polyArea;
          largestPolygon = poly;
        }
      });

      mainGeometry = largestPolygon;
    }

    const centroid = centerOfMass(mainGeometry);
    let [lon, lat] = centroid.geometry.coordinates;

    const manualOverrides = {
      'GBR': [-2.547855, 54.00366],
      'FRA': [1.7191036, 46.71109]
    };

    if (manualOverrides[iso3Code]) {
      [lon, lat] = manualOverrides[iso3Code];
    }

    return [lon, lat];
  } catch (error) {
    console.error('Centroid calculation failed:', error);
    return null;
  }
};

// Component to access zoom context and render scaled markers
const ScaledMarkers = ({ parsedData, mapBubbles, mapLabels }) => {
  const { transformString } = useZoomPanContext();

  const getZoomLevel = () => {
    if (!transformString) return 1;
    const scaleMatch = transformString.match(/scale\(([^)]+)\)/);
    return scaleMatch ? parseFloat(scaleMatch[1]) : 1;
  };

  const zoomLevel = getZoomLevel();
  const scaleFactor = Math.max(0.3, Math.min(2, 1 / Math.sqrt(zoomLevel)));

  return (
    <>
      {parsedData.map((trade, idx) => (
        <Marker key={idx} coordinates={trade.sourceCoordinates}>
          {mapBubbles && (
            <circle
              r={3 * scaleFactor}
              fill="#0d9488"
              stroke="#FFF"
              strokeWidth={1 * scaleFactor}
            />
          )}

          {mapLabels && (
            <text
              y={-5 * scaleFactor}
              fontSize={`${8 * scaleFactor}px`}
              textAnchor="middle"
              fill="#2D3748"
              fontWeight="bold"
            >
              {trade.sourceName}
            </text>
          )}

          <Tooltip
            label={`Import Value: ${formatNumber(trade.value)} from ${trade.sourceName}`}
            bg="white"
            color="gray.800"
            fontSize="md"
            hasArrow
            placement="bottom-end"
            offset={[-2, 2]}
            borderRadius="md"
            boxShadow="lg"
          >
            <rect
              x={-10 * scaleFactor}
              y={-10 * scaleFactor}
              width={20 * scaleFactor}
              height={20 * scaleFactor}
              fill="transparent"
            />
          </Tooltip>
        </Marker>
      ))}

      {/* Target country marker (Somalia - importing country) */}
      <Marker coordinates={getCountryCentroid(COUNTRY_ID)}>
        <circle
          r={8 * scaleFactor}
          fill="#48BB78"
          stroke="#FFF"
          strokeWidth={2 * scaleFactor}
        />
        <text
          y={-15 * scaleFactor}
          fontSize={`${12 * scaleFactor}px`}
          textAnchor="middle"
          fill="#2D3748"
          fontWeight="bold"
        >
          {COUNTRY_LABEL}
        </text>
      </Marker>
    </>
  );
};

// Component to render scaled SpatialSankey flows
const ScaledSpatialSankey = ({ data, smallThreshold, mediumThreshold, roundedMax }) => {
  const { transformString } = useZoomPanContext();

  const getZoomLevel = () => {
    if (!transformString) return 1;
    const scaleMatch = transformString.match(/scale\(([^)]+)\)/);
    return scaleMatch ? parseFloat(scaleMatch[1]) : 1;
  };

  const zoomLevel = getZoomLevel();
  const scaleFactor = Math.max(0.3, Math.min(2, 1 / Math.sqrt(zoomLevel)));

  return (
    <SpatialSankeyImports
      data={data}
      smallThreshold={smallThreshold}
      mediumThreshold={mediumThreshold}
      roundedMax={roundedMax}
      scaleFactor={scaleFactor}
    />
  );
};

// Helper for localStorage
const getInitialState = (key, defaultValue) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  }
  return defaultValue;
};

const TradeMapImports = () => {
  const theme = useTheme();
  const [parsedData, setParsedData] = useState([]);
  const [rawData, setRawData] = useState(null);
  const [year, setYear] = useState(2022);
  const [loading, setLoading] = useState(false);
  const [sourceCountry] = useState(COUNTRY_ID);
  const [targetCounties] = useState([]);
  const [fetchingRecords] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const [historicalData, setHistoricalData] = useState(null);
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [commoditiesData, setCommoditiesData] = useState(null);
  const [commoditiesLoading, setCommoditiesLoading] = useState(false);
  const [categoryModels, setCategoryModels] = useState(null);

  const [mapFlows, setMapFlows] = useState(() => getInitialState('mapFlowsImport', true));
  const [mapBubbles, setMapBubbles] = useState(() => getInitialState('mapBubblesImport', true));
  const [mapLabels, setMapLabels] = useState(() => getInitialState('mapLabelsImport', true));

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExporter, setSelectedExporter] = useState('');

  const countryOptions = faostatCodes.filter(c => !/\d/.test(c['ISO3 Code']));

  const values = parsedData.map(flow => flow.value);
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const roundedMax = Math.ceil(maxValue);
  const smallThreshold = roundedMax > 0 ? Math.floor(roundedMax / 3) : 0;
  const mediumThreshold = roundedMax > 0 ? Math.floor((roundedMax * 2) / 3) : 0;

  const hasValidMapping = iso3ToM49[COUNTRY_ID];

  const commodityOptions = [
    { label: 'All, Agricultural Products', value: '1' },
    { label: 'Cereals', value: '7' },
    { label: 'Barley', value: '43' },
    { label: 'Buckwheat', value: '211' },
    { label: 'Maize', value: '45' },
    { label: 'Millet', value: '222' },
    { label: 'Oats', value: '47' },
    { label: 'Rice', value: '49' },
    { label: 'Rye', value: '50' },
    { label: 'Sorghum', value: '51' },
    { label: 'Wheat', value: '52' },
    { label: 'Dairy, eggs, and honey', value: '8' },
    { label: 'Butter', value: '256' },
    { label: 'Cheese', value: '54' },
    { label: 'Eggs', value: '55' },
    { label: 'Milk and milk powder', value: '57' },
    { label: 'Soybeans', value: '87' },
    { label: 'Beef', value: '78' },
    { label: 'Pork', value: '80' },
    { label: 'Poultry', value: '81' },
    { label: 'All, Fertilizers', value: '2' },
    { label: 'Mixed fertilizers', value: '119' },
    { label: 'Nitrogenous fertilizers', value: '120' },
    { label: 'Organic fertilizers', value: '121' },
    { label: 'Phosphatic fertilizers', value: '122' },
    { label: 'All, Fossil Fuels', value: '4' },
    { label: 'Coal', value: '30' },
    { label: 'Gas', value: '31' },
    { label: 'Oil', value: '32' },
  ];

  // Prepare chart data for top 10 import sources
  const chartData = useMemo(() => {
    if (!rawData?.main) {
      return [];
    }

    const chartEntries = rawData.main
      .map(trade => {
        const exporterISO3 = m49ToIso3[trade.exporter];
        if (!exporterISO3) {
          return null;
        }

        const countryName = isoCodes.find(c => c.alpha_3 === exporterISO3)?.short_name_en || exporterISO3;

        return {
          country: countryName,
          iso3: exporterISO3,
          value: trade.value,
          formattedValue: formatNumber(trade.value)
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return chartEntries;
  }, [rawData]);

  const toggleFlows = () => {
    setMapFlows(prev => {
      const newValue = !prev;
      localStorage.setItem('mapFlowsImport', JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleBubbles = () => {
    setMapBubbles(prev => {
      const newValue = !prev;
      localStorage.setItem('mapBubblesImport', JSON.stringify(newValue));
      return newValue;
    });
  };

  const toggleLabels = () => {
    setMapLabels(prev => {
      const newValue = !prev;
      localStorage.setItem('mapLabelsImport', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Main data fetch for imports
  useEffect(() => {
    const fetchData = async () => {
      const m49Code = iso3ToM49[COUNTRY_ID];
      const exporterM49 = selectedExporter ? iso3ToM49[selectedExporter] : null;

      if (!m49Code) {
        console.error('No M49 code found for ISO3:', COUNTRY_ID);
        return;
      }
      if (selectedExporter && !exporterM49) {
        console.error('No M49 code found for exporter ISO3:', selectedExporter);
        return;
      }

      setLoading(true);
      try {
        // For imports: use importer parameter
        const apiUrl = `https://api.resourcetrade.earth/api/rt/2.6/trades?year=${year}&importer=${m49Code}${selectedCategory ? `&category=${selectedCategory}` : ''
          }${exporterM49 ? `&exporter=${exporterM49}` : ''
          }&autozoom=1`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        setRawData(data);

        const processedData = data.main.map(trade => {
          const sourceIso3 = m49ToIso3[trade.exporter];

          if (!sourceIso3) {
            return null;
          }

          const targetCoords = getCountryCentroid(COUNTRY_ID);
          const sourceCoords = getCountryCentroid(sourceIso3);

          return targetCoords && sourceCoords ? {
            source: sourceIso3,
            target: COUNTRY_ID,
            value: trade.value,
            sourceCoordinates: sourceCoords,
            targetCoordinates: targetCoords,
            sourceName: isoCodes.find(c => c.alpha_3 === sourceIso3)?.short_name_en || 'Unknown'
          } : null;
        }).filter(Boolean);

        setParsedData(processedData);

      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, selectedCategory, selectedExporter]);

  const fetchCategoryModels = useCallback(async () => {
    if (categoryModels) return;

    try {
      const response = await fetch('https://api.resourcetrade.earth/api/rt/2.6/models');
      const data = await response.json();
      setCategoryModels(data);
    } catch (error) {
      console.error("Category models API Error:", error);
    }
  }, [categoryModels]);

  useEffect(() => {
    fetchCategoryModels();
  }, [fetchCategoryModels]);

  const getCategoryName = useCallback((categoryId) => {
    if (!categoryModels?.categories) {
      const fallbackMap = {
        1: 'Agricultural Products',
        2: 'Fertilizers',
        3: 'Metal Products',
        4: 'Fossil Fuels',
        5: 'Forestry Products',
        6: 'Textiles & Clothing',
        7: 'Cereals',
        8: 'Dairy, Eggs & Honey'
      };
      return fallbackMap[categoryId] || `Category ${categoryId}`;
    }

    const category = categoryModels.categories.find(cat => cat.id === categoryId);
    return category ? category.name : `Category ${categoryId}`;
  }, [categoryModels]);

  const fetchCommoditiesData = useCallback(async () => {
    const m49Code = iso3ToM49[COUNTRY_ID];
    const exporterM49 = selectedExporter ? iso3ToM49[selectedExporter] : null;

    if (!m49Code) {
      console.error('No M49 code found for ISO3:', COUNTRY_ID);
      return;
    }
    if (selectedExporter && !exporterM49) {
      console.error('No M49 code found for exporter ISO3:', selectedExporter);
      return;
    }

    if (!categoryModels) {
      await fetchCategoryModels();
    }

    setCommoditiesLoading(true);
    try {
      const apiUrl = `https://api.resourcetrade.earth/api/rt/2.6/commodities?year=${year}&importer=${m49Code}${selectedCategory ? `&category=${selectedCategory}` : ''
        }${exporterM49 ? `&exporter=${exporterM49}` : ''
        }&autozoom=1`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      setCommoditiesData(data);

    } catch (error) {
      console.error("Commodities API Error:", error);
    } finally {
      setCommoditiesLoading(false);
    }
  }, [selectedExporter, year, selectedCategory, categoryModels, fetchCategoryModels]);

  const commoditiesChartData = useMemo(() => {
    if (!commoditiesData?.main) return [];

    return commoditiesData.main
      .map(item => ({
        category: getCategoryName(item.category),
        categoryId: item.category,
        value: item.value,
        weight: item.weight,
        formattedValue: formatNumber(item.value)
      }))
      .sort((a, b) => b.value - a.value);

  }, [commoditiesData, getCategoryName]);

  const fetchHistoricalData = useCallback(async () => {
    const m49Code = iso3ToM49[COUNTRY_ID];
    const exporterM49 = selectedExporter ? iso3ToM49[selectedExporter] : null;

    if (!m49Code) {
      console.error('No M49 code found for ISO3:', COUNTRY_ID);
      return;
    }
    if (selectedExporter && !exporterM49) {
      console.error('No M49 code found for exporter ISO3:', selectedExporter);
      return;
    }

    setHistoricalLoading(true);
    try {
      const apiUrl = `https://api.resourcetrade.earth/api/rt/2.6/historical?year=${year}&importer=${m49Code}${selectedCategory ? `&category=${selectedCategory}` : ''
        }${exporterM49 ? `&exporter=${exporterM49}` : ''
        }&autozoom=1`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      setHistoricalData(data);

    } catch (error) {
      console.error("Historical API Error:", error);
    } finally {
      setHistoricalLoading(false);
    }
  }, [selectedExporter, year, selectedCategory]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchCommoditiesData();
    } else if (activeTab === 2) {
      fetchHistoricalData();
    }
  }, [activeTab, fetchHistoricalData, fetchCommoditiesData]);

  const handleTabChange = useCallback((index) => {
    setActiveTab(index);
    if (index === 1) {
      fetchCommoditiesData();
    } else if (index === 2) {
      fetchHistoricalData();
    }
  }, [fetchHistoricalData, fetchCommoditiesData]);

  const historicalChartData = useMemo(() => {
    if (!historicalData?.totals) return [];

    return historicalData.totals
      .map(item => ({
        year: item.year,
        value: item.value,
        formattedValue: formatNumber(item.value),
        weight: item.weight
      }))
      .sort((a, b) => a.year - b.year);

  }, [historicalData]);

  useEffect(() => {
    if (activeTab !== 1) {
      setCommoditiesData(null);
    }
    if (activeTab !== 2) {
      setHistoricalData(null);
    }
  }, [selectedCategory, selectedExporter, activeTab]);

  // If no valid mapping, show error message
  if (!hasValidMapping) {
    return (
      <Box>
        <Heading size="md" marginTop={2} marginBottom={3}>
          <Badge
            variant="subtle"
            colorScheme="green"
            textDecoration="underline"
            fontSize="xl"
            aria-label="selected country trade flow"
            fontFamily="Source Code Pro"
          >
            {COUNTRY_LABEL}
          </Badge>{' '}
          Import Trade Flow
        </Heading>

        <Box textAlign="center" mt={10}>
          <Text fontSize="md" color="gray.500">
            No ResourceTrade data found for selected country. Please select a different country.
          </Text>
        </Box>

        <Box paddingRight={2} paddingTop={4} textAlign="right" fontSize="xs">
          Source:{' '}
          <Link href="https://resourcetrade.earth/" isExternal>
            Chatham House (2024), 'resourcetrade.earth', https://resourcetrade.earth/
          </Link>{' '}
        </Box>
      </Box>
    );
  }

  return (
    <Box height="100%" display="flex" flexDirection="column" paddingTop={2}>
      <Heading size={{ base: "md" }} mb={{ base: 2, md: 3 }}>
        <Badge variant="subtle" colorScheme="green" fontSize={{ base: "xl" }}
          aria-label="selected country trade flow">
          {COUNTRY_LABEL}
        </Badge>{' '}
        Import Trade Flow
      </Heading>

      <Grid
        templateRows="auto 1fr auto"
        templateColumns="1fr"
        gap={{ base: 2, md: 4 }}
        height="100%"
        flex="1"
        minHeight="0"
      >
        {/* Control Panel */}
        <GridItem>
          <Box display={{ base: "block", md: "block" }}>
            <HStack spacing={2} mb={2} justifyContent="flex-end">
              <Button
                size="sm"
                rightIcon={showTableView ? <CiGlobe /> : <MdOutlineBarChart />}
                onClick={() => setShowTableView(!showTableView)}
                variant="solid"
                colorScheme="teal"
              >
                {showTableView ? 'Map' : 'Chart'}
              </Button>
            </HStack>

            <HStack spacing={4} alignItems="top">
              <Select
                size="sm"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                {Array.from({ length: 13 }, (_, i) => 2010 + i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </Select>
              <Select
                size="sm"
                value={selectedExporter}
                onChange={(e) => setSelectedExporter(e.target.value)}
                placeholder="All Source Countries"
              >
                {countryOptions.map((option, index) => (
                  <option key={index} value={option['ISO3 Code']}>
                    {option['Country']}
                  </option>
                ))}
              </Select>
              <Select
                size="sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder="All Commodities"
              >
                {commodityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </HStack>
          </Box>
        </GridItem>

        {/* Content Area - Map or Table View */}
        <GridItem overflow="hidden" minHeight="0">
          {showTableView ? (
            <Box width="100%" height="100%">
              <Tabs size="sm" variant="enclosed" index={activeTab} onChange={handleTabChange}>
                <TabList>
                  <Tab>Imports</Tab>
                  <Tab>Commodities</Tab>
                  <Tab>Historical</Tab>
                </TabList>

                <TabPanels height="calc(100% - 40px)">
                  <TabPanel height="100%" p={2}>
                    {loading ? (
                      <Center h="100%">
                        <Spinner size="xl" />
                      </Center>
                    ) : (
                      <Box height="100%">
                        <Text fontSize="sm" fontWeight="bold" mb={4}>
                          Top 10 Import Sources ({year})
                        </Text>

                        <Text fontSize="xs" color="gray.500" mb={2}>
                          Top {chartData.length} Import Sources out of {rawData?.total || 0}
                        </Text>

                        {chartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                              data={chartData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="country" angle={-45} textAnchor="end" height={80} fontSize={12} />
                              <YAxis tickFormatter={(value) => formatNumber(value)} fontSize={12} />
                              <RechartsTooltip
                                formatter={(value) => [formatNumber(value), 'Import Value']}
                                labelStyle={{ color: '#000' }}
                              />
                              <Bar dataKey="value" fill="#0d9488" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <Text>No import data available</Text>
                        )}
                      </Box>
                    )}
                  </TabPanel>

                  <TabPanel height="100%" p={2}>
                    {commoditiesLoading ? (
                      <Center h="100%">
                        <Spinner size="xl" />
                      </Center>
                    ) : (
                      <Box height="100%">
                        <Text fontSize="sm" fontWeight="bold" mb={4}>
                          Import Value by Commodity Category ({year})
                        </Text>

                        <Text fontSize="xs" color="gray.500" mb={2}>
                          {commoditiesChartData.length} commodity categories
                          {selectedExporter && (
                            <> from {countryOptions.find(c => c['ISO3 Code'] === selectedExporter)?.Country || selectedExporter}</>
                          )}
                        </Text>

                        {commoditiesChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart
                              data={commoditiesChartData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} fontSize={12} />
                              <YAxis tickFormatter={(value) => formatNumber(value)} fontSize={12} />
                              <RechartsTooltip
                                formatter={(value) => [formatNumber(value), 'Import Value']}
                                labelStyle={{ color: '#000' }}
                              />
                              <Bar dataKey="value" fill="#f97316" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <Text>No commodities data available</Text>
                        )}
                      </Box>
                    )}
                  </TabPanel>

                  <TabPanel height="100%" p={2}>
                    {historicalLoading ? (
                      <Center h="100%">
                        <Spinner size="xl" />
                      </Center>
                    ) : (
                      <Box height="100%">
                        <Text fontSize="sm" fontWeight="bold" mb={4}>
                          Historical Import Trade Value
                        </Text>

                        <Text fontSize="xs" color="gray.500" mb={2}>
                          {historicalChartData.length} years of data
                          {selectedExporter && (
                            <> from {countryOptions.find(c => c['ISO3 Code'] === selectedExporter)?.Country || selectedExporter}</>
                          )}
                        </Text>

                        {historicalChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart
                              data={historicalChartData}
                              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            >
                              <defs>
                                <linearGradient id="colorValueImport" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.1} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" fontSize={12} type="number" scale="linear" domain={['dataMin', 'dataMax']} />
                              <YAxis tickFormatter={(value) => formatNumber(value)} fontSize={12} />
                              <RechartsTooltip
                                formatter={(value) => [formatNumber(value), 'Import Value']}
                                labelFormatter={(year) => `Year: ${year}`}
                                labelStyle={{ color: '#000' }}
                              />
                              <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} fillOpacity={1} fill="url(#colorValueImport)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <Text>No historical data available</Text>
                        )}
                      </Box>
                    )}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          ) : (
            /* Map View */
            <Box width="100%" height="100%" minHeight={{ base: "300px", md: "400px" }} position="relative">
              {loading ? (
                <Center h="100%">
                  <Spinner margin={4} thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
                </Center>
              ) : (
                <ComposableMap
                  projection="geoEqualEarth"
                  width={900}
                  height={500}
                  style={{ width: "100%", height: "auto", maxHeight: "100%" }}
                >
                  <defs>
                    <marker
                      id="arrow"
                      viewBox="0 0 10 10"
                      refX="5"
                      refY="5"
                      markerWidth="5"
                      markerHeight="5"
                      orient="auto-start-reverse"
                      opacity={0.5}
                    >
                      <path d="M 0 0 L 7 5 L 0 10 C 1 8 2 7 3 5 C 2 3 1 2 0 0" fill="#3182CE" />
                    </marker>
                  </defs>
                  <ZoomableGroup>
                    <Sphere />
                    <Graticule stroke="#eee" />
                    <Geographies geography={simpleGeom}>
                      {({ geographies }) => geographies.map(geo => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          clipPath="url(#rsm-spheres)"
                          fill={
                            geo.properties.shapeGroup === sourceCountry
                              ? theme.colors.green['300']
                              : targetCounties.includes(geo.properties.shapeGroup)
                                ? theme.colors.blue['100']
                                : '#EDF2F7'
                          }
                          stroke={geo.properties.shapeGroup === sourceCountry ? theme.colors.green['300'] : '#999'}
                          strokeWidth={geo.properties.shapeGroup === sourceCountry ? 0 : 0.25}
                          style={{
                            default: { outline: 'none' },
                            hover: { outline: 'none', cursor: 'grab' },
                            pressed: { outline: 'none' },
                          }}
                        />
                      ))}
                    </Geographies>

                    {mapFlows && (
                      <ScaledSpatialSankey
                        data={parsedData}
                        smallThreshold={smallThreshold}
                        mediumThreshold={mediumThreshold}
                        roundedMax={roundedMax}
                      />
                    )}

                    <ScaledMarkers parsedData={parsedData} mapBubbles={mapBubbles} mapLabels={mapLabels} />
                  </ZoomableGroup>

                  <foreignObject width="100%" height="100%" pointerEvents="none">
                    {fetchingRecords ? <Spinner position="absolute" m={3} /> : null}

                    <Card marginTop={2} position="absolute" right={1} pointerEvents="auto" size={{ base: "sm", md: "md" }}>
                      <VStack alignItems="left" m={2}>
                        <Checkbox size="md" onChange={toggleFlows} isChecked={mapFlows}>
                          <Text fontSize={{ base: '10px', xl: '8px' }}>Flows</Text>
                        </Checkbox>
                        <Checkbox size="md" onChange={toggleBubbles} isChecked={mapBubbles}>
                          <Text fontSize={{ base: '10px', xl: '8px' }}>Points</Text>
                        </Checkbox>
                        <Checkbox size="md" onChange={toggleLabels} isChecked={mapLabels}>
                          <Text fontSize={{ base: '10px', xl: '8px' }}>Labels</Text>
                        </Checkbox>
                      </VStack>
                    </Card>

                    <Box>
                      <LegendImports smallThreshold={smallThreshold} mediumThreshold={mediumThreshold} roundedMax={roundedMax} />
                    </Box>
                  </foreignObject>
                </ComposableMap>
              )}
            </Box>
          )}
        </GridItem>

        {/* Footer */}
        <GridItem>
          <Box paddingRight={2} textAlign="right" fontSize={{ base: "xs", md: "xs" }} py={1}>
            Source:{' '}
            <Link href="https://resourcetrade.earth/" isExternal>
              Chatham House (2024), 'resourcetrade.earth', https://resourcetrade.earth/
            </Link>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}

export default TradeMapImports;