import { Link } from "react-router-dom";
import "../styles/theme.css";

const Landing = () => {
  return (
    <div className="landing-page">

      {/* HERO */}
      <section className="hero-section text-center">
        <h1 className="display-4 fw-bold">
          Track Your Carbon Footprint
        </h1>

        <p className="lead mt-3">
          Measure, analyze, and reduce your environmental impact
          through actionable insights.
        </p>

        <div className="mt-4">
          <Link to="/register" className="btn btn-success btn-lg me-3">
            Get Started
          </Link>
          <Link to="/login" className="btn btn-outline-success btn-lg">
            Login
          </Link>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container features-section py-5">
        <h2 className="text-center mb-5">What Ecotrackify Offers</h2>

        <div className="row g-4">
          {features.map((item) => (
            <div className="col-md-4" key={item.title}>
              <div className="card feature-card">
                <img src={item.image} alt={item.title} />
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <p className="card-text">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

const features = [
  {
    title: "Carbon Footprint Tracking",
    description:
      "Monitor emissions from travel, electricity, food, and daily activities.",
    image:
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7"
  },
  {
    title: "Sustainability Goals",
    description:
      "Set emission reduction targets and track progress over time.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
  },
  {
    title: "Insights & Recommendations",
    description:
      "Get actionable suggestions to reduce carbon impact effectively.",
    image:
      "https://images.unsplash.com/photo-1509395176047-4a66953fd231"
  }
];

export default Landing;
