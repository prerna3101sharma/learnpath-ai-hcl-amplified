import {
  useEffect,
  useState,
} from "react";

import {
  User,
  Target,
  Award,
} from "lucide-react";

import {
  getProfile,
} from "../services/api";


const USER_ID = 1;


function Profile() {

  const [profile, setProfile] =
    useState(null);


  useEffect(() => {

    getProfile(USER_ID)
      .then(setProfile)
      .catch(console.error);

  }, []);


  if (!profile) {

    return (
      <div className="loading">
        Loading profile...
      </div>
    );

  }


  return (

    <div className="page">

      <div className="page-header">

        <p className="eyebrow">
          LEARNER PROFILE
        </p>

        <h1>
          My Profile
        </h1>

        <p>
          Your learning preferences and objectives.
        </p>

      </div>


      <div className="profile-grid">

        <div className="profile-card">

          <div className="profile-icon">
            <User />
          </div>

          <h2>
            {profile.name ||
              "Learner"}
          </h2>

          <p>
            {profile.email ||
              "Learning enthusiast"}
          </p>

        </div>


        <div className="profile-details">

          <div className="detail-card">

            <Target />

            <div>

              <span>
                Career Goal
              </span>

              <strong>
                {profile.goal ||
                  "Not specified"}
              </strong>

            </div>

          </div>


          <div className="detail-card">

            <Award />

            <div>

              <span>
                Experience Level
              </span>

              <strong>
                {profile.experience_level ||
                  "Not specified"}
              </strong>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Profile;