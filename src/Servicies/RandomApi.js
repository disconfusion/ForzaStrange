import axios from "axios";

/**
 * @param {number} min - min number that could be extracted; Default = 0
 * @param {number} max - (max - 1) number that could be extracted; Default = 1000
 * @param {number} count - How many numbers to extract; Default = 1
 * @returns {Promise<number[]>}
 * @description This function is used for getting random numbers
 */
export async function RandomApi(min = 0, max = 1000, count = 1) {
  const res = await axios.get(
    `/api/api/v1.0/random?min=${min}&max=${max}&count=${count}`
  );
  return res.data;
}
