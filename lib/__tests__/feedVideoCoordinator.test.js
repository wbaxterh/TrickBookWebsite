const { createFeedVideoCoordinator } = require('../feedVideoCoordinator');

describe('single feed loader coordinator', () => {
  let coordinator;
  let a;
  let b;
  beforeEach(() => {
    coordinator = createFeedVideoCoordinator();
    a = jest.fn();
    b = jest.fn();
    coordinator.register('a', a);
    coordinator.register('b', b);
  });
  it('loads only the most visible eligible card and deactivates before handoff', () => {
    const calls = [];
    coordinator.register('a', (active) => calls.push(['a', active]));
    coordinator.register('b', (active) => calls.push(['b', active]));
    coordinator.update('a', 0.6, true);
    coordinator.update('b', 0.8, true);
    expect(calls).toEqual([
      ['a', true],
      ['a', false],
      ['b', true],
    ]);
  });
  it('does not load distant entries', () => {
    coordinator.update('a', 0, true);
    expect(a).not.toHaveBeenCalled();
  });
  it('requires explicit play when data saving disables automatic loading', () => {
    coordinator.update('a', 0.8, false);
    expect(a).not.toHaveBeenCalled();
    coordinator.activate('a');
    expect(a).toHaveBeenLastCalledWith(true);
    coordinator.update('a', 0, false);
    expect(a).toHaveBeenLastCalledWith(false);
  });
  it('keeps an explicit choice until it leaves view', () => {
    coordinator.update('a', 0.2, true);
    coordinator.activate('a');
    coordinator.update('b', 1, true);
    expect(b).not.toHaveBeenCalled();
    coordinator.update('a', 0, true);
    expect(a).toHaveBeenLastCalledWith(false);
    expect(b).toHaveBeenLastCalledWith(true);
  });
  it('releases all loading in a hidden document and restores one on return', () => {
    coordinator.update('a', 0.8, true);
    coordinator.setVisible(false);
    expect(a).toHaveBeenLastCalledWith(false);
    coordinator.setVisible(true);
    expect(a).toHaveBeenLastCalledWith(true);
  });
  it('drops unmounted cards and ignores late callbacks', () => {
    coordinator.update('a', 0.8, true);
    coordinator.update('b', 0.6, true);
    coordinator.unregister('a');
    expect(b).toHaveBeenLastCalledWith(true);
    coordinator.update('a', 1, true);
    coordinator.activate('a');
    expect(a).toHaveBeenCalledTimes(1);
  });
});
