import { Injectable, Module, Optional } from '@nestjs/common';
import {
  InjectAwsService,
  AwsSdkModule,
  AwsServiceFactory,
  InjectAwsDefaultOptions,
} from '../src';
import { S3, SharedIniFileCredentials } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

@Injectable()
export class AppValueTestService {
  constructor(
    @InjectAwsService(S3) readonly s3: S3,
    @InjectAwsDefaultOptions() readonly options: ServiceConfigurationOptions,
    readonly factory: AwsServiceFactory,
  ) {}
}

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  providers: [AppValueTestService],
  exports: [AppValueTestService],
})
class AppSubModule {}

@Module({
  imports: [
    AppSubModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        useValue: {
          credentials: new SharedIniFileCredentials({
            profile: 'kerryritter',
          }),
        },
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class AppValueProviderWithSubModule {}

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        useValue: {
          credentials: new SharedIniFileCredentials({
            profile: 'kerryritter',
          }),
        },
      },
    }),
    AwsSdkModule.forFeatures([S3]),
  ],
  providers: [AppValueTestService],
})
export class AppValueProviderModule {}
