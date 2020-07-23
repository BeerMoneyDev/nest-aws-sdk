import { Inject } from '@nestjs/common';
import { AwsService, AwsServiceType } from './types';

export function getAwsServiceToken(
  serviceConstructor: AwsServiceType<AwsService>,
) {
  return `AWS_SERVICE_${serviceConstructor.prototype.constructor.serviceIdentifier}`.toUpperCase();
}

export const InjectAwsService = (
  serviceConstructor: AwsServiceType<AwsService>,
) => {
  return Inject(getAwsServiceToken(serviceConstructor));
};
