import {
  DownloadIO16Firmware, FlashIO16,
  ListIO16BuildFiles,
  ListIO16Builds,
  ListIO16Releases
} from "../../../../wailsjs/go/backend/App";


export class Firmware {

  private ListIO16Releases(): Promise<string[]> {
    return ListIO16Releases();
  }

  private DownloadIO16Firmware(version:string): Promise<string> {
    return DownloadIO16Firmware(version);
  }

  private ListIO16Builds(): Promise<string[]> {
    return ListIO16Builds();
  }

  private ListIO16BuildFiles(version: string, includeDebug: boolean): Promise<string[]> {
    return ListIO16BuildFiles(version, includeDebug);
  }

  private FlashIO162(version: string): Promise<string> {
    return FlashIO16(version);
  }

}
