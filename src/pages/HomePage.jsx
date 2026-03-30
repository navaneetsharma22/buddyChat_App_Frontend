import React, { useEffect } from "react";
import {
  Container,
  Box,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
  useColorMode,
  IconButton,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Login from "../components/authentication/Login";
import Signup from "../components/authentication/Signup";

function HomePage() {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const { colorMode, toggleColorMode } = useColorMode();
  const panelBg = useColorModeValue("rgba(255,255,255,0.62)", "rgba(255,255,255,0.06)");
  const panelBorder = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.1)");
  const formBg = useColorModeValue("rgba(255,250,242,0.82)", "rgba(7, 13, 24, 0.78)");
  const softBg = useColorModeValue("rgba(9,17,31,0.05)", "whiteAlpha.100");
  const bodyText = useColorModeValue("midnight.700", "whiteAlpha.800");
  const headingColor = useColorModeValue("midnight.900", "white");
  const toggleLabelBg = useColorModeValue("rgba(255,255,255,0.75)", "rgba(7, 13, 24, 0.68)");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      navigate("/chats");
    }
  }, [navigate]);

  return (
    <Container
      maxW="7xl"
      centerContent
      pt={{ base: 24, md: 14 }}
      pb={{ base: 8, md: 14 }}
      px={{ base: 4, md: 6 }}
    >
      <Box
        position="fixed"
        top={{ base: 4, md: 6 }}
        right={{ base: 4, md: 6 }}
        zIndex="30"
      >
        <HStack
          spacing={3}
          px={3}
          py={2}
          bg={toggleLabelBg}
          border={`1px solid ${panelBorder}`}
          borderRadius="full"
          boxShadow="0 18px 40px rgba(0,0,0,0.14)"
          backdropFilter="blur(14px)"
        >
          <Text fontSize="sm" fontWeight="600" color={headingColor}>
            {colorMode === "dark" ? "Dark Mode" : "Light Mode"}
          </Text>
          <IconButton
            aria-label="Toggle light and dark mode"
            icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
            bg="brand.400"
            color="midnight.900"
            _hover={{ bg: "brand.300" }}
            onClick={toggleColorMode}
          />
        </HStack>
      </Box>

      <Box
        display="flex"
        flexDir={{ base: "column", lg: "row" }}
        alignItems="stretch"
        gap={6}
        w="100%"
      >
        <Box
          order={{ base: 2, lg: 1 }}
          flex="1"
          p={{ base: 6, md: 10 }}
          borderRadius="32px"
          bg={panelBg}
          border={`1px solid ${panelBorder}`}
          boxShadow="0 30px 80px rgba(0,0,0,0.28)"
          backdropFilter="blur(18px)"
          minH={{ lg: "560px" }}
          display="flex"
          flexDir="column"
          justifyContent="space-between"
        >
          <VStack align="start" spacing={6}>
            <Badge
              px={4}
              py={1.5}
              borderRadius="full"
              bg="brand.400"
              color="midnight.900"
              fontSize="0.75rem"
              textTransform="uppercase"
              letterSpacing="0.12em"
            >
              Premium Messaging
            </Badge>

            <Text
              fontSize={{ base: "3xl", md: "5xl" }}
              lineHeight="1"
              fontWeight="700"
              color={headingColor}
            >
              Buddy-Chat
            </Text>

            <Text
              fontSize={{ base: "md", md: "xl" }}
              color={bodyText}
              maxW="560px"
              lineHeight={{ base: "1.7", md: "1.8" }}
            >
              A polished private messaging workspace for direct chats, group
              conversations, instant notifications, and real-time collaboration.
            </Text>
          </VStack>

          <HStack
            spacing={4}
            mt={10}
            flexWrap="wrap"
            color={bodyText}
            fontSize="sm"
          >
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              bg={softBg}
              border={`1px solid ${panelBorder}`}
            >
              Real-time chat
            </Box>
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              bg={softBg}
              border={`1px solid ${panelBorder}`}
            >
              Group management
            </Box>
            <Box
              px={4}
              py={3}
              borderRadius="2xl"
              bg={softBg}
              border={`1px solid ${panelBorder}`}
            >
              Secure account access
            </Box>
          </HStack>
        </Box>

        <Box
          order={{ base: 1, lg: 2 }}
          display="flex"
          flexDir="column"
          justifyContent="center"
          p={{ base: 5, md: 6 }}
          bg={formBg}
          w={{ base: "100%", lg: "460px" }}
          borderRadius="32px"
          border={`1px solid ${panelBorder}`}
          boxShadow="0 24px 64px rgba(0,0,0,0.35)"
          backdropFilter="blur(18px)"
        >
          <Box
            display="flex"
            justifyContent="center"
            p={4}
            bg={softBg}
            w="100%"
            mb={5}
            borderRadius="24px"
            border={`1px solid ${panelBorder}`}
          >
            <Text
              fontSize="2xl"
              textAlign="center"
              fontFamily="Bricolage Grotesque"
              color={headingColor}
              fontWeight="700"
              letterSpacing="0.04em"
            >
              {tabIndex === 1 ? "Welcome" : "Welcome Back"}
            </Text>
          </Box>

          <Box bg="transparent" w="100%" p={1} borderRadius="lg" color={headingColor}>
            <Tabs
              variant="soft-rounded"
              colorScheme="yellow"
              isFitted
              index={tabIndex}
              onChange={setTabIndex}
            >
              <TabList
                mb="1.25rem"
                bg={softBg}
                borderRadius="full"
                p={1}
              >
                <Tab
                  w="50%"
                  color={bodyText}
                  _selected={{
                    bg: "brand.400",
                    color: "midnight.900",
                    boxShadow: "0 10px 30px rgba(201, 162, 39, 0.28)",
                  }}
                >
                  Login
                </Tab>
                <Tab
                  w="50%"
                  color={bodyText}
                  _selected={{
                    bg: "brand.400",
                    color: "midnight.900",
                    boxShadow: "0 10px 30px rgba(201, 162, 39, 0.28)",
                  }}
                >
                  Sign Up
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={1}>
                  <Login />
                </TabPanel>
                <TabPanel px={1}>
                  <Signup />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default HomePage;
