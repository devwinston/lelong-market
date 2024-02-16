import {
  createContext,
  useReducer,
  useEffect,
  Dispatch,
  ReactNode,
} from "react";

import { UserModel } from "../models/UserModel";

// +---------------+
// | Context Types |
// +---------------+

interface StateType {
  user: UserModel | null;
}

interface ActionType {
  type: string;
  payload?: UserModel;
}

const initialState: StateType = {
  user:
    localStorage.getItem("user") === null
      ? null
      : JSON.parse(localStorage.getItem("user")!),
};

// +----------------+
// | Create Context |
// +----------------+

export const AuthContext = createContext<{
  state: StateType;
  dispatch: Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

// +-----------------+
// | Context Reducer |
// +-----------------+

const authReducer = (state: StateType, action: ActionType): StateType => {
  switch (action.type) {
    case "SIGNIN":
      return { user: action.payload || null };

    case "SIGNOUT":
      return { user: null };

    default:
      return state;
  }
};

// +------------------+
// | Context Provider |
// +------------------+

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log("AuthContext state: ", state);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};
