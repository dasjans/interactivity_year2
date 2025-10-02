//#region ../events/dist/src/types.d.ts
type Listener<Events> = (event: unknown, sender: ISimpleEventEmitter<Events>) => void;
type ISimpleEventEmitter<Events> = {
  addEventListener<K extends keyof Events>(type: K, listener: (event: Events[K], sender: ISimpleEventEmitter<Events>) => void): void;
  removeEventListener<K extends keyof Events>(type: K, listener: (event: Events[K], sender: ISimpleEventEmitter<Events>) => void): void;
};
//# sourceMappingURL=types.d.ts.map
//#endregion
//#region ../events/dist/src/simple-event-emitter.d.ts
declare class SimpleEventEmitter<Events> implements ISimpleEventEmitter<Events> {
  #private;
  dispose(): void;
  get isDisposed(): boolean;
  /**
   * Fire event
   * @param type Type of event
   * @param args Arguments for event
   * @returns
   */
  protected fireEvent<K extends keyof Events>(type: K, args: Events[K]): void;
  /**
   * Adds event listener.
   *
   * @throws Error if emitter is disposed
   * @typeParam K - Events
   * @param name Event name
   * @param listener Event handler
   */
  addEventListener<K extends keyof Events>(name: K, listener: (event: Events[K], sender: SimpleEventEmitter<Events>) => void): void;
  /**
   * Remove event listener
   *
   * @param listener
   */
  removeEventListener<K extends keyof Events>(type: K, listener: (event: Events[K], sender: SimpleEventEmitter<Events>) => void): void;
  /**
   * Clear all event listeners
   * @private
   */
  clearEventListeners(): void;
}
//# sourceMappingURL=simple-event-emitter.d.ts.map
declare namespace index_d_exports {
  export { ISimpleEventEmitter, Listener, SimpleEventEmitter };
}
//#endregion
export { ISimpleEventEmitter, SimpleEventEmitter, index_d_exports };
//# sourceMappingURL=index-CZIsUroQ.d.ts.map