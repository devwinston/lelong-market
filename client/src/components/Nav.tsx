import React, { useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { AuthContext } from "../contexts/authContext";
import { useSignout } from "../hooks/useAuth";

import Logo from "../assets/logo.png";

const Nav = () => {
  const { state: auth } = useContext(AuthContext);
  const { signout } = useSignout();

  const navigate = useNavigate();

  return (
    <div className="nav">
      {/* <img src={Logo} alt="logo" className="logo" /> */}

      <div className="menu">
        {auth.user && (
          <button className="sell-button" onClick={() => navigate("/listing")}>
            Sell
          </button>
        )}

        <div className="links">
          <NavLink to="/">Market</NavLink>
          {auth.user && <NavLink to={"/chat"}>Chat</NavLink>}
          {auth.user && (
            <NavLink to={`/profile/${auth.user.uid}`}>Profile</NavLink>
          )}
        </div>

        {!auth.user && (
          <button onClick={() => navigate("/register")}>Register</button>
        )}
        {auth.user && <button onClick={signout}>Sign Out</button>}
      </div>
    </div>
  );
};

export default Nav;
