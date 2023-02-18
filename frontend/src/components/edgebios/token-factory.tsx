import {
  EdgeBiosLogin,
  EdgeBiosToken,
  EdgeBiosTokenBlock,
  EdgeBiosTokenDelete,
  EdgeBiosTokenGenerate,
  EdgeBiosTokenRegenerate,
  EdgeBiosTokens,
  EdgeBiosUpdateUser
} from "../../../wailsjs/go/backend/App";
import { CommonTokenFactory } from "../../common/token/factory";

export class EdgeBiosTokenFactory implements CommonTokenFactory {
  constructor(connectionUUID: string) {
    this.connectionUUID = connectionUUID
  }
  connectionUUID!: string;
  hostUUID!: string;

  public Login(username: string, password: string): Promise<any> {
    return EdgeBiosLogin(this.connectionUUID, this.hostUUID, username, password);
  }

  public Tokens(jwtToken: string): Promise<any> {
    return EdgeBiosTokens(this.connectionUUID, this.hostUUID, jwtToken);
  }

  public Token(jwtToken: string, uuid: string): Promise<any> {
    return EdgeBiosToken(this.connectionUUID, this.hostUUID, jwtToken, uuid);
  }

  public TokenGenerate(jwtToken: string, name: string): Promise<any> {
    return EdgeBiosTokenGenerate(this.connectionUUID, this.hostUUID, jwtToken, name);
  }

  public TokenBlock(jwtToken: string, uuid: string, block: boolean): Promise<any> {
    return EdgeBiosTokenBlock(this.connectionUUID, this.hostUUID, jwtToken, uuid, block);
  }

  public TokenRegenerate(jwtToken: string, uuid: string): Promise<any> {
    return EdgeBiosTokenRegenerate(this.connectionUUID, this.hostUUID, jwtToken, uuid);
  }

  public TokenDelete(jwtToken: string, uuid: string): Promise<any> {
    return EdgeBiosTokenDelete(this.connectionUUID, this.hostUUID, jwtToken, uuid);
  }

  public UpdateUser(jwtToken: string, username: string, password: string): Promise<any> {
    return EdgeBiosUpdateUser(this.connectionUUID, this.hostUUID, jwtToken, username, password);
  }
}
