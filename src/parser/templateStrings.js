import utils from "../utils.js";

/**
 * Look up a component by id
 * For now we assume that most features we are going to want to get a scaling value
 * from are character options
 * @param {*} ddb
 * @param {*} featureId
 */
const findComponentByComponentId = (ddb, componentId) => {
  let result;
  ddb.character.classes.forEach((cls) => {
    const feature = cls.classFeatures.find((component) => component.definition.id === componentId);
    if (feature) result = feature;
  });
  return result;
};

/**
 * Gets the levelscaling value for a feature
 * @param {*} feature
 */
const getScalingValue = (feature) => {
  if (feature && feature.levelScale && feature.levelScale.fixedValue) {
    return feature.levelScale.fixedValue;
  } else if (feature && feature.levelScale && feature.levelScale.dice) {
    return feature.levelScale.dice.diceString;
  } else {
    return "{{scalevalue-unknown}}";
  }
};

/**
 * Parse a match and replace template values ready for evaluation
 * @param {*} ddb
 * @param {*} character
 * @param {*} match
 * @param {*} feature
 */
let parseMatch = (ddb, character, match, feature) => {
  const splitMatchAt = match.split("@");
  let result = splitMatchAt[0];

  // scalevalue
  if (result.includes("scalevalue")) {
    const feat = feature.levelScale ? feature : findComponentByComponentId(ddb, feature.componentId);
    const scaleValue = getScalingValue(feat);
    result = result.replace("scalevalue", scaleValue);
  }

  // savedc:int
  if (result.includes("savedc")) {
    const regexp = /savedc:([a-z]{3})/g;
    // creates array from match groups and dedups
    const saves = [...new Set(Array.from(result.matchAll(regexp), (m) => m[1]))];

    saves.forEach((save) => {
      const abilityModifier = utils.calculateModifier(character.data.abilities[save].value);
      // not sure if we should add this, probably not.
      // const bonus = utils.getModifierSum(utils.filterBaseModifiers(ddb, "bonus", "spell-save-dc"), character);
      const dc = 8 + character.data.attributes.prof + abilityModifier;
      const saveRegexp = RegExp(`savedc:${save}`, "g");
      result = result.replace(saveRegexp, dc);
    });
  }

  // modifier:int@min:1
  // (modifier:cha)+1
  if (result.includes("modifier")) {
    const regexp = /modifier:([a-z]{3})/g;
    // creates array from match groups and dedups
    const mods = [...new Set(Array.from(result.matchAll(regexp), (m) => m[1]))];

    mods.forEach((mod) => {
      const abilityModifier = utils.calculateModifier(character.data.abilities[mod].value);
      const modRegexp = RegExp(`modifier:${mod}`, "g");
      result = result.replace(modRegexp, abilityModifier);
    });
  }

  // classlevel*5
  // (classlevel/2)@roundup
  if (result.includes("classlevel")) {
    const cls = utils.findClassByFeatureId(ddb, feature.componentId);
    if (cls) {
      result = result.replace("classlevel", cls.level);
    } else {
      // still not found a cls? could be an option
      const classOption = [ddb.character.options.race, ddb.character.options.class, ddb.character.options.feat]
        .flat()
        .find((option) => option.definition.id === feature.componentId);
      const optionCls = utils.findClassByFeatureId(ddb, classOption.componentId);
      if (optionCls) {
        result = result.replace("classlevel", optionCls.level);
      } else {
        console.error("Unable to parse option class info, please log a bug report");
      }
    }
  }

  return result;
};

/**
 * Apply the expression constraint
 * @param {*} value
 * @param {*} constraint
 */
const applyConstraint = (value, constraint) => {
  // @ features
  // @roundup
  // @roundown
  // min:1
  // max:3
  const splitConstraint = constraint.split(":");
  const match = splitConstraint[0];

  let result = value;

  if (splitConstraint.length > 1) {
    switch (match) {
      case "max": {
        if (splitConstraint[1] < result) result = splitConstraint[1];
        break;
      }
      case "min": {
        if (splitConstraint[1] > result) result = splitConstraint[1];
        break;
      }
      default: {
        console.log(`Missed match is ${match}`);
        console.warn(`vtta-dndbeyond does not know about template constraint {{@${constraint}}}. Please log a bug.`);
      }
    }
  } else {
    switch (match) {
      case "roundup": {
        result = Math.ceil(result);
        break;
      }
      case "rounddown":
      case "roundown": {
        result = Math.floor(result);
        break;
      }
      default: {
        console.warn(`vtta-dndbeyond does not know about template constraint {{@${constraint}}}. Please log a bug.`);
      }
    }
  }

  return result;
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

/**
 * This will parse a snippet/description with template boilerplate in from DDB.
 * e.g. Each creature in the area must make a DC {{savedc:con}} saving throw.
 * @param {*} ddb
 * @param {*} text
 */
export default function parseTemplateString(ddb, character, text, feature) {
  if (!text) return text;
  let result = text;

  const regexp = /{{(.*?)}}/g;
  // creates array from match groups and dedups
  const matches = [...new Set(Array.from(result.matchAll(regexp), (m) => m[1]))];

  matches.forEach((match) => {
    const replacePattern = new RegExp(`{{${escapeRegExp(match)}}}`, "g");
    const splitRemoveUnsigned = match.split("#")[0];
    const splitMatchAt = splitRemoveUnsigned.split("@");
    const parsedMatch = parseMatch(ddb, character, splitRemoveUnsigned, feature);
    const dicePattern = /\d*d\d\d*/;
    // do we have a dice string, e.g. sneak attack?
    if (parsedMatch.match(dicePattern)) {
      result = result.replace(replacePattern, parsedMatch);
    } else {
      // we try and eval the expression!
      try {
        /* eslint-disable no-eval */
        // eval is bad, it's quite slow and risky, however it avoids having to write a string parsing engine
        const evalMatch = eval(parsedMatch);
        /* eslint-enable no-eval */
        if (splitMatchAt.length > 1) {
          const constraintAdjusted = applyConstraint(evalMatch, splitMatchAt[1]);
          result = result.replace(replacePattern, constraintAdjusted);
        } else {
          result = result.replace(replacePattern, evalMatch);
        }
      } catch (err) {
        console.error(err);
        result = result.replace(replacePattern, `{{${match}}}`);
        console.warn(`vtta-dndbeyond does not know about template value {{${match}}}. Please log a bug.`);
      }
    }
  });

  return result;
}
