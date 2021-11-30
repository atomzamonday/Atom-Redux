import { pubsub } from "atom-pubsub";
import { useState, useEffect, useRef } from "react";
import Deepclone from "rfdc";
import { nanoid } from "nanoid";

const deepclone = Deepclone({
  proto: true,
  circles: false,
});

type Action<Type extends string, Payload extends {}> = {
  type: Type;
  payload: Payload;
};
type Reducer<
  State extends {},
  ActionType extends string,
  Payload extends Partial<State>
> = (state: State, action: Action<ActionType, Payload>) => State;

const AtomStoreClass = (() => {
  type PrivateState<T extends {}> = {
    state: T;
    reducer: Reducer<T, string, Partial<T>>;
    pubId: string;
  };

  const __private__: {
    [id: string]: PrivateState<{}>;
  } = {};

  class AtomStore<
    State extends {},
    ActionType extends string,
    Payload extends Partial<State>
  > {
    private id: string;

    constructor(
      initState: State,
      reducer: Reducer<State, ActionType, Payload>
    ) {
      this.id = nanoid();
      __private__[this.id] = {
        state: initState,
        reducer: reducer as unknown as Reducer<{}, string, Partial<{}>>,
        pubId: nanoid(),
      };
    }

    dispatch(action: Action<ActionType, Payload>) {
      const { state, reducer, pubId } = __private__[
        this.id
      ] as unknown as PrivateState<State>;
      (__private__[this.id] as unknown as PrivateState<State>).state = reducer(
        state,
        action
      );
      pubsub.publish(pubId);
    }

    subscribe(callback: () => any) {
      const { pubId } = __private__[this.id] as unknown as PrivateState<State>;
      return pubsub.subscribe(pubId, callback);
    }

    unsubscribe(id: string) {
      pubsub.unsubscribe(id);
    }

    getState() {
      return Object.freeze(
        deepclone(
          (__private__[this.id] as unknown as PrivateState<State>).state
        )
      );
    }
  }

  return AtomStore;
})();

type AtomStore<
  State extends {},
  ActionType extends string,
  Payload extends Partial<State>
> = {
  dispatch(action: Action<ActionType, Payload>): void;
  subscribe(callback: () => any): string;
  unsubscribe(id: string): void;
  getState(): State;
};

const createAtomStore = <
  State extends {},
  ActionType extends string,
  Payload extends Partial<State>
>(
  initState: State,
  reducer: Reducer<State, ActionType, Payload>
): AtomStore<State, ActionType, Payload> => {
  return new AtomStoreClass(initState, reducer);
};

const useLazyRef = <T>(lazyInit: () => T) => {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = lazyInit();
  }
  return ref as React.MutableRefObject<T>;
};

const useAtomStoreSelector = <
  Selected extends unknown,
  Store extends AtomStore<{}, string, Partial<{}>>,
  State extends ReturnType<Store["getState"]>
  // Store extends AtomStore<{}, string, Partial<{}>>,
  // State extends ReturnType<Store["getState"]>
>(
  store: Store,
  selector: (state: State) => Selected,
  shouldUpdate?: (pv: Selected, cv: Selected) => boolean
) => {
  const [value, setValue] = useState(() =>
    selector(store.getState() as unknown as State)
  );
  const preVal = useLazyRef(() =>
    selector(store.getState() as unknown as State)
  );

  useEffect(() => {
    const id = store.subscribe(() => {
      const currentVal = selector(store.getState() as unknown as State);
      if (
        shouldUpdate !== undefined &&
        shouldUpdate(preVal.current, currentVal) === false
      ) {
        return;
      }
      preVal.current = currentVal;
      setValue(() => currentVal);
    });

    return () => {
      store.unsubscribe(id);
    };
  }, []);

  return value;
};

export { createAtomStore, useAtomStoreSelector, useLazyRef };
export type { Action, Reducer, AtomStore };
