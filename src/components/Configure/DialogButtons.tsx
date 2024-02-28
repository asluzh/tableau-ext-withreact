import { Button } from "@tableau/tableau-ui";

export default function DialogButtons(props) {
  return (
    <div>
      <div
        style={{
          bottom: 20,
          right: 20,
          position: 'fixed'
        }}
      >
        {props.resetLabel && (
          <Button kind={"outline"} style={{ marginRight: 12 }} onClick={props.resetHandler}>
            {props.resetLabel}
          </Button>
        )}
        {props.cancelLabel && (
          <Button kind={"outline"} style={{ marginRight: 12 }} onClick={props.cancelHandler}>
            {props.cancelLabel}
          </Button>
        )}
        {props.saveLabel && (
          <Button
            kind={"primary"}
            style={{ marginRight: 12 }}
            disabled={!props.enableSave}
            onClick={props.saveHandler}
          >
            {props.saveLabel}
          </Button>
        )}
        {props.saveCloseLabel && (
          <Button
            kind={"primary"}
            disabled={!props.enableSave}
            onClick={props.saveCloseHandler}
          >
            {props.saveCloseLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
