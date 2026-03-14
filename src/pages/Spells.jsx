import { useEffect, useState } from "react";
import { getSpells, getSpellDetails } from "../services/api";

function Spells() {
  const [spells, setSpells] = useState([]);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    getSpells({ level: selectedLevel, school: selectedSchool })
      .then((data) => {
        setSpells(data.results || []);
      })
      .catch((error) => {
        setErrorMessage("Failed to load spells. Please try again.");
        console.error("Error fetching spells:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedLevel, selectedSchool]);

  function handleSpellClick(index) {
    setErrorMessage("");

    getSpellDetails(index)
      .then((data) => {
        setSelectedSpell(data);
      })
      .catch((error) => {
        setErrorMessage("Failed to load spell details. Please try again.");
        console.error("Error fetching spell details:", error);
      });
  }

  return (
    <main className="spells-page">
      <h1>Spells</h1>

      <section className="spells-page__filters">
        <label>
          Level:
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="">All</option>
            <option value="0">Cantrip</option>
            <option value="1">1st Level</option>
            <option value="2">2nd Level</option>
            <option value="3">3rd Level</option>
            <option value="4">4th Level</option>
            <option value="5">5th Level</option>
            <option value="6">6th Level</option>
            <option value="7">7th Level</option>
            <option value="8">8th Level</option>
            <option value="9">9th Level</option>
          </select>
        </label>

        <label>
          School:
          <select
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
            <option value="">All</option>
            <option value="abjuration">Abjuration</option>
            <option value="conjuration">Conjuration</option>
            <option value="divination">Divination</option>
            <option value="enchantment">Enchantment</option>
            <option value="evocation">Evocation</option>
            <option value="illusion">Illusion</option>
            <option value="necromancy">Necromancy</option>
            <option value="transmutation">Transmutation</option>
          </select>
        </label>
      </section>
      {loading ? <p>Loading spells...</p> : null}
      {errorMessage ? <p className="error">{errorMessage}</p> : null}

      <section className="spells-page__list">
        {spells.map((spell) => (
          <button
            key={spell.index}
            type="button"
            onClick={() => handleSpellClick(spell.index)}
            className="spell-item"
          >
            {spell.name}
          </button>
        ))}
      </section>

      {selectedSpell && (
        <section className="spells-page__details">
          <h2>{selectedSpell.name}</h2>
          <p>
            <strong>Level:</strong> {selectedSpell.level}
          </p>
          <p>
            <strong>School:</strong> {selectedSpell.school}
          </p>
          <p>
            <strong>Casting Time:</strong> {selectedSpell.casting_time}
          </p>
          <p>
            <strong>Range:</strong> {selectedSpell.range}
          </p>
          <p>
            <strong>Duration:</strong> {selectedSpell.duration}
          </p>
          <p>
            <strong>Components:</strong> {selectedSpell.components?.join(", ")}
          </p>

          {selectedSpell.desc?.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      )}
    </main>
  );
}

export default Spells;
