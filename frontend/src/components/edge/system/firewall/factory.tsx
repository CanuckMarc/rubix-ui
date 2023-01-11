import {
    EdgeFirewallList,
    EdgeFirewallStatus,
    EdgeFirewallEnable,
    EdgeFirewallDisable,
    EdgeFirewallPortOpen,
    EdgeFirewallPortClose,
  } from "../../../../../wailsjs/go/backend/App";
  import { system, ufw } from "../../../../../wailsjs/go/models";
  
  export class HostFirewallFactory {
    
    public EdgeFirewallList(connUUID: string, hostUUID: string): Promise<ufw.UFWStatus[]> {
        return EdgeFirewallList(connUUID, hostUUID);
    }

    public EdgeFirewallStatus(connUUID: string, hostUUID: string): Promise<ufw.Message> {
        return EdgeFirewallStatus(connUUID, hostUUID);
    }

    public EdgeFirewallEnable(connUUID: string, hostUUID: string): Promise<ufw.Message> {
        return EdgeFirewallEnable(connUUID, hostUUID);
    }

    public EdgeFirewallDisable(connUUID: string, hostUUID: string): Promise<ufw.Message> {
        return EdgeFirewallDisable(connUUID, hostUUID);
    }

    public EdgeFirewallPortOpen(connUUID: string, hostUUID: string, body: system.UFWBody): Promise<ufw.Message> {
        return EdgeFirewallPortOpen(connUUID, hostUUID, body);
    }

    public EdgeFirewallPortClose(connUUID: string, hostUUID: string, body: system.UFWBody): Promise<ufw.Message> {
        return EdgeFirewallPortClose(connUUID, hostUUID, body);
    }

  }