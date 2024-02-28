import { useEffect, useState } from "react";
import {
  Tabs,
  TextField,
  DropdownSelect,
  Stepper,
  Checkbox,
  Radio,
  ToggleSwitch,
  TextArea,
  Pill,
  Sticker,
  TextLink,
} from "@tableau/tableau-ui";
import Grid from "@mui/material/Grid";
import DialogButtons from "./DialogButtons.tsx";
import { Settings, defaultSettings, parseSettings } from "../../settings.ts";
// import { makeStyles } from "@material-ui/core/styles";
// import { saveSettings, setSettings, initializeMeta, revalidateMeta } from '../func/func';
// import './Configure.css';
import packageJson from "../../../package.json";
import { Dashboard } from "@tableau/extensions-api-types";

// Declare this so our linter knows that tableau is a global object
/* global tableau */

export default function Configure() {
  const [dashboard, setDashboard] = useState<Dashboard | null>();
  const [tab, switchTab] = useState(0);
  const [enableSave, setEnableSave] = useState(true);
  const [settings, setSettings] = useState<Partial<Settings> | null>();

  useEffect(() => {
    (async () => {
      import.meta.env.DEV && console.log("[Configure.tsx] useEffect initialize dialog");
      const payload = await tableau.extensions.initializeDialogAsync();
      setDashboard(tableau.extensions.dashboardContent!.dashboard);
      import.meta.env.DEV && console.log("[Configure.tsx] Initialize dialog payload:", payload);
      const allSettings = tableau.extensions.settings.getAll();
      if (Object.keys(allSettings).length > 0) {
        import.meta.env.DEV &&
          console.log("[ExtensionWrapper.tsx] Existing settings found:", allSettings);
        try {
          if ("metaVersion" in allSettings && parseInt(allSettings.metaVersion)) {
            setSettings(parseSettings(allSettings));
          }
        } catch (e) {
          console.error("Error updating settings:", e);
        }
      } else {
        setSettings(defaultSettings);
      }
    })();
    return () => {
      // Component unmount code
      import.meta.env.DEV && console.log("[Configure.tsx] useEffect callback");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSettingsHandler(close: boolean) {
    import.meta.env.DEV && console.trace("[Configure.tsx] saveSettingsHandler");
    import.meta.env.DEV &&
      console.trace(
        "[Configure.tsx] Extension environment mode:",
        tableau.extensions.environment.mode
      );
    if (tableau.extensions.environment.mode === "authoring") {
      setEnableSave(false);
      // tableau.extensions.settings.set("metaVersion", defaultSettings.metaVersion!.toString());
      if (settings) {
        Object.keys(settings).forEach((key) => {
          import.meta.env.DEV && console.log("[Configure.tsx] Setting", key, "=", settings[key]);
          tableau.extensions.settings.set(key, settings[key].toString());
        });
      }
      try {
        const savedSettings = await tableau.extensions.settings.saveAsync();
        import.meta.env.DEV && console.trace("[Configure.tsx] Saved settings:", savedSettings);
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
    import.meta.env.DEV && console.trace("[Configure.tsx] resetSettingsHandler");
    setSettings(defaultSettings);
  }

  function cancelSettingsHandler() {
    import.meta.env.DEV && console.trace("[Configure.tsx] cancelSettingsHandler");
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
        tabs={[
          { content: "Data" },
          { content: "Options" },
          { content: "Style" },
          { content: "About" },
        ]}
      >
        <div
          style={{
            height: "calc(100vh - 170px)",
          }}
        >
          {tab === 0 && (
            <div>
              <Grid container>
                <Grid item xs={12}>
                  <DropdownSelect
                    kind='line'
                    label='Select Source Worksheet:'
                    value={settings?.worksheet}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log(
                          "[ConfigureTab.tsx] Updating Selected Worksheet",
                          e.target.value
                        );
                      setSettings((prev) => ({ ...prev, worksheet: e.target.value }));
                    }}
                    style={{
                      marginLeft: 10,
                    }}
                  >
                    <option label=''> -- Please select -- </option>
                    {dashboard?.worksheets.map((ws) => {
                      return <option label={ws.name}>{ws.name}</option>;
                    })}
                  </DropdownSelect>
                </Grid>
              </Grid>
            </div>
          )}
          {tab === 1 && (
            <div>
              <Grid container>
                <Grid item xs={12}>
                  <DropdownSelect
                    kind='line'
                    label='Dropdown Options:'
                    value={settings?.dropdownOptions}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Dropdown Options", e.target.value);
                      setSettings((prev) => ({ ...prev, dropdownOptions: e.target.value }));
                    }}
                    style={{
                      marginLeft: 10,
                    }}
                  >
                    <option label=''>--Please select--</option>
                    <option label='option1'>Option 1</option>
                    <option label='option2'>Option 2</option>
                    <option label='option3'>Option 3</option>
                  </DropdownSelect>
                </Grid>
                <Grid item xs={12}>
                  <Stepper
                    label='Stepper:'
                    value={settings?.stepper || defaultSettings.stepper}
                    onValueChange={(value) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Stepper", value);
                      setSettings((prev) => ({ ...prev, stepper: value }));
                    }}
                  />
                </Grid>
                <Grid item xs={12} marginTop={"10px"}>
                  <Radio
                    aria-labelledby='radioButtonLabel1'
                    aria-describedby='radioButtonDescr1'
                    name='radioButton'
                    value='1'
                    checked={settings?.radioButton === "1"}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Radio Button", e.target.value);
                      setSettings((prev) => ({ ...prev, radioButton: e.target.value }));
                    }}
                  >
                    <h4 id='radioButtonLabel1' style={{ margin: 0 }}>
                      RADIO BUTTON FIRST OPTION
                    </h4>
                  </Radio>
                </Grid>
                <Grid item xs={12} marginBottom={"5px"}>
                  <Radio
                    aria-labelledby='radioButtonLabel2'
                    aria-describedby='radioButtonDescr2'
                    name='radioButton'
                    value='2'
                    checked={settings?.radioButton === "2"}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Radio Button", e.target.value);
                      setSettings((prev) => ({ ...prev, radioButton: e.target.value }));
                    }}
                  >
                    <h4 id='radioButtonLabel2' style={{ margin: 0 }}>
                      RADIO BUTTON SECOND OPTION
                    </h4>
                    <p id='radioButtonDescr2'></p>
                  </Radio>
                </Grid>
                <Grid item xs={12} marginBottom={"10px"}>
                  <Checkbox
                    name='checkbox'
                    checked={settings?.checkbox}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Checkbox", e.target.checked);
                      setSettings((prev) => ({ ...prev, checkbox: e.target.checked }));
                    }}
                  >
                    Checkbox
                  </Checkbox>
                </Grid>
                <Grid item xs={12} marginBottom={"10px"}>
                  <ToggleSwitch
                    name='toggleSwitch'
                    style={{ width: 300 }}
                    checked={settings?.toggleSwitch}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Toggle Switch", e.target.checked);
                      setSettings((prev) => ({ ...prev, toggleSwitch: e.target.checked }));
                    }}
                  >
                    Toggle Switch
                  </ToggleSwitch>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label='Text Field'
                    placeholder='Text Field'
                    style={{ width: 400 }}
                    value={settings?.textField}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Text Field", e.target.value);
                      setSettings((prev) => ({
                        ...prev,
                        textField: e.target.value,
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextArea
                    label='Text Area'
                    placeholder='...'
                    style={{ width: 400, height: 180 }}
                    value={settings?.textArea}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Text Area", e.target.value);
                      setSettings((prev) => ({
                        ...prev,
                        textArea: e.target.value,
                      }));
                    }}
                  />
                </Grid>
              </Grid>
            </div>
          )}
          {tab === 2 && (
            <div>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    label='Button Label'
                    placeholder='Button Label'
                    style={{ width: 400 }}
                    value={settings?.buttonLabel}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Button Label", e.target.value);
                      setSettings((prev) => ({
                        ...prev,
                        buttonLabel: e.target.value,
                      }));
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <DropdownSelect
                    kind='line'
                    label='Button Style:'
                    value={settings?.buttonStyle}
                    onChange={(e) => {
                      import.meta.env.DEV &&
                        console.log("[ConfigureTab.tsx] Updating Button Style", e.target.value);
                      setSettings((prev) => ({ ...prev, buttonStyle: e.target.value }));
                    }}
                    style={{
                      marginLeft: 10,
                    }}
                  >
                    <option>outline</option>
                    <option>primary</option>
                    <option>destructive</option>
                  </DropdownSelect>
                </Grid>
              </Grid>
            </div>
          )}
          {tab === 3 && (
            <div>
              <Grid container>
                <Grid item xs={12}>
                  <h4>ABOUT THIS EXTENSION</h4>
                  <p>This is a sample extension using React + Typescript.</p>
                  <div
                    style={{
                      left: 10,
                      bottom: 10,
                      // position: 'fixed',
                      color: "#4f4f4f",
                      fontSize: 12,
                    }}
                  >
                    v{packageJson.version}
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Pill kind='discrete' style={{ width: 100 }}>
                    Discrete
                  </Pill>
                  <Pill kind='continuous' style={{ width: 100 }}>
                    Continuous
                  </Pill>
                  <Pill kind='invalid' style={{ width: 100 }}>
                    Invalid
                  </Pill>
                  <Pill kind='other' style={{ width: 100 }}>
                    Other
                  </Pill>
                </Grid>
                <Grid item xs={12}>
                  <Sticker stickerType='blue'>Blue</Sticker>
                  <Sticker stickerType='green'>Green</Sticker>
                  <Sticker stickerType='neutral'>Neutral</Sticker>
                  <Sticker stickerType='red'>Red</Sticker>
                  <Sticker stickerType='yellow'>Yellow</Sticker>
                  <Sticker stickerType='teal'>Teal</Sticker>
                  <Sticker stickerType='violet'>Violet</Sticker>
                </Grid>
                <Grid item xs={12}>
                  <TextLink kind='standalone' target='_blank' href='{packageJson.homepage}' style={{fontSize: 12}}>
                    Github Repo Link
                  </TextLink>
                </Grid>
              </Grid>
            </div>
          )}
        </div>
      </Tabs>
      <DialogButtons
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
