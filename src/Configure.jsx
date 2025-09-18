import { useEffect, useState } from 'react'
import {
  Tabs,
  Button,
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
} from "@tableau/tableau-ui"
import Grid from "@mui/material/Grid"
import { loadConfig, defaultConfig, saveConfig } from './utils/settings.js'
import logger from './utils/logger.js'
import packageJson from '../package.json'
import './Configure.css'

/* Declare this so our linter knows that tableau is a global object
global tableau
import "../../../public/lib/tableau.extensions.1.latest.min.js?raw";
*/

export default function Configure() {
  const [tabIndex, setTabIndex] = useState(0);
  const [sheets, setSheets] = useState([]);
  const [enableSave, setEnableSave] = useState(true);
  const [summaryDataChangedAvailable, setSummaryDataChangedAvailable] = useState(false);
  const [config, setConfig] = useState({});

  useEffect(() => {
    logger.debug('useEffect');
    tableau.extensions.initializeDialogAsync().then((payload) => {
      logger.debug('initializeDialogAsync completed', payload);
      logger.debug('Tableau environment:', tableau.extensions.environment.tableauVersion);
      setSummaryDataChangedAvailable(tableau.extensions.environment.tableauVersion && tableau.extensions.environment.tableauVersion >= "2024");
      setSheets(tableau.extensions.dashboardContent.dashboard.worksheets);
      setConfig(loadConfig());
    });
    return () => {
      logger.debug('useEffect unmount');
    }
  }, []);

  function validInputs() {
    if (!config.sheet) {
      logger.warn('Sheet variable is empty');
      return false;
    }
    return true;
  }

  function saveSettings(e) {
    // logger.debug('saveSettings', e);
    if (validInputs() && tableau.extensions.environment.mode === "authoring") {
      setEnableSave(false);
      saveConfig(config).then((newSettings) => {
        logger.debug('Settings saved:', newSettings);
        if (e.target.name === "save") {
          tableau.extensions.ui.closeDialog('save and close');
        } else {
          setEnableSave(true);
        }
      }).catch((err) => {
        window.alert('Saving settings failed! ' + err.toString());
      });
    }
  }

  function closeSettings(e) {
    // logger.debug('Close settings', e);
    tableau.extensions.ui.closeDialog('close');
  }

  function resetSettings(e) {
    // logger.debug('Reset settings', e);
    setConfig(defaultConfig());
    setTabIndex(0);
  }

  return (
    <div>
      <Tabs
        activation='automatic'
        alignment='left'
        onTabChange={setTabIndex}
        selectedTabIndex={tabIndex}
        tabs={[
          { content: "Data" },
          { content: "Options" },
          { content: "Style" },
          { content: "About" },
        ]}
      >
        <div className='configForm'>
        {tabIndex === 0 && (
          <Grid container>
            <Grid item xs={12}>
              <DropdownSelect
                kind='outline'
                // style={{
                //   marginLeft: 10,
                // }}
                label="Select Data Source Sheet:"
                value={config.sheet}
                onChange={e => { setConfig((prev) => ({ ...prev, sheet: e.target.value })); }}
                style={config.sheet ? {} : { border: '1px solid red' }}
              >
                <option key="" value=""> -- Please select -- </option>
                {sheets?.map(s => ( <option key={s.name} value={s.name}>{s.name}</option> ))}
              </DropdownSelect>
            </Grid>
            <Grid item xs={12}>
              <DropdownSelect
                kind='line'
                label="Data Change Event Listener"
                value={config.listenerDataChanged}
                onChange={e => { setConfig(prev => ({...prev, listenerDataChanged: e.target.value })); }}
              >
                <option key="" value="">None</option>
                <option key="FilterChanged" value="FilterChanged">Filter Changed</option>
                <option key="SummaryDataChanged" value="SummaryDataChanged" disabled={!summaryDataChangedAvailable}>Summary Data Changed</option>
              </DropdownSelect>
            </Grid>
          </Grid>
        )}
        {tabIndex === 1 && (
          <Grid container>
            <Grid item xs={12}>
              <TextArea
                style={{ width: '530px', height: '50px', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
                spellCheck={false}
                wrap='off'
                label="Text Area Example"
                value={config.textArea}
                placeholder="Enter text"
                onChange={e => {
                  logger.debug("Change text area", e.target.value);
                  setConfig((prev) => ({ ...prev, textArea: e.target.value }));
                }}
              />
            </Grid>
          </Grid>
        )}
        </div>
      </Tabs>
      <div
        style={{
          bottom: 20,
          right: 20,
          position: 'fixed'
        }}
      >
        <Button
          className="actionButton"
          kind="destructive"
          density="high"
          onClick={closeSettings}
          name="close"
        >Close</Button>
        <Button
          className="actionButton"
          kind="outline"
          density="high"
          onClick={resetSettings}
          name="reset"
        >Reset</Button>
        <Button
          className="actionButton"
          kind="outline"
          density="high"
          disabled={!enableSave}
          onClick={saveSettings}
          name="apply"
          >Apply</Button>
        <Button
          className="actionButton"
          kind="primary"
          density="high"
          disabled={!enableSave}
          onClick={saveSettings}
          name="save"
          >Apply & Close</Button>
      </div>
    </div>
  );
}
