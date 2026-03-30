import { Box, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  const bg = useColorModeValue("transparent", "transparent");

  return (
    <Box
      w="100%"
      h="100vh"
      bg={bg}
      display="flex"
      flexDir="column"
      px={{ base: 3, md: 5 }}
      py={{ base: 3, md: 4 }}
      gap={3}
    >
      {user && <SideDrawer />}

      <Box
        flex="1"
        display="flex"
        p={{ base: 0, md: "6px" }}
        gap="14px"
        overflow="hidden"
        minH="0"
      >
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox
            fetchAgain={fetchAgain}
            setFetchAgain={setFetchAgain}
          />
        )}
      </Box>
    </Box>
  );
};

export default ChatPage;
