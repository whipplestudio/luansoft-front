import type { AxiosResponse } from "axios"

export const apiCall = async <T>(\
  axiosInstance: AxiosInstance,
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any,
  params?: any
)
: Promise<T> =>
{
  try {
    const response: AxiosResponse<T> = await axiosInstance({
      method,
      url,
      data,
      params,
    })
    return response.data;
  } catch (error) {
    throw error
  }
}

