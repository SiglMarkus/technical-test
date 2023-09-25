/**
 * Default Websocket Payload Interface
 */
export interface WebsocketPayloadInterface<T> {
  type: string; // event type for subscribing
  payload: T; // data sent
}
