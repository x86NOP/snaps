import type { JsonRpcNotification } from '@metamask/utils';

/**
 * Configuration for long-running timer requests.
 */
export type LongRunningJobConfiguration = {
  timeWait: number; // In seconds
};

/**
 * Timer actions used by endowment (internally) to control the timer.
 */
export enum TimerActions {
  Pause = 'pause',
  Restart = 'restart',
}

// TODO: Timer pause time values and range are to be discussed.
export const MIN_TIME_WAIT = 10; // In seconds
export const MAX_TIME_WAIT = 3600; // In seconds

/**
 * Creates a `longRunningJob` function which provides a mechanism for
 * a long-running synchronous work by pausing the termination timers.
 *
 * @param notify - Callback function for publishing notifications for timer actions.
 * @returns An object with the `longRunningJob` function.
 */
const longRunningJob = (
  notify: (requestObject: Omit<JsonRpcNotification, 'jsonrpc'>) => void,
) => {
  const _longRunningJob = (
    callback: () => void,
    configuration: LongRunningJobConfiguration,
  ): void => {
    // Validation
    // Validate callback
    if (typeof callback !== 'function') {
      throw new Error(
        `Long running job callback must be a function, but '${typeof callback}' was received instead.`,
      );
    }
    // Validate pause time request
    if (
      configuration.timeWait < MIN_TIME_WAIT ||
      configuration.timeWait > MAX_TIME_WAIT
    ) {
      throw new Error(
        `Long running job time can be only between ${MIN_TIME_WAIT} and ${MAX_TIME_WAIT} seconds. Received: ${configuration.timeWait} seconds.`,
      );
    }

    // Request time
    notify({
      method: 'TimerPauseRequest',
      params: {
        timerAction: TimerActions.Pause,
        timeWait: configuration.timeWait,
      },
    });

    // Execute synchronous work
    callback();

    // Notify about completion
    notify({
      method: 'TimerPauseRequest',
      params: {
        timerAction: TimerActions.Restart,
      },
    });
  };

  return {
    longRunningJob: harden(_longRunningJob),
  } as const;
};

const endowmentModule = {
  names: ['longRunningJob'] as const,
  factory: longRunningJob,
};

export default endowmentModule;
