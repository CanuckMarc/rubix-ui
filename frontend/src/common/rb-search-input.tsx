import { Input } from "antd";
import { ChangeEvent, useEffect, useState } from "react";

export const RbSearchInput = (props: any) => {
  const { originData = [], setFilteredData } = props.config;
  const [search, setSearch] = useState("");

  const handleChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  const handleSearch = (keyword: string) => {
    let results: any[] = [];
    if (keyword.length > 0) {
      const toSearch = keyword.toLowerCase().trim();
      for (let item of originData) {
        for (let key in item) {
          if (
            item[key] &&
            typeof item[key] !== "object" &&
            item[key].toString().toLowerCase().trim().includes(toSearch)
          ) {
            if (!itemExists(results, item)) results.push(item);
          }
        }
      }
    } else {
      results = originData;
    }
    setFilteredData(results);
  };

  const itemExists = (haystack: any, needle: any) => {
    for (var i = 0; i < haystack.length; i++) if (compareObjects(haystack[i], needle)) return true;
    return false;
  };

  const compareObjects = (o1: any, o2: any) => {
    var k = "";
    for (k in o1) if (o1[k] != o2[k]) return false;
    for (k in o2) if (o1[k] != o2[k]) return false;
    return true;
  };

  useEffect(() => {
    handleSearch(search);
  }, [search, originData]);

  return <Input placeholder="Search..." {...props} allowClear value={search} onChange={handleChangeSearch} />;
};
