import { useContext, useState } from "react";

import { AuthContext } from "../contexts/authContext";
import { ViewNotificationModel } from "../models/NotificationModel";

export const useGetUserNotifications = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserNotifications = async (
    uid: string
  ): Promise<ViewNotificationModel[]> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return [];
    }

    const response = await fetch(`/api/notifications/${uid}`, {
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return [];
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { getUserNotifications, loading, error };
};

export const useReadUserNotifications = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const readUserNotifications = async (
    uid: string
  ): Promise<ViewNotificationModel[]> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return [];
    }

    const response = await fetch(`/api/notifications/${uid}`, {
      method: "PATCH",
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return [];
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { readUserNotifications, loading, error };
};
