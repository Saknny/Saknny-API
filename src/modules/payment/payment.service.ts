import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { PaymentMethodEnum, PaymentStatusEnum } from './enum/payment.enum';
import { CreateCheckoutInput } from './dtos/inputs/create-checkout.input';
import { InjectBaseRepository } from '../../libs/decorators/inject-base-repository.decorator';
import { BaseRepository } from '../../libs/types/base-repository';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  private readonly entityIds = {
    [PaymentMethodEnum.MADA]: '8ac9a4ca939151ce0193d4104546407d',
    [PaymentMethodEnum.VISA]: '8ac9a4ca939151ce0193d40f6fb1406a',
    [PaymentMethodEnum.MASTERCARD]: '8ac9a4ca939151ce0193d40f6fb1406a',
  };
  private readonly authenticationToken =
    'OGFjOWE0Y2E5MzkxNTFjZTAxOTNkNDBlZmQzZDQwNjJ8eGFucSVYSGRidHhENDohQHRIQ2E=';
  private readonly baseUrl = 'https://eu-prod.oppwa.com/v1';
  private readonly iframeBaseUrl =
    'https://eu-prod.oppwa.com/v1/paymentWidgets.js?checkoutId=';

  constructor(
    private readonly httpService: HttpService,
    @InjectBaseRepository(Payment)
    private readonly paymentRepo: BaseRepository<Payment>,
  ) {}

  async getAllPayments() {
    return this.paymentRepo.findAll({}, {}, { createdAt: 'DESC' });
  }

  async createCheckout(input: CreateCheckoutInput) {
    const {
      amount,
      currency,
      customerData,
      paymentMethod,
      merchantTransactionId,
    } = input;

    const entityId = this.entityIds[paymentMethod];

    const url = `${this.baseUrl}/checkouts`;

    const payloadObject = {
      entityId,
      currency,
      paymentType: 'DB',
      merchantTransactionId,
      amount: amount.toFixed(2),
      'customer.email': customerData.email,
      'customer.givenName': customerData.givenName,
      'customer.surname': customerData.surname,
      'billing.street1': customerData.street,
      'billing.city': customerData.city,
      'billing.state': customerData.state,
      'billing.country': customerData.country,
      'billing.postcode': customerData.postcode,
    };

    const payload = new URLSearchParams(payloadObject).toString();

    try {
      const response = await lastValueFrom(
        this.httpService.post(url, payload, { headers: this.getHeaders() }),
      );
      await this.paymentRepo.createOne({
        orderId: merchantTransactionId,
        paymentMethod,
        state: PaymentStatusEnum.PENDING,
        transactionId: response.data.id,
        metadata: payloadObject,
        totalAmount: amount,
      });
      return { status: true, data: response.data };
    } catch (error) {
      return { status: false, message: error.response?.data || error.message };
    }
  }

  async getPaymentStatus(
    checkout: string,
    paymentMethod: PaymentMethodEnum = PaymentMethodEnum.MASTERCARD,
  ): Promise<any> {
    const url = `${this.baseUrl}/checkouts/${checkout}/payment`;

    const queryParamsObject = { entityId: this.entityIds[paymentMethod] };
    const queryParams = new URLSearchParams(queryParamsObject).toString();

    try {
      const response = await lastValueFrom(
        this.httpService.get(`${url}?${queryParams}`, {
          headers: this.getHeaders(),
        }),
      );
      return { status: true, data: response.data };
    } catch (error) {
      return { status: false, message: error.response?.data || error.message };
    }
  }

  async getIframeUrl(checkoutId: string): Promise<string> {
    return `${this.iframeBaseUrl}${checkoutId}`;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${this.authenticationToken}`,
    };
  }
}
