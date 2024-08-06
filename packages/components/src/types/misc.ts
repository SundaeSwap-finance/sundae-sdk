export type TDeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? TDeepPartial<U>[]
    : T[P] extends readonly (infer X)[]
    ? readonly TDeepPartial<X>[]
    : TDeepPartial<T[P]>;
};
