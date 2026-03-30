import { Avatar, Tooltip, Box, Text, useColorModeValue } from "@chakra-ui/react";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const receivedBg = useColorModeValue("rgba(9,17,31,0.06)", "rgba(255,255,255,0.08)");
  const receivedColor = useColorModeValue("midnight.900", "white");
  const borderColor = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.08)");

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Box px={{ base: 1, md: 3 }} py={1}>
      {messages &&
        messages.map((m, i) => {
          const isSender = m.sender._id === user._id;

          return (
            <Box
              key={m._id}
              display="flex"
              justifyContent={isSender ? "flex-end" : "flex-start"}
              mb={2}
              alignItems="flex-end"
            >
              {!isSender &&
                (isSameSender(messages, m, i, user._id) ||
                  isLastMessage(messages, i, user._id)) && (
                  <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                    <Avatar
                      size="sm"
                      mr={2}
                      cursor="pointer"
                      name={m.sender.name}
                      src={m.sender.pic}
                      border="2px solid rgba(255,255,255,0.18)"
                    />
                  </Tooltip>
                )}

              <Box
                bg={
                  isSender
                    ? "linear-gradient(135deg, rgba(201,162,39,0.95), rgba(221,195,122,0.90))"
                    : receivedBg
                }
                color={isSender ? "midnight.900" : receivedColor}
                px={4}
                py={3}
                borderRadius="24px"
                maxW={{ base: "78%", md: "60%" }}
                ml={!isSender ? isSameSenderMargin(messages, m, i, user._id) : 0}
                mt={isSameUser(messages, m, i) ? 1 : 3}
                boxShadow="0 14px 30px rgba(0,0,0,0.18)"
                wordBreak="break-word"
                border={`1px solid ${borderColor}`}
              >
                <Text fontSize="sm" lineHeight="1.7">
                  {m.content}
                </Text>

                <Text
                  fontSize="xs"
                  opacity="0.72"
                  textAlign="right"
                  mt="1"
                >
                  {formatTime(m.createdAt)}
                </Text>
              </Box>
            </Box>
          );
        })}
    </Box>
  );
};

export default ScrollableChat;
