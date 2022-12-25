import { Input } from "antd";
import { ChangeEvent } from "react";

export const RbSearchInput = (props: any) => {
  const { search, onChange } = props;
  return <Input placeholder="Search name..." allowClear value={search} onChange={onChange} {...props} />;
};
