export default function() {
  let enabledDebugLogging = true;

  let defaults = {
    general: enabledDebugLogging,
    messaging: enabledDebugLogging,
    character: enabledDebugLogging,
    extension: enabledDebugLogging,
  };

  if (!CONFIG.debug.vtta) {
    CONFIG.debug.vtta = { dndbeyond: defaults };
  } else {
    CONFIG.debug.vtta.dndbeyond = defaults;
  }
}
