import { Button } from '@tableau/tableau-ui';
import packageJson from '../../../package.json';

const placeButtons = {
  bottom: 10,
  right: 10,
  // position: 'fixed'
}

const version = {
  left: 10,
  bottom: 10,
  // position: 'fixed',
  color: '#4f4f4f',
  fontSize: 12
}

export default function ActionButtons(props) {

  return (
    <div>
      <div style={version}>v{packageJson.version}</div>
      <div style={placeButtons}>
        {props.resetLabel && <Button kind={'outline'} style={{marginRight: 12}} onClick={props.resetHandler}>{props.resetLabel}</Button>}
        {props.cancelLabel && <Button kind={'outline'} style={{marginRight: 12}} onClick={props.cancelHandler}>{props.cancelLabel}</Button>}
        {props.saveLabel && <Button kind={'primary'} style={{marginRight: 12}} disabled={!props.enableSave} onClick={props.saveHandler}>{props.saveLabel}</Button>}
        {props.saveCloseLabel && <Button kind={'primary'} style={{marginRight: 12}} disabled={!props.enableSave} onClick={props.saveCloseHandler}>{props.saveCloseLabel}</Button>}
      </div>
    </div>
  )

}