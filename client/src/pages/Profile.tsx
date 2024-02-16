import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaEye, FaKey } from "react-icons/fa";

import { storage } from "../config/firebase.config";
import { AuthContext } from "../contexts/authContext";
import { useGetUser, useUpdateUser } from "../hooks/useAuth";
import { useGetUserListings } from "../hooks/useListing";
import { GetUserModel } from "../models/UserModel";
import { ViewListingModel } from "../models/ListingModel";
import { checkFiles } from "../utilities/checkFiles";
import { storeAvatar } from "../utilities/storeAvatar";
import { getRelativeTime } from "../utilities/getRelativeTime";

import Spinner from "../components/Spinner";
import PasswordModal from "../components/PasswordModal";

const Profile = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const { state: auth } = useContext(AuthContext);

  const [profile, setProfile] = useState<GetUserModel>({
    uid: "",
    username: "",
    avatar: "",
  });
  const [showModal, setShowModal] = useState(false);

  const [listings, setListings] = useState<ViewListingModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    getUser,
    loading: getUserLoading,
    error: getUserError,
  } = useGetUser();
  const {
    updateUser,
    loading: updateUserLoading,
    error: updateUserError,
  } = useUpdateUser();
  const {
    getUserListings,
    loading: getUserListingsLoading,
    error: getUserListingsError,
  } = useGetUserListings();

  useEffect(() => {
    setListings([]);

    const getProfile = async () => {
      if (uid) {
        const user = await getUser(uid);
        if (user) setProfile(user);
      }
    };

    const getProfileListings = async () => {
      if (uid) {
        const listings = await getUserListings(uid);
        if (listings) setListings(listings);
      }
    };

    getProfile();
    getProfileListings();
  }, [navigate]);

  const handleUploadAvatar = async (
    e: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = (e.target as HTMLInputElement).files;

    if (!files) return;

    if (!checkFiles(files, 1, 0.5)) {
      window.alert("Maximum 1 file 0.5 MB each");

      return;
    }

    if (!auth.user) return;

    if (auth.user.uid !== profile.uid) return;

    try {
      setLoading(true);
      setError("");

      // store avatar for firebase

      const imageFile = files[0];

      const imageUrl = await storeAvatar(storage, auth.user.uid, imageFile);

      // update avatar for postgres

      const updatedProfile = await updateUser({
        uid: auth.user.uid,
        password: "",
        avatar: imageUrl,
      });

      if (updatedProfile) {
        setProfile(updatedProfile);

        setLoading(false);
        setError("");
        toast.success("Avatar updated successfully");
      } else {
        setLoading(false);
        setError(updateUserError);
        toast.error(updateUserError);
      }
    } catch (error) {
      setLoading(false);
      setError(
        error instanceof Error ? error.message : "Unable to upload avatar"
      );
      toast.error(
        error instanceof Error ? error.message : "Unable to upload avatar"
      );
    }
  };

  if (
    loading ||
    getUserLoading ||
    updateUserLoading ||
    getUserListingsLoading
  ) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <h1>Profile</h1>

      <h2>Profile Details</h2>
      {profile.uid && (
        <>
          <div
            className="avatar"
            style={{
              backgroundImage: `url(${profile.avatar})`,
            }}
          >
            {auth.user && auth.user.uid === profile.uid && (
              <>
                <label className="edit-avatar" htmlFor="edit-avatar">
                  <FaEdit size={20} />
                </label>
                <input
                  type="file"
                  id="edit-avatar"
                  onChange={handleUploadAvatar}
                  accept=".jpg,.png,.jpeg"
                />
              </>
            )}
          </div>
          <p>
            <strong>User ID</strong> {profile.uid}
          </p>
          <p>
            <strong>Username</strong> {profile.username}
          </p>

          {auth.user && auth.user.uid === profile.uid && (
            <>
              <button
                className="change-button"
                onClick={() => setShowModal(true)}
              >
                <FaKey />
                Change Password
              </button>
              <div
                className="overlay"
                style={{ display: showModal ? "block" : "none" }}
              >
                <PasswordModal uid={profile.uid} setShowModal={setShowModal} />
              </div>
            </>
          )}
        </>
      )}

      {error && <p className="error-text">Avatar Error: {getUserError}</p>}
      {updateUserError && (
        <p className="error-text">Update Error: {updateUserError}</p>
      )}
      {getUserError && <p className="error-text">User Error: {getUserError}</p>}

      <h2>Profile Listings</h2>
      {listings.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Price</th>
              <th>Offered</th>
              <th>Sold</th>
              <th>Last Updated</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {listings.map((listing) => (
              <tr key={listing.pid}>
                <td>{listing.title}</td>
                <td>${listing.price.toFixed(2)}</td>
                <td
                  style={{
                    background:
                      listing.offers!.length > 0 ? "lightgreen" : "lightpink",
                  }}
                >
                  {listing.offers!.length > 0 ? "Yes" : "No"}
                </td>
                <td
                  style={{
                    background: listing.sold ? "lightgreen" : "lightpink",
                  }}
                >
                  {listing.sold ? "Yes" : "No"}
                </td>
                <td>{getRelativeTime(listing.updated)}</td>
                <td>
                  <FaEye
                    className="eye-icon"
                    onClick={() =>
                      navigate(`/listing/${listing.pid}`, {
                        state: listing,
                      })
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        !getUserListingsLoading && <p>No listings available</p>
      )}

      {getUserListingsError && (
        <p className="error-text">Listings Error: {getUserListingsError}</p>
      )}
    </div>
  );
};

export default Profile;
