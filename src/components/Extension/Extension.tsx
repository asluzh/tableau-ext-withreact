import { useEffect, useState } from "react";
import ExtensionHandler from "./ExtensionHandler";
import { Spinner } from "@tableau/tableau-ui";
// import { TableauEventUnregisterFn } from '@tableau/extensions-api-types';
import { Settings, defaultSettings } from "../../interfaces";

// Declare this so our linter knows that tableau is a global object
/* global tableau */

// import "../../public/lib/tableau.extensions.1.latest.min.js?raw";

export default function Extension() {
  const [dashboard, setDashboard] = useState({});
  const [doneLoading, setDoneLoading] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    console.log("[Extension.tsx] useEffect initialize");
    tableau.extensions.initializeAsync({ 'configure': configure as () => object }).then(() => {
      setDashboard(tableau.extensions.dashboardContent!.dashboard);
      const settings = tableau.extensions.settings.getAll();
      const unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
        console.log("[Extension.tsx] SettingsChanged event:", settingsEvent);
        updateSettingsData(tableau.extensions.settings.getAll());
      });
      console.log("[Extension.tsx] Register SettingsChanged event handler");
      if (settings === undefined) {
        // console.log(tableau.extensions.environment.mode);
        configure();
      } else {
        // await new Promise(resolve => setTimeout(resolve, 1000));
        updateSettingsData(settings);
      }
      return () => {
        console.log("[Extension.tsx] Unregister SettingsChanged event handler");
        unregisterSettingsEventListener();
      }
    });
    return () => {
      console.log("[Extension.tsx] No listener for SettingsChanged event");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateSettingsData(rawSettings: {[key: string]: string;}) {
    try {
      const settings: Settings = { ...defaultSettings }; // creates a shallow copy
      if ("metaVersion" in rawSettings && parseInt(rawSettings.metaVersion)) {
        console.log("[Extension.tsx] Validating extension settings");
        settings.metaVersion = parseInt(rawSettings.metaVersion)
        settings.buttonLabel = rawSettings.buttonLabel
        settings.buttonStyle = rawSettings.buttonStyle
      }
      setSettings(settings);
      setDoneLoading(true);
    } catch (e) {
      console.error("Error updating settings:", e);
    }
  }

  const configure = () => {
    console.log("[Extension.tsx] Opening configure popup");
    console.log(`tableauVersion: ${tableau.extensions.environment.tableauVersion}`);
    console.log(`hostname: ${window.location.hostname}`);

    let popupUrl = "config.html";
    const tableauVersion = tableau.extensions.environment.tableauVersion.split(".");
    // if tableauVersion < 2019.3 need an absolute URL
    if (
      parseInt(tableauVersion[0], 10) === 2018 ||
      (parseInt(tableauVersion[0], 10) === 2019 && parseInt(tableauVersion[1], 10) < 3)
    ) {
      const href = window.location.href;
      popupUrl = window.location.href.substring(0, href.lastIndexOf("/")) + "/config.html";
    }

    tableau.extensions.ui
      .displayDialogAsync(popupUrl, "", { height: 650, width: 500 })
      .then((closePayload) => {
        console.log(`[Extension.tsx] Returning from config window (${closePayload})`);
        if (closePayload) {
          const settings = tableau.extensions.settings.getAll();
          updateSettingsData(settings);
          setDoneLoading(true);
        } else {
          console.log("[Extension.tsx] Config dialog was cancelled");
        }
      })
      .catch((error) => {
        switch (error.errorCode) {
          case tableau.ErrorCodes.DialogClosedByUser:
            console.log("[Extension.tsx] Dialog was closed by user");
            break;
          default:
            console.error("[Extension.tsx]", error.message);
        }
      });
  }

  return (
    <>
      {!doneLoading && (
        <div aria-busy="true" className="overlay">
          <div className="centerOnPage">
            <div className="spinnerBg centerOnPage">{}</div>
            <Spinner color="light" />
          </div>
        </div>
      )}
      {doneLoading && <ExtensionHandler settings={settings} dashboard={dashboard} />}
    </>
  );
}
