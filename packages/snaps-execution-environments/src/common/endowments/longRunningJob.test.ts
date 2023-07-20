import longRunningJob, {
  MAX_TIME_WAIT,
  MIN_TIME_WAIT,
  TimerActions,
} from './longRunningJob';

describe('Long-running Job endowment', () => {
  it('has expected properties', () => {
    expect(longRunningJob).toMatchObject({
      names: ['longRunningJob'],
      factory: expect.any(Function),
    });
  });

  it('has expected factory output', () => {
    const mockNotify = jest.fn();
    expect(longRunningJob.factory(mockNotify)).toMatchObject({
      longRunningJob: expect.any(Function),
    });
  });

  it('should properly notify the timer and execute callback', () => {
    const mockNotify = jest.fn();
    let callbackExecuted = false;
    const mockCallback = () => {
      callbackExecuted = true;
    };
    const longRunningJobEndowment =
      longRunningJob.factory(mockNotify).longRunningJob;

    longRunningJobEndowment(mockCallback, { timeWait: 30 });

    expect(callbackExecuted).toBe(true);
    expect(mockNotify).toHaveBeenCalledWith({
      method: 'TimerPauseRequest',
      params: {
        timeWait: 30,
        timerAction: TimerActions.Pause,
      },
    });
    expect(mockNotify).toHaveBeenCalledWith({
      method: 'TimerPauseRequest',
      params: {
        timerAction: TimerActions.Restart,
      },
    });
  });

  it('should throw an error if timeWait is less than specified minimum', () => {
    const mockNotify = jest.fn();
    let callbackExecuted = false;
    const mockCallback = () => {
      callbackExecuted = true;
    };
    const longRunningJobEndowment =
      longRunningJob.factory(mockNotify).longRunningJob;
    const timeWait = MIN_TIME_WAIT - 1;

    expect(() => longRunningJobEndowment(mockCallback, { timeWait })).toThrow(
      `Long running job time can be only between 10 and 3600 seconds. Received: ${timeWait} seconds.`,
    );

    expect(callbackExecuted).toBe(false);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('should throw an error if timeWait is greater than specified maximum', () => {
    const mockNotify = jest.fn();
    let callbackExecuted = false;
    const mockCallback = () => {
      callbackExecuted = true;
    };
    const timeWait = MAX_TIME_WAIT + 1;
    const longRunningJobEndowment =
      longRunningJob.factory(mockNotify).longRunningJob;

    expect(() => longRunningJobEndowment(mockCallback, { timeWait })).toThrow(
      `Long running job time can be only between ${MIN_TIME_WAIT} and ${MAX_TIME_WAIT} seconds. Received: ${timeWait} seconds.`,
    );

    expect(callbackExecuted).toBe(false);
    expect(mockNotify).not.toHaveBeenCalled();
  });

  it('should throw an error if a callback is not proper type', () => {
    const mockNotify = jest.fn();
    const mockCallback = 'wrong-callback';
    const timeWait = MAX_TIME_WAIT;
    const longRunningJobEndowment =
      longRunningJob.factory(mockNotify).longRunningJob;

    // @ts-expect-error It can happen that Snap is passing wrong type for a callback
    expect(() => longRunningJobEndowment(mockCallback, { timeWait })).toThrow(
      `Long running job callback must be a function, but '${typeof mockCallback}' was received instead.`,
    );
    expect(mockNotify).not.toHaveBeenCalled();
  });
});
