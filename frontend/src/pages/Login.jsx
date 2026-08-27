import {
  useEffect,
  useState
} from "react";
import "./Login.css";
import {
  GraduationCap,
  ArrowRight
} from "lucide-react";

import axios from "axios";

import {
  useUser
} from "../context/UserContext";

import {
  useNavigate
} from "react-router-dom";


function Login() {

  const [users, setUsers] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  const {
    loginUser
  } = useUser();


  const navigate =
    useNavigate();


  useEffect(() => {

    axios
      .get(
        "http://localhost:8000/api/users"
      )
      .then((response) => {

        setUsers(
          response.data
        );

        setLoading(false);

      })
      .catch((error) => {

        console.error(error);

        setLoading(false);

      });

  }, []);


  const handleContinue = () => {

    const selectedUser =
      users.find(
        user =>
          user.id ===
          Number(selectedId)
      );


    if (!selectedUser) {
      return;
    }


    loginUser(
      selectedUser
    );

    navigate("/");

  };


  return (

    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">

          <GraduationCap
            size={34}
          />

        </div>


        <h1>
          Welcome to LearnPath AI
        </h1>

        <p>
          Choose your learner profile
          to continue your personalized
          learning journey.
        </p>


        {loading ? (

          <div className="loading">
            Loading learners...
          </div>

        ) : (

          <>

            <select
              value={selectedId}
              onChange={(e) =>
                setSelectedId(
                  e.target.value
                )
              }
            >

              <option value="">
                Select learner
              </option>

              {users.map(
                (user) => (

                  <option
                    key={user.id}
                    value={user.id}
                  >

                    {user.name}
                    {" — "}
                    {user.email}

                  </option>

                )
              )}

            </select>


            <button
              className="continue-button"
              onClick={
                handleContinue
              }
              disabled={
                !selectedId
              }
            >

              Continue

              <ArrowRight
                size={18}
              />

            </button>

          </>

        )}

      </div>

    </div>

  );
}


export default Login;