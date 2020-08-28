const logger = {
    log: (logLevel, ...data) => {
        if (!logLevel || !data || typeof (logLevel) !== 'string') {
            return;
        }

        logLevel = logLevel.toUpperCase();

        const setting = game.settings.get("vtta-dndbeyond", "log-level");
        const logLevels = ["VERBOSE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL", "OFF"];
        const logLevelIndex = logLevels.indexOf(logLevel);
        if (setting == "OFF" ||
            logLevelIndex === -1 ||
            logLevelIndex < logLevels.indexOf(setting)) {
            return;
        }

        const LOG_PREFIX = "VTTA D&D Beyond";
        let msg = "No logging message provided.  Please see the payload for more information.";
        let payload = data.slice();
        if (data[0] && typeof (data[0] == 'string')) {
            msg = data[0];
            if (data.length > 1) {
                payload = data.slice(1);
            } else {
                payload = null;
            }
        }
        msg = `${LOG_PREFIX} | ${logLevel} > ${msg}`;
        switch (logLevel) {
            case "VERBOSE":
            case "DEBUG":
                if (payload) {
                    console.debug(msg, ...payload);// eslint-disable-line no-console
                } else {
                    console.debug(msg);// eslint-disable-line no-console
                }
                break;
            case "INFO":
                if (payload) {
                    console.info(msg, ...payload);// eslint-disable-line no-console
                } else {
                    console.info(msg);// eslint-disable-line no-console
                }
                break;
            case "WARN":
                if (payload) {
                    console.warn(msg, ...payload);// eslint-disable-line no-console
                } else {
                    console.warn(msg);// eslint-disable-line no-console
                }
                break;
            case "FATAL":
            case "ERROR":
                if (payload) {
                    console.error(msg, ...payload);// eslint-disable-line no-console
                } else {
                    console.error(msg);// eslint-disable-line no-console
                }
                break;
            default: break;
        }
    },

    verbose: (...data) => {
        logger.log("VERBOSE", data);
    },

    debug: (...data) => {
        logger.log("DEBUG", ...data);
    },

    info: (...data) => {
        logger.log("INFO", ...data);
    },

    warn: (...data) => {
        logger.log("WARN", ...data);
    },

    error: (...data) => {
        logger.log("ERROR", ...data);
    },

    fatal: (...data) => {
        logger.log("FATAL", ...data);
    }
};
export default logger;
