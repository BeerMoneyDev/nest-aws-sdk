import { Hash } from '@smithy/hash-node';

import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';
import { createAwsServiceProvider } from './aws-service-provider.factory';
import { AwsServiceFactory } from './aws-service.factory';
import { ServiceConfigurationOptions } from '..';

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
    const options: ServiceConfigurationOptions = { md5: Hash };

    const createSpy = jest.spyOn(awsServiceFactory, 'create');

    const provider = createAwsServiceProvider(FakeAwsService);
    provider.useFactory(awsServiceFactory, options);

    expect(createSpy).toHaveBeenCalledWith(FakeAwsService, { md5: Hash });
  });

  it('should allow for an overriding config value', () => {
    const awsServiceFactory = new AwsServiceFactory();
    const options: ServiceConfigurationOptions = { md5: Hash };

    const createSpy = jest.spyOn(awsServiceFactory, 'create');

    const provider = createAwsServiceProvider({
      service: FakeAwsService,
      serviceOptions: {},
    });
    provider.useFactory(awsServiceFactory, options);

    expect(createSpy).toHaveBeenCalledWith(FakeAwsService, {});
  });

  it('should allow for an overriding config function', () => {
    const awsServiceFactory = new AwsServiceFactory();
    const options: ServiceConfigurationOptions = { md5: Hash };

    const createSpy = jest.spyOn(awsServiceFactory, 'create');

    const provider = createAwsServiceProvider({
      service: FakeAwsService,
      serviceOptions: () => ({}),
    });
    provider.useFactory(awsServiceFactory, options);

    expect(createSpy).toHaveBeenCalledWith(FakeAwsService, {});
  });

  it('should setup the expected injects', () => {
    const provider = createAwsServiceProvider(FakeAwsService);
    expect(provider.inject.length).toBe(2);
    expect(provider.inject[0]).toBe(AwsServiceFactory);
    expect(provider.inject[1]).toBe(
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
    );
  });
});
