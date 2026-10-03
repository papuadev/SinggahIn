declare module 'midtrans-client' {
  export interface SnapConfig {
    isProduction?: boolean;
    serverKey: string;
    clientKey: string;
  }

  export interface SnapTransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  export interface SnapCustomerDetails {
    first_name?: string;
    email?: string;
    phone?: string;
  }

  export interface SnapParameter {
    transaction_details: SnapTransactionDetails;
    customer_details?: SnapCustomerDetails;
    callbacks?: {
      finish?: string;
    };
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: SnapConfig);
    createTransaction(parameter: SnapParameter): Promise<SnapTransactionResponse>;
    createTransactionToken(parameter: SnapParameter): Promise<string>;
    createTransactionRedirectUrl(parameter: SnapParameter): Promise<string>;
  }

  export class CoreApi {
    constructor(options: SnapConfig);
  }
}
