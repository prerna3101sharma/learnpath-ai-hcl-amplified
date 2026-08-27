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
  getUserProgress,
  submitFeedback,
} from "../services/api";

function LearningPath() {
  const { user } = useUser();

  const [learningPath, setLearningPath] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);

  const [error, setError] = useState("");
  const [expandedItems, setExpandedItems] = useState({});
  const [updatingCourse, setUpdatingCourse] = useState(null);
  const [feedbackStatus, setFeedbackStatus] = useState({});

  /*
   * =========================================================
   * LOAD DATA WHEN USER CHANGES
   * =========================================================
   */

  useEffect(() => {
    if (!user?.id) {
      setLearningPath([]);
      setProgressMap({});
      setLoading(false);
      setProgressLoading(false);
      return;
    }

    loadUserData();
  }, [user?.id]);

  /*
   * =========================================================
   * LOAD LEARNING PATH + SAVED PROGRESS
   * =========================================================
   */

  const loadUserData = async () => {
    setLoading(true);
    setProgressLoading(true);
    setError("");

    try {
      /*
       * Load learning path
       */
      const pathResponse = await fetch(
        `http://localhost:8000/api/learning-path/${user.id}`
      );

      if (!pathResponse.ok) {
        throw new Error(
          `Failed to load learning path (${pathResponse.status})`
        );
      }

      const pathData = await pathResponse.json();

      let path = [];

      if (Array.isArray(pathData)) {
        path = pathData;
      } else if (Array.isArray(pathData.learning_path)) {
        path = pathData.learning_path;
      } else if (Array.isArray(pathData.path)) {
        path = pathData.path;
      } else if (Array.isArray(pathData.items)) {
        path = pathData.items;
      }

      setLearningPath(path);

      /*
       * Load progress from database
       */
      const progressRecords = await getUserProgress(user.id);

      const mappedProgress = {};

      if (Array.isArray(progressRecords)) {
        progressRecords.forEach((record) => {
          const courseId =
            record.course_id ??
            record.courseId ??
            record.resource_id ??
            record.resourceId;

          const percentage =
            record.progress_percentage ??
            record.progress ??
            0;

          if (courseId !== undefined && courseId !== null) {
            mappedProgress[Number(courseId)] = Number(percentage);
          }
        });
      }

      setProgressMap(mappedProgress);

      /*
       * Load saved feedback if backend provides it
       */
      const savedFeedback = {};

      if (Array.isArray(progressRecords)) {
        progressRecords.forEach((record) => {
          const courseId =
            record.course_id ??
            record.courseId ??
            record.resource_id ??
            record.resourceId;

          const feedback =
            record.feedback_type ??
            record.feedback ??
            record.feedbackType;

          if (
            courseId !== undefined &&
            courseId !== null &&
            feedback
          ) {
            savedFeedback[Number(courseId)] = feedback;
          }
        });
      }

      setFeedbackStatus(savedFeedback);
    } catch (err) {
      console.error("Failed to load user data:", err);

      setError(
        err.message ||
          "Unable to load your personalized learning path."
      );
    } finally {
      setLoading(false);
      setProgressLoading(false);
    }
  };

  /*
   * =========================================================
   * NORMALIZE LEARNING PATH
   * =========================================================
   *
   * IMPORTANT:
   *
   * progressMap is used here.
   *
   * This means:
   *
   * Database progress
   *        ↓
   * progressMap
   *        ↓
   * normalizedPath
   *        ↓
   * UI
   *
   * Therefore progress remains visible after
   * navigating between pages.
   */

  const normalizedPath = useMemo(() => {
    return learningPath.map((item, index) => {
      const course =
        item.course ||
        item.resource ||
        item;

      const courseId =
        item.course_id ??
        item.courseId ??
        course.course_id ??
        course.courseId ??
        course.id;

      const numericCourseId =
        courseId !== undefined &&
        courseId !== null
          ? Number(courseId)
          : null;

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

      /*
       * FIRST PRIORITY:
       * Progress loaded from database.
       *
       * SECOND PRIORITY:
       * Progress returned by learning-path API.
       *
       * THIRD PRIORITY:
       * 0
       */

      const databaseProgress =
        numericCourseId !== null
          ? progressMap[numericCourseId]
          : undefined;

      const apiProgress =
        item.progress_percentage ??
        item.progress ??
        course.progress_percentage ??
        course.progress ??
        0;

      const progress =
        databaseProgress !== undefined
          ? Number(databaseProgress)
          : Number(apiProgress);

      const safeProgress = Math.max(
        0,
        Math.min(progress, 100)
      );

      const status =
        safeProgress >= 100
          ? "Completed"
          : safeProgress > 0
          ? "In Progress"
          : "Not Started";

      return {
        ...item,

        courseId: numericCourseId,

        title,
        description,
        difficulty,
        duration,
        prerequisites,
        skills,

        progress: safeProgress,
        progress_percentage: safeProgress,

        status,

        sequence:
          item.sequence ??
          item.order ??
          index + 1,
      };
    });
  }, [learningPath, progressMap]);

  /*
   * =========================================================
   * PROGRESS STATISTICS
   * =========================================================
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
   * =========================================================
   * EXPAND / COLLAPSE
   * =========================================================
   */

  const toggleExpanded = (index) => {
    setExpandedItems((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  };

  /*
   * =========================================================
   * UPDATE COURSE PROGRESS
   * =========================================================
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
      setError("");

      /*
       * Save to backend/database
       */
      const result = await updateProgress(
        user.id,
        courseId,
        percentage
      );

      /*
       * Backend may return the saved percentage.
       * If it doesn't, use the percentage sent.
       */

      const savedPercentage =
        Number(
          result?.progress_percentage ??
            result?.progress ??
            percentage
        );

      /*
       * IMPORTANT:
       *
       * Update progressMap.
       *
       * normalizedPath depends on progressMap,
       * so the UI automatically updates.
       */

      setProgressMap((previous) => ({
        ...previous,

        [Number(courseId)]: savedPercentage,
      }));
    } catch (err) {
      console.error(
        "Progress update error:",
        err
      );

      setError(
        "Unable to save progress. Please try again."
      );
    } finally {
      setUpdatingCourse(null);
    }
  };

  /*
   * =========================================================
   * FEEDBACK
   * =========================================================
   */

  const handleFeedback = async (
    courseId,
    feedbackType
  ) => {
    if (!user?.id || !courseId) {
      return;
    }

    try {
      setError("");

      /*
       * Optimistic UI update
       */
      setFeedbackStatus((previous) => ({
        ...previous,
        [Number(courseId)]: feedbackType,
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
    }
  };

  /*
   * =========================================================
   * NO USER SELECTED
   * =========================================================
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
   * =========================================================
   * LOADING
   * =========================================================
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
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (
    error &&
    normalizedPath.length === 0
  ) {
    return (
      <div className="learning-path-container">
        <div className="error-state">
          <AlertCircle size={40} />

          <h2>
            Unable to load learning path
          </h2>

          <p>{error}</p>

          <button
            onClick={loadUserData}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * EMPTY PATH
   * =========================================================
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
   * =========================================================
   * MAIN UI
   * =========================================================
   */

  return (
    <div className="learning-path-container">

      {/* HEADER */}

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

      {/* SUMMARY */}

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
              {Math.round(
                overallProgress
              )}
              %
            </strong>
          </div>
        </div>

      </div>

      {/* OVERALL PROGRESS */}

      <div className="overall-progress-card">

        <div className="progress-heading">
          <span>
            Learning Progress
          </span>

          <strong>
            {Math.round(
              overallProgress
            )}
            %
          </strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(
                overallProgress,
                100
              )}%`,
            }}
          />
        </div>

      </div>

      {/* ERROR BANNER */}

      {error && (
        <div className="error-banner">
          <AlertCircle size={18} />

          <span>
            {error}
          </span>
        </div>
      )}

      {/* DATABASE LOADING */}

      {progressLoading && (
        <div className="progress-loading-message">
          Syncing saved learning progress...
        </div>
      )}

      {/* TIMELINE */}

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
                      previous.progress >=
                      100
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

                {/* TIMELINE MARKER */}

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

                {/* COURSE CARD */}

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
                            : `Step ${
                                index + 1
                              }`}
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

                            {typeof item.duration ===
                            "number"
                              ? " hours"
                              : ""}
                          </span>
                        )}

                        {Array.isArray(
                          item.skills
                        ) &&
                          item.skills.length >
                            0 && (
                            <span>
                              <BookOpen
                                size={14}
                              />

                              {item.skills
                                .slice(
                                  0,
                                  3
                                )
                                .map(
                                  (
                                    skill
                                  ) =>
                                    typeof skill ===
                                    "string"
                                      ? skill
                                      : skill.name ||
                                        skill.title ||
                                        ""
                                )
                                .join(
                                  ", "
                                )}
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

                  {/* COURSE PROGRESS */}

                  <div className="course-progress">

                    <div className="course-progress-info">

                      <span>
                        Progress
                      </span>

                      <strong>
                        {Math.round(
                          item.progress
                        )}
                        %
                      </strong>

                    </div>

                    <div className="progress-track">

                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(
                            item.progress,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* EXPANDED DETAILS */}

                  {isExpanded && (
                    <div className="course-details">

                      {/* PREREQUISITES */}

                      {Array.isArray(
                        item.prerequisites
                      ) &&
                        item.prerequisites
                          .length >
                          0 && (
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

                      {/* SKILLS */}

                      {Array.isArray(
                        item.skills
                      ) &&
                        item.skills.length >
                          0 && (
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
                                        skill.title ||
                                        ""}
                                  </span>
                                )
                              )}

                            </div>

                          </div>
                        )}

                      {/* PROGRESS ACTIONS */}

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

                      {/* FEEDBACK */}

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
                            (
                              feedback
                            ) => (
                              <button
                                key={
                                  feedback.value
                                }
                                className={
                                  feedbackStatus[
                                    Number(
                                      item.courseId
                                    )
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