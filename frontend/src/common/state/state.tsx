export enum ResultState {
  initital, success, failure, loading
}

export interface Result {
  state: ResultState;
  message?: string;
}
