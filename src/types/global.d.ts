export {};

import { Document } from "mongoose";
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google?: {
      translate: {
        TranslateElement: new (
          options: {
            pageLanguage: string;
            includedLanguages?: string;
          },
          elementId: string
        ) => void;
      };
    };
  }
}

/* ============================
   HTTP TYPES
============================ */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type UserType = "admin" | "user";

export interface HttpRequestConfigType {
  url: string;
  method: HttpMethod;
  body?: any;
  params?: Record<string, any>;
  token?: string;
  isAuth?: boolean;
  userType?: UserType;
  successMessage?: string;
  skipAuthRedirect?: boolean;
}

export interface HttpRequestConfigProps<T = any> {
  requestConfig: HttpRequestConfigType;
  successRes: (data: T) => void;
}

/* ============================
   TOKEN
============================ */

export type TokenSliceParams = {
  token?: string | null;
};


export interface Deposit {

}


export interface AdminDocument extends Document {
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
