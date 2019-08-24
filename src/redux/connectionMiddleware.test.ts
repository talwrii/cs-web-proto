import { ConnectionMiddleware } from "./connectionMiddleware";
import { PvResolver, ResolvedPv } from "./pvResolver";
import { capture, mock, when, anything, instance, verify } from "ts-mockito";
import { Connection } from "../connection/plugin";
import { Store } from "redux";
import { CsState } from "../redux/csState";
import { VALUE_CHANGED } from "./actions";

interface Test {
  a: (name: string) => string;
}

function mockStore() {
  let mockedStore = mock<Store<CsState, any>>();
  let csState: CsState = { valueCache: { DUPLICATE: { value: 7 } } };
  when(mockedStore.getState()).thenReturn(csState);
  return [mockedStore, instance(mockedStore)];
}

it("exercise connection store", (): void => {
  let mockedResolver: PvResolver = mock(PvResolver);
  let mockedConnection: Connection = mock<Connection>();

  when(mockedResolver.unresolve(anything())).thenCall(x => [
    x.resolvedName.toUpperCase()
  ]);

  when(mockedResolver.mapMacro("name", "tim")).thenReturn({
    newResolutions: [new ResolvedPv("new")],
    removedResolutions: [new ResolvedPv("removed")],
    duplicateResolutions: [new ResolvedPv("duplicate")]
  });

  let connection = instance(mockedConnection);
  let resolver = instance(mockedResolver);
  let middleware = new ConnectionMiddleware(connection, resolver);

  let [mockedStore, store] = mockStore();
  middleware.mapMacro(store, "name", "tim");
  verify(mockedConnection.subscribe("new")).once();

  let value = capture(mockedStore.dispatch).last()[0];
  expect(value["type"]).toBe("value_changed");
  expect(value["payload"]["pvName"]).toBe("DUPLICATE");
  expect(value["payload"]["value"]).toBe(7);
});
