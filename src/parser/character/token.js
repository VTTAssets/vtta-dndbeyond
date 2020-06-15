import { getSensesLookup } from "./senses.js";

export function getToken(data) {
  // Default to the most basic token setup.
  // everything else can be handled by the user / Token Mold
  let tokenData = {
    actorLink: true,
  };

  let senses = getSensesLookup(data);

  // Blindsight/Truesight
  if (senses.find((sense) => sense.name === "Truesight" || sense.name === "Blindsight") !== undefined) {
    let value = senses
      .filter((sense) => sense.name === "Truesight" || sense.name === "Blindsight")
      .reduce((prev, cur) => (prev > cur.value ? prev : cur.value), 0);
    tokenData.brightSight = value;
  }

  // Darkvision
  if (senses.find((sense) => sense.name === "Darkvision") !== undefined) {
    tokenData.dimSight = senses.find((sense) => sense.name === "Darkvision").value;
  }
  return tokenData;
}
