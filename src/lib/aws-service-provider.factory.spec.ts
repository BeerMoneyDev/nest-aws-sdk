import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { createAwsServiceProvider } from './aws-service-provider.factory';
import { AwsServiceFactory } from './aws-service.factory';
import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';

class FakeAwsService {
  constructor(readonly options: ServiceConfigurationOptions) {}
}

describe('createAwsServiceProvider()', () => {
  it('should setup the expected provide', () => {
    const provider = createAwsServiceProvider(FakeAwsService);
    expect(provider.provide.toString().startsWith('AWS_SERVICE_')).toBeTruthy();
  });

  it('should setup the expected factory to use a value', () => {
    const awsServiceFactory = new AwsServiceFactory();
    const options: ServiceConfigurationOptions = { computeChecksums: true };

    const createSpy = spyOn(awsServiceFactory, 'create');

    const provider = createAwsServiceProvider(FakeAwsService);
    provider.useFactory(awsServiceFactory, options);

    expect(createSpy).toHaveBeenCalledWith(FakeAwsService, { computeChecksums: true });
  });

  it('should setup the expected injects', () => {
    const provider = createAwsServiceProvider(FakeAwsService);
    expect(provider.inject.length).toBe(2);
    expect(provider.inject[0]).toBe(AwsServiceFactory);
    expect(provider.inject[1]).toBe(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN);
  });
});