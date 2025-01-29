/**
 * @param {Function} functionName - Una funzione generica.
 * @param {Array} args - function arguments
 * @returns {Promise}
 */
export function Waiter(functionName, ...args) {
  return new Promise((resolve) => {
    resolve(functionName(...args));
  });
}
