import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  useUser
} from "./context/UserContext";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import SkillGaps from "./pages/SkillGaps";
import LearningPathPage from "./pages/LearningPathPage";
import Assistant from "./pages/Assistant";


function ProtectedLayout({
  children
}) {

  const { user } = useUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (

    <div className="app-layout">

      <Sidebar />

      <main className="main-content">
        {children}
      </main>

    </div>

  );
}


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />


        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />


        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          }
        />


        <Route
          path="/skill-gaps"
          element={
            <ProtectedLayout>
              <SkillGaps />
            </ProtectedLayout>
          }
        />


        <Route
          path="/learning-path"
          element={
            <ProtectedLayout>
              <LearningPathPage />
            </ProtectedLayout>
          }
        />


        <Route
          path="/assistant"
          element={
            <ProtectedLayout>
              <Assistant />
            </ProtectedLayout>
          }
        />


        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}


export default App;