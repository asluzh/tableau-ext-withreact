import { Button } from "@tableau/tableau-ui";

export default function Extension({ dashboard, settings }) {
  // note that this component will be instantiated twice in Development with StrictMode
  // in Production version this issue doesn't occur
  // console.log("[ExtensionHandler.tsx] tableauVersion:", tableau.extensions.environment.tableauVersion);
  import.meta.env.DEV && console.trace("Render on dashboard:", dashboard.name);
  import.meta.env.DEV && console.trace(settings);
  return (
    <>
      <div className="centerOnPage">
        <Button
          kind={settings.buttonStyle}
          disabled={false}
          onClick={() => {
            console.log("Button clicked");
          }}
        >
          {settings.buttonLabel}
        </Button>
      </div>
    </>
  );
}
