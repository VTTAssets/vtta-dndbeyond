const DICTIONARY = {
    resets: [
        { id: 1, value: 'sr' },
        { id: 'ShortRest', value: 'sr' },
        { id: 2, value: 'lr' },
        { id: 'LongRest', value: 'lr' },
        { id: 'Dawn', value: 'day' },
        { id: 'Consumable', value: 'charges' },
    ],
    character: {
        abilities: [
            { id: 1, value: 'str', long: 'strength' },
            { id: 2, value: 'dex', long: 'dexterity' },
            { id: 3, value: 'con', long: 'constitution' },
            { id: 4, value: 'int', long: 'intelligence' },
            { id: 5, value: 'wis', long: 'wisdom' },
            { id: 6, value: 'cha', long: 'charisma' }
        ],
        skills: [
            { name: 'acr', label: 'Acrobatics', ability: 'dex' },
            { name: 'ani', label: 'Animal Handling', ability: 'wis' },
            { name: 'arc', label: 'Arcana', ability: 'int' },
            { name: 'ath', label: 'Athletics', ability: 'str' },
            { name: 'dec', label: 'Deception', ability: 'cha' },
            { name: 'his', label: 'History', ability: 'int' },
            { name: 'ins', label: 'Insight', ability: 'wis' },
            { name: 'itm', label: 'Intimidation', ability: 'cha' },
            { name: 'inv', label: 'Investigation', ability: 'int' },
            { name: 'med', label: 'Medicine', ability: 'wis' },
            { name: 'nat', label: 'Nature', ability: 'int' },
            { name: 'prc', label: 'Perception', ability: 'wis' },
            { name: 'prf', label: 'Performance', ability: 'cha' },
            { name: 'per', label: 'Persuasion', ability: 'cha' },
            { name: 'rel', label: 'Religion', ability: 'int' },
            { name: 'slt', label: 'Sleight of Hand', ability: 'dex' },
            { name: 'ste', label: 'Stealth', ability: 'dex' },
            { name: 'sur', label: 'Survival', ability: 'wis' }
        ],
        alignments: [
            { id: 1, name: 'Lawful Good', value: 'lg' },
            { id: 2, name: 'Neutral Good', value: 'ng' },
            { id: 3, name: 'Chaotic Good', value: 'cg' },
            { id: 4, name: 'Lawful Neutral', value: 'ln' },
            { id: 5, name: 'True Neutral', value: 'tn' },
            { id: 6, name: 'Chaotic Neutral', value: 'cn' },
            { id: 7, name: 'Lawful Evil', value: 'le' },
            { id: 8, name: 'Neutral Evil', value: 'ne' },
            { id: 9, name: 'Chaotic Evil', value: 'ce' }
        ],
        actorSizes: [
            { name: 'Tiny', value: 'tiny' },
            { name: 'Small', value: 'sm' },
            { name: 'Medium', value: 'med' },
            { name: 'Large', value: 'lg' },
            { name: 'Huge', value: 'huge' },
            { name: 'Gargantuan', value: 'grg' }
        ],
        senses: [
            { id: 1, name: 'Blindsight' },
            { id: 2, name: 'Darkvision' },
            { id: 3, name: 'Tremorsense' },
            { id: 4, name: 'Truesight' }
        ],
        languages: [
            { name: 'Common', value: 'common' },
            { name: 'Aarakocra', value: 'aarakocra' },
            { name: 'Abyssal', value: 'abyssal' },
            { name: 'Aquan', value: 'aquan' },
            { name: 'Auran', value: 'auran' },
            { name: 'Celestial', value: 'celestial' },
            { name: 'Deep Speech', value: 'deep' },
            { name: 'Draconic', value: 'draconic' },
            { name: 'Druidic', value: 'druidic' },
            { name: 'Dwarvish', value: 'dwarvish' },
            { name: 'Elvish', value: 'elvish' },
            { name: 'Giant', value: 'giant' },
            { name: 'Gith', value: 'gith' },
            { name: 'Gnomish', value: 'gnomish' },
            { name: 'Goblin', value: 'goblin' },
            { name: 'Gnoll', value: 'gnoll' },
            { name: 'Halfling', value: 'halfling' },
            { name: 'Ignan', value: 'ignan' },
            { name: 'Infernal', value: 'infernal' },
            { name: 'Orc', value: 'primordial' },
            { name: 'Primordial', value: 'primordial' },
            { name: 'Terran', value: 'terran' },
            { name: 'Sylvan', value: 'sylvan' },
            { name: 'Thieves\' Cant', value: 'cant' },
            { name: 'Undercommon', value: 'undercommon' }
        ],
        actorSizes: [
            { name: 'Tiny', value: 'tiny' },
            { name: 'Small', value: 'sm' },
            { name: 'Medium', value: 'med' },
            { name: 'Large', value: 'lg' },
            { name: 'Huge', value: 'huge' },
            { name: 'Gargantuan', value: 'grg' }
        ],
        languages: [
            { name: 'Common', value: 'common' },
            { name: 'Aarakocra', value: 'aarakocra' },
            { name: 'Abyssal', value: 'abyssal' },
            { name: 'Aquan', value: 'aquan' },
            { name: 'Auran', value: 'auran' },
            { name: 'Celestial', value: 'celestial' },
            { name: 'Deep Speech', value: 'deep' },
            { name: 'Draconic', value: 'draconic' },
            { name: 'Druidic', value: 'druidic' },
            { name: 'Dwarvish', value: 'dwarvish' },
            { name: 'Elvish', value: 'elvish' },
            { name: 'Giant', value: 'giant' },
            { name: 'Gith', value: 'gith' },
            { name: 'Gnomish', value: 'gnomish' },
            { name: 'Goblin', value: 'goblin' },
            { name: 'Gnoll', value: 'gnoll' },
            { name: 'Halfling', value: 'halfling' },
            { name: 'Ignan', value: 'ignan' },
            { name: 'Infernal', value: 'infernal' },
            { name: 'Orc', value: 'primordial' },
            { name: 'Primordial', value: 'primordial' },
            { name: 'Terran', value: 'terran' },
            { name: 'Sylvan', value: 'sylvan' },
            { name: 'Thieves\' Cant', value: 'cant' },
            { name: 'Undercommon', value: 'undercommon' }
        ],
        armorTypes: [
            { name: 'Clothing', value: 'clothing' },
            { name: 'Light Armor', value: 'light' },
            { name: 'Medium Armor', value: 'medium' },
            { name: 'Heavy Armor', value: 'heavy' },
            { name: 'Magical Bonus', value: 'bonus' },
            { name: 'Natural Armor', value: 'natural' },
            { name: 'Shield', value: 'shield' }
        ],
        damageTypes: [
            { id: 1, type: 2, type: 2, kind: 'resistance', name: 'Bludgeoning', value: 'bludgeoning' },
            { id: 2, type: 2, kind: 'resistance', name: 'Piercing', value: 'piercing' },
            { id: 3, type: 2, kind: 'resistance', name: 'Slashing', value: 'slashing' },
            { id: 4, type: 2, kind: 'resistance', name: 'Lightning', value: 'lightning' },
            { id: 5, type: 2, kind: 'resistance', name: 'Thunder', value: 'thunder' },
            { id: 6, type: 2, kind: 'resistance', name: 'Poison', value: 'poison' },
            { id: 7, type: 2, kind: 'resistance', name: 'Cold', value: 'cold' },
            { id: 8, type: 2, kind: 'resistance', name: 'Radiant', value: 'radiant' },
            { id: 9, type: 2, kind: 'resistance', name: 'Fire', value: 'fire' },
            { id: 10, type: 2, kind: 'resistance', name: 'Necrotic', value: 'necrotic' },
            { id: 11, type: 2, kind: 'resistance', name: 'Acid', value: 'acid' },
            { id: 12, type: 2, kind: 'resistance', name: 'Psychic', value: 'psychic' },
            { id: 17, type: 2, kind: 'immunity', name: 'Bludgeoning', value: 'bludgeoning' },
            { id: 18, type: 2, kind: 'immunity', name: 'Piercing', value: 'piercing' },
            { id: 19, type: 2, kind: 'immunity', name: 'Slashing', value: 'slashing' },
            { id: 20, type: 2, kind: 'immunity', name: 'Lightning', value: 'lightning' },
            { id: 21, type: 2, kind: 'immunity', name: 'Thunder', value: 'thunder' },
            { id: 22, type: 2, kind: 'immunity', name: 'Poison', value: 'poison' },
            { id: 23, type: 2, kind: 'immunity', name: 'Cold', value: 'cold' },
            { id: 24, type: 2, kind: 'immunity', name: 'Radiant', value: 'radiant' },
            { id: 25, type: 2, kind: 'immunity', name: 'Fire', value: 'fire' },
            { id: 26, type: 2, kind: 'immunity', name: 'Necrotic', value: 'necrotic' },
            { id: 27, type: 2, kind: 'immunity', name: 'Acid', value: 'acid' },
            { id: 28, type: 2, kind: 'immunity', name: 'Psychic', value: 'psychic' },
            { id: 33, type: 2, kind: 'vulnerability', name: 'Bludgeoning', value: 'bludgeoning' },
            { id: 34, type: 2, kind: 'vulnerability', name: 'Piercing', value: 'piercing' },
            { id: 35, type: 2, kind: 'vulnerability', name: 'Slashing', value: 'slashing' },
            { id: 36, type: 2, kind: 'vulnerability', name: 'Lightning', value: 'lightning' },
            { id: 37, type: 2, kind: 'vulnerability', name: 'Thunder', value: 'thunder' },
            { id: 38, type: 2, kind: 'vulnerability', name: 'Poison', value: 'poison' },
            { id: 39, type: 2, kind: 'vulnerability', name: 'Cold', value: 'cold' },
            { id: 40, type: 2, kind: 'vulnerability', name: 'Radiant', value: 'radiant' },
            { id: 41, type: 2, kind: 'vulnerability', name: 'Fire', value: 'fire' },
            { id: 42, type: 2, kind: 'vulnerability', name: 'Necrotic', value: 'necrotic' },
            { id: 43, type: 2, kind: 'vulnerability', name: 'Acid', value: 'acid' },
            { id: 44, type: 2, kind: 'vulnerability', name: 'Psychic', value: 'psychic' },
            { id: 47, type: 2, kind: 'resistance', name: 'Force', value: 'force' },
            { id: 48, type: 2, kind: 'immunity', name: 'Force', value: 'force' },
            { id: 49, type: 2, kind: 'vulnerability', name: 'Force', value: 'force' },
            { id: 51, type: 2, kind: 'resistance', name: 'Ranged attacks' },
            { id: 52, type: 2, kind: 'resistance', name: 'Damage dealt by traps' },
            { id: 54, type: 2, kind: 'resistance', name: 'Bludgeoning from non magical attacks' },

            { id: 1, type: 1, kind: 'immunity', name: 'Blinded', value: 'blinded' },
            { id: 2, type: 1, kind: 'immunity', name: 'Charmed', value: 'charmed' },
            { id: 3, type: 1, kind: 'immunity', name: 'Deafened', value: 'deafened' },
            { id: 4, type: 1, kind: 'immunity', name: 'Exhaustion', value: 'exhaustion' },
            { id: 5, type: 1, kind: 'immunity', name: 'Frightened', value: 'Frightened' },
            { id: 6, type: 1, kind: 'immunity', name: 'Grappled', value: 'grappled' },
            { id: 7, type: 1, kind: 'immunity', name: 'Incapacitated', value: 'incapacitated' },
            { id: 8, type: 1, kind: 'immunity', name: 'Invisible', value: 'invisible' },
            { id: 9, type: 1, kind: 'immunity', name: 'Paralyzed', value: 'paralyzed' },
            { id: 10, type: 1, kind: 'immunity', name: 'Petrified', value: 'petrified' },
            { id: 11, type: 1, kind: 'immunity', name: 'Poisoned', value: 'poisoned' },
            { id: 12, type: 1, kind: 'immunity', name: 'Prone', value: 'prone' },
            { id: 13, type: 1, kind: 'immunity', name: 'Restrained', value: 'restrained' },
            { id: 14, type: 1, kind: 'immunity', name: 'Stunned', value: 'stunned' },
            { id: 15, type: 1, kind: 'immunity', name: 'Unconscious', value: 'unconscious' }
        ],
        proficiencies: [
            // Armor
            { name: 'Studded Leather', type: 'Armor', subType: 'Light Armor' },
            { name: 'Scale Mail', type: 'Armor', subType: 'Medium Armor' },
            { name: 'Shield', type: 'Armor', subType: 'Shield' },
            { name: 'Padded', type: 'Armor', subType: 'Light Armor' },
            { name: 'Leather', type: 'Armor', subType: 'Light Armor' },
            { name: 'Hide', type: 'Armor', subType: 'Medium Armor' },
            { name: 'Chain Shirt', type: 'Armor', subType: 'Medium Armor' },
            { name: 'Breastplate', type: 'Armor', subType: 'Medium Armor' },
            { name: 'Half Plate', type: 'Armor', subType: 'Medium Armor' },
            { name: 'Ring Mail', type: 'Armor', subType: 'Heavy Armor' },
            { name: 'Chain Mail', type: 'Armor', subType: 'Heavy Armor' },
            { name: 'Splint', type: 'Armor', subType: 'Heavy Armor' },
            { name: 'Plate', type: 'Armor', subType: 'Heavy Armor' },
            { name: 'Spiked Armor', type: 'Armor', subType: 'Medium Armor' },

            // Weapons
            { name: 'Crossbow, Hand', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Glaive', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Dagger', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Longsword', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Club', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Greatclub', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Handaxe', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Javelin', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Light Hammer', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Mace', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Quarterstaff', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Sickle', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Spear', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Crossbow, Light', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Dart', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Shortbow', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Sling', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Battleaxe', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Flail', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Greataxe', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Greatsword', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Halberd', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Lance', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Maul', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Morningstar', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Pike', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Rapier', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Scimitar', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Shortsword', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Trident', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'War Pick', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Warhammer', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Whip', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Blowgun', type: 'Weapon', subType: 'Martial Weapon' },
            {
                name: 'Crossbow, Heavy',
                type: 'Weapon',
                subType: 'Martial Weapon'
            },
            { name: 'Longbow', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Net', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Boomerang', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Yklwa', type: 'Weapon', subType: 'Simple Weapon' },
            { name: 'Pistol', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Musket', type: 'Weapon', subType: 'Martial Weapon' },
            {
                name: 'Pistol, Automatic',
                type: 'Weapon',
                subType: 'Martial Weapon'
            },
            { name: 'Revolver', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Rifle, Hunting', type: 'Weapon', subType: 'Martial Weapon' },
            {
                name: 'Rifle, Automatic',
                type: 'Weapon',
                subType: 'Martial Weapon'
            },
            { name: 'Shotgun', type: 'Weapon', subType: 'Martial Weapon' },
            { name: 'Laser Pistol', type: 'Weapon', subType: 'Martial Weapon' },
            {
                name: 'Antimatter Rifle',
                type: 'Weapon',
                subType: 'Martial Weapon'
            },
            { name: 'Laser Rifle', type: 'Weapon', subType: 'Martial Weapon' },
            {
                name: 'Double-Bladed Scimitar',
                type: 'Weapon',
                subType: 'Martial Weapon'
            },
            { name: 'Ammunition', type: 'Weapon', subType: 'Simple Weapon' },

            // Tools and Instruments and Stuff
            { name: "Carpenter's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Cartographer's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Cobbler's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Cook's Utensils", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Glassblower's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Jeweler's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Leatherworker's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Mason's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Navigator's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Potter's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Smith's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Thieves' Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Tinker's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Weaver's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: "Woodcarver's Tools", type: 'Tool', subType: "Artisan's Tools" },
            { name: 'Dice Set', type: 'Tool', subType: 'Gaming Set' },
            { name: 'Dragonchess Set', type: 'Tool', subType: 'Gaming Set' },
            { name: 'Playing Card Set', type: 'Tool', subType: 'Gaming Set' },
            { name: 'Three-Dragon Ante Set', type: 'Tool', subType: 'Gaming Set' },
            { name: 'Disguise Kit', type: 'Tool', subType: 'Kit' },
            { name: 'Forgery Kit', type: 'Tool', subType: 'Kit' },
            { name: 'Herbalism Kit', type: 'Tool', subType: 'Kit' },
            { name: "Poisoner's Kit", type: 'Tool', subType: 'Kit' },
            { name: 'Bagpipes', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Birdpipes', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Drum', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Dulcimer', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Flute', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Glaur', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Hand Drum', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Horn', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Longhorn', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Lute', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Lyre', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Pan Flute', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Shawm', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Songhorn', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Tantan', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Thelarr', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Tocken', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Viol', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Wargong', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Yarting', type: 'Tool', subType: 'Musical Instrument' },
            { name: 'Zulkoon', type: 'Tool', subType: 'Musical Instrument' },
            { name: "Alchemist's Supplies", type: 'Tool', subType: 'Supplies' },
            { name: "Brewer's Supplies", type: 'Tool', subType: 'Supplies' },
            { name: "Calligrapher's Supplies", type: 'Tool', subType: 'Supplies' },
            { name: "Painter's Supplies", type: 'Tool', subType: 'Supplies' }
        ]
    },
    item: {
        characterValues: [
            { typeId: 8, value: 'name' },
            //   { typeId: 9, value: 'notes'},  // note: Not supported by Foundry right now, skipping
            { typeId: 19, value: 'price' },
            { typeId: 22, value: 'weight' }
        ]
    },
    equipment: {
        armorType: [
            { name: 'Clothing', value: 'clothing' },
            { name: 'Light Armor', value: 'light' },
            { name: 'Medium Armor', value: 'medium' },
            { name: 'Heavy Armor', value: 'heavy' },
            { name: 'Magical Bonus', value: 'bonus' },
            { name: 'Natural Armor', value: 'natural' },
            { name: 'Shield', value: 'shield' }
        ],
        armorTypeID: [
            { name: 'Light Armor', id: 1 },
            { name: 'Medium Armor', id: 2 },
            { name: 'Heavy Armor', id: 3 },
            { name: 'Shield', id: 4 },
            { name: 'Unarmored', id: 0 },
            { name: 'Unarmored Defense', id: -1 },
        ]
    },
    weapon: {
        weaponType: [
            { categoryId: 1, attackType: 1, value: 'simpleM' },
            { categoryId: 1, attackType: 2, value: 'simpleR' },
            { categoryId: 2, attackType: 1, value: 'martialM' },
            { categoryId: 2, attackType: 2, value: 'martialR' },

            { categoryId: 3, attackType: 2, value: 'martialR' },     // this is not 100% correct. a martialF for "Martial Firearms" would be better
            { categoryId: 0, attackType: null, value: 'simpleR' }   // this is totally incorrect, this is of type ammunition
        ],
        properties: [
            { name: 'Ammunition', value: 'amm' },
            { name: 'Ammunition (Firearms)', value: 'amm' },
            { name: 'Finesse', value: 'fin' },
            { name: 'Heavy', value: 'hvy' },
            { name: 'Light', value: 'lgt' },
            { name: 'Loading', value: 'rel' },
            { name: 'Range', value: 'fir' },
            { name: 'Reach', value: 'rch' },
            { name: 'Reload', value: 'rel' },
            { name: 'Special', value: 'spc' },
            { name: 'Thrown', value: 'thr' },
            { name: 'Two-Handed', value: 'two' },
            { name: 'Versatile', value: 'ver' }
        ]
    },
    spell: {

        preparationModes: [
            // This is the correct table
            /*
            { name: 'Hunter', value: 'always' },
            { name: 'Bard', value: 'always' },
            { name: 'Rogue', value: 'always' },
            { name: 'Sorcerer', value: 'always' },
            { name: 'Artificer', value: 'always' },
            { name: 'Cleric', value: 'prepared' },
            { name: 'Wizard', value: 'prepared' },
            { name: 'Paladin', value: 'prepared' },
            { name: 'Druid', value: 'prepared' },
            { name: 'Warlock', value: 'pact' }
            */
            // this table works for the current Foundry UI
            { name: 'Hunter', value: 'prepared' },
            { name: 'Bard', value: 'prepared' },
            { name: 'Rogue', value: 'prepared' },
            { name: 'Sorcerer', value: 'prepared' },
            { name: 'Artificer', value: 'prepared' },
            { name: 'Cleric', value: 'prepared' },
            { name: 'Wizard', value: 'prepared' },
            { name: 'Paladin', value: 'prepared' },
            { name: 'Druid', value: 'prepared' },
            { name: 'Warlock', value: 'pact' }
        ],
        activationTypes: [
            { activationType: 0, value: 'none' },
            { activationType: 1, value: 'action' },
            { activationType: 2, value: 'action' },
            { activationType: 3, value: 'bonus' },
            { activationType: 4, value: 'reaction' },
            { activationType: 5, value: 'action' },
            { activationType: 6, value: 'minute' },
            { activationType: 7, value: 'hour' },
            { activationType: 8, value: 'special' }
        ]
    },
    spells: [
        {
            "name": "Absorb Elements",
            "school": "abj"
        },
        {
            "name": "Alarm",
            "school": "abj"
        },
        {
            "name": "Antilife Shell",
            "school": "abj"
        },
        {
            "name": "Antimagic Field",
            "school": "abj"
        },
        {
            "name": "Arcane Lock",
            "school": "abj"
        },
        {
            "name": "Armor of Agathys",
            "school": "abj"
        },
        {
            "name": "Aura of Life",
            "school": "abj"
        },
        {
            "name": "Aura of Purity",
            "school": "abj"
        },
        {
            "name": "Banishing Smite",
            "school": "abj"
        },
        {
            "name": "Banishment",
            "school": "abj"
        },
        {
            "name": "Beacon of Hope",
            "school": "abj"
        },
        {
            "name": "Blade Ward",
            "school": "abj"
        },
        {
            "name": "Ceremony",
            "school": "abj"
        },
        {
            "name": "Circle of Power",
            "school": "abj"
        },
        {
            "name": "Counterspell",
            "school": "abj"
        },
        {
            "name": "Death Ward",
            "school": "abj"
        },
        {
            "name": "Dispel Evil and Good",
            "school": "abj"
        },
        {
            "name": "Dispel Magic",
            "school": "abj"
        },
        {
            "name": "Druid Grove",
            "school": "abj"
        },
        {
            "name": "Forbiddance",
            "school": "abj"
        },
        {
            "name": "Freedom of Movement",
            "school": "abj"
        },
        {
            "name": "Globe of Invulnerability",
            "school": "abj"
        },
        {
            "name": "Glyph of Warding",
            "school": "abj"
        },
        {
            "name": "Greater Restoration",
            "school": "abj"
        },
        {
            "name": "Guards and Wards",
            "school": "abj"
        },
        {
            "name": "Holy Aura",
            "school": "abj"
        },
        {
            "name": "Imprisonment",
            "school": "abj"
        },
        {
            "name": "Invulnerability",
            "school": "abj"
        },
        {
            "name": "Lesser Restoration",
            "school": "abj"
        },
        {
            "name": "Mage Armor",
            "school": "abj"
        },
        {
            "name": "Magic Circle",
            "school": "abj"
        },
        {
            "name": "Mind Blank",
            "school": "abj"
        },
        {
            "name": "Mordenkainen’s Private Sanctum",
            "school": "abj"
        },
        {
            "name": "Nondetection",
            "school": "abj"
        },
        {
            "name": "Pass without Trace",
            "school": "abj"
        },
        {
            "name": "Planar Binding",
            "school": "abj"
        },
        {
            "name": "Primordial Ward",
            "school": "abj"
        },
        {
            "name": "Prismatic Wall",
            "school": "abj"
        },
        {
            "name": "Private Sanctum",
            "school": "abj"
        },
        {
            "name": "Protection from Energy",
            "school": "abj"
        },
        {
            "name": "Protection from Evil and Good",
            "school": "abj"
        },
        {
            "name": "Protection from Poison",
            "school": "abj"
        },
        {
            "name": "Remove Curse",
            "school": "abj"
        },
        {
            "name": "Resistance",
            "school": "abj"
        },
        {
            "name": "Sanctuary",
            "school": "abj"
        },
        {
            "name": "Shield",
            "school": "abj"
        },
        {
            "name": "Shield of Faith",
            "school": "abj"
        },
        {
            "name": "Snare",
            "school": "abj"
        },
        {
            "name": "Stoneskin",
            "school": "abj"
        },
        {
            "name": "Symbol",
            "school": "abj"
        },
        {
            "name": "Warding Bond",
            "school": "abj"
        },
        {
            "name": "Acid Splash",
            "school": "con"
        },
        {
            "name": "Arcane Gate",
            "school": "con"
        },
        {
            "name": "Arms of Hadar",
            "school": "con"
        },
        {
            "name": "Black Tentacles",
            "school": "con"
        },
        {
            "name": "Call Lightning",
            "school": "con"
        },
        {
            "name": "Cloud of Daggers",
            "school": "con"
        },
        {
            "name": "Cloudkill",
            "school": "con"
        },
        {
            "name": "Conjure Animals",
            "school": "con"
        },
        {
            "name": "Conjure Barrage",
            "school": "con"
        },
        {
            "name": "Conjure Celestial",
            "school": "con"
        },
        {
            "name": "Conjure Elemental",
            "school": "con"
        },
        {
            "name": "Conjure Fey",
            "school": "con"
        },
        {
            "name": "Conjure Minor Elementals",
            "school": "con"
        },
        {
            "name": "Conjure Volley",
            "school": "con"
        },
        {
            "name": "Conjure Woodland Beings",
            "school": "con"
        },
        {
            "name": "Create Bonfire",
            "school": "con"
        },
        {
            "name": "Create Food and Water",
            "school": "con"
        },
        {
            "name": "Demiplane",
            "school": "con"
        },
        {
            "name": "Dimension Door",
            "school": "con"
        },
        {
            "name": "Drawmij's Instant Summons",
            "school": "con"
        },
        {
            "name": "Dust Devil",
            "school": "con"
        },
        {
            "name": "Ensnaring Strike",
            "school": "con"
        },
        {
            "name": "Entangle",
            "school": "con"
        },
        {
            "name": "Evard’s Black Tentacles",
            "school": "con"
        },
        {
            "name": "Faithful Hound",
            "school": "con"
        },
        {
            "name": "Far Step",
            "school": "con"
        },
        {
            "name": "Find Familiar",
            "school": "con"
        },
        {
            "name": "Find Greater Steed",
            "school": "con"
        },
        {
            "name": "Find Steed",
            "school": "con"
        },
        {
            "name": "Flaming Sphere",
            "school": "con"
        },
        {
            "name": "Floating Disk",
            "school": "con"
        },
        {
            "name": "Flock of Familiars",
            "school": "con"
        },
        {
            "name": "Fog Cloud",
            "school": "con"
        },
        {
            "name": "Galder’s Speedy Courier",
            "school": "con"
        },
        {
            "name": "Galder’s Tower",
            "school": "con"
        },
        {
            "name": "Gate",
            "school": "con"
        },
        {
            "name": "Grasping Vine",
            "school": "con"
        },
        {
            "name": "Grease",
            "school": "con"
        },
        {
            "name": "Guardian of Faith",
            "school": "con"
        },
        {
            "name": "Hail of Thorns",
            "school": "con"
        },
        {
            "name": "Healing Spirit",
            "school": "con"
        },
        {
            "name": "Heroes' Feast",
            "school": "con"
        },
        {
            "name": "Hunger of Hadar",
            "school": "con"
        },
        {
            "name": "Ice Knife",
            "school": "con"
        },
        {
            "name": "Incendiary Cloud",
            "school": "con"
        },
        {
            "name": "Infernal Calling",
            "school": "con"
        },
        {
            "name": "Infestation",
            "school": "con"
        },
        {
            "name": "Insect Plague",
            "school": "con"
        },
        {
            "name": "Instant Summons",
            "school": "con"
        },
        {
            "name": "Leomund’s Secret Chest",
            "school": "con"
        },
        {
            "name": "Mage Hand",
            "school": "con"
        },
        {
            "name": "Magnificent Mansion",
            "school": "con"
        },
        {
            "name": "Maze",
            "school": "con"
        },
        {
            "name": "Mighty Fortress",
            "school": "con"
        },
        {
            "name": "Misty Step",
            "school": "con"
        },
        {
            "name": "Mordenkainen's Magnificent Mansion",
            "school": "con"
        },
        {
            "name": "Mordenkainen’s Faithful Hound",
            "school": "con"
        },
        {
            "name": "Planar Ally",
            "school": "con"
        },
        {
            "name": "Plane Shift",
            "school": "con"
        },
        {
            "name": "Poison Spray",
            "school": "con"
        },
        {
            "name": "Produce Flame",
            "school": "con"
        },
        {
            "name": "Scatter",
            "school": "con"
        },
        {
            "name": "Secret Chest",
            "school": "con"
        },
        {
            "name": "Sleet Storm",
            "school": "con"
        },
        {
            "name": "Spirit Guardians",
            "school": "con"
        },
        {
            "name": "Steel Wind Strike",
            "school": "con"
        },
        {
            "name": "Stinking Cloud",
            "school": "con"
        },
        {
            "name": "Storm of Vengeance",
            "school": "con"
        },
        {
            "name": "Summon Greater Demon",
            "school": "con"
        },
        {
            "name": "Summon Lesser Demons",
            "school": "con"
        },
        {
            "name": "Sword Burst",
            "school": "con"
        },
        {
            "name": "Teleport",
            "school": "con"
        },
        {
            "name": "Teleportation Circle",
            "school": "con"
        },
        {
            "name": "Temple of the Gods",
            "school": "con"
        },
        {
            "name": "Tenser’s Floating Disk",
            "school": "con"
        },
        {
            "name": "Thunder Step",
            "school": "con"
        },
        {
            "name": "Tidal Wave",
            "school": "con"
        },
        {
            "name": "Transport via Plants",
            "school": "con"
        },
        {
            "name": "Tree Stride",
            "school": "con"
        },
        {
            "name": "Tsunami",
            "school": "con"
        },
        {
            "name": "Unseen Servant",
            "school": "con"
        },
        {
            "name": "Wall of Thorns",
            "school": "con"
        },
        {
            "name": "Watery Sphere",
            "school": "con"
        },
        {
            "name": "Web",
            "school": "con"
        },
        {
            "name": "Wish",
            "school": "con"
        },
        {
            "name": "Word of Recall",
            "school": "con"
        },
        {
            "name": "Arcane Eye",
            "school": "div"
        },
        {
            "name": "Augury",
            "school": "div"
        },
        {
            "name": "Beast Bond",
            "school": "div"
        },
        {
            "name": "Beast Sense",
            "school": "div"
        },
        {
            "name": "Clairvoyance",
            "school": "div"
        },
        {
            "name": "Commune",
            "school": "div"
        },
        {
            "name": "Commune with Nature",
            "school": "div"
        },
        {
            "name": "Comprehend Languages",
            "school": "div"
        },
        {
            "name": "Contact Other Plane",
            "school": "div"
        },
        {
            "name": "Detect Evil and Good",
            "school": "div"
        },
        {
            "name": "Detect Magic",
            "school": "div"
        },
        {
            "name": "Detect Poison and Disease",
            "school": "div"
        },
        {
            "name": "Detect Thoughts",
            "school": "div"
        },
        {
            "name": "Divination",
            "school": "div"
        },
        {
            "name": "Find Traps",
            "school": "div"
        },
        {
            "name": "Find the Path",
            "school": "div"
        },
        {
            "name": "Foresight",
            "school": "div"
        },
        {
            "name": "Guidance",
            "school": "div"
        },
        {
            "name": "Hunter's Mark",
            "school": "div"
        },
        {
            "name": "Identify",
            "school": "div"
        },
        {
            "name": "Legend Lore",
            "school": "div"
        },
        {
            "name": "Locate Animals or Plants",
            "school": "div"
        },
        {
            "name": "Locate Creature",
            "school": "div"
        },
        {
            "name": "Locate Object",
            "school": "div"
        },
        {
            "name": "Mind Spike",
            "school": "div"
        },
        {
            "name": "Rary's Telepathic Bond",
            "school": "div"
        },
        {
            "name": "Scrying",
            "school": "div"
        },
        {
            "name": "See Invisibility",
            "school": "div"
        },
        {
            "name": "Speak with Animals",
            "school": "div"
        },
        {
            "name": "Telepathic Bond",
            "school": "div"
        },
        {
            "name": "Tongues",
            "school": "div"
        },
        {
            "name": "True Seeing",
            "school": "div"
        },
        {
            "name": "True Strike",
            "school": "div"
        },
        {
            "name": "Animal Friendship",
            "school": "enc"
        },
        {
            "name": "Animal Messenger",
            "school": "enc"
        },
        {
            "name": "Antipathy/Sympathy",
            "school": "enc"
        },
        {
            "name": "Bane",
            "school": "enc"
        },
        {
            "name": "Bless",
            "school": "enc"
        },
        {
            "name": "Calm Emotions",
            "school": "enc"
        },
        {
            "name": "Catnap",
            "school": "enc"
        },
        {
            "name": "Charm Monster",
            "school": "enc"
        },
        {
            "name": "Charm Person",
            "school": "enc"
        },
        {
            "name": "Command",
            "school": "enc"
        },
        {
            "name": "Compelled Duel",
            "school": "enc"
        },
        {
            "name": "Compulsion",
            "school": "enc"
        },
        {
            "name": "Confusion",
            "school": "enc"
        },
        {
            "name": "Crown of Madness",
            "school": "enc"
        },
        {
            "name": "Dissonant Whispers",
            "school": "enc"
        },
        {
            "name": "Dominate Beast",
            "school": "enc"
        },
        {
            "name": "Dominate Monster",
            "school": "enc"
        },
        {
            "name": "Dominate Person",
            "school": "enc"
        },
        {
            "name": "Encode Thoughts",
            "school": "enc"
        },
        {
            "name": "Enemies Abound",
            "school": "enc"
        },
        {
            "name": "Enthrall",
            "school": "enc"
        },
        {
            "name": "Fast Friends",
            "school": "enc"
        },
        {
            "name": "Feeblemind",
            "school": "enc"
        },
        {
            "name": "Friends",
            "school": "enc"
        },
        {
            "name": "Geas",
            "school": "enc"
        },
        {
            "name": "Gift of Gab",
            "school": "enc"
        },
        {
            "name": "Heroism",
            "school": "enc"
        },
        {
            "name": "Hex",
            "school": "enc"
        },
        {
            "name": "Hideous Laughter",
            "school": "enc"
        },
        {
            "name": "Hold Monster",
            "school": "enc"
        },
        {
            "name": "Hold Person",
            "school": "enc"
        },
        {
            "name": "Incite Greed",
            "school": "enc"
        },
        {
            "name": "Jim’s Glowing Coin",
            "school": "enc"
        },
        {
            "name": "Mass Suggestion",
            "school": "enc"
        },
        {
            "name": "Modify Memory",
            "school": "enc"
        },
        {
            "name": "Motivational Speech",
            "school": "enc"
        },
        {
            "name": "Otto's Irresistible Dance",
            "school": "enc"
        },
        {
            "name": "Power Word Kill",
            "school": "enc"
        },
        {
            "name": "Power Word Pain",
            "school": "enc"
        },
        {
            "name": "Power Word Stun",
            "school": "enc"
        },
        {
            "name": "Psychic Scream",
            "school": "enc"
        },
        {
            "name": "Sleep",
            "school": "enc"
        },
        {
            "name": "Suggestion",
            "school": "enc"
        },
        {
            "name": "Synaptic Static",
            "school": "enc"
        },
        {
            "name": "Tasha’s Hideous Laughter",
            "school": "enc"
        },
        {
            "name": "Vicious Mockery",
            "school": "enc"
        },
        {
            "name": "Zone of Truth",
            "school": "enc"
        },
        {
            "name": "Acid Arrow",
            "school": "evo"
        },
        {
            "name": "Aganazzar’s Scorcher",
            "school": "evo"
        },
        {
            "name": "Arcane Hand",
            "school": "evo"
        },
        {
            "name": "Aura of Vitality",
            "school": "evo"
        },
        {
            "name": "Bigby's Hand",
            "school": "evo"
        },
        {
            "name": "Blade Barrier",
            "school": "evo"
        },
        {
            "name": "Blinding Smite",
            "school": "evo"
        },
        {
            "name": "Booming Blade",
            "school": "evo"
        },
        {
            "name": "Branding Smite",
            "school": "evo"
        },
        {
            "name": "Burning Hands",
            "school": "evo"
        },
        {
            "name": "Chain Lightning",
            "school": "evo"
        },
        {
            "name": "Chaos Bolt",
            "school": "evo"
        },
        {
            "name": "Chromatic Orb",
            "school": "evo"
        },
        {
            "name": "Cone of Cold",
            "school": "evo"
        },
        {
            "name": "Contingency",
            "school": "evo"
        },
        {
            "name": "Continual Flame",
            "school": "evo"
        },
        {
            "name": "Crown of Stars",
            "school": "evo"
        },
        {
            "name": "Crusader’s Mantle",
            "school": "evo"
        },
        {
            "name": "Cure Wounds",
            "school": "evo"
        },
        {
            "name": "Dancing Lights",
            "school": "evo"
        },
        {
            "name": "Darkness",
            "school": "evo"
        },
        {
            "name": "Dawn",
            "school": "evo"
        },
        {
            "name": "Daylight",
            "school": "evo"
        },
        {
            "name": "Delayed Blast Fireball",
            "school": "evo"
        },
        {
            "name": "Destructive Wave",
            "school": "evo"
        },
        {
            "name": "Divine Favor",
            "school": "evo"
        },
        {
            "name": "Divine Word",
            "school": "evo"
        },
        {
            "name": "Earth Tremor",
            "school": "evo"
        },
        {
            "name": "Earthquake",
            "school": "evo"
        },
        {
            "name": "Eldritch Blast",
            "school": "evo"
        },
        {
            "name": "Faerie Fire",
            "school": "evo"
        },
        {
            "name": "Fire Bolt",
            "school": "evo"
        },
        {
            "name": "Fire Shield",
            "school": "evo"
        },
        {
            "name": "Fire Storm",
            "school": "evo"
        },
        {
            "name": "Fireball",
            "school": "evo"
        },
        {
            "name": "Flame Blade",
            "school": "evo"
        },
        {
            "name": "Flame Strike",
            "school": "evo"
        },
        {
            "name": "Forcecage",
            "school": "evo"
        },
        {
            "name": "Freezing Sphere",
            "school": "evo"
        },
        {
            "name": "Frostbite",
            "school": "evo"
        },
        {
            "name": "Green-Flame Blade",
            "school": "evo"
        },
        {
            "name": "Guiding Bolt",
            "school": "evo"
        },
        {
            "name": "Gust of Wind",
            "school": "evo"
        },
        {
            "name": "Hallow",
            "school": "evo"
        },
        {
            "name": "Heal",
            "school": "evo"
        },
        {
            "name": "Healing Word",
            "school": "evo"
        },
        {
            "name": "Hellish Rebuke",
            "school": "evo"
        },
        {
            "name": "Holy Weapon",
            "school": "evo"
        },
        {
            "name": "Ice Storm",
            "school": "evo"
        },
        {
            "name": "Immolation",
            "school": "evo"
        },
        {
            "name": "Jim’s Magic Missile",
            "school": "evo"
        },
        {
            "name": "Leomund’s Tiny Hut",
            "school": "evo"
        },
        {
            "name": "Light",
            "school": "evo"
        },
        {
            "name": "Lightning Bolt",
            "school": "evo"
        },
        {
            "name": "Lightning Lure",
            "school": "evo"
        },
        {
            "name": "Maddening Darkness",
            "school": "evo"
        },
        {
            "name": "Maelstrom",
            "school": "evo"
        },
        {
            "name": "Magic Missile",
            "school": "evo"
        },
        {
            "name": "Mass Cure Wounds",
            "school": "evo"
        },
        {
            "name": "Mass Heal",
            "school": "evo"
        },
        {
            "name": "Mass Healing Word",
            "school": "evo"
        },
        {
            "name": "Melf's Minute Meteors",
            "school": "evo"
        },
        {
            "name": "Melf’s Acid Arrow",
            "school": "evo"
        },
        {
            "name": "Meteor Swarm",
            "school": "evo"
        },
        {
            "name": "Moonbeam",
            "school": "evo"
        },
        {
            "name": "Mordenkainen’s Sword",
            "school": "evo"
        },
        {
            "name": "Otiluke's Freezing Sphere",
            "school": "evo"
        },
        {
            "name": "Otiluke’s Resilient Sphere",
            "school": "evo"
        },
        {
            "name": "Power Word Heal",
            "school": "evo"
        },
        {
            "name": "Prayer of Healing",
            "school": "evo"
        },
        {
            "name": "Prismatic Spray",
            "school": "evo"
        },
        {
            "name": "Ray of Frost",
            "school": "evo"
        },
        {
            "name": "Resilient Sphere",
            "school": "evo"
        },
        {
            "name": "Sacred Flame",
            "school": "evo"
        },
        {
            "name": "Scorching Ray",
            "school": "evo"
        },
        {
            "name": "Searing Smite",
            "school": "evo"
        },
        {
            "name": "Sending",
            "school": "evo"
        },
        {
            "name": "Shatter",
            "school": "evo"
        },
        {
            "name": "Shocking Grasp",
            "school": "evo"
        },
        {
            "name": "Sickening Radiance",
            "school": "evo"
        },
        {
            "name": "Snilloc’s Snowball Swarm",
            "school": "evo"
        },
        {
            "name": "Spiritual Weapon",
            "school": "evo"
        },
        {
            "name": "Staggering Smite",
            "school": "evo"
        },
        {
            "name": "Storm Sphere",
            "school": "evo"
        },
        {
            "name": "Sunbeam",
            "school": "evo"
        },
        {
            "name": "Sunburst",
            "school": "evo"
        },
        {
            "name": "Telepathy",
            "school": "evo"
        },
        {
            "name": "Thunderclap",
            "school": "evo"
        },
        {
            "name": "Thunderous Smite",
            "school": "evo"
        },
        {
            "name": "Thunderwave",
            "school": "evo"
        },
        {
            "name": "Tiny Hut",
            "school": "evo"
        },
        {
            "name": "Vitriolic Sphere",
            "school": "evo"
        },
        {
            "name": "Wall of Fire",
            "school": "evo"
        },
        {
            "name": "Wall of Force",
            "school": "evo"
        },
        {
            "name": "Wall of Ice",
            "school": "evo"
        },
        {
            "name": "Wall of Light",
            "school": "evo"
        },
        {
            "name": "Wall of Sand",
            "school": "evo"
        },
        {
            "name": "Wall of Stone",
            "school": "evo"
        },
        {
            "name": "Wall of Water",
            "school": "evo"
        },
        {
            "name": "Warding Wind",
            "school": "evo"
        },
        {
            "name": "Whirlwind",
            "school": "evo"
        },
        {
            "name": "Wind Wall",
            "school": "evo"
        },
        {
            "name": "Witch Bolt",
            "school": "evo"
        },
        {
            "name": "Word of Radiance",
            "school": "evo"
        },
        {
            "name": "Wrath of Nature",
            "school": "evo"
        },
        {
            "name": "Wrathful Smite",
            "school": "evo"
        },
        {
            "name": "Arcanist's Magic Aura",
            "school": "ill"
        },
        {
            "name": "Blur",
            "school": "ill"
        },
        {
            "name": "Color Spray",
            "school": "ill"
        },
        {
            "name": "Creation",
            "school": "ill"
        },
        {
            "name": "Disguise Self",
            "school": "ill"
        },
        {
            "name": "Distort Value",
            "school": "ill"
        },
        {
            "name": "Dream",
            "school": "ill"
        },
        {
            "name": "Fear",
            "school": "ill"
        },
        {
            "name": "Greater Invisibility",
            "school": "ill"
        },
        {
            "name": "Hallucinatory Terrain",
            "school": "ill"
        },
        {
            "name": "Hypnotic Pattern",
            "school": "ill"
        },
        {
            "name": "Illusory Dragon",
            "school": "ill"
        },
        {
            "name": "Illusory Script",
            "school": "ill"
        },
        {
            "name": "Invisibility",
            "school": "ill"
        },
        {
            "name": "Magic Mouth",
            "school": "ill"
        },
        {
            "name": "Major Image",
            "school": "ill"
        },
        {
            "name": "Mental Prison",
            "school": "ill"
        },
        {
            "name": "Minor Illusion",
            "school": "ill"
        },
        {
            "name": "Mirage Arcane",
            "school": "ill"
        },
        {
            "name": "Mirror Image",
            "school": "ill"
        },
        {
            "name": "Mislead",
            "school": "ill"
        },
        {
            "name": "Nystul’s Magic Aura",
            "school": "ill"
        },
        {
            "name": "Phantasmal Force",
            "school": "ill"
        },
        {
            "name": "Phantasmal Killer",
            "school": "ill"
        },
        {
            "name": "Phantom Steed",
            "school": "ill"
        },
        {
            "name": "Programmed Illusion",
            "school": "ill"
        },
        {
            "name": "Project Image",
            "school": "ill"
        },
        {
            "name": "Seeming",
            "school": "ill"
        },
        {
            "name": "Shadow Blade",
            "school": "ill"
        },
        {
            "name": "Silence",
            "school": "ill"
        },
        {
            "name": "Silent Image",
            "school": "ill"
        },
        {
            "name": "Simulacrum",
            "school": "ill"
        },
        {
            "name": "Weird",
            "school": "ill"
        },
        {
            "name": "Abi-Dalzim’s Horrid Wilting",
            "school": "nec"
        },
        {
            "name": "Animate Dead",
            "school": "nec"
        },
        {
            "name": "Astral Projection",
            "school": "nec"
        },
        {
            "name": "Bestow Curse",
            "school": "nec"
        },
        {
            "name": "Blight",
            "school": "nec"
        },
        {
            "name": "Blindness/Deafness",
            "school": "nec"
        },
        {
            "name": "Cause Fear",
            "school": "nec"
        },
        {
            "name": "Chill Touch",
            "school": "nec"
        },
        {
            "name": "Circle of Death",
            "school": "nec"
        },
        {
            "name": "Clone",
            "school": "nec"
        },
        {
            "name": "Contagion",
            "school": "nec"
        },
        {
            "name": "Create Undead",
            "school": "nec"
        },
        {
            "name": "Danse Macabre",
            "school": "nec"
        },
        {
            "name": "Enervation",
            "school": "nec"
        },
        {
            "name": "Eyebite",
            "school": "nec"
        },
        {
            "name": "False Life",
            "school": "nec"
        },
        {
            "name": "Feign Death",
            "school": "nec"
        },
        {
            "name": "Finger of Death",
            "school": "nec"
        },
        {
            "name": "Gentle Repose",
            "school": "nec"
        },
        {
            "name": "Harm",
            "school": "nec"
        },
        {
            "name": "Inflict Wounds",
            "school": "nec"
        },
        {
            "name": "Life Transference",
            "school": "nec"
        },
        {
            "name": "Magic Jar",
            "school": "nec"
        },
        {
            "name": "Negative Energy Flood",
            "school": "nec"
        },
        {
            "name": "Raise Dead",
            "school": "nec"
        },
        {
            "name": "Ray of Enfeeblement",
            "school": "nec"
        },
        {
            "name": "Ray of Sickness",
            "school": "nec"
        },
        {
            "name": "Resurrection",
            "school": "nec"
        },
        {
            "name": "Revivify",
            "school": "nec"
        },
        {
            "name": "Shadow of Moil",
            "school": "nec"
        },
        {
            "name": "Soul Cage",
            "school": "nec"
        },
        {
            "name": "Spare the Dying",
            "school": "nec"
        },
        {
            "name": "Speak with Dead",
            "school": "nec"
        },
        {
            "name": "Toll the Dead",
            "school": "nec"
        },
        {
            "name": "True Resurrection",
            "school": "nec"
        },
        {
            "name": "Vampiric Touch",
            "school": "nec"
        },
        {
            "name": "Alter Self",
            "school": "trs"
        },
        {
            "name": "Animal Shapes",
            "school": "trs"
        },
        {
            "name": "Animate Objects",
            "school": "trs"
        },
        {
            "name": "Arcane Weapon",
            "school": "trs"
        },
        {
            "name": "Awaken",
            "school": "trs"
        },
        {
            "name": "Barkskin",
            "school": "trs"
        },
        {
            "name": "Blink",
            "school": "trs"
        },
        {
            "name": "Bones of the Earth",
            "school": "trs"
        },
        {
            "name": "Catapult",
            "school": "trs"
        },
        {
            "name": "Control Flames",
            "school": "trs"
        },
        {
            "name": "Control Water",
            "school": "trs"
        },
        {
            "name": "Control Weather",
            "school": "trs"
        },
        {
            "name": "Control Winds",
            "school": "trs"
        },
        {
            "name": "Cordon of Arrows",
            "school": "trs"
        },
        {
            "name": "Create Homunculus",
            "school": "trs"
        },
        {
            "name": "Create or Destroy Water",
            "school": "trs"
        },
        {
            "name": "Darkvision",
            "school": "trs"
        },
        {
            "name": "Disintegrate",
            "school": "trs"
        },
        {
            "name": "Dragon's Breath",
            "school": "trs"
        },
        {
            "name": "Druidcraft",
            "school": "trs"
        },
        {
            "name": "Earthbind",
            "school": "trs"
        },
        {
            "name": "Elemental Bane",
            "school": "trs"
        },
        {
            "name": "Elemental Weapon",
            "school": "trs"
        },
        {
            "name": "Enhance Ability",
            "school": "trs"
        },
        {
            "name": "Enlarge/Reduce",
            "school": "trs"
        },
        {
            "name": "Erupting Earth",
            "school": "trs"
        },
        {
            "name": "Etherealness",
            "school": "trs"
        },
        {
            "name": "Expeditious Retreat",
            "school": "trs"
        },
        {
            "name": "Fabricate",
            "school": "trs"
        },
        {
            "name": "Feather Fall",
            "school": "trs"
        },
        {
            "name": "Flame Arrows",
            "school": "trs"
        },
        {
            "name": "Flesh to Stone",
            "school": "trs"
        },
        {
            "name": "Fly",
            "school": "trs"
        },
        {
            "name": "Gaseous Form",
            "school": "trs"
        },
        {
            "name": "Giant Insect",
            "school": "trs"
        },
        {
            "name": "Glibness",
            "school": "trs"
        },
        {
            "name": "Goodberry",
            "school": "trs"
        },
        {
            "name": "Guardian of Nature",
            "school": "trs"
        },
        {
            "name": "Gust",
            "school": "trs"
        },
        {
            "name": "Haste",
            "school": "trs"
        },
        {
            "name": "Heat Metal",
            "school": "trs"
        },
        {
            "name": "Investiture of Flame",
            "school": "trs"
        },
        {
            "name": "Investiture of Ice",
            "school": "trs"
        },
        {
            "name": "Investiture of Stone",
            "school": "trs"
        },
        {
            "name": "Investiture of Wind",
            "school": "trs"
        },
        {
            "name": "Jump",
            "school": "trs"
        },
        {
            "name": "Knock",
            "school": "trs"
        },
        {
            "name": "Levitate",
            "school": "trs"
        },
        {
            "name": "Lightning Arrow",
            "school": "trs"
        },
        {
            "name": "Longstrider",
            "school": "trs"
        },
        {
            "name": "Magic Stone",
            "school": "trs"
        },
        {
            "name": "Mass Polymorph",
            "school": "trs"
        },
        {
            "name": "Maximilian’s Earthen Grasp",
            "school": "trs"
        },
        {
            "name": "Meld into Stone",
            "school": "trs"
        },
        {
            "name": "Mending",
            "school": "trs"
        },
        {
            "name": "Message",
            "school": "trs"
        },
        {
            "name": "Mold Earth",
            "school": "trs"
        },
        {
            "name": "Move Earth",
            "school": "trs"
        },
        {
            "name": "Passwall",
            "school": "trs"
        },
        {
            "name": "Plant Growth",
            "school": "trs"
        },
        {
            "name": "Polymorph",
            "school": "trs"
        },
        {
            "name": "Prestidigitation",
            "school": "trs"
        },
        {
            "name": "Primal Savagery",
            "school": "trs"
        },
        {
            "name": "Purify Food and Drink",
            "school": "trs"
        },
        {
            "name": "Pyrotechnics",
            "school": "trs"
        },
        {
            "name": "Regenerate",
            "school": "trs"
        },
        {
            "name": "Reincarnate",
            "school": "trs"
        },
        {
            "name": "Reverse Gravity",
            "school": "trs"
        },
        {
            "name": "Rope Trick",
            "school": "trs"
        },
        {
            "name": "Sequester",
            "school": "trs"
        },
        {
            "name": "Shape Water",
            "school": "trs"
        },
        {
            "name": "Shapechange",
            "school": "trs"
        },
        {
            "name": "Shillelagh",
            "school": "trs"
        },
        {
            "name": "Skill Empowerment",
            "school": "trs"
        },
        {
            "name": "Skywrite",
            "school": "trs"
        },
        {
            "name": "Slow",
            "school": "trs"
        },
        {
            "name": "Speak with Plants",
            "school": "trs"
        },
        {
            "name": "Spider Climb",
            "school": "trs"
        },
        {
            "name": "Spike Growth",
            "school": "trs"
        },
        {
            "name": "Stone Shape",
            "school": "trs"
        },
        {
            "name": "Swift Quiver",
            "school": "trs"
        },
        {
            "name": "Telekinesis",
            "school": "trs"
        },
        {
            "name": "Tenser’s Transformation",
            "school": "trs"
        },
        {
            "name": "Thaumaturgy",
            "school": "trs"
        },
        {
            "name": "Thorn Whip",
            "school": "trs"
        },
        {
            "name": "Time Stop",
            "school": "trs"
        },
        {
            "name": "Tiny Servant",
            "school": "trs"
        },
        {
            "name": "Transmute Rock",
            "school": "trs"
        },
        {
            "name": "True Polymorph",
            "school": "trs"
        },
        {
            "name": "Water Breathing",
            "school": "trs"
        },
        {
            "name": "Water Walk",
            "school": "trs"
        },
        {
            "name": "Wind Walk",
            "school": "trs"
        },
        {
            "name": "Zephyr Strike",
            "school": "trs"
        }
    ],
    sources: [
        { id: null, name: 'System Reference Document (SRD)' },
        { id: 3, name: 'Dungeon Master\'s Guide' },
        { id: 6, name: 'Curse of Strahd' },
        { id: 7, name: 'Hoard of the Dragon Queen' },
        { id: 8, name: 'Lost Mine of Phandelver' },
        { id: 9, name: 'Out of the Abyss' },
        { id: 10, name: 'Princes of the Apocalypse' },
        { id: 11, name: 'Rise of Tiamat' },
        { id: 12, name: 'Storm King\'s Thunder' },
        { id: 15, name: 'Volo\'s Guide to Monsters' },
        { id: 16, name: 'The Sunless Citadel' },
        { id: 21, name: 'Against the Giants' },
        { id: 22, name: 'Tomb of Horrors' },
        { id: 25, name: 'Tomb of Annihilation' },
        { id: 33, name: 'Xanathar\'s Guide to Everything' },
        { id: 35, name: 'Waterdeep Dragon Heist' },
        { id: 36, name: 'Waterdeep Dungeon of the Mad Mage' },
        { id: 37, name: 'Wayfinder\'s Guide to Eberron' },
        { id: 38, name: 'Guildmasters\' Guide to Ravnica' },
        { id: 39, name: 'Guildmasters\' Guide to Ravnica' },
        { id: 40, name: 'Lost Laboratory of Kwalish' },
        { id: 44, name: 'Acquisitions Incorporated' },
        { id: 48, name: 'Baldur\'s Gate: Descent into Avernus' }
    ]
}

export default DICTIONARY;
