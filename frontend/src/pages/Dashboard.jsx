import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Clock3,
  BookOpen,
  TrendingUp,
  Target,
  ArrowRight,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import AIInsight from "../components/AIInsight";
import StatCard from "../components/StatCard";
import SkillGapChart from "../components/SkillGapChart";
import LearningPath from "../components/LearningPath";
import Chatbot from "../components/Chatbot";
import AdaptiveRecommendation from "../components/AdaptiveRecommendation";
import {
  getProfile,
  getSkillGaps,
  getLearningPath,
  getUserProgress,
} from "../services/api";

import {
  useUser,
} from "../context/UserContext";


function Dashboard() {

  // =========================================================
  // STATE
  // =========================================================

  const [profile, setProfile] =
    useState(null);

  const [skills, setSkills] =
    useState([]);

  const [path, setPath] =
    useState(null);

  const [userProgress, setUserProgress] =
    useState([]);

  const [progressLoading, setProgressLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(true);


  // =========================================================
  // CURRENT USER
  // =========================================================

  const {
    user,
  } = useUser();


  const navigate =
    useNavigate();


  const USER_ID =
    user?.id;


  // =========================================================
  // REDIRECT IF NO USER
  // =========================================================

  useEffect(() => {

    if (!user) {

      navigate("/login");

    }

  }, [
    user,
    navigate,
  ]);


  // =========================================================
  // LOAD SAVED USER PROGRESS
  // =========================================================

  useEffect(() => {

    if (!user?.id) {

      setUserProgress([]);

      setProgressLoading(false);

      return;

    }


    const loadProgress =
      async () => {

        try {

          setProgressLoading(true);


          const records =
            await getUserProgress(
              user.id
            );


          console.log(
            "Dashboard progress records:",
            records
          );


          setUserProgress(
            Array.isArray(records)
              ? records
              : []
          );


        } catch (error) {

          console.error(
            "Dashboard progress error:",
            error
          );


          setUserProgress([]);

        } finally {

          setProgressLoading(false);

        }

      };


    loadProgress();

  }, [
    user?.id,
  ]);


  // =========================================================
  // CREATE PROGRESS MAP
  // =========================================================
  //
  // Converts:
  //
  // [
  //   {
  //     course_id: 1,
  //     progress_percentage: 50
  //   },
  //   {
  //     course_id: 2,
  //     progress_percentage: 100
  //   }
  // ]
  //
  // into:
  //
  // {
  //   1: 50,
  //   2: 100
  // }
  //
  // =========================================================

  const progressMap =
    useMemo(() => {

      const map = {};


      userProgress.forEach(
        (record) => {

          const courseId =
            record.course_id ??
            record.courseId;


          const progress =
            Number(
              record.progress_percentage ??
              record.progressPercentage ??
              record.progress ??
              0
            );


          if (
            courseId !== undefined &&
            courseId !== null
          ) {

            map[
              Number(courseId)
            ] =
              Math.min(
                Math.max(
                  progress,
                  0
                ),
                100
              );

          }

        }
      );


      return map;

    }, [
      userProgress,
    ]);


  // =========================================================
  // GET PROGRESS FOR COURSE
  // =========================================================

  const getCourseProgress =
    (courseId, fallback = 0) => {

      if (
        courseId === undefined ||
        courseId === null
      ) {

        return Number(
          fallback
        ) || 0;

      }


      const savedProgress =
        progressMap[
          Number(courseId)
        ];


      if (
        savedProgress !== undefined
      ) {

        return Number(
          savedProgress
        );

      }


      return Number(
        fallback
      ) || 0;

    };


  // =========================================================
  // CALCULATE OVERALL PROGRESS
  // =========================================================
  //
  // IMPORTANT:
  //
  // Calculate progress from the actual
  // saved progress records rather than:
  //
  // path.progress_percentage
  //
  // =========================================================

  const overallProgress =
    useMemo(() => {

      if (
        !path?.items ||
        !Array.isArray(
          path.items
        ) ||
        path.items.length === 0
      ) {

        /*
         * If the learning path does not
         * contain items, fall back to
         * all saved progress records.
         */

        if (
          userProgress.length === 0
        ) {

          return 0;

        }


        const total =
          userProgress.reduce(
            (
              sum,
              record
            ) => {

              const progress =
                Number(
                  record.progress_percentage ??
                  record.progressPercentage ??
                  record.progress ??
                  0
                );


              return (
                sum +
                Math.min(
                  Math.max(
                    progress,
                    0
                  ),
                  100
                )
              );

            },
            0
          );


        return Math.round(
          total /
          userProgress.length
        );

      }


      /*
       * Calculate only against
       * courses that are actually
       * part of the learning path.
       */

      const total =
        path.items.reduce(
          (
            sum,
            item
          ) => {

            const courseId =
              item.course_id ??
              item.courseId ??
              item.course?.id;


            const backendProgress =
              item.progress_percentage ??
              item.progress ??
              0;


            const progress =
              getCourseProgress(
                courseId,
                backendProgress
              );


            return (
              sum +
              Math.min(
                Math.max(
                  Number(progress) || 0,
                  0
                ),
                100
              )
            );

          },
          0
        );


      return Math.round(
        total /
        path.items.length
      );


    }, [
      path,
      progressMap,
      userProgress,
    ]);


  // =========================================================
  // COMPLETED COURSES
  // =========================================================

  const completedCourses =
    useMemo(() => {

      if (
        !path?.items ||
        !Array.isArray(
          path.items
        )
      ) {

        /*
         * Fallback to saved
         * progress records.
         */

        return userProgress.filter(
          (record) => {

            const progress =
              Number(
                record.progress_percentage ??
                record.progressPercentage ??
                record.progress ??
                0
              );


            return progress >= 100;

          }
        ).length;

      }


      /*
       * Count only courses
       * inside the learning path.
       */

      return path.items.filter(
        (item) => {

          const courseId =
            item.course_id ??
            item.courseId ??
            item.course?.id;


          const backendProgress =
            item.progress_percentage ??
            item.progress ??
            0;


          const progress =
            getCourseProgress(
              courseId,
              backendProgress
            );


          return progress >= 100;

        }
      ).length;


    }, [
      path,
      progressMap,
      userProgress,
    ]);


  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {

    if (!USER_ID) {

      return;

    }


    const loadDashboard =
      async () => {

        try {

          setLoading(true);


          const [
            profileData,
            skillData,
            pathData,
          ] = await Promise.all([

            getProfile(
              USER_ID
            ),

            getSkillGaps(
              USER_ID
            ),

            getLearningPath(
              USER_ID
            ),

          ]);


          console.log(
            "Dashboard profile:",
            profileData
          );


          console.log(
            "Dashboard skill gaps:",
            skillData
          );


          console.log(
            "Dashboard learning path:",
            pathData
          );


          setProfile(
            profileData
          );


          setSkills(
            skillData?.skill_gaps ||
            []
          );


          setPath(
            pathData
          );


        } catch (error) {

          console.error(
            "Dashboard error:",
            error
          );

        } finally {

          setLoading(false);

        }

      };


    loadDashboard();

  }, [
    USER_ID,
  ]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="loading">

        Loading your personalized
        dashboard...

      </div>

    );

  }


  // =========================================================
  // NO USER
  // =========================================================

  if (!user) {

    return null;

  }


  // =========================================================
  // MAIN DASHBOARD
  // =========================================================

  return (

    <div className="dashboard">


      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="page-header">

        <div>

          <p className="eyebrow">

            PERSONALIZED LEARNING

          </p>


          <h1>

            Welcome back

            {profile?.name
              ? `, ${profile.name}`
              : ""}

            👋

          </h1>


          <p>

            Your AI-powered learning journey
            is ready.

          </p>

        </div>

      </div>


      {/* =====================================================
          CURRENT GOAL
          ===================================================== */}

      <div className="goal-banner">

        <div>

          <span>

            YOUR CURRENT GOAL

          </span>


          <h2>

            {profile?.goal ||
              "Define your learning goal"}

          </h2>

        </div>


        <Target
          size={32}
        />

      </div>


      {/* =====================================================
          STATISTICS
          ===================================================== */}

      <div className="stats-grid">


        {/* LEARNING HOURS */}

        <StatCard
          title="Learning Hours"
          value={
            `${path?.total_hours || 0}h`
          }
          subtitle="Total estimated"
          icon={Clock3}
        />


        {/* AI INSIGHT */}

        <AIInsight />


        {/* COURSES */}

        <StatCard
          title="Courses"
          value={
            path?.total_courses ??
            path?.items?.length ??
            0
          }
          subtitle="In your roadmap"
          icon={BookOpen}
        />


        {/* =================================================
            PROGRESS

            THIS IS THE IMPORTANT FIX.

            OLD:

            path?.progress_percentage

            NEW:

            overallProgress
            ================================================= */}

        <StatCard
          title="Progress"
          value={
            progressLoading
              ? "..."
              : `${overallProgress}%`
          }
          subtitle={
            `${completedCourses} completed`
          }
          icon={TrendingUp}
        />


        {/* DURATION */}

        <StatCard
          title="Duration"
          value={
            `${path?.estimated_weeks || 0}w`
          }
          subtitle="At your weekly pace"
          icon={Target}
        />

      </div>
          <AdaptiveRecommendation
  userId={USER_ID}
  progress={userProgress}
  onContinue={() => {
    navigate("/learning-path");
  }}
/>

      {/* =====================================================
          SKILL GAP + NEXT ACTION
          ===================================================== */}

      <div className="dashboard-grid">


        {/* SKILL GAP */}

        <SkillGapChart
          skills={skills}
          progress={userProgress}
          pathItems={path?.items || []}
        />


        {/* NEXT ACTION */}

        <div className="next-action-card">


          <div className="section-header">

            <div>

              <h3>

                Next Action

              </h3>


              <p>

                Keep your momentum going

              </p>

            </div>


            <ArrowRight
              size={20}
            />

          </div>


          {path?.items &&
          path.items.length > 0 ? (

            (() => {

              /*
               * Find first course that
               * is not completed based
               * on DATABASE progress.
               */

              const nextItem =
                path.items.find(
                  (item) => {

                    const courseId =
                      item.course_id ??
                      item.courseId ??
                      item.course?.id;


                    const backendProgress =
                      item.progress_percentage ??
                      item.progress ??
                      0;


                    const progress =
                      getCourseProgress(
                        courseId,
                        backendProgress
                      );


                    return progress < 100;

                  }
                );


              if (!nextItem) {

                return (

                  <div className="completed-message">

                    🎉 You've completed your
                    current learning path!

                  </div>

                );

              }


              const courseId =
                nextItem.course_id ??
                nextItem.courseId ??
                nextItem.course?.id;


              const currentProgress =
                getCourseProgress(
                  courseId,
                  nextItem.progress_percentage ??
                  nextItem.progress ??
                  0
                );


              return (

                <div className="next-course">


                  {/* SKILL */}

                  {nextItem.skill_name && (

                    <span className="skill-tag">

                      {nextItem.skill_name}

                    </span>

                  )}


                  {/* COURSE */}

                  <h2>

                    {
                      nextItem.course_title ||
                      nextItem.title ||
                      nextItem.course?.title ||
                      "Recommended Course"
                    }

                  </h2>


                  {/* OBJECTIVE */}

                  <p>

                    {
                      nextItem.objective ||
                      nextItem.description ||
                      "Continue with this resource to make progress toward your learning goal."
                    }

                  </p>


                  {/* COURSE META */}

                  <div className="course-meta">


                    {nextItem.estimated_hours && (

                      <span>

                        {
                          nextItem.estimated_hours
                        }

                        {" "}

                        hours

                      </span>

                    )}


                    {nextItem.difficulty && (

                      <span>

                        {
                          nextItem.difficulty
                        }

                      </span>

                    )}


                    {/* CURRENT PROGRESS */}

                    <span>

                      {Math.round(
                        currentProgress
                      )}

                      %

                    </span>

                  </div>


                  {/* CONTINUE BUTTON */}

                  <button
  className="continue-learning-btn"
  onClick={() => {
    navigate("/learning-path");
  }}
>
  Continue Learning
  <ArrowRight size={16} />
</button>


                </div>

              );

            })()

          ) : (

            <div className="completed-message">

              No learning resources
              available yet.

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          LEARNING PATH
          ===================================================== */}

      <LearningPath
        path={path}
      />


      {/* =====================================================
          AI ASSISTANT
          ===================================================== */}

      <div className="assistant-section">

        <Chatbot
          userId={USER_ID}
        />

      </div>


    </div>

  );

}


export default Dashboard;