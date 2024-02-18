import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AuthContextProvider } from "./contexts/authContext";
import { SocketContextProvider } from "./contexts/socketContext";
import { ListingContextProvider } from "./contexts/listingContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <AuthContextProvider>
    <SocketContextProvider>
      <ListingContextProvider>
        <App />
      </ListingContextProvider>
    </SocketContextProvider>
  </AuthContextProvider>
);
