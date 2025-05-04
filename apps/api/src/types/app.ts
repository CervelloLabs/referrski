export interface App {
  id: string;
  name: string;
  webhookUrl: string;
  authHeader: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppResponse {
  success: boolean;
  message?: string;
  errors?: {
    field: string;
    message: string;
  }[];
  data?: {
    app: App;
  };
}

export interface AppsResponse {
  success: boolean;
  message?: string;
  data?: {
    apps: App[];
  };
} 