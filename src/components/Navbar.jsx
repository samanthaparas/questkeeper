import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <h2>QuestKeeper</h2>
      </div>
      <ul className="navbar__links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/races">Races</Link>
        </li>

        <li>
          <Link to="/classes">Classes</Link>
        </li>

        <li>
          <Link to="/backgrounds">Backgrounds</Link>
        </li>

        <li>
          <Link to="/spells">Spells</Link>
        </li>

        <li>
          <Link to="/profile">Profile</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
