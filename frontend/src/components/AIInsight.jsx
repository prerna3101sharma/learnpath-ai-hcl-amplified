import {
  useEffect,
  useState
} from "react";

import {
  Sparkles
} from "lucide-react";

import {
  useUser
} from "../context/UserContext";

import api from "../services/api";


function AIInsight() {

  const { user } = useUser();

  const [insight, setInsight] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    if (!user?.id) {
      return;
    }


    const loadInsight =
      async () => {

        try {

          setLoading(true);

          const response =
            await api.get(
              `/api/analytics/${user.id}/insight`
            );

          setInsight(
            response.data.insight
          );

        } catch (error) {

          console.error(
            "AI insight error:",
            error
          );

        } finally {

          setLoading(false);

        }

      };


    loadInsight();

  }, [user?.id]);


  return (

    <div className="ai-insight-card">

      <div className="ai-insight-header">

        <Sparkles size={20} />

        <div>

          <h3>
            AI Learning Insight
          </h3>

          <span>
            Personalized for you
          </span>

        </div>

      </div>


      {loading ? (

        <p>
          Analyzing your learning progress...
        </p>

      ) : (

        <p className="ai-insight-text">
          {insight}
        </p>

      )}

    </div>

  );

}


export default AIInsight;