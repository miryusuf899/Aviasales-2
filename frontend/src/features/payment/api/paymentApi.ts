import { apiClient } from '@/shared/api/httpClient';

import type { Payment, PaymentMethod } from '../types';

export const paymentApi = {
  createPayment: async (payload: {
    bookingId: number | string;
    amount: number;
    paymentMethod: PaymentMethod;
  }) => {
    const { data } = await apiClient.post<Payment>(
      '/payments/payments',
      {
        booking_id: Number(payload.bookingId),
        amount: payload.amount,
        payment_method: payload.paymentMethod,
        simulate_success: true,
      },
      {
        headers: {
          'Idempotency-Key': `${payload.bookingId}-${payload.amount}-${payload.paymentMethod}`,
        },
      },
    );
    return data;
  },
};
