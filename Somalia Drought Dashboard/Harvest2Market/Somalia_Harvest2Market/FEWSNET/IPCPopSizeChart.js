import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'aws-amplify/api';
import { ciInitialLayout } from '../../Utils/ciLayout';
import faostatCountryCodes from '../../../data/faostat-country-codes.json';
import {
    Box,
    Text,
    VStack,
    HStack,
    Link,
    Spinner,
    Container,
    Badge,
    Heading,
    useColorModeValue,
    Select,
    Alert,
    AlertIcon,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    OrderedList,
    ListItem,
    Divider,
    Stack
} from '@chakra-ui/react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { FaRegClock } from "react-icons/fa6";

// Scenario mapping - moved outside component to avoid dependency issues
const scenarioMapping = {
    'CS': 'Current Situation',
    'ML': 'Medium-term Projection'
};

// Hardcoded for Somalia
const COUNTRY_ID = 'SOM';
const COUNTRY_LABEL = 'Somalia';


const IPCPopSizeChart = () => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [metaData, setMetaData] = useState(null);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('CS');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [scenarioError, setScenarioError] = useState(false);
  const componentId = 'p1-Fewsnet_IPCPopSize';
  const [windowWidth] = useState(window.innerWidth);
  const dispatch = useDispatch();

  const abortControllerRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const getISO2FromISO3 = iso3Code => {
    const countryData = faostatCountryCodes.find(
      country => country['ISO3 Code'] === iso3Code
    );
    return countryData ? countryData['ISO2 Code'] : null;
  };

  const formatNumber = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value?.toLocaleString() || '0';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box bg={bgColor} p={3} borderRadius="md" boxShadow="lg" border="1px solid" borderColor={borderColor}>
          <Text fontSize="sm" fontWeight="bold" mb={1}>{label}</Text>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="red.600">High Value: {formatNumber(data.high_value)}</Text>
            <Text fontSize="sm" color="orange.600">Low Value: {formatNumber(data.low_value)}</Text>
            {data.population_range && (
              <Text fontSize="xs" color="gray.500">Range: {data.population_range}</Text>
            )}
            {data.phase_name && (
              <Text fontSize="xs" color="gray.500">Phase: {data.phase_name}</Text>
            )}
          </VStack>
        </Box>
      );
    }
    return null;
  };

  const fetchDataForScenario = async (iso2Code, scenario, abortController) => {
    try {
      const restOperation = get({
        apiName: 'SupplyChainsApi',
        path: '/supplyChainsApi/fews-api',
        options: {
          queryParams: {
            api_name: 'ipcpopulationsize.json',
            country_code: iso2Code,
            scenario: scenario,
            datasourcedocument: '6986',
          },
        },
      });

      const restOperationResponse = await restOperation.response;

      if (abortController?.signal.aborted) {
        return null;
      }

      const responseBody = await restOperationResponse.body.json();

      let data = null;
      if (responseBody && responseBody.success && Array.isArray(responseBody.value)) {
        data = responseBody.value;
      } else if (Array.isArray(responseBody)) {
        data = responseBody;
      }

      if (data && data.length > 0) {
        return data;
      } else {
        return null;
      }
    } catch (error) {
      if (abortController?.signal.aborted) {
        return null;
      }
      console.warn(`Error fetching scenario ${scenario}:`, error);
      return null;
    }
  };

  const fetchIPCPopSize = useCallback(async (countryCode, userSelectedScenario = null) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    try {
      setLoading(true);
      setError(false);
      setScenarioError(false);
      setErrorMessage('');
      setChartData([]);
      setMetaData(null);

      const iso2Code = getISO2FromISO3(countryCode);
      if (!iso2Code) {
        setError(true);
        setErrorMessage(`No ISO2 code found for: ${countryCode}`);
        setLoading(false);
        return;
      }

      let successfulData = null;

      if (userSelectedScenario) {
        const data = await fetchDataForScenario(iso2Code, userSelectedScenario, currentAbortController);

        if (currentAbortController.signal.aborted) return;

        if (data) {
          successfulData = { data, scenario: userSelectedScenario };
        } else {
          setScenarioError(true);
          setErrorMessage(`Please choose different scenario - no data found for ${scenarioMapping[userSelectedScenario]}`);
          setLoading(false);
          return;
        }
      } else {
        const scenarioOrder = ['CS', 'ML'];

        for (const scenario of scenarioOrder) {
          const data = await fetchDataForScenario(iso2Code, scenario, currentAbortController);

          if (currentAbortController.signal.aborted) return;

          if (data) {
            successfulData = { data, scenario };
            break;
          }
        }
      }

      if (!successfulData) {
        setError(true);
        setErrorMessage(`No IPC population size data found for ${COUNTRY_LABEL}`);
        setLoading(false);
        return;
      }

      const { data, scenario } = successfulData;

      setSelectedScenario(scenario);

      const transformedData = data
        .map(item => {
          let correctedHighValue = item.high_value || 0;
          
          return {
            reporting_date: item.reporting_date ? item.reporting_date.substring(0, 7) : null,
            low_value: item.low_value || 0,
            high_value: correctedHighValue,
            population_range: item.population_range || '',
            phase_name: item.phase_name || '',
            scenario_name: item.scenario_name || '',
            fewsnet_region: item.fewsnet_region || '',
            phase: item.phase || '',
            fullDate: item.reporting_date,
            sortDate: item.reporting_date ? new Date(item.reporting_date).getTime() : 0
          };
        })
        .filter(item => item.reporting_date && (item.low_value > 0 || item.high_value > 0))
        .sort((a, b) => a.sortDate - b.sortDate);

      if (transformedData.length === 0) {
        setError(true);
        setErrorMessage(`No valid data points found for ${COUNTRY_LABEL}`);
        setLoading(false);
        return;
      }

      const uniqueData = [];
      const seenDates = new Set();

      transformedData.forEach(item => {
        if (!seenDates.has(item.reporting_date)) {
          seenDates.add(item.reporting_date);
          uniqueData.push(item);
        }
      });

      setMetaData({
        population_range: data[0].population_range || '',
        scenario_name: data[0].scenario_name || '',
        fewsnet_region: data[0].fewsnet_region || '',
        country: data[0].country || '',
        phase_name: data[0].phase_name || ''
      });

      setChartData(uniqueData);
      setDataLoaded(true);

    } catch (error) {
      if (currentAbortController.signal.aborted) {
        return;
      }
      console.error('Error fetching IPC Population data:', error);
      setError(true);
      setErrorMessage('Error fetching data');
    } finally {
      if (!currentAbortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const initialHeight = useMemo(() => {
    const item = ciInitialLayout.find(item => item.i === componentId);
    if (!item) {
      throw new Error(`Component ${componentId} not found in ciInitialLayout`);
    }
    return item.h;
  }, [componentId]);

  const handleScenarioChange = (event) => {
    const newScenario = event.target.value;
    setSelectedScenario(newScenario);
    fetchIPCPopSize(COUNTRY_ID, newScenario);
  };

  useEffect(() => {
    if (!loading && initialHeight) {
      const isUsingXSLayout = windowWidth < 1500;

      let newHeight;
      if (isUsingXSLayout) {
        newHeight = 10;
      } else {
        newHeight = chartData.length > 0 ? initialHeight : 4;
      }

      dispatch({
        type: 'UPDATE_COMPONENT_HEIGHT',
        payload: { componentId, height: newHeight },
      });
    }
  }, [chartData.length, loading, dispatch, initialHeight, windowWidth]);

  useEffect(() => {
    setDataLoaded(false);
    fetchIPCPopSize(COUNTRY_ID);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchIPCPopSize]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4}>
          <Spinner size="lg" color="orange.500" />
          <Text fontSize="md" color="gray.500">Loading FEWS NET IPC Population data...</Text>
        </VStack>
      </Container>
    );
  }

  if (scenarioError) {
    return (
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          {dataLoaded && (
            <HStack justify="space-between" align="start" mb={3}>
              <Heading size="md" color={textColor}>IPC Population Size - {COUNTRY_LABEL}</Heading>
              <VStack align="end" spacing={1}>
                <Text fontSize="sm" color="gray.600">Scenario:</Text>
                <Select
                  size="sm"
                  width="200px"
                  value={selectedScenario}
                  onChange={handleScenarioChange}
                  isDisabled={loading}
                >
                  {Object.entries(scenarioMapping).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </Select>
              </VStack>
            </HStack>
          )}

          <Alert status="warning">
            <AlertIcon />
            {errorMessage}
          </Alert>

          <Box paddingRight={2} textAlign="right" fontSize="sm">
            Source:{' '}
            <Link href="https://fews.net/data/acute-food-insecurity" isExternal>FEWS NET</Link>
          </Box>
        </VStack>
      </Container>
    );
  }

  if (error || !chartData.length) {
    return (
      <Container maxW="container.xl" py={4}>
        <Text fontSize="md" color="gray.500" textAlign="center">
          {errorMessage || `No FEWS NET Acute Food Insecurity data found for ${COUNTRY_LABEL}`}
        </Text>
        <Box paddingRight={2} paddingTop={2} textAlign="right" fontSize="sm">
          Source:{' '}
          <Link href="https://fews.net/data/acute-food-insecurity" isExternal>FEWS NET</Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={4}>
      <Heading size="md">
        <Badge variant="subtle" colorScheme="green" fontSize="xl">{COUNTRY_LABEL}</Badge>{" "}
        - FEWS NET Acutely Food Insecure Population Estimates
      </Heading>

      <VStack spacing={4} align="stretch">
        <Stack className="noDrag" direction={{ base: "column", lg: "row" }} paddingTop={2} justify={"space-between"}>
          {dataLoaded && (
            <Box align="start" mb={3} wrap={'wrap'} spacing={1}>
              <HStack py={2}>
                <Text fontSize="sm" color="gray.600">Scenario:</Text>
                <Select
                  size="sm"
                  width="200px"
                  value={selectedScenario}
                  onChange={handleScenarioChange}
                  isDisabled={loading}
                >
                  {Object.entries(scenarioMapping).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </Select>
              </HStack>
              {metaData?.scenario_name && (
                <HStack spacing={0}>
                  <Badge colorScheme="orange" py={2}><FaRegClock /></Badge>
                  <Badge colorScheme="orange" px={2} py={1}>
                    Reported {chartData[chartData.length - 1]?.reporting_date}
                  </Badge>
                </HStack>
              )}
              {metaData?.population_range && (
                <Text>Estimate: {formatNumber(chartData[chartData.length - 1]?.population_range)} people</Text>
              )}
              {metaData?.population_range && (
                <Text color="gray.600" flexWrap={'wrap'}>
                  Population projections represent the total population that would likely face Crisis ({metaData.phase_name}) acute food insecurity in the absence of any emergency food assistance.
                </Text>
              )}
            </Box>
          )}
        </Stack>

        <Box height="300px" width="100%" className="noDrag">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ right: 30, left: 20, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="reporting_date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                label={{ value: 'Reporting Date (YYYY-MM)', position: 'insideBottom', wrap: true, offset: -10 }}
              />
              <YAxis
                tickFormatter={formatNumber}
                tick={{ fontSize: 8 }}
                label={{ value: 'Pop.Estimate', angle: -90, position: 'insideLeft', wrap: true }}
              />
              <Tooltip content={CustomTooltip} />
              <Area
                type="monotone"
                dataKey="low_value"
                stackId="1"
                stroke="#fb923c"
                strokeWidth={2}
                fill="#fed7aa"
                fillOpacity={0.6}
                name="Low Value"
              />
              <Area
                type="monotone"
                dataKey="high_value"
                stackId="2"
                stroke="#dc2626"
                strokeWidth={2}
                fill="#fecaca"
                fillOpacity={0.6}
                name="High Value"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>

        <Box paddingRight={2} textAlign="right" fontSize="sm">
          Source:{' '}
          <Link href="https://fews.net/data/acute-food-insecurity" isExternal>FEWS NET</Link>
        </Box>

        <Accordion allowToggle width="100%" className="noDrag">
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">More Information</Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={2} align="start">
                <Text fontWeight="semibold" mb={2}>Acutely food insecure population estimates:</Text>
                <Text>
                  Population projections represent the total population that would likely face Crisis (IPC Phase 3) or worse acute food insecurity in the absence of any emergency food assistance.
                </Text>
                <Divider />
                <Text>
                  FEWS NET's classifications are IPC-compatible. IPC-compatible analysis follows key IPC protocols but does not necessarily reflect the consensus of national food security partners.
                </Text>
                <Box>
                  <Text fontWeight="semibold" mb={2}>Food Insecurity Classification Levels:</Text>
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
      </VStack>
    </Container>
  );
};

export default IPCPopSizeChart;