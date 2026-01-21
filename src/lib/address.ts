import api from './api';

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street_address: string;
  building: string | null;
  apartment: string | null;
  city: string;
  emirate: string;
  service_area_id?: string | null;
  service_area?: {
    id: string;
    slug: string;
    name: string;
  } | null;
  latitude: number | null;
  longitude: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  label: string;
  street_address: string;
  building?: string;
  apartment?: string;
  city: string;
  emirate?: string;
  service_area_id?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_primary?: boolean;
}

export interface AddressListResponse {
  status: string;
  data: Address[];
}

export interface AddressResponse {
  status: string;
  message?: string;
  data: Address;
}

export interface AddressDeleteResponse {
  status: string;
  message: string;
}

export async function getAddresses(): Promise<AddressListResponse> {
  const response = await api.get('/customer/addresses');
  return response.data;
}

export async function getAddress(id: string): Promise<AddressResponse> {
  const response = await api.get(`/customer/addresses/${id}`);
  return response.data;
}

export async function createAddress(data: AddressFormData): Promise<AddressResponse> {
  const response = await api.post('/customer/addresses', data);
  return response.data;
}

export async function updateAddress(id: string, data: Partial<AddressFormData>): Promise<AddressResponse> {
  const response = await api.put(`/customer/addresses/${id}`, data);
  return response.data;
}

export async function deleteAddress(id: string): Promise<AddressDeleteResponse> {
  const response = await api.delete(`/customer/addresses/${id}`);
  return response.data;
}

export async function setAddressPrimary(id: string): Promise<AddressResponse> {
  const response = await api.post(`/customer/addresses/${id}/primary`);
  return response.data;
}
