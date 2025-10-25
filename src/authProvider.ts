import { AuthProvider } from "react-admin";

// 簡單的認證提供者（演示用）
// 稍後可以替換為真實的 API 認證
const authProvider: AuthProvider = {
  // 登錄
  login: ({ username, password }: { username: string; password: string }) => {
    // 演示用：接受任何用戶名和密碼
    // 實際應用中應該調用後端 API 驗證
    if (username && password) {
      localStorage.setItem("username", username);
      localStorage.setItem("auth", "true");
      return Promise.resolve();
    }
    return Promise.reject(new Error("請輸入用戶名和密碼"));
  },

  // 登出
  logout: () => {
    localStorage.removeItem("username");
    localStorage.removeItem("auth");
    return Promise.resolve();
  },

  // 檢查認證狀態
  checkAuth: () => {
    return localStorage.getItem("auth") === "true"
      ? Promise.resolve()
      : Promise.reject();
  },

  // 檢查錯誤（如 401 未授權）
  checkError: (error) => {
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem("username");
      localStorage.removeItem("auth");
      return Promise.reject();
    }
    return Promise.resolve();
  },

  // 獲取用戶身份信息
  getIdentity: () => {
    const username = localStorage.getItem("username");
    return Promise.resolve({
      id: username,
      fullName: username || "用戶",
    });
  },

  // 獲取權限（可選）
  getPermissions: () => {
    return Promise.resolve();
  },
};

export default authProvider;
