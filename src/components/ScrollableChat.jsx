import { Avatar, Tooltip, Box, Text } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <ScrollableFeed>
      {/* CENTER CHAT LIKE REFERENCE */}
      <Box maxW="900px" mx="auto">
        {messages &&
          messages.map((m, i) => (
            <Box
              key={m._id}
              display="flex"
              justifyContent={
                m.sender._id === user._id ? "flex-end" : "flex-start"
              }
              mb={2}
            >
              {/* AVATAR */}
              {(isSameSender(messages, m, i, user._id) ||
                isLastMessage(messages, i, user._id)) &&
                m.sender._id !== user._id && (
                  <Tooltip
                    label={m.sender.name}
                    placement="bottom-start"
                    hasArrow
                  >
                    <Avatar
                      mr={2}
                      size="sm"
                      cursor="pointer"
                      name={m.sender.name}
                      src={m.sender.pic}
                    />
                  </Tooltip>
                )}

              {/* MESSAGE BUBBLE */}
              <Box
                bg={
                  m.sender._id === user._id
                    ? "blue.400" // outgoing
                    : "green.200" // incoming (like reference)
                }
                color={m.sender._id === user._id ? "white" : "black"}
                px={4}
                py={2}
                borderRadius="18px"
                maxW="70%"
                boxShadow="sm"
              >
                <Text fontSize="sm">{m.content}</Text>

                <Text
                  fontSize="xs"
                  opacity="0.6"
                  textAlign="right"
                  mt="1"
                >
                  {formatTime(m.createdAt)}
                </Text>
              </Box>
            </Box>
          ))}
      </Box>
    </ScrollableFeed>
  );
};

export default ScrollableChat;
