import { useState } from "react";
import { races } from "../data/races";
import "../styles/Races.css";

function Races() {
  const [hoveredRace, setHoveredRace] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);

  const activeRace = selectedRace || hoveredRace;

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

            <div className="races-page__list">
              {races.map((race) => {
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
                    onClick={() => setSelectedRace(race)}
                  >
                    {race.name}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="races-page__details-panel">
            {!activeRace ? (
              <>
                <h2 className="races-page__panel-title">Race Details</h2>
                <p className="races-page__placeholder">
                  Hover over a race to preview it, or click a race to view full
                  details.
                </p>
              </>
            ) : (
              <>
                <h2 className="races-page__details-title">{activeRace.name}</h2>

                <p className="races-page__detail-text">
                  {selectedRace ? activeRace.description : activeRace.preview}
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
