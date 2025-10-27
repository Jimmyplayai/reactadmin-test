import type { AuthProvider } from "react-admin";

const API_URL = "/api"; // 开发环境会通过 Vite 代理转发到本地 API

const authProvider: AuthProvider = {
  // 登录
  login: async ({ username, password }: { username: string; password: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "登录失败");
      }

      const data = await response.json();

      // 存储 token 和用户信息
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error);
    }
  },

  // 登出
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve();
  },

  // 检查认证状态
  checkAuth: () => {
    return localStorage.getItem("token")
      ? Promise.resolve()
      : Promise.reject();
  },

  // 检查错误（如 401 未授权）
  checkError: (error: any) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // 获取用户身份信息
  getIdentity: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      return Promise.reject();
    }

    const user = JSON.parse(userStr);
    return Promise.resolve({
      id: user.id,
      fullName: user.name,
      avatar: undefined,
    });
  },

  // 获取权限（可选）
  getPermissions: () => {
    return Promise.resolve();
  },
};

export default authProvider;
