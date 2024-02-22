import React, { FC, FormEvent, useState } from "react";
import { FaWindowClose, FaKey } from "react-icons/fa";

import { useUpdateUser } from "../hooks/useAuth";
import { toast } from "react-toastify";

import Spinner from "./Spinner";

interface Props {
  uid: string;
  setShowModal: (show: boolean) => void;
}

const PasswordModal: FC<Props> = ({ uid, setShowModal }) => {
  const [password, setPassword] = useState("");
  const { updateUser, loading, error } = useUpdateUser();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const user = await updateUser({
      uid,
      password,
      avatar: "",
    });

    if (user) {
      setPassword("");
      setShowModal(false);
      toast.success("Password updated successfully");
    } else {
      toast.error("Unable to update password");
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="modal">
      <div className="close-container">
        <FaWindowClose
          className="close-icon"
          size={25}
          onClick={() => setShowModal(false)}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <h2>New Password</h2>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
          required
        />

        <button type="submit">
          <FaKey size={25} /> Change Password
        </button>
      </form>

      {error && <p className="error-text">Password Error: {error}</p>}
    </div>
  );
};

export default PasswordModal;
