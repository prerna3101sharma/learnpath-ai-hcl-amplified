import React, {
  useEffect,
  useRef,
  useState
} from "react";

import {
  Bot,
  Send,
  User,
  Sparkles,
  Trash2,
  AlertCircle
} from "lucide-react";

import {
  useUser
} from "../context/UserContext";


function Assistant() {

  const {
    user
  } = useUser();


  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const messagesEndRef =
    useRef(null);


  /*
   * ---------------------------------------------------------
   * Initial greeting
   * ---------------------------------------------------------
   */

  useEffect(() => {

    if (!user) {
      return;
    }


    setMessages([

      {
        id: Date.now(),

        role: "assistant",

        content:
          `Hi ${user.name || "there"}! 👋\n\n` +
          "I'm your LearnPath AI assistant. " +
          "I can help you understand your learning path, " +
          "identify what to study next, explain recommendations, " +
          "and answer questions about your skills and goals."
      }

    ]);

  }, [user?.id]);


  /*
   * ---------------------------------------------------------
   * Scroll to latest message
   * ---------------------------------------------------------
   */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages, loading]);


  /*
   * ---------------------------------------------------------
   * Send message
   * ---------------------------------------------------------
   */

  const sendMessage = async (
    event
  ) => {

    event?.preventDefault();


    const trimmedMessage =
      input.trim();


    if (
      !trimmedMessage ||
      loading ||
      !user?.id
    ) {
      return;
    }


    setError("");


    const userMessage = {

      id:
        Date.now(),

      role:
        "user",

      content:
        trimmedMessage

    };


    setMessages(
      (previous) => [
        ...previous,
        userMessage
      ]
    );


    setInput("");

    setLoading(true);


    try {

      const response =
        await fetch(
          "http://localhost:8000/api/chat",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify({

                user_id:
                  user.id,

                message:
                  trimmedMessage

              })
          }
        );


      if (!response.ok) {

        throw new Error(
          `Assistant request failed (${response.status})`
        );

      }


      const data =
        await response.json();


      /*
       * Support different backend response names.
       */

      const assistantResponse =
        data.response ??
        data.answer ??
        data.message ??
        data.reply ??
        data.content;


      if (!assistantResponse) {

        throw new Error(
          "The assistant returned an empty response."
        );

      }


      setMessages(
        (previous) => [

          ...previous,

          {
            id:
              Date.now() + 1,

            role:
              "assistant",

            content:
              assistantResponse
          }

        ]
      );


    } catch (err) {

      console.error(
        "Assistant error:",
        err
      );


      setError(
        "Unable to connect to the AI assistant. " +
        "Make sure the FastAPI backend and Ollama are running."
      );


      setMessages(
        (previous) => [

          ...previous,

          {
            id:
              Date.now() + 1,

            role:
              "assistant",

            content:
              "I couldn't process that request right now. " +
              "Please check that the backend and Ollama service are running, " +
              "then try again."
          }

        ]
      );


    } finally {

      setLoading(false);

    }

  };


  /*
   * ---------------------------------------------------------
   * Suggested questions
   * ---------------------------------------------------------
   */

  const suggestions = [

    "What should I learn next?",

    "Why was this learning path recommended?",

    "What are my biggest skill gaps?",

    "Explain my current learning roadmap",

    "How can I improve my progress?",

  ];


  const useSuggestion = (
    suggestion
  ) => {

    setInput(
      suggestion
    );

  };


  /*
   * ---------------------------------------------------------
   * Clear conversation
   * ---------------------------------------------------------
   */

  const clearConversation =
    () => {

      setMessages([

        {

          id:
            Date.now(),

          role:
            "assistant",

          content:
            `Conversation cleared. How can I help you with your learning journey, ${
              user?.name || ""
            }?`

        }

      ]);

      setError("");

    };


  /*
   * ---------------------------------------------------------
   * No learner
   * ---------------------------------------------------------
   */

  if (!user) {

    return (

      <div className="assistant-container">

        <div className="assistant-empty">

          <AlertCircle
            size={45}
          />

          <h2>
            No learner selected
          </h2>

          <p>
            Please select a learner profile
            before using the AI assistant.
          </p>

        </div>

      </div>

    );

  }


  /*
   * ---------------------------------------------------------
   * Main UI
   * ---------------------------------------------------------
   */

  return (

    <div className="assistant-container">

      {/* Header */}

      <div className="assistant-header">

        <div className="assistant-title">

          <div className="assistant-icon">

            <Bot
              size={25}
            />

          </div>


          <div>

            <p className="page-label">
              AI LEARNING ASSISTANT
            </p>

            <h1>
              LearnPath AI
            </h1>

            <p>
              Personalized guidance for{" "}
              <strong>
                {user.name}
              </strong>
            </p>

          </div>

        </div>


        <button
          className="clear-chat-button"
          onClick={
            clearConversation
          }
          title="Clear conversation"
        >

          <Trash2
            size={17}
          />

          Clear

        </button>

      </div>


      {/* Error */}

      {error && (

        <div className="assistant-error">

          <AlertCircle
            size={18}
          />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* Chat area */}

      <div className="chat-card">

        <div className="messages-container">

          {messages.map(
            (message) => (

              <div
                key={
                  message.id
                }
                className={
                  `message-row ${
                    message.role ===
                    "user"
                      ? "user-message"
                      : "assistant-message"
                  }`
                }
              >

                <div className="message-avatar">

                  {message.role ===
                  "user" ? (

                    <User
                      size={17}
                    />

                  ) : (

                    <Bot
                      size={17}
                    />

                  )}

                </div>


                <div className="message-content">

                  <div className="message-role">

                    {message.role ===
                    "user"
                      ? "You"
                      : "LearnPath AI"}

                  </div>


                  <div className="message-bubble">

                    {message.content
                      .split("\n")
                      .map(
                        (
                          line,
                          index
                        ) => (

                          <React.Fragment
                            key={
                              index
                            }
                          >

                            {line}

                            {index <
                              message.content
                                .split("\n")
                                .length -
                                1 && (
                              <br />
                            )}

                          </React.Fragment>

                        )
                      )}

                  </div>

                </div>

              </div>

            )
          )}


          {/* Typing indicator */}

          {loading && (

            <div className="message-row assistant-message">

              <div className="message-avatar">

                <Bot
                  size={17}
                />

              </div>


              <div className="message-content">

                <div className="message-role">
                  LearnPath AI
                </div>


                <div className="message-bubble typing">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            </div>

          )}


          <div
            ref={
              messagesEndRef
            }
          />

        </div>


        {/* Suggestions */}

        {messages.length <= 1 &&
          !loading && (

            <div className="suggestions">

              <div className="suggestions-heading">

                <Sparkles
                  size={15}
                />

                Try asking

              </div>


              <div className="suggestion-list">

                {suggestions.map(
                  (
                    suggestion
                  ) => (

                    <button
                      key={
                        suggestion
                      }
                      onClick={() =>
                        useSuggestion(
                          suggestion
                        )
                      }
                    >

                      {suggestion}

                    </button>

                  )
                )}

              </div>

            </div>

          )}


        {/* Input */}

        <form
          className="chat-input-container"
          onSubmit={
            sendMessage
          }
        >

          <input
            type="text"
            value={
              input
            }
            onChange={(
              event
            ) =>
              setInput(
                event.target.value
              )
            }
            placeholder={
              "Ask me about your learning path..."
            }
            disabled={
              loading
            }
          />


          <button
            type="submit"
            disabled={
              loading ||
              !input.trim()
            }
            className="send-button"
          >

            <Send
              size={19}
            />

          </button>

        </form>

      </div>

    </div>

  );

}


export default Assistant;