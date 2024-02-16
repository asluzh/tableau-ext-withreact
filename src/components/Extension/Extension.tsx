import { useEffect, useState } from "react";
import ExtensionHandler from "./ExtensionHandler";
import { Spinner } from "@tableau/tableau-ui";
// import { TableauError } from "@tableau/extensions-api-types";
import { Settings, defaultSettings } from "../../interfaces";
import "./Extension.css";

// Declare this so our linter knows that tableau is a global object
/* global tableau */

// import "../../../public/lib/tableau.extensions.1.latest.min.js?raw";

export default function Extension() {
  const [dashboard, setDashboard] = useState({});
  const [doneLoading, setDoneLoading] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    console.log("[Extension.tsx] useEffect initialize");
    (async () => {
      await tableau.extensions.initializeAsync({ configure: configure as () => object });
      setDashboard(tableau.extensions.dashboardContent!.dashboard);
      const settings = tableau.extensions.settings.getAll();
      console.log("[Extension.tsx] Register SettingsChanged event handler");
      if (settings === undefined) {
        // console.log(tableau.extensions.environment.mode);
        configure();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // add delay to showcase spinner
        updateSettingsData(settings);
      }
    })();
    return () => {
      // Component unmount code
      console.log("[Extension.tsx] useEffect callback");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSettingsData(rawSettings: { [key: string]: string }) {
    try {
      const settings: Settings = { ...defaultSettings }; // creates a shallow copy
      if ("metaVersion" in rawSettings && parseInt(rawSettings.metaVersion)) {
        console.log("[Extension.tsx] Validating extension settings");
        settings.metaVersion = parseInt(rawSettings.metaVersion);
        settings.buttonLabel = rawSettings.buttonLabel;
        settings.buttonStyle = rawSettings.buttonStyle;
      }
      setSettings(settings);
      setDoneLoading(true);
    } catch (e) {
      console.error("Error updating settings:", e);
    }
  }

  const configure = () => {
    console.log("[Extension.tsx] Opening configure popup dialog window");

    let popupUrl = "config.html";
    const tableauVersion = tableau.extensions.environment.tableauVersion.split(".");
    // if tableauVersion < 2019.3 we need an absolute URL
    if (
      parseInt(tableauVersion[0], 10) === 2018 ||
      (parseInt(tableauVersion[0], 10) === 2019 && parseInt(tableauVersion[1], 10) < 3)
    ) {
      const href = window.location.href;
      popupUrl = window.location.href.substring(0, href.lastIndexOf("/")) + "/config.html";
      console.log("[Extension.tsx] Changing popup window URL for older versions:", popupUrl);
    }

    (async () => {
      const unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(
        tableau.TableauEventType.SettingsChanged,
        (settingsEvent) => {
          console.log("[Extension.tsx] SettingsChanged event:", settingsEvent);
          updateSettingsData(tableau.extensions.settings.getAll());
        }
      );
      try {
        const payload = await tableau.extensions.ui.displayDialogAsync(popupUrl, "", {
          height: 650,
          width: 500,
        });
        console.log(`[Extension.tsx] Returning from config window (${payload})`);
        // in normal case, the SettingsChanged event will be emitted, so we don't need to update extra
        if (payload && unregisterSettingsEventListener === undefined) {
          // unregisterSettingsEventListener cannot be empty, but we'll handle it anyway
          console.log("[Extension.tsx] Update settings without listener");
          const settings = tableau.extensions.settings.getAll();
          updateSettingsData(settings);
        }
      } catch (error) {
        if (typeof error === "object" && error !== null && "errorCode" in error) {
          switch (error.errorCode) {
            case tableau.ErrorCodes.DialogClosedByUser:
              console.log("[Extension.tsx] Dialog window was closed by the user");
              break;
            default:
              console.error("[Extension.tsx]", error);
          }
        }
      } finally {
        console.log("[Extension.tsx] Unregister SettingsChanged event handler");
        if (unregisterSettingsEventListener) {
          // cannot be empty in normal case
          unregisterSettingsEventListener();
        }
      }
    })();
  };

  return (
    <>
      {!doneLoading && (
        <div aria-busy="true" className="overlay">
          <div className="centerOnPage">
            <Spinner color="dark" />
          </div>
        </div>
      )}
      {doneLoading && <ExtensionHandler settings={settings} dashboard={dashboard} />}
    </>
  );
}
