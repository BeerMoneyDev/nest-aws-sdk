import { Injectable } from '@nestjs/common';

import { AwsServiceType, ServiceConfigurationOptions } from './types';

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
