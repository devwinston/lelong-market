import { useContext, useState } from "react";

import { AuthContext } from "../contexts/authContext";
import { ConversationModel, MessageModel } from "../models/MessageModel";

export const useGetConversations = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getConversations = async (): Promise<ConversationModel[] | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/messages`, {
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

  return { getConversations, loading, error };
};

export const useGetMessages = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getMessages = async ({
    pid,
    uid,
  }: {
    pid: string;
    uid: string;
  }): Promise<MessageModel[] | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/messages/${pid}/${uid}`, {
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

  return { getMessages, loading, error };
};

export const useSendMessage = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async ({
    pid,
    uid,
    text,
  }: {
    pid: string;
    uid: string;
    text: string;
  }): Promise<MessageModel | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/messages/${pid}/${uid}`, {
      method: "POST",
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
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

  return { sendMessage, loading, error };
};
