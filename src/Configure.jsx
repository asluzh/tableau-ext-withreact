import { useEffect, useState } from 'react';
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
  ColorGrid,
  Badge,
} from '@tableau/tableau-ui';
import { loadConfig, saveConfig, defaultConfig } from './utils/settings.js';
import logger from './utils/logger.js';
import packageJson from '../package.json';
import './Configure.css';

/* Declare this so our linter knows that tableau is a global object
global tableau
import '../../../public/lib/tableau.extensions.1.latest.min.js?raw';
*/

export default function Configure() {
  const [tabIndex, setTabIndex] = useState(0);
  const [sheets, setSheets] = useState([]);
  const [enableSave, setEnableSave] = useState(true);
  const [summaryDataChangedAvailable, setSummaryDataChangedAvailable] = useState(false);
  const [config, setConfig] = useState({});
  const [footer, setFooter] = useState('');

  useEffect(() => {
    logger.debug('useEffect');
    tableau.extensions.initializeDialogAsync().then((payload) => {
      logger.debug('initializeDialogAsync completed', payload);
      // logger.debug('Tableau environment:', tableau.extensions.environment.tableauVersion);
      setSummaryDataChangedAvailable(
        tableau.extensions.environment.tableauVersion &&
          tableau.extensions.environment.tableauVersion >= '2024'
      );
      setSheets(tableau.extensions.dashboardContent.dashboard.worksheets);
      setConfig(loadConfig());
      setFooter('Object ID: ' + tableau.extensions.dashboardObjectId);
    });
    return () => {
      logger.debug('useEffect callback');
    };
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
    if (validInputs() && tableau.extensions.environment.mode === 'authoring') {
      setEnableSave(false);
      saveConfig(config)
        .then((newSettings) => {
          logger.debug('Settings saved:', newSettings);
          if (e.target.name === 'save') {
            tableau.extensions.ui.closeDialog('save and close');
          } else {
            setEnableSave(true);
          }
        })
        .catch((err) => {
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
          { content: 'Data' },
          { content: 'Options' },
          { content: 'Styling' },
          { content: 'About' },
        ]}
      >
        <div className='configForm'>
          {tabIndex === 0 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <DropdownSelect
                  kind='outline'
                  // style={{
                  //   marginLeft: 10,
                  // }}
                  label='Select Data Source Sheet:'
                  value={config.sheet}
                  onChange={(e) => {
                    setConfig((prev) => ({ ...prev, sheet: e.target.value }));
                  }}
                  style={config.sheet ? {} : { border: '1px solid red' }}
                >
                  <option key='' value=''>
                    {' '}
                    -- Please select --{' '}
                  </option>
                  {sheets?.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </DropdownSelect>
              </div>
              <div style={{ marginBottom: 20 }}>
                <DropdownSelect
                  kind='line'
                  label='Data Change Event Listener'
                  value={config.listenerDataChanged}
                  onChange={(e) => {
                    setConfig((prev) => ({ ...prev, listenerDataChanged: e.target.value }));
                  }}
                >
                  <option key='' value=''>
                    None
                  </option>
                  <option key='FilterChanged' value='FilterChanged'>
                    Filter Changed
                  </option>
                  <option
                    key='SummaryDataChanged'
                    value='SummaryDataChanged'
                    disabled={!summaryDataChangedAvailable}
                  >
                    Summary Data Changed
                  </option>
                </DropdownSelect>
              </div>
            </>
          )}

          {tabIndex === 1 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <DropdownSelect
                  style={{ margin: 0 }}
                  kind='line'
                  label='Dropdown Options:'
                  value={config.dropdownOption}
                  onChange={(e) => {
                    logger.debug('Set dropdownOption', e.target.value);
                    setConfig((prev) => ({ ...prev, dropdownOption: e.target.value }));
                  }}
                >
                  <option key='' value=''>
                    --Please select--
                  </option>
                  <option key='option1'>Option 1</option>
                  <option key='option2'>Option 2</option>
                  <option key='option3'>Option 3</option>
                </DropdownSelect>
              </div>
              <div style={{ marginBottom: 20 }}>
                <Stepper
                  label='Stepper:'
                  style={{ width: 80 }}
                  value={config.stepper}
                  onValueChange={(v) => {
                    logger.debug('Set stepper', v);
                    setConfig((prev) => ({ ...prev, stepper: v }));
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <Radio
                  aria-labelledby='radioButtonLabel1'
                  aria-describedby='radioButtonDescr1'
                  name='radioButton'
                  value='radiooption1'
                  checked={config.radioButton === 'radiooption1'}
                  onChange={(e) => {
                    logger.debug('Set radioButton', e.target.value);
                    setConfig((prev) => ({ ...prev, radioButton: e.target.value }));
                  }}
                >
                  <h4 id='radioButtonLabel1' style={{ margin: 0, paddingRight: 20 }}>
                    RADIO BUTTON OPTION 1
                  </h4>
                </Radio>
                <Radio
                  aria-labelledby='radioButtonLabel2'
                  aria-describedby='radioButtonDescr2'
                  name='radioButton'
                  value='radiooption2'
                  checked={config.radioButton === 'radiooption2'}
                  onChange={(e) => {
                    logger.debug('Set radioButton', e.target.value);
                    setConfig((prev) => ({ ...prev, radioButton: e.target.value }));
                  }}
                >
                  <h4 id='radioButtonLabel2' style={{ margin: 0 }}>
                    RADIO BUTTON OPTION 2
                  </h4>
                  <p style={{ margin: 0 }}>Description text for option 2</p>
                </Radio>
              </div>
              <div style={{ marginBottom: 20 }}>
                <Checkbox
                  name='checkbox'
                  checked={config.checkbox === 'true'}
                  onChange={(e) => {
                    logger.debug('Set checkbox', e.target.checked);
                    setConfig((prev) => ({ ...prev, checkbox: e.target.checked.toString() }));
                  }}
                >
                  Checkbox
                </Checkbox>
              </div>
              <div style={{ marginBottom: 20 }}>
                <ToggleSwitch
                  name='toggleSwitch'
                  style={{ width: 130 }}
                  checked={config.toggleSwitch === 'true'}
                  onChange={(e) => {
                    logger.debug('Set checkbox', e.target.checked);
                    setConfig((prev) => ({ ...prev, toggleSwitch: e.target.checked.toString() }));
                  }}
                >
                  Toggle Switch
                </ToggleSwitch>
              </div>
              <div style={{ marginBottom: 20 }}>
                <TextField
                  label='Text Field:'
                  placeholder='Input Text'
                  style={{ width: 400 }}
                  value={config.textField}
                  onChange={(e) => {
                    logger.debug('Set textField', e.target.value);
                    setConfig((prev) => ({ ...prev, textField: e.target.value }));
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <TextArea
                  style={{
                    width: '530px',
                    height: '85px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                  }}
                  spellCheck={false}
                  wrap='off'
                  label='Text Area:'
                  value={config.textArea}
                  placeholder='Enter text'
                  onChange={(e) => {
                    logger.debug('Set textArea', e.target.value);
                    setConfig((prev) => ({ ...prev, textArea: e.target.value }));
                  }}
                />
              </div>
            </>
          )}

          {tabIndex === 2 && (
            <>
              <div style={{ marginBottom: 20 }}>
                <TextArea
                  style={{
                    width: '530px',
                    height: '50px',
                    whiteSpace: 'pre',
                    fontFamily: 'monospace',
                  }}
                  spellCheck={false}
                  wrap='off'
                  label='Main Div Style (CSS):'
                  value={config.mainDivStyle}
                  placeholder='CSS-style for main DIV element'
                  onChange={(e) => {
                    logger.debug('Set mainDivStyle', e.target.value);
                    setConfig((prev) => ({ ...prev, mainDivStyle: e.target.value }));
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <TextField
                  label='Button Label:'
                  placeholder='Input Label Here'
                  style={{ width: 400 }}
                  value={config.buttonLabel}
                  onChange={(e) => {
                    logger.debug('Set buttonLabel', e.target.value);
                    setConfig((prev) => ({ ...prev, buttonLabel: e.target.value }));
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <DropdownSelect
                  style={{ margin: 0 }}
                  kind='line'
                  label='Button Style:'
                  value={config.buttonStyle}
                  onChange={(e) => {
                    logger.debug('Set buttonStyle', e.target.value);
                    setConfig((prev) => ({ ...prev, buttonStyle: e.target.value }));
                  }}
                >
                  <option key='outline'>outline</option>
                  <option key='primary'>primary</option>
                  <option key='destructive'>destructive</option>
                </DropdownSelect>
              </div>
              <div style={{ marginBottom: 20 }}>
                <p style={{ marginBottom: 5, fontSize: '12px', color: '#2e2e2e' }}>Button Color:</p>
                <ColorGrid
                  aria-labelledby='color-grid'
                  // label='Select Color:'
                  selectedColor={config.buttonColor}
                  palette={[
                    ['#DDDDDD', '#CCCCCC', '#BBBBBB', '#AAAAAA'],
                    ['#F7CAC9', '#EFC637', '#F6A035', '#F37941'],
                    ['#92A8D1', '#3B8686'],
                  ]}
                  onColorChange={(color) => {
                    logger.debug('Set buttonColor', color);
                    setConfig((prev) => ({ ...prev, buttonColor: color }));
                  }}
                />
              </div>
            </>
          )}

          {tabIndex === 3 && (
            <>
              <h4>ABOUT THIS EXTENSION</h4>
              <p>This is a template Tableau extension using ReactJS.</p>

              <div style={{ marginBottom: 10 }}>
                <TextLink
                  kind='standalone'
                  target='_blank'
                  href={packageJson.homepage}
                  style={{ marginRight: 20 }}
                >
                  Github Repo
                </TextLink>

                <span>v{packageJson.version}</span>
              </div>

              <Badge kind='primary' style={{ marginRight: 10 }}>
                Tableau API v{tableau.extensions.environment.apiVersion}
              </Badge>

              <Badge kind='outline' style={{ marginRight: 10 }}>
                Tableau v{tableau.extensions.environment.tableauVersion}
              </Badge>

              <div style={{ margin: 10 }}>
                Pills:
                <Pill kind='discrete' style={{ width: 100, margin: 5 }}>
                  Discrete
                </Pill>
                <Pill kind='continuous' style={{ width: 100, margin: 5 }}>
                  Continuous
                </Pill>
                <Pill kind='invalid' style={{ width: 100, margin: 5 }}>
                  Invalid
                </Pill>
                <Pill kind='other' style={{ width: 100, margin: 5 }}>
                  Other
                </Pill>
              </div>
              <div style={{ margin: 10 }}>
                Stickers:
                <Sticker stickerType='neutral' style={{ margin: 5 }}>
                  Neutral
                </Sticker>
                <Sticker stickerType='green' style={{ margin: 5 }}>
                  Green
                </Sticker>
                <Sticker stickerType='yellow' style={{ margin: 5 }}>
                  Yellow
                </Sticker>
                <Sticker stickerType='red' style={{ margin: 5 }}>
                  Red
                </Sticker>
                <Sticker stickerType='teal' style={{ margin: 5 }}>
                  Teal
                </Sticker>
                <Sticker stickerType='blue' style={{ margin: 5 }}>
                  Blue
                </Sticker>
                <Sticker stickerType='violet' style={{ margin: 5 }}>
                  Violet
                </Sticker>
              </div>
            </>
          )}
        </div>
      </Tabs>

      <div
        style={{
          left: 20,
          bottom: 20,
          position: 'fixed',
        }}
      >
        {footer}
      </div>
      <div
        style={{
          right: 20,
          bottom: 20,
          position: 'fixed',
        }}
      >
        <Button
          className='actionButton'
          kind='destructive'
          density='high'
          onClick={closeSettings}
          name='close'
        >
          Close
        </Button>
        <Button
          className='actionButton'
          kind='outline'
          density='high'
          onClick={resetSettings}
          name='reset'
        >
          Reset
        </Button>
        <Button
          className='actionButton'
          kind='outline'
          density='high'
          disabled={!enableSave}
          onClick={saveSettings}
          name='apply'
        >
          Apply
        </Button>
        <Button
          className='actionButton'
          kind='primary'
          density='high'
          disabled={!enableSave}
          onClick={saveSettings}
          name='save'
        >
          Apply & Close
        </Button>
      </div>
    </div>
  );
}
