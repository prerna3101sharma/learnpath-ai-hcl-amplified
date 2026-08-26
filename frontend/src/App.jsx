import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [backendStatus, setBackendStatus] = useState("Checking...");

  useEffect(() => {
    api
      .get("/api/health")
      .then((response) => {
        setBackendStatus(response.data.status);
      })
      .catch(() => {
        setBackendStatus("Backend unavailable");
      });
  }, []);

  return (
    <div>
      <h1>LearnPath AI</h1>

      <p>
        Personalized Learning Path Recommender
      </p>

      <p>
        Backend: {backendStatus}
      </p>
    </div>
  );
}

export default App;