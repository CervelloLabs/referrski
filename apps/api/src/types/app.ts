export interface App {
  id: string;
  name: string;
  webhookUrl: string | null;
  authHeader: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  iosAppUrl?: string | null;
  androidAppUrl?: string | null;
}

export interface AppResponse {
  success: boolean;
  message?: string;
  data?: {
    app: App;
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AppsResponse {
  success: boolean;
  message?: string;
  data?: {
    apps: App[];
  };
  errors?: Array<{
    field: string;
    message: string;
  }>;
} 