import { Button } from "@tableau/tableau-ui";

export default function ExtensionHandler({ settings, dashboard }) {
  console.log(`[ExtensionHandler.jsx] Dashboard: (${dashboard})`);
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
    </>
  );
}
