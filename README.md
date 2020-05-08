# VTTA D&D Beyond

The integration module provides you with the possibility to import

- characters and their related
- spells and
- inventory items

into the world and designated compendium packs.

The data model is migrated to the Foundry 0.4.4 data model and provides way more information than the prior suite that was thouroughly tested by my lovely patreons. All the experiences I made during this process lead to the development of this module, and I am so happy for all the people that are supporting this development - thank you, everyone!

## Pre-requisites and recommendations

- Three created compendiums that are under your personal control. You can either create a small module providing the compendium packs (I will provide information on how to do that later), or simply create those compendiums in the world you are using for your games. You will need to Item Compendiums, one for spells, the other for items, and an actor compendium for monster imports.

- [The Tokenizer](https://www.vttassets.com/asset/vtta-tokenizer) and
- [The Iconizer](https://www.vttassets.com/asset/vtta-iconizer)

both are great companions to this module and make working with new content a joyful experience. Give them a shot!

- [The Chrome Extension](https://www.vttassets.com/asset/vtta-dndbeyond) allows the import of monsters and spells directly from the D&D Beyond website. While the SRD content, ie. all monsters in the Basic Rules, are importable for everyone, all other monsters from sourcebooks including homebrew monsters require a Patronage on my [Patreon campaign](https://www.patreon.com/join/vttassets).


## Configuration

### Avatar upload directory

Sets the icon directory where you are storing your avatar image uploads. It is relative to the Foundry `/Data` directory, please do not add a leading or trailing slash to this path.

Examples:

- `img/uploads` references to `[Foundry]/Data/img/uploads`
- `uploads` references to `[Foundry]/Data/uploads`
- `` references to `[Foundry]/Data` - probably not recommended

# Entity import policy

Three settings are available:

- **Save all entities, overwrite existing ones** - Imported entities will be saved to their designated compendium, which you will set below. Existing entries will be updated/ overwritten. Great if you want to import all your stuff into Foundry
- **Save new entities only, do not overwrite existing ones** - Import only entities currently not available in the compendiums
- **Replace only default icons** - The icon will be replaced only if the current icon is the default icon (mystery man)
- **Do not save the entities at** all - Just do nothing. If you choose this, you do not need to set the compendium entries below

# Item compendium, Spell compendium and Monster compendium

Select the three created compendiums: Spell compendium is required, the other ones are optional.
