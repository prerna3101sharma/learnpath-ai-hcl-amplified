import { useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  ChevronDown,
  ChevronUp,
  Circle,
  Target,
} from "lucide-react";

function LearningPath({ path }) {
  const [openModule, setOpenModule] = useState(null);

  /*
   * ---------------------------------------------------------
   * SAFETY CHECK
   * ---------------------------------------------------------
   */

  if (!path) {
    return (
      <section className="learning-path-section">
        <div className="learning-path-empty">
          <BookOpen size={28} />
          <h3>Learning Path Not Available</h3>
          <p>
            Your personalized learning path could not be loaded.
          </p>
        </div>
      </section>
    );
  }

  /*
   * ---------------------------------------------------------
   * AI GENERATED MODULES
   * ---------------------------------------------------------
   *
   * These modules come directly from:
   *
   * backend:
   * generate_learning_path()
   *
   * path.items
   */

  const modules = Array.isArray(path.items)
    ? path.items
    : [];

  /*
   * ---------------------------------------------------------
   * CALCULATE PROGRESS
   * ---------------------------------------------------------
   */

  const completedCount = useMemo(() => {
    return modules.filter(
      (item) =>
        String(item.status || "").toLowerCase() ===
        "completed"
    ).length;
  }, [modules]);

  const totalModules = modules.length;

  const progress =
    totalModules > 0
      ? Math.round(
          (completedCount / totalModules) * 100
        )
      : 0;

  /*
   * Use backend progress if available.
   */
  const overallProgress =
    Number.isFinite(
      Number(path.progress_percentage)
    )
      ? Number(path.progress_percentage)
      : progress;

  /*
   * ---------------------------------------------------------
   * TOGGLE MODULE
   * ---------------------------------------------------------
   */

  const toggleModule = (index) => {
    setOpenModule(
      openModule === index
        ? null
        : index
    );
  };

  /*
   * ---------------------------------------------------------
   * STATUS
   * ---------------------------------------------------------
   */

  const getStatusLabel = (status, index) => {
    const normalized =
      String(status || "").toLowerCase();

    if (normalized === "completed") {
      return "Completed";
    }

    if (
      normalized === "next" ||
      index === 0
    ) {
      return "Next Recommended";
    }

    return "Upcoming";
  };

  /*
   * ---------------------------------------------------------
   * STATUS CLASS
   * ---------------------------------------------------------
   */

  const getStatusClass = (status, index) => {
    const normalized =
      String(status || "").toLowerCase();

    if (normalized === "completed") {
      return "completed";
    }

    if (
      normalized === "next" ||
      index === 0
    ) {
      return "next";
    }

    return "upcoming";
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <section className="learning-path-section">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="learning-path-header">

        <div>
          <span className="learning-path-eyebrow">
            PERSONALIZED ROADMAP
          </span>

          <h2>
            Your Learning Path
          </h2>

          <p>
            A step-by-step roadmap generated according
            to your skills, goals and learning progress.
          </p>
        </div>

      </div>


      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="learning-path-summary">

        <div className="path-summary-card">

          <div className="summary-icon">
            <BookOpen size={22} />
          </div>

          <div>
            <span>
              Total Resources
            </span>

            <strong>
              {totalModules}
            </strong>
          </div>

        </div>


        <div className="path-summary-card">

          <div className="summary-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {completedCount}
            </strong>
          </div>

        </div>


        <div className="path-summary-card">

          <div className="summary-icon">
            <Clock3 size={22} />
          </div>

          <div>
            <span>
              Overall Progress
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          OVERALL PROGRESS
      ====================================================== */}

      <div className="overall-progress-card">

        <div className="progress-heading">

          <span>
            Learning Progress
          </span>

          <strong>
            {overallProgress}%
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width: `${Math.min(
                Math.max(
                  overallProgress,
                  0
                ),
                100
              )}%`,
            }}
          />

        </div>

      </div>


      {/* =====================================================
          AI GENERATED MODULES
      ====================================================== */}

      {modules.length === 0 ? (

        <div className="learning-path-empty">

          <BookOpen size={30} />

          <h3>
            No learning modules available
          </h3>

          <p>
            The AI could not generate a learning
            path for this learner.
          </p>

        </div>

      ) : (

        <div className="learning-path-timeline">

          {modules.map((item, index) => {

            const statusClass =
              getStatusClass(
                item.status,
                index
              );

            const statusLabel =
              getStatusLabel(
                item.status,
                index
              );

            const isOpen =
              openModule === index;

            const moduleProgress =
              item.progress_percentage ??
              item.progress ??
              (
                String(item.status || "")
                  .toLowerCase() ===
                "completed"
                  ? 100
                  : 0
              );

            return (

              <div
                className={`learning-module-wrapper ${statusClass}`}
                key={
                  item.course_id ??
                  `${item.course_title}-${index}`
                }
              >

                {/* =================================================
                    TIMELINE NODE
                ================================================== */}

                <div className="timeline-node">

                  {statusClass ===
                  "completed" ? (

                    <CheckCircle2
                      size={20}
                    />

                  ) : (

                    <Circle
                      size={20}
                    />

                  )}

                </div>


                {/* =================================================
                    MODULE CARD
                ================================================== */}

                <div className="learning-module-card">

                  {/* MODULE HEADER */}

                  <button
                    type="button"
                    className="learning-module-header"
                    onClick={() =>
                      toggleModule(index)
                    }
                  >

                    <div className="module-left">

                      <div className="module-number">
                        {item.sequence ??
                          index + 1}
                      </div>

                      <div className="module-title-area">

                        <div className="module-badges">

                          <span
                            className={`module-status ${statusClass}`}
                          >
                            {statusLabel}
                          </span>

                          {item.difficulty && (
                            <span className="difficulty-badge">
                              {item.difficulty}
                            </span>
                          )}

                        </div>

                        <h3>
                          {item.course_title ||
                            "Learning Module"}
                        </h3>

                        {item.milestone && (
                          <p className="module-milestone">
                            {item.milestone}
                          </p>
                        )}

                      </div>

                    </div>


                    <div className="module-toggle">

                      {isOpen ? (
                        <ChevronUp
                          size={20}
                        />
                      ) : (
                        <ChevronDown
                          size={20}
                        />
                      )}

                    </div>

                  </button>


                  {/* =================================================
                      MODULE CONTENT
                  ================================================== */}

                  {isOpen && (

                    <div className="learning-module-content">

                      {/* SKILL */}

                      {item.skill_name && (

                        <div className="module-detail">

                          <div className="detail-icon">
                            <Target
                              size={18}
                            />
                          </div>

                          <div>

                            <span>
                              Skill
                            </span>

                            <strong>
                              {item.skill_name}
                            </strong>

                          </div>

                        </div>

                      )}


                      {/* OBJECTIVE */}

                      {item.objective && (

                        <div className="module-objective">

                          <span>
                            Learning Objective
                          </span>

                          <p>
                            {item.objective}
                          </p>

                        </div>

                      )}


                      {/* REASON */}

                      {item.reason && (

                        <div className="module-reason">

                          <span>
                            Why this module?
                          </span>

                          <p>
                            {item.reason}
                          </p>

                        </div>

                      )}


                      {/* COURSE META */}

                      <div className="module-meta">

                        <div>

                          <Clock3
                            size={16}
                          />

                          <span>
                            {item.estimated_hours ??
                              0}{" "}
                            hours
                          </span>

                        </div>

                        <div>

                          <BookOpen
                            size={16}
                          />

                          <span>
                            Module{" "}
                            {item.sequence ??
                              index + 1}
                          </span>

                        </div>

                      </div>


                      {/* MODULE PROGRESS */}

                      <div className="module-progress">

                        <div className="module-progress-heading">

                          <span>
                            Progress
                          </span>

                          <strong>
                            {moduleProgress}%
                          </strong>

                        </div>

                        <div className="module-progress-track">

                          <div
                            className="module-progress-fill"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  Number(
                                    moduleProgress
                                  ) || 0,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* CONTINUE BUTTON */}

                      {statusClass !==
                        "completed" && (

                        <button
                          type="button"
                          className="continue-learning-btn"
                        >
                          Continue Learning
                          <span>
                            →
                          </span>
                        </button>

                      )}

                    </div>

                  )}

                </div>

              </div>
            );
          })}

        </div>

      )}

    </section>
  );
}

export default LearningPath;