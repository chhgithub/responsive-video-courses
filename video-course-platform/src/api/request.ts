import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ApiResponse } from './types';

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data as ApiResponse;

    // 如果响应的是文件流，直接返回
    if (response.config.responseType === 'blob') {
      return response;
    }

    // 业务成功
    if (res.code === 200 || res.code === 0) {
      return res.data;
    }

    // 业务失败
    ElMessage.error(res.msg || '请求失败');
    return Promise.reject(new Error(res.msg || '请求失败'));
  },
  (error) => {
    console.error('响应错误:', error);

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          ElMessageBox.confirm('登录状态已过期，请重新登录', '提示', {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning',
          }).then(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            window.location.href = '/login';
          });
          break;
        case 403:
          ElMessage.error('没有权限访问');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error(error.response.data?.msg || '请求失败');
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查网络连接');
    } else {
      ElMessage.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

// 封装请求方法
export default {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config);
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config);
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config);
  },

  // 带消息提示的请求方法
  postWithMsg<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      service.post(url, data, config)
        .then((res: T) => {
          ElMessage.success('操作成功');
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  putWithMsg<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      service.put(url, data, config)
        .then((res: T) => {
          ElMessage.success('操作成功');
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  deleteWithMsg<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      service.delete(url, config)
        .then((res: T) => {
          ElMessage.success('删除成功');
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  // 上传文件
  upload<T = any>(url: string, file: File, onProgress?: (percent: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return service.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  // 下载文件
  download(url: string, filename?: string): Promise<void> {
    return service.get(url, {
      responseType: 'blob',
    }).then((data) => {
      const blob = new Blob([data]);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'download';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  },
};

// 导出 axios 实例供高级用法
export { service as axios };
