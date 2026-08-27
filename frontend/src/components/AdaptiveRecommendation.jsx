import { useEffect, useState } from "react";
import {
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import {
  getAdaptiveRecommendations,
} from "../services/api";

function AdaptiveRecommendation({
  userId,
  progress = [],
  onContinue,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdaptiveData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await getAdaptiveRecommendations(userId);

      console.log(
        "Adaptive recommendation data:",
        result
      );

      setData(result);
    } catch (err) {
      console.error(
        "Adaptive recommendation error:",
        err
      );

      setError(
        "Unable to load adaptive recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdaptiveData();
  }, [userId]);

  /*
   * Calculate overall progress from the same
   * database progress records used by the dashboard.
   */
  const overallProgress = (() => {
    if (!progress || progress.length === 0) {
      return 0;
    }

    const values = progress.map((record) => {
      return Number(
        record.progress_percentage ??
          record.progressPercentage ??
          record.progress ??
          0
      );
    });

    const total = values.reduce(
      (sum, value) =>
        sum + Math.min(Math.max(value, 0), 100),
      0
    );

    return Math.round(total / values.length);
  })();

  /*
   * Backend may return average_progress.
   * Use it only when frontend progress is unavailable.
   */
  const backendProgress = Number(
    data?.learning_statistics?.average_progress ?? 0
  );

  const displayProgress =
    progress.length > 0
      ? overallProgress
      : backendProgress;

  /*
   * Find the highest priority recommendation.
   */
  const recommendation =
    data?.recommendations?.find(
      (item) => item.priority === "HIGH"
    ) ||
    data?.recommendations?.[0];

  /*
   * Find the next unfinished course.
   */
  const nextCourse =
    data?.courses_needing_attention?.[0];

  if (loading) {
    return (
      <div className="adaptive-card">
        <div className="adaptive-header">
          <div className="adaptive-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <p className="eyebrow">
              AI ADAPTIVE ENGINE
            </p>

            <h2>Your next best step</h2>
          </div>
        </div>

        <div className="adaptive-loading">
          Analysing your learning progress...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adaptive-card">
        <p>{error}</p>

        <button
          type="button"
          className="adaptive-retry-button"
          onClick={loadAdaptiveData}
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="adaptive-card">

      {/* HEADER */}

      <div className="adaptive-header">

        <div className="adaptive-icon">
          <Sparkles size={22} />
        </div>

        <div>
          <p className="eyebrow">
            AI ADAPTIVE ENGINE
          </p>

          <h2>
            Your next best step
          </h2>
        </div>

      </div>


      {/* LEARNING MODE */}

      <div className="adaptive-mode">
        <span>
          Learning Mode
        </span>

        <strong>
          {data?.adaptation_status ||
            "Balanced"}
        </strong>
      </div>


      {/* OVERALL PROGRESS */}

      <div className="adaptive-progress">

        <div className="progress-heading">

          <span>
            Overall progress
          </span>

          <strong>
            {displayProgress}%
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width: `${displayProgress}%`,
            }}
          />

        </div>

      </div>


      {/* RECOMMENDATION */}

      {displayProgress >= 100 ? (

        <div className="adaptive-complete">

          <CheckCircle2 size={20} />

          <span>
            🎉 Your current learning path
            is complete!
          </span>

        </div>

      ) : recommendation ? (

        <div className="adaptive-recommendation">

          <div className="recommendation-label">
            RECOMMENDED NEXT STEP
          </div>

          <h3>
            {recommendation.title}
          </h3>

          <p>
            {recommendation.description}
          </p>

          {nextCourse && (
            <div className="adaptive-course">

              <span className="adaptive-course-title">
                {nextCourse.course_title}
              </span>

              <span className="adaptive-course-progress">
                {Number(
                  nextCourse.progress_percentage ?? 0
                )}%
              </span>

            </div>
          )}

        </div>

      ) : (

        <div className="adaptive-recommendation">

          <h3>
            Continue your learning journey
          </h3>

          <p>
            Follow your personalized roadmap
            to continue developing your skills.
          </p>

        </div>

      )}


      {/* ACTION */}

      <div className="adaptive-actions">

        <button
          type="button"
          className="primary-action-button"
          onClick={() => {
            if (onContinue) {
              onContinue(nextCourse);
            }
          }}
        >
          {nextCourse
            ? "Continue Learning"
            : "View Learning Path"}

          <ArrowRight size={17} />

        </button>

        <button
          type="button"
          className="secondary-action-button"
          onClick={loadAdaptiveData}
        >
          <RefreshCw size={16} />
          Recalculate Recommendations
        </button>

      </div>

    </div>
  );
}

export default AdaptiveRecommendation;