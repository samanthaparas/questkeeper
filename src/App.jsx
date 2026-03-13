import "./styles/global.css";
import Navbar from "./components/Navbar";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Races from "./pages/Races";
import Classes from "./pages/Classes";
import Backgrounds from "./pages/Backgrounds";
import Profile from "./pages/Profile";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/races" element={<Races />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/backgrounds" element={<Backgrounds />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
