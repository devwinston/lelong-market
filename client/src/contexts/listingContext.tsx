import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from "react";
import { ViewListingModel } from "../models/ListingModel";

// context types

interface QueryType {
  search: string;
  price: string;
  category: string;
  sold: string;
}

interface StateType {
  start: number;
  page: number;
  query: QueryType;
  listings: ViewListingModel[] | null;
  setStart: Dispatch<SetStateAction<number>>;
  setPage: Dispatch<SetStateAction<number>>;
  setQuery: Dispatch<SetStateAction<QueryType>>;
  setListings: Dispatch<SetStateAction<ViewListingModel[] | null>>;
}

// create context

export const ListingContext = createContext<StateType>({
  start: 1,
  page: 1,
  query: {
    search: "",
    price: "",
    category: "",
    sold: "",
  },
  listings: null,
  setStart: () => {},
  setPage: () => {},
  setQuery: () => {},
  setListings: () => {},
});

// context provider

export const ListingContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [start, setStart] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [query, setQuery] = useState<QueryType>({
    search: "",
    price: "",
    category: "",
    sold: "",
  });
  const [listings, setListings] = useState<ViewListingModel[] | null>(null);

  return (
    <ListingContext.Provider
      value={{
        start,
        page,
        query,
        listings,
        setStart,
        setPage,
        setQuery,
        setListings,
      }}
    >
      {children}
    </ListingContext.Provider>
  );
};
