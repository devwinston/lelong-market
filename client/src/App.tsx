import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";

import Nav from "./components/Nav";
import Market from "./pages/Market";
import Register from "./pages/Register";
import AddListing from "./pages/AddListing";
import Listing from "./pages/Listing";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import { AuthContext } from "./contexts/authContext";

const App = () => {
  const { state: auth } = useContext(AuthContext);

  return (
    <div className="app">
      <Router>
        <Nav />
        <div className="page">
          <Routes>
            <Route path="/" element={<Market />} />
            <Route
              path="/listing"
              element={auth.user ? <AddListing /> : <Navigate to="/register" />}
            />
            <Route
              path="/listing/:pid"
              element={auth.user ? <Listing /> : <Navigate to="/register" />}
            />
            <Route
              path="/chat"
              element={auth.user ? <Chat /> : <Navigate to="/register" />}
            />
            <Route
              path="/profile/:uid"
              element={auth.user ? <Profile /> : <Navigate to="/register" />}
            />
            <Route
              path="/register"
              element={!auth.user ? <Register /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </Router>

      <ToastContainer autoClose={2000} />
    </div>
  );
};

export default App;
