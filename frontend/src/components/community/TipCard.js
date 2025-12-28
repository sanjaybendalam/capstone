import React from "react";

const TipCard = ({ tip, onLike, showEmail = false }) => {
  // Handle both populated authorId (object) and non-populated (string)
  const authorName = typeof tip.authorId === 'object' && tip.authorId?.name
    ? tip.authorId.name
    : 'You';
  const authorEmail = typeof tip.authorId === 'object' && tip.authorId?.email
    ? tip.authorId.email
    : null;

  const isLiked = tip.isLiked || false;

  return (
    <div className="card h-100">
      <div className="card-body">
        <p className="card-text">{tip.content}</p>
        {tip.tags && tip.tags.length > 0 && (
          <div className="mb-2">
            {tip.tags.map((tag, i) => (
              <span key={i} className="badge bg-secondary me-1">{tag}</span>
            ))}
          </div>
        )}
        <small className="text-muted">
          By: {authorName}
          {showEmail && authorEmail && (
            <span className="ms-1">({authorEmail})</span>
          )}
        </small>
        <div className="mt-2 d-flex justify-content-between align-items-center">
          <span className={isLiked ? "text-danger" : "text-muted"}>
            {isLiked ? "♥" : "♡"} {tip.likes || 0} {tip.likes === 1 ? "like" : "likes"}
          </span>
          <button
            className={`btn btn-sm ${isLiked ? "btn-danger" : "btn-outline-secondary"}`}
            onClick={() => onLike(tip._id)}
          >
            {isLiked ? "Unlike" : "Like"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipCard;
