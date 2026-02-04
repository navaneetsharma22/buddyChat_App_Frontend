import { Box, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";

const Chatpage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  const bg = useColorModeValue("gray.100", "gray.900");

  return (
    <Box w="100%" h="100vh" bg={bg} display="flex" flexDir="column">
      {user && <SideDrawer />}

      <Box
        flex="1"
        display="flex"
        p="10px"
        gap="10px"
        overflow="hidden"
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

export default Chatpage;
