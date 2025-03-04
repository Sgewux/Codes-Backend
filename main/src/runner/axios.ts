import axios, { AxiosInstance } from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Axios instance for making HTTP requests.
 * - Base URL is set from the `RUNNER_URL` environment variable.
 * - Includes credentials in requests.
 */
const instance: AxiosInstance = axios.create({
  baseURL: process.env.RUNNER_URL,
  withCredentials: true,
});

export default instance;
