import {
  init,
  last,
  map,
  prop,
  groupBy,
  reduce,
  concat,
  zip,
  values,
  flatten,
  path,
  head,
} from "ramda";
import { normalize, schema } from "normalizr";
import { Observable, combineLatest } from "rxjs";
import { map as rMap, shareReplay } from "rxjs/operators";

import { attachParentId } from "../../core/lib/attachParentId";
import { attachUniqueId } from "../../core/lib/attachUniqueId";
import {
  Mapped,
  MappedObservable,
  PredicateFn,
  ProjectionFn,
  SourceArgs,
} from "../../types";
import { getUniqueId } from "../../utils";

const propSourceId = prop("@id");
const propParentId = prop("@parentId");

export function select<
  TResult,
  TSource extends Observable<unknown>[],
  TLast extends ProjectionFn<TSource, any>
>(...args: [...TSource, TLast]): Observable<ReturnType<TLast>> {
  const sources = init(args) as TSource;
  const projection = last(args) as TLast;

  const test = <TReturn>(...rest: SourceArgs<TSource>): TReturn => {
    return projection(...rest);
  };

  const parameterOrderBySourceId = map<Observable<unknown>, string>(
    propSourceId,
    sources
  );
  const pipedSources = zippingPipeline(sources);

  const selected$ = combineLatest(pipedSources).pipe(
    flattenIf((outputLength) => outputLength !== sources.length),
    deriveOrderedResult(parameterOrderBySourceId),
    // @ts-ignore
    rMap((result) => test(...result)),
    shareReplay(1)
  );

  // We have to track selectors that are derived from the same source to ensure
  // that their state updates are synced. If we don't then the number of
  // out-of-sync state updates that occur between `n` sibling selectors will be
  // equal to `n`. For selectors that use more than a single source, this is not
  // a concern.
  const isParentIdSignificant = sources.length === 1;
  const parentId = isParentIdSignificant
    ? propSourceId(head(sources))
    : getUniqueId();
  attachUniqueId(selected$);
  attachParentId(selected$, parentId);
  return selected$ as Observable<ReturnType<TLast>>;
}

function zippingPipeline<T>(sources: Observable<T>[]): MappedObservable<T>[] {
  const boundSources = map(
    (source$) =>
      source$.pipe(
        bindSourceToIds(propSourceId(source$), propParentId(source$))
      ),
    sources
  );
  const zippedSources = zipSiblings(boundSources);
  return zippedSources;
}

function bindSourceToIds<T>(id, parentId) {
  return (input$: Observable<T>) => {
    const boundSource$ = input$.pipe(rMap((value) => ({ id, value })));
    attachParentId(boundSource$, parentId);
    return boundSource$;
  };
}

function zipSiblings<T>(sources: Observable<T>[]) {
  const sourcesGroupedByParentId = groupBy<Observable<T>>(
    propParentId,
    sources
  );
  const arrGroupedBy = values(sourcesGroupedByParentId);
  return reduce(
    (acc, group) => {
      const hasSiblingsToZip = group.length > 1;
      const concatAcc = concat(acc);
      return hasSiblingsToZip
        ? // @ts-ignore
          (concatAcc(zip(...group)) as Observable<T>[])
        : concatAcc(group);
    },
    [] as Observable<T>[],
    arrGroupedBy
  );
}

function flattenIf(predicate: PredicateFn) {
  return <T>(input$: Observable<Mapped<T>[]>) =>
    input$.pipe(
      rMap((output) => {
        const shouldFlatten = predicate(output.length);
        return shouldFlatten ? flatten(output) : output;
      })
    );
}

const resultEntity = new schema.Entity("results");

function deriveOrderedResult(orderBySourceId: string[]) {
  return <T>(input$: Observable<Mapped<T>[]>) =>
    input$.pipe(
      rMap((output) => {
        const normalized = normalize(output, [resultEntity]);
        const { results } = normalized.entities;
        return map(
          (sourceId) => path([sourceId, "value"], results),
          orderBySourceId
        ) as Mapped<T>[];
      })
    );
}
