import React, {
  ChangeEvent,
  KeyboardEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaStore, FaSearch } from "react-icons/fa";

import { ListingContext } from "../contexts/listingContext";
import { useGetListings } from "../hooks/useListing";

import Spinner from "../components/Spinner";
import Card from "../components/Card";

const Market = () => {
  const pages = 3; // number of pages to fetch
  const size = 6; // number of listings per page
  const { getListings, loading, error } = useGetListings();

  const {
    start, // start page
    page, // current page
    query,
    listings,
    setStart,
    setPage,
    setQuery,
    setListings,
  } = useContext(ListingContext);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const { search, price, category, sold } = query;

  useEffect(() => {
    const getAllListings = async () => {
      const listings = await getListings({
        search,
        price,
        category,
        sold,
        page: 1,
        pages,
        size,
      });
      setListings(listings);
    };

    if (!listings) getAllListings();
  }, []);

  const handleSearch = async () => {
    setStart(1);
    setPage(1);

    const listings = await getListings({
      search,
      price,
      category,
      sold,
      page: 1,
      pages,
      size,
    });
    setListings(listings);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (buttonRef.current) buttonRef.current.click();
    }
  };

  const handleChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): Promise<void> => {
    setQuery((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));

    if (e.target instanceof HTMLSelectElement) {
      setStart(1);
      setPage(1);

      const listings = await getListings({
        page: 1,
        pages,
        size,
        ...query,
        [e.target.id]: e.target.value,
      });
      setListings(listings);
    }
  };

  const handleMore = async () => {
    const start = (Math.floor((page - 1) / pages) + 1) * pages + 1;
    setStart(start);
    setPage(start);

    const listings = await getListings({
      search,
      price,
      category,
      sold,
      page: start,
      pages,
      size,
    });
    setListings(listings);
  };

  const handleLess = async () => {
    const start = (Math.floor((page - 1) / pages) - 1) * pages + 1;
    setStart(start);
    setPage(start + pages - 1);

    const listings = await getListings({
      search,
      price,
      category,
      sold,
      page: start,
      pages,
      size,
    });
    setListings(listings);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="market">
      <h1><FaStore />Market</h1>
      <div className="search-group">
        <input
          className="search-input"
          type="text"
          id="search"
          value={search}
          ref={inputRef}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search User or Title"
          autoComplete="off"
          required
        />
        <button
          className="search-button"
          ref={buttonRef}
          onClick={handleSearch}
        >
          <FaSearch />
          Search
        </button>
      </div>

      <div className="query-group">
        <select
          id="price"
          value={price}
          onChange={handleChange}
          autoComplete="off"
        >
          <option value="">Sort by Price</option>
          <option value="High">High to Low</option>
          <option value="Low">Low to High</option>
        </select>

        <select
          id="category"
          value={category}
          onChange={handleChange}
          autoComplete="off"
        >
          <option value="">Filter by Category</option>
          <option value="Beauty">Beauty</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Vehicle">Vehicle</option>
          <option value="Property">Property</option>
        </select>

        <select
          id="sold"
          value={sold}
          onChange={handleChange}
          autoComplete="off"
        >
          <option value="">Filter by Sold</option>
          <option value="True">Sold</option>
          <option value="False">Not Sold</option>
        </select>
      </div>

      {listings && listings.length > 0 && (
        <div className="page-group">
          {start > 1 && (
            <button className="more-button" onClick={handleLess}>
              &lt;&lt;
            </button>
          )}
          {Array.from(
            Array(
              Math.min(pages, Math.floor((listings.length - 1) / size) + 1)
            ).keys()
          ).map((_, index) => (
            <button
              key={index}
              className="page-button"
              style={{
                background: page === start + index ? "darkslategrey" : "orange",
              }}
              onClick={() => setPage(start + index)}
            >
              {start + index}
            </button>
          ))}
          {listings && listings.length === pages * size && (
            <button className="more-button" onClick={handleMore}>
              &gt;&gt;
            </button>
          )}
        </div>
      )}

      {listings && listings.length > 0 ? (
        <div className="card-grid">
          {listings
            .slice((page - start) * size, (page - start) * size + size)
            .map((listing) => (
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
