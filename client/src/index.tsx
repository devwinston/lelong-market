import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthContextProvider } from "./contexts/authContext";
import { SocketContextProvider } from "./contexts/socketContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <AuthContextProvider>
    <SocketContextProvider>
      <App />
    </SocketContextProvider>
  </AuthContextProvider>
);
