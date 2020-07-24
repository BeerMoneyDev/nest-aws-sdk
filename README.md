<h1 align="center">nest-aws-sdk</h1>
<div align="center">
  <img src="" />
</div>
<br />
<div align="center">
  <strong>A thin wrapping layer around the <a href="https://github.com/aws/aws-sdk-js" target="_blank">aws-sdk</a> package for clean <a href="https://github.com/nestjs">NestJS</a> dependency injection.</strong>
</div>

# Features

* Decorator for injecting AWS services.
* An AWS service factory for on-the-fly AWS client creation.
* A simple dependency injection model with AwsSdkModule.forRoot() and AwsSdkModule.forFeature().
* Helper test tools for creating mocked AWS clients.

# How To Use

## Basic Usage

Below is an example of injecting the AwsSdkModule into as root- and feature-level. This also demonstrates some of the testing tools provided to make mocking and spying on AWS clients easier.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { SharedIniFileCredentials } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

@Module({
  imports: [
    S3ManagerModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        useValue: {
          credentials: new SharedIniFileCredentials({
            profile: 'my-profile',
          }),
        }
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
```

```ts
// s3-manager.module.ts
import { Injectable } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  providers: [S3ManagerService],
  exports: [S3ManagerService],
})
class S3ManagerModule {}
```

```ts
// s3-manager.service.ts
import { Injectable } from '@nestjs/common';
import { InjectAwsService } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3ManagerService {
  constructor(
    @InjectAwsService(S3) private readonly s3: S3,
  ) {
  }

  async listBucketContents(bucket: string) {
    const response = await this.s3.listObjectsV2({ Bucket: bucket }).promise();
    return response.Contents.map(c => c.Key);
  }
}
```

```ts
// s3-manager.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { S3 } from 'aws-sdk';
import { createAwsServiceMock, createAwsServicePromisableSpy, getAwsServiceMock } from 'nest-aws-sdk/testing';
import { S3ManagerService } from './s3-manager.service';

describe('S3ManagerService', () => {
  describe('listBucketContents()', () => {
    it('should call the list method and return the Content keys', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          S3ManagerService,
          createAwsServiceMock(S3, {
            useValue: {
              listObjectsV2: () => null,
            }
          }),
        ],
      }).compile();

      const service = module.get(S3ManagerService);
    
      const listSpy = createAwsServicePromisableSpy(
        getAwsServiceMock(module, S3),
        'listObjectsV2',
        'resolve',
        {
          Contents: [ { Key: 'myKey' } ],
        },
      );

      const result = await service.listBucketContents('myBucket');

      expect(result.length).toBe(1);
      expect(result[0]).toBe('myKey');
      expect(listSpy).toHaveBeenCalledTimes(1);
      expect(listSpy).toHaveBeenCalledWith({ Bucket: 'myBucket' });
    });
  })
});
```

## forRoot

`AwsSdkModule.forRoot()` currently supports two types of instantiation: 'useFactory' and 'useValue'. Support for ClassProvider and ExistingProvider coming soon.

### No parameters

`AwsSdkModule.forRoot()` can be called with no provided parameters. This will allow the AWS clients to be created without any provided credential context, which is not uncommon when running in an AWS environment.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

@Module({
  imports: [
    S3ManagerModule,
    AwsSdkModule.forRoot(),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
```

### useValue

useValue is the simplest way to modify the service options of the created clients.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { SharedIniFileCredentials } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

@Module({
  imports: [
    S3ManagerModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        useValue: {
          credentials: new SharedIniFileCredentials({
            profile: 'my-profile',
          }),
        }
      },
    }),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
```



### useFactory

useFactory allows for dynamic modification of the service options. This includes support for `imports` and `inject`.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { ConfigService, ConfigModule } from './config';

@Module({
  imports: [
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        useFactory: (cs: ConfigService) => {
          return {
            credentials: cs.getCredentials(),
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
```

## forFeatures

`AwsSdkModule.forFeatures()` creates the providers for the AWS clients you wish to use. This is not global, so the clients will need to be provided for each module.

### Basic usage

To provide clients to the module context, pass the client constructor symbol to the `AwsSdkModule.forFeatures()` method. Note, it is best to import the client directly from `aws-sdk` instead of from deeper paths - the deeper paths may produce unexpected behaviors. 

```ts
import { Module } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  providers: [],
  exports: [],
})
class AppSubModule {}
```

### Service-Level Customized Service Options

At the `forFeature` level, it is possible to override the provided service options by passing in an object demonstrated below instead of the client type. Provider-style instantation will be provided in the future, but currently only static values are supported.

```ts
import { Module } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { AwsSdkModule } from 'nest-aws-sdk';

@Module({
  imports: [AwsSdkModule.forFeatures([
    {
      service: S3,
      serviceOptions: {
        /* AWS service options */
      },
    }
  ])],
  providers: [],
  exports: [],
})
class AppSubModule {}
```

## AwsServiceFactory

The `AwsServiceFactory` class is exposed to the root- and feature-level. This allows for dynamic creation of AWS clients without feature registration. In addition, the default options are injectable via the `@InjectAwsDefaultOptions()` decorator.

```ts
import { Injectable } from '@nestjs/common';
import { InjectAwsDefaultOptions } from '../src';
import { S3, SharedIniFileCredentials } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';

@Injectable()
export class AppService {
  constructor(
    @InjectAwsDefaultOptions() readonly options: ServiceConfigurationOptions,
    readonly factory: AwsServiceFactory,
  ) {}
}
```

## Testing

For testing AWS clients, we recommend fully replacing the AWS clients as they have side-effects inside of the constructor. To do so, methods are made available to make mocking these clients very simple.

### createAwsServiceMock

This method allows for override an AWS client instantiation. To mock a client, call the `createAwsServiceMock` method with the client constructor and pass a provider object that will be used in its stead.

```ts
const module: TestingModule = await Test.createTestingModule({
  providers: [
    S3ManagerService,
    createAwsServiceMock(S3, {
      useValue: {
        listObjectsV2: () => null,
      }
    }),
  ],
}).compile();
```


### getAwsServiceMock

To retrieve a mock from the test bed via the correct symbol, `getAwsServiceMock` is exported.

```ts
const s3 = getAwsServiceMock(module, S3);
```

### createAwsServicePromisableSpy

It is common to want to use the `.promise()` method returned by most AWS client methods. To make spying on these simpler, the `createAwsServicePromisableSpy` creates a spy and returns a promised value.

```ts
it('should call the list method and return the Content keys', async () => {
  const listSpy = createAwsServicePromisableSpy(
    s3, // the mocked object to spy on
    'listObjectsV2', // the method to spy on
    'resolve', // 'resolve' or 'reject'
    { Contents: [ { Key: 'myKey' } ] }, // the value to resolve or reject
  );

  const result = await service.listBucketContents('myBucket');

  expect(result.length).toBe(1);
  expect(result[0]).toBe('myKey');
  expect(listSpy).toHaveBeenCalledTimes(1);
  expect(listSpy).toHaveBeenCalledWith({ Bucket: 'myBucket' });
});
```

# Stay In Touch

* Author - [Kerry Ritter](https://twitter.com/kerryritter)

## License

nest-aws-sdk is MIT licensed.