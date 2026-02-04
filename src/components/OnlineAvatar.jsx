import { Avatar, Box } from "@chakra-ui/react";

const OnlineAvatar = ({ src, name, isOnline }) => {
  return (
    <Box position="relative" display="inline-block">
      <Avatar name={name} src={src} />

      <Box
        position="absolute"
        bottom="2px"
        right="2px"
        width="12px"
        height="12px"
        borderRadius="50%"
        bg={isOnline ? "green.400" : "gray.400"}
        border="2px solid white"
      />
    </Box>
  );
};

export default OnlineAvatar;
