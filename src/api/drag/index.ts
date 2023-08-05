import request from '@/utils/request'
import { allPointResponseData } from './type'
enum API {
  POINT_URL = '/api/getPointData',
}
export const reqPointData = () =>
  request.get<any, allPointResponseData>(API.POINT_URL)
