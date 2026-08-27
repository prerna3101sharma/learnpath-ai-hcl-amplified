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

import {
  useUser,
} from "../context/UserContext";


function Profile() {

  const [profile, setProfile] =
    useState(null);

  const {
    user
  } = useUser();

  const USER_ID = user?.id;


  useEffect(() => {

    if (!USER_ID) {
      return;
    }

    getProfile(USER_ID)
      .then(setProfile)
      .catch(console.error);

  }, [USER_ID]);


  if (!user) {

    return (
      <div className="loading">
        Please select a learner first...
      </div>
    );

  }


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
            {profile.name || "Learner"}
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