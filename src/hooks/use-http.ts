import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useDispatch } from "react-redux";

import axios from "@/lib/axios";
import { HttpRequestConfigProps } from "@/types/global";
import { tokenActions } from "@/store/token/token-slice";

export const useHttp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const dispatch = useDispatch();

  const sendHttpRequest = useCallback(
    async <T>({ successRes, requestConfig }: HttpRequestConfigProps<T>) => {
      setError(null);

      const {
        isAuth = false,
        token,
        userType = "user",
        skipAuthRedirect = false, // ✅ HERE
      } = requestConfig;

      /* ============================
         AUTH GUARD
      ============================ */
      if (isAuth && !token) {
        dispatch(tokenActions.deleteToken());
        toast.error("Please login!");

        router.replace(userType === "admin" ? "/auth/admin/login" : "/login");
        return;
      }

      setLoading(true);

      try {
        const isFormData = requestConfig.body instanceof FormData;

        const config = {
          url: requestConfig.url,
          method: requestConfig.method,
          headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          ...(requestConfig.params && { params: requestConfig.params }),
          ...(requestConfig.body && { data: requestConfig.body }),
        };

        const res = await axios.request<T>(config);

        if (requestConfig.successMessage) {
          toast.success(requestConfig.successMessage);
        }

        successRes(res.data);
      } catch (error: any) {
        let errorMessage = "Something went wrong. Please try again.";

        if (error.code === "ERR_NETWORK") {
          errorMessage =
            "Network error. Please check your internet connection.";
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        setError(errorMessage);
        toast.error(errorMessage);

      } finally {
        setLoading(false);
      }
    },
    [router, dispatch]
  );

  return {
    loading,
    sendHttpRequest,
    error,
    setError,
  };
};
