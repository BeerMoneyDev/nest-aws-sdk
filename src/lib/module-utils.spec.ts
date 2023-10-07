import { FactoryProvider, ValueProvider } from '@nestjs/common';
import { Hash } from '@smithy/hash-node';

import { AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN } from './tokens';
import { createExportableProvider } from './module-utils';

class FakeModule {}
class FakeService {}

describe('createExportableProvider()', () => {
  it('should return empties when null', () => {
    const { exports, imports, provider } = createExportableProvider(
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
      null,
    );

    expect(provider).toBeNull();
    expect(exports).toBeDefined();
    expect(exports.length).toBe(0);
    expect(Array.isArray(exports)).toBeTruthy();
    expect(imports).toBeDefined();
    expect(imports.length).toBe(0);
    expect(Array.isArray(imports)).toBeTruthy();
  });

  it('should return provider when useValue, but no imports', () => {
    const { exports, imports, provider } = createExportableProvider(
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
      {
        useValue: { md5: Hash },
      },
    );

    expect(provider).toBeDefined();
    expect((provider as FactoryProvider).useFactory).toBeUndefined();
    expect((provider as ValueProvider).useValue).toBeDefined();
    expect((provider as ValueProvider).useValue.md5).toBeTruthy();
    expect(exports).toBeDefined();
    expect(exports.length).toBe(1);
    expect(exports[0]).toBe(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN);
    expect(imports).toBeDefined();
    expect(imports.length).toBe(0);
    expect(Array.isArray(imports)).toBeTruthy();
  });

  it('should return provider when useFactory, but no imports', () => {
    const { exports, imports, provider } = createExportableProvider(
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
      {
        useFactory: () => {
          return { md5: Hash };
        },
      },
    );

    expect(provider).toBeDefined();
    expect((provider as ValueProvider).useValue).toBeUndefined();
    expect((provider as FactoryProvider).useFactory).toBeDefined();
    expect((provider as FactoryProvider).useFactory().md5).toBeTruthy();
    expect(exports).toBeDefined();
    expect(exports.length).toBe(1);
    expect(exports[0]).toBe(AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN);
    expect(imports).toBeDefined();
    expect(imports.length).toBe(0);
    expect(Array.isArray(imports)).toBeTruthy();
  });

  it('should return provider when useFactory, but no imports', () => {
    const { exports, imports, provider } = createExportableProvider(
      AWS_SERVICE_CONFIGURATION_OPTIONS_FACTORY_TOKEN,
      {
        useFactory: () => {
          return { md5: Hash };
        },
        inject: [FakeService],
        imports: [FakeModule],
      },
    );

    expect(provider).toBeDefined();
    expect((provider as ValueProvider).useValue).toBeUndefined();
    expect((provider as FactoryProvider).useFactory).toBeDefined();
    expect((provider as FactoryProvider).useFactory(null).md5).toBeTruthy();
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
