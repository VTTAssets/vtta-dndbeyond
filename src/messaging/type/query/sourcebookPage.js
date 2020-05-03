import utils from "../../../utils.js";

const querySourcebookPage = async (message) => {
  const sourcebook = message.name;
  //   const message = {
  //     name: {
  //       abbrev: "DDIA-MORD",
  //       baseUrl: "https://www.dndbeyond.com/sources/ddia-mord",
  //       img:
  //         "https://media-waterdeep.cursecdn.com/avatars/319/345/636622116959280867.jpeg",
  //       name: "Rrakkma",
  //       pageTitle: "Adventure Primer",
  //     },
  //     type: "sourcebook",
  //   };

  // let's try to search for a folder containing Journal
  let folder = game.folders.entities.find(
    (f) =>
      f.data.type === "JournalEntry" &&
      f.data.name === sourcebook.pageTitle &&
      f.data.flags.vtta &&
      f.data.flags.vtta.dndbeyond &&
      f.data.flags.vtta.dndbeyond.abbrev === sourcebook.abbrev
  );
  const result = {
    user: {
      name: game.user.name,
      isGM: game.user.isGM,
    },
    world: {
      name: game.world.name,
      folder: folder,
    },
  };

  return result;
};

export default querySourcebookPage;
