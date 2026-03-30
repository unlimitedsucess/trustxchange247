import Axios from "axios";

const axios = Axios.create({
  // Force relative paths on the client to avoid Vercel alias CORS errors
  baseURL: typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_BACKEND_URL,
  maxBodyLength: Infinity,
  headers: {
    Accept: "application/json",
  },
});

export default axios;