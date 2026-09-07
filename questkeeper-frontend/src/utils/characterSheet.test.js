import { describe, it, expect } from "vitest";
import {
  getAbilityModifier,
  getProficiencyBonus,
  applyRaceBonuses,
  getStartingHitPoints,
  getStartingArmorClass,
  applyAbilityScoreChoice,
  finalizeLevelUp,
} from "./characterSheet";

describe("getAbilityModifier", () => {
  it("matches the 5e modifier table", () => {
    expect(getAbilityModifier(10)).toBe(0);
    expect(getAbilityModifier(11)).toBe(0);
    expect(getAbilityModifier(8)).toBe(-1);
    expect(getAbilityModifier(15)).toBe(2);
    expect(getAbilityModifier(20)).toBe(5);
  });
});

describe("getProficiencyBonus", () => {
  it("matches the 5e proficiency bonus table", () => {
    expect(getProficiencyBonus(1)).toBe(2);
    expect(getProficiencyBonus(4)).toBe(2);
    expect(getProficiencyBonus(5)).toBe(3);
    expect(getProficiencyBonus(9)).toBe(4);
    expect(getProficiencyBonus(17)).toBe(6);
  });
});

describe("getStartingHitPoints", () => {
  it("adds the CON modifier to the hit die", () => {
    expect(getStartingHitPoints(8, 2)).toBe(10);
  });

  it("never goes below 1, even with a very negative modifier", () => {
    expect(getStartingHitPoints(4, -6)).toBe(1);
  });
});

describe("getStartingArmorClass", () => {
  it("is 10 plus the DEX modifier", () => {
    expect(getStartingArmorClass(3)).toBe(13);
    expect(getStartingArmorClass(-1)).toBe(9);
  });
});

describe("applyRaceBonuses", () => {
  const baseScores = {
    strength: 15,
    dexterity: 14,
    constitution: 13,
    intelligence: 12,
    wisdom: 10,
    charisma: 8,
  };

  it("applies flat ability score increases (e.g. Human)", () => {
    const human = {
      abilityScoreIncreases: {
        strength: 1,
        dexterity: 1,
        constitution: 1,
        intelligence: 1,
        wisdom: 1,
        charisma: 1,
      },
    };

    expect(applyRaceBonuses(baseScores, human).charisma).toBe(9);
  });

  it("applies chosen flexible bonuses on top of flat ones (e.g. Half-Elf)", () => {
    const halfElf = {
      abilityScoreIncreases: { charisma: 2 },
      abilityScoreChoice: {
        choose: 2,
        options: [
          { ability: "strength", bonus: 1 },
          { ability: "wisdom", bonus: 1 },
        ],
      },
    };

    const result = applyRaceBonuses(baseScores, halfElf, [
      "strength",
      "wisdom",
    ]);

    expect(result.charisma).toBe(10);
    expect(result.strength).toBe(16);
    expect(result.wisdom).toBe(11);
  });
});

describe("applyAbilityScoreChoice", () => {
  const scores = { strength: 15, dexterity: 14, constitution: 13 };

  it("adds +2 to one ability for asi-one", () => {
    const result = applyAbilityScoreChoice(scores, {
      type: "asi-one",
      ability: "strength",
    });
    expect(result.strength).toBe(17);
  });

  it("adds +1 each to two abilities for asi-two", () => {
    const result = applyAbilityScoreChoice(scores, {
      type: "asi-two",
      abilities: ["dexterity", "constitution"],
    });
    expect(result.dexterity).toBe(15);
    expect(result.constitution).toBe(14);
  });

  it("returns an unchanged copy when there's no choice (feat instead)", () => {
    expect(applyAbilityScoreChoice(scores, null)).toEqual(scores);
  });
});

describe("finalizeLevelUp", () => {
  function makeSheet() {
    return {
      level: 1,
      abilityScores: { constitution: 14 }, // +2 modifier
      class: { spellcastingType: "known" },
      spellcasting: null,
      feats: [],
      combat: {
        hitPoints: { max: 8, current: 8, temporary: 0 },
        hitDice: { total: 1, remaining: 1, die: 6 },
        hpHistory: [],
      },
      pendingLevelUp: {
        targetLevel: 2,
        steps: [
          { key: "hitPoints", data: { amount: 4 } },
          {
            key: "spells",
            data: {
              spellIndex: "fire-bolt",
              spellName: "Fire Bolt",
              spellLevel: 0,
            },
          },
        ],
      },
    };
  }

  it("adds hit points (roll/average + CON modifier) and increments hit dice", () => {
    const result = finalizeLevelUp(makeSheet());

    expect(result.combat.hitPoints.max).toBe(14); // 8 + (4 + 2)
    expect(result.combat.hitDice.total).toBe(2);
    expect(result.level).toBe(2);
  });

  it("adds a new cantrip to cantripsKnown, not spellsKnown", () => {
    const result = finalizeLevelUp(makeSheet());

    expect(result.spellcasting.cantripsKnown).toHaveLength(1);
    expect(result.spellcasting.spellsKnown).toHaveLength(0);
    expect(result.spellcasting.cantripsKnown[0].name).toBe("Fire Bolt");
  });

  it("clears pendingLevelUp once applied", () => {
    const result = finalizeLevelUp(makeSheet());
    expect(result.pendingLevelUp).toBeNull();
  });
});
