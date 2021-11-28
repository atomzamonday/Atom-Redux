// class AtomStore<
//   State extends {},
//   ActionType extends string,
//   Payload extends Partial<State>
// > {
//   #state: State;
//   #reducer: Reducer<State, ActionType, Payload>;
//   #pubId: string;

//   constructor(initState: State, reducer: Reducer<State, ActionType, Payload>) {
//     this.#state = initState;
//     this.#reducer = reducer;
//     this.#pubId = nanoid();
//   }

//   dispatch(action: Action<ActionType, Payload>) {
//     this.#state = this.#reducer(this.#state, action);
//     pubsub.publish(this.#pubId);
//   }

//   subscribe(callback: () => any) {
//     return pubsub.subscribe(this.#pubId, callback);
//   }

//   unsubscribe(id: string) {
//     pubsub.unsubscribe(id);
//   }

//   getState() {
//     return deepclone(this.#state);
//   }
// }

export {};
