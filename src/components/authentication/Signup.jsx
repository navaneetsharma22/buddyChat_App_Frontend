import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ChatState } from "../../Context/ChatProvider";

function Signup() {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pic, setPic] = useState(null);

  const toast = useToast();
  const navigate = useNavigate();
  const { setUser } = ChatState();
  const labelColor = useColorModeValue("midnight.700", "whiteAlpha.900");
  const ghostButtonBg = useColorModeValue("rgba(9,17,31,0.08)", "whiteAlpha.200");
  const ghostButtonHover = useColorModeValue("rgba(9,17,31,0.14)", "whiteAlpha.300");
  const ghostText = useColorModeValue("midnight.900", "white");

  const postDetails = (pics) => {
    setLoading(true);

    if (!pics) {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "dwrqaorvk");

      fetch("https://api.cloudinary.com/v1_1/dwrqaorvk/image/upload", {
        method: "POST",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      toast({
        title: "Please select a valid image (jpeg/png)",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  const submitHandler = async () => {
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Please fill all fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
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
        "/api/user",
        { name, email, password, pic },
        { headers: { "Content-Type": "application/json" } }
      );

      toast({
        title: "Registration successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      navigate("/chats");
    } catch (error) {
      toast({
        title: "Error occurred",
        description: error.response?.data?.message || "Something went wrong",
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
      <FormControl id="name" isRequired>
        <FormLabel color={labelColor}>Name</FormLabel>
        <Input onChange={(e) => setName(e.target.value)} />
      </FormControl>

      <FormControl id="email" isRequired>
        <FormLabel color={labelColor}>Email</FormLabel>
        <Input onChange={(e) => setEmail(e.target.value)} />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel color={labelColor}>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
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

      <FormControl id="confirmPassword" isRequired>
        <FormLabel color={labelColor}>Confirm Password</FormLabel>
        <Input
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </FormControl>

      <FormControl>
        <FormLabel color={labelColor}>Upload Picture</FormLabel>
        <Input
          type="file"
          accept="image/*"
          pt={1}
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      <Button
        bg="brand.400"
        color="midnight.900"
        width="100%"
        mt={4}
        onClick={submitHandler}
        isLoading={loading}
        _hover={{ bg: "brand.300" }}
      >
        Sign Up
      </Button>
    </VStack>
  );
}

export default Signup;
