import { useState } from "react";
import { races } from "../data/races";
import "../styles/Races.css";

function Races() {
  const [hoveredRace, setHoveredRace] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const activeRace = selectedRace || hoveredRace;
  const isShowingSelectedRace = selectedRace?.id === activeRace?.id;

  const filteredRaces = races.filter((race) =>
    race.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <main className="races-page">
      <section className="races-page__container">
        <h1 className="races-page__title">Races</h1>
        <p className="races-page__description">
          Discover races and subraces without opening five different tabs.
        </p>

        <section className="races-page__layout">
          <section className="races-page__list-panel">
            <h2 className="races-page__panel-title">Common Races</h2>

            <input
              type="text"
              className="races-page__search"
              placeholder="Search races..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="races-page__list">
              {filteredRaces.length > 0 ? (
                filteredRaces.map((race) => {
                  const isSelected = selectedRace?.id === race.id;

                  return (
                    <button
                      key={race.id}
                      type="button"
                      className={`races-page__list-item ${
                        isSelected ? "races-page__list-item--selected" : ""
                      }`}
                      onMouseEnter={() => setHoveredRace(race)}
                      onMouseLeave={() => setHoveredRace(null)}
                      onFocus={() => setHoveredRace(race)}
                      onBlur={() => setHoveredRace(null)}
                      onClick={() => setSelectedRace(race)}
                      aria-pressed={isSelected}
                    >
                      {race.name}
                    </button>
                  );
                })
              ) : (
                <p className="races-page__empty-list">
                  No races match your search.
                </p>
              )}
            </div>
          </section>

          <section className="races-page__details-panel">
            {!activeRace ? (
              <>
                <h2 className="races-page__panel-title">Race Details</h2>
                <p className="races-page__placeholder">
                  Hover over a race for a quick preview, or click a race to lock
                  in its full details and subraces.
                </p>
              </>
            ) : (
              <>
                <div className="races-page__details-header">
                  <h2 className="races-page__details-title">
                    {activeRace.name}
                  </h2>

                  {selectedRace && (
                    <button
                      type="button"
                      classname="races-page__clear-button"
                      onClick={() => setSelectedRace(null)}
                    >
                      Clear selection
                    </button>
                  )}
                </div>

                <p className="races-page__detail-text">
                  {isShowingSelectedRace
                    ? activeRace.description
                    : activeRace.preview}
                </p>

                {selectedRace && activeRace.subraces?.length > 0 && (
                  <>
                    <h3 className="races-page__subrace-title">Subraces</h3>

                    <div className="races-page__subrace-list">
                      {activeRace.subraces.map((subrace) => (
                        <article
                          key={subrace.id}
                          className="races-page__subrace-card"
                        >
                          <h4 className="races-page__subrace-name">
                            {subrace.name}
                          </h4>
                          <p className="races-page__detail-text">
                            {subrace.preview}
                          </p>
                        </article>
                      ))}
                    </div>
                  </>
                )}

                {selectedRace && activeRace.subraces?.length === 0 && (
                  <p className="races-page__detail-text">
                    No subraces available for this race.
                  </p>
                )}
              </>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}

export default Races;
