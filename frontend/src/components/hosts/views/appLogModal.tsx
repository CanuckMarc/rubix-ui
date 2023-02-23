import { ChangeEvent, useEffect, useState } from "react";
import { Spin, Table, Button, Input, Typography, Tag, Modal } from "antd";
import { HostsFactory } from "../../hosts/factory";
import { AppLogModalPropType } from "./install-app-info";
import { openNotificationWithIcon } from "../../../utils/utils";
import type { ColumnsType } from 'antd/es/table';

export interface LogTableType {
  key: number;
  time: string;
  level: string;
  msg: string;
}

interface FilterItemType {
  text: string;
  value: string;
}

export const AppLogModal = (props: AppLogModalPropType) => {
  let { appName, connUUID, hostUUID, isShowingLog, setIsShowingLog } = props;
  const [isFetching, setIsFetching] = useState(false);
  const [allLogs, setAllLogs] = useState<LogTableType[]>([]);
  const [tableData, setTableData] = useState<LogTableType[]>([]);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [filterItem, setFilterItem] = useState<FilterItemType[]>([]);
  const [search, setSearch] = useState("");
  const [resetLogTableData, setResetLogTableData] = useState(false);

  const hostsFactory = new HostsFactory();
  hostsFactory.connectionUUID = connUUID;
  hostsFactory.uuid = hostUUID;

  const cleanUp = () => {
    setSearch("");
    setAllLogs([]);
    setTableData([]);
    setDuration(undefined);
  }

  useEffect(() => {
    cleanUp();
    setDuration(5);
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
    if (appName) {
      try {
        setIsFetching(true);
        const logs = await hostsFactory.EdgeAppNewLog(connUUID, hostUUID, appName, duration);
        if (logs) {
          let i = 0;
          let tempFilterItems: FilterItemType[] = []
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
                switch (index) {
                  case 1:
                    tableItem[name] = value
                    if (!tempFilterItems.some(item => item.text === value)) tempFilterItems.push({text: value, value: value});
                    break;
                  case 2: 
                    tableItem[name] = value + " " + remainderMsg
                    break;
                  default:
                    tableItem[name] = value
                }
              });
            return tableItem;
          });
          setAllLogs(temp);
          setTableData(temp);
          setFilterItem(tempFilterItems)
        }
      } catch (error) {
        console.log("error fetching logs: ", error);
      } finally {
        setIsFetching(false);
      }
    }
  };

  const columns: ColumnsType<LogTableType> = [
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "key",
      filters: filterItem,
      filterSearch: true,
      onFilter: (value: any, record: LogTableType) => record.level === value ? true : false,
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

  const handleOk = () => {
    setIsShowingLog(false);
    setResetLogTableData(true);
  };

  const handleCancel = () => {
    setIsShowingLog(false);
    setResetLogTableData(true);
  };

  return (
    <Modal title="Log table" visible={isShowingLog} onOk={handleOk} onCancel={handleCancel} width={"70vw"}>
      <div style={{ display: "flex", flexDirection: "column", alignContent: "flex-start", gap: "2vh" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5vw" }}>
          <strong>Duration (seconds): </strong>
          <Input value={duration} defaultValue={duration} onChange={handleInputChange} style={{ width: "6vw" }} />
          <Button
            type="primary"
            style={{ width: "6vw" }}
            disabled={duration === undefined}
            onClick={handleLoadButtonClicked}
          >
            Load Logs
          </Button>
        </div>
        <Input
          placeholder="Search log by message"
          disabled={tableData.length === 0}
          allowClear={true}
          value={search}
          onChange={onSearchBarChange}
          onPressEnter={handleOnSearch}
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
    </Modal>
  );
};
