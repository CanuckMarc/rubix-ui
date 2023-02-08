import { ChangeEvent, useEffect, useState } from "react";
import { Spin, Table, Button, Input, Typography, Tag, DatePicker } from "antd";
import { FlowPluginFactory } from "../../plugins/factory";
import { LogTablePropType } from "./table";
import { openNotificationWithIcon } from "../../../../../../utils/utils";

const { Title } = Typography;
const { Search } = Input;

export interface LogTableType {
  key: number;
  time: string;
  level: string;
  msg: string;
}

export const LogTable = (props: LogTablePropType) => {
  let { connUUID, hostUUID, pluginName, resetLogTableData, setResetLogTableData } = props;
  const [isFetching, setIsFetching] = useState(false);
  const [allLogs, setAllLogs] = useState<LogTableType[]>([]);
  const [tableData, setTableData] = useState<LogTableType[]>([]);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState("");

  const flowPluginFactory = new FlowPluginFactory();
  flowPluginFactory.connectionUUID = connUUID;
  flowPluginFactory.hostUUID = hostUUID;

  const cleanUp = () => {
    setSearch("");
    setAllLogs([]);
    setTableData([]);
    setDuration(undefined);
  }

  useEffect(() => {
    cleanUp();
  }, []);

  useEffect(() => {
    if (resetLogTableData) {
      cleanUp();
      setResetLogTableData(false);
    }
    return () => {
      cleanUp();
    }
  }, [resetLogTableData])

  const fetch = async (duration: number) => {
    try {
      setIsFetching(true);
      const logs = await flowPluginFactory.FlowNetworkNewLog(connUUID, hostUUID, pluginName!, duration);
      if (logs) {
        let i = 0;
        const temp = logs.message.map((item: any) => {
          i++;
          let tableItem: any = {};
          const remainderMsg = item.split(" ").splice(3, item.split(" ").length).join(" ");
          item
            .split(" ")
            .splice(0, 3)
            .forEach((el: string, index: number) => {
              const [name, value] = el.split("=");
              tableItem["key"] = i;
              index === 2 ? (tableItem[name] = value + " " + remainderMsg) : (tableItem[name] = value);
            });
          return tableItem;
        });
        setAllLogs(temp);
        setTableData(temp);
      }
    } catch (error) {
      console.log("error fetching logs: ", error);
    } finally {
      setIsFetching(false);
    }
  };

  const columns = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "key",
      render: (level: any) => {
        let colour = "blue";
        if (level === "error") {
          colour = "red";
        }
        return <Tag color={colour}>{level}</Tag>;
      },
    },
    {
      title: "Message",
      dataIndex: "msg",
      key: "msg",
    },
  ];

  const handleLoadButtonClicked = () => {
    if (duration) {
      fetch(duration);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value !== "") {
      setDuration(parseInt(event.target.value));
    } else {
      setDuration(undefined);
    }
  };

  const onSearchBarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    if (event.target.value === "") {
      setTableData(allLogs);
    }
  };

  const handleOnSearch = () => {
    if (search !== "") {
      let temp: LogTableType[] = [];
      allLogs.forEach((item: LogTableType) => {
        if (item.msg.toLowerCase().includes(search)) {
          temp.push(item);
        }
      });

      if (temp.length === 0) {
        setTableData(allLogs)
        openNotificationWithIcon("warning", 'No result matches your search.');
      } else {
        setTableData(temp);
      }
    } else {
      setTableData(allLogs);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignContent: "flex-start", gap: "2vh" }}>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5vw" }}>
        <strong>Duration: </strong>
        <Input value={duration} onChange={handleInputChange} style={{ width: "6vw" }} />
        <Button
          type="primary"
          style={{ width: "6vw" }}
          disabled={duration === undefined}
          onClick={handleLoadButtonClicked}
        >
          Load Logs
        </Button>
      </div>
      <Search
        placeholder="Search log by message"
        enterButton="Search"
        disabled={tableData.length === 0}
        allowClear={true}
        value={search}
        onChange={onSearchBarChange}
        onSearch={handleOnSearch}
        style={{width: '100%'}}
      />
      <Table
        rowKey="uuid"
        dataSource={tableData}
        columns={columns}
        pagination={{
          position: ["bottomLeft"],
          showSizeChanger: true,
          pageSizeOptions: [10, 50, 100, 1000],
          locale: { items_per_page: "" },
        }}
        loading={{ indicator: <Spin />, spinning: isFetching }}
      />
    </div>
  );
};
