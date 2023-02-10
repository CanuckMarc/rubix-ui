import { Input, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import React, { useEffect, useMemo, useState } from "react";
import { LocationFactory } from "../locations/factory";
import { ConnectionFactory } from "../connections/factory";
import { getTreeDataIterative } from "./searchable-tree.ui-service";
import { NavLink } from "react-router-dom";

const locationFactory = new LocationFactory();
const connectionFactory = new ConnectionFactory();

const { Search } = Input;

interface TDataNode extends DataNode {
  name?: string;
}

interface DataNodeListItem {
  key: React.Key;
  title: string;
}

const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

const SearchableTree: React.FC = () => {
  const [data, updateData] = useState([] as TDataNode[]);
  const [dataList, updateDataList] = useState([] as DataNodeListItem[]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const onExpand = (newExpandedKeys: any) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  const fetchConnections = async () => {
    try {
      let connections = (await connectionFactory.GetAll()) as any;
      for (const c of connections) {
        let locations = [];
        locations = await getLocations(c.uuid);
        c.locations = locations;
      }
      updateData(getTreeDataIterative(connections, ""));
    } catch (error) {
      console.log(error);
    }
  };

  const generateList = (data: TDataNode[]) => {
    const dataList: DataNodeListItem[] = [];

    const helperFn = (dataNodes: TDataNode[]) => {
      for (let i = 0; i < dataNodes.length; i++) {
        const node = dataNodes[i];
        const { key, name } = node;
        dataList.push({ key, title: name as string });
        if (node.children) {
          helperFn(node.children);
        }
      }
    };
    helperFn(data);

    updateDataList(dataList);
    return dataList;
  };

  const getLocations = async (connUUID: string) => {
    locationFactory.connectionUUID = connUUID;
    try {
      return await locationFactory.GetAll();
    } catch (err) {
      return [];
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const newExpandedKeys: any = dataList
      .map((item) => {
        if (item.title.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          return getParentKey(item.key, data);
        }

        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(newExpandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };

  const treeData = useMemo(() => {
    const loop = (data: TDataNode[]): TDataNode[] =>
      data.map((item: any) => {
        const strTitle = item.name as string;
        const next = item.next;
        const index = strTitle.indexOf(searchValue);
        const beforeStr = strTitle.substring(0, index);
        const afterStr = strTitle.slice(index + searchValue.length);

        const title =
          index > -1 ? (
            <NavLink to={next}>
              {beforeStr}
              <span style={{ background: "#dfdfdf" }} className="site-tree-search-value">
                {searchValue}
              </span>
              {afterStr}
            </NavLink>
          ) : (
            <NavLink to={next}>
              <span>{item.name}</span>
            </NavLink>
          );
        if (item.children) {
          return {
            ...item,
            title,
            key: item.key,
            children: loop(item.children),
          };
        }
        return {
          ...item,
          title,
          key: item.key,
        };
      });

    return loop(data);
  }, [searchValue, data]);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    const dataList = generateList(data);
    const newExpandedKeys: any = dataList.map((item) => getParentKey(item.key, data)).filter((val) => val);
    setExpandedKeys(newExpandedKeys);
  }, [data]);

  return (
    <div>
      <Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onChange} />
      <Tree onExpand={onExpand} expandedKeys={expandedKeys} autoExpandParent={autoExpandParent} treeData={treeData} />
    </div>
  );
};

export default SearchableTree;
