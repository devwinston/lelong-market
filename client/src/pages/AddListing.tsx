import React, { ChangeEvent, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdSell } from "react-icons/md";

import { useAddListing } from "../hooks/useListing";
import { checkFiles } from "../utilities/checkFiles";
import { AddListingModel } from "../models/ListingModel";

import Spinner from "../components/Spinner";
import { toast } from "react-toastify";

const AddListing = () => {
  const [formData, setFormData] = useState<AddListingModel>({
    title: "",
    description: "",
    price: 0,
    category: "",
    imageFiles: null,
  });
  const { title, description, price, category, imageFiles } = formData;
  const { addListing, loading, error } = useAddListing();

  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    if (e.target.type === "file") {
      const files = (e.target as HTMLInputElement).files;

      if (!files) return;

      if (!checkFiles(files, 4, 0.5)) {
        window.alert("Images Error: Maximum 4 files 0.5 MB each");

        return;
      }

      setFormData((prev) => ({
        ...prev,
        imageFiles: files,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [e.target.id]: e.target.value,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!imageFiles) return;

    if (!checkFiles(imageFiles, 4, 0.5)) {
      window.alert("Images Error: Maximum 4 files 0.5 MB each");

      return;
    }

    const listing = await addListing(formData);

    setFormData({
      title: "",
      description: "",
      price: 0,
      category: "",
      imageFiles: null,
    });

    if (listing) {
      toast.success("Listing added successfully");
      navigate(`/listing/${listing.pid}`, { state: listing });
    } else {
      toast.error("Unable to add listing");
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="add-listing">
      <h1><MdSell />Add Listing</h1>

      <form onSubmit={handleSubmit}>
        <h2>Title</h2>
        <input
          type="text"
          id="title"
          value={title}
          onChange={handleChange}
          autoComplete="off"
          required
        />

        <h2>Description</h2>
        <textarea
          id="description"
          value={description}
          onChange={handleChange}
          autoComplete="off"
          required
        />

        <h2>Price</h2>
        <input
          type="number"
          id="price"
          value={price}
          onChange={handleChange}
          min="0.01"
          step="0.01"
          autoComplete="off"
          required
        />

        <h2>Category</h2>
        <select
          id="category"
          value={category}
          onChange={handleChange}
          autoComplete="off"
          required
        >
          <option value="">Select category</option>
          <option value="Beauty">Beauty</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Property">Property</option>
        </select>

        <h2>Images</h2>
        <input
          type="file"
          id="imageFiles"
          onChange={handleChange}
          max="4"
          accept=".jpg,.png,.jpeg"
          multiple
          required
        />

        <button type="submit"><MdSell />Add Listing</button>
      </form>

      {error && <p className="error-text">Add Listing Error: {error}</p>}
    </div>
  );
};

export default AddListing;
