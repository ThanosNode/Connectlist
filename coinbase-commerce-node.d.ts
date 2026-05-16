declare module 'coinbase-commerce-node' {
  export class Client {
    static init(apiKey: string): void;
  }

  export class Charge {
    static create(data: any): Promise<resources.Charge>;
    static retrieve(id: string): Promise<resources.Charge>;
  }

  export namespace resources {
    export interface Charge {
      id: string;
      name: string;
      description: string;
      pricing_type: string;
      local_price: {
        amount: string;
        currency: string;
      };
      pricing: {
        local: {
          amount: string;
          currency: string;
        };
      };
      payments: any[];
      timeline: any[];
      metadata: Record<string, any>;
      created_at: string;
      expires_at: string;
      hosted_url: string;
      redirect_url: string;
      cancel_url: string;
      addresses: Record<string, string>;
      code: string;
      status: 'NEW' | 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'UNRESOLVED' | 'RESOLVED' | 'CANCELED';
    }

    export interface Event {
      id: string;
      type: string;
      api_version: string;
      created_at: string;
      data: {
        code: string;
        id: string;
        charge?: Charge;
      };
    }

    export namespace Event {
      export function verifyEventBody(
        rawBody: string,
        signature: string,
        webhookSecret: string
      ): Event;
    }
  }
}