import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { deepclone, useLazyRef, useMounted } from "./utility";

type DispatchAction<
  Type extends string,
  Payload extends unknown = undefined
> = Payload extends undefined
  ? {
      type: Type;
    }
  : {
      type: Type;
      payload: Payload;
    };

type DefaultDispatchAction =
  | DispatchAction<string, unknown>
  | DispatchAction<string, undefined>;

type Reducer<State extends {}, Action extends DefaultDispatchAction> = (
  state: State,
  action: Action
) => State | Promise<State>;

class AtomStore<State extends {}, Action extends DefaultDispatchAction> {
  private __state: State;
  private __reducer: Reducer<State, Action>;
  private __listenerIds: string[] = [];
  private __listeners: {
    [id: string]: (state: State) => void;
  } = {};

  constructor(initState: () => State, reducer: Reducer<State, Action>) {
    this.__state = deepclone(initState());
    this.__reducer = reducer;
  }

  async dispatch(action: Action) {
    this.__state = await this.__reducer(this.__state, action);
    this.__listenerIds.forEach((id) => {
      const listener = this.__listeners[id];
      if (typeof listener === "function") {
        listener(this.getState());
      }
    });
  }

  subscribe(lisenerCallback: (state: State) => any) {
    const id = nanoid();
    this.__listenerIds.push(id);
    this.__listeners[id] = lisenerCallback;
    return id;
  }

  unsubscribe(id: string) {
    this.__listenerIds = this.__listenerIds.filter(
      (listenerId) => id !== listenerId
    );
    delete this.__listeners[id];
  }

  getState() {
    return Object.freeze(deepclone(this.__state));
  }
}

const createAtomStore = <
  State extends {},
  Action extends DefaultDispatchAction
>(
  initState: () => State,
  reducer: Reducer<State, Action>
): AtomStore<State, Action> => {
  return new AtomStore(initState, reducer);
};

const shallowShouldUpdate = <State extends unknown>(pv: State, cv: State) =>
  pv !== cv;

const useAtomStoreSelector = <
  Action extends DefaultDispatchAction,
  Store extends AtomStore<State, Action>,
  State extends ReturnType<Store["getState"]>,
  Selected extends unknown = unknown
>(
  store: Store,
  selector: (state: State) => Selected,
  shouldUpdate?: (pv: Selected, cv: Selected) => boolean
) => {
  const [value, setValue] = useState(() =>
    selector(store.getState() as unknown as State)
  );
  const mounted = useMounted();
  const preVal = useLazyRef(() => value);

  useEffect(() => {
    const __shouldUpdate = shouldUpdate || shallowShouldUpdate;
    const id = store.subscribe(() => {
      const currentVal = selector(store.getState() as unknown as State);
      if (__shouldUpdate(preVal.current, currentVal) === false) {
        return;
      }
      preVal.current = currentVal;
      if (mounted.current) {
        setValue(() => currentVal);
      }
    });

    return () => {
      store.unsubscribe(id);
    };
  }, []);

  return value;
};

const createUseAtomSelector = <
  Action extends DefaultDispatchAction,
  Store extends AtomStore<{}, Action>
>(
  store: Store
) => {
  return <
    Selected extends unknown,
    State extends ReturnType<Store["getState"]>
  >(
    selector: (state: State) => Selected,
    shouldUpdate?: (pv: Selected, cv: Selected) => boolean
  ) =>
    //@ts-ignore
    useAtomStoreSelector<Action, Store, State, Selected>(
      store,
      selector,
      shouldUpdate
    );
};

export {
  createAtomStore,
  useAtomStoreSelector,
  useLazyRef,
  createUseAtomSelector,
};
export type { DispatchAction, Reducer };

// type D = {
//   username: string;
//   password: string;
//   y: { x: number };
// };

// const d: D = {
//   username: "",
//   password: "",
//   y: { x: 0 },
// };

// type DA =
//   | DispatchAction<"reset", undefined>
//   | DispatchAction<"set-username", string>
//   | DispatchAction<"set-password", string>;

// const s = createAtomStore<D, DA>(
//   () => d,
//   (state, r) => {
//     const { type } = r;
//     if (type === "set-password") {
//       const { payload: password } = r;
//       return {
//         ...state,
//         password,
//       };
//     }
//     if (type === "set-username") {
//       const { payload: password } = r;
//       return {
//         ...state,
//         password,
//       };
//     }
//     if (type === "reset") {
//       return deepclone(d);
//     }
//     return state;
//   }
// );

// const _su = useAtomStoreSelector<DA, typeof s, D, D["y"]["x"]>(
//   s,
//   (state) => state.y.x
// );
