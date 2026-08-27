import {
  useEffect,
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
  getProfile,
  getSkillGaps,
  getLearningPath,
} from "../services/api";

import StatCard from "../components/StatCard";

import SkillGapChart from "../components/SkillGapChart";

import LearningPath from "../components/LearningPath";

import Chatbot from "../components/Chatbot";


const USER_ID = 1;


function Dashboard() {

  const [profile, setProfile] =
    useState(null);

  const [skills, setSkills] =
    useState([]);

  const [path, setPath] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    loadDashboard();

  }, []);


  const loadDashboard =
    async () => {

      try {

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


        setProfile(
          profileData
        );


        setSkills(
          skillData.skill_gaps ||
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


  if (loading) {

    return (
      <div className="loading">
        Loading your personalized dashboard...
      </div>
    );

  }


  return (

    <div className="dashboard">

      <div className="page-header">

        <div>

          <p className="eyebrow">
            PERSONALIZED LEARNING
          </p>

          <h1>
            Welcome back
            {profile?.name
              ? `, ${profile.name}`
              : ""} 👋
          </h1>

          <p>
            Your AI-powered learning journey
            is ready.
          </p>

        </div>

      </div>


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


      <div className="stats-grid">

        <StatCard
          title="Learning Hours"
          value={`${path?.total_hours || 0}h`}
          subtitle="Total estimated"
          icon={Clock3}
        />


        <StatCard
          title="Courses"
          value={
            path?.total_courses || 0
          }
          subtitle="In your roadmap"
          icon={BookOpen}
        />


        <StatCard
          title="Progress"
          value={`${path?.progress_percentage || 0}%`}
          subtitle="Completed"
          icon={TrendingUp}
        />


        <StatCard
          title="Duration"
          value={`${path?.estimated_weeks || 0}w`}
          subtitle="At your weekly pace"
          icon={Target}
        />

      </div>


      <div className="dashboard-grid">

        <SkillGapChart
          skills={skills}
        />


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


          {path?.items?.find(
            (item) =>
              item.status !==
              "Completed"
          ) ? (

            <div className="next-course">

              {(() => {

                const item =
                  path.items.find(
                    (item) =>
                      item.status !==
                      "Completed"
                  );

                return (

                  <>

                    <span className="skill-tag">
                      {item.skill_name}
                    </span>

                    <h2>
                      {item.course_title}
                    </h2>

                    <p>
                      {item.objective}
                    </p>

                    <div className="course-meta">

                      <span>
                        {item.estimated_hours}
                        {" "}hours
                      </span>

                      <span>
                        {item.difficulty}
                      </span>

                    </div>

                  </>

                );

              })()}

            </div>

          ) : (

            <div className="completed-message">

              🎉 You've completed your
              current learning path!

            </div>

          )}

        </div>

      </div>


      <LearningPath
        path={path}
      />


      <div className="assistant-section">

        <Chatbot
          userId={USER_ID}
        />

      </div>

    </div>

  );
}

export default Dashboard;