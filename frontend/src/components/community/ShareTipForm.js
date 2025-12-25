import React, { useState } from "react";
import { addTip } from "../../services/api";
import { toast } from "react-toastify";

// Simple content validation - list of inappropriate words/patterns
const BANNED_WORDS = ["spam", "advertisement", "buy now", "click here", "free money"];

const validateContent = (content) => {
  const lowerContent = content.toLowerCase();

  // Check for banned words
  for (const word of BANNED_WORDS) {
    if (lowerContent.includes(word)) {
      return { valid: false, reason: `Content contains inappropriate term: "${word}"` };
    }
  }

  // Check minimum length
  if (content.trim().length < 10) {
    return { valid: false, reason: "Tip must be at least 10 characters long" };
  }

  // Check maximum length
  if (content.length > 500) {
    return { valid: false, reason: "Tip cannot exceed 500 characters" };
  }

  return { valid: true };
};

const ShareTipForm = ({ onAdd }) => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate content
    const validation = validateContent(content);
    if (!validation.valid) {
      toast.error(validation.reason);
      return;
    }

    setLoading(true);
    try {
      const tip = await addTip({
        content: content.trim(),
        tags: tags.split(",").map(t => t.trim()).filter(t => t)
      });
      onAdd(tip);
      setContent("");
      setTags("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add tip");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <textarea
          className="form-control"
          rows="3"
          placeholder="Share an eco-friendly tip with the community... (10-500 characters)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
        />
        <small className="text-muted">
          {content.length}/500 characters
        </small>
      </div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tags (comma separated, e.g., recycling, energy, transport)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="btn btn-success"
        disabled={loading || content.trim().length < 10}
      >
        {loading ? "Sharing..." : "🌱 Share Tip"}
      </button>
    </form>
  );
};

export default ShareTipForm;
