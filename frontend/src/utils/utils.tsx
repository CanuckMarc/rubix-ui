import { notification } from "antd";
import bacnetLogo from "../assets/images/BACnet_logo.png";
import nubeLogo from "../assets/images/Nube-logo.png";
import modbusLogo from "../assets/images/modbus.png";
import loraLogo from "../assets/images/lora.png";
import lorawanLogo from "../assets/images/lorawan.png";
import postgresLogo from "../assets/images/postgresql.png";
import historyLogo from "../assets/images/history.png";
import edge28 from "../assets/images/Edge-iO-28.png";
import rubixIO from "../assets/images/RC-IO.png";
import { InfoCircleOutlined } from "@ant-design/icons";

type NotificationType = "success" | "info" | "warning" | "error";

export const openNotificationWithIcon = (type: NotificationType, data: any) => {
  const getColor = (): string => {
    switch (type) {
      case "success":
        return "green";
      case "error":
        return "red";
      case "warning":
        return "yellow";
    }
    return "blue";
  };
  notification[type]({
    message: type.charAt(0).toUpperCase() + type.slice(1),
    description: data,
    placement: "bottomRight",
    icon: <InfoCircleOutlined style={{ marginLeft: "-180px", color: getColor() }} />,
  });
};

export const isObjectEmpty = (obj: Object) => {
  return obj && Object.keys(obj).length === 0;
};

export function pluginLogo(plugin: string): string {
  let image = nubeLogo;

  if (plugin == "bacnetmaster") {
    image = bacnetLogo;
  }
  if (plugin == "bacnet") {
    image = bacnetLogo;
  }
  if (plugin == "lora") {
    image = loraLogo;
  }
  if (plugin == "lorawan") {
    image = lorawanLogo;
  }
  if (plugin == "postgres") {
    image = postgresLogo;
  }
  if (plugin == "history") {
    image = historyLogo;
  }
  if (plugin == "modbus") {
    image = modbusLogo;
  }
  if (plugin == "history") {
    image = historyLogo;
  }
  if (plugin == "modbus-server") {
    image = modbusLogo;
  }
  if (plugin == "edge28") {
    image = edge28;
  }
  if (plugin == "rubix-io") {
    image = rubixIO;
  }
  return image;
}

export const copyTextToClipboard = (text: string, successMessage?: string, failMessage?: string) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      const _successMessage = successMessage ? successMessage : "Copying to clipboard was successful!";
      return openNotificationWithIcon("success", _successMessage);
    })
    .catch((err) => {
      const _failMessage = failMessage ? failMessage : `Async: Could not copy text: ${err}`;
      return openNotificationWithIcon("error", _failMessage);
    });
};

export const downloadJSON = (fileName: string, data: any) => {
  const blob = new Blob([data], { type: "text/plain" });
  const e = document.createEvent("MouseEvents"),
    a = document.createElement("a");
  a.download = `${fileName}.json`;
  a.href = window.URL.createObjectURL(blob);
  e.initEvent("click", true, false);
  a.dispatchEvent(e);
};

export const orderBy = (dataArray = [], fieldName: string) => {
  return dataArray.sort((a: any, b: any) => {
    if (typeof a[fieldName] === "string") {
      return a[fieldName].localeCompare(b[fieldName]);
    } else {
      return a[fieldName] - b[fieldName]; //case type boolean or number
    }
  });
};

export function uniqArray<T>(arr: T[]) {
  const result: T[] = [];
  for (let i = 0; i < arr.length; i++) {
    const isExist = result.some((item: any) => item.id === (arr[i] as any).id);
    if (!isExist) {
      result.push(arr[i]);
    }
  }
  return result;
}
