export const classes = [
  {
    id: 1,
    name: "Bard",
    preview:
      "A versatile spellcaster who uses music, words, and performance to inspire, manipulate, and support.",
    description:
      "Bards are creative, adaptable, and socially powerful characters who blend magic, support, and utility.",
    levels: {
      1: ["Spellcasting", "Bardic Inspiration"],
      2: ["Jack of All Trades", "Song of Rest"],
      3: ["Bard College", "Expertise"],
      4: ["Ability Score Improvement"],
    },
    subclasses: [
      {
        id: 1,
        name: "College of Glamour",
        preview:
          "A bardic path focused on enchantment, beauty, and Fey-inspired charm.",
        description:
          "Bards of Glamour captivate audiences and wield presence like a weapon.",
        levels: {
          3: ["Mantle of Inspiration", "Enthralling Performance"],
          6: ["Mantle of Majesty"],
          14: ["Unbreakable Majesty"],
        },
      },
      {
        id: 2,
        name: "College of Creation",
        preview:
          "A creative bard who channels the magic of song into tangible creation.",
        description:
          "These bards shape possibility itself through artistic expression.",
        levels: {
          3: ["Mote of Potential", "Performance of Creation"],
          6: ["Animating Performance"],
          14: ["Creative Crescendo"],
        },
      },
    ],
  },
];
