import React, { useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaStore, FaUser, FaSignInAlt, FaSignOutAlt } from "react-icons/fa";
import { MdSell } from "react-icons/md";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

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
          <button className="sell-button" onClick={() => navigate("/listing")}><MdSell />Sell</button>
        )}

        <div className="links">
          <NavLink to="/"><FaStore />Market</NavLink>
          {auth.user && <NavLink to={"/chat"}><IoChatbubbleEllipsesSharp />Chat</NavLink>}
          {auth.user && (
            <NavLink to={`/profile/${auth.user.uid}`}><FaUser />Profile</NavLink>
          )}
        </div>

        {!auth.user && (
          <button onClick={() => navigate("/register")}><FaSignInAlt />Register</button>
        )}
        {auth.user && <button onClick={signout}><FaSignOutAlt />Sign Out</button>}
      </div>
    </div>
  );
};

export default Nav;
