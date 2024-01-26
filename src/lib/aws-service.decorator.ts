import { Inject } from '@nestjs/common';
import { getAwsServiceToken } from './tokens';
import { AwsService, AwsServiceType } from './types';

export const InjectAwsService = (
  serviceConstructor: AwsServiceType<AwsService>,
): PropertyDecorator & ParameterDecorator => {
  return Inject(getAwsServiceToken(serviceConstructor));
};
