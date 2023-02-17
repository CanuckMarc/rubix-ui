export interface CommonTokenFactory {
  connectionUUID: string;

  Login(username: string, password: string): Promise<any>;

  Tokens(jwtToken: string): Promise<any>;

  Token(jwtToken: string, uuid: string): Promise<any>;

  TokenGenerate(jwtToken: string, name: string): Promise<any>;

  TokenBlock(jwtToken: string, uuid: string, block: boolean): Promise<any>;

  TokenRegenerate(jwtToken: string, uuid: string): Promise<any>;

  TokenDelete(jwtToken: string, uuid: string): Promise<any>;

  UpdateUser(jwtToken: string, username: string, password: string): Promise<any>;
}
