import {
  Avatar,
  Tooltip,
  Box,
  Text,
  useColorModeValue,
  HStack,
  IconButton,
  Image,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { FiCornerUpLeft, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getAssetUrl } from "../config/runtime";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
  getMessageStatus,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const ScrollableChat = ({ messages, onReply, onEdit, onDelete }) => {
  const { user } = ChatState();
  const receivedBg = useColorModeValue("rgba(9,17,31,0.06)", "rgba(255,255,255,0.08)");
  const receivedColor = useColorModeValue("midnight.900", "white");
  const borderColor = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.08)");
  const metaColor = useColorModeValue("midnight.600", "whiteAlpha.700");
  const actionBg = useColorModeValue("rgba(9,17,31,0.05)", "whiteAlpha.100");
  const attachmentBg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(255,255,255,0.06)");

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const isImage = (attachment) => attachment?.mimeType?.startsWith("image/");

  return (
    <Box px={{ base: 1, md: 3 }} py={1}>
      {messages?.map((m, i) => {
        const isSender = m.sender._id === user._id;
        const messageStatus = getMessageStatus(m, user._id);

        return (
          <Box
            key={m._id}
            display="flex"
            justifyContent={isSender ? "flex-end" : "flex-start"}
            mb={2}
            alignItems="flex-end"
            role="group"
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

            <Box maxW={{ base: "82%", md: "68%" }}>
              <HStack
                justifyContent={isSender ? "flex-end" : "flex-start"}
                spacing={1}
                mb={1}
                opacity={{ base: 1, md: 0 }}
                _groupHover={{ opacity: 1 }}
                transition="opacity 0.2s ease"
              >
                <IconButton
                  size="xs"
                  aria-label="Reply to message"
                  icon={<FiCornerUpLeft />}
                  onClick={() => onReply?.(m)}
                  bg={actionBg}
                />
                {isSender && !m.deletedAt && (
                  <>
                    <IconButton
                      size="xs"
                      aria-label="Edit message"
                      icon={<FiEdit2 />}
                      onClick={() => onEdit?.(m)}
                      bg={actionBg}
                    />
                    <IconButton
                      size="xs"
                      aria-label="Delete message"
                      icon={<FiTrash2 />}
                      onClick={() => onDelete?.(m)}
                      bg={actionBg}
                    />
                  </>
                )}
              </HStack>

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
                ml={!isSender ? isSameSenderMargin(messages, m, i, user._id) : 0}
                mt={isSameUser(messages, m, i) ? 1 : 3}
                boxShadow="0 14px 30px rgba(0,0,0,0.18)"
                wordBreak="break-word"
                border={`1px solid ${borderColor}`}
              >
                {m.replyTo && (
                  <Box
                    mb={3}
                    px={3}
                    py={2}
                    borderRadius="16px"
                    bg="blackAlpha.200"
                    borderLeft="3px solid rgba(201,162,39,0.95)"
                  >
                    <Text fontSize="xs" fontWeight="700">
                      Replying to {m.replyTo.sender?.name || "message"}
                    </Text>
                    <Text fontSize="xs" opacity="0.8" noOfLines={2}>
                      {m.replyTo.content || "Attachment"}
                    </Text>
                  </Box>
                )}

                {!!m.content && (
                  <Text fontSize="sm" lineHeight="1.7" fontStyle={m.deletedAt ? "italic" : "normal"}>
                    {m.content}
                  </Text>
                )}

                {!!m.attachments?.length && (
                  <Wrap spacing={3} mt={m.content ? 3 : 0}>
                    {m.attachments.map((attachment) => (
                      <WrapItem key={`${m._id}-${attachment.url}`}>
                        <Box
                          as="a"
                          href={getAssetUrl(attachment.url)}
                          target="_blank"
                          rel="noreferrer"
                          bg={attachmentBg}
                          borderRadius="18px"
                          p={2}
                          border={`1px solid ${borderColor}`}
                        >
                          {isImage(attachment) ? (
                            <Image
                              src={getAssetUrl(attachment.url)}
                              alt={attachment.name}
                              boxSize="120px"
                              objectFit="cover"
                              borderRadius="12px"
                            />
                          ) : (
                            <Text fontSize="xs" maxW="140px" noOfLines={2}>
                              {attachment.name}
                            </Text>
                          )}
                        </Box>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}

                <HStack justifyContent="space-between" mt="2" spacing={3}>
                  <Text fontSize="xs" opacity="0.72">
                    {formatTime(m.createdAt)}
                    {m.edited ? " · edited" : ""}
                  </Text>
                  {isSender && (
                    <Text fontSize="xs" color={metaColor}>
                      {messageStatus}
                    </Text>
                  )}
                </HStack>
              </Box>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ScrollableChat;
