import { Button, Card, Col, Input, Row, Select } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { storage } from "../../../../../../../wailsjs/go/models";
import { openNotificationWithIcon } from "../../../../../../utils/utils";
import { BackupFactory } from "../../../../../backups/factory";
import { FlowNetworkFactory } from "../factory";

import Backup = storage.Backup;

const actionRow: React.CSSProperties = { margin: "8px 0" };
const buttonStyle: React.CSSProperties = { width: "90%" };
const { Option } = Select;

export const SidePanel = (props: any) => {
  const { collapsed, selectedItem, sidePanelHeight, backups, refreshList } =
    props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [isSaveBackup, setIsSaveBackup] = useState(false);
  const [isRestoreBackup, setIsRestoreBackup] = useState(false);
  const [backup, setBackup] = useState<any>();
  const [comment, setComment] = useState<any>();

  let backupFactory = new BackupFactory();
  const application = backupFactory.AppFlowFramework;
  const subApplication = backupFactory.SubFlowFrameworkNetwork;
  let flowNetworkFactory = new FlowNetworkFactory();
  flowNetworkFactory.connectionUUID = backupFactory.connectionUUID = connUUID;
  flowNetworkFactory.hostUUID = backupFactory.hostUUID = hostUUID;

  const saveBackupHandle = async () => {
    setIsSaveBackup(true);
    try {
      if (!comment || comment.length < 2) {
        return openNotificationWithIcon("error", "please enter a comment");
      }
      const network = await flowNetworkFactory.GetNetworkWithPoints(selectedItem.uuid);
      await backupFactory.DoBackup(
        application,
        subApplication,
        `plugin:${selectedItem.plugin_name} name:${network.name} comment:${comment}`,
        network as any
      );
    } catch (err: any) {
      console.log(err);
    } finally {
      setIsSaveBackup(false);
    }
  };

  const restoreBackupHandle = async () => {
    setIsRestoreBackup(true);
    try {
      const res = await flowNetworkFactory.Import(false, true, backup.data);
      refreshList();
      openNotificationWithIcon("success", `updated backup: ${res.name}`);
    } catch (err: any) {
      openNotificationWithIcon("error", err.message);
    } finally {
      setIsRestoreBackup(false);
    }
  };

  const onChange = async (uuid: any) => {
    const backup = await backupFactory.GetOne(uuid);
    setBackup(backup);
  };

  const onChangeComment = (value: any) => {
    setComment(value.target.value);
  };

  return (
    <div
      className={collapsed ? "ant-menu ant-menu-inline-collapsed" : "ant-menu "}
      style={{
        height: sidePanelHeight + "px",
        width: "600px",
        textAlign: "start",
      }}
    >
      <div
        style={{
          display: collapsed ? "none" : "block",
        }}
      >
        <Card title={selectedItem.name}>
          <Row style={actionRow}>
            <Col span={10}>
              <Button
                type="primary"
                onClick={saveBackupHandle}
                loading={isSaveBackup}
                style={buttonStyle}
              >
                save backup
              </Button>
            </Col>
            <Col span={14}>
              <Input
                placeholder="enter a comment..."
                maxLength={150}
                onChange={onChangeComment}
                value={comment}
              />
            </Col>
          </Row>
          <Row style={actionRow}>
            <Col span={10}>
              <Button
                type="primary"
                onClick={restoreBackupHandle}
                loading={isRestoreBackup}
                style={buttonStyle}
              >
                restore backup
              </Button>
            </Col>
            <Col span={14}>
              <Select
                showSearch
                placeholder="select a backup"
                style={{ width: "100%" }}
                onChange={onChange}
              >
                {backups.map((data: Backup) => (
                  <Option key={data.uuid} value={data.uuid}>
                    {data.user_comment}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};
