import "./styles/global.css";
import Navbar from "./components/Navbar";

import { HashRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Races from "./pages/Races";
import Classes from "./pages/Classes";
import Backgrounds from "./pages/Backgrounds";
import Spells from "./pages/Spells";
import Profile from "./pages/Profile";

function App() {
  return (
    <div>
      <HashRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/races" element={<Races />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/backgrounds" element={<Backgrounds />} />
          <Route path="/spells" element={<Spells />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

export default App;
