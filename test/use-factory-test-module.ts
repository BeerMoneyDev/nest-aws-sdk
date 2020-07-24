import { Injectable, Module } from '@nestjs/common';
import {
  InjectAwsService,
  AwsSdkModule,
  InjectAwsDefaultOptions,
  AwsServiceFactory,
} from '../src';
import { S3, SharedIniFileCredentials } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

@Injectable()
export class AppFactoryTestService {
  constructor(
    @InjectAwsService(S3) readonly s3: S3,
    @InjectAwsDefaultOptions() readonly options: ServiceConfigurationOptions,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Injectable()
class ConfigService {
  getProfile() {
    return new SharedIniFileCredentials({
      profile: 'kerryritter',
    });
  }
}

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  providers: [AppFactoryTestService],
  exports: [AppFactoryTestService],
})
class AppSubModule {}

@Module({
  imports: [
    AppSubModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        useFactory: (cs: ConfigService) => {
          return {
            credentials: cs.getProfile(),
          };
        },
        imports: [ConfigModule],
        inject: [ConfigService],
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class AppFactoryProviderWithSubModule {}

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        useFactory: (cs: ConfigService) => {
          return {
            credentials: cs.getProfile(),
          };
        },
        imports: [ConfigModule],
        inject: [ConfigService],
      },
    }),
    AwsSdkModule.forFeatures([S3]),
  ],
  providers: [AppFactoryTestService],
  exports: [],
})
export class AppFactoryProviderModule {}
