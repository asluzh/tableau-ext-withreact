import { useEffect, useState, useRef } from 'react'
import { Spinner, Button, Sticker } from '@tableau/tableau-ui'
import { loadConfig, defaultConfig, saveConfig } from './utils/settings.js'
import logger from './utils/logger.js'
import packageJson from '../package.json'
import './Extension.css'

/* Declare this so our linter knows that tableau is a global object
global tableau
import "../../../public/lib/tableau.extensions.1.latest.min.js?raw";
*/

function configure() {
  logger.debug('Opening configure popup');
  const popupUrl = `${window.location.origin}${import.meta.env.BASE_URL}configure.html`;
  tableau.extensions.ui.displayDialogAsync(popupUrl, null, { height: 600, width: 600 })
  .then((payload) => {
    logger.debug('displayDialogAsync was closed with payload:', payload);
  })
  .catch((error) => {
    switch(error.errorCode) {
      case tableau.ErrorCodes.DialogClosedByUser:
        logger.debug('Dialog was closed by user');
        break;
      default:
        logger.error(error.message);
    }
  });
}

export default function Extension() {
  const ref = useRef(null);
  const [dashboard, setDashboard] = useState();
  const [ready, setReady] = useState(0);
  const [data, setData] = useState([]);

  useEffect(() => {

    let listenerDataChanged = "";
    let unregisterDataChangedListener = null;
    let unregisterSettingsChangedListener = null;
    let cancel = false;

    const updateData = async (worksheet) => {
      logger.debug('updateData from', worksheet.name);
      if (cancel) {
        logger.debug('updateData cancelled');
        return;
      }
      try {
        const dataTableReader = await worksheet.getSummaryDataReaderAsync(undefined, {
          // applyWorksheetFormatting: true,
          // ignoreAliases: true,
          ignoreSelection: true,
          // includeDataValuesOption: tableau.IncludeDataValuesOption.AllValues, // AllValues, OnlyFormattedValues, OnlyNativeValues
          // maxRows: 0, // 0 means no limit
        });
        logger.debug('Data reader row count:', dataTableReader.totalRowCount);
        if (dataTableReader.pageCount > 0) {
          try {
            const dataTable = await dataTableReader.getAllPagesAsync();
            // logger.debug('getAllPagesAsync dataTable:', dataTable);
            const columns = dataTable.columns.map(col => col.fieldName);
            logger.debug('Worksheet columns:', columns);
            const data = dataTable.data.map(row => {
              const obj = {};
              row.forEach((cell, idx) => {
                obj[columns[idx]] = cell.value;
              });
              return obj;
            });
            // logger.debug('getAllPagesAsync processed data:', data);
            setData(data);
          } catch (err) {
            logger.error('getAllPagesAsync failed:', err.toString());
            setData([]);
          } finally {
            await dataTableReader.releaseAsync();
          }
        } else {
          logger.log('Empty data in worksheet:', worksheet.name);
          setData([]);
        }
      } catch (err) {
        logger.error('getSummaryDataReaderAsync failed:', err.toString());
        setData([]);
      } finally {
        if (!unregisterDataChangedListener) {
          switch (listenerDataChanged) {
          case 'SummaryDataChanged':
            logger.debug('Adding SummaryDataChanged event listener');
            unregisterDataChangedListener = worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, () => {
              logger.debug('SummaryDataChanged event');
              updateData(worksheet);
            });
            break;
          case 'FilterChanged':
            logger.debug('Adding FilterChanged event listener');
            unregisterDataChangedListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, () => {
              logger.debug('FilterChanged event');
              updateData(worksheet);
            });
            break;
          }
        }
      }
    };

    const updateSettings = async () => {
      if (unregisterDataChangedListener) {
        logger.debug(`Removing ${listenerDataChanged} event listener`);
        unregisterDataChangedListener();
        unregisterDataChangedListener = null;
      }
      const config = loadConfig();
      listenerDataChanged = config.listenerDataChanged; // save a copy in the closure variable
      // ref.current.style = config.mainDivStyle;
      if (config.sheet) {
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        const worksheet = worksheets.find(s => s.name === config.sheet);
        if (!worksheet) {
          logger.warn('Worksheet not found:', config.sheet);
          setData([]);
          return;
        }
        updateData(worksheet);
      }
    };

    logger.debug('useEffect');
    tableau.extensions.initializeAsync({'configure': configure}).then(() => {
      logger.debug('initializeAsync completed, Tableau environment:', tableau.extensions.environment.tableauVersion);
      updateSettings();
      unregisterSettingsChangedListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (e) => {
        logger.debug('Settings changed:', e);
        updateSettings();
      });
    }, (err) => {
      logger.error('initializeAsync failed:', err.toString());
    });
    logger.log('Running', packageJson.name, packageJson.version);
    return () => {
      cancel = true;
      logger.debug('useEffect unmount');
      if (unregisterSettingsChangedListener) {
        unregisterSettingsChangedListener();
        unregisterSettingsChangedListener = null;
        logger.debug('Removed SettingsChanged event listener');
      }
      if (unregisterDataChangedListener) {
        logger.debug(`Removing ${listenerDataChanged} event listener`);
        unregisterDataChangedListener();
        unregisterDataChangedListener = null;
      }
      // any cleanup steps go here
    };
  }, []);

  useEffect(() => {
    logger.debug('useEffect data update');
    if (data) {
      logger.debug('Data rows', data.length);
    }
  }, [data]);

  return (
    <div ref={ref} />
  )
}
