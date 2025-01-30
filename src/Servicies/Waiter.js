/**
 * @param {Function} functionName - Function has to be called
 * @param {Array} args - function's arguments
 * @returns {Promise}
 * @description This function is used for breaking the asyncronous functions chain
 */
export function Waiter(functionName, ...args) {
  return new Promise((resolve) => {
    resolve(functionName(...args));
  });
}
