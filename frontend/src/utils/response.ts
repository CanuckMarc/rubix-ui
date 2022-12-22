import { rumodel } from "../../wailsjs/go/models";

export const hasError = (response: rumodel.Response) => {
  return response.code !== 0;
};
