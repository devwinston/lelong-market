import React, { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "react-toastify";

import { useSignup, useSignin, useResetUser } from "../hooks/useAuth";

import Spinner from "../components/Spinner";

const Register = () => {
  const [register, setRegister] = useState(true);
  const [reset, setReset] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { username, email, password } = formData;
  const { signin, error: signinError, loading: signinLoading } = useSignin();
  const { signup, error: signupError, loading: signupLoading } = useSignup();
  const {
    resetUser,
    error: resetUserError,
    loading: resetUserLoading,
  } = useResetUser();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (register) await signup({ username, email, password });

    if (!register && !reset) await signin({ email, password });

    if (reset) {
      const user = await resetUser(email);

      if (user) toast.success("Reset email sent successfully");
      else toast.error("Unable to reset user");
    }

    setFormData({
      username: "",
      email: "",
      password: "",
    });
  };

  if (signupLoading || signinLoading || resetUserLoading) {
    return <Spinner />;
  }

  return (
    <div className="register">
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        {register && (
          <>
            <h2>Username</h2>
            <input
              type="text"
              id="username"
              value={username}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </>
        )}

        <h2>Email</h2>
        <input
          type="email"
          id="email"
          value={email}
          onChange={handleChange}
          autoComplete="off"
          required
        />

        {!reset && (
          <>
            <h2>Password</h2>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </>
        )}

        {register && (
          <>
            <button type="submit">Sign Up</button>
            <p className="form-text" onClick={() => setRegister(false)}>
              Sign In Instead
            </p>
          </>
        )}

        {!register && (
          <>
            {!reset && (
              <>
                <button type="submit">Sign In</button>
                <p className="form-text" onClick={() => setRegister(true)}>
                  Sign Up Instead
                </p>
                <p className="form-text" onClick={() => setReset(true)}>
                  Forgot Password
                </p>
              </>
            )}

            {reset && (
              <>
                <button type="submit">Reset Password</button>
                <p className="form-text" onClick={() => setReset(false)}>
                  Sign In Instead
                </p>
              </>
            )}
          </>
        )}
      </form>

      {signupError && (
        <p className="error-text">Sign Up Error: {signupError}</p>
      )}
      {signinError && (
        <p className="error-text">Sign In Error: {signinError}</p>
      )}
      {resetUserError && (
        <p className="error-text">Reset Error: {resetUserError}</p>
      )}
    </div>
  );
};

export default Register;
