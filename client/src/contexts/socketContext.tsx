import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import io, { Socket } from "socket.io-client";

import { AuthContext } from "./authContext";

// context types

interface StateType {
  socket: Socket | null;
  online: string[];
}

// create context

export const SocketContext = createContext<StateType>({
  socket: null,
  online: [],
});

// context provider

export const SocketContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { state: auth } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [online, setOnline] = useState<string[]>([]);

  useEffect(() => {
    if (auth.user) {
      const socket = io(``, {
        query: {
          uid: auth.user.uid,
        },
      });

      setSocket(socket);

      // socket.on() listens to events on server AND client
      socket.on("getOnline", (users) => setOnline(users));

      return () => {
        socket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [auth.user]);

  return (
    <SocketContext.Provider value={{ socket, online }}>
      {children}
    </SocketContext.Provider>
  );
};
