import { Box, useColorModeValue } from "@chakra-ui/react";
import SingleChat from "./SingleChat";
import { ChatState } from "../Context/ChatProvider";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  const bg = useColorModeValue(
    "rgba(255,255,255,0.72)",
    "rgba(7, 13, 24, 0.72)"
  );
  const borderColor = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.1)");

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", lg: "flex" }}
      flexDir="column"
      flex="1"
      w={{ base: "100%", lg: "auto" }}
      bg={bg}
      borderRadius={{ base: "24px", md: "28px" }}
      border={`1px solid ${borderColor}`}
      overflow="hidden"
      boxShadow="0 20px 60px rgba(0,0,0,0.28)"
      backdropFilter="blur(18px)"
      h={{ base: "calc(100dvh - 116px)", lg: "100%" }}
      minH="0"
    >
      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </Box>
  );
};

export default Chatbox;
