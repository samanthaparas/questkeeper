import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCharacter, saveCharacter } from "../../utils/characterStore";
import {
  ABILITY_SCORES,
  ABILITY_ABBREVIATIONS,
  getAbilityModifier,
  getProficiencyBonus,
  buildLevelUpSummary,
  createResource,
  setResourceCurrent,
  removeResource,
  setCurrentHp,
  applyRest,
} from "../../utils/characterSheet";
import LevelUpWizard from "../../components/LevelUpWizard/LevelUpWizard";
import "./CharacterSheetPage.css";

function formatModifier(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function CharacterSheetPage() {
  const { id } = useParams();
  const [sheet, setSheet] = useState(() => getCharacter(id));
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [levelUpSummary, setLevelUpSummary] = useState(null);
  const [newResourceName, setNewResourceName] = useState("");
  const [newResourceMax, setNewResourceMax] = useState("");
  const [newResourceResetOn, setNewResourceResetOn] = useState("long");

  if (!sheet) {
    return (
      <main className="character-sheet character-sheet--empty">
        <h1 className="character-sheet__title">Character not found</h1>
        <Link className="character-sheet__back-link" to="/characters">
          Back to Characters
        </Link>
      </main>
    );
  }

  function handleLevelUpComplete(updatedSheet) {
    const summary = buildLevelUpSummary(sheet, updatedSheet);
    const saved = saveCharacter(updatedSheet);
    setSheet(saved);
    setLevelUpSummary(summary);
    setIsLevelingUp(false);
  }

  function persistSheet(updated) {
    const saved = saveCharacter(updated);
    setSheet(saved);
  }

  function handleHpChange(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    persistSheet({
      ...sheet,
      combat: {
        ...sheet.combat,
        hitPoints: setCurrentHp(sheet.combat.hitPoints, numeric),
      },
    });
  }

  function handleAddResource(e) {
    e.preventDefault();
    if (!newResourceName.trim() || !newResourceMax) return;

    const resource = createResource({
      name: newResourceName.trim(),
      max: Number(newResourceMax),
      resetOn: newResourceResetOn,
    });

    persistSheet({
      ...sheet,
      resources: [...(sheet.resources ?? []), resource],
    });

    setNewResourceName("");
    setNewResourceMax("");
    setNewResourceResetOn("long");
  }

  function handleResourceCurrentChange(id, value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    persistSheet({
      ...sheet,
      resources: setResourceCurrent(sheet.resources ?? [], id, numeric),
    });
  }

  function handleRemoveResource(id) {
    persistSheet({
      ...sheet,
      resources: removeResource(sheet.resources ?? [], id),
    });
  }

  function handleRest(restType) {
    persistSheet(applyRest(sheet, restType));
  }

  const proficiencyBonus = getProficiencyBonus(sheet.level);
  const { combat } = sheet;

  return (
    <main className="character-sheet">
      <div className="character-sheet__content">
        <Link className="character-sheet__back-link" to="/characters">
          Back to Characters
        </Link>

        {isLevelingUp && (
          <LevelUpWizard
            sheet={sheet}
            onComplete={handleLevelUpComplete}
            onCancel={() => setIsLevelingUp(false)}
          />
        )}

        {!isLevelingUp && levelUpSummary && (
          <div className="character-sheet__level-up-summary">
            <h2 className="character-sheet__section-title">
              Level {levelUpSummary.toLevel}!
            </h2>

            <ul className="character-sheet__level-up-summary-list">
              <li>
                Hit Points: +{levelUpSummary.hpGained} (now{" "}
                {sheet.combat.hitPoints.max})
              </li>

              {levelUpSummary.toProficiency !==
                levelUpSummary.fromProficiency && (
                <li>
                  Proficiency Bonus: +{levelUpSummary.fromProficiency} &rarr; +
                  {levelUpSummary.toProficiency}
                </li>
              )}

              {levelUpSummary.abilityChanges.map(({ ability, from, to }) => (
                <li key={ability}>
                  {ABILITY_ABBREVIATIONS[ability]}: {from} &rarr; {to}
                </li>
              ))}

              {levelUpSummary.newFeat && (
                <li>New Feat: {levelUpSummary.newFeat.name}</li>
              )}

              {levelUpSummary.newSpell && (
                <li>New Spell: {levelUpSummary.newSpell.name}</li>
              )}
            </ul>

            <button
              type="button"
              className="character-sheet__level-up-button"
              onClick={() => setLevelUpSummary(null)}
            >
              Continue
            </button>
          </div>
        )}

        {!isLevelingUp && !levelUpSummary && (
          <>
            <header className="character-sheet__header">
              <h1 className="character-sheet__title">{sheet.name}</h1>
              <p className="character-sheet__subtitle">
                Level {sheet.level} {sheet.race?.name ?? "No race"}{" "}
                {sheet.class?.name ?? "No class"} ·{" "}
                {sheet.background?.name ?? "No background"}
              </p>
            </header>

            <div className="character-sheet__actions">
              <button
                type="button"
                className="character-sheet__level-up-button"
                onClick={() => setIsLevelingUp(true)}
              >
                Level Up
              </button>

              <button
                type="button"
                className="character-sheet__rest-button"
                onClick={() => handleRest("short")}
              >
                Short Rest
              </button>

              <button
                type="button"
                className="character-sheet__rest-button"
                onClick={() => handleRest("long")}
              >
                Long Rest
              </button>
            </div>

            <section className="character-sheet__stat-row">
              <div className="character-sheet__stat-box">
                <span className="character-sheet__stat-label">Armor Class</span>
                <span className="character-sheet__stat-value">
                  {combat.armorClass}
                </span>
              </div>
              <div className="character-sheet__stat-box">
                <span className="character-sheet__stat-label">Initiative</span>
                <span className="character-sheet__stat-value">
                  {formatModifier(combat.initiative)}
                </span>
              </div>
              <div className="character-sheet__stat-box">
                <span className="character-sheet__stat-label">Speed</span>
                <span className="character-sheet__stat-value">
                  {combat.speed} ft
                </span>
              </div>
              <div className="character-sheet__stat-box">
                <span className="character-sheet__stat-label">Hit Points</span>
                <span className="character-sheet__stat-value character-sheet__hp-value">
                  <input
                    type="number"
                    className="character-sheet__hp-input"
                    value={combat.hitPoints.current}
                    onChange={(e) => handleHpChange(e.target.value)}
                    min={0}
                    max={combat.hitPoints.max}
                  />
                  {" / "}
                  {combat.hitPoints.max}
                  {combat.hitPoints.temporary > 0 &&
                    ` (+${combat.hitPoints.temporary})`}
                </span>
              </div>
              <div className="character-sheet__stat-box">
                <span className="character-sheet__stat-label">Hit Dice</span>
                <span className="character-sheet__stat-value">
                  {combat.hitDice.remaining}/{combat.hitDice.total}
                  {combat.hitDice.die ? ` d${combat.hitDice.die}` : ""}
                </span>
              </div>
              <div className="character-sheet__stat-box">
                <span className="character-sheet__stat-label">Proficiency</span>
                <span className="character-sheet__stat-value">
                  +{proficiencyBonus}
                </span>
              </div>
            </section>

            <section className="character-sheet__abilities">
              {ABILITY_SCORES.map((ability) => {
                const score = sheet.abilityScores[ability];
                const modifier = getAbilityModifier(score);

                return (
                  <div className="character-sheet__ability-card" key={ability}>
                    <span className="character-sheet__ability-name">
                      {ABILITY_ABBREVIATIONS[ability]}
                    </span>
                    <span className="character-sheet__ability-score">
                      {score}
                    </span>
                    <span className="character-sheet__ability-modifier">
                      {formatModifier(modifier)}
                    </span>
                    {sheet.savingThrows[ability] && (
                      <span className="character-sheet__ability-save-badge">
                        Save Prof.
                      </span>
                    )}
                  </div>
                );
              })}
            </section>

            <section className="character-sheet__section">
              <h2 className="character-sheet__section-title">Resources</h2>
              {(sheet.resources ?? []).length === 0 ? (
                <p className="character-sheet__empty-text">
                  No tracked resources yet. Add one below for anything with
                  limited uses - Channel Divinity, Lay on Hands, spell slots,
                  whatever you need.
                </p>
              ) : (
                <ul className="character-sheet__resource-list">
                  {sheet.resources.map((resource) => (
                    <li
                      className="character-sheet__resource-row"
                      key={resource.id}
                    >
                      <span className="character-sheet__resource-name">
                        {resource.name}
                      </span>
                      <span className="character-sheet__resource-count">
                        <input
                          type="number"
                          className="character-sheet__resource-input"
                          value={resource.current}
                          onChange={(e) =>
                            handleResourceCurrentChange(
                              resource.id,
                              e.target.value,
                            )
                          }
                          min={0}
                          max={resource.max}
                        />
                        {" / "}
                        {resource.max}
                      </span>
                      <span className="character-sheet__resource-reset">
                        {resource.resetOn === "short"
                          ? "Short Rest"
                          : "Long Rest"}
                      </span>
                      <button
                        type="button"
                        className="character-sheet__resource-remove"
                        onClick={() => handleRemoveResource(resource.id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form
                className="character-sheet__resource-form"
                onSubmit={handleAddResource}
              >
                <input
                  type="text"
                  className="character-sheet__resource-form-input"
                  placeholder="Resource name (e.g. Channel Divinity)"
                  value={newResourceName}
                  onChange={(e) => setNewResourceName(e.target.value)}
                />
                <input
                  type="number"
                  className="character-sheet__resource-form-input character-sheet__resource-form-input--small"
                  placeholder="Max"
                  value={newResourceMax}
                  onChange={(e) => setNewResourceMax(e.target.value)}
                  min={1}
                />
                <select
                  className="character-sheet__resource-form-select"
                  value={newResourceResetOn}
                  onChange={(e) => setNewResourceResetOn(e.target.value)}
                >
                  <option value="long">Long Rest</option>
                  <option value="short">Short Rest</option>
                </select>
                <button
                  type="submit"
                  className="character-sheet__resource-add-button"
                >
                  Add Resource
                </button>
              </form>
            </section>

            <section className="character-sheet__section">
              <h2 className="character-sheet__section-title">Equipment</h2>
              {sheet.equipment.length === 0 ? (
                <p className="character-sheet__empty-text">
                  No equipment recorded yet.
                </p>
              ) : (
                <ul className="character-sheet__list">
                  {sheet.equipment.map((item) => (
                    <li key={item.index}>
                      {item.name}
                      {item.quantity > 1 ? ` x${item.quantity}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="character-sheet__section">
              <h2 className="character-sheet__section-title">
                Skill Proficiencies
              </h2>
              {Object.keys(sheet.skills ?? {}).length === 0 ? (
                <p className="character-sheet__empty-text">
                  No skill proficiencies yet.
                </p>
              ) : (
                <ul className="character-sheet__list">
                  {Object.entries(sheet.skills).map(([index, name]) => (
                    <li key={index}>{name}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="character-sheet__section">
              <h2 className="character-sheet__section-title">Feats</h2>
              {(sheet.feats?.length ?? 0) === 0 ? (
                <p className="character-sheet__empty-text">No feats yet.</p>
              ) : (
                <ul className="character-sheet__list">
                  {sheet.feats.map((feat) => (
                    <li key={feat.index}>{feat.name}</li>
                  ))}
                </ul>
              )}
            </section>

            <section className="character-sheet__section">
              <h2 className="character-sheet__section-title">Spellcasting</h2>
              {sheet.spellcasting ? (
                <>
                  {sheet.spellcasting.cantripsKnown.length > 0 && (
                    <>
                      <p className="character-sheet__subsection-title">
                        Cantrips
                      </p>
                      <ul className="character-sheet__list">
                        {sheet.spellcasting.cantripsKnown.map((spell) => (
                          <li key={spell.index}>{spell.name}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {sheet.spellcasting.spellsKnown.length > 0 && (
                    <>
                      <p className="character-sheet__subsection-title">
                        Spells Known
                      </p>
                      <ul className="character-sheet__list">
                        {sheet.spellcasting.spellsKnown.map((spell) => (
                          <li key={spell.index}>{spell.name}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </>
              ) : (
                <p className="character-sheet__empty-text">
                  Not a spellcaster yet.
                </p>
              )}
            </section>

            <section className="character-sheet__section">
              <h2 className="character-sheet__section-title">Notes</h2>
              <p className="character-sheet__empty-text">
                {sheet.notes || "No notes yet."}
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default CharacterSheetPage;
