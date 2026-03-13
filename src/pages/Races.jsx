import { useState } from "react";
import { races } from "../data/races";

function Races() {
  const [hoveredRace, sethoveredRace] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);

  return (
    <main className="page">
      <h1>Races</h1>
      <p>Discover races and subraces without opening five different tabs.</p>

      <div className="content-grid">
        <section className="list-panel">
          <h2>Common Races</h2>

          {races.map((race) => (
            <button
              key={race.id}
              className="list-item"
              onMouseEnter={() => setHoveredRace(race)}
              onMouseLeave={() => setHoveredRace(null)}
              onClick={() => setSelectedRace(race)}
            >
              {race.name}
            </button>
          ))}
        </section>

        <section className="preview-panel">
          <h2>Preview</h2>
          {hoveredRace ? (
            <>
              <h3>{hoveredRace.name}</h3>
              <p>{hoveredRace.preview}</p>
            </>
          ) : (
            <p>Hover over a race to preview it.</p>
          )}
        </section>
      </div>

      {selectedRace && (
        <section className="details-panel">
          <h2>{selectedRace.name}</h2>
          <p>{selectedRace.description}</p>

          <h3>Subraces</h3>
          {selectedRace.subraces.map((subrace) => (
            <div key={subrace.id} className="subrace-card">
              <strong>{subrace.name}</strong>
              <p>{subrace.preview}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default Races;
