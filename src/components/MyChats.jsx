import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Stack,
  Text,
  Button,
  useToast,
  useColorModeValue,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  Badge,
  Avatar,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import API from "../config/api";
import { getSender, getSenderFull } from "../config/ChatLogics.js";
import ChatLoading from "./ChatLoading.jsx";
import GroupChatModal from "./miscellaneous/GroupChatModel.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";
import OnlineAvatar from "./OnlineAvatar.jsx";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const panelBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(7, 13, 24, 0.72)");
  const panelBorder = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.1)");
  const innerBg = useColorModeValue("rgba(9,17,31,0.04)", "rgba(255,255,255,0.04)");
  const cardBg = useColorModeValue("rgba(9,17,31,0.05)", "rgba(255,255,255,0.06)");
  const cardHover = useColorModeValue("rgba(9,17,31,0.10)", "rgba(255,255,255,0.12)");
  const headingColor = useColorModeValue("midnight.900", "white");
  const subText = useColorModeValue("midnight.600", "whiteAlpha.700");

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    onlineUsers,
  } = ChatState();
  const toast = useToast();

  const fetchChats = useCallback(async () => {
    if (!user?.token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await API.get("/api/chat", config);
      setChats(data);
    } catch {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [toast, user?.token, setChats]);

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain, fetchChats]);

  const filteredChats = useMemo(() => {
    if (!chats) return [];

    const query = searchTerm.trim().toLowerCase();
    if (!query) return chats;

    return chats.filter((chat) => {
      const chatLabel = chat.isGroupChat
        ? chat.chatName
        : getSender(loggedUser, chat.users);
      return chatLabel?.toLowerCase().includes(query);
    });
  }, [chats, loggedUser, searchTerm]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", lg: "flex" }}
      flexDir="column"
      alignItems="center"
      p={4}
      bg={panelBg}
      w={{ base: "100%", lg: "31%" }}
      borderRadius={{ base: "24px", md: "28px" }}
      border={`1px solid ${panelBorder}`}
      boxShadow="0 20px 60px rgba(0,0,0,0.28)"
      backdropFilter="blur(18px)"
      h={{ base: "calc(100dvh - 116px)", lg: "auto" }}
    >
      <Box
        pb={4}
        px={2}
        fontSize={{ base: "26px", md: "28px" }}
        fontFamily="Bricolage Grotesque"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color={headingColor}
        fontWeight="700"
      >
        My Chats
        <GroupChatModal>
          <Button
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            bg="brand.400"
            color="midnight.900"
            rightIcon={<AddIcon />}
            _hover={{ bg: "brand.300" }}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>

      <InputGroup mb={3}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color={subText} />
        </InputLeftElement>
        <Input
          placeholder="Search chats"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          borderRadius="16px"
          color={headingColor}
        />
      </InputGroup>

      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg={innerBg}
        w="100%"
        h="100%"
        borderRadius="24px"
        overflowY="hidden"
        border={`1px solid ${panelBorder}`}
      >
        {chats ? (
          <Stack overflowY="scroll">
            {filteredChats.map((chat) => {
              const otherUser = !chat.isGroupChat
                ? getSenderFull(loggedUser, chat.users)
                : null;
              const isOtherUserOnline = onlineUsers.some(
                (onlineUserId) => String(onlineUserId) === String(otherUser?._id)
              );
              const unreadCount = notification.filter(
                (item) => item.chat?._id === chat._id
              ).length;

              return (
                <Box
                  key={chat._id}
                  onClick={() => setSelectedChat(chat)}
                  cursor="pointer"
                  bg={
                    selectedChat === chat
                      ? "linear-gradient(135deg, rgba(201,162,39,0.98), rgba(221,195,122,0.92))"
                      : cardBg
                  }
                  color={selectedChat === chat ? "midnight.900" : "white"}
                  px={3}
                  py={3}
                  borderRadius="20px"
                  border={`1px solid ${panelBorder}`}
                  transition="all 0.2s ease"
                  _hover={{
                    transform: "translateY(-1px)",
                    bg:
                      selectedChat === chat
                        ? "linear-gradient(135deg, rgba(201,162,39,0.98), rgba(221,195,122,0.92))"
                        : cardHover,
                  }}
                >
                  <HStack justify="space-between" align="start">
                    <HStack align="start" spacing={3}>
                      {chat.isGroupChat ? (
                        <Badge colorScheme="purple" borderRadius="full" px={3} py={1}>
                          Group
                        </Badge>
                      ) : (
                        <OnlineAvatar
                          src={otherUser?.pic}
                          name={otherUser?.name}
                          isOnline={isOtherUserOnline}
                        />
                      )}

                      <Box>
                        <Text fontWeight="600" color={selectedChat === chat ? "midnight.900" : headingColor}>
                          {!chat.isGroupChat
                            ? getSender(loggedUser, chat.users)
                            : chat.chatName}
                        </Text>

                        {chat.latestMessage && (
                          <Text
                            fontSize="xs"
                            color={selectedChat === chat ? "midnight.700" : subText}
                          >
                            <b>{chat.latestMessage.sender.name} : </b>
                            {chat.latestMessage.content
                              ? chat.latestMessage.content.length > 50
                                ? `${chat.latestMessage.content.substring(0, 51)}...`
                                : chat.latestMessage.content
                              : "Attachment"}
                          </Text>
                        )}
                      </Box>
                    </HStack>

                    {unreadCount > 0 && (
                      <Badge colorScheme="red" borderRadius="full" px={2}>
                        {unreadCount}
                      </Badge>
                    )}
                  </HStack>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
