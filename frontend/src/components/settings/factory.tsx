import { rumodel, storage } from "../../../wailsjs/go/models";
import { GetGitToken, GetSettings, SetGitToken, UpdateSettings, } from "../../../wailsjs/go/backend/App";

export class SettingsFactory {
  async Get(): Promise<rumodel.Response> {
    return await GetSettings();
  }

  async Update(body: storage.Settings): Promise<rumodel.Response> {
    return UpdateSettings(body);
  }

  async GetGitToken(): Promise<rumodel.Response> {
    return await GetGitToken();
  }

  async SetGitToken(token: string): Promise<rumodel.Response> {
    return await SetGitToken(token);
  }
}
