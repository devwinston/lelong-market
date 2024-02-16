import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../contexts/authContext";
import { GetUserModel } from "../models/UserModel";

export const useSignin = () => {
  const { dispatch } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signin = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/users/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);
    } else {
      setLoading(false);
      setError("");

      // save token to local storage
      localStorage.setItem("user", JSON.stringify(json));

      // update auth context
      dispatch({ type: "SIGNIN", payload: json });

      navigate("/");
    }
  };

  return { signin, error, loading };
};

export const useSignup = () => {
  const { dispatch } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const signup = async ({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);
    } else {
      setLoading(false);
      setError("");

      // save token to local storage
      localStorage.setItem("user", JSON.stringify(json));

      // update auth context
      dispatch({ type: "SIGNIN", payload: json });

      navigate("/");
    }
  };

  return { signup, error, loading };
};

export const useSignout = () => {
  const { dispatch } = useContext(AuthContext);

  const navigate = useNavigate();

  const signout = () => {
    // remove token from local storage
    localStorage.removeItem("user");

    // update auth context
    dispatch({ type: "SIGNOUT" });

    navigate("/");
  };

  return { signout };
};

export const useGetUser = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getUser = async (uid: string): Promise<GetUserModel | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/users/${uid}`, {
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return null;
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { getUser, error, loading };
};

export const useUpdateUser = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateUser = async ({
    uid,
    password,
    avatar,
  }: {
    uid: string;
    password: string;
    avatar: string;
  }): Promise<GetUserModel | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/users/${uid}`, {
      method: "PATCH",
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        avatar,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return null;
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { updateUser, error, loading };
};

export const useResetUser = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetUser = async (email: string): Promise<GetUserModel | null> => {
    setLoading(true);
    setError("");

    console.log(email);

    const response = await fetch(`/api/users/reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return null;
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { resetUser, error, loading };
};
