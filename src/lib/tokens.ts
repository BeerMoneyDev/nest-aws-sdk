import { AwsServiceType, AwsService } from './types';

export const AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN =
  'AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY';

export function getAwsServiceToken(
  serviceConstructor: AwsServiceType<AwsService>,
) {
  return `AWS_SERVICE_${serviceConstructor.name}`.toUpperCase();
}
