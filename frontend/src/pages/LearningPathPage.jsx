import {
  useEffect,
  useState,
} from "react";

import {
  getLearningPath,
} from "../services/api";

import LearningPath from "../components/LearningPath";


const USER_ID = 1;


function LearningPathPage() {

  const [path, setPath] =
    useState(null);


  useEffect(() => {

    getLearningPath(
      USER_ID,
      10,
      15
    )
      .then(setPath)
      .catch(console.error);

  }, []);


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