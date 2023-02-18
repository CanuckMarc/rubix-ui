import { useEffect, useState } from "react";
import { SettingsFactory } from "./factory";
import { hasError } from "../../utils/response";

export const TIME_SETTING = "time-setting";

const _settings = {
  theme: "dark",
  git_token: "",
  auto_refresh_enable: false,
  auto_refresh_rate: 5000,
} as any;
const _timeSetting = JSON.parse("" + localStorage.getItem(TIME_SETTING)) || 5000;

const factory = new SettingsFactory();

export const getSettings = () => _settings;
export const getTimeSetting = (): number => _timeSetting;
export const setTimeSetting = (time: number) => localStorage.setItem(TIME_SETTING, JSON.stringify(time));

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
