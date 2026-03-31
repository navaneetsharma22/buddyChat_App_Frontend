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
  HStack,
  VStack,
  InputGroup,
  InputLeftElement,
  Badge,
  Divider,
  CloseButton,
} from "@chakra-ui/react";
import { ArrowBackIcon, SearchIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiEdit2, FiPaperclip, FiSend, FiSmile, FiTrash2 } from "react-icons/fi";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import api from "../api/axios";
import { API_BASE_URL } from "../config/runtime";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import OnlineAvatar from "./OnlineAvatar";

const ENDPOINT = API_BASE_URL;
let socketInstance = null;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageSearch, setMessageSearch] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const toast = useToast();
  const cancelRef = useRef();
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);
  const notificationIdsRef = useRef(new Set());
  const fileInputRef = useRef(null);
  const userRef = useRef(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    setChats,
    onlineUsers,
    setOnlineUsers,
  } = ChatState();

  const chatBg = useColorModeValue("rgba(9,17,31,0.02)", "rgba(255,255,255,0.03)");
  const composerBg = useColorModeValue("rgba(9,17,31,0.03)", "rgba(255,255,255,0.04)");
  const inputBg = useColorModeValue("rgba(9,17,31,0.04)", "whiteAlpha.120");
  const borderColor = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.08)");
  const headerBg = useColorModeValue("rgba(9,17,31,0.02)", "rgba(255,255,255,0.03)");
  const headingColor = useColorModeValue("midnight.900", "white");
  const subText = useColorModeValue("midnight.600", "whiteAlpha.700");
  const softBg = useColorModeValue("rgba(9,17,31,0.05)", "whiteAlpha.120");
  const softHover = useColorModeValue("rgba(9,17,31,0.10)", "whiteAlpha.200");
  const emptyBg = useColorModeValue("rgba(9,17,31,0.03)", "rgba(255,255,255,0.04)");
  const outlineBorder = useColorModeValue("rgba(9,17,31,0.16)", "whiteAlpha.300");

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    notificationIdsRef.current = new Set(notification.map((item) => item._id));
  }, [notification]);

  const replaceMessageById = (message) => {
    setMessages((prev) =>
      prev.map((item) => (item._id === message._id ? message : item))
    );
  };

  const updateChatPreview = useCallback((message) => {
    const chatId = message?.chat?._id;
    if (!chatId) return;

    setChats((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;

      const existingIndex = prev.findIndex((chat) => String(chat._id) === String(chatId));
      const baseChat = existingIndex >= 0 ? prev[existingIndex] : message.chat;
      if (!baseChat) return prev;

      const updatedChat = {
        ...baseChat,
        latestMessage: message,
        updatedAt: new Date().toISOString(),
      };

      if (existingIndex === 0) {
        const existingTop = prev[0];
        if (existingTop?.latestMessage?._id === message._id) return prev;
        return [updatedChat, ...prev.slice(1)];
      }

      if (existingIndex > 0) {
        return [updatedChat, ...prev.filter((_, idx) => idx !== existingIndex)];
      }

      return [updatedChat, ...prev];
    });

    setSelectedChat((prev) => {
      if (String(prev?._id) !== String(chatId)) return prev;
      return { ...prev, latestMessage: message };
    });
  }, [setChats, setSelectedChat]);

  const markChatSeen = useCallback(async (chatId) => {
    if (!chatId || !user?.token) return;

    try {
      const { data } = await api.post(
        `/api/message/seen/${chatId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMessages((prev) =>
        prev.map((message) => {
          const updatedMessage = data.find((item) => item._id === message._id);
          return updatedMessage || message;
        })
      );

      socketRef.current?.emit("messages seen", { chatId, userId: user._id });
      setNotification((prev) => prev.filter((item) => item.chat?._id !== chatId));
    } catch {
      // Keep this silent to avoid noisy UX during polling-like updates.
    }
  }, [setNotification, user]);

  const fetchMessages = useCallback(async (chatOverride, options = {}) => {
    const { markSeen: shouldMarkSeen = true } = options;
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

      if (shouldMarkSeen) {
        await markChatSeen(activeChat._id);
      }
    } catch {
      toast({ title: "Failed to load messages", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [markChatSeen, toast, user?.token]);

  const handleSocketConnect = useCallback(() => {
    const currentUser = userRef.current;
    if (currentUser?._id && socketRef.current) {
      socketRef.current.emit("setup", currentUser);
    }
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    if (!socketInstance) {
      socketInstance = io(ENDPOINT, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 500,
      });
    }

    socketRef.current = socketInstance;

    socketInstance.off("connect", handleSocketConnect);
    socketInstance.on("connect", handleSocketConnect);

    if (socketInstance.connected) {
      handleSocketConnect();
    } else {
      socketInstance.connect();
    }

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);
    const handleOnlineUsers = (users) => setOnlineUsers(users);
    const handleIncomingMessage = (msg) => {
      const activeChat = selectedChatRef.current;
      updateChatPreview(msg);

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
        markChatSeen(msg.chat?._id);
        return;
      }

      if (notificationIdsRef.current.has(msg._id)) return;

      notificationIdsRef.current.add(msg._id);
      setNotification((prev) => [msg, ...prev]);

      if ("Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        } else if (Notification.permission === "granted") {
          new Notification(
            msg.chat?.isGroupChat ? msg.chat.chatName : msg.sender?.name || "New message",
            {
              body: msg.content || "Sent an attachment",
            }
          );
        }
      }
    };
    const handleMessageUpdated = (msg) => replaceMessageById(msg);
    const handleMessageDeleted = (msg) => replaceMessageById(msg);
    const handleMessagesSeen = ({ chatId }) => {
      if (selectedChatRef.current?._id === chatId) {
        fetchMessages(selectedChatRef.current, { markSeen: false });
      }
    };

    socketInstance.off("typing", handleTyping);
    socketInstance.off("stop typing", handleStopTyping);
    socketInstance.off("message recieved", handleIncomingMessage);
    socketInstance.off("message updated", handleMessageUpdated);
    socketInstance.off("message deleted", handleMessageDeleted);
    socketInstance.off("messages seen", handleMessagesSeen);
    socketInstance.off("online users", handleOnlineUsers);

    socketInstance.on("typing", handleTyping);
    socketInstance.on("stop typing", handleStopTyping);
    socketInstance.on("message recieved", handleIncomingMessage);
    socketInstance.on("message updated", handleMessageUpdated);
    socketInstance.on("message deleted", handleMessageDeleted);
    socketInstance.on("messages seen", handleMessagesSeen);
    socketInstance.on("online users", handleOnlineUsers);

    return () => {
      socketInstance.off("connect", handleSocketConnect);
      socketInstance.off("typing", handleTyping);
      socketInstance.off("stop typing", handleStopTyping);
      socketInstance.off("message recieved", handleIncomingMessage);
      socketInstance.off("message updated", handleMessageUpdated);
      socketInstance.off("message deleted", handleMessageDeleted);
      socketInstance.off("messages seen", handleMessagesSeen);
      socketInstance.off("online users", handleOnlineUsers);
    };
  }, [fetchMessages, handleSocketConnect, markChatSeen, setFetchAgain, setNotification, setOnlineUsers, updateChatPreview, user?._id]);

  useEffect(() => {
    if (!selectedChat?._id || !socketRef.current) return;
    socketRef.current.emit("join chat", selectedChat._id);
    markChatSeen(selectedChat._id);
  }, [markChatSeen, selectedChat]);

  useEffect(() => {
    fetchMessages(selectedChat);
  }, [fetchMessages, selectedChat]);

  const stopTyping = () => {
    if (!socketRef.current || !selectedChatRef.current?._id) return;

    socketRef.current.emit("stop typing", selectedChatRef.current._id);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const resetComposer = () => {
    setNewMessage("");
    setShowEmoji(false);
    setReplyingTo(null);
    setEditingMessage(null);
    setPendingAttachments([]);
  };

  const sendMessage = async () => {
    const content = newMessage.trim();
    if ((!content && pendingAttachments.length === 0 && !editingMessage) || !selectedChat?._id || sendingMessage) {
      return;
    }

    setSendingMessage(true);
    stopTyping();

    try {
      if (editingMessage) {
        const { data } = await api.put(
          `/api/message/${editingMessage._id}`,
          { content },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        replaceMessageById(data);
        socketRef.current?.emit("message updated", data);
        resetComposer();
        return;
      }

      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content,
        attachments: pendingAttachments,
        chat: { _id: selectedChat._id, users: selectedChat.users, isGroupChat: selectedChat.isGroupChat, chatName: selectedChat.chatName },
        sender: {
          _id: user._id,
          name: user.name,
          pic: user.pic,
          email: user.email,
        },
        replyTo: replyingTo,
        readBy: [user],
        deliveredTo: [],
        createdAt: new Date().toISOString(),
        optimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      const { data } = await api.post(
        "/api/message",
        {
          content,
          chatId: selectedChat._id,
          replyTo: replyingTo?._id || null,
          attachments: pendingAttachments,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMessages((prev) =>
        prev.map((item) => (item._id === optimisticMessage._id ? data : item))
      );

      updateChatPreview(data);

      if (socketRef.current && !socketRef.current.connected) {
        socketRef.current.connect();
      }

      try {
        await new Promise((resolve, reject) => {
          if (!socketRef.current) {
            resolve();
            return;
          }

          socketRef.current.timeout(5000).emit("new message", data, (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      } catch {
        void 0;
      }
      resetComposer();
    } catch {
      toast({ title: editingMessage ? "Update failed" : "Message failed", status: "error" });
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

  const handleReply = (message) => {
    setReplyingTo(message);
    setEditingMessage(null);
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setReplyingTo(null);
    setNewMessage(message.content || "");
  };

  const handleDeleteMessage = async (message) => {
    try {
      const { data } = await api.delete(`/api/message/${message._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      replaceMessageById(data);
      socketRef.current?.emit("message deleted", data);
    } catch {
      toast({ title: "Unable to delete message", status: "error" });
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      setUploadingFiles(true);
      const { data } = await api.post("/api/message/upload", formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPendingAttachments((prev) => [...prev, ...data]);
    } catch (error) {
      toast({
        title: "Upload failed",
        description:
          error.response?.data?.message ||
          "Use images, PDF, Word, Excel, PowerPoint, text, or zip files up to 10MB.",
        status: "error",
      });
    } finally {
      setUploadingFiles(false);
      event.target.value = "";
    }
  };

  const removePendingAttachment = (attachmentUrl) => {
    setPendingAttachments((prev) =>
      prev.filter((attachment) => attachment.url !== attachmentUrl)
    );
  };

  const filteredMessages = useMemo(() => {
    const query = messageSearch.trim().toLowerCase();
    if (!query) return messages;

    return messages.filter((message) => {
      const contentMatch = message.content?.toLowerCase().includes(query);
      const attachmentMatch = message.attachments?.some((attachment) =>
        attachment.name?.toLowerCase().includes(query)
      );
      const senderMatch = message.sender?.name?.toLowerCase().includes(query);
      return contentMatch || attachmentMatch || senderMatch;
    });
  }, [messageSearch, messages]);

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
  const isOtherUserOnline = onlineUsers.some(
    (onlineUserId) => String(onlineUserId) === String(otherUser?._id)
  );

  const presenceLabel = selectedChat.isGroupChat
    ? `${selectedChat.users?.length || 0} members`
    : "Direct conversation";

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
                <OnlineAvatar
                  name={otherUser?.name}
                  src={otherUser?.pic}
                  isOnline={isOtherUserOnline}
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
                    {presenceLabel}
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
                    {presenceLabel}
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

          <HStack>
            <InputGroup maxW={{ base: "140px", md: "220px" }} display={{ base: "none", md: "flex" }}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color={subText} />
              </InputLeftElement>
              <Input
                placeholder="Search in chat"
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                bg={softBg}
                borderColor={borderColor}
              />
            </InputGroup>

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
        <Box display={{ base: "block", md: "none" }} mb={3}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color={subText} />
            </InputLeftElement>
            <Input
              placeholder="Search in chat"
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              bg={softBg}
              borderColor={borderColor}
            />
          </InputGroup>
        </Box>

        <Box flex="1" overflowY="auto" pr={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" pt={8}>
              <Spinner color="brand.300" size="lg" />
            </Box>
          ) : (
            <ScrollableChat
              messages={filteredMessages}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDeleteMessage}
            />
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

        {(replyingTo || editingMessage || pendingAttachments.length > 0) && (
          <Box
            mt={3}
            mb={2}
            bg={composerBg}
            border={`1px solid ${borderColor}`}
            borderRadius="18px"
            p={3}
          >
            {replyingTo && (
              <HStack justify="space-between" align="start">
                <Box>
                  <Text fontSize="xs" fontWeight="700" color={headingColor}>
                    Replying to {replyingTo.sender?.name}
                  </Text>
                  <Text fontSize="sm" color={subText} noOfLines={2}>
                    {replyingTo.content || "Attachment"}
                  </Text>
                </Box>
                <IconButton
                  size="sm"
                  icon={<SmallCloseIcon />}
                  aria-label="Cancel reply"
                  onClick={() => setReplyingTo(null)}
                />
              </HStack>
            )}

            {editingMessage && (
              <>
                {replyingTo && <Divider my={3} />}
                <HStack justify="space-between" align="start">
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color={headingColor}>
                      Editing message
                    </Text>
                    <Text fontSize="sm" color={subText} noOfLines={2}>
                      {editingMessage.content}
                    </Text>
                  </Box>
                  <IconButton
                    size="sm"
                    icon={<SmallCloseIcon />}
                    aria-label="Cancel edit"
                    onClick={() => {
                      setEditingMessage(null);
                      setNewMessage("");
                    }}
                  />
                </HStack>
              </>
            )}

            {!!pendingAttachments.length && (
              <>
                {(replyingTo || editingMessage) && <Divider my={3} />}
                <HStack spacing={2} flexWrap="wrap">
                  {pendingAttachments.map((attachment) => (
                    <HStack
                      key={attachment.url}
                      spacing={1}
                      px={3}
                      py={2}
                      borderRadius="full"
                      bg="rgba(201,162,39,0.16)"
                      border="1px solid rgba(201,162,39,0.26)"
                    >
                      <Text fontSize="sm" color={headingColor}>
                        {attachment.name}
                      </Text>
                      <CloseButton
                        size="sm"
                        onClick={() => removePendingAttachment(attachment.url)}
                      />
                    </HStack>
                  ))}
                </HStack>
              </>
            )}
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
            <input
              ref={fileInputRef}
              type="file"
              hidden
              multiple
              accept="image/*,.pdf,.txt,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={handleFileUpload}
            />

            <IconButton
              icon={<FiPaperclip />}
              aria-label="Attach files"
              bg={softBg}
              color={headingColor}
              _hover={{ bg: softHover }}
              onClick={() => fileInputRef.current?.click()}
            />

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
              placeholder={editingMessage ? "Edit your message..." : "Write a message..."}
              _focusVisible={{
                boxShadow: "none",
              }}
            />

            {(editingMessage || replyingTo) && (
              <IconButton
                bg={softBg}
                color={headingColor}
                icon={<FiEdit2 />}
                aria-label="Clear composer mode"
                onClick={() => {
                  setReplyingTo(null);
                  setEditingMessage(null);
                }}
              />
            )}

            <IconButton
              bg="brand.400"
              color="midnight.900"
              icon={
                sendingMessage || uploadingFiles ? (
                  <Spinner size="sm" />
                ) : (
                  <FiSend />
                )
              }
              aria-label="Send message"
              _hover={{ bg: "brand.300" }}
              isDisabled={
                ((!newMessage.trim() && pendingAttachments.length === 0) && !editingMessage) ||
                sendingMessage ||
                uploadingFiles
              }
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
