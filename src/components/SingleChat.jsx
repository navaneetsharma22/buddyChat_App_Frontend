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
import axios from "axios";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

const ENDPOINT = "http://localhost:5000";
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

  // ================= SOCKET CONNECT ONCE =================
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);

    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    return () => socket.disconnect();
  }, []);

  // ================= FETCH MESSAGES =================
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

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

  // ================= SEND =================
  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage.trim()) {
      socket.emit("stop typing", selectedChat._id);

      try {
        const { data } = await axios.post(
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

  // ================= DELETE =================
  const deleteChat = async () => {
    try {
      await axios.delete(`/api/chat/${selectedChat._id}`, {
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

  return selectedChat ? (
    <>
      {/* HEADER */}
      <Text
        fontSize="xl"
        pb={3}
        px={2}
        w="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
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

        <IconButton
          icon={<DeleteIcon />}
          colorScheme="red"
          size="sm"
          onClick={onOpen}
        />
      </Text>

      {/* BODY */}
      <Box
        flex="1"
        display="flex"
        flexDir="column"
        bg={chatBg}
        p={3}
        borderRadius="lg"
        overflow="hidden"
      >
        <Box flex="1" overflowY="auto">
          {loading ? <Spinner size="xl" /> : <ScrollableChat messages={messages} />}

          {isTyping && (
            <Text fontSize="sm" color="gray.500" mt={2}>
              Typing...
            </Text>
          )}
        </Box>

        {showEmoji && (
          <Box position="absolute" bottom="70px" left="15px" zIndex="1000">
            <EmojiPicker
              onEmojiClick={(e) =>
                setNewMessage((prev) => prev + e.emoji)
              }
            />
          </Box>
        )}

        {/* <FormControl onKeyDown={sendMessage} mt={2}>
          <Box display="flex" gap={2}>
            <IconButton
              icon={<span style={{ fontSize: 22 }}>😄</span>}
              variant="ghost"
              onClick={() => setShowEmoji((p) => !p)}
            />

            <Input
              bg={inputBg}
              placeholder="Enter a message..."
              value={newMessage}
              onChange={typingHandler}
            />
          </Box>
        </FormControl> */}
        <FormControl mt={2}>
  <Box display="flex" gap={2} alignItems="center">

    {/* Emoji button */}
    <IconButton
      icon={<span style={{ fontSize: 22 }}>😄</span>}
      variant="ghost"
      onClick={() => setShowEmoji((p) => !p)}
    />

    {/* Input */}
    <Input
      bg={inputBg}
      placeholder="Enter a message..."
      value={newMessage}
      onChange={typingHandler}
      onKeyDown={(e) => e.key === "Enter" && sendMessage(e)}
    />

    {/* Send button */}
    <IconButton
      colorScheme="blue"
      icon={<span style={{ fontSize: "18px" }}>➤</span>}
      onClick={() =>
        sendMessage({ key: "Enter" })
      }
    />

  </Box>
</FormControl>

      </Box>

      {/* DELETE DIALOG */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Chat?</AlertDialogHeader>
            <AlertDialogBody>
              This will permanently delete the conversation.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>Cancel</Button>
              <Button colorScheme="red" ml={3} onClick={deleteChat}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  ) : (
    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
      <Text fontSize="2xl">Click a user to start chatting 💬</Text>
    </Box>
  );
};

export default SingleChat;
