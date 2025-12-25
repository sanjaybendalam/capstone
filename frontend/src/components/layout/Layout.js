import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="py-5">
        <div className="container">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
