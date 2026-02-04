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
} from "@chakra-ui/react";
import { ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

import api from "../api/axios"; // ✅ IMPORTANT
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = import.meta.env.VITE_API_BASE_URL; // ✅ FIX
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const toast = useToast();
  const cancelRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
  } = ChatState();

  const chatBg = useColorModeValue("gray.100", "gray.900");
  const inputBg = useColorModeValue("gray.200", "gray.700");

  // ================= SOCKET CONNECT =================
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => socket.disconnect();
  }, [user]);

  // ================= FETCH MESSAGES =================
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await api.get(`/api/message/${selectedChat._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setMessages(data);
      socket.emit("join chat", selectedChat._id);
      setLoading(false);
    } catch {
      toast({ title: "Failed to load messages", status: "error" });
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat]);

  // ================= RECEIVE REAL TIME =================
  useEffect(() => {
    if (!socket) return;

    socket.on("message recieved", (msg) => {
      if (!selectedChat || msg.chat._id !== selectedChat._id) {
        if (!notification.find((n) => n._id === msg._id)) {
          setNotification((prev) => [msg, ...prev]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("message recieved");
  }, [selectedChat, notification]);

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    socket.emit("stop typing", selectedChat._id);

    try {
      const { data } = await api.post(
        "/api/message",
        { content: newMessage, chatId: selectedChat._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setNewMessage("");
      socket.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch {
      toast({ title: "Message failed", status: "error" });
    }
  };

  // ================= TYPING =================
  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    const lastTime = new Date().getTime();
    setTimeout(() => {
      if (new Date().getTime() - lastTime >= 3000 && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, 3000);
  };

  // ================= DELETE CHAT =================
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

  // ================= UI =================
  return selectedChat ? (
    <>
      <Text fontSize="xl" pb={3} px={2} display="flex" justifyContent="space-between">
        <IconButton
          display={{ base: "flex", md: "none" }}
          icon={<ArrowBackIcon />}
          onClick={() => setSelectedChat(null)}
        />

        {!selectedChat.isGroupChat ? (
          <>
            {getSender(user, selectedChat.users)}
            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
          </>
        ) : (
          <>
            {selectedChat.chatName}
            <UpdateGroupChatModal
              fetchMessages={fetchMessages}
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
            />
          </>
        )}

        <IconButton icon={<DeleteIcon />} colorScheme="red" size="sm" onClick={onOpen} />
      </Text>

      <Box flex="1" display="flex" flexDir="column" bg={chatBg} p={3}>
        <Box flex="1" overflowY="auto">
          {loading ? <Spinner /> : <ScrollableChat messages={messages} />}
          {isTyping && <Text fontSize="sm">Typing...</Text>}
        </Box>

        <FormControl mt={2}>
          <Box display="flex" gap={2}>
            <IconButton icon={<span>😄</span>} onClick={() => setShowEmoji((p) => !p)} />
            <Input
              bg={inputBg}
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Enter a message..."
            />
            <IconButton icon={<span>➤</span>} onClick={sendMessage} />
          </Box>
        </FormControl>
      </Box>

      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Chat?</AlertDialogHeader>
            <AlertDialogBody>This will permanently delete the conversation.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" ml={3} onClick={deleteChat}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  ) : (
    <Box h="100%" display="flex" justifyContent="center" alignItems="center">
      <Text fontSize="2xl">Click a user to start chatting 💬</Text>
    </Box>
  );
};

export default SingleChat;
