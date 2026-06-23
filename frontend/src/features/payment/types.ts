export type PaymentMethod = 'card' | 'paypal' | 'apple';

export type Payment = {
  id: number;
  booking_id: number;
  amount: string | number;
  status: 'pending' | 'success' | 'failed';
  payment_method: string;
  transaction_id: string;
  created_at: string;
};
