export default function (entity, data) {
  return new Promise((resolve, reject) => {
    let roll = data.roll;
    let event = data.event;

    switch (roll.rollType) {
      case "ABILITY":
        switch (roll.subtype) {
          case "SAVE":
            entity.rollAbilitySave(roll.name, { event: event });
            resolve({ body: "Ability save rendered successfully" });
            break;
          case "CHECK":
            entity.rollAbility(roll.name, { event: event });
            resolve({ body: "Ability save rendered successfully" });
            break;
        }
        break;
      case "SKILL":
        entity.rollSkill(roll.name, { event: event });
        resolve({ body: "Ability save rendered successfully" });
        break;
      default:
        let item = entity.items.find((item) => item.name === roll.name);
        if (item) {
          // Roll spells through the actor
          if (item.data.type === "spell") {
            return entity.useSpell(item, { configureDialog: !event.shiftKey });
          }

          // Otherwise roll the Item directly
          else return item.roll();
        } else {
          reject("Unknown item");
        }
        break;
    }

    reject("Unknown roll command");
  });
}
