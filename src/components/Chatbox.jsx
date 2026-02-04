import { Box, useColorModeValue } from "@chakra-ui/react";
import SingleChat from "./SingleChat.jsx";
import { ChatState } from "../Context/ChatProvider.jsx";

const Chatbox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      flex="1"
      flexDir="column"
      p={3}
      bg={bg}
      borderRadius="lg"
      borderWidth="1px"
      overflow="hidden"
    >
      <SingleChat
        fetchAgain={fetchAgain}
        setFetchAgain={setFetchAgain}
      />
    </Box>
  );
};

export default Chatbox;
