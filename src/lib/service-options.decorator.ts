import { Inject } from '@nestjs/common';

import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';

export const InjectAwsDefaultOptions = () => {
  return Inject(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN);
};
