import { useEffect, useState } from "react";
import { getSpells, getSpellDetails } from "../services/api";
import "../styles/Spells.css";

function Spells() {
  const [spells, setSpells] = useState([]);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSchool, setSelectedSchool] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage("");
    setSelectedSpell(null);

    getSpells({ level: selectedLevel, school: selectedSchool })
      .then((data) => {
        setSpells(data.results || []);
      })
      .catch((err) => {
        setErrorMessage("Failed to load spells.");
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedLevel, selectedSchool]);

  function handleSpellClick(index) {
    setErrorMessage("");

    getSpellDetails(index)
      .then((data) => {
        setSelectedSpell(data);
      })
      .catch((err) => {
        setErrorMessage("Failed to load spell details.");
        console.error(err);
      });
  }

  function getLevelLabel(level) {
    if (level === 0) {
      return "Cantrip";
    }

    return `Level ${level}`;
  }

  return (
    <main className="spells-page">
      <section className="spells-page__container">
        <h1 className="spells-page__title">Spells</h1>
        <p className="spells-page__description">
          Browse spells by level and school, then click a spell to view details.
        </p>

        <section className="spells-page__filters">
          <div className="spells-page__filter-group">
            <label className="spells-page__label" htmlFor="spell-level">
              Level
            </label>
            <select
              id="spell-level"
              className="spells-page__select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">All</option>
              <option value="0">Cantrip</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
              <option value="5">Level 5</option>
              <option value="6">Level 6</option>
              <option value="7">Level 7</option>
              <option value="8">Level 8</option>
              <option value="9">Level 9</option>
            </select>
          </div>

          <div className="spells-page__filter-group">
            <label className="spells-page__label" htmlFor="spell-school">
              School
            </label>
            <select
              id="spell-school"
              className="spells-page__select"
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
          </div>
        </section>

        {isLoading && (
          <p className="spells-page__status">Loading spells...</p>
        )}

        {errorMessage && (
          <p className="spells-page__status">{errorMessage}</p>
        )}

        {!isLoading && !errorMessage && spells.length === 0 && (
          <p className="spells-page__empty">
            No spells matched your filters.
          </p>
        )}

        {!isLoading && !errorMessage && spells.length > 0 && (
          <section className="spells-page__grid">
            {spells.map((spell) => {
              const isSelected = selectedSpell?.index === spell.index;

              return (
                <button
                  key={spell.index}
                  type="button"
                  className={`spell-card ${isSelected ? "spell-card--selected" : ""}`}
                  onClick={() => handleSpellClick(spell.index)}
                >
                  <h2 className="spell-card__title">{spell.name}</h2>
                  <p className="spell-card__meta">
                    Click to view details
                  </p>
                </button>
              );
            })}
          </section>
        )}

        {selectedSpell && (
          <section className="spells-page__details">
            <h2 className="spells-page__details-title">
              {selectedSpell.name}
            </h2>

            <div className="spells-page__details-list">
              <p className="spells-page__detail-text">
                <strong>Level:</strong> {getLevelLabel(selectedSpell.level)}
              </p>
              <p className="spells-page__detail-text">
                <strong>School:</strong> {selectedSpell.school?.name}
              </p>
              <p className="spells-page__detail-text">
                <strong>Casting Time:</strong> {selectedSpell.casting_time}
              </p>
              <p className="spells-page__detail-text">
                <strong>Range:</strong> {selectedSpell.range}
              </p>
              <p className="spells-page__detail-text">
                <strong>Duration:</strong> {selectedSpell.duration}
              </p>
              <p className="spells-page__detail-text">
                <strong>Components:</strong> {selectedSpell.components?.join(", ")}
              </p>
            </div>

            {selectedSpell.desc?.map((paragraph, index) => (
              <p key={index} className="spells-page__detail-text">
                {paragraph}
              </p>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}

export default Spells;