import { Typography, Card } from "antd";
import { LorawanTable } from "./views/table";

const { Title } = Typography;

const Lorawan = () => {
  return (
    <>
      <Title level={3} style={{ textAlign: "left" }}>
        Lorawan
      </Title>
      <Card bordered={false}>
        <LorawanTable />
      </Card>
    </>
  );
};

export default Lorawan;
