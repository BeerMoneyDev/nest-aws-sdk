import { AwsService, AsyncModuleProvider } from '../lib/types';
import { getAwsServiceToken } from '../lib/tokens';
import { Provider } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';

export function createAwsServiceMock(
  service: AwsService,
  provider: AsyncModuleProvider<AwsService>,
): Provider<AwsService> {
  return {
    ...provider,
    provide: getAwsServiceToken(service),
  };
}

export function getAwsServiceMock(module: TestingModule, service: AwsService) {
  return module.get(getAwsServiceToken(service));
}

export function createAwsServicePromisableFunction<T>(
  response: 'reject' | 'resolve',
  result?: T,
) {
  return {
    promise() {
      if (response === 'reject') {
        return Promise.reject(result);
      }
      return Promise.resolve(result);
    },
  };
}

export function createAwsServicePromisableSpy<T, K>(
  object: T,
  method: keyof T,
  response: 'reject' | 'resolve',
  result?: K,
) {
  return jest.spyOn(object, method).mockReturnValue(
    createAwsServicePromisableFunction(response, result),
  );
}
