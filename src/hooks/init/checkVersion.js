import utils from "../../utils.js";

const getLatestVersion = async (manifestUrl) => {
  return new Promise((resolve, reject) => {
    fetch(manifestUrl)
      .then((data) => data.json())
      .then((json) => resolve(json.version))
      .catch((error) => reject(error));
  });
};

export default async () => {
  // check version number only for GMs
  if (!game.user.isGM) return;

  const moduleInfo = game.modules.get("vtta-dndbeyond").data;
  const installedVersion = moduleInfo.version;
  try {
    const latestVersion = await getLatestVersion(moduleInfo.manifest);
    if (utils.versionCompare(latestVersion, installedVersion) === 1) {
      let text = $(
        "<h2>Please Update</h2><p>A new <b>vtta-dndbeyond</b> version is available. Please update to <b>v" +
          latestVersion +
          "</b> if you are experiencing issues and before reporting a bug.</p>"
      );
      window.vtta.notification.show(text, null);
    }
  } catch (error) {
    window.vtta.notification.show("Could not retrieve latest vtta-dndbeyond version");
  }
};
