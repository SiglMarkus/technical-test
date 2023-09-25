export interface WebSocketPayload<T> {
  type: string; // for our event emitter
  payload: T;
}
