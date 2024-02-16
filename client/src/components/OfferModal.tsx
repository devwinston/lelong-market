import React, { FC, FormEvent, useState } from "react";
import { FaWindowClose } from "react-icons/fa";
import { RiAuctionFill } from "react-icons/ri";

import { useOfferListing } from "../hooks/useListing";
import { toast } from "react-toastify";

import Spinner from "./Spinner";

interface Props {
  pid: string;
  setShowModal: (show: boolean) => void;
}

const OfferModal: FC<Props> = ({ pid, setShowModal }) => {
  const [offer, setOffer] = useState(0);
  const { offerListing, loading, error } = useOfferListing();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setOffer(isNaN(value) ? 0 : value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const listing = await offerListing({
      pid,
      offer,
    });

    if (listing) {
      setOffer(0);
      setShowModal(false);
      toast.success("Listing offered successfully");
    } else {
      toast.error("Unable to offer listing");
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="modal">
      <div className="close-container">
        <FaWindowClose
          className="close-icon"
          size={25}
          onClick={() => setShowModal(false)}
        />
      </div>

      <form onSubmit={handleSubmit}>
        <h2>Offer (S$)</h2>
        <input
          type="number"
          id="offer"
          value={offer}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          autoComplete="off"
          required
        />

        <button className="offer-button" type="submit">
          <RiAuctionFill size={25} /> Make An Offer
        </button>
      </form>

      {error && <p className="error-text">Offer Error: {error}</p>}
    </div>
  );
};

export default OfferModal;
