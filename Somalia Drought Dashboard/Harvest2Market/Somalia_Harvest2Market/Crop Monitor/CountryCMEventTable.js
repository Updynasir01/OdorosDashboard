import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from 'react-redux'; // Add this import
import {
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Container,
    VStack,
    Box,
    Skeleton,
    Button,
    Text,
    Select,
    ButtonGroup,
    Collapse,
    Link,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Heading,
    Stack,
    Badge
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon, ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
} from "@tanstack/react-table";
import { ciInitialLayout } from "../../Utils/ciLayout";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { footnotesData } from '../../Utils/footnotes';



// Hardcoded for Somalia
const COUNTRY_ID = 'SOM';
const COUNTRY_LABEL = 'Somalia';

const footnote = footnotesData.CropMonitorEventsTable;

const impactMap = {
    'maj_neg': 'Major Negative',
    'min_neg': 'Minor Negative',
    'min_pos': 'Minor Positive',
    'maj_pos': 'Major Positive'
};

const CountryCMEventTable = () => {
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [columnFilters, setColumnFilters] = useState([]);
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 5
    });

    const clearAllFilters = () => {
        setColumnFilters([]);
    };

    const toggleDescription = (rowId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    const columns = [
        {
            header: 'Crop',
            accessorKey: 'crop',
            meta: { width: "10vw" },
        },
        {
            header: 'Description',
            accessorKey: 'descript',
            meta: { width: "15vw" },
            cell: ({ row, getValue }) => {
                const description = getValue();
                const isExpanded = expandedRows.has(row.original.id);
                const showToggle = description?.length > 20;

                return (
                    <Box width="100%">
                        <Collapse startingHeight="20px" in={isExpanded}>
                            {description}
                        </Collapse>
                        {showToggle && (
                            <Link
                                color="blue.500"
                                fontSize="sm"
                                onClick={() => toggleDescription(row.original.id)}
                            >
                                {isExpanded ? "Show less" : "Show more"}
                            </Link>
                        )}
                    </Box>
                );
            }
        },
        {
            header: 'Driver',
            accessorKey: 'driver',
            meta: { width: "5vw" },
        },
        {
            header: 'Impact',
            accessorKey: 'impact',
            meta: { width: "5vw" },
        },
        {
            header: 'Country',
            accessorKey: 'country',
            meta: { width: "10vw" },
        },
        {
            header: 'Source',
            accessorKey: 'url',
            meta: { width: "5vw" },
            cell: ({ getValue }) => {
                const url = getValue();
                if (!url) return null;
                return (
                    <Link href={url} isExternal color="blue.500">
                        <ExternalLinkIcon boxSize="1.5em" />
                    </Link>
                );
            },
        },
        {
            header: 'Start Date',
            accessorFn: (row) => {
                const dateStr = row.start_date;
                if (!dateStr) return null;
                const date = new Date(dateStr);
                return isNaN(date.getTime()) ? null : date;
            },
            id: 'start_date',
            meta: { width: "15vw" },
            cell: ({ getValue }) => {
                const date = getValue();
                if (!date) return 'N/A';

                try {
                    return date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                } catch {
                    return 'Invalid Date';
                }
            },
            filterFn: 'dateFilter',
        },
    ];

    const table = useReactTable({
        data: filteredData,
        columns,
        initialState: {
            sorting: [{ id: 'start_date', desc: true }],
        },
        state: {
            columnFilters,
            pagination,
        },
        filterFns: {
            dateFilter: (row, columnId, filterValue) => {
                const date = row.getValue(columnId);
                if (!filterValue) return true;
                if (!date || isNaN(date.getTime())) return false;

                // Filter by year (YYYY)
                if (/^\d{4}$/.test(filterValue)) {
                    return date.getFullYear() === parseInt(filterValue, 10);
                }

                // Filter by exact date (MM/DD/YYYY)
                if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(filterValue)) {
                    const [month, day, year] = filterValue.split('/');
                    const inputDate = new Date(year, month - 1, day);
                    if (isNaN(inputDate.getTime())) return false;

                    return date.getFullYear() === inputDate.getFullYear() &&
                        date.getMonth() === inputDate.getMonth() &&
                        date.getDate() === inputDate.getDate();
                }

                return false;
            },
        },
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        enableColumnFilters: true,
    });

    // Filter data for Somalia
    useEffect(() => {
        if (!allData.length) return;

        const targetCountry = COUNTRY_LABEL.toLowerCase().replace(/ /g, ' ');
        const filtered = allData.filter(item => {
            const itemCountry = (item.country || '').toLowerCase().replace(/_/g, ' ');
            return itemCountry === targetCountry;
        });

        setFilteredData(filtered);
        setPagination(prev => ({ ...prev, pageIndex: 0 }));

    }, [allData]);

    // Fetch all data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    'https://services7.arcgis.com/WSiUmUhlFx4CtMBB/ArcGIS/rest/services/service_e5fc4330cb5340a59abc6c7d4ae2e46d/FeatureServer/0/query?f=json&where=1=1&outFields=*'
                );
                const result = await response.json();

                const formattedData = result.features.map(feature => ({
                    id: feature.attributes.globalid,
                    country: feature.attributes.country,
                    driver: feature.attributes.driver_other || feature.attributes.driver,
                    impact: impactMap[feature.attributes.impact] || feature.attributes.impact,
                    crop: feature.attributes.crop_other || feature.attributes.crop,
                    descript: feature.attributes.descript,
                    url: feature.attributes.url,
                    start_date: feature.attributes.start_date,
                }));

                setAllData(formattedData);
                setLoading(false);

            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Container maxW="container.xl" py={8}>
                <VStack spacing={4}>
                    <Skeleton w="100%" h="40px" />
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} w="100%" h="60px" />
                    ))}
                </VStack>
            </Container>
        );
    }

    if (!loading && filteredData.length === 0) {
        return (
            <Container maxW="container.xl" py={8}>
                <Text textAlign="center" fontSize="lg">
                    No Crop Monitor events found for {COUNTRY_LABEL}
                </Text>
            </Container>
        );
    }

    return (
        <VStack spacing={4} align="stretch">
            <Heading size="md" py={2}>
                <Badge variant="subtle" colorScheme="green" fontSize="xl">
                    {COUNTRY_LABEL}
                </Badge>{" "}
                Crop Monitor Events Table
            </Heading>

            <Stack
                direction={{ base: "column", lg: "row" }}
                justify={'left'}
                mb={2}
                mt={2}
                spacing={2}
            >
                <ButtonGroup alignItems="right">
                    <Button
                        onClick={() => table.previousPage()}
                        isDisabled={!table.getCanPreviousPage()}
                        size="sm"
                        leftIcon={<ArrowBackIcon />}
                    >
                        Previous
                    </Button>
                    <Text alignSelf="center" px={4}>
                        Page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()}
                    </Text>
                    <Button
                        onClick={() => table.nextPage()}
                        isDisabled={!table.getCanNextPage()}
                        size="sm"
                        rightIcon={<ArrowForwardIcon />}
                    >
                        Next
                    </Button>
                </ButtonGroup>
                <Button
                    onClick={clearAllFilters}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    isDisabled={columnFilters.length === 0}
                >
                    Clear All Filters
                </Button>
            </Stack>

            <Table variant="simple" sx={{ tableLayout: "auto" }}>
                <Thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <Th key={header.id} colSpan={header.colSpan} width={header.column.columnDef.meta?.width || "auto"}>
                                    <VStack align="flex-start" spacing={1}>
                                        <Box
                                            onClick={header.column.getToggleSortingHandler()}
                                            cursor="pointer"
                                            _hover={{ bg: 'gray.100' }}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                            <span>
                                                {header.column.getIsSorted() === 'desc' ? (
                                                    <TriangleDownIcon ml={2} />
                                                ) : header.column.getIsSorted() === 'asc' ? (
                                                    <TriangleUpIcon ml={2} />
                                                ) : null}
                                            </span>
                                        </Box>

                                        {header.column.getCanFilter() && (
                                            header.column.id === 'impact' ? (
                                                <Select
                                                    value={header.column.getFilterValue() || ''}
                                                    onChange={e => header.column.setFilterValue(e.target.value)}
                                                    size="xs"
                                                    placeholder="All"
                                                    w="full"
                                                >
                                                    {Object.values(impactMap).map(impact => (
                                                        <option key={impact} value={impact}>{impact}</option>
                                                    ))}
                                                </Select>
                                            ) : (
                                                <Input
                                                    value={header.column.getFilterValue() || ''}
                                                    onChange={e => header.column.setFilterValue(e.target.value)}
                                                    placeholder={`Filter ${header.column.columnDef.header}`}
                                                    size="xs"
                                                    w="full"
                                                />
                                            )
                                        )}
                                    </VStack>
                                </Th>
                            ))}
                        </Tr>
                    ))}
                </Thead>
                <Tbody>
                    {table.getRowModel().rows.map(row => (
                        <Tr key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <Td key={cell.id} width={cell.column.columnDef.meta?.width || "auto"}>
                                    {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                    )}
                                </Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>

            <VStack justify="center" mt={2}>
                <Text fontSize="sm" mb={2}>
                    Showing {table.getRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} results
                </Text>
            </VStack>

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
                        <Heading as="h4" size="sm" paddingBottom={2}>
                            View the latest Crop Monitor Report at{' '}
                            <Link href="https://cropmonitor.org/index.php/cmreports/reports-archive/" isExternal>
                                cropmonitor.org/global-crop-monitor
                            </Link>
                        </Heading>
                        <Text>
                            The Crop Monitor events table provides information on significant events
                            affecting crop conditions globally. Events are categorized by impact
                            (Major/Minor, Positive/Negative) and driver (drought, flood, pest, etc.).
                        </Text>
                        <Text mt={2}>
                            Data is sourced from the GEOGLAM Crop Monitor initiative, which brings
                            together international, regional, and national organizations to assess
                            crop growing conditions and production prospects.
                        </Text>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>

            <Box paddingRight={2} paddingTop={2} textAlign="right" fontSize="xs">
                Source:{' '}
                <Link href="https://www.cropmonitor.org/" isExternal>
                    GEOGLAM Crop Monitor
                </Link>
            </Box>
        </VStack>
    );
};

export default CountryCMEventTable;