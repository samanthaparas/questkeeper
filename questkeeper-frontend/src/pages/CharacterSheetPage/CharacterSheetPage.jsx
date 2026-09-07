import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCharacter, saveCharacter } from "../../utils/characterStore";
import {
  ABILITY_SCORES,
  ABILITY_ABBREVIATIONS,
  SKILLS,
  getAbilityModifier,
  getSkillModifier,
  getProficiencyBonus,
  buildLevelUpSummary,
  createResource,
  setResourceCurrent,
  removeResource,
  setCurrentHp,
  applyRest,
  createEquipmentItem,
  removeEquipmentItem,
  createFeat,
  removeFeat,
  addManualSpell,
  removeSpell,
  getSpellSlots,
  setSpellSlot,
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
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [newEquipmentQuantity, setNewEquipmentQuantity] = useState("");
  const [newEquipmentDescription, setNewEquipmentDescription] = useState("");
  const [newFeatName, setNewFeatName] = useState("");
  const [newFeatDescription, setNewFeatDescription] = useState("");
  const [newSpellName, setNewSpellName] = useState("");
  const [newSpellLevel, setNewSpellLevel] = useState("0");

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

  function handleLevelChange(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    persistSheet({ ...sheet, level: numeric });
  }

  function handleArmorClassChange(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    persistSheet({
      ...sheet,
      combat: { ...sheet.combat, armorClass: numeric },
    });
  }

  function handleInitiativeChange(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    persistSheet({
      ...sheet,
      combat: { ...sheet.combat, initiative: numeric },
    });
  }

  function handleSpeedChange(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    persistSheet({ ...sheet, combat: { ...sheet.combat, speed: numeric } });
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

  function handleMaxHpChange(value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    persistSheet({
      ...sheet,
      combat: {
        ...sheet.combat,
        hitPoints: { ...sheet.combat.hitPoints, max: numeric },
      },
    });
  }

  function handleHitDiceChange(field, value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    persistSheet({
      ...sheet,
      combat: {
        ...sheet.combat,
        hitDice: { ...sheet.combat.hitDice, [field]: numeric },
      },
    });
  }

  function handleAbilityScoreChange(ability, value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    persistSheet({
      ...sheet,
      abilityScores: { ...sheet.abilityScores, [ability]: numeric },
    });
  }

  function handleNotesChange(value) {
    persistSheet({ ...sheet, notes: value });
  }

  function handleCompanionChange(value) {
    persistSheet({ ...sheet, companion: value });
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

  function handleAddEquipment(e) {
    e.preventDefault();
    if (!newEquipmentName.trim()) return;

    const item = createEquipmentItem({
      name: newEquipmentName.trim(),
      quantity: Number(newEquipmentQuantity) || 1,
      description: newEquipmentDescription.trim(),
    });

    persistSheet({ ...sheet, equipment: [...(sheet.equipment ?? []), item] });

    setNewEquipmentName("");
    setNewEquipmentQuantity("");
    setNewEquipmentDescription("");
  }

  function handleRemoveEquipment(index) {
    persistSheet({
      ...sheet,
      equipment: removeEquipmentItem(sheet.equipment, index),
    });
  }

  function handleAddFeat(e) {
    e.preventDefault();
    if (!newFeatName.trim()) return;

    const feat = createFeat({
      name: newFeatName.trim(),
      description: newFeatDescription.trim(),
    });

    persistSheet({ ...sheet, feats: [...(sheet.feats ?? []), feat] });

    setNewFeatName("");
    setNewFeatDescription("");
  }

  function handleRemoveFeat(index) {
    persistSheet({ ...sheet, feats: removeFeat(sheet.feats, index) });
  }

  function handleAddSpell(e) {
    e.preventDefault();
    if (!newSpellName.trim()) return;

    const spellcasting = addManualSpell(sheet, {
      name: newSpellName.trim(),
      level: newSpellLevel,
    });

    persistSheet({ ...sheet, spellcasting });

    setNewSpellName("");
    setNewSpellLevel("0");
  }

  function handleRemoveSpell(listKey, index) {
    persistSheet({
      ...sheet,
      spellcasting: removeSpell(sheet.spellcasting, listKey, index),
    });
  }

  function handleSpellSlotChange(level, field, value) {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;

    persistSheet({
      ...sheet,
      spellcasting: setSpellSlot(sheet.spellcasting, level, field, numeric),
    });
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
                onClick={() => handleRest("long")}
              >
                Long Rest
              </button>
            </div>

            <div className="character-sheet__layout">
              <div className="character-sheet__main">
                <section className="character-sheet__stat-row">
                  <div className="character-sheet__stat-box">
                    <span className="character-sheet__stat-label">Level</span>
                    <input
                      type="number"
                      className="character-sheet__stat-input"
                      value={sheet.level}
                      onChange={(e) => handleLevelChange(e.target.value)}
                      min={1}
                      max={20}
                    />
                  </div>
                  <div className="character-sheet__stat-box">
                    <span className="character-sheet__stat-label">
                      Armor Class
                    </span>
                    <input
                      type="number"
                      className="character-sheet__stat-input"
                      value={combat.armorClass}
                      onChange={(e) => handleArmorClassChange(e.target.value)}
                      min={0}
                    />
                  </div>
                  <div className="character-sheet__stat-box">
                    <span className="character-sheet__stat-label">
                      Initiative
                    </span>
                    <input
                      type="number"
                      className="character-sheet__stat-input"
                      value={combat.initiative}
                      onChange={(e) => handleInitiativeChange(e.target.value)}
                    />
                  </div>
                  <div className="character-sheet__stat-box">
                    <span className="character-sheet__stat-label">Speed</span>
                    <span className="character-sheet__stat-value character-sheet__hp-value">
                      <input
                        type="number"
                        className="character-sheet__hp-input"
                        value={combat.speed}
                        onChange={(e) => handleSpeedChange(e.target.value)}
                        min={0}
                      />
                      {" ft"}
                    </span>
                  </div>
                  <div className="character-sheet__stat-box">
                    <span className="character-sheet__stat-label">
                      Hit Dice
                    </span>
                    <span className="character-sheet__stat-value character-sheet__hp-value">
                      <input
                        type="number"
                        className="character-sheet__hp-input character-sheet__hp-input--tiny"
                        value={combat.hitDice.total}
                        onChange={(e) =>
                          handleHitDiceChange("total", e.target.value)
                        }
                        min={0}
                      />
                      d
                      <input
                        type="number"
                        className="character-sheet__hp-input character-sheet__hp-input--tiny"
                        value={combat.hitDice.die ?? ""}
                        onChange={(e) =>
                          handleHitDiceChange("die", e.target.value)
                        }
                        min={1}
                      />
                    </span>
                  </div>
                  <div className="character-sheet__stat-box">
                    <span className="character-sheet__stat-label">
                      Hit Points
                    </span>
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
                      <input
                        type="number"
                        className="character-sheet__hp-input"
                        value={combat.hitPoints.max}
                        onChange={(e) => handleMaxHpChange(e.target.value)}
                        min={0}
                      />
                      {combat.hitPoints.temporary > 0 &&
                        ` (+${combat.hitPoints.temporary})`}
                    </span>
                  </div>
                  <div className="character-sheet__stat-box">
                    <span className="character-sheet__stat-label">
                      Proficiency
                    </span>
                    <span className="character-sheet__stat-value">
                      +{proficiencyBonus}
                    </span>
                  </div>
                </section>

                <section className="character-sheet__abilities">
                  {ABILITY_SCORES.map((ability) => {
                    const score = sheet.abilityScores[ability];
                    const modifier = getAbilityModifier(score);
                    const isSaveProficient = sheet.savingThrows[ability];
                    const saveBonus =
                      modifier + (isSaveProficient ? proficiencyBonus : 0);

                    return (
                      <div
                        className="character-sheet__ability-card"
                        key={ability}
                      >
                        <span className="character-sheet__ability-name">
                          {ABILITY_ABBREVIATIONS[ability]}
                        </span>
                        <input
                          type="number"
                          className="character-sheet__ability-input"
                          value={score}
                          onChange={(e) =>
                            handleAbilityScoreChange(ability, e.target.value)
                          }
                          min={1}
                          max={30}
                        />
                        <span className="character-sheet__ability-modifier">
                          {formatModifier(modifier)}
                        </span>
                        <span
                          className={`character-sheet__ability-save-badge${
                            isSaveProficient
                              ? ""
                              : " character-sheet__ability-save-badge--plain"
                          }`}
                        >
                          Save {formatModifier(saveBonus)}
                        </span>
                      </div>
                    );
                  })}
                </section>

                <section className="character-sheet__section">
                  <h2 className="character-sheet__section-title">Resources</h2>
                  {(sheet.resources ?? []).length === 0 ? (
                    <p className="character-sheet__empty-text">
                      No tracked resources yet. Add one below for anything with
                      limited uses - Channel Divinity, Lay on Hands, spell
                      slots, whatever you need.
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
                  {(sheet.equipment ?? []).length === 0 ? (
                    <p className="character-sheet__empty-text">
                      No equipment recorded yet.
                    </p>
                  ) : (
                    <ul className="character-sheet__resource-list">
                      {sheet.equipment.map((item) => (
                        <li
                          className="character-sheet__resource-row"
                          key={item.index}
                        >
                          <span className="character-sheet__resource-name">
                            {item.name}
                            {item.quantity > 1 ? ` x${item.quantity}` : ""}
                            {item.description && (
                              <span className="character-sheet__item-description">
                                {item.description}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            className="character-sheet__resource-remove"
                            onClick={() => handleRemoveEquipment(item.index)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    className="character-sheet__resource-form"
                    onSubmit={handleAddEquipment}
                  >
                    <input
                      type="text"
                      className="character-sheet__resource-form-input"
                      placeholder="Item name (e.g. Night Terror Longsword)"
                      value={newEquipmentName}
                      onChange={(e) => setNewEquipmentName(e.target.value)}
                    />
                    <input
                      type="number"
                      className="character-sheet__resource-form-input character-sheet__resource-form-input--small"
                      placeholder="Qty"
                      value={newEquipmentQuantity}
                      onChange={(e) => setNewEquipmentQuantity(e.target.value)}
                      min={1}
                    />
                    <input
                      type="text"
                      className="character-sheet__resource-form-input character-sheet__resource-form-input--wide"
                      placeholder="Description (optional)"
                      value={newEquipmentDescription}
                      onChange={(e) =>
                        setNewEquipmentDescription(e.target.value)
                      }
                    />
                    <button
                      type="submit"
                      className="character-sheet__resource-add-button"
                    >
                      Add Item
                    </button>
                  </form>
                </section>

                <section className="character-sheet__section">
                  <h2 className="character-sheet__section-title">Feats</h2>
                  {(sheet.feats?.length ?? 0) === 0 ? (
                    <p className="character-sheet__empty-text">No feats yet.</p>
                  ) : (
                    <ul className="character-sheet__resource-list">
                      {sheet.feats.map((feat) => (
                        <li
                          className="character-sheet__resource-row"
                          key={feat.index}
                        >
                          <span className="character-sheet__resource-name">
                            {feat.name}
                            {feat.description && (
                              <span className="character-sheet__item-description">
                                {feat.description}
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            className="character-sheet__resource-remove"
                            onClick={() => handleRemoveFeat(feat.index)}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form
                    className="character-sheet__resource-form"
                    onSubmit={handleAddFeat}
                  >
                    <input
                      type="text"
                      className="character-sheet__resource-form-input"
                      placeholder="Feat name (e.g. Shield Master)"
                      value={newFeatName}
                      onChange={(e) => setNewFeatName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="character-sheet__resource-form-input character-sheet__resource-form-input--wide"
                      placeholder="Description (optional)"
                      value={newFeatDescription}
                      onChange={(e) => setNewFeatDescription(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="character-sheet__resource-add-button"
                    >
                      Add Feat
                    </button>
                  </form>
                </section>

                <section className="character-sheet__section">
                  <h2 className="character-sheet__section-title">
                    Spellcasting
                  </h2>
                  {sheet.spellcasting ? (
                    <>
                      <p className="character-sheet__subsection-title">
                        Spell Slots
                      </p>
                      <ul className="character-sheet__spell-slots-grid">
                        {getSpellSlots(sheet.spellcasting).map((slot) => (
                          <li
                            className="character-sheet__spell-slot-card"
                            key={slot.level}
                          >
                            <span className="character-sheet__spell-slot-label">
                              Level {slot.level}
                            </span>
                            <span className="character-sheet__spell-slot-count">
                              <input
                                type="number"
                                className="character-sheet__hp-input character-sheet__hp-input--tiny"
                                value={slot.current}
                                onChange={(e) =>
                                  handleSpellSlotChange(
                                    slot.level,
                                    "current",
                                    e.target.value,
                                  )
                                }
                                min={0}
                                max={slot.max}
                              />
                              {" / "}
                              <input
                                type="number"
                                className="character-sheet__hp-input character-sheet__hp-input--tiny"
                                value={slot.max}
                                onChange={(e) =>
                                  handleSpellSlotChange(
                                    slot.level,
                                    "max",
                                    e.target.value,
                                  )
                                }
                                min={0}
                              />
                            </span>
                          </li>
                        ))}
                      </ul>

                      {sheet.spellcasting.cantripsKnown.length > 0 && (
                        <>
                          <p className="character-sheet__subsection-title">
                            Cantrips
                          </p>
                          <ul className="character-sheet__resource-list">
                            {sheet.spellcasting.cantripsKnown.map((spell) => (
                              <li
                                className="character-sheet__resource-row"
                                key={spell.index}
                              >
                                <span className="character-sheet__resource-name">
                                  {spell.name}
                                </span>
                                <button
                                  type="button"
                                  className="character-sheet__resource-remove"
                                  onClick={() =>
                                    handleRemoveSpell(
                                      "cantripsKnown",
                                      spell.index,
                                    )
                                  }
                                >
                                  Remove
                                </button>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {sheet.spellcasting.spellsKnown.length > 0 && (
                        <>
                          <p className="character-sheet__subsection-title">
                            Spells Known
                          </p>
                          <ul className="character-sheet__resource-list">
                            {[...sheet.spellcasting.spellsKnown]
                              .sort((a, b) => (a.level ?? 0) - (b.level ?? 0))
                              .map((spell) => (
                                <li
                                  className="character-sheet__resource-row"
                                  key={spell.index}
                                >
                                  <span className="character-sheet__resource-name">
                                    {spell.name}
                                    {spell.level != null && (
                                      <span className="character-sheet__item-description">
                                        Level {spell.level}
                                      </span>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    className="character-sheet__resource-remove"
                                    onClick={() =>
                                      handleRemoveSpell(
                                        "spellsKnown",
                                        spell.index,
                                      )
                                    }
                                  >
                                    Remove
                                  </button>
                                </li>
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

                  <form
                    className="character-sheet__resource-form"
                    onSubmit={handleAddSpell}
                  >
                    <input
                      type="text"
                      className="character-sheet__resource-form-input"
                      placeholder="Spell name (e.g. Bless)"
                      value={newSpellName}
                      onChange={(e) => setNewSpellName(e.target.value)}
                    />
                    <select
                      className="character-sheet__resource-form-select"
                      value={newSpellLevel}
                      onChange={(e) => setNewSpellLevel(e.target.value)}
                    >
                      <option value="0">Cantrip</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          Level {lvl}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="character-sheet__resource-add-button"
                    >
                      Add Spell
                    </button>
                  </form>
                </section>

                <section className="character-sheet__section">
                  <h2 className="character-sheet__section-title">Companion</h2>
                  <textarea
                    className="character-sheet__textarea"
                    value={sheet.companion ?? ""}
                    onChange={(e) => handleCompanionChange(e.target.value)}
                    placeholder="Mount or companion - name, description, stats, anything you want to remember"
                    rows={3}
                  />
                </section>

                <section className="character-sheet__section">
                  <h2 className="character-sheet__section-title">Notes</h2>
                  <textarea
                    className="character-sheet__textarea"
                    value={sheet.notes ?? ""}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Anything you want to remember"
                    rows={4}
                  />
                </section>
              </div>

              <aside className="character-sheet__sidebar">
                <section className="character-sheet__section">
                  <h2 className="character-sheet__section-title">Skills</h2>
                  <ul className="character-sheet__skills-list">
                    {SKILLS.map((skill) => {
                      const isProficient = Boolean(sheet.skills?.[skill.index]);
                      const modifier = getSkillModifier(
                        sheet.abilityScores[skill.ability],
                        isProficient,
                        proficiencyBonus,
                      );

                      return (
                        <li
                          className={`character-sheet__skill-row${
                            isProficient
                              ? " character-sheet__skill-row--proficient"
                              : ""
                          }`}
                          key={skill.index}
                        >
                          <span className="character-sheet__skill-name">
                            {skill.name}
                          </span>
                          <span className="character-sheet__skill-ability">
                            {ABILITY_ABBREVIATIONS[skill.ability]}
                          </span>
                          <span className="character-sheet__skill-modifier">
                            {formatModifier(modifier)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </aside>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default CharacterSheetPage;
