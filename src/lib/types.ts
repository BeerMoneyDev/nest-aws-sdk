import {
  AbortSignal,
  Credentials,
  Endpoint,
  Provider,
  RequestHandler,
  RequestSigner,
  RetryStrategy,
  UserAgent,
} from '@aws-sdk/types';
import { DynamicModule, FactoryProvider, ValueProvider } from '@nestjs/common';

export interface AwsServiceInputConfig {
  readonly apiVersion?: string;
  region?: string | Provider<string>;
  endpoint?: string | Endpoint | Provider<Endpoint>;
  tls?: boolean;
  maxAttempts?: number | Provider<number>;
  retryStrategy?: RetryStrategy;
  credentials?: Credentials | Provider<Credentials>;
  signer?: RequestSigner | Provider<RequestSigner>;
  signingEscapePath?: boolean;
  systemClockOffset?: number;
  signingRegion?: string;
  customUserAgent?: string | UserAgent;
  requestHandler?: RequestHandler<any, any, {
    abortSignal?: AbortSignal
  }>;
}

export interface AsyncModuleFactoryProvider<T>
  extends Omit<FactoryProvider<T>, 'provide'>,
    Pick<DynamicModule, 'imports'> {
}

export type AsyncModuleValueProvider<T> = Omit<ValueProvider<T>, 'provide'>

export type AsyncModuleProvider<T> =
  | AsyncModuleFactoryProvider<T>
  | AsyncModuleValueProvider<T>;

export interface AwsServiceType<AwsService> {
  new(options: AwsServiceInputConfig): AwsService;
}

export type AwsService = any;

export type AwsServiceWithServiceOptions = {
  service: AwsServiceType<AwsService>;
  serviceOptions: AwsServiceConfigurationOptionsFactory;
};

export type AwsServiceConfigurationOptionsFactory =
  | Partial<AwsServiceInputConfig>
  | (() => Partial<AwsServiceInputConfig>);
