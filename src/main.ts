import { nanoid } from "nanoid";
import { useEffect, useState, useDebugValue } from "react";
import { deepclone, useMounted, useLazyRef } from "./utility";

export namespace Atom {
  export type Subscriber<State> = (state: State) => unknown;
  export type Reducer<State, Action> = (state: State, action: Action) => Promise<State>;
  // export type Store<State, Action> = {
  //   dispatch(action: Action): Promise<void>;
  //   subscribe(subscriber: Subscriber<State>): string;
  //   unsubscribe(subId: string): void;
  //   getState(): State;
  // };
}

export type ReducerAction<Type, Payload = undefined> = {
  type: Type;
} & (Payload extends undefined ? {} : { payload: Payload });

export type Selector<State, Select> = (state: State) => Select;

export type ShouldUpdate<Select> = (previous: Select, current: Select) => boolean;

type RunnerFunction = () => Promise<void>;

class Runner {
  private runners: RunnerFunction[] = [];
  private running: boolean = false;
  private promise: Promise<void> = Promise.resolve();

  private async run() {
    this.running = true;
    while (this.runners.length > 0) {
      await (this.runners[0] as RunnerFunction)();
      this.runners.shift();
    }
    this.running = false;
  }

  push(runner: RunnerFunction) {
    this.runners.push(runner);
    if (this.running === false) {
      this.promise = this.run();
    }
    return this.promise;
  }
}

class Store<State, Action> {
  private state;
  private reducer: Atom.Reducer<State, Action>;
  private subscribers: {
    [id: string]: Atom.Subscriber<State>;
  } = {};
  private runner: Runner;

  constructor(initialiseState: () => State, reducer: Atom.Reducer<State, Action>) {
    this.runner = new Runner();
    this.state = initialiseState();
    this.reducer = reducer;
  }

  private async _dispatch(action: Action) {
    this.state = deepclone(await this.reducer(this.state, action));
    const ids = Object.keys(this.subscribers);
    ids.forEach((id) => {
      const subscriber = this.subscribers[id];
      if (typeof subscriber === "function") {
        // prevent blocking subscribing.
        window.setTimeout(() => {
          const state = deepclone(this.state);
          subscriber(state);
        });
      }
    });
  }

  dispatch(action: Action) {
    return this.runner.push(this._dispatch.bind(this, action));
  }

  getState() {
    return deepclone(this.state);
  }

  subscribe(subscriber: Atom.Subscriber<State>) {
    const id = nanoid();
    this.subscribers[id] = subscriber;
    return id;
  }

  unsubscribe(id: string) {
    if (typeof this.subscribers[id] === "function") {
      delete this.subscribers[id];
    }
  }
}

export const createStore = <State, Action>(
  initialiseState: () => State,
  reducer: Atom.Reducer<State, Action>
) => {
  return new Store(initialiseState, reducer);
};

const shallowCompare = <T>(a: T, b: T) => a !== b;

export const useStoreSelector = <State, Select, Action>(
  store: Store<State, Action>,
  selector: Selector<State, Select>,
  shouldUpdate?: ShouldUpdate<Select>
) => {
  const isMounted = useMounted();
  const [val, setVal] = useState(() => selector(store.getState()));
  const current = useLazyRef(() => val);

  useEffect(() => {
    const shouldUpdate_ = shouldUpdate || shallowCompare;
    const id = store.subscribe((state) => {
      const newVal = selector(state);
      if (shouldUpdate_(current.current, newVal)) {
        current.current = newVal;
        isMounted.current && setVal(current.current);
      }
    });

    return () => store.unsubscribe(id);
  }, []);

  useDebugValue(val);

  return val;
};

export const createUseSelector = <State, Action>(store: Store<State, Action>) => {
  return <Select>(selector: Selector<State, Select>, shouldUpdate?: ShouldUpdate<Select>) =>
    useStoreSelector(store, selector, shouldUpdate);
};

// type Data = {
//   username: string;
//   password: string;
//   o: { x: number; y: number };
// };

// type DataAction =
//   | {
//       type: "username";
//       payload: string;
//     }
//   | {
//       type: "password";
//       payload: string;
//     }
//   | {
//       type: "o";
//       payload: Data["o"];
//     };

// const i = (): Data => ({
//   username: "",
//   password: "",
//   o: {
//     x: 0,
//     y: 0,
//   },
// });

// const reducer: Reducer<Data, DataAction> = async (state, action) => {
//   switch (action.type) {
//     case "username":
//       return {
//         ...state,
//         username: action.payload,
//       };
//   }
//   return state;
// };

// const store = createStore<Data, DataAction>(i, reducer);

// const v = useStoreSelector(store, (state) => state.username);

// const use = createUseSelector(store);
