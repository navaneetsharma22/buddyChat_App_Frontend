import React, { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ChatState } from "../../Context/ChatProvider";

function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const { setUser } = ChatState();
  const labelColor = useColorModeValue("midnight.700", "whiteAlpha.900");
  const ghostButtonBg = useColorModeValue("rgba(9,17,31,0.08)", "whiteAlpha.200");
  const ghostButtonHover = useColorModeValue("rgba(9,17,31,0.14)", "whiteAlpha.300");
  const ghostText = useColorModeValue("midnight.900", "white");
  const outlineBorder = useColorModeValue("rgba(9,17,31,0.16)", "whiteAlpha.300");
  const outlineHover = useColorModeValue("rgba(9,17,31,0.04)", "whiteAlpha.100");

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    if (!email || !password) {
      toast({
        title: "Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        "/api/user/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      toast({
        title: "Login successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      navigate("/chats");
    } catch (error) {
      // Axios network errors (CORS, backend down, DNS, etc.) won't have `error.response`.
      const description =
        error?.response?.data?.message ||
        (error?.request
          ? "Cannot reach the server. Ensure the backend is running and CORS allows this origin."
          : error?.message) ||
        "Login failed";

      // Helpful during local debugging.
      // eslint-disable-next-line no-console
      console.error("Login failed:", error);

      toast({
        title: "Error occurred!",
        description,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="email" isRequired>
        <FormLabel color={labelColor}>Email Address</FormLabel>
        <Input
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel color={labelColor}>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              bg={ghostButtonBg}
              color={ghostText}
              _hover={{ bg: ghostButtonHover }}
              onClick={() => setShow(!show)}
            >
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        bg="brand.400"
        color="midnight.900"
        width="100%"
        mt={4}
        isLoading={loading}
        _hover={{ bg: "brand.300" }}
        onClick={submitHandler}
      >
        Login
      </Button>

      <Button
        variant="outline"
        borderColor={outlineBorder}
        color={ghostText}
        width="100%"
        _hover={{ bg: outlineHover }}
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
}

export default Login;
