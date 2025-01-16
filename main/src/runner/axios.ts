import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

const instance: AxiosInstance = axios.create({
  baseURL: process.env.RUNNER_URL,
  withCredentials: true,
});

export default instance;