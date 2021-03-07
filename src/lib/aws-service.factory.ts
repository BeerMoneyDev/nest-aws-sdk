import { Injectable } from '@nestjs/common';
import { AwsServiceInputConfig, AwsServiceType } from './types';

@Injectable()
export class AwsServiceFactory {
  create<AwsService>(
    serviceConstructor: AwsServiceType<AwsService>,
    serviceOptions?: AwsServiceInputConfig,
  ): AwsService {
    return new serviceConstructor({
      ...(serviceOptions ?? {}),
    });
  }
}
