import { useEffect, useState } from "react";
import Extension from "./Extension.tsx";
import { Spinner, Button, Sticker } from "@tableau/tableau-ui";
// import { TableauError } from "@tableau/extensions-api-types";
import { Settings, parseSettings } from "../../settings.ts";
import "./Extension.css";
import { Dashboard } from "@tableau/extensions-api-types";

/* Declare this so our linter knows that tableau is a global object
global tableau
import "../../../public/lib/tableau.extensions.1.latest.min.js?raw";
*/

enum ExtensionState {
  Init,
  Config,
  Ready
}

export default function ExtensionWrapper() {
  const [dashboard, setDashboard] = useState<Dashboard>();
  const [ready, setReady] = useState<ExtensionState>(ExtensionState.Init);
  const [settings, setSettings] = useState<Settings>();

  useEffect(() => {
    import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] useEffect initialize");
    (async () => {
      await tableau.extensions.initializeAsync({ configure: configure as () => object });
      setDashboard(tableau.extensions.dashboardContent!.dashboard);
      const allSettings = tableau.extensions.settings.getAll();
      if (Object.keys(allSettings).length > 0) {
        import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Applying existing settings");
        // await new Promise((resolve) => setTimeout(resolve, 1000)); // add delay to showcase spinner
        updateSettingsData(allSettings);
      } else {
        // cannot call configure() directly because browser will block a popup
        setReady(ExtensionState.Config);
      }
    })();
    return () => {
      // Component unmount code
      import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] useEffect callback");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSettingsData(rawSettings: { [key: string]: string }) {
    try {
      import.meta.env.DEV && console.trace("[ExtensionWrapper.tsx] Validating extension settings");
      if ("metaVersion" in rawSettings && parseInt(rawSettings.metaVersion)) {
        setSettings(parseSettings(rawSettings));
        setReady(ExtensionState.Ready);
      }
    } catch (e) {
      console.error("Error updating settings:", e);
    }
  }

  const configure = () => {
    import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Opening configure popup dialog window");

    let popupUrl = "config.html";
    const tableauVersion = tableau.extensions.environment.tableauVersion.split(".");
    // if tableauVersion < 2019.3 we need an absolute URL
    if (
      parseInt(tableauVersion[0], 10) === 2018 ||
      (parseInt(tableauVersion[0], 10) === 2019 && parseInt(tableauVersion[1], 10) < 3)
    ) {
      const href = window.location.href;
      popupUrl = window.location.href.substring(0, href.lastIndexOf("/")) + "/config.html";
      import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Dialog window URL for older versions:", popupUrl);
    }

    (async () => {
      const unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(
        tableau.TableauEventType.SettingsChanged,
        (settingsEvent) => {
          import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] SettingsChanged event:", settingsEvent);
          updateSettingsData(tableau.extensions.settings.getAll());
        }
      );
      try {
        const payload = await tableau.extensions.ui.displayDialogAsync(popupUrl, "", {
          height: 650,
          width: 500,
        });
        import.meta.env.DEV && console.log(`[ExtensionWrapper.tsx] Returning from config window (${payload})`);
        // in normal case, the SettingsChanged event will be emitted, so we don't need to update extra
        if (payload && unregisterSettingsEventListener === undefined) {
          // unregisterSettingsEventListener cannot be empty, but we'll handle it anyway
          import.meta.env.DEV && console.warn("[ExtensionWrapper.tsx] Update settings without unregisterSettingsEventListener");
          updateSettingsData(tableau.extensions.settings.getAll());
        }
      } catch (error) {
        if (typeof error === "object" && error !== null && "errorCode" in error) {
          switch (error.errorCode) {
            case tableau.ErrorCodes.DialogClosedByUser:
              import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Dialog window was closed by the user");
              break;
            default:
              console.error("[ExtensionWrapper.tsx]", error);
          }
        }
      } finally {
        import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Unregister SettingsChanged event handler");
        if (unregisterSettingsEventListener) {
          // cannot be empty in normal case
          unregisterSettingsEventListener();
        }
      }
    })();
  };

  return (
    <>
      {ready === ExtensionState.Init && (
        <div aria-busy="true" className="overlay">
          <div className="centerOnPage">
            <Spinner color="dark" />
          </div>
        </div>
      )}
      {ready === ExtensionState.Config && tableau.extensions.environment.mode === "authoring" && (
        <div className="centerOnPage">
          <Button kind="outline" onClick={configure}>
            Configure Extension
          </Button>
        </div>
      )}
      {ready === ExtensionState.Config && tableau.extensions.environment.mode === "viewing" && (
        <div className="centerOnPage">
          <Sticker stickerType="yellow">This extension needs configuring</Sticker>
        </div>
      )}
      {ready === ExtensionState.Ready && (
        <Extension dashboard={dashboard} settings={settings} />
      )}
    </>
  );
}
