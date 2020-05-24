# Changelog

## [3.0.3] Hotfix

- Scene images renamed to reflect the scene name to avoid overwriting similar existing images

## [3.0.2] Hotfixes

### Added

- Scene imports now go into a respective subfolder relating to the adventure module page
- Remove excessive filename extensions on the uploaded map files

### Changed

- Default upload directories for avatar and scene upload now default to the base data directory
- Removed a wording in the english language file that referenced to the shared module, which is now in the user's responsitiblity to create and maintain. Since vtta-dndbeyond now creates the necessary world-specific compendiums automatically, this is not a real necessity, while still a nice-to-have
- Imported scenes that already exist will received an update on their base-specifics (size, grid, alignment, walls, lights), but do not re-upload the image automatically. In order to trigger a complete fresh start, delete the scene and re-import
 
## [3.0.0] Adventure, Ho!

This release is a major milestone for vtta-dndbeyond. Against all odds, I finally managed to get the latest Chrome extension version audited by Google... and not only that, but this time, it passed the review. It was like wrestling with the gods, and the gods didn't play fair, to be honest. I am looking forward to battling through the next update /s

But alas, it is here! And with numerous fixes to monster imports in general, a revamped UI, one really big hit: Adventure Module import. You can import whole pages within a D&D Beyond licensed adventure into Foundry VTT with a single click, that means that preparing has just become a whole lot less time-consuming (disclaimer: You still need to read through the module in advance ;)). While importing the data as Journal Entries is available for everyone to enjoy, the automatic import of scenes, alongside with custom scene thumbnails, adjustments to grids\* and walling/lighting\*\* is a benefit that my Patreons are having for themselves.

**Note:** \* grid and \*\* lightening/walls is an ongoing effort that will start after release. You can see the state of each map on the top of the Adventure Module page:

- An outlined star means: The scene is detected and it has (mostly, see "Known Issues" below) the scene descriptions declared, which are imported as single JournalEntries for quick and easy dragging onto the scene
- A half-filled star means that additionally, the map is sized to match the Foundry grid
- A fully-filled star states complete support including walling and lighting

### Fixed

- More robust parsing of monster blocks, including homebrew-monsters (still with limitations)
- Fixed multiple spells that were unable to parse

### Added

- Adventure Module import as
  - JournalEntries and RollTables, whereas the Tables within the JournalEntries will be replaced by a link to the respective RollTable
  - Scenes (Patreon-only)
- Character rolls with D&D Beyonds new 3D die: You need the character sheet open on D&D Beyond and an Actor with the same name as said character needs to belong to you and needs to be on the currently active scene. Currently, all rolls will simply be transferred over to Foundry, I will work on improvements on that in the future
- JournalEntries containing images include a hover-button that shows all connected players said image, lifting the restriction of being able to show just one single image per JournalEntry to the players
- Ability to "Alias-Roll" monsters:
  - Drag the same monster on a scene.
  - Double-click each token and rename each to a different name.
  - Reload the D&D Beyond Monster's page to see a dropdown array next to the monster's name. Change the alias of the monster to let the players see, which Night Hag of the Coven actually curses the poor paladin.

## [2.2.0] Storage Galore

This Release adds some improvements regarding storage integration: While testing was a bit cumbersome because of my inability to setup S3 reliably, I **think** I made some progress in supporting both S3 and hopefully the assets library of The Forge natively. This required a
patched version of settings-extender, which is currently in review by the author. Nevertheless, I am using my own modulized-version here, which **should not conflict** with other versions used by other mods out there. Having only 2h of sleep tonight, I might be very wrong though.

### Fixed

- Several parsing issues regarding character import

### Added

- Better error messages: On character import, the dialog gives way better error messaging (was: zero, now: detailed). If you are prompted to send something in, instructions will be displayed and the relevant error message is enriched by your system information (Foundry version, DND5e version, vtta-dndbeyond version), and marked for an easy copy/paste into the #parsing-errors channel. Please make use of that feature, and upload the failing JSON alongside your bug report, thanks!
- Support for S3 storage. Please check the Module Settings to browse to your bucket and select a folder. Known error: When using subfolders, the first entry within that subfolder is a blank entry, representing the parent folder. Not sure if that is a bug within Foundry or settings-extender.
- Added the option for cleaning up imported entities: You can now choose to keep a copy in the world, or if you just want to import into compendiums. You can render the module useless by neither importing into a compendium and by removing imported entities from the world at the same time, so make sure to double-check your settings
- Initial support to Warlock Hexblades

### Changed

- Using the Upload routine provided by Foundry instead of using a custom POST routine instead
- Changed the CORS proxy used for downloading the images, setting the correct Content-Type on downloading

## [2.1.7] Support for dnd5e 0.8.8

### Fixed

- Fixed broken character import on dnd5e 0.8.8. While the current changes are backwards compatible, the next release of this module will only support 0.8.8 and up, so please update your game system

### Added

- Better (any!) error messages on parsing errors
- Preparations for adventure module import

## [2.1.6] Hotfix

### Fixed

- Fixed a hit die issue for certain classes
- Fixed compendium updates not working correctly

### Added

- Feats: Observant, Remarkable Athlete
- Item affects improvements and skill bonuses

## [2.1.5]

### Fixed

- Adjusted to the changed lookup id for compendium lookups
- Characters were not able to get updated in compendiums even if the correct setting was applied
- Improved parsing of magic items

### Added

- Initial support for Bloodhunter and Eldritch Knight

## [2.1.4] Foundry 0.5.5 compatability release

**Note**: This release is available for 0.5.5 and up only.

- Included the officially release settings-extender instead of my patched one
- Added failsaves for corrupt game settings stored in the database

### Fixed

- Speed and Class Feature fixes (thanks @MrPrimate!)
- Great Weapon Fighting & Dueling support (thanks @MrPrimate)

## [2.1.2] Hotfix for Spell imports

## [2.1.1] Hotfix for pre-0.5.4

## [2.1.0] Spreading the Wings

This release is something special: @MrPrimate dedicated his time to work on improvements in the general spell section, and he didn't stop there: With this release, the fantastic module of @Simone, "Magic Items" is officially integrated when importing characters.

That means that magical items are having now specific spells imbued into them which brings a whole lot of comfort in dealing with those in your regular game. Please check out the module at his [Gitlab Repository](https://gitlab.com/riccisi/foundryvtt-magic-items) if that sounds interesting to you.

One change in general usage is included in this release and is up for discussion: The default import target is now always the current world, that means instead of having two buttons on e.g. a monster page, there is just one: "Import into Foundry". You can still choose to import the monsters and spells into your target compendiums, but you can now choose to just ignore the imports just keep everything at world-level.

_Note_: The chrome extension fixes need a Google review. The update will be installed automatically when it is available, and I am planning to incorporate at least one bigger feature I had in mind, so this will take some more time to get rolled out.

### Added

- The [B]-Button makes a prominent re-appearance on NPC sheets that were imported via the Chrome extension. The buttons opens up the popup to the D&D Beyond source so you can quickly refer to that site in the heat of the battle. You can even roll from there
- So many improvements coming in from MrPrimate:

  - Support for Divine Smite
  - Eldritch Blast _pewpew_
  - Spell scaling fixes
  - Support for the built-in feats in the DND5e system like halflings luck and others
  - Speed boni granted by certain features
  - AC coming in correctly for Tortles and Lizardfolk and
  - unarmed attacks are now using the correct die. Phew! the list goes on an on and on...

  You are amazing, MrPrimate.

- Chrome Extension: Added support of Monster rolls for "Named Actors". If you have several tokens based of the same actor on the currently active scene and if you have renamed those actors you will be able to choose which alias should be displayed on the chatlog message of the roll.
- Chrome Extension: Added user feedback on importing entities to Foundry.

### Fixed

- Several compatibility changes in preparation for Foundry v0.5.4
- Compendium import is now working correctly, too
- Transmutation spells are now flagged correctly
- Chrome extension: Fixed several spells not parsing at all (Forbiddance, Guards and Wards and others)
- Chrome extension: Parsing of spellcasting blocks enhanced
- Chrome extension: Made several changes to the parser in order to make it more robust, thus enabling parsing of multiple homebrew monsters that failed recently
- Chrome extension: Links back to D&D Beyond are now correctly directing to the D&D Beyond server instead to your Foundry webserver

### Changed

- Creating Actor5 entities instead of Actor entities now on Monster import
- CSS changes on the module settings to align the file picker buttons to the input fields

## [2.0.3] Foundry 0.5.3 compatability release

### Changed

- Set compatibleCoreVersion to 0.5.3

### Fixed

- Imports into compendiums are working again

## [2.0.2] Hotfix

Small update to fix a spellparsing issue

## [2.0.1]

Notable improvements in terms of Character imports regarding spells was provided by major contributions of fellow user/developer MrPrimate. Thanks a bunch, that's pretty awesome!

### Fixed

- Many more specific spell sources are now parsing correctly and adding the spells to the character within Foundry. This includes especially Warlocks, but goes to innate spellcasting behaviour by classes that are normally no spellcasters at at. This was brought to you by @MrPrimate (see above)
- The total weight of bundled items was calculated wrongly, now showing up the total weight correctly. Thanks @ohporter for reporting the issue
- Hitting enter with a focused text-field no longer opens the character import window. Thanks @mtvjr for suggesting this enhancement
- Character and monsters are still importing even if the image upload fails. You will see a yellow warning notification on the screen if that happens, suggesting to check the settings for setting a correct, existing path that is writable. The import does not fail silently anymore because of that. Thanks @dpro for this suggestion
- Reworked the way vtta-dndbeyond queries vtta-iconizer for suitable icons, making it compatible for Foundry 0.5.2 and prior

## [2.0]

Celebrating the 100th Patreon supporter, the modules from Virtual Tabletop Assets will be released on public repositories, and the Chrome extension will be made available on the Chrome Web Store - along with delayed release cycles and manually timed releases between the Chrome extension and the campanion module vtta-dndbeyond, let's see how that works out.

This marks some major changes that are now possible:

- Publicly viewable issue trackers
- Possibility to work with the community on changes, like accepting changes
- In general, a broader availability of my modules

The Chrome extension will be working in two modes:

- "Basic mode" allows the import of everything covered by the SRD, or marked "Basic Rules" on D&D Beyond
- "Patreon mode" allows the import of everything else on top.

In the spirit of Dungeons & Dragons, this will make the toolset available for a rather large portion of the available content on D&D Beyond and likewise, making it possible for a broader audience to make use of these tools free of charge.

For patreon will be a lot in store in the future, and now even: Importing all monsters, including homebrew variants as long as they are parseable by following the official formatting (or at least do not stray further than the official monsters do), and eventually adventure module export - yeah, great news, I have some nifty ideas on how to tackle that and this will be on the roadmap for 2020.

### Fixed

- Cleaned the flags up and provided correct namespacing (yeah, I do claim vtta as a namespace for me ;)

### Added

- When importing Monsters, subfolders according to monster type will be created to organize the imports a little bit better. Thanks for the suggestion, @sky

## [1.1.1]

### Fixed

- Character import updates the item and spell compendium now correctly again
- Initative values for monster imports were calculated correctly, but would be account to twice when Foundry created the entity, this is now corrected

### Changed

- Changed the seperator for proficiencies from comma to semicolon in order to have nicer labels on the default DND5e character sheeet

## [1.1]

### Added

- Compatibility for Foundry VTT v0.4.4 and higher
- Enabling or disable via CONFIG: `CONFIG.debug.vtta.dndbeyond = <object>` enables or disables debug logging in the console.log for certain sections of the module:

  dndbeyond.basic: TRUE|FALSE, // general logging
  dndbeyond.messaging: TRUE|FALSE, // regarding communication between components
  dndbeyond.character: TRUE|FALSE, // regarding character import
  dndbeyond.extension: TRUE|FALSE // regarding extension imports/ additions to the world

### Removed

- Compatibility for Foundry VTT v0.4.3 and lower

### Fixed

- Improved parsing by cleaning &nbsp; from random D&D Beyond markup, replacing them by regular spaces
- [B] Import Button CSS fixes for Foundry VTT v0.4.4, does not react on hitting the Enter key any more

## [1.0.10] Hotfix

### Fixed

- Compendium import was not bugging out if Iconizer was not responding/missing. I want you to use my modules, but I don't want to enforce them that way ;)

### Added

- Supporting Feat "Tough" for Hitpoint calculation

## [1.0.9]

Due to a change in the settings for the module you will need to revisit them. Instead of specifying target compendiums by name, you will select them in a select input, which should yield in lesser errors, especially for newer users. Nevertheless, the old settings will be stored unless you open the settings at least once and select your desired compendiums again.

### Fixed

- Some spells were parsed as ranged attack incorrectly (thanks @n3rf_herder), switched action type to melee spell attack if range is self our touch

- Fixed spell save DC for character imports (thanks @n3rf_herder) which were always based on the character's spellcasting ability instead of the correct ability

- Defaulting weapon properties thrown, finesse, reach to false as intended

- Fixed formula to calculate a modifier based on a value

- Used bundlesize to calculate the real weight of each item in for stacked items (Ball Bearings, I am looking at you)

- Legendary Action count not parsing correctly

- Legendary Action and Resistance current values fixed, set to max values

- Senses, and custom senses are now reflected in the token settings. Truesight and Brightsight refer to "Bright Sight" (Foundry), Darkvision to "Dim Sight" (Foundry). Magical bonuses from items are influencing those values, too, if the item is worn by the character (ref Goggles of Night)

- Fixed two bugs regarding armor class calculation for character imports

- Add only spells to a monster import that are in the sections "Spellcasting" and "Innate Spellcasting", but not in other section as references (see https://www.dndbeyond.com/monsters/acererak, section "Invoke Curse" for an example of spells that are not added any longer)

### Added

- Used [Azzurite's Settings Extender](https://gitlab.com/foundry-azzurite/settings-extender) to simplify configuration

- Feats are now parsed and added to the character's features, too

- Personality Traits, Ideals, Bonds and Flaws are now part of the biography section

### Changed

- Set spell save DC for character imports to be null, e.g. to be based on the current ability values. This enables characters to advance within Foundry and that save value to always be correct (thanks @n3rf_herder)

- Testing: Set the base proficiency for monsters to be 2 in order to avoid strange to hit bonuses for lower (0-1/2) level monsters

- Limited use features are now marked as such and generated as limited use features of the character. In past releases, those were only shown in as primary, secondary and tertiary resources and therefore limited to a maximum of three, now all are shown and accessible, including resets on long or short rests.

- Not setting values for the following token settings on import anymore: brightLight, dimLight, lightAngle, scale

- On monster import, differentiated between chat description without attack details and item description (full details)

## [1.0.8]

### Added

- Rollable buttons on the monster pages: Abilities, Skills and Features/ Actions should now work propery. In order to use and see these buttons, the actor must be added to the current world first. All shortcuts for rolls you know from Foundry are working, so holding SHIFT, CTRL or ALT works as a "Regular ROll", "Disadvanted Roll" and "Advantaged" roll as expected.

### Changed

- If a monster is already present in the current world, the "Add to World" now acts as an update to avoid creating multiple copies of the same actor. If you want to have multiple copies of an actor, please add it once, rename it within Foundry and add it again

### Fixed

- Added support for swarm types that weren't parsing correctly as in terms of "size" (thanks @tposney)
- Fixed a bug in calculating spell slots and cantrips known for multiclassing spellcasters (thanks @Hailot)
- Improved Action parsing (this will be an ongoing process, please report improvable parsings)

## [1.0.7]

- Added size 'huge' to monster parsing (thanks @tposney)

## [1.0.6] - 2019-12-21

- Enhanced compatibility with Beyond20
- Stopping page process on main category pages (/monsters, /spells)

## [1.0.5] - 2019-12-21

- Multiple fixes, patreon-internal release
- Special thanks to @tposney to iron out so many bugs before anyone else was bothered by it

## Fixed

- Race condition asking iconizer for icons, now import goes on if iconizer is not responding in a timely manner

- Character import was malfunctioning after refactoring, this is fixed now

## [1.0.4] - 2019-12-20

### Added

- Monster import

### Changed

- Image upload changed from 'source = user' to 'source = data' to upload to user data directory, resulting in a 0.4.2 requirement of Foundry VTT
- Removed ability to choose to not import entities at all, after all this is what this module really is about

## [1.0.3b] - 2019-12-10

### Fixed

- Added missing ability modifiers for weapon attacks

## [1.0.3] - 2019-12-10

### Added

- Added Cantrip- (implemented in Foundry 0.4.1) and Spell-Scaling (currently not yet implemented in Foundry 0.4.1)
- Added Unarmed Attack for Monks (DEX or STR based attack plus Monk Martial Arts die). While Unarmed Strikes are displayed on the character sheet for every character, it is within the JSON for Monks available only

### Fixed

- Spell preparation mode was not working as intended (thanks @Alamaise and @nerf_herder)
- Allowing dashes (`-`) and underscores (`_`) in the D&D Beyond username now, too (thanks @Alamaises)

### Changed

- Changed the spell preparation mode for several classes from "always" to "prepared" in order to show spell slots for those classes. This change can be reversed once the GUI for the default character sheet shows spell slots even for spells that do not need preparing

## [1.0.2] - 2019-21-11

### Added

- Token configuration with vision settings

### Fixed

- D&D Beyond button color indication (correct D&D Beyond Character URL set: red, otherwise white-ish)

## [1.0.1] - 2019-20-11

### Added

- Indicators for user feedback on setting the D&D Beyond URL

### Fixed

- Parsing of Wondrous Items was not detected correctly
- Description of features was added incorrectly to the corresponding item
- CSS fix for the D&D Beyond button
- Integrated the functionality of DDBPopper into this module, thanks @errational for suggesting to join forces

### Changed

- The key modifier for opening the D&D Beyond Charactersheet is how SHIFT, was: CTRL
- Set the application name instead of displaying it as a header

## [1.0.0] - 2019-20-11

### Added

- Initial release

### Removed

- Support for Foundry v0.3.9 and prior
