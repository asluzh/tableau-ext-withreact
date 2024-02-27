export interface Settings {
  metaVersion: number;
  worksheet: string;
  buttonLabel: string;
  buttonStyle: string;
  dropdownOptions: string;
  stepper: number;
  radioButton: string;
  checkbox: boolean;
  toggleSwitch: boolean;
  textField: string;
  textArea: string;
}

export const defaultSettings: Readonly<Settings> = {
  metaVersion: 1,
  worksheet: "",
  buttonLabel: "Click Me",
  buttonStyle: "primary",
  dropdownOptions: "",
  stepper: 0,
  radioButton: "1",
  checkbox: false,
  toggleSwitch: false,
  textField: "short text",
  textArea: "long text",
};

export function parseSettings(rawSettings: { [key: string]: string }) {
  const settings: Settings = { ...defaultSettings }; // creates a shallow copy
  // settings.metaVersion = parseInt(rawSettings.metaVersion);
  Object.keys(settings).forEach((key) => {
    switch (typeof settings[key]) {
      case "number":
        settings[key] = parseInt(rawSettings[key]);
        break;
      case "boolean":
        settings[key] = (rawSettings[key] === "true");
        break;
      case "string":
      default:
        settings[key] = rawSettings[key];
    }
  });
  return settings;
}
