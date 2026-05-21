import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,

} from 'recharts';
import {
  Spinner,
  Box,
  Link,
  Text,
  Select,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Badge
} from '@chakra-ui/react';
import { ciInitialLayout } from '../../Utils/ciLayout';

import { get } from 'aws-amplify/api';
// Hardcoded for Somalia
const COUNTRY_ID = 'SOM';
const COUNTRY_LABEL = 'Somalia';

// Somalia country configuration
const somaliaConfig = {
"Country Name": "Somalia",
        "ISO2 Code": "SO",
        "ISO3 Code": "SOM",
        "Resource ID": "b94ba2b0-2f17-4b56-a3cd-c729dbbc8d45",
        "lhz_ipc": "d998d261-3d92-4150-994d-80e71a1d7076",
        "product": "Maize Grain (White)",
        "market": "Afgoi",
        "status": "Collected",
        "price_type": "Retail",
        "unit": "kg",
        "period_date": "2026-01-31"
};

const MarketPriceFacts = () => {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [units, setUnits] = useState([]);
  const [priceTypes, setPriceTypes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('');
  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [currentCurrency, setCurrentCurrency] = useState('USD');
  const [optionsError, setOptionsError] = useState(false);

  const [marketsLoading, setMarketsLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [priceTypesLoading, setPriceTypesLoading] = useState(false);

  const optionsAbortControllerRef = useRef(null);
  const dataAbortControllerRef = useRef(null);
  const cascadeAbortControllerRef = useRef(null);

  const dispatch = useDispatch();
  const componentId = 'p1-Fewsnet_MarketPriceFacts';

  const currentCountry = somaliaConfig;
  const resourceId = currentCountry?.['Resource ID'];

  const getHarvestPortalKey = async () => {
    const restOperation = get({
      apiName: 'SupplyChainsApi',
      path: '/supplyChainsApi/harvest-portal-api-key',
    });
    const restOperationResponse = (await restOperation.response).body.json();
    const response = await restOperationResponse;
    return response.value;
  };

  // Fetch initial products list
  useEffect(() => {
    if (!resourceId) return;
    setOptionsError(false);

    if (optionsAbortControllerRef.current) {
      optionsAbortControllerRef.current.abort();
    }

    optionsAbortControllerRef.current = new AbortController();
    const currentAbortController = optionsAbortControllerRef.current;

    const fetchProducts = async (retryCount = 0) => {
      const MAX_RETRIES = 5;

      try {
        setOptionsLoading(true);

        if (currentAbortController.signal.aborted) return;

        const apiKey = await getHarvestPortalKey();

        const productsResponse = await fetch(
          `https://data.harvestportal.org/api/action/datastore_search_sql?sql=${encodeURIComponent(`
            SELECT DISTINCT "product" 
            FROM "${resourceId}"
            WHERE "collection_status" = 'Published'
            ORDER BY "product"
          `)}`,
          {
            headers: { Authorization: apiKey },
            signal: currentAbortController.signal
          }
        );

        if (currentAbortController.signal.aborted) return;

        if (!productsResponse.ok) {
          throw new Error(`HTTP Error: ${productsResponse.status}`);
        }

        const productsData = await productsResponse.json();

        if (!productsData?.result?.records) {
          throw new Error('Invalid data structure received from API');
        }

        if (!currentAbortController.signal.aborted) {
          const extractedProducts = productsData.result.records
            .map(p => p.product)
            .filter(Boolean)
            .sort();

          setProducts(extractedProducts);

          if (currentCountry?.product && extractedProducts.includes(currentCountry.product)) {
            setSelectedProduct(currentCountry.product);
          } else if (extractedProducts.length > 0) {
            setSelectedProduct(extractedProducts[0]);
          }

          setOptionsLoading(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;

        if (retryCount < MAX_RETRIES - 1 && !currentAbortController.signal.aborted) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          if (!currentAbortController.signal.aborted) {
            return fetchProducts(retryCount + 1);
          }
        } else {
          if (!currentAbortController.signal.aborted) {
            setOptionsLoading(false);
            setOptionsError(true);
            setProducts([]);
          }
        }
      }
    };

    fetchProducts();
  }, [resourceId]);

  // Cascade: When product changes, fetch available markets
  useEffect(() => {
    if (!resourceId || !selectedProduct) {
      setMarkets([]);
      setSelectedMarket('');
      return;
    }

    if (cascadeAbortControllerRef.current) {
      cascadeAbortControllerRef.current.abort();
    }

    cascadeAbortControllerRef.current = new AbortController();
    const currentAbortController = cascadeAbortControllerRef.current;

    const fetchMarkets = async () => {
      try {
        setMarketsLoading(true);
        setSelectedMarket('');
        setSelectedUnit('');
        setSelectedPriceType('');
        setUnits([]);
        setPriceTypes([]);

        const apiKey = await getHarvestPortalKey();

        const response = await fetch(
          `https://data.harvestportal.org/api/action/datastore_search_sql?sql=${encodeURIComponent(`
            SELECT DISTINCT "market" 
            FROM "${resourceId}"
            WHERE "collection_status" = 'Published'
              AND "product" = '${selectedProduct.replace(/'/g, "''")}'
            ORDER BY "market"
          `)}`,
          {
            headers: { Authorization: apiKey },
            signal: currentAbortController.signal
          }
        );

        if (currentAbortController.signal.aborted) return;

        const data = await response.json();
        const extractedMarkets = data?.result?.records?.map(m => m.market).filter(Boolean).sort() || [];

        if (!currentAbortController.signal.aborted) {
          setMarkets(extractedMarkets);

          if (currentCountry?.market && extractedMarkets.includes(currentCountry.market)) {
            setSelectedMarket(currentCountry.market);
          } else if (extractedMarkets.length > 0) {
            setSelectedMarket(extractedMarkets[0]);
          }

          setMarketsLoading(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!currentAbortController.signal.aborted) {
          setMarketsLoading(false);
        }
      }
    };

    fetchMarkets();
  }, [resourceId, selectedProduct]);

  // Cascade: When market changes, fetch available units
  useEffect(() => {
    if (!resourceId || !selectedProduct || !selectedMarket) {
      setUnits([]);
      setSelectedUnit('');
      return;
    }

    const abortController = new AbortController();

    const fetchUnits = async () => {
      try {
        setUnitsLoading(true);
        setSelectedUnit('');
        setSelectedPriceType('');
        setPriceTypes([]);

        const apiKey = await getHarvestPortalKey();

        const response = await fetch(
          `https://data.harvestportal.org/api/action/datastore_search_sql?sql=${encodeURIComponent(`
            SELECT DISTINCT "unit" 
            FROM "${resourceId}"
            WHERE "collection_status" = 'Published'
              AND "product" = '${selectedProduct.replace(/'/g, "''")}'
              AND "market" = '${selectedMarket.replace(/'/g, "''")}'
            ORDER BY "unit"
          `)}`,
          {
            headers: { Authorization: apiKey },
            signal: abortController.signal
          }
        );

        if (abortController.signal.aborted) return;

        const data = await response.json();
        const extractedUnits = data?.result?.records?.map(u => u.unit).filter(Boolean).sort() || [];

        if (!abortController.signal.aborted) {
          setUnits(extractedUnits);

          if (currentCountry?.unit && extractedUnits.includes(currentCountry.unit)) {
            setSelectedUnit(currentCountry.unit);
          } else if (extractedUnits.length > 0) {
            setSelectedUnit(extractedUnits[0]);
          }

          setUnitsLoading(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!abortController.signal.aborted) {
          setUnitsLoading(false);
        }
      }
    };

    fetchUnits();

    return () => abortController.abort();
  }, [resourceId, selectedProduct, selectedMarket]);

  // Cascade: When unit changes, fetch available price types
  useEffect(() => {
    if (!resourceId || !selectedProduct || !selectedMarket || !selectedUnit) {
      setPriceTypes([]);
      setSelectedPriceType('');
      return;
    }

    const abortController = new AbortController();

    const fetchPriceTypes = async () => {
      try {
        setPriceTypesLoading(true);
        setSelectedPriceType('');

        const apiKey = await getHarvestPortalKey();

        const response = await fetch(
          `https://data.harvestportal.org/api/action/datastore_search_sql?sql=${encodeURIComponent(`
            SELECT DISTINCT "price_type" 
            FROM "${resourceId}"
            WHERE "collection_status" = 'Published'
              AND "product" = '${selectedProduct.replace(/'/g, "''")}'
              AND "market" = '${selectedMarket.replace(/'/g, "''")}'
              AND "unit" = '${selectedUnit.replace(/'/g, "''")}'
            ORDER BY "price_type"
          `)}`,
          {
            headers: { Authorization: apiKey },
            signal: abortController.signal
          }
        );

        if (abortController.signal.aborted) return;

        const data = await response.json();
        const extractedPriceTypes = data?.result?.records?.map(pt => pt.price_type).filter(Boolean).sort() || [];

        if (!abortController.signal.aborted) {
          setPriceTypes(extractedPriceTypes);

          if (currentCountry?.price_type && extractedPriceTypes.includes(currentCountry.price_type)) {
            setSelectedPriceType(currentCountry.price_type);
          } else if (extractedPriceTypes.length > 0) {
            setSelectedPriceType(extractedPriceTypes[0]);
          }

          setPriceTypesLoading(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!abortController.signal.aborted) {
          setPriceTypesLoading(false);
        }
      }
    };

    fetchPriceTypes();

    return () => abortController.abort();
  }, [resourceId, selectedProduct, selectedMarket, selectedUnit]);

  // Fetch chart data when all filters are selected
  useEffect(() => {
    if (!resourceId || !selectedProduct || !selectedMarket || !selectedUnit || !selectedPriceType) {
      return;
    }

    if (dataAbortControllerRef.current) {
      dataAbortControllerRef.current.abort();
    }

    dataAbortControllerRef.current = new AbortController();
    const currentAbortController = dataAbortControllerRef.current;

    const fetchData = async () => {
      try {
        setLoading(true);

        if (currentAbortController.signal.aborted) return;

        const apiKey = await getHarvestPortalKey();

        const escapedProduct = selectedProduct.replace(/'/g, "''");
        const escapedMarket = selectedMarket.replace(/'/g, "''");
        const escapedUnit = selectedUnit.replace(/'/g, "''");
        const escapedPriceType = selectedPriceType.replace(/'/g, "''");

        const response = await fetch(
          `https://data.harvestportal.org/api/action/datastore_search_sql?sql=${encodeURIComponent(`
            SELECT * 
            FROM "${resourceId}"
            WHERE "product" = '${escapedProduct}'
              AND "unit" = '${escapedUnit}'
              AND "price_type" = '${escapedPriceType}'
              AND "collection_status" = 'Published'
              AND "market" = '${escapedMarket}'
            ORDER BY "period_date" ASC
          `)}`,
          {
            headers: { Authorization: apiKey },
            signal: currentAbortController.signal
          }
        );

        if (currentAbortController.signal.aborted) return;

        const result = await response.json();
        const records = result?.result?.records || [];

        const processedData = records
          .map(item => {
            let parsedDate;
            const dateStr = item.period_date;

            parsedDate = new Date(dateStr);

            if (isNaN(parsedDate.getTime())) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                const month = parseInt(parts[0], 10) - 1;
                const day = parseInt(parts[1], 10);
                let year = parseInt(parts[2], 10);
                if (year < 100) {
                  year += year < 50 ? 2000 : 1900;
                }
                parsedDate = new Date(year, month, day);
              }
            }

            return {
              rawDate: item.period_date,
              date: parsedDate.getTime(),
              value: Number(item.value) || null,
              value_one_year_ago: Number(item.value_one_year_ago) || null,
              five_year_average: Number(item.five_year_average) || null,
              currency: item.currency,
              unit: item.unit,
            };
          })
          .filter(item => !isNaN(item.date))
          .sort((a, b) => a.date - b.date);

        if (!currentAbortController.signal.aborted) {
          setData(processedData);
          if (processedData.length > 0) {
            setCurrentCurrency(processedData[0].currency || 'USD');
          }
          setLoading(false);
        }
      } catch (error) {
        if (error.name === 'AbortError') return;
        if (!currentAbortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [resourceId, selectedProduct, selectedMarket, selectedUnit, selectedPriceType]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (optionsAbortControllerRef.current) {
        optionsAbortControllerRef.current.abort();
      }
      if (dataAbortControllerRef.current) {
        dataAbortControllerRef.current.abort();
      }
      if (cascadeAbortControllerRef.current) {
        cascadeAbortControllerRef.current.abort();
      }
    };
  }, []);

  const initialHeight = useMemo(() => {
    const item = ciInitialLayout.find(item => item.i === componentId);
    if (!item) {
      throw new Error(`Component ${componentId} not found in ciInitialLayout`);
    }
    return item.h;
  }, [componentId]);

  useEffect(() => {
    if (!loading && initialHeight) {
      const hasData = resourceId && data.length > 0;
      const newHeight = hasData ? initialHeight : 8;

      dispatch({
        type: 'UPDATE_COMPONENT_HEIGHT',
        payload: { componentId, height: newHeight },
      });
    }
  }, [resourceId, data.length, loading, dispatch, initialHeight]);

  if (!resourceId) {
    return (
      <Box p={4}>
        <Text>Market price facts unavailable for {COUNTRY_LABEL}</Text>
      </Box>
    );
  }

  const isCascadeLoading = marketsLoading || unitsLoading || priceTypesLoading;

  return (
    <Box p={5}>
      <Heading size="md" mb={4}>
        <Badge variant="subtle" colorScheme="green" fontSize="xl">{COUNTRY_LABEL}</Badge>{" "}
        - Market Price Facts
      </Heading>

      {optionsError && !optionsLoading ? (
        <Box mb={4} p={3} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
          <Text color="red.600" fontSize="sm">
            Unable to retrieve selector options for {COUNTRY_LABEL}.
            The data service may be temporarily unavailable.
          </Text>
        </Box>
      ) : (
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4} mb={4}>
          <FormControl>
            <FormLabel fontSize="sm">Product</FormLabel>
            <Select
              size="sm"
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              isDisabled={optionsLoading}
              className="noDrag"
              placeholder={optionsLoading ? "Loading..." : "Select product"}
            >
              {products.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Market</FormLabel>
            <Select
              size="sm"
              value={selectedMarket}
              onChange={e => setSelectedMarket(e.target.value)}
              isDisabled={optionsLoading || marketsLoading || !selectedProduct}
              className="noDrag"
              placeholder={marketsLoading ? "Loading..." : markets.length === 0 ? "Select product first" : "Select market"}
            >
              {markets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Unit</FormLabel>
            <Select
              size="sm"
              value={selectedUnit}
              onChange={e => setSelectedUnit(e.target.value)}
              isDisabled={optionsLoading || unitsLoading || !selectedMarket}
              className="noDrag"
              placeholder={unitsLoading ? "Loading..." : units.length === 0 ? "Select market first" : "Select unit"}
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel fontSize="sm">Price Type</FormLabel>
            <Select
              size="sm"
              value={selectedPriceType}
              onChange={e => setSelectedPriceType(e.target.value)}
              isDisabled={optionsLoading || priceTypesLoading || !selectedUnit}
              className="noDrag"
              placeholder={priceTypesLoading ? "Loading..." : priceTypes.length === 0 ? "Select unit first" : "Select price type"}
            >
              {priceTypes.map(pt => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}

      {optionsLoading ? (
        <Box textAlign="center" py={8}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
          <Text mt={4} color="gray.500">Loading options...</Text>
        </Box>
      ) : isCascadeLoading ? (
        <Box textAlign="center" py={8}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="lg" />
          <Text mt={4} color="gray.500">Loading filter options...</Text>
        </Box>
      ) : loading && selectedProduct && selectedMarket && selectedUnit && selectedPriceType ? (
        <Box textAlign="center" py={8}>
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
          <Text mt={4} color="gray.500">Loading chart data...</Text>
        </Box>
      ) : !selectedProduct || !selectedMarket || !selectedUnit || !selectedPriceType ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">Please select all filters to view chart data</Text>
        </Box>
      ) : data.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Text color="gray.500">
            {optionsError ? "No data available with default filter values" : "No data available for selected filters"}
          </Text>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <ComposedChart data={data} margin={{ top: 5, right: 65, left: 20, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="category"
              tickFormatter={timestamp => {
                const date = new Date(timestamp);
                return `${date.getMonth() + 1}/${date.getFullYear()}`;
              }}
              angle={-45}
              textAnchor="end"
              interval={12}
            />
            <YAxis
              label={{
                value: `Price (${currentCurrency}/${selectedUnit})`,
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Line dataKey="value" stroke="#8884d8" dot={false} name="Current Price" connectNulls={true} />
            <Line dataKey="value_one_year_ago" stroke="#82ca9d" dot={false} name="Price (1 Year Ago)" connectNulls={true} />
            <Bar dataKey="five_year_average" fill="#ffc658" name="5-Year Average" />
            <Tooltip
              labelFormatter={timestamp => {
                const date = new Date(timestamp);
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
              }}
              formatter={(value, name, { payload }) => {
                const currency = payload?.currency || 'USD';
                return [`${value?.toFixed(2)} ${currency}/${selectedUnit}`, name];
              }}
            />
            <Legend wrapperStyle={{ paddingTop: 10 }} />
            <Brush
              y={400}
              dataKey="date"
              height={20}
              stroke="#8884d8"
              tickFormatter={timestamp => {
                const date = new Date(timestamp);
                return `${date.getMonth() + 1}/${date.getFullYear()}`;
              }}
              className="noDrag"
              alwaysShowText={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <Box textAlign="right" fontSize="xs" mt={2}>
        Source:{' '}
        <Link href="https://fews.net/" isExternal color="teal.500">FEWS NET</Link>
      </Box>
    </Box>
  );
};

export default MarketPriceFacts;