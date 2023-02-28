import {
  RubixAssistLogin,
  RubixAssistToken,
  RubixAssistTokenBlock,
  RubixAssistTokenDelete,
  RubixAssistTokenGenerate,
  RubixAssistTokenRegenerate,
  RubixAssistTokens,
  RubixAssistUpdateUser
} from "../../../../wailsjs/go/backend/App";
import { CommonTokenFactory } from "../../../common/token/factory";

export class RubixAssistTokenFactory implements CommonTokenFactory {
  connectionUUID!: string;

  public Login(username: string, password: string): Promise<any> {
    return RubixAssistLogin(this.connectionUUID, username, password);
  }

  public Tokens(jwtToken: string): Promise<any> {
    return RubixAssistTokens(this.connectionUUID, jwtToken);
  }

  public Token(jwtToken: string, uuid: string): Promise<any> {
    return RubixAssistToken(this.connectionUUID, jwtToken, uuid);
  }

  public TokenGenerate(jwtToken: string, name: string): Promise<any> {
    return RubixAssistTokenGenerate(this.connectionUUID, jwtToken, name);
  }

  public TokenBlock(jwtToken: string, uuid: string, block: boolean): Promise<any> {
    return RubixAssistTokenBlock(this.connectionUUID, jwtToken, uuid, block);
  }

  public TokenRegenerate(jwtToken: string, uuid: string): Promise<any> {
    return RubixAssistTokenRegenerate(this.connectionUUID, jwtToken, uuid);
  }

  public TokenDelete(jwtToken: string, uuid: string): Promise<any> {
    return RubixAssistTokenDelete(this.connectionUUID, jwtToken, uuid);
  }

  public UpdateUser(jwtToken: string, username: string, password: string): Promise<any> {
    return RubixAssistUpdateUser(this.connectionUUID, jwtToken, username, password);
  }
}
