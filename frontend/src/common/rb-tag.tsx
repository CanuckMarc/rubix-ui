import React from "react";
import { Tag } from "antd";

interface BadgeDetailI {
  [name: string]: {
    title: string;
    color: string;
  };
}

export enum APPLICATION_STATES {
  ENABLED = "enabled",
  DISABLED = "disabled",
  ACTIVE = "active",
  INACTIVE = "inactive",
  RUNNING = "running",
  ACTIVATING = "activating",
  AUTORESTART = "auto-restart",
  DEAD = "dead",
}
export const badgeDetails: BadgeDetailI = {
  [APPLICATION_STATES.ENABLED]: {
    title: "Enabled",
    color: "green",
  },
  [APPLICATION_STATES.DISABLED]: {
    title: "Disabled",
    color: "light gray",
  },
  [APPLICATION_STATES.ACTIVE]: {
    title: "Active",
    color: "blue",
  },
  [APPLICATION_STATES.INACTIVE]: {
    title: "Inactive",
    color: "orange",
  },
  [APPLICATION_STATES.ACTIVATING]: {
    title: "Activating",
    color: "yellow",
  },
  [APPLICATION_STATES.RUNNING]: {
    title: "Running",
    color: "green",
  },
  [APPLICATION_STATES.DEAD]: {
    title: "Dead",
    color: "volcano",
  },
  [APPLICATION_STATES.AUTORESTART]: {
    title: "Auto-Restart",
    color: "pink",
  },
  default: {
    title: "",
    color: "",
  },
};

const RbTag = (props: any) => {
  const { state } = props;
  let badgeDetail = badgeDetails[state];
  if (!badgeDetail) {
    return <Tag>{state}</Tag>;
  }

  return <Tag color={badgeDetail.color}>{badgeDetail.title}</Tag>;
};

export default RbTag;
