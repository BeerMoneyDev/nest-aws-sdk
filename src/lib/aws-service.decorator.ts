import { Inject } from '@nestjs/common';
import { AwsService, AwsServiceType } from './types';
import { getAwsServiceToken } from './tokens';

export const InjectAwsService = (
  serviceConstructor: AwsServiceType<AwsService>,
) => {
  return Inject(getAwsServiceToken(serviceConstructor));
};
