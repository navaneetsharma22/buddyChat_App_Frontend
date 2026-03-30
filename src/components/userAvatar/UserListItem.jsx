import { Avatar, Box, Text, useColorModeValue } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";

const UserListItem = ({ user, handleFunction }) => {
  // renamed to avoid conflict (even though not used here)
  const { user: loggedUser } = ChatState();
  const itemBg = useColorModeValue("rgba(9,17,31,0.05)", "whiteAlpha.80");
  const itemHoverBg = useColorModeValue("rgba(201,162,39,0.85)", "rgba(201,162,39,0.92)");
  const textColor = useColorModeValue("midnight.900", "white");
  const borderColor = useColorModeValue("rgba(9,17,31,0.08)", "rgba(255,255,255,0.08)");

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg={itemBg}
      _hover={{
        background: itemHoverBg,
        color: "#09111f",
      }}
      w="100%"
      display="flex"
      alignItems="center"
      color={textColor}
      px={3}
      py={3}
      mb={2}
      borderRadius="18px"
      border={`1px solid ${borderColor}`}
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text fontWeight="600">{user.name}</Text>
        <Text fontSize="xs" color="inherit">
          <b>Email : </b>
          {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
