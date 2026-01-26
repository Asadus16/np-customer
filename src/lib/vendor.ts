import api, { ApiResponse } from './api';

export interface AvailableTimeSlot {
  time: string;
  available_technicians: Array<{
    id: string;
    name: string;
  }>;
  available_count: number;
}

export interface AvailableTimeSlotsResponse {
  data: AvailableTimeSlot[];
}

/**
 * Get available time slots for a vendor on a specific date
 */
export async function getAvailableTimeSlots(
  vendorId: string,
  date: string,
  serviceDuration: number
): Promise<AvailableTimeSlotsResponse> {
  const response = await api.get<ApiResponse<AvailableTimeSlot[]>>(
    `/customer/vendors/${vendorId}/available-time-slots`,
    {
      params: {
        date,
        service_duration: serviceDuration,
      },
    }
  );
  return {
    data: response.data.data,
  };
}
