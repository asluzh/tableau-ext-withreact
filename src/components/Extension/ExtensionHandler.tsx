import { Button } from "@tableau/tableau-ui";

export default function ExtensionHandler({ settings, dashboard }) {
  // note that this component will be instantiated twice in Development with StrictMode
  // in Production version this issue doesn't exist
  // console.log("[ExtensionHandler.tsx] tableauVersion:", tableau.extensions.environment.tableauVersion);
  console.log("[ExtensionHandler.jsx] Render on dashboard:", dashboard);
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
