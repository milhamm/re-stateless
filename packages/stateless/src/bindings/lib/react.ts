import {
  memo,
  useState,
  FunctionComponent,
  useEffect,
  createElement,
  forwardRef,
} from "react";
import { equals, isNil, map, mergeAll, pipe, toPairs } from "ramda";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  map as rMap,
  shareReplay,
} from "rxjs";

function connect(
  deriveSourceMapping: () => Record<string, BehaviorSubject<unknown>>,
  options = { forwardRef: false }
) {
  return function withModule(
    Component: FunctionComponent,
    propsAreEqual = equals
  ) {
    const MemoizedComponent = memo(Component, propsAreEqual);
    function ConnectedComponent({ forwardedConnectRef, ...ownProps }) {
      const [moduleProps, setModuleProps] = useState();
      useEffect(() => {
        const sourceMapping = safelyDeriveSourceMapping(
          deriveSourceMapping,
          ownProps
        );

        const boundSources = pipe(
          toPairs,
          bindSourcesToProperty
        )(sourceMapping);

        const mapToProps = map(({ property, value }) => ({
          [property]: value,
        }));

        const moduleProps$: Observable<unknown> = combineLatest(
          boundSources
          // @ts-ignore
        ).pipe(rMap(mapToProps), rMap(mergeAll), shareReplay(1));

        function handleModulePropsChange(nextModuleProps) {
          const shouldUpdate = !propsAreEqual(moduleProps, nextModuleProps);
          if (shouldUpdate) {
            setModuleProps(nextModuleProps);
          }
        }

        const subscription = moduleProps$.subscribe({
          next: handleModulePropsChange,
        });

        return () => subscription.unsubscribe();
      }, [ownProps, moduleProps]);

      if (isNil(moduleProps)) {
        return null;
      }

      return createElement(
        MemoizedComponent,
        Object.assign({}, moduleProps, ownProps, { ref: forwardedConnectRef })
      );
    }

    const displayName = getDisplayName(Component);
    ConnectedComponent.displayName = `Connect(${displayName})`;
    if (Boolean(options.forwardRef)) {
      return forwardRef((props, ref) =>
        createElement(
          ConnectedComponent,
          Object.assign({}, props, {
            forwardedConnectRef: ref,
          })
        )
      );
    }
    return ConnectedComponent;
  };
}

function safelyDeriveSourceMapping(deriveSourceMapping, ownProps = {}) {
  const deriveSourceMappingNotProvided = isNil(deriveSourceMapping);
  if (deriveSourceMappingNotProvided) {
    const mock$ = new BehaviorSubject({});
    return [mock$];
  }
  return deriveSourceMapping(ownProps);
}
function bindSourcesToProperty(sources) {
  return map(
    ([property, source$]) =>
      source$.pipe(
        rMap((value) => ({
          property,
          value,
        }))
      ),
    sources
  );
}
function getDisplayName(Component) {
  return Component.displayName || Component.name || "Component";
}

export { connect };
