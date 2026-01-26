import React, { useEffect, useState } from "react";
import axios from "axios";

function ChatPage() {
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    try {
      const response = await axios.get("/api/chat"); // fixed endpoint
      console.log("checking data");
      console.log(response.data);
      setChats(response.data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <div>
      {chats.map((chat) => (
        <div key={chat._id}>{chat.chatName}</div> // fixed naming
      ))}
    </div>
  );
}

export default ChatPage;
