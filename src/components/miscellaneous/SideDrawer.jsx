import {
  Box,
  Text,
  Button,
  Input,
  Tooltip,
  Avatar,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  useToast,
  Badge,
  IconButton,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import { BellIcon, ChevronDownIcon, MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import api from "../../api/axios"; // ✅ IMPORTANT
import ChatLoading from "../ChatLoading";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const headerBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(7, 13, 24, 0.72)");
  const headerBorder = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.1)");
  const softBg = useColorModeValue("rgba(9,17,31,0.05)", "whiteAlpha.80");
  const softHover = useColorModeValue("rgba(9,17,31,0.10)", "whiteAlpha.200");
  const headingColor = useColorModeValue("midnight.900", "white");
  const menuBg = useColorModeValue("rgba(255, 251, 245, 0.98)", "rgba(7, 13, 24, 0.96)");
  const menuBorder = useColorModeValue("rgba(9,17,31,0.12)", "whiteAlpha.200");
  const menuHover = useColorModeValue("rgba(9,17,31,0.05)", "whiteAlpha.100");
  const drawerBg = useColorModeValue("rgba(255, 251, 245, 0.98)", "rgba(7, 13, 24, 0.96)");
  const iconColor = useColorModeValue("midnight.900", "white");

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something to search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get(`/api/user?search=${search}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSearchResult(data);
    } catch {
      toast({
        title: "Error occurred",
        description: "Failed to load search results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);

      const { data } = await api.post(
        "/api/chat",
        { userId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        position="relative"
        zIndex="20"
        bg={headerBg}
        w="100%"
        px={{ base: 4, md: 6 }}
        py={3}
        border={`1px solid ${headerBorder}`}
        borderRadius="24px"
        boxShadow="0 20px 60px rgba(0,0,0,0.28)"
        backdropFilter="blur(18px)"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            variant="ghost"
            color={headingColor}
            bg={softBg}
            _hover={{ bg: softHover }}
            onClick={onOpen}
          >
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          fontFamily="Bricolage Grotesque"
          color={headingColor}
          fontWeight="700"
          letterSpacing="0.04em"
        >
          Buddy Chat
        </Text>

        <Box display="flex" alignItems="center" gap={2}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === "dark" ? <SunIcon /> : <MoonIcon />}
            bg={softBg}
            color={headingColor}
            _hover={{ bg: softHover }}
            onClick={toggleColorMode}
          />
          <Button
            display={{ base: "none", lg: "inline-flex" }}
            bg={softBg}
            color={headingColor}
            _hover={{ bg: softHover }}
            onClick={toggleColorMode}
          >
            {colorMode === "dark" ? "Light Mode" : "Dark Mode"}
          </Button>

          <Menu placement="bottom-end">
            <MenuButton p={1} position="relative">
              {notification.length > 0 && (
                <Badge
                  colorScheme="red"
                  borderRadius="full"
                  position="absolute"
                  top="0"
                  right="0"
                  fontSize="0.8em"
                  px={2}
                  boxShadow={colorMode === "dark" ? "0 0 0 4px rgba(7, 13, 24, 0.72)" : "0 0 0 4px rgba(255,255,255,0.7)"}
                >
                  {notification.length}
                </Badge>
              )}
              <BellIcon fontSize="2xl" m={1} color={iconColor} />
            </MenuButton>

            <MenuList
              pl={2}
              bg={menuBg}
              color={headingColor}
              borderColor={menuBorder}
              zIndex="30"
            >
              {!notification.length && "No New Messages"}

              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  bg="transparent"
                  _hover={{ bg: menuHover }}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              bg={softBg}
              color={headingColor}
              rightIcon={<ChevronDownIcon />}
              _hover={{ bg: softHover }}
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>

            <MenuList
              bg={menuBg}
              color={headingColor}
              borderColor={menuBorder}
              zIndex="30"
            >
              <ProfileModal user={user}>
                <MenuItem bg="transparent" _hover={{ bg: menuHover }}>
                  My Profile
                </MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem
                bg="transparent"
                _hover={{ bg: menuHover }}
                onClick={logoutHandler}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent
          bg={drawerBg}
          color={headingColor}
          borderRight={`1px solid ${headerBorder}`}
        >
          <DrawerHeader borderBottomWidth="1px" borderColor={menuBorder}>
            Search Users
          </DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button
                bg="brand.400"
                color="midnight.900"
                _hover={{ bg: "brand.300" }}
                onClick={handleSearch}
              >
                Go
              </Button>
            </Box>

            {loading ? (
              <ChatLoading />
            ) : (
              searchResult.map((u) => (
                <UserListItem
                  key={u._id}
                  user={u}
                  handleFunction={() => accessChat(u._id)}
                />
              ))
            )}

            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
