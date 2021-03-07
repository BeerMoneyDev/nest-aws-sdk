import { AwsService, AwsServiceType } from './types';

export const AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN =
  'AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY';

export function getAwsServiceToken(
  serviceConstructor: AwsServiceType<AwsService>,
): string {
  return `AWS_SERVICE_${serviceConstructor.prototype.constructor.name}`.toUpperCase();
}
