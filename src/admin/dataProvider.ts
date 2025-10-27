import { fetchUtils } from "react-admin";
import type { DataProvider } from "react-admin";

const API_URL = "/api";

// 添加 token 到请求头
const httpClient = (url: string, options: any = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }

  const token = localStorage.getItem("token");
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  return fetchUtils.fetchJson(url, options);
};

// 自定义 dataProvider
const dataProvider: DataProvider = {
  // 获取列表
  getList: async (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = "id", order = "ASC" } = params.sort || {};

    const query = {
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _end: page * perPage,
    };

    const url = `${API_URL}/${resource}?${new URLSearchParams(query as any)}`;

    const { json, headers } = await httpClient(url);

    // 从 Content-Range 头获取总数
    const contentRange = headers.get("content-range");
    const total = contentRange ? parseInt(contentRange.split("/").pop() || "0", 10) : json.length;

    return {
      data: json,
      total,
    };
  },

  // 获取单个
  getOne: async (resource, params) => {
    const url = `${API_URL}/${resource}?id=${params.id}`;
    const { json } = await httpClient(url);

    return {
      data: json,
    };
  },

  // 获取多个
  getMany: async (resource, params) => {
    const query = {
      id: params.ids,
    };

    const url = `${API_URL}/${resource}?${new URLSearchParams(query as any)}`;
    const { json } = await httpClient(url);

    return { data: json };
  },

  // 获取多个引用
  getManyReference: async (resource, params) => {
    const { page = 1, perPage = 10 } = params.pagination || {};
    const { field = "id", order = "ASC" } = params.sort || {};

    const query = {
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _end: page * perPage,
      [params.target]: params.id,
    };

    const url = `${API_URL}/${resource}?${new URLSearchParams(query as any)}`;
    const { json, headers } = await httpClient(url);

    const contentRange = headers.get("content-range");
    const total = contentRange ? parseInt(contentRange.split("/").pop() || "0", 10) : json.length;

    return {
      data: json,
      total,
    };
  },

  // 创建
  create: async (resource, params) => {
    const { json } = await httpClient(`${API_URL}/${resource}`, {
      method: "POST",
      body: JSON.stringify(params.data),
    });

    return {
      data: json,
    };
  },

  // 更新
  update: async (resource, params) => {
    const url = `${API_URL}/${resource}?id=${params.id}`;
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });

    return { data: json };
  },

  // 更新多个
  updateMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resource}?id=${id}`, {
          method: "PUT",
          body: JSON.stringify(params.data),
        })
      )
    );

    return { data: responses.map(({ json }) => json.id) };
  },

  // 删除
  delete: async (resource, params) => {
    const url = `${API_URL}/${resource}?id=${params.id}`;
    const { json } = await httpClient(url, {
      method: "DELETE",
    });

    return { data: json };
  },

  // 删除多个
  deleteMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        httpClient(`${API_URL}/${resource}?id=${id}`, {
          method: "DELETE",
        })
      )
    );

    return { data: responses.map(({ json }) => json.id) };
  },
};

export default dataProvider;
