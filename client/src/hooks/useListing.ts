import { useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { AuthContext } from "../contexts/authContext";
import { storage } from "../config/firebase.config";
import { storeImage } from "../utilities/storeImage";
import {
  AddListingModel,
  ViewListingModel,
  UpdateListingModel,
} from "../models/ListingModel";

// +--------------+
// | Get Listings |
// +--------------+

export const useGetListings = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getListings = async ({
    search,
    price,
    category,
    sold,
    page,
    pages,
    size,
  }: {
    search: string;
    price: string;
    category: string;
    sold: string;
    page: number;
    pages: number;
    size: number;
  }): Promise<ViewListingModel[]> => {
    setLoading(true);
    setError("");

    const response = await fetch(
      `/api/listings?search=${search}&price=${price}&category=${category}&sold=${sold}&page=${page}&pages=${pages}&size=${size}`
    );

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return [];
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { getListings, loading, error };
};

// +-------------------+
// | Get User Listings |
// +-------------------+

export const useGetUserListings = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserListings = async (uid: string): Promise<ViewListingModel[]> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return [];
    }

    const response = await fetch(`/api/listings/${uid}`, {
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return [];
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { getUserListings, loading, error };
};

// +-------------+
// | Add Listing |
// +-------------+

export const useAddListing = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const addListing = async (
    listing: AddListingModel
  ): Promise<ViewListingModel | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const pid = uuidv4();

    let imageUrls: string[] = [];
    try {
      const imageFilesArray = Array.from(listing.imageFiles!);
      imageUrls = await Promise.all(
        imageFilesArray.map((imageFile, index) =>
          storeImage(storage, pid, imageFile, index)
        )
      );
    } catch (error) {
      setLoading(false);
      setError("Unable to upload images");

      return null;
    }

    let images = Array(4).fill("none");
    imageUrls.forEach((value, index) => (images[index] = value));

    const response = await fetch(`/api/listings`, {
      method: "POST",
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pid,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return null;
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { addListing, loading, error };
};

// +----------------+
// | Update Listing |
// +----------------+

export const useUpdateListing = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateListing = async (
    listing: UpdateListingModel
  ): Promise<ViewListingModel | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/listings/${listing.pid}`, {
      method: "PATCH",
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images: listing.images,
        offers: listing.offers,
        sold: listing.sold,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return null;
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { updateListing, loading, error };
};

// +----------------+
// | Offer Listing |
// +----------------+

export const useOfferListing = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const offerListing = async ({
    pid,
    offer,
  }: {
    pid: string;
    offer: number;
  }): Promise<ViewListingModel | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/listings/${pid}/offer`, {
      method: "PATCH",
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offer,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return null;
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { offerListing, loading, error };
};

// +----------------+
// | Delete Listing |
// +----------------+

export const useDeleteListing = () => {
  const { state: auth } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const deleteListing = async (
    pid: string
  ): Promise<ViewListingModel | null> => {
    setLoading(true);
    setError("");

    if (!auth.user) {
      setLoading(false);
      setError("Not authorised");

      return null;
    }

    const response = await fetch(`/api/listings/${pid}`, {
      method: "DELETE",
      headers: {
        authorisation: `Bearer ${auth.user.token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await response.json();

    if (!response.ok) {
      setLoading(false);
      setError(json.error);

      return null;
    } else {
      setLoading(false);
      setError("");

      return json;
    }
  };

  return { deleteListing, loading, error };
};
