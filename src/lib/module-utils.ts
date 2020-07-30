import { Provider, ValueProvider } from '@nestjs/common';
import { AsyncModuleFactoryProvider, AwsServiceConfigurationOptionsFactory, AsyncModuleProvider } from './types';

function isFactoryProvider<T>(provider: AsyncModuleProvider<T>) {
  return provider && Object.keys(provider).includes('useFactory');
}

function isValueProvider<T>(provider: AsyncModuleProvider<T>) {
  return provider && Object.keys(provider).includes('useValue');
}

export function createExportableProvider(
  provide: string,
  asyncModuleProvider?: AsyncModuleProvider<AwsServiceConfigurationOptionsFactory>,
): { provider: Provider<any>; exports: any[]; imports: any[] } {
  if (isFactoryProvider(asyncModuleProvider)) {
    const factoryProvider = asyncModuleProvider as AsyncModuleFactoryProvider<AwsServiceConfigurationOptionsFactory>;

    const provider: Provider<any> = {
      provide,
      useFactory: factoryProvider.useFactory,
      inject: factoryProvider.inject,
    };

    return {
      provider,
      exports: [provide],
      imports: factoryProvider?.imports?.length
        ? [...factoryProvider.imports]
        : [],
    };
  } else if (isValueProvider(asyncModuleProvider)) {
    const valueProvider = asyncModuleProvider as Omit<ValueProvider<AwsServiceConfigurationOptionsFactory>, 'provide'>;

    const provider: Provider<any> = {
      provide,
      useValue: valueProvider.useValue,
    };

    return { provider, exports: [provide], imports: [] };
  }

  return { provider: null, exports: [], imports: [] };
}
