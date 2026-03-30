import { Avatar, Box } from "@chakra-ui/react";

const OnlineAvatar = ({ src, name, isOnline }) => {
  return (
    <Box position="relative" display="inline-block">
      <Avatar name={name} src={src} />

      {isOnline && (
        <Box
          position="absolute"
          bottom="3px"
          right="3px"
          width="14px"
          height="14px"
          borderRadius="50%"
          bg="#22c55e"
          border="2px solid white"
          boxShadow="0 0 0 3px rgba(34, 197, 94, 0.22), 0 0 14px rgba(34, 197, 94, 0.65)"
          transition="all 0.2s ease"
        />
      )}
    </Box>
  );
};

export default OnlineAvatar;
