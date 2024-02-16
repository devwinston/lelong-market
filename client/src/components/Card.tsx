import React, { FC } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ViewListingModel } from "../models/ListingModel";
import { getRelativeTime } from "../utilities/getRelativeTime";

interface Props {
  listing: ViewListingModel;
}

const Card: FC<Props> = ({ listing }) => {
  const navigate = useNavigate();

  return (
    <div
      className="card"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("card-username")) return;
        navigate(`/listing/${listing.pid}`, {
          state: listing,
        });
      }}
    >
      <div className="card-user">
        <div
          className="card-avatar"
          style={{
            backgroundImage: `url(${listing.avatar})`,
          }}
        ></div>
        <div className="card-group">
          <Link className="card-username" to={`/profile/${listing.uid}`}>
            {listing.username}
          </Link>
          <p className="card-updated">{getRelativeTime(listing.updated)}</p>
        </div>
      </div>
      <div
        className="card-image"
        style={{
          backgroundImage: `url(${listing.images[0]})`,
        }}
      >
        {listing.sold && <div className="card-sold">ITEM SOLD</div>}
      </div>
      <p className="card-title">{listing.title}</p>
      {listing.sold ? (
        <p className="card-price">
          <s>S$ {listing.price.toFixed(2)}</s> <strong>Sold</strong>
        </p>
      ) : (
        <p className="card-price">S$ {listing.price.toFixed(2)}</p>
      )}
    </div>
  );
};

export default Card;
