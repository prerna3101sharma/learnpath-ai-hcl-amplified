import {
  useEffect,
  useState,
} from "react";

import {
  getSkillGaps,
} from "../services/api";

import SkillGapChart from "../components/SkillGapChart";

import {
  useUser,
} from "../context/UserContext";


function SkillGaps() {

  const [data, setData] =
    useState(null);
  const {
    user
  } = useUser();

  const USER_ID = user?.id;


    useEffect(() => {

    if (!USER_ID) {
      return;
    }

    getSkillGaps(USER_ID)
      .then(setData)
      .catch(console.error);

  }, [USER_ID]);
  if (!user) {

    return (
      <div className="loading">
        Please select a learner first...
      </div>
    );

  }

  if (!data) {

    return (
      <div className="loading">
        Analyzing your skill gaps...
      </div>
    );

  }


  return (

    <div className="page">

      <div className="page-header">

        <p className="eyebrow">
          SKILL ANALYSIS
        </p>

        <h1>
          Your Skill Gaps
        </h1>

        <p>
          Understand where you are and
          where you need to be.
        </p>

      </div>


      <SkillGapChart
        skills={
          data.skill_gaps || []
        }
      />


      <div className="skill-list">

        {(
          data.skill_gaps || []
        ).map((skill) => (

          <div
            className="skill-row"
            key={
              skill.skill_name
            }
          >

            <div>

              <strong>
                {skill.skill_name}
              </strong>

              <span>
                Current:{" "}
                {skill.current_level}
                {" "} / Required:{" "}
                {skill.required_level}
              </span>

            </div>


            <div className="gap-badge">

              Gap:{" "}
              {skill.gap}

            </div>

          </div>

        ))}

      </div>

    </div>

  );
}

export default SkillGaps;