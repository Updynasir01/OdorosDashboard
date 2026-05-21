import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'aws-amplify/api';
import faostatCountryCodes from '../../../data/faostat-country-codes.json';
import {
  Tooltip,
  Select,
  Box,
  Text,
  VStack,
  HStack,
  Link,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  Container,
  OrderedList,
  ListItem,
  useDisclosure,
  IconButton,
  Collapse,
  Button,
  Grid,
  GridItem,
  Heading,
  Badge
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { ciInitialLayout } from '../../../components/Utils/ciLayout';
import { FaTrash } from "react-icons/fa";

// Hardcoded for Somalia
const COUNTRY_ID = 'SOM';
const COUNTRY_LABEL = 'Somalia';

const ADMIN1_BOUNDARY_RESOURCE_ID = '559cbd46-5919-4ded-bd0e-e12f071e193e';
const ADMIN2_BOUNDARY_RESOURCE_ID = 'b451bf11-ff32-4139-9676-ef43f72b49a7';

// Color scale for food insecurity classification

const scenarioDisplayNames = {
  CS: 'Current Situation',
  ML1: 'Near-term Projection',
  ML2: 'Medium-term Projection',
};

// Helper function to get display name
const getScenarioDisplayName = scenario => {
  return scenarioDisplayNames[scenario] || scenario;
};

const countryResourceMap = {
  SSD: '6bcb57f2-48c5-43cf-bb51-741116800ef4', // South Sudan
  SDN: '2fff698f-5072-4e9c-8d26-1ffc07a59b7d', // Sudan
  BDI: '53584243-ff12-4e2b-9f7a-6d32f2e2d532', // Burundi
  KEN: 'b6ae3654-8ee3-4f58-b284-ff330ccbfd8c', // Kenya
  MDG: '85a8e380-26ca-4445-8a21-d67c6be5ce96', // Madagascar *nolhz
  MWI: '02e5d7d2-c2c0-4b69-850c-df57ca8d49ba', // Malawi
  MOZ: '7d079112-021d-4e35-bd06-f3297c0e43a5', // Mozambique *nolhz
  SOM: 'f71147c0-1256-4415-9ea3-1e7fc9c20a87', // Somalia
  UGA: 'a5de8d6b-5bed-4cd2-913d-904dd9ab9de2', // Uganda adjust crs
  ZWE: '5314e74d-9ebe-4fb8-a262-1e19ebb5d778', // Zimbabwe
  COD: '15e456d7-8241-415e-89b8-11db3e215f5c', // Democratic Republic of the Congo *nolhz
  CMR: '151cc12b-27a6-40d3-a6f1-fe1380628a26', // Cameroon *nolhz
  TCD: '404cc669-b4d8-4678-9979-92825606d889', // Chad
  NGA: '76f8238e-ab7b-46c4-84d2-b3158077cd4c', // Nigeria
  HTI: 'cdf5d263-d5b8-489d-8c67-2231c3801a4c', // Haiti
  AFG: '80c0eb65-e749-4b49-b24e-ed36ca0544ac', // Afghanistan
  YEM: '8cdce40c-9d75-4beb-8c09-bcd6c0399b21', // Yemen
  HND: 'd30c6f4c-5771-4fe3-bb24-12beab0bcbab', // Honduras
  SLV: 'dda401da-4ff6-4d70-9dfd-6fffb4852b6c', // El Salvador
  AGO: 'a27edb01-a8ec-4faf-89c5-a35e0a189707', // Angola
  BFA: 'f4ef500c-52cf-428e-ab6c-318fff188d8a', // Burkina Faso,
  CAF: 'bdd65fb9-2aa2-4e32-a0f2-98d782d43318', // Central African Republic
  ETH: 'b03fe4df-b3c5-40e7-806c-bf9a2e2c9384', // Ethiopia *nolhz
  GTM: '1b0a717a-29ee-4356-ad16-0c15d43b739b', // Guatemala
  LSO: 'f2519fa6-18cd-4b54-a488-c4dae8d8dc69', // Lesotho
  MLI: '4d5c3ec3-d162-4ae1-bc4c-bd0b7643a3b3', // Mali
  NIC: 'f4f5e98f-a383-4ebf-a203-ac054fed3726', // Nicaragua
  NER: '946d0840-7d29-4176-a7db-00f61db0ef44', // Niger
  MRT: 'd000ed92-e526-4702-80de-b030e33c9cb1', // Mauritania
  RWA: '79543a02-35f4-4f78-a0ad-7ff2263f446b', // Rwanda
};

// Country center coordinates for positioning the map
const countryCenterMap = {
  KEN: [37, 0.5], // Kenya
  SDN: [30, 15], // Sudan
  SSD: [30, 8], // South Sudan
  BDI: [30, -3.5], // Burundi
  MDG: [47, -20], // Madagascar
  MWI: [35, -13], // Malawi
  MOZ: [35, -18], // Mozambique
  SOM: [47, 5], // Somalia
  UGA: [32, 1], // Uganda
  ZWE: [30, -20], // Zimbabwe
  COD: [23, -3], // Democratic Republic of the Congo
  CMR: [12, 8], // Cameroon
  TCD: [18, 15], // Chad
  NGA: [8, 10], // Nigeria
  HTI: [-73, 19], // Haiti
  AFG: [65, 34], // Afghanistan
  YEM: [48, 15], // Yemen
  HND: [-85.714, 14.66], // Honduras
  SLV: [-88.2, 13.2], // El Salvador
  AGO: [17.5, -12], // Angola
  BFA: [-2, 12.5], // Burkina Faso
  CAF: [20, 7], // Central African Republic
  ETH: [40, 9], // Ethiopia
  GTM: [-90.5, 15.85], // Guatemala
  LSO: [28.5, -29.75], // Lesotho
  MLI: [-4, 17], // Mali
  NIC: [-85, 13], // Nicaragua
  NER: [8, 18], // Niger
  MRT: [-10.947381584515327, 19.92787347265763], // Mauritania
  RWA: [30, -2.5], // Rwanda
};

const LHZIPC = () => {
  const state = useSelector(state => state);

  const mapContainer = useRef(null);
  const map = useRef(null);

  // Check if country is supported
  const isCountrySupported = countryResourceMap[state.geoID?.id];
  const [essentialLayersLoading, setEssentialLayersLoading] = useState(false);
  const [admin2Loading, setAdmin2Loading] = useState(false);


  // Legend visibility control
  const { isOpen: isLegendOpen, onToggle: toggleLegend } = useDisclosure({
    defaultIsOpen: true,
  });
  // Feature info panel visibility control
  const { isOpen: isFeatureInfoOpen, onToggle: toggleFeatureInfo } =
    useDisclosure({ defaultIsOpen: false });

  // Feature info state
  const [selectedFeatureInfo, setSelectedFeatureInfo] = useState(null);
  // Add these state variables after the existing state declarations around line 30:
  const [marker, setMarker] = useState(null);
  const [, setMarkerCoordinates] = useState(null);
  // Boundary data states
  const [admin1BoundaryData, setAdmin1BoundaryData] = useState(null);
  const [admin2BoundaryData, setAdmin2BoundaryData] = useState(null);
  const [livelihoodZoneData, setLivelihoodZoneData] = useState(null);

  //chart view
  const [showIPCChart, setShowIPCChart] = useState(false);
  // Add toggle function
  const toggleIPCChart = () => {
    setShowIPCChart(!showIPCChart);
  };
  // Add state for chart data after existing state declarations
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  // Food insecurity data states
  const [rawGeoData, setRawGeoData] = useState(null);
  const [geoData, setGeoData] = useState(null);
  const [, setngLHZIPCData] = useState([]);
  const [availableScenarios, setAvailableScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState('CS');
  const [currentProjectionEnd, setCurrentProjectionEnd] = useState('');

  // Loading states
  const [, setLoading] = useState(false);
  const [livelihoodZoneLoading, setLivelihoodZoneLoading] = useState(false);
  const [livelihoodZoneError, setLivelihoodZoneError] = useState(null);

  // Layer visibility states - Admin1 and Food Insecurity shown by default
  const [showAdmin1Boundaries, setShowAdmin1Boundaries] = useState(true);
  const [showAdmin2Boundaries, setShowAdmin2Boundaries] = useState(false);
  const [showLivelihoodZones, setShowLivelihoodZones] = useState(false);
  const [showGeoData, setShowGeoData] = useState(true); // Food insecurity layer

  //height control
  const dispatch = useDispatch();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const componentId = 'p1-Fewsnet_LHZ_IPC_Join';

  // Add a function to clear the marker:
  const clearMarker = () => {
    if (marker) {
      marker.remove();
      setMarker(null);
      setMarkerCoordinates(null);
      // Clear feature info and chart data when marker is cleared
      setSelectedFeatureInfo(null);
      setChartData([]);
    }
  };

  const getISO2FromISO3 = iso3Code => {
    const countryData = faostatCountryCodes.find(
      country => country['ISO3 Code'] === iso3Code
    );
    return countryData ? countryData['ISO2 Code'] : null;
  };

  const filterDataByScenario = (rawData, scenario) => {
    if (!rawData || !scenario)
      return { filteredGeoData: null, filteredFeatures: [] };

    const filteredFeatures = rawData.features.filter(feature => {
      const props = feature.properties;
      return props.scenario === scenario;
    });

    const filteredGeoData = {
      ...rawData,
      features: filteredFeatures,
    };

    return { filteredGeoData, filteredFeatures };
  };

  // Function to find the best available scenario
  const findBestScenario = geoJsonData => {
    const preferenceOrder = ['CS', 'ML1', 'ML2'];

    for (const scenario of preferenceOrder) {
      const hasScenario = geoJsonData.features.some(
        feature => feature.properties.scenario === scenario
      );
      if (hasScenario) {
        return scenario;
      }
    }

    // If none of the preferred scenarios exist, return the first available scenario
    const availableScenarios = [
      ...new Set(
        geoJsonData.features.map(feature => feature.properties.scenario)
      ),
    ].filter(Boolean);

    return availableScenarios[0] || null;
  };

  // Function to get all unique scenarios from the data
  const extractAvailableScenarios = geoJsonData => {
    const scenarios = [
      ...new Set(
        geoJsonData.features.map(feature => feature.properties.scenario)
      ),
    ]
      .filter(Boolean)
      .sort();
    return scenarios;
  };

  // Toggle functions
  const toggleAdmin1Boundaries = () => {
    setShowAdmin1Boundaries(!showAdmin1Boundaries);
  };

  const toggleAdmin2Boundaries = () => {
    setShowAdmin2Boundaries(!showAdmin2Boundaries);
  };

  const toggleGeoData = () => {
    setShowGeoData(!showGeoData);
  };

  const toggleLivelihoodZones = () => {
    if (livelihoodZoneError) return;

    const newState = !showLivelihoodZones;
    setShowLivelihoodZones(newState);

    // If turning on and no data exists, fetch it
    if (
      newState &&
      !livelihoodZoneData &&
      !livelihoodZoneLoading &&
      state.geoID?.id
    ) {
      fetchLivelihoodZoneData(state.geoID.id);
    }
  };

  // Handle scenario change
  const handleScenarioChange = event => {
    setSelectedScenario(event.target.value);
  };

  const getHarvestPortalKey = async () => {
    const restOperation = get({
      apiName: 'SupplyChainsApi',
      path: '/supplyChainsApi/harvest-portal-api-key',
    });
    const restOperationResponse = (await restOperation.response).body.json();
    const response = await restOperationResponse;
    return response.value;
  };

  const getMapTilerKey = async () => {
    const restOperation = get({
      apiName: 'SupplyChainsApi',
      path: '/supplyChainsApi/map-tiler-key',
    });
    const restOperationResponse = (await restOperation.response).body.json();
    const response = await restOperationResponse;
    return response.value;
  };

  // Fetch livelihood zone data
  const fetchLivelihoodZoneData = useCallback(async countryCode => {
    try {
      setLivelihoodZoneLoading(true);
      setLivelihoodZoneError(null);
      const iso2Code = getISO2FromISO3(countryCode);
      const apiCountryCode = iso2Code || countryCode;

      console.log(
        `🔍 Fetching livelihood zones for: ${countryCode} (ISO2: ${apiCountryCode})`
      );

      const restOperation = get({
        apiName: 'SupplyChainsApi',
        path: '/supplyChainsApi/fews-api',
        options: {
          queryParams: {
            api_name: 'feature.geojson',
            country_code: apiCountryCode,
            unit_type: 'livelihood_zone',
            as_of_date: '2015-01-01',
          },
        },
      });

      const restOperationResponse = await restOperation.response;
      const responseBody = await restOperationResponse.body.json();

      let livelihoodData = null;

      if (responseBody?.success && responseBody?.value) {
        livelihoodData = responseBody.value;
      } else {
        livelihoodData = responseBody;
      }

      if (
        livelihoodData &&
        livelihoodData.features &&
        Array.isArray(livelihoodData.features) &&
        livelihoodData.features.length > 0
      ) {
        const validFeatures = livelihoodData.features.filter(
          feature =>
            feature.geometry &&
            feature.properties &&
            (feature.geometry.type === 'Polygon' ||
              feature.geometry.type === 'MultiPolygon')
        );

        if (validFeatures.length > 0) {
          const validatedGeoJson = {
            type: 'FeatureCollection',
            crs: livelihoodData.crs,
            features: validFeatures,
          };
          setLivelihoodZoneData(validatedGeoJson);
          setLivelihoodZoneError(null);
          console.log(
            '✅ Livelihood zone data loaded successfully:',
            validFeatures.length,
            'features'
          );
        } else {
          setLivelihoodZoneData(null);
          setLivelihoodZoneError(`No valid livelihood zone boundaries found`);
        }
      } else {
        setLivelihoodZoneData(null);
        setLivelihoodZoneError(`No livelihood zone data available`);
      }

      return livelihoodData;
    } catch (error) {
      console.error('❌ Error fetching livelihood zone data:', error);
      setLivelihoodZoneError(`Unable to access livelihood zone data`);
      setLivelihoodZoneData(null);
      setShowLivelihoodZones(false);
    } finally {
      setLivelihoodZoneLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    const asyncFunction = async () => {
      if (!isCountrySupported) return; // Don't initialize map if country not supported
      if (map.current) return; // Initialize map only once
      if (!mapContainer.current) {
        console.warn('Map container not available yet');
        return;
      }

      const countryCode = state.geoID?.id;
      const center = countryCenterMap[countryCode] || [0, 0];
      const mapTilerKey = await getMapTilerKey();

      console.log(
        '🗺️ Initializing map for country:',
        countryCode,
        'at center:',
        center
      );

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          glyphs: `https://api.maptiler.com/fonts/{fontstack}/{range}.pbf?key=${mapTilerKey}`,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#ffffff',
              },
            },
          ],
        },
        center: center,
        zoom: 5,
        attributionControl: false,
        dragPan: true,
        dragRotate: true,
        scrollZoom: true,
        boxZoom: true,
        doubleClickZoom: true,
        keyboard: true,
        touchZoomRotate: true,
        touchPitch: true,
      });

      map.current.on('error', e => {
        console.error('❌ Map error:', e);
      });

      return () => {
        if (map.current) {
          console.log('🗺️ Cleaning up map');
          map.current.remove();
          map.current = null;
        }
      };
    };

    asyncFunction();
  }, [state.geoID?.id, isCountrySupported]);

  // Add food insecurity data to map
  useEffect(() => {
    if (!map.current || !geoData) return;

    console.log('🗺️ Managing food insecurity data - Show:', showGeoData);

    // Remove existing food insecurity layers if they exist
    if (map.current.getLayer('food-insecurity-fill')) {
      map.current.removeLayer('food-insecurity-fill');
    }
    if (map.current.getLayer('food-insecurity-line')) {
      map.current.removeLayer('food-insecurity-line');
    }
    if (map.current.getLayer('food-insecurity-points')) {
      map.current.removeLayer('food-insecurity-points');
    }
    if (map.current.getLayer('food-insecurity-points-assistance')) {
      map.current.removeLayer('food-insecurity-points-assistance');
    }
    if (map.current.getSource('food-insecurity')) {
      map.current.removeSource('food-insecurity');
    }
    if (map.current.getSource('food-insecurity-points')) {
      map.current.removeSource('food-insecurity-points');
    }

    // Only add layers if showGeoData is true
    if (showGeoData) {
      try {
        // Separate polygon and point features
        const polygonFeatures = geoData.features.filter(
          feature =>
            feature.geometry.type === 'Polygon' ||
            feature.geometry.type === 'MultiPolygon'
        );

        const pointFeatures = geoData.features.filter(
          feature =>
            feature.geometry.type === 'Point' ||
            feature.geometry.type === 'MultiPoint'
        );

        // Add polygon data if exists
        if (polygonFeatures.length > 0) {
          const polygonGeoData = {
            ...geoData,
            features: polygonFeatures,
          };

          // Add food insecurity source for polygons
          map.current.addSource('food-insecurity', {
            type: 'geojson',
            data: polygonGeoData,
          });

          // Add food insecurity fill layer with color based on value
          map.current.addLayer({
            id: 'food-insecurity-fill',
            type: 'fill',
            source: 'food-insecurity',
            paint: {
              'fill-color': [
                'case',
                ['==', ['get', 'value'], 1],
                '#cdf5ca',
                ['==', ['get', 'value'], 2],
                '#f9e63b',
                ['==', ['get', 'value'], 3],
                '#e17b26',
                ['==', ['get', 'value'], 4],
                '#cc381d',
                ['==', ['get', 'value'], 5],
                '#651709',
                '#cccccc', // Default color
              ],
              'fill-opacity': 0.8,
            },
          });

          // Add food insecurity line layer
          map.current.addLayer({
            id: 'food-insecurity-line',
            type: 'line',
            source: 'food-insecurity',
            paint: {
              'line-color': '#333333',
              'line-width': 1,
              'line-opacity': 0.6,
            },
          });
        }

        // Add point data if exists
        if (pointFeatures.length > 0) {
          // Convert MultiPoint to Point features for easier handling
          const expandedPointFeatures = [];
          pointFeatures.forEach(feature => {
            if (feature.geometry.type === 'MultiPoint') {
              feature.geometry.coordinates.forEach(coord => {
                expandedPointFeatures.push({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: coord,
                  },
                  properties: feature.properties,
                });
              });
            } else if (feature.geometry.type === 'Point') {
              expandedPointFeatures.push(feature);
            }
          });

          const pointGeoData = {
            type: 'FeatureCollection',
            features: expandedPointFeatures,
          };

          // Add point source
          map.current.addSource('food-insecurity-points', {
            type: 'geojson',
            data: pointGeoData,
          });

          // Add point layer with color based on classification
          map.current.addLayer({
            id: 'food-insecurity-points',
            type: 'circle',
            source: 'food-insecurity-points',
            paint: {
              'circle-radius': [
                'case',
                ['==', ['get', 'unit_type'], 'idp_camp'],
                8,
                6, // Default radius for other point types
              ],
              'circle-color': [
                'case',
                ['==', ['get', 'value'], 1],
                '#cdf5ca',
                ['==', ['get', 'value'], 2],
                '#f9e63b',
                ['==', ['get', 'value'], 3],
                '#e17b26',
                ['==', ['get', 'value'], 4],
                '#cc381d',
                ['==', ['get', 'value'], 5],
                '#651709',
                '#808080', // Default color
              ],
              'circle-stroke-color': '#404040',
              'circle-stroke-width': 2,
              'circle-opacity': 0.9,
            },
          });

          // Add assistance indicator layer (exclamation mark for points with assistance)
          map.current.addLayer({
            id: 'food-insecurity-points-assistance',
            type: 'symbol',
            source: 'food-insecurity-points',
            filter: ['==', ['get', 'is_allowing_for_assistance'], true],
            layout: {
              'text-field': '!',
              'text-font': ['Open Sans Bold'],
              'text-size': 14,
              'text-anchor': 'center',
              'text-justify': 'center',
              'text-allow-overlap': true,
              'text-ignore-placement': true,
            },
            paint: {
              'text-color': '#000000',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
            },
          });

          // Add click event for point tooltips
          map.current.on('click', 'food-insecurity-points', e => {
            const feature = e.features[0];
            const coordinates = feature.geometry.coordinates.slice();
            const props = feature.properties;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const hasAssistance = props.is_allowing_for_assistance === true;

            // Get classification color for the popup
            const getClassificationColor = value => {
              switch (parseInt(value)) {
                case 1:
                  return '#cdf5ca';
                case 2:
                  return '#f9e63b';
                case 3:
                  return '#e17b26';
                case 4:
                  return '#cc381d';
                case 5:
                  return '#651709';
                default:
                  return '#808080';
              }
            };

            const classificationColor = getClassificationColor(props.value);

            const popupContent = `
            <div style="
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
              font-size: 14px;
              line-height: 1.5;
              color: #1a202c;
              background: white;
              border-radius: 8px;
              padding: 0;
              margin: 0;
              min-width: 200px;
              max-width: 300px;
            ">
              <!-- Header with type and classification color indicator -->
              <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px 8px 16px;
                border-bottom: 1px solid #e2e8f0;
                margin-bottom: 8px;
              ">
                <div style="
                  width: 12px;
                  height: 12px;
                  border-radius: 50%;
                  background-color: ${classificationColor};
                  border: 2px solid #404040;
                  flex-shrink: 0;
                "></div>
                <div style="
                  font-weight: 600;
                  font-size: 16px;
                  color: #2d3748;
                ">
                  ${props.unit_type === 'idp_camp'
                ? 'IDP Camp'
                : props.unit_type || 'Point'
              }
                </div>
                ${hasAssistance
                ? `
                  <div style="
                    background-color: #fed7d7;
                    color: #c53030;
                    font-weight: bold;
                    font-size: 12px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: auto;
                  ">!</div>
                `
                : ''
              }
              </div>
              
              <!-- Content rows -->
              <div style="padding: 0 16px 12px 16px;">
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 6px;
                  padding: 4px 0;
                ">
                  <span style="
                    font-weight: 600;
                    color: #4a5568;
                    font-size: 13px;
                  ">Classification:</span>
                  <span style="
                    font-weight: 500;
                    color: #1a202c;
                    padding: 2px 8px;
                    background-color: ${classificationColor};
                    border-radius: 4px;
                    font-size: 13px;
                    ${parseInt(props.value) >= 4
                ? 'color: white;'
                : 'color: #1a202c;'
              }
                  ">${props.value || 'No data'}</span>
                </div>
                
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 6px;
                  padding: 4px 0;
                ">
                  <span style="
                    font-weight: 600;
                    color: #4a5568;
                    font-size: 13px;
                  ">Scenario:</span>
                  <span style="
                    font-weight: 500;
                    color: #1a202c;
                    font-size: 13px;
                  ">${props.scenario || 'No data'}</span>
                </div>
                
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 6px;
                  padding: 4px 0;
                ">
                  <span style="
                    font-weight: 600;
                    color: #4a5568;
                    font-size: 13px;
                  ">Projection End:</span>
                  <span style="
                    font-weight: 500;
                    color: #1a202c;
                    font-size: 13px;
                  ">${props.projection_end || 'No data'}</span>
                </div>
                
                ${hasAssistance
                ? `
                  <div style="
                    margin-top: 12px;
                    padding: 10px;
                    background-color: #fef5e7;
                    border: 1px solid #f6ad55;
                    border-radius: 6px;
                    font-size: 12px;
                    line-height: 1.4;
                  ">
                    <div style="
                      font-weight: 600;
                      color: #c05621;
                      margin-bottom: 4px;
                    ">⚠️ Food Assistance Impact:</div>
                    <div style="color: #744210;">
                      Would likely be at least one phase worse without current or planned assistance
                    </div>
                  </div>
                `
                : ''
              }
              </div>
            </div>
          `;

            new maplibregl.Popup({
              closeButton: true,
              closeOnClick: true,
              maxWidth: '300px',
              className: 'custom-popup',
            })
              .setLngLat(coordinates)
              .setHTML(popupContent)
              .addTo(map.current);
          });

          // Change cursor on hover
          map.current.on('mousemove', 'food-insecurity-points', () => {
            map.current.getCanvas().style.cursor = 'pointer';
          });

          map.current.on('mouseleave', 'food-insecurity-points', () => {
            map.current.getCanvas().style.cursor = '';
          });
        }

        console.log('✅ Food insecurity data added to map');
      } catch (error) {
        console.error('❌ Error adding food insecurity data:', error);
      }
    }
  }, [geoData, showGeoData]);

  // Add admin1 boundaries to map when data is loaded
  useEffect(() => {
    if (!map.current || !admin1BoundaryData) return;

    console.log('🗺️ Managing admin1 boundaries - Show:', showAdmin1Boundaries);

    // Remove existing admin1 layers if they exist
    if (map.current.getLayer('admin1-labels')) {
      map.current.removeLayer('admin1-labels');
    }
    if (map.current.getLayer('admin1-fill')) {
      map.current.removeLayer('admin1-fill');
    }
    if (map.current.getLayer('admin1-line')) {
      map.current.removeLayer('admin1-line');
    }
    if (map.current.getSource('admin1-boundaries')) {
      map.current.removeSource('admin1-boundaries');
    }

    // Only add layers if showAdmin1Boundaries is true
    if (showAdmin1Boundaries) {
      try {
        // Add admin1 source with generateId for feature-state
        map.current.addSource('admin1-boundaries', {
          type: 'geojson',
          data: admin1BoundaryData,
          generateId: true,
        });

        // Add admin1 fill layer with hover effect using feature-state
        map.current.addLayer({
          id: 'admin1-fill',
          type: 'fill',
          source: 'admin1-boundaries',
          paint: {
            'fill-color': 'rgba(133, 133, 133, 0.1)',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8, // Higher opacity on hover
              0.3, // Normal opacity
            ],
          },
        });

        // Add admin1 line layer
        map.current.addLayer({
          id: 'admin1-line',
          type: 'line',
          source: 'admin1-boundaries',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#555555', // Darker color on hover
              '#858585', // Normal color
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              3, // Thicker on hover
              2, // Normal width
            ],
            'line-opacity': 0.8,
          },
        });

        // Add admin1 labels
        map.current.addLayer({
          id: 'admin1-labels',
          type: 'symbol',
          source: 'admin1-boundaries',
          layout: {
            'text-field': ['get', 'ADMIN1'],
            'text-font': ['Open Sans Regular'],
            'text-size': 14,
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-max-width': 10,
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'symbol-placement': 'point',
          },
          paint: {
            'text-color': '#666666',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
            'text-opacity': 1,
          },
        });

        // Add hover effects using feature-state (same pattern as SelectionPanel)
        let hoveredAdmin1Id = null;

        map.current.on('mousemove', 'admin1-fill', e => {
          map.current.getCanvas().style.cursor = 'pointer';

          if (e.features.length > 0) {
            if (hoveredAdmin1Id !== null) {
              map.current.setFeatureState(
                { source: 'admin1-boundaries', id: hoveredAdmin1Id },
                { hover: false }
              );
            }
            hoveredAdmin1Id = e.features[0].id;
            map.current.setFeatureState(
              { source: 'admin1-boundaries', id: hoveredAdmin1Id },
              { hover: true }
            );
          }
        });

        map.current.on('mouseleave', 'admin1-fill', () => {
          map.current.getCanvas().style.cursor = '';

          if (hoveredAdmin1Id !== null) {
            map.current.setFeatureState(
              { source: 'admin1-boundaries', id: hoveredAdmin1Id },
              { hover: false }
            );
            hoveredAdmin1Id = null;
          }
        });

        console.log('✅ Admin1 boundaries and labels added to map');
      } catch (error) {
        console.error('❌ Error adding admin1 boundaries:', error);
      }
    }
  }, [admin1BoundaryData, showAdmin1Boundaries]);

  // Add admin2 boundaries to map when data is loaded
  useEffect(() => {
    if (!map.current || !admin2BoundaryData) return;

    console.log('🗺️ Managing admin2 boundaries - Show:', showAdmin2Boundaries);

    // Remove existing admin2 layers if they exist
    if (map.current.getLayer('admin2-labels')) {
      map.current.removeLayer('admin2-labels');
    }
    if (map.current.getLayer('admin2-fill')) {
      map.current.removeLayer('admin2-fill');
    }
    if (map.current.getLayer('admin2-line')) {
      map.current.removeLayer('admin2-line');
    }
    if (map.current.getSource('admin2-boundaries')) {
      map.current.removeSource('admin2-boundaries');
    }

    // Only add layers if showAdmin2Boundaries is true
    if (showAdmin2Boundaries) {
      try {
        // Filter admin2 data for current country
        const countryCode = state.geoID?.id;
        const iso2Code = getISO2FromISO3(countryCode);

        if (!iso2Code) {
          console.warn('No ISO2 code found for country:', countryCode);
          return;
        }

        // Filter features for the current country
        const filteredAdmin2Features = admin2BoundaryData.features.filter(
          feature => feature.properties.COUNTRY === iso2Code
        );

        if (filteredAdmin2Features.length === 0) {
          console.warn('No admin2 boundaries found for country:', countryCode, 'ISO2:', iso2Code);
          return;
        }

        const currentCountryAdmin2Data = {
          ...admin2BoundaryData,
          features: filteredAdmin2Features,
        };

        // Add admin2 source with generateId for feature-state
        map.current.addSource('admin2-boundaries', {
          type: 'geojson',
          data: currentCountryAdmin2Data,
          generateId: true,
        });

        // Add admin2 fill layer with hover effect using feature-state
        map.current.addLayer({
          id: 'admin2-fill',
          type: 'fill',
          source: 'admin2-boundaries',
          paint: {
            'fill-color': 'rgba(0, 102, 204, 0.05)',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.7, // Higher opacity on hover
              0.2, // Normal opacity
            ],
          },
        });

        // Add admin2 line layer with hover effect
        map.current.addLayer({
          id: 'admin2-line',
          type: 'line',
          source: 'admin2-boundaries',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#004499', // Darker blue on hover
              '#0066cc', // Normal blue
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              2, // Thicker on hover
              1, // Normal width
            ],
            'line-opacity': 0.6,
          },
        });

        // Add admin2 labels
        map.current.addLayer({
          id: 'admin2-labels',
          type: 'symbol',
          source: 'admin2-boundaries',
          layout: {
            'text-field': ['get', 'ADMIN2'],
            'text-font': ['Open Sans Regular'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-justify': 'center',
            'text-max-width': 8,
            'text-allow-overlap': false,
            'text-ignore-placement': false,
            'symbol-placement': 'point',
          },
          paint: {
            'text-color': '#0066cc',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
            'text-opacity': 1,
          },
        });

        // Add hover effects using feature-state
        let hoveredAdmin2Id = null;

        map.current.on('mousemove', 'admin2-fill', e => {
          map.current.getCanvas().style.cursor = 'pointer';

          if (e.features.length > 0) {
            if (hoveredAdmin2Id !== null) {
              map.current.setFeatureState(
                { source: 'admin2-boundaries', id: hoveredAdmin2Id },
                { hover: false }
              );
            }
            hoveredAdmin2Id = e.features[0].id;
            map.current.setFeatureState(
              { source: 'admin2-boundaries', id: hoveredAdmin2Id },
              { hover: true }
            );
          }
        });

        map.current.on('mouseleave', 'admin2-fill', () => {
          map.current.getCanvas().style.cursor = '';

          if (hoveredAdmin2Id !== null) {
            map.current.setFeatureState(
              { source: 'admin2-boundaries', id: hoveredAdmin2Id },
              { hover: false }
            );
            hoveredAdmin2Id = null;
          }
        });

        console.log('✅ Admin2 boundaries and labels added to map for country:', countryCode, 'Features:', filteredAdmin2Features.length);
      } catch (error) {
        console.error('❌ Error adding admin2 boundaries:', error);
      }
    }
  }, [admin2BoundaryData, showAdmin2Boundaries, state.geoID?.id]);

  // Add livelihood zones to map when data is loaded
  useEffect(() => {
    if (!map.current || !livelihoodZoneData) return;

    console.log('🗺️ Managing livelihood zones - Show:', showLivelihoodZones);

    // Remove existing livelihood zone layers if they exist
    if (map.current.getLayer('livelihood-fill')) {
      map.current.removeLayer('livelihood-fill');
    }
    if (map.current.getLayer('livelihood-line')) {
      map.current.removeLayer('livelihood-line');
    }
    if (map.current.getSource('livelihood-zones')) {
      map.current.removeSource('livelihood-zones');
    }

    // Only add layers if showLivelihoodZones is true
    if (showLivelihoodZones) {
      try {
        // Add livelihood zone source with generateId for feature-state
        map.current.addSource('livelihood-zones', {
          type: 'geojson',
          data: livelihoodZoneData,
          generateId: true,
        });

        // Add livelihood zone fill layer with hover effect
        map.current.addLayer({
          id: 'livelihood-fill',
          type: 'fill',
          source: 'livelihood-zones',
          paint: {
            'fill-color': 'rgba(34, 139, 34, 0.15)',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.8, // Higher opacity on hover
              1.0, // Normal opacity
            ],
          },
        });

        // Add livelihood zone line layer with hover effect
        map.current.addLayer({
          id: 'livelihood-line',
          type: 'line',
          source: 'livelihood-zones',
          paint: {
            'line-color': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              '#1a6b1a', // Darker green on hover
              '#228B22', // Normal forest green
            ],
            'line-width': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              3, // Thicker on hover
              2, // Normal width
            ],
            'line-opacity': 0.9,
            'line-dasharray': [8, 4],
          },
        });

        // Add hover effects using feature-state
        let hoveredLivelihoodId = null;

        map.current.on('mousemove', 'livelihood-fill', e => {
          map.current.getCanvas().style.cursor = 'pointer';

          if (e.features.length > 0) {
            if (hoveredLivelihoodId !== null) {
              map.current.setFeatureState(
                { source: 'livelihood-zones', id: hoveredLivelihoodId },
                { hover: false }
              );
            }
            hoveredLivelihoodId = e.features[0].id;
            map.current.setFeatureState(
              { source: 'livelihood-zones', id: hoveredLivelihoodId },
              { hover: true }
            );
          }
        });

        map.current.on('mouseleave', 'livelihood-fill', () => {
          map.current.getCanvas().style.cursor = '';

          if (hoveredLivelihoodId !== null) {
            map.current.setFeatureState(
              { source: 'livelihood-zones', id: hoveredLivelihoodId },
              { hover: false }
            );
            hoveredLivelihoodId = null;
          }
        });

        console.log('✅ Livelihood zones added to map');
      } catch (error) {
        console.error('❌ Error adding livelihood zones:', error);
      }
    }
  }, [livelihoodZoneData, showLivelihoodZones]);

  // Effect to filter data when scenario changes
  useEffect(() => {
    if (rawGeoData && selectedScenario) {
      const { filteredGeoData, filteredFeatures } = filterDataByScenario(
        rawGeoData,
        selectedScenario
      );
      setGeoData(filteredGeoData);
      setngLHZIPCData(filteredFeatures);

      // Extract projection_end from the filtered features
      if (filteredFeatures.length > 0) {
        const projectionEnd = filteredFeatures[0].properties.projection_end;
        setCurrentProjectionEnd(projectionEnd);
      } else {
        setCurrentProjectionEnd('');
      }
    }
  }, [rawGeoData, selectedScenario]);

  // Fetch food insecurity data and boundary data
  useEffect(() => {
    if (!isCountrySupported) return;

    const countryCode = state.geoID?.id;

    if (!countryCode) {
      setAdmin1BoundaryData(null);
      setAdmin2BoundaryData(null);
      setLivelihoodZoneData(null);
      setRawGeoData(null);
      setGeoData(null);
      setSelectedFeatureInfo(null); // Clear feature info
      setChartData([]); // Clear chart data
      // Clear marker when country changes
      if (marker) {
        marker.remove();
        setMarker(null);
      }
      setMarkerCoordinates(null);
      setLoading(false);
      setEssentialLayersLoading(false); // Add this line
      return;
    }

    // Reset visibility states when country changes
    setShowAdmin1Boundaries(true);
    setShowAdmin2Boundaries(false);
    setShowLivelihoodZones(false);
    setShowGeoData(true);
    setLivelihoodZoneError(null);
    setLivelihoodZoneData(null);
    // Clear feature info and chart data when country changes
    setSelectedFeatureInfo(null);
    setChartData([]);
    // Clear marker when country changes
    if (marker) {
      marker.remove();
      setMarker(null);
    }
    setMarkerCoordinates(null);

    console.log('🔄 Fetching data for country:', countryCode);
    setLoading(true);
    setEssentialLayersLoading(true); // Add this line

    const fetchAllData = async () => {
      try {
        const apiKey = await getHarvestPortalKey();
        const iso2Code = getISO2FromISO3(countryCode);

        // Fetch food insecurity data if available
        if (countryResourceMap[countryCode]) {
          const resourceId = countryResourceMap[countryCode];
          const resourceResponse = await fetch(
            `https://data.harvestportal.org/api/action/resource_show?id=${resourceId}`,
            {
              headers: {
                Authorization: apiKey,
              },
            }
          );
          const resourceData = await resourceResponse.json();

          if (resourceData.success) {
            const dataResponse = await fetch(resourceData.result.url, {
              headers: {
                Authorization: apiKey,
              },
            });
            const geoJsonData = await dataResponse.json();

            // Store raw data
            setRawGeoData(geoJsonData);

            // Extract available scenarios
            const scenarios = extractAvailableScenarios(geoJsonData);
            setAvailableScenarios(scenarios);

            // Find the best scenario using fallback logic
            const bestScenario = findBestScenario(geoJsonData);

            if (bestScenario) {
              setSelectedScenario(bestScenario);
            } else {
              console.warn('No valid scenarios found in data');
              setGeoData(null);
              setngLHZIPCData([]);
            }
          }
        }

        // Fetch Admin1 boundary data
        if (iso2Code) {
          setAdmin2Loading(true); // Start loading

          const admin1Response = await fetch(
            `https://data.harvestportal.org/api/action/resource_show?id=${ADMIN1_BOUNDARY_RESOURCE_ID}`,
            {
              headers: {
                Authorization: apiKey,
              },
            }
          );
          const admin1Data = await admin1Response.json();

          if (admin1Data.success) {
            const admin1GeoJsonResponse = await fetch(admin1Data.result.url, {
              headers: {
                Authorization: apiKey,
              },
            });
            const admin1GeoJsonData = await admin1GeoJsonResponse.json();

            // Filter admin1 features for the country
            if (admin1GeoJsonData && admin1GeoJsonData.features) {
              const filteredAdmin1Features = admin1GeoJsonData.features.filter(
                feature => feature.properties.COUNTRY === iso2Code
              );

              if (filteredAdmin1Features.length > 0) {
                const filteredAdmin1GeoJson = {
                  ...admin1GeoJsonData,
                  features: filteredAdmin1Features,
                };
                setAdmin1BoundaryData(filteredAdmin1GeoJson);

                // Auto-fit bounds to admin1 data
                const bounds = new maplibregl.LngLatBounds();
                filteredAdmin1Features.forEach(feature => {
                  if (feature.geometry.type === 'Polygon') {
                    feature.geometry.coordinates[0].forEach(coord => {
                      bounds.extend(coord);
                    });
                  } else if (feature.geometry.type === 'MultiPolygon') {
                    feature.geometry.coordinates.forEach(polygon => {
                      polygon[0].forEach(coord => {
                        bounds.extend(coord);
                      });
                    });
                  }
                });

                if (!bounds.isEmpty() && map.current) {
                  map.current.fitBounds(bounds, {
                    padding: { top: 50, bottom: 50, left: 50, right: 50 },
                  });
                }
              }
            }
          }

          // Fetch Admin2 boundary data
          const admin2Response = await fetch(
            `https://data.harvestportal.org/api/action/resource_show?id=${ADMIN2_BOUNDARY_RESOURCE_ID}`,
            {
              headers: {
                Authorization: apiKey,
              },
            }
          );
          const admin2Data = await admin2Response.json();

          if (admin2Data.success) {
            const admin2GeoJsonResponse = await fetch(admin2Data.result.url, {
              headers: {
                Authorization: apiKey,
              },
            });
            const admin2GeoJsonData = await admin2GeoJsonResponse.json();

            // Filter admin2 features for the country
            if (admin2GeoJsonData && admin2GeoJsonData.features) {
              const filteredAdmin2Features = admin2GeoJsonData.features.filter(
                feature => feature.properties.COUNTRY === iso2Code
              );

              if (filteredAdmin2Features.length > 0) {
                const filteredAdmin2GeoJson = {
                  ...admin2GeoJsonData,
                  features: filteredAdmin2Features,
                };
                setAdmin2BoundaryData(filteredAdmin2GeoJson);
              }
            }
          }
          setAdmin2Loading(false); // End loading

        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        setAdmin2Loading(false); // End loading on error

      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [state.geoID?.id, isCountrySupported]);

  // Add map click handler for feature info
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = e => {
      // Always remove existing marker first to ensure only one marker exists
      if (marker) {
        marker.remove();
        setMarker(null);
      }

      // Create or update marker position
      const clickCoordinates = [e.lngLat.lng, e.lngLat.lat];
      setMarkerCoordinates(clickCoordinates);

      // Create new draggable marker
      const newMarker = new maplibregl.Marker({
        draggable: true,
        color: '#4FD1C5' // Orange color to match the chart theme
      })
        .setLngLat(clickCoordinates)
        .addTo(map.current);

      // Handle marker drag events
      const onDragEnd = () => {
        const lngLat = newMarker.getLngLat();
        const newCoordinates = [lngLat.lng, lngLat.lat];
        setMarkerCoordinates(newCoordinates);

        // Fetch chart data for new marker position if chart is visible
        if (showIPCChart && state.geoID?.id) {
          fetchChartData(lngLat.lat, lngLat.lng, selectedScenario, state.geoID.id);
        }
      };

      newMarker.on('dragend', onDragEnd);
      setMarker(newMarker);

      // Always fetch chart data first if IPC chart is visible, regardless of features
      if (showIPCChart && state.geoID?.id) {
        fetchChartData(e.lngLat.lat, e.lngLat.lng, selectedScenario, state.geoID.id);
      }

      // Build array of layers to query based on what's currently visible
      const layersToQuery = [];

      if (showAdmin1Boundaries) layersToQuery.push('admin1-fill');
      if (showGeoData) layersToQuery.push('food-insecurity-fill');
      if (showAdmin2Boundaries) layersToQuery.push('admin2-fill');
      if (showLivelihoodZones) layersToQuery.push('livelihood-fill');

      // Query features at the clicked point for only visible layers
      const features = layersToQuery.length > 0 ?
        map.current.queryRenderedFeatures(e.point, { layers: layersToQuery }) : [];

      if (features.length > 0) {
        // Separate features by type
        const admin1Feature = features.find(f => f.layer.id === 'admin1-fill');
        const foodInsecurityFeature = features.find(f => f.layer.id === 'food-insecurity-fill');
        const admin2Feature = features.find(f => f.layer.id === 'admin2-fill');
        const livelihoodFeature = features.find(f => f.layer.id === 'livelihood-fill');

        // Use the first feature as the primary feature (admin1 takes precedence if both exist)
        const primaryFeature = admin1Feature || foodInsecurityFeature || admin2Feature || livelihoodFeature || features[0];

        setSelectedFeatureInfo({
          admin1: primaryFeature.properties.ADMIN1 || 'N/A',
          properties: primaryFeature.properties,
          coordinates: clickCoordinates,
          scenario: selectedScenario,
          // Add food insecurity data if available and layer is visible
          foodInsecurity: (showGeoData && foodInsecurityFeature) ? {
            value: foodInsecurityFeature.properties.value,
            scenario: foodInsecurityFeature.properties.scenario,
            projectionEnd: foodInsecurityFeature.properties.projection_end,
            unitType: foodInsecurityFeature.properties.unit_type,
          } : null,
          // Add admin2 data if available and layer is visible
          admin2: (showAdmin2Boundaries && admin2Feature) ? {
            name: admin2Feature.properties.ADMIN2,
            id: admin2Feature.id,
          } : null,
          // Add livelihood zone data if available and layer is visible
          livelihoodZone: (showLivelihoodZones && livelihoodFeature) ? {
            name: livelihoodFeature.properties.name,
            fullName: livelihoodFeature.properties.full_name,
            id: livelihoodFeature.id,
          } : null,
        });

        // Open the feature info panel if it's closed
        if (!isFeatureInfoOpen) {
          toggleFeatureInfo();
        }
      } else {
        // If clicking on area with no features, still create marker but clear feature selection
        setSelectedFeatureInfo({
          admin1: 'No Admin1 Data',
          properties: {},
          coordinates: clickCoordinates,
          scenario: selectedScenario,
          foodInsecurity: null,
          admin2: null,
          livelihoodZone: null,
        });
      }
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
      // Don't remove marker here - marker should persist across state changes
    };
  }, [
    toggleFeatureInfo,
    selectedScenario,
    showAdmin1Boundaries,
    showGeoData,
    showAdmin2Boundaries,
    showLivelihoodZones,
    showIPCChart,
    state.geoID?.id,
    marker  // Keep marker in dependencies to handle marker updates
  ]);


  useEffect(() => {
    // Stop loading when we have both default layer data (regardless of main loading state)
    if (admin1BoundaryData && geoData) {
      setEssentialLayersLoading(false);
    }
  }, [admin1BoundaryData, geoData]);

  // Add a separate cleanup effect for component unmount only:
  useEffect(() => {
    return () => {
      // Clean up marker only when component unmounts
      if (marker) {
        marker.remove();
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Get initial height from ciInitialLayout
  const initialHeight = useMemo(() => {
    const item = ciInitialLayout.find(item => item.i === componentId);
    if (!item) {
      throw new Error(`Component ${componentId} not found in ciInitialLayout`);
    }
    return item.h;
  }, [componentId]);
  // Dispatch height updates when data changes
  // Update the height dispatch effect around line 1625:

  useEffect(() => {
    if (initialHeight) { // Remove isCountrySupported from this condition
      const isUsingXSLayout = windowWidth < 1500;

      let newHeight;
      if (isUsingXSLayout) {
        // Use fixed height for XS layout
        newHeight = 14;
      } else {
        // Use dynamic height for larger screens based on country support
        newHeight = isCountrySupported ? initialHeight : 4;
      }

      dispatch({
        type: 'UPDATE_COMPONENT_HEIGHT',
        payload: { componentId, height: newHeight },
      });
    }
  }, [isCountrySupported, dispatch, initialHeight, windowWidth]); // Keep isCountrySupported in dependencies
  // Add function to fetch chart data

const fetchChartData = async (lat, lng, scenario) => {
  try {
    setChartLoading(true);

    // Format latlon as a single string that won't get double-encoded
    const latlonString = `${lat},${lng}`;

    //change scenatio={scenario} to scenario=CS to always get current scenario which reflects historical actual
    const restOperation = get({
      apiName: 'SupplyChainsApi',
      path: `/supplyChainsApi/fews-api?api_name=ipcphase.json&scenario=cs&show_ipc_only=True&latlon=${latlonString}&fields=geographic_unit_name,period_date,value,scenario,description,unit_type`,
    });

    const restOperationResponse = await restOperation.response;
    const responseBody = await restOperationResponse.body.json();

    let ipcData = null;
    if (responseBody?.success && responseBody?.value) {
      ipcData = responseBody.value;
    } else {
      ipcData = responseBody;
    }

    if (ipcData && Array.isArray(ipcData)) {
      // Transform data for chart
      const transformedData = ipcData
        .map(item => {
          if (item.projection_end) {
            const date = new Date(item.projection_end);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'short' });
            return {
              period: `${year}-${month}`,
              value: item.value,
              description: item.description,
              fullDate: item.projection_end,
              sortDate: date.getTime(),
              geographicUnit: item.geographic_unit_name,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => a.sortDate - b.sortDate);

      // Remove duplicates by keeping only the latest entry for each unique projection_end date
      const uniqueData = [];
      const seenDates = new Set();
      
      // Process in reverse order (latest first) to keep the most recent entry for each date
      for (let i = transformedData.length - 1; i >= 0; i--) {
        const item = transformedData[i];
        if (!seenDates.has(item.fullDate)) {
          seenDates.add(item.fullDate);
          uniqueData.unshift(item); // Add to beginning to maintain chronological order
        }
      }

      // Take the last 20 unique data points (most recent)
      const finalData = uniqueData.slice(-20);
      
      setChartData(finalData);
    } else {
      setChartData([]);
    }
  } catch (error) {
    console.error('❌ Error fetching chart data:', error);
    setChartData([]);
  } finally {
    setChartLoading(false);
  }
};
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const colors = {
        1: '#cdf5ca',
        2: '#f9e63b',
        3: '#e17b26',
        4: '#cc381d',
        5: '#651709'
      };
      const descriptions = {
        1: 'Minimal',
        2: 'Stressed',
        3: 'Crisis',
        4: 'Emergency',
        5: 'Famine'
      };

      const color = colors[data.value] || '#e17b26';
      const description = descriptions[data.value] || data.description;

      return (
        <Box
          bg="white"
          p={3}
          borderRadius="md"
          boxShadow="lg"
          border="1px solid"
          borderColor="gray.200"
        >
          <HStack spacing={2} mb={2}>
            <Box
              width="12px"
              height="12px"
              borderRadius="50%"
              bg={color}
              border="2px solid"
              borderColor={data.value >= 4 ? 'white' : 'black'}
            />
            <Text fontSize="sm" fontWeight="bold">
              {label}
            </Text>
          </HStack>
          <Text fontSize="sm" color="gray.600" mb={1}>
            Classification: {data.value} - {description}
          </Text>
          <Text fontSize="xs" color="gray.500">
            Date: {data.fullDate}
          </Text>
          {data.geographicUnit && (
            <Text fontSize="xs" color="gray.500">
              Geographic unit: {data.geographicUnit}
            </Text>
          )}
        </Box>
      );
    }
    return null;
  };


  if (!countryResourceMap[state.geoID?.id]) {
    return (
      <Container maxW="container.xl" py={4}>
        <Text fontSize="md" color="gray.500" textAlign="center">
          No FEWS NET Acute Food Insecurity data found for {state.geoID?.label}
        </Text>
        <Box paddingRight={2} paddingTop={2} textAlign="right" fontSize="sm">
          Source:{' '}
          <Link href="https://fews.net/data/acute-food-insecurity" isExternal>
            FEWS NET
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Box p={4} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <VStack spacing={1} align="left">
         <Heading size="md" mb={3} >
                   <Badge variant="subtle" colorScheme="green" fontSize="xl">
                     {state.geoID?.label}
                   </Badge>{" "}
                   - FEWS NET Acute Food Insecurity
                 </Heading>

        {currentProjectionEnd && selectedScenario && (
          <Text fontSize="sm" color="gray.600" fontWeight="normal">
            {getScenarioDisplayName(selectedScenario)} - Through{' '}
            {currentProjectionEnd}
          </Text>
        )}
        <VStack spacing={2} align="left">
          <VStack
            spacing={2}
            align="left"
            justify="space-between"
            width="100%"
            paddingY={2}
          >
            {/* Scenario Selector */}
            {availableScenarios.length > 0 && (
              <Select
                value={selectedScenario}
                onChange={handleScenarioChange}
                size="sm"
                width="250px"
                className="noDrag"
              >
                {availableScenarios.map(scenario => (
                  <option key={scenario} value={scenario}>
                    {getScenarioDisplayName(scenario)}
                  </option>
                ))}
              </Select>
            )}

            {/* Layer Controls */}
            <HStack alignItems="center" paddingY={2} spacing={2} wrap="wrap">
              <Checkbox
                className="noDrag"
                size="md"
                onChange={toggleGeoData}
                isChecked={showGeoData}
              >
                <HStack spacing={1} alignItems="center">
                  <Text fontSize={{ base: 'xs', xl: 'xs' }}>
                    Food Insecurity Classification
                  </Text>
                  {essentialLayersLoading && (
                    <Spinner size="xs" color="teal.500" thickness="2px" />
                  )}
                </HStack>
              </Checkbox>

              <Tooltip
                label={
                  livelihoodZoneError || 'Toggle livelihood zone boundaries'
                }
                placement="top"
                hasArrow
                bg={livelihoodZoneError ? 'red.500' : 'gray.700'}
                color="white"
                isDisabled={!livelihoodZoneError && !livelihoodZoneLoading}
              >
                <Checkbox
                  className="noDrag"
                  size="md"
                  onChange={toggleLivelihoodZones}
                  isChecked={showLivelihoodZones}
                  isDisabled={!!livelihoodZoneError}
                  opacity={livelihoodZoneError ? 0.4 : 1}
                  cursor={livelihoodZoneError ? 'not-allowed' : 'pointer'}
                >
                  <HStack spacing={1} alignItems="center">
                    <Text
                      fontSize={{ base: 'xs', xl: 'xs' }}
                      color={livelihoodZoneError ? 'gray.400' : 'inherit'}
                    >
                      Livelihood Zones
                    </Text>
                    {livelihoodZoneLoading && (
                      <Spinner size="xs" color="teal.500" thickness="2px" />
                    )}
                    {livelihoodZoneError && (
                      <Text fontSize="xs" color="red.500">
                        ⚠️
                      </Text>
                    )}
                  </HStack>
                </Checkbox>
              </Tooltip>

              <Checkbox
                className="noDrag"
                size="md"
                onChange={toggleAdmin1Boundaries}
                isChecked={showAdmin1Boundaries}
              >
                <HStack spacing={1} alignItems="center">
                  <Text fontSize={{ base: 'xs', xl: 'xs' }}>
                    Admin1 Boundaries
                  </Text>
                  {essentialLayersLoading && (
                    <Spinner size="xs" color="teal.500" thickness="2px" />
                  )}
                </HStack>
              </Checkbox>

              <Checkbox
                className="noDrag"
                size="md"
                onChange={toggleAdmin2Boundaries}
                isChecked={showAdmin2Boundaries}
              >
                <HStack spacing={1} alignItems="center">
                  <Text fontSize={{ base: 'xs', xl: 'xs' }}>
                    Admin2 Boundaries
                  </Text>
                  {admin2Loading && (
                    <Spinner size="xs" color="teal.500" thickness="2px" />
                  )}
                </HStack>
              </Checkbox>
              <HStack
                display={{ base: 'flex', lg: 'flex' }}
                justifyContent="flex-end"
                width="100%"
              >
                {/* Clear Marker Button */}
                {marker && (
                  <Button
                    className="noDrag"
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    onClick={clearMarker}
                    rightIcon={<FaTrash/>}                                              
                  >
                    Clear Marker
                  </Button>
                )}

                {/* IPC Chart Button - Only visible on larger screens */}
                <Button
                  className="noDrag"
                  size="sm"
                  colorScheme="teal"
                  variant={showIPCChart ? "solid" : "outline"}
                  onClick={toggleIPCChart}
                  display={{ base: 'flex', lg: 'flex' }}
                  ml={2}
                  rightIcon={showIPCChart ? (
                    <FaEyeSlash ml={1} />
                  ) : (
                    <FaEye ml={1} />
                  )}
                >
                  Historic IPC Chart
                </Button>
              </HStack>
            </HStack>


          </VStack>
        </VStack>
      </VStack>

      {/* Map Container with Legend Inside */}
      {/* Map Container with Grid Layout */}
      <Grid
        templateColumns={showIPCChart ? { base: "1fr", lg: "65% 35%" } : "1fr"}
        templateRows={showIPCChart ? { base: "auto auto", lg: "1fr" } : "1fr"}
        gap={4}
        width="100%"
        minHeight="500px"
        className='noDrag'
        paddingX={5}
        paddingY={2}
      >
        {/* Map Column */}
        <GridItem>
          <Box position="relative" width="100%" height={{ base: "400px", lg: "500px" }} minHeight="400px">
            {/* Map */}
            <Box
              className="noDrag"
              ref={mapContainer}
              width="100%"
              height="100%"
              paddingX={2}
            />

            {/* Loading Overlay */}
            {essentialLayersLoading && (
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(255, 255, 255, 0.8)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                zIndex={999}
                borderRadius="md"
              >
                <VStack spacing={3}>
                  <Spinner size="xl" color="teal.500" thickness="4px" />
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    Loading map data...
                  </Text>
                </VStack>
              </Box>
            )}

            {/* Legend - Positioned within map container */}
            <Box
              className="noDrag"
              position="absolute"
              top={4}
              right={4}
              zIndex={1000}
              bg="rgba(255,255,255,0.95)"
              borderRadius="md"
              boxShadow="lg"
              maxWidth={{ base: '280px', lg: '250px' }}
              minWidth="200px"
            >
              {/* Legend Header with Toggle Button */}
              <HStack
                justify="space-between"
                align="center"
                p={3}
                borderBottom={isLegendOpen ? '1px solid' : 'none'}
                borderColor="gray.200"
              >
                <Text fontSize="sm" fontWeight="bold" color="teal.500">
                  Legend
                </Text>
                <IconButton
                  aria-label={isLegendOpen ? 'Hide legend' : 'Show legend'}
                  icon={isLegendOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={toggleLegend}
                />
              </HStack>

              {/* Legend Content */}
              <Collapse in={isLegendOpen} animateOpacity>
                <Box p={4}>
                  <Text fontSize="sm" fontWeight="bold" mb={3} color="teal.500">
                    IPC 3.1 Acute Food Insecurity Classification
                  </Text>
                  <VStack spacing={2} align="left">
                    <HStack spacing={2}>
                      <Box
                        w={{ base: '16px', lg: '20px' }}
                        h={{ base: '16px', lg: '20px' }}
                        bg="#cdf5ca"
                        borderRadius="sm"
                      />
                      <Text fontSize={{ base: 'xs', lg: 'sm' }}>1: Minimal</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box
                        w={{ base: '16px', lg: '20px' }}
                        h={{ base: '16px', lg: '20px' }}
                        bg="#f9e63b"
                        borderRadius="sm"
                      />
                      <Text fontSize={{ base: 'xs', lg: 'sm' }}>2: Stressed</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box
                        w={{ base: '16px', lg: '20px' }}
                        h={{ base: '16px', lg: '20px' }}
                        bg="#e17b26"
                        borderRadius="sm"
                      />
                      <Text fontSize={{ base: 'xs', lg: 'sm' }}>3: Crisis</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box
                        w={{ base: '16px', lg: '20px' }}
                        h={{ base: '16px', lg: '20px' }}
                        bg="#cc381d"
                        borderRadius="sm"
                      />
                      <Text fontSize={{ base: 'xs', lg: 'sm' }}>4: Emergency</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Box
                        w={{ base: '16px', lg: '20px' }}
                        h={{ base: '16px', lg: '20px' }}
                        bg="#651709"
                        borderRadius="sm"
                      />
                      <Text fontSize={{ base: 'xs', lg: 'sm' }}>5: Famine</Text>
                    </HStack>
                  </VStack>
                </Box>
              </Collapse>
            </Box>

            {/* Feature Info Panel - Positioned at bottom right */}
            <Box
              className="noDrag"
              position="absolute"
              bottom={4}
              right={4}
              zIndex={1000}
              bg="rgba(255,255,255,0.95)"
              borderRadius="md"
              boxShadow="lg"
              maxWidth={{ base: '320px', lg: '300px' }}
              minWidth="250px"
              maxHeight="300px"
            >
              {/* Feature Info Header with Toggle Button */}
              <HStack
                justify="space-between"
                align="center"
                p={3}
                borderBottom={isFeatureInfoOpen ? '1px solid' : 'none'}
                borderColor="gray.200"
              >
                <Text fontSize="sm" fontWeight="bold" color="blue.500">
                  Feature Info
                </Text>
                <IconButton
                  aria-label={
                    isFeatureInfoOpen ? 'Hide feature info' : 'Show feature info'
                  }
                  icon={isFeatureInfoOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={toggleFeatureInfo}
                />
              </HStack>

              {/* Feature Info Content */}
              <Collapse in={isFeatureInfoOpen} animateOpacity>
                <Box p={4} maxHeight="250px" overflowY="auto">
                  {selectedFeatureInfo ? (
                    <VStack spacing={2} align="start">
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="blue.600"
                          mb={2}
                        >
                          Administrative Level 1
                        </Text>
                        <Box
                          bg="gray.50"
                          p={3}
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                        >
                          <Text
                            fontSize="md"
                            fontWeight="semibold"
                            color="gray.800"
                          >
                            {selectedFeatureInfo.admin1}
                          </Text>
                          <Text fontSize="xs" color="gray.500" fontFamily="mono">
                            {selectedFeatureInfo.scenario}
                          </Text>
                        </Box>
                      </Box>

                      {/* Food Insecurity Classification Section */}
                      {selectedFeatureInfo.foodInsecurity && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="orange.600"
                            mb={2}
                          >
                            Food Insecurity Classification
                          </Text>
                          <Box
                            bg="orange.50"
                            p={3}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="orange.200"
                          >
                            <HStack justify="space-between" mb={2}>
                              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                                {selectedFeatureInfo.foodInsecurity.scenario} - Classification:
                              </Text>
                              <Box
                                px={2}
                                py={1}
                                borderRadius="md"
                                bg={
                                  selectedFeatureInfo.foodInsecurity.value === 1 ? '#cdf5ca' :
                                    selectedFeatureInfo.foodInsecurity.value === 2 ? '#f9e63b' :
                                      selectedFeatureInfo.foodInsecurity.value === 3 ? '#e17b26' :
                                        selectedFeatureInfo.foodInsecurity.value === 4 ? '#cc381d' :
                                          selectedFeatureInfo.foodInsecurity.value === 5 ? '#651709' :
                                            '#cccccc'
                                }
                                color={
                                  selectedFeatureInfo.foodInsecurity.value >= 4 ? 'white' : 'black'
                                }
                              >
                                <Text fontSize="sm" fontWeight="bold">
                                  {selectedFeatureInfo.foodInsecurity.value}
                                </Text>
                              </Box>
                            </HStack>
                            {selectedFeatureInfo.foodInsecurity.projectionEnd && (
                              <Text fontSize="xs" color="gray.600">
                                Through: {selectedFeatureInfo.foodInsecurity.projectionEnd}
                              </Text>
                            )}
                          </Box>
                        </Box>
                      )}
                      {/* Admin2 Boundary Info */}
                      {selectedFeatureInfo.admin2 && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="purple.600"
                            mb={2}
                          >
                            Admin2 Boundary
                          </Text>
                          <Box
                            bg="purple.50"
                            p={3}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="purple.200"
                          >
                            <Text fontSize="md" fontWeight="semibold" color="gray.800">
                              {selectedFeatureInfo.admin2.name || 'N/A'}
                            </Text>
                            <Text fontSize="xs" color="gray.500" fontFamily="mono">
                              ID: {selectedFeatureInfo.admin2.id || 'N/A'}
                            </Text>
                          </Box>
                        </Box>
                      )}

                      {/* Livelihood Zone Info */}
                      {selectedFeatureInfo.livelihoodZone && (
                        <Box>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="green.600"
                            mb={2}
                          >
                            Livelihood Zone
                          </Text>
                          <Box
                            bg="green.50"
                            p={3}
                            borderRadius="md"
                            border="1px solid"
                            borderColor="green.200"
                          >
                            <Text fontSize="md" fontWeight="semibold" color="gray.800">
                              {selectedFeatureInfo.livelihoodZone.name || 'N/A'}
                            </Text>
                            <Text fontSize="xs" color="gray.500" fontFamily="mono">
                              ID: {selectedFeatureInfo.livelihoodZone.id || 'N/A'}
                            </Text>
                          </Box>
                        </Box>
                      )}

                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="gray.600"
                          mb={2}
                        >
                          Coordinates
                        </Text>
                        <Text fontSize="xs" color="gray.500" fontFamily="mono">
                          {selectedFeatureInfo.coordinates[1].toFixed(4)}°,{' '}
                          {selectedFeatureInfo.coordinates[0].toFixed(4)}°
                        </Text>
                      </Box>

                      {/* Additional properties table */}
                      {selectedFeatureInfo.properties &&
                        Object.keys(selectedFeatureInfo.properties).length > 0 && (
                          <Box width="100%">
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              color="gray.600"
                              mb={2}
                            >
                              Properties
                            </Text>
                            <Box
                              bg="gray.50"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                              maxHeight="120px"
                              overflowY="auto"
                            >
                              <VStack spacing={0} align="stretch">
                                {Object.entries(selectedFeatureInfo.properties)
                                  .filter(([key]) => key !== 'ADMIN1') // Don't duplicate ADMIN1
                                  .map(([key, value], index) => (
                                    <HStack
                                      key={key}
                                      justify="space-between"
                                      p={2}
                                      bg={index % 2 === 0 ? 'white' : 'gray.50'}
                                      fontSize="xs"
                                    >
                                      <Text
                                        fontWeight="medium"
                                        color="gray.600"
                                        minWidth="80px"
                                      >
                                        {key}:
                                      </Text>
                                      <Text
                                        color="gray.800"
                                        textAlign="right"
                                        wordBreak="break-word"
                                        maxWidth="150px"
                                      >
                                        {value || 'N/A'}
                                      </Text>
                                    </HStack>
                                  ))}
                              </VStack>
                            </Box>
                          </Box>
                        )}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Text fontSize="sm" color="gray.500">
                        Click on an Admin1 boundary or Food Insecurity area to view feature information
                      </Text>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Box>
          </Box>
        </GridItem>
        {/* Chart Column - Only shown when showIPCChart is true */}
        {showIPCChart && (
          <GridItem>
            <Box
              width="100%"
              height="500px"
              bg="white"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
              p={4}
              minWidth={450}
            >
              <VStack spacing={4} height="100%">
                <Box width="100%">
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" mb={1}>
                    Historic Assessed IPC Classification
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {selectedFeatureInfo ? (
                      selectedFeatureInfo.livelihoodZone?.name ?
                        `${selectedFeatureInfo.livelihoodZone.name} - Current Situation  ` :
                        `${selectedFeatureInfo.admin1 || ''} - Current Situation`
                    ) : 'Click on the map to view data'}
                  </Text>
                </Box>

                <Box flex="1" width="100%" minWidth={450}>
                  {chartLoading ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <VStack spacing={3}>
                        <Spinner size="lg" color="teal.500" thickness="3px" />
                        <Text fontSize="sm" color="gray.600">
                          Loading chart data...
                        </Text>
                      </VStack>
                    </Box>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={450}>
                      <LineChart
                        data={chartData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="period"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                          stroke="#4a5568"
                        />
                        <YAxis
                          domain={[1, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          fontSize={12}
                          stroke="#4a5568"
                          tickFormatter={(value) => {
                            const descriptions = {
                              1: 'Minimal',
                              2: 'Stressed',
                              3: 'Crisis',
                              4: 'Emergency',
                              5: 'Famine'
                            };
                            return `${value} - ${descriptions[value] || ''}`;
                          }}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#858585"
                          strokeWidth={3}
                          dot={(props) => {
                            const { cx, cy, payload } = props;
                            const colors = {
                              1: '#cdf5ca',
                              2: '#f9e63b',
                              3: '#e17b26',
                              4: '#cc381d',
                              5: '#651709'
                            };
                            const color = colors[payload.value] || '#e17b26';

                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={6}
                                fill={color}
                                stroke={payload.value >= 4 ? '#ffffff' : '#858585'}
                                strokeWidth={2}
                              />
                            );
                          }}
                          activeDot={(props) => {
                            const { cx, cy, payload } = props;
                            const colors = {
                              1: '#cdf5ca',
                              2: '#f9e63b',
                              3: '#e17b26',
                              4: '#cc381d',
                              5: '#651709'
                            };
                            const color = colors[payload.value] || '#e17b26';

                            return (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={8}
                                fill={color}
                                stroke="#ffffff"
                                strokeWidth={3}
                              />
                            );
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : selectedFeatureInfo ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      textAlign="center"
                    >
                      <VStack spacing={2}>
                        <Text fontSize="md" color="gray.500">
                          No historical data available
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          for this location and scenario
                        </Text>
                      </VStack>
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                      textAlign="center"
                    >
                      <VStack spacing={2}>
                        <Text fontSize="md" color="gray.500">
                          Click on the map to view
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                          IPC classification timeline
                        </Text>
                      </VStack>
                    </Box>
                  )}
                </Box>
              </VStack>
            </Box>
          </GridItem>
        )}
      </Grid>

      <Accordion allowToggle width="100%" className="noDrag">
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                More Information
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <VStack spacing={2} align="start">
              <Text>
                <strong>Important Note:</strong> Mapped boundaries do not imply
                official recognition or endorsement of any physical or political
                boundaries.
              </Text>

              <Text>
                FEWS NET's classifications are IPC-compatible. IPC-compatible
                analysis follows key IPC protocols but does not necessarily
                reflect the consensus of national food security partners.
              </Text>

              <Text>
                As of IPC 3.0, the IPC no longer assesses the impact of food
                assistance on classification and thus no longer maps the (! -{' '}
                <i>
                  {' '}
                  Would likely be at least one phase worse without current or
                  planned humanitarian food assistance{' '}
                </i>
                ). However, FEWS NET continues to produce food security maps
                inclusive of the (!) as well as maps compatible with IPC
                3.0/3.1, which include the mapping of food security assistance
                bags.
              </Text>

              <Text>
                FEWS NET and the IPC use different methods to estimate the total
                Population in Need of humanitarian food assistance and assess
                the risk of Famine. Learn more at{' '}
                <Link
                  href="https://www.fews.net/about"
                  isExternal
                  color="teal.500"
                >
                  www.fews.net/about
                </Link>
                .
              </Text>

              <Box>
                <Text fontWeight="semibold" mb={2}>
                  IPC Definition of Food Insecurity and Malnutrition:
                </Text>
                <Text>
                  Food insecurity found at a specific point in time and of a
                  severity that threatens lives or livelihoods, or both,
                  regardless of the causes, context or duration.
                </Text>
              </Box>

              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Food Insecurity Classification Levels:
                </Text>
                <OrderedList spacing={1} pl={4}>
                  <ListItem>Minimal</ListItem>
                  <ListItem>Stressed</ListItem>
                  <ListItem>Crisis</ListItem>
                  <ListItem>Emergency</ListItem>
                  <ListItem>Famine</ListItem>
                </OrderedList>
              </Box>

              <Box>
                <Link
                  href="https://www.ipcinfo.org/fileadmin/user_upload/ipcinfo/manual/IPC_Technical_Manual_3_Final.pdf"
                  isExternal
                  color="teal.500"
                  fontWeight="medium"
                >
                  📄 IPC 3.1 Technical Manual
                </Link>
              </Box>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <Box textAlign="right" fontSize="xs" mt={2}>
        Source:{' '}
        <Link href="https://fews.net/" isExternal color="teal.500">
          FEWS NET
        </Link>
      </Box>
    </Box>
  );
};

export default LHZIPC;
