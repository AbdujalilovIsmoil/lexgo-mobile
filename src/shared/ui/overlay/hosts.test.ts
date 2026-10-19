import { ROOT_HOST, topHost, useOverlayHosts } from "./hosts";

describe("overlay hosts", () => {
  beforeEach(() => useOverlayHosts.setState({ stack: [] }));

  it("draws at the root while no surface is open", () => {
    expect(topHost(useOverlayHosts.getState().stack)).toBe(ROOT_HOST);
  });

  it("the last surface opened wins; closing it hands the overlays back", () => {
    const { add, remove } = useOverlayHosts.getState();
    add(1); // a sheet
    add(2); // a child sheet inside it
    expect(topHost(useOverlayHosts.getState().stack)).toBe(2);
    remove(2);
    expect(topHost(useOverlayHosts.getState().stack)).toBe(1);
    remove(1);
    expect(topHost(useOverlayHosts.getState().stack)).toBe(ROOT_HOST);
  });

  it("a parent closing under an open child keeps the child on top; re-adding moves a host to the top", () => {
    const { add, remove } = useOverlayHosts.getState();
    add(1);
    add(2);
    remove(1);
    expect(useOverlayHosts.getState().stack).toEqual([2]);
    add(3);
    add(2);
    expect(useOverlayHosts.getState().stack).toEqual([3, 2]);
  });
});
