import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  Send,
  Bot,
  User,
  Sparkles,
} from "lucide-react";

import {
  sendChatMessage,
} from "../services/api";


function Chatbot({
  userId,
}) {

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "Hi! I'm LearnPath AI. Ask me about your learning path, skill gaps, courses or what you should learn next.",
      },
    ]);


  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const messagesEndRef =
    useRef(null);


  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  const handleSend = async () => {

    const text =
      input.trim();

    if (!text || loading) {
      return;
    }


    const userMessage = {

      role: "user",

      content: text,

    };


    const updatedMessages = [
      ...messages,
      userMessage,
    ];


    setMessages(
      updatedMessages
    );

    setInput("");

    setLoading(true);


    try {

      const history =
        updatedMessages
          .slice(0, -1)
          .map((message) => ({
            role:
              message.role,
            content:
              message.content,
          }));


      const response =
        await sendChatMessage(
          userId,
          text,
          history
        );


      setMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            content:
              response.message,
          },
        ]
      );

    } catch (error) {

      console.error(error);

      setMessages(
        (current) => [
          ...current,
          {
            role: "assistant",
            content:
              "Sorry, I couldn't connect to the AI assistant. Please make sure the backend and Ollama are running.",
          },
        ]
      );

    } finally {

      setLoading(false);

    }
  };


  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter"
      && !event.shiftKey
    ) {

      event.preventDefault();

      handleSend();

    }
  };


  return (

    <div className="chatbot">

      <div className="chat-header">

        <div className="chat-avatar">

          <Sparkles
            size={20}
          />

        </div>

        <div>

          <h3>
            LearnPath AI
          </h3>

          <span>
            Powered by local AI
          </span>

        </div>

      </div>


      <div className="chat-messages">

        {messages.map(
          (message, index) => (

            <div
              key={index}
              className={`message ${
                message.role
              }`}
            >

              <div className="message-icon">

                {message.role ===
                "assistant" ? (

                  <Bot size={17} />

                ) : (

                  <User size={17} />

                )}

              </div>


              <div className="message-content">

                {message.content}

              </div>

            </div>

          )
        )}


        {loading && (

          <div className="message assistant">

            <div className="message-icon">

              <Bot size={17} />

            </div>

            <div className="typing">

              Thinking...

            </div>

          </div>

        )}


        <div
          ref={messagesEndRef}
        />

      </div>


      <div className="chat-input">

        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask about your learning path..."
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={
            loading ||
            !input.trim()
          }
        >

          <Send size={18} />

        </button>

      </div>

    </div>

  );
}

export default Chatbot;