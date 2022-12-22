import { useEffect, useState } from "react";
import { SettingsFactory } from "./factory";
import { SettingUUID } from "../../constants/constants";
import { hasError } from "../../utils/response";

const _settings = {
  auto_refresh_enable: false,
  auto_refresh_rate: 5000,
  git_token: "",
  theme: "dark",
  uuid: SettingUUID,
} as any;

const factory = new SettingsFactory();

export const getSettings = () => _settings;

export const useSettings = () => {
  const [settings, setSettings] = useState(getSettings);

  useEffect(() => {
    fetch().then();
  }, []);

  const fetch = async () => {
    try {
      let res = await factory.Get();
      if (!hasError(res)) {
        setSettings(res.data || getSettings());
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [settings, setSettings];
};
