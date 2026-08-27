import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import { useUser } from "../context/UserContext";

import {
  updateProgress,
  submitFeedback,
} from "../services/api";


function LearningPath() {
  const { user } = useUser();

  const [learningPath, setLearningPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedItems, setExpandedItems] = useState({});

  const [updatingCourse, setUpdatingCourse] = useState(null);

  const [feedbackStatus, setFeedbackStatus] = useState({});


  /*
   * ---------------------------------------------------------
   * Fetch Learning Path
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchLearningPath();
  }, [user?.id]);


  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8000/api/learning-path/${user.id}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load learning path (${response.status})`
        );
      }

      const data = await response.json();

      /*
       * Backend may return:
       *
       * [
       *   ...
       * ]
       *
       * OR
       *
       * {
       *   learning_path: [...]
       * }
       *
       * OR
       *
       * {
       *   path: [...]
       * }
       */

      let path = [];

      if (Array.isArray(data)) {
        path = data;
      } else if (Array.isArray(data.learning_path)) {
        path = data.learning_path;
      } else if (Array.isArray(data.path)) {
        path = data.path;
      } else if (Array.isArray(data.items)) {
        path = data.items;
      }

      setLearningPath(path);

    } catch (err) {
      console.error("Learning path error:", err);

      setError(
        err.message ||
        "Unable to load your learning path."
      );

    } finally {
      setLoading(false);
    }
  };


  /*
   * ---------------------------------------------------------
   * Normalize course data
   * ---------------------------------------------------------
   */

  const normalizedPath = useMemo(() => {
    return learningPath.map((item, index) => {

      const course = item.course || item.resource || item;

      const courseId =
        item.course_id ??
        course.course_id ??
        course.id;

      const title =
        item.title ||
        course.title ||
        course.name ||
        `Learning Module ${index + 1}`;

      const description =
        item.description ||
        course.description ||
        "Personalized learning resource selected for your learning goal.";

      const difficulty =
        item.difficulty ||
        course.difficulty ||
        "Intermediate";

      const duration =
        item.duration_hours ??
        item.duration ??
        course.duration_hours ??
        course.duration ??
        null;

      const prerequisites =
        item.prerequisites ||
        course.prerequisites ||
        [];

      const skills =
        item.skills ||
        course.skills ||
        [];

      const progress =
        Number(
          item.progress_percentage ??
          item.progress ??
          course.progress_percentage ??
          0
        );

      const status =
        item.status ||
        course.status ||
        (
          progress >= 100
            ? "Completed"
            : progress > 0
              ? "In Progress"
              : "Not Started"
        );

      return {
        ...item,

        courseId,
        title,
        description,
        difficulty,
        duration,
        prerequisites,
        skills,
        progress,
        status,

        sequence:
          item.sequence ??
          item.order ??
          index + 1,
      };
    });
  }, [learningPath]);


  /*
   * ---------------------------------------------------------
   * Progress statistics
   * ---------------------------------------------------------
   */

  const completedCount = normalizedPath.filter(
    (item) => item.progress >= 100
  ).length;


  const overallProgress =
    normalizedPath.length > 0
      ? normalizedPath.reduce(
          (total, item) =>
            total + Math.min(item.progress, 100),
          0
        ) / normalizedPath.length
      : 0;


  /*
   * ---------------------------------------------------------
   * Expand / Collapse
   * ---------------------------------------------------------
   */

  const toggleExpanded = (index) => {

    setExpandedItems((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));

  };


  /*
   * ---------------------------------------------------------
   * Update Progress
   * ---------------------------------------------------------
   */

  const handleProgress = async (
    courseId,
    percentage
  ) => {

    if (!user?.id || !courseId) {
      return;
    }

    try {

      setUpdatingCourse(courseId);

      await updateProgress(
        user.id,
        courseId,
        percentage
      );

      /*
       * Update UI immediately instead of
       * forcing a full page reload.
       */

      setLearningPath((previous) =>
        previous.map((item) => {

          const itemCourse =
            item.course || item.resource || item;

          const itemId =
            item.course_id ??
            itemCourse.course_id ??
            itemCourse.id;

          if (Number(itemId) !== Number(courseId)) {
            return item;
          }

          return {
            ...item,
            progress_percentage: percentage,
            progress: percentage,
            status:
              percentage >= 100
                ? "Completed"
                : percentage > 0
                  ? "In Progress"
                  : "Not Started",
          };

        })
      );

    } catch (err) {

      console.error(
        "Progress update error:",
        err
      );

      setError(
        "Unable to update progress. Please try again."
      );

    } finally {

      setUpdatingCourse(null);

    }
  };


  /*
   * ---------------------------------------------------------
   * Feedback
   * ---------------------------------------------------------
   */

  const handleFeedback = async (
    courseId,
    feedbackType
  ) => {

    if (!user?.id || !courseId) {
      return;
    }

    try {

      setFeedbackStatus((previous) => ({
        ...previous,
        [courseId]: feedbackType,
      }));

      await submitFeedback(
        user.id,
        courseId,
        feedbackType
      );

    } catch (err) {

      console.error(
        "Feedback error:",
        err
      );

      setError(
        "Unable to submit feedback."
      );

      setFeedbackStatus((previous) => {

        const updated = {
          ...previous,
        };

        delete updated[courseId];

        return updated;
      });

    }
  };


  /*
   * ---------------------------------------------------------
   * No user selected
   * ---------------------------------------------------------
   */

  if (!user) {

    return (
      <div className="learning-path-container">

        <div className="empty-state">

          <AlertCircle size={40} />

          <h2>
            No learner selected
          </h2>

          <p>
            Please select a learner profile
            before viewing the learning path.
          </p>

        </div>

      </div>
    );

  }


  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loading) {

    return (
      <div className="learning-path-container">

        <div className="loading-state">

          <div className="loading-spinner"></div>

          <p>
            Building your personalized
            learning path...
          </p>

        </div>

      </div>
    );

  }


  /*
   * ---------------------------------------------------------
   * Error
   * ---------------------------------------------------------
   */

  if (error && normalizedPath.length === 0) {

    return (
      <div className="learning-path-container">

        <div className="error-state">

          <AlertCircle size={40} />

          <h2>
            Unable to load learning path
          </h2>

          <p>
            {error}
          </p>

          <button
            onClick={fetchLearningPath}
            className="retry-button"
          >
            Try Again
          </button>

        </div>

      </div>
    );

  }


  /*
   * ---------------------------------------------------------
   * Empty learning path
   * ---------------------------------------------------------
   */

  if (normalizedPath.length === 0) {

    return (
      <div className="learning-path-container">

        <div className="empty-state">

          <BookOpen size={48} />

          <h2>
            Your learning path is empty
          </h2>

          <p>
            Complete your learner profile and
            set a learning goal to generate
            a personalized roadmap.
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

    <div className="learning-path-container">

      {/* Header */}

      <div className="learning-path-header">

        <div>

          <p className="page-label">
            PERSONALIZED ROADMAP
          </p>

          <h1>
            Your Learning Path
          </h1>

          <p className="page-description">
            A step-by-step roadmap generated
            according to your skills, goals
            and learning progress.
          </p>

        </div>

      </div>


      {/* Progress summary */}

      <div className="path-summary">

        <div className="summary-card">

          <BookOpen size={22} />

          <div>

            <span>
              Total Resources
            </span>

            <strong>
              {normalizedPath.length}
            </strong>

          </div>

        </div>


        <div className="summary-card">

          <CheckCircle2 size={22} />

          <div>

            <span>
              Completed
            </span>

            <strong>
              {completedCount}
            </strong>

          </div>

        </div>


        <div className="summary-card">

          <Clock3 size={22} />

          <div>

            <span>
              Overall Progress
            </span>

            <strong>
              {Math.round(overallProgress)}%
            </strong>

          </div>

        </div>

      </div>


      {/* Overall progress */}

      <div className="overall-progress-card">

        <div className="progress-heading">

          <span>
            Learning Progress
          </span>

          <strong>
            {Math.round(overallProgress)}%
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width:
                `${Math.min(
                  overallProgress,
                  100
                )}%`,
            }}
          />

        </div>

      </div>


      {/* Error banner */}

      {error && (

        <div className="error-banner">

          <AlertCircle size={18} />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* Timeline */}

      <div className="learning-timeline">

        {normalizedPath.map(
          (item, index) => {

            const isExpanded =
              Boolean(
                expandedItems[index]
              );

            const isCompleted =
              item.progress >= 100;

            const isCurrent =
              !isCompleted &&
              (
                index === 0 ||
                normalizedPath
                  .slice(0, index)
                  .every(
                    (previous) =>
                      previous.progress >= 100
                  )
              );


            return (

              <div
                className={`timeline-item ${
                  isCompleted
                    ? "completed"
                    : isCurrent
                      ? "current"
                      : ""
                }`}
                key={
                  item.courseId ??
                  `${item.title}-${index}`
                }
              >

                {/* Timeline marker */}

                <div className="timeline-marker">

                  {isCompleted ? (

                    <CheckCircle2
                      size={25}
                    />

                  ) : (

                    <Circle
                      size={25}
                    />

                  )}

                </div>


                {/* Course card */}

                <div className="course-card">

                  <div
                    className="course-main"
                    onClick={() =>
                      toggleExpanded(index)
                    }
                  >

                    <div className="course-number">

                      {index + 1}

                    </div>


                    <div className="course-content">

                      <div className="course-top">

                        <span className="course-badge">

                          {isCompleted
                            ? "Completed"
                            : isCurrent
                              ? "Next Recommended"
                              : `Step ${index + 1}`}

                        </span>

                        <span className="difficulty-badge">

                          {item.difficulty}

                        </span>

                      </div>


                      <h3>
                        {item.title}
                      </h3>


                      <p>
                        {item.description}
                      </p>


                      <div className="course-meta">

                        {item.duration && (

                          <span>

                            <Clock3
                              size={14}
                            />

                            {item.duration}
                            {typeof item.duration === "number"
                              ? " hours"
                              : ""}

                          </span>

                        )}


                        {item.skills &&
                          item.skills.length > 0 && (

                            <span>

                              <BookOpen
                                size={14}
                              />

                              {item.skills
                                .slice(0, 3)
                                .join(", ")}

                            </span>

                          )}

                      </div>

                    </div>


                    <div className="expand-icon">

                      {isExpanded ? (

                        <ChevronUp
                          size={20}
                        />

                      ) : (

                        <ChevronDown
                          size={20}
                        />

                      )}

                    </div>

                  </div>


                  {/* Progress */}

                  <div className="course-progress">

                    <div className="course-progress-info">

                      <span>
                        Progress
                      </span>

                      <strong>
                        {Math.round(
                          item.progress
                        )}%
                      </strong>

                    </div>


                    <div className="progress-track">

                      <div
                        className="progress-fill"
                        style={{
                          width:
                            `${Math.min(
                              item.progress,
                              100
                            )}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* Expanded details */}

                  {isExpanded && (

                    <div className="course-details">

                      {/* Prerequisites */}

                      {item.prerequisites &&
                        item.prerequisites.length > 0 && (

                          <div className="detail-section">

                            <h4>
                              Prerequisites
                            </h4>

                            <ul>

                              {item.prerequisites.map(
                                (
                                  prerequisite,
                                  prerequisiteIndex
                                ) => (

                                  <li
                                    key={
                                      prerequisiteIndex
                                    }
                                  >
                                    {typeof prerequisite ===
                                    "string"
                                      ? prerequisite
                                      : prerequisite.name ||
                                        prerequisite.title ||
                                        JSON.stringify(
                                          prerequisite
                                        )}
                                  </li>

                                )
                              )}

                            </ul>

                          </div>

                        )}


                      {/* Skills */}

                      {item.skills &&
                        item.skills.length > 0 && (

                          <div className="detail-section">

                            <h4>
                              Skills Developed
                            </h4>

                            <div className="skill-tags">

                              {item.skills.map(
                                (
                                  skill,
                                  skillIndex
                                ) => (

                                  <span
                                    key={
                                      skillIndex
                                    }
                                  >
                                    {typeof skill ===
                                    "string"
                                      ? skill
                                      : skill.name ||
                                        skill.title}
                                  </span>

                                )
                              )}

                            </div>

                          </div>

                        )}


                      {/* Progress actions */}

                      <div className="detail-section">

                        <h4>
                          Update Progress
                        </h4>

                        <div className="progress-actions">

                          <button
                            disabled={
                              updatingCourse ===
                              item.courseId
                            }
                            onClick={() =>
                              handleProgress(
                                item.courseId,
                                25
                              )
                            }
                          >
                            25%
                          </button>

                          <button
                            disabled={
                              updatingCourse ===
                              item.courseId
                            }
                            onClick={() =>
                              handleProgress(
                                item.courseId,
                                50
                              )
                            }
                          >
                            50%
                          </button>

                          <button
                            disabled={
                              updatingCourse ===
                              item.courseId
                            }
                            onClick={() =>
                              handleProgress(
                                item.courseId,
                                75
                              )
                            }
                          >
                            75%
                          </button>

                          <button
                            className="complete-button"
                            disabled={
                              updatingCourse ===
                              item.courseId ||
                              isCompleted
                            }
                            onClick={() =>
                              handleProgress(
                                item.courseId,
                                100
                              )
                            }
                          >

                            <CheckCircle2
                              size={15}
                            />

                            Mark Complete

                          </button>

                        </div>

                      </div>


                      {/* Feedback */}

                      <div className="detail-section">

                        <h4>

                          <MessageSquare
                            size={16}
                          />

                          How was this resource?

                        </h4>


                        <div className="feedback-actions">

                          {[
                            {
                              value:
                                "TOO_EASY",
                              label:
                                "Too Easy",
                            },
                            {
                              value:
                                "JUST_RIGHT",
                              label:
                                "Just Right",
                            },
                            {
                              value:
                                "TOO_DIFFICULT",
                              label:
                                "Too Difficult",
                            },
                            {
                              value:
                                "ALREADY_KNOW",
                              label:
                                "Already Know",
                            },
                            {
                              value:
                                "NOT_RELEVANT",
                              label:
                                "Not Relevant",
                            },
                          ].map(
                            (feedback) => (

                              <button
                                key={
                                  feedback.value
                                }
                                className={
                                  feedbackStatus[
                                    item.courseId
                                  ] ===
                                  feedback.value
                                    ? "selected"
                                    : ""
                                }
                                onClick={() =>
                                  handleFeedback(
                                    item.courseId,
                                    feedback.value
                                  )
                                }
                              >
                                {
                                  feedback.label
                                }
                              </button>

                            )
                          )}

                        </div>

                      </div>

                    </div>

                  )}

                </div>

              </div>

            );

          }
        )}

      </div>

    </div>

  );
}


export default LearningPath;