export interface Settings {
  metaVersion?: number;
  buttonLabel: string;
  buttonStyle: string;
}

export const defaultSettings: Readonly<Settings> = {
  metaVersion: 1,
  buttonLabel: "Click Me",
  buttonStyle: "primary",
};

export interface ExtensionProps {
  configComplete: boolean;
}

export const defaultExtensionProps: ExtensionProps = {
  configComplete: false,
};
