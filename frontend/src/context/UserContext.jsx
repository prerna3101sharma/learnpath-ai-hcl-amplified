import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {

  const [user, setUserState] = useState(() => {

    const savedUser =
      localStorage.getItem(
        "learnpath_user"
      );

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }

  });


  const setUser = (newUser) => {

    setUserState(newUser);

    if (newUser) {

      localStorage.setItem(
        "learnpath_user",
        JSON.stringify(newUser)
      );

    } else {

      localStorage.removeItem(
        "learnpath_user"
      );

    }

  };


  const logout = () => {

    setUserState(null);

    localStorage.removeItem(
      "learnpath_user"
    );

  };


  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}


export function useUser() {

  const context =
    useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used inside UserProvider"
    );
  }

  return context;
}