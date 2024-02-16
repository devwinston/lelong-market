import React, { ChangeEvent, MouseEvent, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ref, deleteObject, listAll } from "firebase/storage";
import { toast } from "react-toastify";
import { FaArrowCircleLeft, FaEdit, FaCamera } from "react-icons/fa";
import { MdDeleteForever, MdSell } from "react-icons/md";
import { RiAuctionFill } from "react-icons/ri";
import { IoChatbubbleEllipsesSharp } from "react-icons/io5";

import { storage } from "../config/firebase.config";
import { AuthContext } from "../contexts/authContext";
import { useUpdateListing, useDeleteListing } from "../hooks/useListing";
import { ViewListingModel } from "../models/ListingModel";
import { checkFiles } from "../utilities/checkFiles";
import { storeImage } from "../utilities/storeImage";
import { formatTimestamp } from "../utilities/formatTimestamp";

import Spinner from "../components/Spinner";
import OfferModal from "../components/OfferModal";

const Listing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: auth } = useContext(AuthContext);

  const [listing, setListing] = useState(location.state as ViewListingModel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageIndex, setImageIndex] = useState(0);

  const [edit, setEdit] = useState(false);
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    category: listing.category,
  });
  const { title, description, price, category } = formData;
  const [showModal, setShowModal] = useState(false);

  const {
    updateListing,
    loading: updateListingLoading,
    error: updateListingError,
  } = useUpdateListing();
  const {
    deleteListing,
    loading: deleteListingLoading,
    error: deleteListingError,
  } = useDeleteListing();

  const handleUploadImage = async (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ): Promise<void> => {
    const files = (e.target as HTMLInputElement).files;

    if (!files) return;

    if (!checkFiles(files, 1, 0.5)) {
      window.alert("Maximum 1 file 0.5 MB each");

      return;
    }

    try {
      setLoading(true);
      setError("");

      // store image for firebase

      const imageFile = files[0];

      const imageUrl = await storeImage(storage, listing.pid, imageFile, index);

      // update images for postgres

      const updatedImages = listing.images;

      updatedImages[index] = imageUrl;

      const updatedListing = await updateListing({
        pid: listing.pid,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images: updatedImages,
        offers: listing.offers,
        sold: listing.sold,
      });

      if (updatedListing) {
        setListing(updatedListing);

        setLoading(false);
        setError("");
        toast.success("Listing updated successfully");
      } else {
        setLoading(false);
        setError(updateListingError);
        toast.error(updateListingError);
      }
    } catch (error) {
      setLoading(false);
      setError(
        error instanceof Error ? error.message : "Unable to upload image"
      );
      toast.error(
        error instanceof Error ? error.message : "Unable to upload image"
      );
    }
  };

  const handleDeleteImage = async (
    e: MouseEvent<HTMLLabelElement>,
    index: number
  ) => {
    const imageCount = listing.images.reduce(
      (acc: number, cur: string) => acc + (cur !== "none" ? 1 : 0),
      0
    );

    if (imageCount === 1) {
      setLoading(false);
      setError("At least 1 image required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // delete image for firebase

      const storageRef = ref(storage, `listings/${listing.pid}/image${index}`);

      await deleteObject(storageRef);

      // update images for postgres

      const updatedImages = listing.images;
      updatedImages[index] = "none";

      const updatedListing = await updateListing({
        pid: listing.pid,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images: updatedImages,
        offers: listing.offers,
        sold: listing.sold,
      });

      if (updatedListing) {
        setListing(updatedListing);

        setLoading(false);
        setError("");
        toast.success("Listing updated successfully");
      } else {
        setLoading(false);
        setError(updateListingError);
        toast.error(updateListingError);
      }
    } catch (error) {
      setLoading(false);
      setError(
        error instanceof Error ? error.message : "Unable to delete image"
      );
      toast.error(
        error instanceof Error ? error.message : "Unable to delete image"
      );
    }
  };

  const handleUpdateListing = async (
    e: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    const updatedListing = await updateListing({
      pid: listing.pid,
      title,
      description,
      price,
      category,
      images: listing.images,
      offers: listing.offers,
      sold: listing.sold,
    });

    if (updatedListing) {
      setListing(updatedListing);
      setEdit(false);
      toast.success("Listing updated successfully");
    } else {
      toast.error(updateListingError);
    }
  };

  const handleDeleteListing = async () => {
    if (!window.confirm("Confirm delete?")) return;

    try {
      setLoading(true);
      setError("");

      // delete listing images for firebase

      const storageRef = ref(storage, `listings/${listing.pid}`);
      const itemRefs = await listAll(storageRef);

      await Promise.all(itemRefs.items.map((item) => deleteObject(item)));

      // delete listing for postgres

      const deletedListing = await deleteListing(listing.pid);

      if (deletedListing) {
        setLoading(false);
        setError("");
        toast.success("Listing deleted successfully");

        navigate(`/profile/${listing.uid}`);
      } else {
        setLoading(false);
        setError(deleteListingError);
        toast.error(deleteListingError);
      }
    } catch (error) {
      setLoading(false);
      setError(
        error instanceof Error ? error.message : "Unable to delete images"
      );
      toast.error(
        error instanceof Error ? error.message : "Unable to delete images"
      );
    }
  };

  const handleSellListing = async (
    e: MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    if (!listing.sold) {
      if (!window.confirm("Confirm mark as sold?")) return;

      const updatedListing = await updateListing({
        pid: listing.pid,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        images: listing.images,
        offers: listing.offers,
        sold: true,
      });

      if (updatedListing) {
        setListing(updatedListing);
        setEdit(false);
        toast.success("Listing sold successfully");
      } else {
        toast.error(updateListingError);
      }
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  if (loading || updateListingLoading || deleteListingLoading) {
    return <Spinner />;
  }

  return (
    <div className="listing">
      <h1>View Listing</h1>
      <button onClick={() => navigate(-1)}>
        <FaArrowCircleLeft /> Back
      </button>

      <div
        className="overlay"
        style={{ display: showModal ? "block" : "none" }}
      >
        <OfferModal pid={listing.pid} setShowModal={setShowModal} />
      </div>

      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="image"
          style={{
            display: index !== imageIndex ? "none" : "flex",
            backgroundImage:
              listing.images[index] === "none"
                ? "none"
                : `url(${listing.images[index]})`,
            border:
              listing.images[index] === "none"
                ? "3px dashed lightgrey"
                : "3px solid lightgrey",
          }}
        >
          {auth.user && auth.user.uid === listing.uid && !listing.sold && (
            <>
              <label className="edit-image" htmlFor={`imageFile-${index}`}>
                <FaEdit size={20} />
              </label>
              <input
                type="file"
                id={`imageFile-${index}`}
                onChange={(e) => handleUploadImage(e, index)}
                accept=".jpg,.png,.jpeg"
              />

              <label
                className="delete-image"
                style={{
                  display: listing.images[index] === "none" ? "none" : "flex",
                }}
                onClick={(e) => handleDeleteImage(e, index)}
              >
                <MdDeleteForever size={20} />
              </label>
            </>
          )}

          {listing.images[index] === "none" && !listing.sold && (
            <div className="add-image">
              <FaCamera size={25} /> Image {index + 1}
            </div>
          )}

          {listing.sold && <div className="listing-sold">ITEM SOLD</div>}

          <button
            className="prev-image"
            style={{
              display: imageIndex === 0 ? "none" : "flex",
            }}
            onClick={() =>
              setImageIndex((prev) => (prev > 0 ? prev - 1 : prev))
            }
          >
            &lt;
          </button>
          <button
            className="next-image"
            style={{
              display: imageIndex === 3 ? "none" : "flex",
            }}
            onClick={() =>
              setImageIndex((prev) => (prev < 3 ? prev + 1 : prev))
            }
          >
            &gt;
          </button>
        </div>
      ))}

      {error && <p className="error-text">Image Error: {error}</p>}

      <table>
        <tbody>
          <tr>
            <th>Product ID</th>
            <td>{listing.pid}</td>
          </tr>
          <tr>
            <th>Seller</th>
            <td>{listing.username}</td>
          </tr>

          <tr>
            <th>Title</th>
            <td>
              {edit ? (
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              ) : (
                title
              )}
            </td>
          </tr>

          <tr>
            <th>Description</th>
            <td>
              {edit ? (
                <textarea
                  id="description"
                  value={description}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              ) : (
                description
              )}
            </td>
          </tr>

          <tr>
            <th>Price</th>
            <td>
              {edit ? (
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
              ) : (
                `S$ ${Number(price).toFixed(2)}`
              )}
            </td>
          </tr>

          <tr>
            <th>Category</th>
            <td>
              {edit ? (
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
              ) : (
                category
              )}
            </td>
          </tr>

          {auth.user && auth.user.uid === listing.uid && (
            <>
              <tr>
                <th>Offers</th>
                <td>
                  {listing.offers.length > 0
                    ? listing.offers.map((offer, index) => {
                        return (
                          <p key={index}>
                            <Link to={`/profile/${offer.split("/")[0]}`}>
                              {offer.split("/")[1]}
                            </Link>{" "}
                            offered S$ {Number(offer.split("/")[2]).toFixed(2)}
                          </p>
                        );
                      })
                    : "Nil"}
                </td>
              </tr>
              <tr>
                <th>Sold</th>
                <td>{listing.sold ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <th>Updated At</th>
                <td>{formatTimestamp(listing.updated)}</td>
              </tr>
              <tr>
                <th>Created At</th>
                <td>{formatTimestamp(listing.created)}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {auth.user && auth.user.uid === listing.uid && !edit && (
        <div className="button-group">
          {!listing.sold && (
            <button className="edit-button" onClick={() => setEdit(true)}>
              <FaEdit size={25} /> Edit Listing
            </button>
          )}
          <button className="delete-button" onClick={handleDeleteListing}>
            <MdDeleteForever size={25} /> Delete Listing
          </button>
          {!listing.sold && (
            <button className="sold-button" onClick={handleSellListing}>
              <MdSell size={25} /> Mark As Sold
            </button>
          )}
        </div>
      )}

      {auth.user && auth.user.uid === listing.uid && !listing.sold && edit && (
        <button className="update-button" onClick={handleUpdateListing}>
          <FaEdit size={25} /> Update Listing
        </button>
      )}

      {auth.user && auth.user.uid !== listing.uid && !listing.sold && (
        <div className="button-group">
          <button
            className="chat-button"
            onClick={() =>
              navigate("/chat", {
                state: {
                  pid: listing.pid,
                  title: listing.title,
                  price: listing.price,
                  images: listing.images,
                  uid: listing.uid,
                  username: listing.username,
                  avatar: listing.avatar,
                },
              })
            }
          >
            <IoChatbubbleEllipsesSharp size={25} /> Chat With Seller
          </button>
          <button className="offer-button" onClick={() => setShowModal(true)}>
            <RiAuctionFill size={25} /> Make An Offer
          </button>
        </div>
      )}

      {updateListingError && (
        <p className="error-text">Update Error: {updateListingError}</p>
      )}
      {deleteListingError && (
        <p className="error-text">Delete Error: {deleteListingError}</p>
      )}
    </div>
  );
};

export default Listing;
