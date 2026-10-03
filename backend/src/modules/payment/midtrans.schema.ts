import { z } from 'zod';

export const midtransChargeSchema = z.object({
  bookingId: z.string().cuid('ID pesanan tidak valid.'),
});

export const midtransWebhookSchema = z.object({
  order_id: z.string({ required_error: 'order_id wajib disertakan.' }),
  status_code: z.string({ required_error: 'status_code wajib disertakan.' }),
  gross_amount: z.string({ required_error: 'gross_amount wajib disertakan.' }),
  signature_key: z.string({ required_error: 'signature_key wajib disertakan.' }),
  transaction_status: z.string({ required_error: 'transaction_status wajib disertakan.' }),
  fraud_status: z.string().optional(),
  transaction_id: z.string().optional(),
});

export type MidtransChargeInput = z.infer<typeof midtransChargeSchema>;
export type MidtransWebhookPayload = z.infer<typeof midtransWebhookSchema>;
