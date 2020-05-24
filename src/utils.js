import { DND5E } from "../../../systems/dnd5e/module/config.js";
import DirectoryPicker from "./lib/DirectoryPicker.js";

let utils = {
  debug: () => {
    return true;
  },

  findByProperty: (arr, property, searchString) => {
    function levenshtein(a, b) {
      var tmp;
      if (a.length === 0) {
        return b.length;
      }
      if (b.length === 0) {
        return a.length;
      }
      if (a.length > b.length) {
        tmp = a;
        a = b;
        b = tmp;
      }

      var i,
        j,
        res,
        alen = a.length,
        blen = b.length,
        row = Array(alen);
      for (i = 0; i <= alen; i++) {
        row[i] = i;
      }

      for (i = 1; i <= blen; i++) {
        res = i;
        for (j = 1; j <= alen; j++) {
          tmp = row[j - 1];
          row[j - 1] = res;
          res = b[i - 1] === a[j - 1] ? tmp : Math.min(tmp + 1, Math.min(res + 1, row[j] + 1));
        }
      }
      return res;
    }

    const maxDistance = 3;
    let minDistance = 100;
    let nearestHit = undefined;
    let nearestDistance = minDistance;

    if (!Array.isArray(arr)) return undefined;
    arr
      .filter((entry) => entry.hasOwnProperty(property))
      .forEach((entry) => {
        let distance = levenshtein(searchString, entry[property]);
        if (distance < nearestDistance && distance <= maxDistance && distance < minDistance) {
          nearestHit = entry;
          nearestDistance = distance;
        }
      });

    return nearestHit;
  },

  hasChosenCharacterOption: (data, optionName) => {
    const classOptions = [data.character.options.race, data.character.options.class, data.character.options.feat]
      .flat()
      .find((option) => option.definition.name === optionName);
    return !!classOptions;
  },

  getActiveItemModifiers: (data) => {
    // get items we are going to interact on
    const modifiers = data.character.inventory
      .filter(
        (item) =>
          ((!item.definition.canEquip && !item.definition.canAttune) || // if item just gives a thing
          (item.isAttuned && item.equipped) || // if it is attuned and equipped
          (item.isAttuned && !item.definition.canEquip) || // if it is attuned but can't equip
            (!item.definition.canAttune && item.equipped)) && // can't attune but is equipped
          item.definition.grantedModifiers.length > 0
      )
      .flatMap((item) => item.definition.grantedModifiers);

    return modifiers;
  },

  filterModifiers: (modifiers, type, subType = null, restriction = ["", null]) => {
    return modifiers
      .flat()
      .filter(
        (modifier) =>
          modifier.type === type &&
          (subType !== null ? modifier.subType === subType : true) &&
          restriction.includes(modifier.restriction)
      );
  },

  filterBaseModifiers: (data, type, subType = null, restriction = ["", null]) => {
    const modifiers = [
      data.character.modifiers.class,
      data.character.modifiers.race,
      data.character.modifiers.background,
      data.character.modifiers.feat,
      utils.getActiveItemModifiers(data),
    ];

    return utils.filterModifiers(modifiers, type, subType, restriction);
  },

  findClassByFeatureId: (data, featureId) => {
    const cls = data.character.classes.find((cls) => {
      let classFeatures = cls.classFeatures;
      if (cls.subclassDefinition && cls.subclassDefinition.classFeatures) {
        classFeatures = classFeatures.concat(cls.subclassDefinition.classFeatures);
      }
      return classFeatures.find((feature) => feature.id === featureId) !== undefined;
    });
    return cls;
  },

  calculateModifier: (val) => {
    return Math.floor((val - 10) / 2);
  },

  parseDiceString: (str, mods = "") => {
    // sanitizing possible inputs a bit
    str = str.toLowerCase().replace(/-–−/g, "-").replace(/\s/g, "");

    // all found dice strings, e.g. 1d8, 4d6
    let dice = [];
    // all bonuses, e.g. -1+8
    let bonuses = [];

    while (str.search(/[+-]*\d+d?\d*/) !== -1) {
      const result = str.match(/([+-]*)(\d+)(d?)(\d*)/);
      str = str.replace(result[0], "");

      // sign. We only take the sign standing exactly in front of the dice string
      // so +-1d8 => -1d8. Just as a failsave
      const sign = result[1] === "" ? "+" : result[1].substr(result[1].length - 1, 1);
      const count = result[2];
      const die = result[4];

      if (result[3] === "d") {
        dice.push({
          sign: sign,
          count: parseInt(sign + count),
          die: parseInt(die),
        });
      } else {
        bonuses.push({
          sign: sign,
          count: parseInt(sign + count),
        });
      }
      // sorting dice by die, then by sign
      dice = dice.sort((a, b) => {
        if (a.die < b.die) return -1;
        if (a.die > b.die) return 1;
        if (a.sign === b.sign) {
          if (a.count < b.count) return -1;
          if (a.count > b.count) return 1;
          return 0;
        } else {
          return a.sign === "+" ? -1 : 1;
        }
      });
    }

    // sum up the bonus
    let bonus = bonuses.reduce((prev, cur) => prev + cur.count, 0);

    // group the dice, so that all the same dice are summed up if they have the same sign
    // e.g.
    // +1d8+2d8 => 3d8
    // +1d8-2d8 => +1d8 -2d8 will remain as-is
    for (let i = 0; i < dice.length - 1; i++) {
      let cur = dice[i];
      let next = i <= dice.length - 1 ? dice[i + 1] : { sign: "+", count: 0, die: cur.die };
      if (cur.die === next.die && cur.sign === next.sign) {
        cur.count += next.count;
        dice.splice(i + 1, 1);
        i--;
      }
    }

    const diceString = dice.reduce((prev, cur) => {
      return (
        prev + " " + (cur.count >= 0 && prev !== "" ? `${cur.sign}${cur.count}d${cur.die}` : `${cur.count}d${cur.die}`)
      );
    }, "");
    const resultBonus = bonus === 0 ? "" : bonus > 0 ? ` + ${bonus}` : ` ${bonus}`;

    const result = {
      dice: dice,
      bonus: bonus,
      diceString: (diceString + mods + resultBonus).trim(),
    };
    return result;
  },
  /**
       * Tries to reverse-match a given string to a given DND5E configuration value, e.g.
       *
       * DND5E.armorProficiencies = {
          "lgt": "Light Armor",
          "med": "Medium Armor",
          "hvy": "Heavy Armor",
          "shl": "Shields"
         };

       * findInConfig('armorProficiencies', 'Medium Armor') returns 'med'
       */
  findInConfig: (section, value) => {
    value = value.toLowerCase();
    if (DND5E.hasOwnProperty(section)) {
      for (let property in DND5E[section]) {
        if (value == DND5E[section][property].toLowerCase()) {
          return property;
        }
      }
    }
    return undefined;
  },

  capitalize: (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  },

  // DEVELOPMENT FUNCTION
  // loads a character.json from a file in the file system
  loadFromFile: (filename) => {
    return require(`./input/${filename}.json`);
  },

  // checks for a given file
  serverFileExists: (path) => {
    return new Promise((resolve, reject) => {
      let http = new XMLHttpRequest();
      http.open("HEAD", path);
      http.onreadystatechange = function () {
        if (this.readyState == this.DONE) {
          if (this.status !== 404) {
            resolve(path);
          } else {
            reject(path);
          }
        }
      };
    });
  },

  getTemplate: (type) => {
    let isObject = (item) => {
      return item && typeof item === "object" && !Array.isArray(item);
    };

    let mergeDeep = (target, source) => {
      let output = Object.assign({}, target);
      if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
          if (isObject(source[key])) {
            if (!(key in target)) Object.assign(output, { [key]: source[key] });
            else output[key] = mergeDeep(target[key], source[key]);
          } else {
            Object.assign(output, { [key]: source[key] });
          }
        });
      }
      return output;
    };
    let filterDeprecated = (data) => {
      for (let prop in data) {
        if (data[prop] && data[prop].hasOwnProperty("_deprecated") && data[prop]["_deprecated"] === true) {
          delete data[prop];
        }
        if (prop === "_deprecated" && data[prop] === true) {
          delete data[prop];
        }
      }
      return data;
    };

    let templates = game.data.system.template;
    for (let entityType in templates) {
      if (
        templates[entityType].types &&
        Array.isArray(templates[entityType].types) &&
        templates[entityType].types.includes(type)
      ) {
        let obj = mergeDeep({}, filterDeprecated(templates[entityType][type]));
        if (obj.templates) {
          obj.templates.forEach((tpl) => {
            obj = mergeDeep(obj, filterDeprecated(templates[entityType].templates[tpl]));
          });
          delete obj.templates;
        }
        // store the result as JSON for easy cloning
        return JSON.stringify(obj);
      }
    }
    return undefined;
  },

  uploadImage: async function (url, targetDirectory, baseFilename) {
    async function download(url) {
      return new Promise((resolve, reject) => {
        try {
          let req = new XMLHttpRequest();
          req.open("GET", url);
          req.responseType = "blob";
          req.onerror = () => reject("Network error");
          req.onload = () => {
            if (req.status === 200) resolve(req.response);
            else reject("Loading error: " + req.statusText);
          };
          req.send();
        } catch (error) {
          reject(error.message);
        }
      });
    }

    async function upload(data, path, filename) {
      return new Promise(async (resolve, reject) => {
        // create new file from the response
        let file = new File([data], filename, { type: data.type });

        let result = await DirectoryPicker.uploadToPath(path, file);
        resolve(result.path);
      });
    }

    async function process(url, path, filename) {
      let data = await download(url);
      let result = await upload(data, path, filename);
      return result;
    }

    // prepare filenames
    let filename = baseFilename;
    let ext = url
      .split(".")
      .pop()
      .split(/\#|\?|\&/)[0];

    // uploading the character avatar and token
    try {
      let result = await process("https://proxy.vttassets.com/?url=" + url, targetDirectory, filename + "." + ext);
      return result;
    } catch (error) {
      console.log(error);
      ui.notifications.warn("Image upload failed. Please check your vtta-dndbeyond upload folder setting");
      return null;
    }
  },

  getFolder: async (kind, type = "", race = "") => {
    let getOrCreateFolder = async (root, entityType, folderName) => {
      const baseColor = "#98020a";

      let folder = game.folders.entities.find(
        (f) => f.data.type === entityType && f.data.name === folderName && f.data.parent === root.id
      );
      if (folder) return folder;
      folder = await Folder.create(
        {
          name: folderName,
          type: entityType,
          color: baseColor,
          parent: root.id,
        },
        { displaySheet: false }
      );
      return folder;
    };

    let entityTypes = new Map();
    entityTypes.set("spell", "Item");
    entityTypes.set("equipment", "Item");
    entityTypes.set("consumable", "Item");
    entityTypes.set("tool", "Item");
    entityTypes.set("loot", "Item");
    entityTypes.set("class", "Item");
    entityTypes.set("backpack", "Item");
    entityTypes.set("npc", "Actor");
    entityTypes.set("character", "Actor");
    entityTypes.set("page", "JournalEntry");
    entityTypes.set("magic-items", "Item");

    let baseName = "D&D Beyond Import";
    let baseColor = "#6f0006";
    let folderName = game.i18n.localize(`vtta-dndbeyond.item-type.${kind}`);

    let entityType = entityTypes.get(kind);

    // get base folder, or create it if it does not exist
    let baseFolder = game.folders.entities.find(
      (folder) => folder.data.type === entityType && folder.data.name === baseName
    );
    if (!baseFolder) {
      baseFolder = await Folder.create(
        {
          name: baseName,
          type: entityType,
          color: baseColor,
          parent: null,
          sort: 30000,
        },
        { displaySheet: false }
      );
    }

    let entityFolder = await getOrCreateFolder(baseFolder, entityType, folderName);
    if (kind === "npc" && type !== "") {
      let typeFolder = await getOrCreateFolder(entityFolder, "Actor", type.charAt(0).toUpperCase() + type.slice(1));
      return typeFolder;
    } else {
      return entityFolder;
    }
  },

  normalizeString: (str) => {
    return str.toLowerCase().replace(/\W/g, "");
  },

  /**
   * Queries a compendium for a given entity name
   * @returns the index entries of all matches, otherwise an empty array
   */
  queryCompendium: async (compendiumName, entityName, getEntity = false) => {
    entityName = utils.normalizeString(entityName);

    let compendium = game.packs.find((pack) => pack.collection === compendiumName);
    if (!compendium) return null;
    let index = await compendium.getIndex();
    let id = index.find((entity) => utils.normalizeString(entity.name) === entityName);
    if (id && getEntity) {
      let entity = await compendium.getEntity(id._id);
      return entity;
    }
    return id ? id : null;
  },

  /**
   * Creates or updates a given entity
   */
  createCompendiumEntry: async (compendiumName, entity, updateExistingEntry = false) => {
    let compendium = game.packs.find((pack) => pack.collection === compendiumName);

    if (!compendium) return null;

    let existingEntry = await utils.queryCompendium(compendiumName, entity.name);
    if (existingEntry) {
      console.log("Entry exists already:");
      console.log(existingEntry);
      if (updateExistingEntry) {
        // update all existing entries
        existingEntry = await compendium.updateEntity({
          ...entity.data,
          _id: existingEntry._id,
        });

        return {
          _id: existingEntry._id,
          img: existingEntry.img,
          name: existingEntry.name,
        };
      } else {
        console.log("Update: no");
        return existingEntry;
      }
    } else {
      console.log("Entry does not exist");
      let compendiumEntry = await compendium.createEntity(entity.data);
      console.log(compendiumEntry);
      return {
        _id: compendiumEntry._id,
        img: compendiumEntry.img,
        name: compendiumEntry.name,
      };
    }
  },

  getFolderHierarchy: (folder) => {
    if (!folder || !folder._parent) return "/";
    return folder._parent._id !== null
      ? `${utils.getFolderHierarchy(folder._parent)}/${folder.name}`
      : `/${folder.name}`;
  },

  log: (msg, section = "general") => {
    const LOG_PREFIX = "VTTA D&D Beyond";
    if (
      CONFIG &&
      CONFIG.debug &&
      CONFIG.debug.vtta &&
      CONFIG.debug.vtta.dndbeyond &&
      CONFIG.debug.vtta.dndbeyond.hasOwnProperty(section) &&
      CONFIG.debug.vtta.dndbeyond[section]
    )
      switch (typeof msg) {
        case "object":
        case "array":
          console.log(`${LOG_PREFIX} | ${section} > ${typeof msg}`);
          console.log(msg);
          break;
        default:
          console.log(`${LOG_PREFIX} | ${section} > ${msg}`);
      }
  },
};

export default utils;
