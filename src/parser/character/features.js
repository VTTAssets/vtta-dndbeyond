import utils from "../../utils.js";
import parseTemplateString from "../templateStrings.js";

/**
 * Searches for selected options if a given feature provides choices to the user
 * @param {string} type character property: "class", "race" etc.
 * @param {object} feat options to search for
 */
let getChoice = (ddb, type, feat) => {
  const id = feat.id;

  /**
   * EXAMPLE: Totem Spirit: Bear
    componentId: 100
    componentTypeId: 12168134
    defaultSubtypes: []
    id: "3-0-43966541"
    isInfinite: false
    isOptional: false
    label: null
    optionValue: 177
    options: Array(5)
      0: {id: 177, label: "Bear", description: "<p>While raging, you have resistance to all damage…u tough enough to stand up to any punishment.</p>"}
      1: {id: 178, label: "Eagle", description: "<p>While you’re raging, other creatures have disad…tor who can weave through the fray with ease.</p>"}
      2: {id: 179, label: "Wolf", description: "<p>While you’re raging, your friends have advantag…it of the wolf makes you a leader of hunters.</p>"}
      3: {id: 180, label: "Elk", description: "<p>While you are raging and aren't wearing heavy a…t of the elk makes you extraordinarily swift.</p>"}
      4: {id: 181, label: "Tiger", description: "<p>While raging, you can add 10 feet to your long … The spirit of the tiger empowers your leaps.</p>"}
 */

  if (ddb.character.choices[type] && Array.isArray(ddb.character.choices[type])) {
    // find a choice in the related choices-array
    const choice = ddb.character.choices[type].find(
      (characterChoice) => characterChoice.componentId && characterChoice.componentId === id
    );

    // double-check if there are really choices in there and a choice is actually made
    if (choice !== undefined && choice.options && Array.isArray(choice.options) && choice.optionValue) {
      const option = choice.options.find((opt) => opt.id === choice.optionValue);
      if (option) return option;
    }
  }
  // we could not determine if there are any choices left
  return undefined;
};

function getDescription(ddb, character, feat) {
  let snippet = "";
  let description = "";
  if (feat.definition && feat.definition.snippet) {
    snippet = parseTemplateString(ddb, character, feat.definition.snippet, feat);
  } else {
    snippet = feat.snippet ? parseTemplateString(ddb, character, feat.snippet, feat) : "";
  }
  if (feat.definition && feat.definition.description) {
    description = parseTemplateString(ddb, character, feat.definition.description, feat);
  } else {
    description = feat.description ? parseTemplateString(ddb, character, feat.description, feat) : "";
  }
  return {
    value: description !== "" ? description + ((snippet !== "") ? "<h3>Summary</h3>" + snippet : "") : snippet,
    chat: snippet,
    unidentified: "",
  };
}

export default function parseFeatures(ddb, character) {
  let items = [];

  let characterClasses = ddb.character.classes;
  characterClasses.forEach((cls) => {
    let features = cls.definition.classFeatures.filter(
      (feat) =>
        feat.name !== "Proficiencies" &&
        feat.name !== "Ability Score Improvement" &&
        feat.requiredLevel <= cls.level &&
        !ddb.character.actions.class.some((action) => action.name === feat.name)
    );
    let source = cls.definition.name;

    features.forEach((feat) => {
      // filter proficiencies and Ability Score Improvement
      let item = {
        name: feat.name,
        type: "feat",
        data: JSON.parse(utils.getTemplate("feat")),
      };

      // Add choices to the textual description of that feat
      let choice = getChoice(ddb, "class", feat);
      if (choice) {
        item.name = choice.label ? `${item.name}: ${choice.label}` : item.name;
        feat.description = choice.description
          ? feat.description + "<h3>" + choice.label + "</h3>" + choice.description
          : feat.description;
      }

      item.data.description = getDescription(ddb, character, feat);
      item.data.source = source;

      items.push(item);
    });

    // subclasses
    if (cls.subclassDefinition && cls.subclassDefinition.classFeatures) {
      features = cls.subclassDefinition.classFeatures.filter(
        (feat) =>
          feat.name !== "Bonus Proficiency" &&
          feat.name !== "Ability Score Improvement" &&
          feat.requiredLevel <= cls.level
      );
      let subSource = cls.subclassDefinition.name;

      features.forEach((feat) => {
        // filter proficiencies and Ability Score Improvement
        let item = {
          name: feat.name,
          type: "feat",
          data: JSON.parse(utils.getTemplate("feat")),
        };

        // Add choices to the textual description of that feat
        let choice = getChoice(ddb, "class", feat);
        if (choice) {
          item.name = choice.label ? `${item.name}: ${choice.label}` : item.name;
          feat.description = choice.description
            ? feat.description + "<h3>" + choice.label + "</h3>" + choice.description
            : feat.description;
          feat.snippet = choice.description
            ? feat.snippet + "<h3>" + choice.label + "</h3>" + choice.description
            : feat.snippet;
        }

        item.data.description = getDescription(ddb, character, feat);
        item.data.source = subSource;

        items.push(item);
      });
    }
  });

  let feats = ddb.character.feats.filter(
    (feat) => !ddb.character.actions.feat.some((action) => action.name === feat.name)
  );
  feats.forEach((feat) => {
    let item = {
      name: feat.definition.name,
      type: "feat",
      data: JSON.parse(utils.getTemplate("feat")),
    };

    item.data.description = getDescription(ddb, character, feat);
    item.data.source = utils.parseSource(feat.definition);

    items.push(item);
  });

  ddb.character.race.racialTraits
    .filter(
      (trait) =>
        !["Ability Score Increase", "Age", "Alignment", "Size", "Speed", "Languages"].includes(trait.definition.name) &&
        !ddb.character.actions.race.some((action) => action.name === trait.definition.name)
    )
    .forEach((feat) => {
      let item = {
        name: feat.definition.name,
        type: "feat",
        data: JSON.parse(utils.getTemplate("feat")),
      };

      item.data.description = getDescription(ddb, character, feat);
      item.data.source = utils.parseSource(feat.definition);

      items.push(item);
    });

  return items;
}
