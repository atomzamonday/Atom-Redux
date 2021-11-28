// import { nanoid } from "nanoid";

// const Data = (() => {
//   const __private__: {
//     [id: string]: any;
//   } = {};

//   return class Data<T extends {}> {
//     id: string;
//     constructor(obj: T) {
//       this.id = nanoid();
//       __private__[this.id] = obj;
//     }
//     getData(): T {
//       return __private__[this.id];
//     }
//   };
// })();

// type DataStore<T extends {}> = {
//   id: string;
//   getData(): T;
// };

// const createDataStore = <T extends {}>(obj: T): DataStore<T> => new Data(obj);

// const x = createDataStore({
//   x: 0,
//   bool: {
//     x: true,
//     y: false,
//   },
// });

// const useR = <Selected extends unknown, T extends {} = {}>(
//   store: DataStore<T>,
//   selector: (state: T) => Selected
// ) => {
//   const x = selector(store.getData());
//   return x;
// };

// const d = useR(x, (state) => state.bool.y);

// export { Data, useR };
export {};
