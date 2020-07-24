import { Injectable } from '@nestjs/common';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { AwsServiceType } from './types';

@Injectable()
export class AwsServiceFactory {
  create<AwsService>(
    serviceConstructor: AwsServiceType<AwsService>,
    serviceOptions?: ServiceConfigurationOptions,
  ) {
    return new serviceConstructor({
      ...(serviceOptions ?? {}),
    });
  }
}
