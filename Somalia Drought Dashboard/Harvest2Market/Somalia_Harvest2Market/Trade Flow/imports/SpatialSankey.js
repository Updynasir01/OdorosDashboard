import React from 'react';
import { Line } from 'react-simple-maps';
import { Card, HStack, Text, VStack, Box } from '@chakra-ui/react';

const formatNumber = (num) => {
  if (num >= 1000000) {
    const divided = num / 1000000;
    const formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1);
    return `$${formatted} B`;
  } else if (num >= 1000) {
    const divided = num / 1000;
    const formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1);
    return `$${formatted} MM`;
  } else if (num >= 100) {
    const divided = num / 100;
    const formatted = divided.toFixed(0);
    return `$${formatted} K`;
  } else if (num >= 10) {
    const divided = num / 10;
    const formatted = divided % 1 === 0 ? divided.toFixed(0) : divided.toFixed(1);
    return `$${formatted} hundred`;
  } else {
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
  }
};

export const Legend = ({ smallThreshold, mediumThreshold, roundedMax }) => {
  return (
    <Card position="absolute" bottom={1} p={3} boxShadow="md">
      <VStack spacing={2} align="stretch">
        <HStack spacing={3}>
          <Box w="30px" h="5px" bg="blue.500" opacity={0.5} />
          <Text fontSize="xs"> ≤ {formatNumber(smallThreshold)} </Text>
        </HStack>
        <HStack spacing={3}>
          <Box w="30px" h="7px" bg="blue.500" opacity={0.5} />
          <Text fontSize="xs"> ≤ {formatNumber(mediumThreshold)} </Text>
        </HStack>
        <HStack spacing={3}>
          <Box w="30px" h="10px" bg="blue.500" opacity={0.5} />
          <Text fontSize="xs">  ≤ {formatNumber(roundedMax)} </Text>
        </HStack>
      </VStack>
    </Card>
  );
};

export const SpatialSankey = ({ data, smallThreshold, mediumThreshold, roundedMax, scaleFactor = 1 }) => {
  if (data.length === 0) return null;

  return (
    <>
      {data.map((trade, idx) => {
        // Calculate scaled stroke width
        let strokeWidth = 1; // default
        if (trade.value <= smallThreshold) {
          strokeWidth = 1;
        } else if (trade.value <= mediumThreshold) {
          strokeWidth = 3;
        } else {
          strokeWidth = 5;
        }

        // Apply scale factor
        strokeWidth *= scaleFactor;

        return (
          <Line
            key={idx}
            from={trade.sourceCoordinates}
            to={trade.targetCoordinates}
            stroke="#3182CE"
            strokeWidth={Math.max(0.5, strokeWidth)} // Ensure minimum visibility
            strokeLinecap="round"
            opacity={0.6}
            markerEnd="url(#arrow)"
          />
        );
      })}
    </>
  );
};