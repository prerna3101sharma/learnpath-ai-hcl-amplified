import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";

import Profile from "./pages/Profile";

import SkillGaps from "./pages/SkillGaps";

import LearningPathPage from "./pages/LearningPathPage";

import Assistant from "./pages/Assistant";


function App() {

  return (

    <BrowserRouter>

      <div className="app">

        <Sidebar />

        <main className="main-content">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/skills"
              element={<SkillGaps />}
            />

            <Route
              path="/learning-path"
              element={
                <LearningPathPage />
              }
            />

            <Route
              path="/assistant"
              element={
                <Assistant />
              }
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>

  );
}

export default App;