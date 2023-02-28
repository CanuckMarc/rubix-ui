import { Modal, Button } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ReleasesFactory } from "../../../../../release/factory"
import { openNotificationWithIcon } from "../../../../../../utils/utils";
import { ExclamationCircleOutlined } from '@ant-design/icons';

export const RestartFFModal = (props: any) => {
  const { isModalVisible, handleClose, pluginName, refreshList } = props;
  const { connUUID = "", hostUUID = "" } = useParams();
  const [confirmLoading, setConfirmloading] = useState(false);

  const releaseFactory = new ReleasesFactory();

  const handleRestart = async () => {
    try {
      setConfirmloading(true);
      const res = await releaseFactory.EdgeServiceAction('restart', connUUID, hostUUID, 'nubeio-flow-framework.service', 'flow-framework');
      if (res) {
        openNotificationWithIcon('success', res.message)
      }
    } catch (err) {
      console.log(err);
    } finally {
      refreshList();
      handleClose();
      setConfirmloading(false);
    }
    
  };

  return (
    <Modal
      title={
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
          <ExclamationCircleOutlined style={{color: 'orange'}}/>
          <strong>Restart flow framework</strong>
        </div>
      }
      visible={isModalVisible}
      confirmLoading={confirmLoading}
      maskClosable={false}
      footer={[
        <Button key="1" onClick={handleClose}>Close</Button>,
        <Button key="2" style={{backgroundColor: 'orange'}} onClick={handleRestart} loading={confirmLoading}>Restart</Button>
      ]}
      style={{ textAlign: "start" }}
    >
      <div style={{ fontSize: "16px" }}>
        Are you sure on restarting flow-framework?
      </div>
    </Modal>
  );
};
