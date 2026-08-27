import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

import axios from "axios";


const UserContext =
  createContext(null);


export function UserProvider({
  children
}) {

  const [user, setUser] =
    useState(() => {

      const saved =
        localStorage.getItem(
          "learnpath_user"
        );

      return saved
        ? JSON.parse(saved)
        : null;

    });


  const loginUser = (selectedUser) => {

    setUser(selectedUser);

    localStorage.setItem(
      "learnpath_user",
      JSON.stringify(selectedUser)
    );

  };


  const logoutUser = () => {

    setUser(null);

    localStorage.removeItem(
      "learnpath_user"
    );

  };


  return (

    <UserContext.Provider
      value={{
        user,
        loginUser,
        logoutUser
      }}
    >

      {children}

    </UserContext.Provider>

  );

}


export function useUser() {

  return useContext(
    UserContext
  );

}