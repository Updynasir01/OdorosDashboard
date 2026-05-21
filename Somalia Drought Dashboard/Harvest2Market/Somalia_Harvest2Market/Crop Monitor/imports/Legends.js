import {
  Box,
  Heading,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Tag,
  TagLabel,
  TagRightIcon,
  useColorModeValue,
} from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

export const CalendarsLegend = () => {
  return (
    <Box
      w="fit-content"
      bg={useColorModeValue('white', 'blackAlpha.400')}
      color={useColorModeValue('black', 'white')}
      fontFamily="mono"
    >
      <Box p={2} fontSize="sm" fontWeight="medium">
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{
                fill: 'rgb(255 255 255)',
                strokeWidth: 8,
                stroke: 'rgba(115,179,209,255)',
              }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Planting-Early Vegetative</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{
                fill: 'rgb(255 255 255)',
                strokeWidth: '8',
                stroke: 'rgba(168,64,230,255)',
              }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Vegetative-Reproductive</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{
                fill: 'rgb(255 255 255)',
                strokeWidth: 8,
                stroke: 'rgba(230,169,28,255)',
              }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Ripening Through Harvest</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{
                fill: 'rgb(255 255 255)',
                strokeWidth: 8,
                stroke: 'rgba(255,75,20,255)',
              }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Harvest (End of Season)</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{
                fill: 'rgb(255 255 255)',
                strokeWidth: 8,
                stroke: 'rgba(193,193,200,255)',
              }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Not Monitored</small>
        </Flex>
      </Box>
      <Box textAlign="center" pb={0.5}>
        <Link to="https://cropmonitor.org/" target="_blank">
          <Tag size="sm" fontFamily="mono" colorScheme="ghost">
            <TagLabel>GEOGLAM Crop Monitor</TagLabel>
            <TagRightIcon as={ExternalLinkIcon} />
          </Tag>
        </Link>
      </Box>
    </Box>
  );
};

export const ConditionsLegend = () => {
  return (
    <Box
      w="fit-content"
      // p={2}
      bg={useColorModeValue('white', 'blackAlpha.400')}
      color={useColorModeValue('black', 'white')}
      fontFamily="mono"
    >
      {/* <Heading size="xs" fontWeight="medium">
        LEGEND
      </Heading> */}
      <Box p={2} fontSize="sm" fontWeight="medium">
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#008fc9', strokeWidth: 1, stroke: '#008fc9' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Exceptional</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#43cf39', strokeWidth: 1, stroke: '#43cf39' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Favourable</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#f5ef00', strokeWidth: 1, stroke: '#f5ef00' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Watch</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#f15921', strokeWidth: 1, stroke: '#f15921' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Poor</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#a80000', strokeWidth: 1, stroke: '#a80000' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Failure</small>
        </Flex>

        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#787878', strokeWidth: 1, stroke: '#787878' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Out of Season</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#824100', strokeWidth: 1, stroke: '#824100' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;No Data</small>
        </Flex>
      </Box>
      <Box textAlign="center" pb={0.5}>
        <Link to="https://cropmonitor.org/" target="_blank">
          <Tag size="sm" fontFamily="mono" colorScheme="ghost">
            <TagLabel>GEOGLAM Crop Monitor</TagLabel>
            <TagRightIcon as={ExternalLinkIcon} />
          </Tag>
        </Link>
      </Box>
    </Box>
  );
};

export const ConditionsChangesLegend = () => {
  return (
    <Box
      w="fit-content"
      // p={2}
      bg={useColorModeValue('white', 'blackAlpha.400')}
      color={useColorModeValue('black', 'white')}
      fontFamily="mono"
    >
      {/* <Heading size="xs" fontWeight="medium">
        LEGEND
      </Heading> */}
      <Box p={2} fontSize="sm" fontWeight="medium">
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#43cf39', strokeWidth: 1, stroke: '#43cf39' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Positive</small>
        </Flex>
        <Flex p={0.5}>
          <svg width="35" height="20">
            <rect
              width="35"
              height="20"
              style={{ fill: '#f15921', strokeWidth: 1, stroke: '#f15921' }}
            ></rect>
          </svg>
          <small>&nbsp;&nbsp;Negative</small>
        </Flex>
      </Box>
      <Box textAlign="center" pb={0.5}>
        <Link to="https://cropmonitor.org/" target="_blank">
          <Tag size="sm" fontFamily="mono" colorScheme="ghost">
            <TagLabel>GEOGLAM Crop Monitor</TagLabel>
            <TagRightIcon as={ExternalLinkIcon} />
          </Tag>
        </Link>
      </Box>
    </Box>
  );
};
