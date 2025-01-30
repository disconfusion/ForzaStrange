/**
 * @param {number} milliseconds - Milliseconds that have to be waited
 * @returns {Promise}
 * @description This function is used for simulating the thinking time
 */
export function sleepAsync(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
