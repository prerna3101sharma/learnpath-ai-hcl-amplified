import {
  useEffect,
  useState,
} from "react";

import {
  getLearningPath,
} from "../services/api";

import LearningPath from "../components/LearningPath";

import {
  useUser,
} from "../context/UserContext";


function LearningPathPage() {

  const [path, setPath] =
    useState(null);

  const {
    user
  } = useUser();

  const USER_ID = user?.id;


  useEffect(() => {

    if (!USER_ID) {
      return;
    }

    getLearningPath(
      USER_ID,
      10,
      15
    )
      .then(setPath)
      .catch(console.error);

  }, []);
  
  if (!user) {

    return (
      <div className="loading">
        Please select a learner first...
      </div>
    );

  }

  if (!path) {

    return (
      <div className="loading">
        Generating your personalized
        learning path...
      </div>
    );

  }


  return (

    <div className="page">

      <div className="page-header">

        <p className="eyebrow">
          PERSONALIZED ROADMAP
        </p>

        <h1>
          Your Learning Path
        </h1>

        <p>
          A structured roadmap generated
          from your goals and skill gaps.
        </p>

      </div>


      <LearningPath
        path={path}
      />

    </div>

  );
}

export default LearningPathPage;