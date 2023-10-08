import request from '@/utils/request'
import { allPointResponseData } from './type'
enum API {
  CITY_URL = '/map/aj/getcitycode',
  AREA_URL = '/map/aj/get_area',
  SHOP_URL = '/map/at/shop',
  GEO_URL = '/geo/v3/geocode/geo',
}
export const reqCityData = () => request.get<any, any>(API.CITY_URL)
export const reqAreaData = (citycode: string) =>
  request.get<any, any>(API.AREA_URL + `?citycode=${citycode}`)
export const reqShopsData = (params: any) =>
  request.get<any, any>(
    API.SHOP_URL + `?city_id=${params.city_id}&area_id=${params.area_id}`,
  )
export const reqGeo = (params: any) =>
  request.get<any, any>(
    API.GEO_URL + `?key=${params.key}&address=${params.address}`,
  )
