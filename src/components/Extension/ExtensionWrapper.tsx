import { useEffect, useState } from "react";
import Extension from "./Extension.tsx";
import { Spinner, Button, Sticker } from "@tableau/tableau-ui";
// import { TableauError } from "@tableau/extensions-api-types";
import { Settings, defaultSettings } from "../../settings.ts";
import "./Extension.css";

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
  const [dashboard, setDashboard] = useState({});
  const [ready, setReady] = useState<ExtensionState>(ExtensionState.Init);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] useEffect initialize");
    (async () => {
      await tableau.extensions.initializeAsync({ configure: configure as () => object });
      setDashboard(tableau.extensions.dashboardContent!.dashboard);
      const settings = tableau.extensions.settings.getAll();
      if (Object.keys(settings).length > 0) {
        import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Existing settings found:", settings);
        await new Promise((resolve) => setTimeout(resolve, 1000)); // add delay to showcase spinner
        updateSettingsData(settings);
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
      const settings: Settings = { ...defaultSettings }; // creates a shallow copy
      import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Validating extension settings");
      if ("metaVersion" in rawSettings && parseInt(rawSettings.metaVersion)) {
        settings.metaVersion = parseInt(rawSettings.metaVersion);
        settings.buttonLabel = rawSettings.buttonLabel;
        settings.buttonStyle = rawSettings.buttonStyle;
        setSettings(settings);
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
      import.meta.env.DEV && console.log("[ExtensionWrapper.tsx] Changing popup window URL for older versions:", popupUrl);
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
          import.meta.env.DEV && console.warn("[ExtensionWrapper.tsx] Update settings without listener");
          const settings = tableau.extensions.settings.getAll();
          updateSettingsData(settings);
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
