import { createStore, ReducerAction } from "../dist/cjs/main";

type Data = {
  username: string;
  password: string;
};

const data: Data = {
  username: "",
  password: "",
};

const store = createStore<
  Data,
  ReducerAction<"set-uname", string> | ReducerAction<"set-pwd", string>
>(
  () => data,
  async (old, action) => {
    if (action.type === "set-uname") {
      return {
        ...old,
        username: action.payload,
      };
    }
    if (action.type === "set-pwd") {
      return {
        ...old,
        password: action.payload,
      };
    }
    return old;
  }
);

store.dispatch({
  type: "set-uname",
  payload: "unfuenfwefwef",
});

store.dispatch({
  type: "set-pwd",
  payload: "secret",
});

store.dispatch({
  type: "set-uname",
  payload: "uioiiioiiiiokf",
});

setTimeout(() => console.log(store.getState()), 100);
