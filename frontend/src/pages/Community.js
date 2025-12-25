import React, { useEffect, useState } from "react";
import TipCard from "../components/community/TipCard";
import ShareTipForm from "../components/community/ShareTipForm";
import { getTips, likeTip, searchTips } from "../services/api";
import { toast } from "react-toastify";

const Community = () => {
  const [tips, setTips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const fetchTips = async () => {
    try {
      setLoading(true);
      const data = await getTips();
      setTips(data || []);
    } catch (err) {
      toast.error("Failed to fetch tips");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleAddTip = (tip) => {
    setTips([tip, ...tips]);
    toast.success("🌱 Your eco tip has been shared with the community!");
  };

  const handleLike = async (id) => {
    try {
      const updated = await likeTip(id);
      setTips(tips.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      toast.error("Failed to like tip");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchTips();
      return;
    }

    try {
      setSearching(true);
      const data = await searchTips(searchQuery);
      setTips(data || []);
      if (data.length === 0) {
        toast.info("No tips found matching your search");
      }
    } catch (err) {
      toast.error("Search failed");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    fetchTips();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🌿 Community Eco Tips</h2>
      <p className="text-muted mb-4">
        Share your sustainability tips and learn from the community!
      </p>

      {/* Search Section */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch} className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search tips by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={searching}
            >
              {searching ? "..." : "Search"}
            </button>
            {searchQuery && (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Share Tip Form */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">💡 Share Your Eco Tip</h5>
        </div>
        <div className="card-body">
          <ShareTipForm onAdd={handleAddTip} />
        </div>
      </div>

      {/* Tips List */}
      <h4 className="mb-3">📝 Community Tips ({tips.length})</h4>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : tips.length === 0 ? (
        <div className="alert alert-info text-center">
          <h5>No tips yet!</h5>
          <p>Be the first to share an eco-friendly tip with the community.</p>
        </div>
      ) : (
        <div className="row">
          {tips.map((tip) => (
            <div className="col-md-6 mb-3" key={tip._id}>
              <TipCard tip={tip} onLike={handleLike} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
