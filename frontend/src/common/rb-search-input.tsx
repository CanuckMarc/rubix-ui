import { Input } from "antd";
import { ChangeEvent, useEffect, useState } from "react";

export const RbSearchInput = (props: any) => {
  const { originData = [], setFilteredData } = props.config;
  const [search, setSearch] = useState("");

  const handleChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.currentTarget.value);
  };

  useEffect(() => {
    const keyword = search.toLowerCase().trim();
    const _filteredData =
      keyword.length > 0 ? originData.filter((item: any) => item.name?.toLowerCase().includes(keyword)) : originData;
    setFilteredData(_filteredData);
  }, [search, originData]);

  return <Input placeholder="Search name..." {...props} allowClear value={search} onChange={handleChangeSearch} />;
};
