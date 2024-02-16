import { useEffect, useState } from 'react';
import { Tabs, TextField, DropdownSelect } from "@tableau/tableau-ui";
import Grid from "@mui/material/Grid";
import ActionButtons from "./DialogButtons";
import { defaultSettings } from "../../interfaces";
// import { makeStyles } from "@material-ui/core/styles";
// import { saveSettings, setSettings, initializeMeta, revalidateMeta } from '../func/func';
// import './Configure.css';

// import '../../public/lib/tableau.extensions.1.latest.min.js?raw'

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function Configure() {
  const [tab, switchTab] = useState(0);
  const tabs = [{ content: "Options" }, { content: "About" }];
  const [enableSaveButton, setEnableSaveButton] = useState(true);
  const [buttonLabel, setButtonLabel] = useState(defaultSettings.buttonLabel);
  const [buttonStyle, setButtonStyle] = useState(defaultSettings.buttonStyle);

  useEffect(() => {
    console.log("[Configure.tsx] useEffect");
    //Initialise Extension
    tableau.extensions.initializeDialogAsync().then((openPayload) => {
      console.log("[Configure.tsx] Initialise Dialog", openPayload);

      let labelSettings = tableau.extensions.settings.get("buttonLabel");
      if (labelSettings) {
        labelSettings = labelSettings.replace(/"/g, "");
        console.log(
          "[Configure.tsx] initializeDialogAsync Existing Label Settings Found:",
          labelSettings
        );
        setButtonLabel(labelSettings);
      }

      const styleSettings = tableau.extensions.settings.get("buttonStyle");
      if (styleSettings) {
        console.log(
          "[Configure.tsx] initializeDialogAsync Existing Label Style Found:",
          styleSettings
        );
        setButtonStyle(styleSettings);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveSettingsHandler() {
    console.log("[Configure.tsx] saveSettingsHandler - Saving Settings");
    console.log("[Configure.tsx] Authoring mode:", tableau.extensions.environment.mode);
    if (tableau.extensions.environment.mode === "authoring") {
      setEnableSaveButton(false);
      tableau.extensions.settings.set("metaVersion", defaultSettings.metaVersion!.toString());
      tableau.extensions.settings.set("buttonLabel", buttonLabel);
      tableau.extensions.settings.set("buttonStyle", buttonStyle);
      tableau.extensions.settings
        .saveAsync()
        .then((savedSettings) => {
          console.log("[Configure.tsx] Saved settings:", savedSettings);
          tableau.extensions.ui.closeDialog("true");
          // props.changeSettings(false);
          // let sheetSettings = tableau.extensions.settings.get("selectedSheets");
          // if (sheetSettings && sheetSettings != null) {
          //   const existingSettings = JSON.parse(sheetSettings);
          //   console.log("[Configure.tsx] Sheet Settings Updated", existingSettings);
          // }
        })
        .catch((error) => {
          console.log("[Configure.tsx] Error occurred while saving the settings:", error);
        });
    }
  }

  function resetSettingsHandler() {
    console.log("[Configure.tsx] resetSettingsHandler - Reset Settings");
    setButtonLabel(defaultSettings.buttonLabel);
    setButtonStyle(defaultSettings.buttonStyle);
  }

  const labelProps = {
    label: buttonLabel,
    onChange: (e) => {
      console.log("[ConfigureTab.tsx] Updating Button Label", e.target.value);
      setButtonLabel(e.target.value);
    },
    // onClear: () => {
    //   setButtonStyle(defaultSettings.buttonLabel);
    // },
    placeholder: "Button Label",
    style: { width: 400 },
    value: buttonLabel,
  };

  return (
    <>
      {/* <div style={logoBanner}>
        <img style={{ height: 20 }} src={logo} alt="Logo placeholder text" />
      </div> */}
      <Tabs
        onTabChange={(index) => {
          switchTab(index);
        }}
        selectedTabIndex={tab}
        tabs={tabs}
      >
        <div
          style={{
            height: "calc(100vh - 170px)",
          }}
        >
          {tab === 0 && (
            <div>
              <Grid container>
                {/* className={classes.root} */}
                <Grid item xs={12}>
                  <TextField {...labelProps} />
                </Grid>
                <Grid item xs={12}>
                  {/* className={classes.gridItem} */}
                  <>
                    Set Button Style to:
                    <DropdownSelect
                      kind="line"
                      value={buttonStyle}
                      onChange={(e) => {
                        console.log("[ConfigureTab.tsx] Updating Button Style", e.target.value);
                        setButtonStyle(e.target.value);
                      }}
                      style={{
                        marginLeft: 10,
                      }}
                    >
                      <option>outline</option>
                      <option>primary</option>
                      <option>destructive</option>
                    </DropdownSelect>
                  </>
                </Grid>
              </Grid>
            </div>
          )}
          {tab === 1 && <div>About</div>}
        </div>
      </Tabs>
      <ActionButtons
        enableButton={enableSaveButton}
        saveHandler={saveSettingsHandler}
        resetHandler={resetSettingsHandler}
      />
    </>
  );
}