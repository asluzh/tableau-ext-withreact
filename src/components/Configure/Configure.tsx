import { useEffect, useState } from "react";
import { Tabs, TextField, DropdownSelect } from "@tableau/tableau-ui";
import Grid from "@mui/material/Grid";
import ActionButtons from "./DialogButtons.tsx";
import { defaultSettings } from "../../settings.ts";
// import { makeStyles } from "@material-ui/core/styles";
// import { saveSettings, setSettings, initializeMeta, revalidateMeta } from '../func/func';
// import './Configure.css';

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function Configure() {
  const [tab, switchTab] = useState(0);
  const tabs = [{ content: "Options" }, { content: "About" }];
  const [enableSave, setEnableSave] = useState(true);
  const [buttonLabel, setButtonLabel] = useState(defaultSettings.buttonLabel);
  const [buttonStyle, setButtonStyle] = useState(defaultSettings.buttonStyle);

  useEffect(() => {
    (async () => {
      import.meta.env.DEV && console.log("[Configure.tsx] useEffect initialize dialog");
      const payload = await tableau.extensions.initializeDialogAsync();
      import.meta.env.DEV && console.log("[Configure.tsx] Initialize dialog payload:", payload);

      const labelSettings = tableau.extensions.settings.get("buttonLabel");
      if (labelSettings !== undefined) {
        // labelSettings = labelSettings.replace(/"/g, "");
        import.meta.env.DEV && console.log(
          "[Configure.tsx] initializeDialogAsync Existing Label Settings Found:",
          labelSettings
        );
        setButtonLabel(labelSettings);
      }

      const styleSettings = tableau.extensions.settings.get("buttonStyle");
      if (styleSettings) {
        import.meta.env.DEV && console.log(
          "[Configure.tsx] initializeDialogAsync Existing Label Style Found:",
          styleSettings
        );
        setButtonStyle(styleSettings);
      }
    })();
    return () => {
      // Component unmount code
      import.meta.env.DEV && console.log("[Configure.tsx] useEffect callback");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSettingsHandler(close: boolean) {
    import.meta.env.DEV && console.log("[Configure.tsx] saveSettingsHandler");
    import.meta.env.DEV && console.log("[Configure.tsx] Extension environment mode:", tableau.extensions.environment.mode);
    if (tableau.extensions.environment.mode === "authoring") {
      setEnableSave(false);
      tableau.extensions.settings.set("metaVersion", defaultSettings.metaVersion!.toString());
      tableau.extensions.settings.set("buttonLabel", buttonLabel);
      tableau.extensions.settings.set("buttonStyle", buttonStyle);
      try {
        const savedSettings = await tableau.extensions.settings.saveAsync();
        import.meta.env.DEV && console.log("[Configure.tsx] Saved settings:", savedSettings);
        if (close) {
          tableau.extensions.ui.closeDialog("true");
        } else {
          setEnableSave(true);
        }
      } catch (error) {
        console.error("[Configure.tsx] Error occurred while saving the settings:", error);
      }
    }
  }

  function resetSettingsHandler() {
    import.meta.env.DEV && console.log("[Configure.tsx] resetSettingsHandler");
    setButtonLabel(defaultSettings.buttonLabel);
    setButtonStyle(defaultSettings.buttonStyle);
  }

  function cancelSettingsHandler() {
    import.meta.env.DEV && console.log("[Configure.tsx] cancelSettingsHandler");
    tableau.extensions.ui.closeDialog();
  }

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
                  <TextField
                    label='Button Label'
                    placeholder='Button Label'
                    style={{ width: 400 }}
                    value={buttonLabel}
                    onChange={(e) => {
                      import.meta.env.DEV && console.log("[ConfigureTab.tsx] Updating Button Label", e.target.value);
                      setButtonLabel(e.target.value);
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  {/* className={classes.gridItem} */}
                  <>
                    Set Button Style to:
                    <DropdownSelect
                      kind='line'
                      value={buttonStyle}
                      onChange={(e) => {
                        import.meta.env.DEV && console.log("[ConfigureTab.tsx] Updating Button Style", e.target.value);
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
        enableSave={enableSave}
        saveCloseLabel='Save & Close'
        saveCloseHandler={() => {
          saveSettingsHandler(true);
        }}
        saveLabel='Apply'
        saveHandler={() => {
          saveSettingsHandler(false);
        }}
        resetLabel='Reset'
        resetHandler={resetSettingsHandler}
        cancelLabel='Cancel'
        cancelHandler={cancelSettingsHandler}
      />
    </>
  );
}