import { Button, Pill } from "@tableau/tableau-ui";

export default function ExtensionHandler({ settings, dashboard }) {
  // TODO make sure that this component is instantiated once
  // console.log("[ExtensionHandler.tsx] tableauVersion:", tableau.extensions.environment.tableauVersion);
  // console.log("[ExtensionHandler.jsx] Dashboard:", dashboard);
  console.log("[ExtensionHandler.tsx] render");
  return (
    <>
      <Button
        kind={settings.buttonStyle}
        disabled={false}
        onClick={() => {
          console.log("Button clicked");
        }}
      >
        {settings.buttonLabel}
      </Button>
      <Pill kind="other">{dashboard.name}</Pill>
    </>
  );
}
