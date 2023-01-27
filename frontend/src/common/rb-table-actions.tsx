import { Button, Popconfirm } from "antd";
import {
  DeleteOutlined,
  ExportOutlined,
  ImportOutlined,
  MonitorOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SyncOutlined,
} from "@ant-design/icons";

export const RbAddButton = (props: any) => {
  const { handleClick, disabled, text } = props;
  return (
    <Button
      className="rb-btn nube-green white--text"
      onClick={handleClick}
      disabled={disabled}
      icon={<PlusOutlined />}
    >
      {text ?? "Create"}
    </Button>
  );
};

export const RbRefreshButton = (props: any) => {
  const { refreshList, disabled, style = {}, text } = props;
  return (
    <Button
      className="rb-btn nube-primary white--text"
      onClick={refreshList}
      disabled={disabled}
      icon={<ReloadOutlined />}
      style={{ ...style }}
    >
      {text ?? "Refresh"}
    </Button>
  );
};

export const RbDeleteButton = (props: any) => {
  const { bulkDelete, disabled, text } = props;
  return (
    <Popconfirm title="Delete" onConfirm={bulkDelete}>
      <Button
        className="rb-btn danger white--text"
        disabled={disabled}
        icon={<DeleteOutlined />}
      >
        {text ?? "Delete"}
      </Button>
    </Popconfirm>
  );
};

export const RbImportButton = (props: any) => {
  const { showModal, disabled, text } = props;
  return (
    <Button
      className="rb-btn nube-primary white--text"
      onClick={showModal}
      disabled={disabled}
      icon={<ImportOutlined />}
    >
      {text ?? "Import"}
    </Button>
  );
};

export const RbExportButton = (props: any) => {
  const { handleExport, disabled, text } = props;
  return (
    <Button
      className="rb-btn export-color white--text"
      onClick={handleExport}
      disabled={disabled}
      icon={<ExportOutlined />}
    >
      {text ?? "Export"}
    </Button>
  );
};

export const RbRestartButton = (props: any) => {
  const { handleClick, disabled, loading, text } = props;
  return (
    <Button
      className="rb-btn restart-color white--text"
      onClick={handleClick}
      disabled={disabled}
      loading={loading}
      icon={<PlayCircleOutlined />}
    >
      {text ?? "Restart Network"}
    </Button>
  );
};

export const RbMonitorButton = (props: any) => {
  const { onClick, disabled, loading, style = {}, text } = props;
  return (
    <Button
      className="rb-btn restart-color white--text"
      onClick={onClick}
      disabled={disabled}
      icon={<MonitorOutlined />}
      style={{ ...style }}
      loading={loading}
    >
      {text ?? "Monitor"}
    </Button>
  );
};

export const RbSyncButton = (props: any) => {
  const { onClick, disabled, loading, style = {}, text } = props;
  return (
    <Button
      className="rb-btn download-color white--text"
      onClick={onClick}
      disabled={disabled}
      icon={<SyncOutlined />}
      style={{ ...style }}
      loading={loading}
    >
      {text ?? "Sync"}
    </Button>
  );
};

export const RbButton = (props: any) => {
  const {
    onClick,
    type,
    icon,
    text,
    disabled = false,
    loading = false,
    style = {},
  } = props;

  return (
    <Button
      {...props}
      type={type}
      onClick={onClick}
      icon={icon}
      disabled={disabled}
      loading={loading}
      className="rb-btn"
      style={{ ...style }}
    >
      {text}
    </Button>
  );
};
