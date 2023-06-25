import { BehaviorSubject, Observable } from "rxjs";
import { EFFECT } from "./core/lib/constants";

type ValueOf<T> = T[keyof T];

export type State = object;
export type EffectState = ValueOf<typeof EFFECT.STATUS>;

export type Decorator<T, TArgs extends any[] = any[], TResult = any> = (
  instance: Module<T>,
  helpers: unknown
) => (id: string | null, ...args: TArgs) => TResult;

type DecoratorObject<T> = {
  [key: string]: Decorator<T>;
};

export type ManagedDecorators<D extends DecoratorObject<unknown>> = {
  [K in keyof D]: ReturnType<D[K]>;
};

export type Config<T extends State, TDecorators extends DecoratorObject<T>> = {
  name: string;
  initialState: T;
  decorators: TDecorators;
};

type ErrorBundle = {
  error: Error;
  __handled: boolean;
};

type Effect = {
  status: EffectState;
};

type EffectWithID = {
  [id: string]: Effect;
};

type EffectError = ErrorBundle;

type EffectErrorWithID = {
  [id: string]: EffectError;
};

type EffectStateModifier = {
  [EFFECT.STATE_NAMESPACE]: {
    [effectKey: string]:
      | Effect
      | EffectWithID
      | EffectError
      | EffectErrorWithID;
  };
};

type StateMutable<T> = { -readonly [K in keyof Partial<T>]: any };

type StateModifierObject<T> = StateMutable<T> | EffectStateModifier;

export type StateModifierHandler<T> =
  | StateModifierObject<T>
  | ((prevState: T) => StateModifierObject<T>);

export type Module<T, D extends DecoratorObject<unknown> = {}> = {
  name: string;
  getState: () => T;
  setState: (stateModifier: StateModifierHandler<T>, mergeFunction?) => void;
  state$: BehaviorSubject<T>;
  subscribe: (cb: (incomingState: T) => void) => void;
} & ManagedDecorators<D>;

export type SourceArgs<T> = {
  [K in keyof T]: T[K] extends Observable<infer R> ? R : never;
};

export type ProjectionFn<TArgs extends unknown[], TReturn> = (
  ...args: SourceArgs<TArgs>
) => TReturn;

export type Mapped<T> = { id: string; value: T };
export type MappedObservable<T> = Observable<Mapped<T>>;

export type PredicateFn = (output: number) => boolean;
