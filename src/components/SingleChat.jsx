import {
  Box,
  Text,
  Input,
  FormControl,
  IconButton,
  Spinner,
  useToast,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
  Avatar,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import { FiSend, FiSmile, FiTrash2 } from "react-icons/fi";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

import api from "../api/axios";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = import.meta.env.VITE_API_BASE_URL;
let socketInstance = null;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const toast = useToast();
  const cancelRef = useRef();
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);
  const notificationIdsRef = useRef(new Set());
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
  } = ChatState();

  const chatBg = useColorModeValue(
    "rgba(9,17,31,0.02)",
    "rgba(255,255,255,0.03)"
  );
  const composerBg = useColorModeValue(
    "rgba(9,17,31,0.03)",
    "rgba(255,255,255,0.04)"
  );
  const inputBg = useColorModeValue("rgba(9,17,31,0.04)", "whiteAlpha.120");
  const borderColor = useColorModeValue(
    "rgba(9,17,31,0.08)",
    "rgba(255,255,255,0.08)"
  );
  const headerBg = useColorModeValue(
    "rgba(9,17,31,0.02)",
    "rgba(255,255,255,0.03)"
  );
  const headingColor = useColorModeValue("midnight.900", "white");
  const subText = useColorModeValue("midnight.600", "whiteAlpha.700");
  const softBg = useColorModeValue("rgba(9,17,31,0.05)", "whiteAlpha.120");
  const softHover = useColorModeValue("rgba(9,17,31,0.10)", "whiteAlpha.200");
  const emptyBg = useColorModeValue(
    "rgba(9,17,31,0.03)",
    "rgba(255,255,255,0.04)"
  );
  const outlineBorder = useColorModeValue(
    "rgba(9,17,31,0.16)",
    "whiteAlpha.300"
  );

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    notificationIdsRef.current = new Set(notification.map((item) => item._id));
  }, [notification]);

  useEffect(() => {
    if (!user?._id) return;

    if (!socketInstance) {
      socketInstance = io(ENDPOINT, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 300,
      });
    }

    socketRef.current = socketInstance;
    socketInstance.emit("setup", user);

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    const handleIncomingMessage = (msg) => {
      const activeChat = selectedChatRef.current;

      if (activeChat && msg.chat?._id === activeChat._id) {
        setMessages((prev) => {
          const withoutTemp = prev.filter(
            (item) =>
              !(
                String(item._id).startsWith("temp-") &&
                item.content === msg.content &&
                item.sender?._id === msg.sender?._id
              )
          );

          if (withoutTemp.some((item) => item._id === msg._id)) {
            return withoutTemp;
          }

          return [...withoutTemp, msg];
        });
        return;
      }

      if (notificationIdsRef.current.has(msg._id)) return;

      notificationIdsRef.current.add(msg._id);
      setNotification((prev) => [msg, ...prev]);
      setFetchAgain((prev) => !prev);
    };

    socketInstance.off("typing", handleTyping);
    socketInstance.off("stop typing", handleStopTyping);
    socketInstance.off("message recieved", handleIncomingMessage);

    socketInstance.on("typing", handleTyping);
    socketInstance.on("stop typing", handleStopTyping);
    socketInstance.on("message recieved", handleIncomingMessage);

    return () => {
      socketInstance.off("typing", handleTyping);
      socketInstance.off("stop typing", handleStopTyping);
      socketInstance.off("message recieved", handleIncomingMessage);
    };
  }, [user, setFetchAgain, setNotification]);

  useEffect(() => {
    if (!selectedChat?._id || !socketRef.current) return;
    socketRef.current.emit("join chat", selectedChat._id);
  }, [selectedChat]);

  const fetchMessages = async (chatOverride) => {
    const activeChat = chatOverride || selectedChatRef.current;
    if (!activeChat?._id || !user?.token) return;

    try {
      setLoading(true);

      const { data } = await api.get(`/api/message/${activeChat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (selectedChatRef.current?._id === activeChat._id) {
        setMessages(data);
      }
    } catch {
      toast({ title: "Failed to load messages", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(selectedChat);
  }, [selectedChat]);

  const stopTyping = () => {
    if (!socketRef.current || !selectedChatRef.current?._id) return;

    socketRef.current.emit("stop typing", selectedChatRef.current._id);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const sendMessage = async () => {
    const content = newMessage.trim();
    if (!content || !selectedChat?._id || sendingMessage) return;

    const optimisticMessage = {
      _id: `temp-${Date.now()}`,
      content,
      chat: { _id: selectedChat._id },
      sender: {
        _id: user._id,
        name: user.name,
        pic: user.pic,
        email: user.email,
      },
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    setNewMessage("");
    setShowEmoji(false);
    setSendingMessage(true);
    setMessages((prev) => [...prev, optimisticMessage]);
    stopTyping();

    try {
      const { data } = await api.post(
        "/api/message",
        { content, chatId: selectedChat._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMessages((prev) =>
        prev.map((item) => (item._id === optimisticMessage._id ? data : item))
      );

      socketRef.current?.emit("new message", data);
    } catch {
      setMessages((prev) =>
        prev.filter((item) => item._id !== optimisticMessage._id)
      );
      setNewMessage(content);
      toast({ title: "Message failed", status: "error" });
    } finally {
      setSendingMessage(false);
    }
  };

  const typingHandler = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!socketRef.current || !selectedChat?._id) return;

    if (value.trim()) {
      socketRef.current.emit("typing", selectedChat._id);
    } else {
      stopTyping();
      return;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1200);
  };

  const deleteChat = async () => {
    try {
      await api.delete(`/api/chat/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      toast({ title: "Chat deleted", status: "success" });
      setSelectedChat(null);
      setFetchAgain((prev) => !prev);
      onClose();
    } catch {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  if (!selectedChat) {
    return (
      <Box h="100%" display="flex" justifyContent="center" alignItems="center" p={8}>
        <VStack
          spacing={4}
          textAlign="center"
          bg={emptyBg}
          border={`1px solid ${borderColor}`}
          borderRadius="28px"
          px={10}
          py={12}
          maxW="460px"
        >
          <Text fontSize="3xl" fontWeight="700" color={headingColor}>
            Select a conversation
          </Text>
          <Text color={subText} lineHeight="1.8">
            Choose a chat from the sidebar to start messaging in a cleaner,
            faster workspace.
          </Text>
        </VStack>
      </Box>
    );
  }

  const otherUser = !selectedChat.isGroupChat
    ? getSenderFull(user, selectedChat.users)
    : null;

  return (
    <>
      <Box
        px={{ base: 4, md: 6 }}
        py={4}
        borderBottom={`1px solid ${borderColor}`}
        bg={headerBg}
      >
        <HStack justify="space-between" align="center" spacing={3}>
          <HStack spacing={3} minW={0}>
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat(null)}
              aria-label="Back"
              bg={softBg}
              color={headingColor}
              _hover={{ bg: softHover }}
            />

            {!selectedChat.isGroupChat ? (
              <>
                <Avatar
                  size="md"
                  name={otherUser?.name}
                  src={otherUser?.pic}
                  border="2px solid rgba(201,162,39,0.45)"
                />
                <VStack align="start" spacing={0} minW={0}>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    color={headingColor}
                    fontWeight="700"
                    noOfLines={1}
                  >
                    {getSender(user, selectedChat.users)}
                  </Text>
                  <Text fontSize="sm" color={subText} noOfLines={1}>
                    Direct conversation
                  </Text>
                </VStack>
                <ProfileModal user={otherUser} />
              </>
            ) : (
              <>
                <VStack align="start" spacing={0} minW={0}>
                  <Text
                    fontSize={{ base: "xl", md: "2xl" }}
                    color={headingColor}
                    fontWeight="700"
                    noOfLines={1}
                  >
                    {selectedChat.chatName}
                  </Text>
                  <Text fontSize="sm" color={subText}>
                    Group conversation
                  </Text>
                </VStack>
                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </HStack>

          <IconButton
            icon={<FiTrash2 />}
            aria-label="Delete chat"
            color={headingColor}
            bg="rgba(229, 62, 62, 0.18)"
            border="1px solid rgba(252, 129, 129, 0.28)"
            _hover={{ bg: "rgba(229, 62, 62, 0.28)" }}
            onClick={onOpen}
          />
        </HStack>
      </Box>

      <Box
        display="flex"
        flexDir="column"
        bg={chatBg}
        p={{ base: 3, md: 4 }}
        h="100%"
        overflow="hidden"
        position="relative"
      >
        <Box flex="1" overflowY="auto" pr={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" pt={8}>
              <Spinner color="brand.300" size="lg" />
            </Box>
          ) : (
            <ScrollableChat messages={messages} />
          )}

          {isTyping && (
            <Text fontSize="sm" color="brand.200" mt={2} ml={3}>
              Typing...
            </Text>
          )}
        </Box>

        {showEmoji && (
          <Box
            position="absolute"
            bottom={{ base: "88px", md: "92px" }}
            left={{ base: "12px", md: "18px" }}
            zIndex="1000"
          >
            <EmojiPicker
              onEmojiClick={(emojiData) =>
                setNewMessage((prev) => prev + emojiData.emoji)
              }
            />
          </Box>
        )}

        <FormControl mt={3}>
          <HStack
            gap={2}
            alignItems="center"
            bg={composerBg}
            border={`1px solid ${borderColor}`}
            borderRadius="24px"
            p={2}
          >
            <IconButton
              icon={<FiSmile />}
              aria-label="Emoji picker"
              bg={softBg}
              color={headingColor}
              _hover={{ bg: softHover }}
              onClick={() => setShowEmoji((prev) => !prev)}
            />

            <Input
              bg={inputBg}
              border="none"
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Write a message..."
              _focusVisible={{
                boxShadow: "none",
              }}
            />

            <IconButton
              bg="brand.400"
              color="midnight.900"
              icon={sendingMessage ? <Spinner size="sm" /> : <FiSend />}
              aria-label="Send message"
              _hover={{ bg: "brand.300" }}
              isDisabled={!newMessage.trim() || sendingMessage}
              onClick={sendMessage}
            />
          </HStack>
        </FormControl>
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Chat?</AlertDialogHeader>
            <AlertDialogBody>
              This will permanently delete the conversation.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                variant="outline"
                borderColor={outlineBorder}
                color={headingColor}
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button colorScheme="red" ml={3} onClick={deleteChat}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default SingleChat;
