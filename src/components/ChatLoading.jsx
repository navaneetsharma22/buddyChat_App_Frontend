import { Stack, Skeleton } from "@chakra-ui/react";


const ChatLoading = () => {
  return (
    <Stack>
      <Skeleton height="52px" borderRadius="18px" startColor="whiteAlpha.100" endColor="whiteAlpha.200" />
      <Skeleton height="52px" borderRadius="18px" startColor="whiteAlpha.100" endColor="whiteAlpha.200" />
      <Skeleton height="52px" borderRadius="18px" startColor="whiteAlpha.100" endColor="whiteAlpha.200" />
      <Skeleton height="52px" borderRadius="18px" startColor="whiteAlpha.100" endColor="whiteAlpha.200" />
      <Skeleton height="52px" borderRadius="18px" startColor="whiteAlpha.100" endColor="whiteAlpha.200" />
      <Skeleton height="52px" borderRadius="18px" startColor="whiteAlpha.100" endColor="whiteAlpha.200" />
    </Stack>
  );
};

export default ChatLoading;
