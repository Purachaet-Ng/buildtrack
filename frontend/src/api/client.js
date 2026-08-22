/**
 * The single axios instance every *.api.js file imports.
 *
 * Sprint 2 fills this in:
 *   - baseURL from import.meta.env.VITE_API_URL  (http://localhost:8000/api/v1)
 *   - request interceptor attaching `Authorization: Bearer <token>` from the
 *     auth store
 *   - response interceptor: on 401 clear the auth store and redirect to /login;
 *     on 403 let the caller handle it (the 403 page or an inline message) —
 *     do NOT log the user out, a 403 means "wrong role", not "bad token"
 *   - unwrap the error envelope { status, message, errors } from
 *     backend/src/middlewares/errorHandler.js into a usable Error
 */
import { useAuthStore } from "@/store/auth.store";
import { create } from "axios";

export const api = create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Flatten the backend envelope into a plain Error so callers can read
 * `error.message` instead of digging through `error.response.data`. Validation
 * details stay on `error.errors` for forms that map them to fields.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // A 401 from /auth/* is a failed login, not an expired session — clearing
    // the store there would be a no-op at best. Everywhere else, clearing the
    // token IS the redirect: routes/index.jsx swaps to the guest router, whose
    // catch-all sends whatever protected URL the user was on to the login page.
    // (Without that catch-all redirect the router swaps but the URL does not,
    // so an expired session used to land on a 404.)
    const isAuthRequest = error.config?.url?.startsWith("/auth/");
    if (status === 401 && !isAuthRequest) {
      useAuthStore.getState().logout();
    }

    const apiError = new Error(
      data?.message ??
        (error.response
          ? "Something went wrong. Please try again."
          : "Cannot reach the server. Please try again."),
    );
    apiError.status = status;
    apiError.errors = data?.errors ?? [];
    return Promise.reject(apiError);
  },
);

export default api;
