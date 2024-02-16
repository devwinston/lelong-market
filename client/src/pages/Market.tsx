import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useGetListings } from "../hooks/useListing";
import { ViewListingModel } from "../models/ListingModel";

import Spinner from "../components/Spinner";
import Card from "../components/Card";

const Market = () => {
  const [listings, setListings] = useState<ViewListingModel[]>([]);
  const { getListings, loading, error } = useGetListings();

  const navigate = useNavigate();

  useEffect(() => {
    setListings([]);

    const getAllListings = async () => {
      const listings = await getListings();
      setListings(listings);
    };

    getAllListings();
  }, [navigate]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="market">
      <h1>Market</h1>

      {listings.length > 0 ? (
        <div className="card-grid">
          {listings.map((listing) => (
            <Card key={listing.pid} listing={listing} />
          ))}
        </div>
      ) : (
        !loading && <p>No listings available</p>
      )}

      {error && <p className="error-text">Listings Error: {error}</p>}
    </div>
  );
};

export default Market;
