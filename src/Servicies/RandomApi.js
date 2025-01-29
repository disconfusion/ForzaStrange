import axios from "axios";

export async function RandomApi(min = 0, max = 1000, count = 1) {
  const res = await axios.get(
    `/api/api/v1.0/random?min=${min}&max=${max}&count=${count}`
  );
  return res.data;
}
