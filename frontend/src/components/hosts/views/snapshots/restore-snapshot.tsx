import { useParams } from "react-router-dom";
import { useEffect } from "react";

export const RestoreSnapshot = () => {
  const { connUUID = "", hostUUID = "", locUUID = "", netUUID = "" } = useParams();

  useEffect(() => {}, []);

  return <>RestoreSnapshot</>;
};
