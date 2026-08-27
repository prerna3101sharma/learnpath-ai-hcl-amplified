import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  UserRoundPlus,
  ArrowRight,
  Sparkles,
  Mail,
  User,
  Target,
  BookOpen,
  X,
} from "lucide-react";

import { useUser } from "../context/UserContext";
import { getUsers, createUser } from "../services/api";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const { user, setUser } = useUser();

  const [learners, setLearners] = useState([]);

  const [selectedUserId, setSelectedUserId] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    goal: "",
    experience_level: "Beginner",
  });

  // --------------------------------------------------
  // Load learners
  // --------------------------------------------------

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      const users = Array.isArray(data)
        ? data
        : data?.users || [];

      setLearners(users);

      // If there is already a selected user,
      // keep it selected.
      if (user?.id) {
        setSelectedUserId(String(user.id));
      }

    } catch (err) {
      console.error("Failed to load learners:", err);

      setError(
        "Unable to load learners. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Select existing learner
  // --------------------------------------------------

  const handleContinue = () => {
    if (!selectedUserId) {
      setError("Please select a learner first.");
      return;
    }

    const selectedLearner = learners.find(
      (learner) =>
        String(learner.id) === String(selectedUserId)
    );

    if (!selectedLearner) {
      setError("Selected learner could not be found.");
      return;
    }

    setUser(selectedLearner);

    localStorage.setItem(
      "learnpath_user",
      JSON.stringify(selectedLearner)
    );

    navigate("/");
  };

  // --------------------------------------------------
  // Form change
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // Create new learner
  // --------------------------------------------------

  const handleCreateLearner = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Please enter learner name.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter email address.");
      return;
    }

    if (!formData.goal.trim()) {
      setError("Please enter your learning goal.");
      return;
    }

    try {
      setCreating(true);

      const response = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        goal: formData.goal.trim(),
        experience_level: formData.experience_level,
      });

      const newLearner =
        response?.user ||
        response?.data ||
        response;

      if (!newLearner?.id) {
        throw new Error(
          "Learner was created but no learner ID was returned."
        );
      }

      // Add new learner to local list
      setLearners((previous) => [
        ...previous,
        newLearner,
      ]);

      // Select newly created learner
      setSelectedUserId(String(newLearner.id));

      // Save active user
      setUser(newLearner);

      localStorage.setItem(
        "learnpath_user",
        JSON.stringify(newLearner)
      );

      // Close form
      setShowCreateForm(false);

      // Reset form
      setFormData({
        name: "",
        email: "",
        goal: "",
        experience_level: "Beginner",
      });

      // Go to dashboard
      navigate("/");

    } catch (err) {
      console.error(
        "Create learner error:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to create learner.";

      setError(message);

    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decoration */}

      <div className="login-background">
        <div className="login-orb login-orb-one"></div>
        <div className="login-orb login-orb-two"></div>
      </div>

      <main className="login-container">

        {/* Logo */}

        <div className="login-brand">
          <div className="login-brand-icon">
            <GraduationCap size={27} />
          </div>

          <div>
            <div className="login-brand-name">
              LearnPath
            </div>

            <div className="login-brand-ai">
              AI
            </div>
          </div>
        </div>

        {/* Main card */}

        <section className="login-card">

          <div className="login-icon">
            <Sparkles size={25} />
          </div>

          <p className="login-eyebrow">
            PERSONALIZED LEARNING
          </p>

          <h1>
            Welcome to LearnPath AI
          </h1>

          <p className="login-description">
            Choose your learner profile to continue
            your personalized learning journey.
          </p>

          {/* Error */}

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {!showCreateForm ? (
            <>
              {/* Existing learner */}

              <div className="login-field">

                <label htmlFor="learner">
                  Existing Learner
                </label>

                <div className="select-wrapper">

                  <User
                    size={18}
                    className="select-icon"
                  />

                  <select
                    id="learner"
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(
                        e.target.value
                      );
                      setError("");
                    }}
                    disabled={loading}
                  >

                    <option value="">
                      {loading
                        ? "Loading learners..."
                        : "Select learner"}
                    </option>

                    {learners.map((learner) => (
                      <option
                        key={learner.id}
                        value={learner.id}
                      >
                        {learner.name}
                        {learner.email
                          ? ` — ${learner.email}`
                          : ""}
                      </option>
                    ))}

                  </select>

                </div>

              </div>

              {/* Continue */}

              <button
                type="button"
                className="login-primary-button"
                onClick={handleContinue}
                disabled={
                  !selectedUserId ||
                  loading
                }
              >

                <span>
                  Continue
                </span>

                <ArrowRight size={18} />

              </button>

              {/* Divider */}

              <div className="login-divider">
                <span></span>
                <p>OR</p>
                <span></span>
              </div>

              {/* Create new learner */}

              <button
                type="button"
                className="create-learner-button"
                onClick={() => {
                  setShowCreateForm(true);
                  setError("");
                }}
              >

                <UserRoundPlus size={19} />

                <span>
                  Create New Learner
                </span>

              </button>

            </>
          ) : (

            /* ---------------------------------------
               CREATE LEARNER FORM
            --------------------------------------- */

            <form
              className="create-learner-form"
              onSubmit={handleCreateLearner}
            >

              <div className="form-header">

                <div>
                  <h2>
                    Create your learner profile
                  </h2>

                  <p>
                    Tell us a little about yourself.
                  </p>
                </div>

                <button
                  type="button"
                  className="close-form-button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setError("");
                  }}
                >
                  <X size={19} />
                </button>

              </div>

              {/* Name */}

              <div className="form-field">

                <label>
                  Your Name
                </label>

                <div className="input-wrapper">

                  <User size={18} />

                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Prerna Sharma"
                    value={formData.name}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Email */}

              <div className="form-field">

                <label>
                  Email Address
                </label>

                <div className="input-wrapper">

                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Goal */}

              <div className="form-field">

                <label>
                  Learning Goal
                </label>

                <div className="input-wrapper">

                  <Target size={18} />

                  <input
                    type="text"
                    name="goal"
                    placeholder="e.g. Become an AI/ML Engineer"
                    value={formData.goal}
                    onChange={handleChange}
                  />

                </div>

              </div>

              {/* Experience */}

              <div className="form-field">

                <label>
                  Experience Level
                </label>

                <div className="input-wrapper">

                  <BookOpen size={18} />

                  <select
                    name="experience_level"
                    value={
                      formData.experience_level
                    }
                    onChange={handleChange}
                  >

                    <option value="Beginner">
                      Beginner
                    </option>

                    <option value="Intermediate">
                      Intermediate
                    </option>

                    <option value="Advanced">
                      Advanced
                    </option>

                  </select>

                </div>

              </div>

              {/* Submit */}

              <button
                type="submit"
                className="login-primary-button"
                disabled={creating}
              >

                {creating ? (
                  <>
                    <span className="button-spinner"></span>
                    Creating profile...
                  </>
                ) : (
                  <>
                    <span>
                      Create Learner
                    </span>

                    <ArrowRight size={18} />
                  </>
                )}

              </button>

              <button
                type="button"
                className="back-to-learners"
                onClick={() => {
                  setShowCreateForm(false);
                  setError("");
                }}
              >
                ← Back to existing learners
              </button>

            </form>

          )}

        </section>

        {/* Footer */}

        <div className="login-footer">

          <span>
            AI-Powered
          </span>

          <span className="footer-dot">
            •
          </span>

          <span>
            Personalized Learning
          </span>

        </div>

      </main>

    </div>
  );
}

export default Login;