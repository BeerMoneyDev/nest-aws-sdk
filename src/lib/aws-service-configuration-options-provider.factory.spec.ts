import { createAwsServiceConfigurationOptionsProvider } from './aws-service-configuration-options-provider.factory';
import { isArray } from 'util';
import { FactoryProvider, ValueProvider } from '@nestjs/common';
import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';

class FakeModule {}
class FakeService {}

describe('createAwsServiceConfigurationOptionsProvider()', () => {
  it('should return empties when null', () => {
    const { exports, imports, provider } = createAwsServiceConfigurationOptionsProvider(null);
    
    expect(provider).toBeNull();
    expect(exports).toBeDefined();
    expect(exports.length).toBe(0);
    expect(isArray(exports)).toBeTruthy();
    expect(imports).toBeDefined();
    expect(imports.length).toBe(0);
    expect(isArray(imports)).toBeTruthy();
  });

  it('should return provider when useValue, but no imports', () => {
    const { exports, imports, provider } = createAwsServiceConfigurationOptionsProvider({
      useValue: { computeChecksums: true },
    });
    
    expect(provider).toBeDefined();
    expect((provider as FactoryProvider).useFactory).toBeUndefined();
    expect((provider as ValueProvider).useValue).toBeDefined();
    expect((provider as ValueProvider).useValue.computeChecksums).toBeTruthy();
    expect(exports).toBeDefined();
    expect(exports.length).toBe(1);
    expect(exports[0]).toBe(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN);
    expect(imports).toBeDefined();
    expect(imports.length).toBe(0);
    expect(isArray(imports)).toBeTruthy();
  });

  it('should return provider when useFactory, but no imports', () => {
    const { exports, imports, provider } = createAwsServiceConfigurationOptionsProvider({
      useFactory: () => {
        return { computeChecksums: true };
      },
    });
    
    expect(provider).toBeDefined();
    expect((provider as ValueProvider).useValue).toBeUndefined();
    expect((provider as FactoryProvider).useFactory).toBeDefined();
    expect((provider as FactoryProvider).useFactory().computeChecksums).toBeTruthy();
    expect(exports).toBeDefined();
    expect(exports.length).toBe(1);
    expect(exports[0]).toBe(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN);
    expect(imports).toBeDefined();
    expect(imports.length).toBe(0);
    expect(isArray(imports)).toBeTruthy();
  });

  it('should return provider when useFactory, but no imports', () => {
    const { exports, imports, provider } = createAwsServiceConfigurationOptionsProvider({
      useFactory: (fs: FakeService) => {
        return { computeChecksums: true };
      },
      inject: [FakeService],
      imports: [FakeModule],
    });
    
    expect(provider).toBeDefined();
    expect((provider as ValueProvider).useValue).toBeUndefined();
    expect((provider as FactoryProvider).useFactory).toBeDefined();
    expect((provider as FactoryProvider).useFactory(null).computeChecksums).toBeTruthy();
    expect((provider as FactoryProvider).inject.length).toBe(1);
    expect((provider as FactoryProvider).inject[0]).toBe(FakeService);
    expect(exports).toBeDefined();
    expect(exports.length).toBe(1);
    expect(exports[0]).toBe(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN);
    expect(imports).toBeDefined();
    expect(imports.length).toBe(1);
    expect(imports[0]).toBe(FakeModule);
  });
});
