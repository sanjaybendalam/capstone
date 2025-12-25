const Footer = () => {
  return (
    <footer className="footer py-5">
      <div className="container">
        <div className="row text-start">

          <div className="col-md-4">
            <h6 className="text-success fw-bold">Ecotrackify</h6>
            <p className="text-muted">
              A sustainability platform designed to help individuals
              track and reduce their carbon footprint.
            </p>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold">Platform</h6>
            <ul className="list-unstyled text-muted">
              <li>Carbon Tracking</li>
              <li>Sustainability Goals</li>
              <li>Insights & Tips</li>
            </ul>
          </div>

          <div className="col-md-4">
            <h6 className="fw-bold">Contact</h6>
            <p className="text-muted mb-1">Email: support@ecotrackify.com</p>
            <p className="text-muted mb-0">Built for a greener future</p>
          </div>

        </div>

        <hr className="border-secondary my-4" />

        <p className="text-center text-muted mb-0">
          © {new Date().getFullYear()} Ecotrackify. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
