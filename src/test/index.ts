import {
  createAtomStore,
  Dispatch,
  DefaultDispatch,
  createUseAtomSelector,
  useAtomStoreSelector,
} from "../index";

type X = {
  username: string;
  password: string;
};

const x: X = {
  username: "",
  password: "",
};

const store = createAtomStore<X, DefaultDispatch<undefined, "ADD">>(
  x,
  (state, dispatch) => {
    const { action } = dispatch;
    return state;
  }
);

const useX = useAtomStoreSelector(store, (state) => state.username);

store.dispatch({
  action: "ADD",
});
