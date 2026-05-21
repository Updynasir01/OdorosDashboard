import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    Box, Badge, Select, Heading, Flex, Text, Link, Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Divider,
    Th,
    Td,
    HStack,
    Stack
} from '@chakra-ui/react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol';
import { ConditionsLegend } from '../../Crops/Legends';
import countryCodes from '../../../data/faostat-country-codes.json';
import { footnotesData } from '../../Utils/footnotes';

const footnote = footnotesData.GlobalTotalCropConditionsPieChart;

// Hardcoded for Somalia
const COUNTRY_ID = 'SOM';
const COUNTRY_LABEL = 'Somalia';

// Create ISO3 to ISO2 mapping
const iso3ToIso2 = countryCodes.reduce((acc, country) => {
    const iso3 = country["ISO3 Code"]?.trim()?.toUpperCase();
    const iso2 = country["ISO2 Code"]?.trim()?.toUpperCase();
    if (iso3 && iso2 && iso3.length === 3 && iso2.length === 2 && !iso2.startsWith('F')) {
        acc[iso3] = iso2;
    }
    return acc;
}, {});

const GEOGLAM_LAYER_URL = "https://services1.arcgis.com/qTQ6qYkHpxlu0G82/ArcGIS/rest/services/GEOGLAM_Crop_Monitor_Map_Layers/FeatureServer/7";

// Condition colors for legend and styling
const CONDITION_COLORS = {
    'Exceptional': '#008fc9',  // Blue
    'Favourable': '#43cf39',   // Green  
    'Watch': '#f5ef00',        // Yellow
    'Poor': '#f15921',         // Orange
    'Failure': '#a80000',      // Red
};

// Crop layer URLs
const crops_base_URL = {
    wheat: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Wheat/MapServer',
    maize: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Maize/MapServer',
    rice: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Rice/MapServer',
    soybean: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Soybean/MapServer',
    sorghum: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Sorghum/MapServer',
    millet: 'https://data.cropmonitor.org/arcgis/rest/services/CMET/Millet/MapServer',
};

const monthNames = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
    '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
    '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
};

// Symbology for country outline
const geoglamOutlineSymbol = new SimpleLineSymbol({
    color: [255, 255, 255, 1],
    width: 2
});

const geoglamFillSymbol = new SimpleFillSymbol({
    color: [0, 0, 0, 0],
    outline: geoglamOutlineSymbol
});

// Condition definitions
const conditionDefinitions = {
    'Exceptional': 'Conditions are much better than average at this time of year. Yield potential is > 105% of average.',
    'Favourable': 'Conditions range from slightly below to slightly above average. Yield potential is within +/- 5% of average.',
    'Watch': 'Conditions are not far from average but there is a potential risk to final yields. Crop conditions may deteriorate or improve depending on weather.',
    'Poor': 'Conditions are well below average. Yield potential is < 95% of average.',
    'Failure': 'Crop failure. Yield potential is < 50% of average or crop has failed.'
};

export const CountryCropConditionsMap = () => {
    const MapElement = useRef(null);
    const viewRef = useRef(null);
    const countryLayerRef = useRef(null);
    
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedCrop, setSelectedCrop] = useState('maize');
    const [legendVisible, setLegendVisible] = useState(true);

    // Initialize map
    useEffect(() => {
        if (!MapElement.current) return;

        const cropLayer = new MapImageLayer({
            url: crops_base_URL[selectedCrop],
            visible: false,
        });

        const boundaryLayer = new FeatureLayer({
            url: GEOGLAM_LAYER_URL,
            definitionExpression: "1=0",
            renderer: {
                type: "simple",
                symbol: geoglamFillSymbol,
            },
            opacity: 1,
            id: 'boundaryLayer'
        });

        const map = new Map({
            basemap: 'dark-gray-vector',
            layers: [boundaryLayer, cropLayer]
        });

        viewRef.current = new MapView({
            map,
            container: MapElement.current,
            center: [0, 0],
            zoom: 1,
            constraints: { minZoom: 1 }
        });

        viewRef.current.when(() => {
            const legendContainer = document.getElementById('legend-container');
            if (legendContainer) {
                viewRef.current.ui.add(legendContainer, {
                    position: 'bottom-right',
                    index: 0
                });
            }
        });

        countryLayerRef.current = boundaryLayer;

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []);

    // Update country filter and view extent for Somalia
    useEffect(() => {
        if (!viewRef.current || !countryLayerRef.current) return;

        const iso2Code = iso3ToIso2[COUNTRY_ID.toUpperCase()];
        if (!iso2Code) return;

        countryLayerRef.current.definitionExpression = `isocode = '${iso2Code}'`;

        const handleLayerLoad = () => {
            const query = countryLayerRef.current.createQuery();
            query.returnGeometry = true;
            query.outSpatialReference = viewRef.current.spatialReference;

            countryLayerRef.current.queryFeatures(query).then(({ features }) => {
                if (features.length > 0) {
                    const extent = features[0].geometry.extent;
                    viewRef.current.goTo({
                        target: extent,
                        padding: 50
                    }).catch(console.error);
                }
            });
        };

        countryLayerRef.current.when(handleLayerLoad);

    }, []);

    // Fetch layers when crop changes
    useEffect(() => {
        const fetchLayers = async () => {
            try {
                const response = await fetch(
                    `${crops_base_URL[selectedCrop]}?f=pjson&_=${Date.now()}`
                );
                const data = await response.json();

                const dates = data.layers.map(layer => {
                    const parts = layer.name.split('_');
                    const year = parts[1];
                    const month = parts[2];
                    return {
                        id: layer.id,
                        name: layer.name,
                        date: `${year} - ${monthNames[month]}`
                    };
                });

                setAvailableDates(dates);
                if (dates.length > 0) {
                    setSelectedDate(dates[dates.length - 1]);
                }
            } catch (error) {
                console.error('Error fetching layers:', error);
            }
        };

        fetchLayers();
    }, [selectedCrop]);

    // Update layer when date/crop changes
    useEffect(() => {
        if (!selectedDate || !viewRef.current) return;

        const newCropLayer = new MapImageLayer({
            url: crops_base_URL[selectedCrop],
            sublayers: [{
                id: selectedDate.id,
                source: { mapLayerId: selectedDate.id }
            }]
        });

        const map = viewRef.current.map;

        const existingCropLayer = map.layers.find(layer => layer.type === 'map-image');
        if (existingCropLayer) {
            map.remove(existingCropLayer);
        }

        map.add(newCropLayer);

        return () => {
            newCropLayer?.destroy();
        };
    }, [selectedDate, selectedCrop]);

    const getConditionDefinition = (condition) => {
        return conditionDefinitions[condition] || 'No definition available';
    };

    return (
        <Box h="100%" paddingTop={2}>
            <Heading size="md" mb={2}>
                Current Global{' '}
                <Badge variant="subtle" colorScheme="cyan" fontSize="lg">
                    {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
                </Badge>{' '}
                Conditions
            </Heading>

            <Text fontSize="sm" mb={2}>
                Highlighted Country:{' '}
                <Badge variant="subtle" colorScheme="green">
                    {COUNTRY_LABEL}
                </Badge>
            </Text>

            <Stack
                direction={{ base: "column", lg: "row" }}
                justify={'space-between'}
                mb={2}
                mt={2}
                spacing={2}
            >
                <HStack>
                    <Text fontSize="sm">Crop:</Text>
                    <Select
                        size="sm"
                        width="150px"
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                    >
                        {Object.keys(crops_base_URL).map(crop => (
                            <option key={crop} value={crop}>
                                {crop.charAt(0).toUpperCase() + crop.slice(1)}
                            </option>
                        ))}
                    </Select>
                </HStack>
                <HStack>
                    <Text fontSize="sm">Year - Month:</Text>
                    <Select
                        size="sm"
                        width="150px"
                        value={selectedDate?.id || ''}
                        onChange={(e) => {
                            const selected = availableDates.find(date => date.id === Number(e.target.value));
                            setSelectedDate(selected);
                        }}
                    >
                        {availableDates.map(date => (
                            <option key={date.id} value={date.id}>
                                {date.date}
                            </option>
                        ))}
                    </Select>
                </HStack>
            </Stack>

            {selectedDate && (
                <Box mb={2}>
                    <Text fontSize="sm">
                        As of{' '}
                        <Badge>
                            {selectedDate.name.split('.')[0].split('_')[2]}-
                            {selectedDate.name.split('.')[0].split('_')[3]}-
                            {selectedDate.name.split('.')[0].split('_')[1]}
                        </Badge>
                    </Text>
                </Box>
            )}

            <Box
                ref={MapElement}
                style={{ height: '90%' }}
            />

            <Box
                id="legend-container"
                bg="white"
                boxShadow="md"
                borderRadius="md"
                p={2}
                minW="200px"
            >
                <Flex justifyContent="space-between" alignItems="center" mb={2}>
                    <Text fontWeight="bold" fontSize="sm" color="teal.400">Legend</Text>
                    <Box
                        as="button"
                        fontSize="xs"
                        color="teal.800"
                        onClick={() => setLegendVisible(!legendVisible)}
                    >
                        {legendVisible ? 'Hide' : 'Show'}
                    </Box>
                </Flex>

                {legendVisible && <ConditionsLegend />}
            </Box>

            <Accordion paddingTop={2} allowToggle>
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
                        View the latest Crop Monitor Report at{' '}
                        <Link href="https://cropmonitor.org/index.php/cmreports/reports-archive/" isExternal>
                            cropmonitor.org/global-crop-monitor
                        </Link>
                        <Box paddingTop={2} paddingBottom={2}>
                            <Divider />
                        </Box>
                        <Heading size="sm" color='gray.700' align={'center'} paddingBottom={2} paddingTop={2}>
                            Crop Condition Classifications
                        </Heading>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Condition</Th>
                                    <Th>Color</Th>
                                    <Th>Definition</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {Object.entries(CONDITION_COLORS).map(([condition, color]) => (
                                    <Tr key={condition}>
                                        <Td>{condition}</Td>
                                        <Td>
                                            <Box
                                                w="20px"
                                                h="20px"
                                                bg={color}
                                                borderRadius="sm"
                                            />
                                        </Td>
                                        <Td>
                                            {getConditionDefinition(condition)}
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        <Text fontSize="xs" mb={2} mt={2}>
                            Conditions are based on crop analyst inputs and satellite observations.
                        </Text>
                        Learn more about GEOGLAM Crop Monitor Classification from{' '}
                        <Link href="https://cropmonitor.org/index.php/about/conditions-icons/" isExternal>
                            cropmonitor.org
                        </Link>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            <Box paddingRight={2} paddingTop={2} textAlign="right" fontSize="xs">
                Source:{' '}
                <Link href="https://www.cropmonitor.org/" isExternal>
                    GEOGLAM Crop Monitor
                </Link>
            </Box>
        </Box>
    );
};

export default CountryCropConditionsMap;