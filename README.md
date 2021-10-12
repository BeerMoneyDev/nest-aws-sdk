<h1 align="center">nest-aws-sdk</h1>
<div align="center">
  <img src="https://beermoneydev-assets.s3.amazonaws.com/nest-aws-sdk-logo.png" />
</div>
<br />
<div align="center">
  <strong>A thin wrapping layer around the <a href="https://github.com/aws/aws-sdk-js" target="_blank">aws-sdk</a> package for clean <a href="https://github.com/nestjs">NestJS</a> dependency injection.</strong>
</div>
<br />
<div align="center">
<a href="https://www.npmjs.com/package/nest-aws-sdk"><img src="https://img.shields.io/npm/v/nest-aws-sdk.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/nest-aws-sdk"><img src="https://img.shields.io/npm/l/nest-aws-sdk.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/nest-aws-sdk"><img src="https://img.shields.io/npm/dm/nest-aws-sdk.svg" alt="NPM Downloads" /></a>
</div>

# Features

* Decorator for injecting AWS services.
* An AWS service factory for on-the-fly AWS client creation.
* A simple dependency injection model with AwsSdkModule.forRootAsync() and AwsSdkModule.forFeature().
* Helper test tools for creating mocked AWS clients.

# How To Use

## Install

```bash
npm install --save nest-aws-sdk aws-sdk
```

## Basic Usage - Root-level feature registration

Below is an example of injecting the AwsSdkModule at the global root level. This also demonstrates some of the testing tools provided to make mocking and spying on AWS clients easier.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { SharedIniFileCredentials, S3 } from 'aws-sdk';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

@Module({
  imports: [
    S3ManagerModule,
    AwsSdkModule.forRoot({
      defaultServiceOptions: {
        region: 'us-east-1',
        credentials: new SharedIniFileCredentials({
          profile: 'my-profile',
        }),
      },
      services: [S3],
    }),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
```

```ts
// s3-manager.module.ts
import { Module } from '@nestjs/common';
import { S3ManagerService } from './s3-manager.service';

@Module({
  imports: [],
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
import { createAwsServiceMock, createAwsServicePromisableSpy, getAwsServiceMock } from 'nest-aws-sdk/dist/testing';
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

## Basic Usage - Module-level feature registration

Below is an example of injecting the AwsSdkModule global providers at the root-level and the client feature registration at the feature-submodule.

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
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useValue: {
          region: 'us-east-1',
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
import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3 } from 'aws-sdk';
import { S3ManagerService } from './s3-manager.service';

@Module({
  imports: [AwsSdkModule.forFeatures([S3])],
  providers: [S3ManagerService],
  exports: [S3ManagerService],
})
class S3ManagerModule {}
```

## AwsSdkModule.forRoot()

`AwsSdkModule.forRoot()` is the simplest form of registration and uses statically assigned `options` values.

### options

#### defaultServiceOptions?: Partial<ServiceConfigurationOptions> | (() => Partial<ServiceConfigurationOptions>);

`defaultServiceOptions` is an optional object or object-returning method to get the aws-sdk `ServiceConfigurationOptions` object. This includes the `region`, `credentials`, and other client-level configuration.

#### services?: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>,

`services` can optionally be registered at the root level by passing an array of aws-sdk types, i.e. `S3`, or a `AwsServiceWithServiceOptions` object. These are interchangable and can be used as such:

```ts
import { AwsSdkModule } from 'nest-aws-sdk';
import { CloudFront, S3, SharedIniFileCredentials } from 'aws-sdk';

@Module({
  imports: [
    AwsSdkModule.forRoot({
      services: [
        S3,
        {
          service: CloudFront,
          serviceOptions: {
            credentials: new SharedIniFileCredentials({
              profile: 'aws-nest-sdk',
            }),
          }
        }
      ],
    }),
  ],
})
class AppRootModule {}
```

**Note: the supplied values in serviceOptions will override the values supplied in the defaultServiceOptions object.**

## forRootAsync

`AwsSdkModule.forRootAsync()` is an injectable form of the `AwsSdkModule.forRoot()` import and currently supports two types of instantiation: 'useFactory' and 'useValue'. Support for ClassProvider and ExistingProvider coming soon.

### No parameters

`AwsSdkModule.forRootAsync()` can be called with no provided parameters. This will allow the AWS clients to be created without any provided credential context, which is not uncommon when running in an AWS environment.

```ts
// app.module.ts
import { Module } from '@nestjs/common';
import { AwsSdkModule } from 'nest-aws-sdk';
import { S3ManagerModule } from './s3-manager/s3-manager.module';

@Module({
  imports: [
    S3ManagerModule,
    AwsSdkModule.forRootAsync(),
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
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useValue: {
          region: 'us-east-1',
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
    AwsSdkModule.forRootAsync({
      defaultServiceOptions: {
        useFactory: (cs: ConfigService) => {
          return {
            region: 'us-east-1',
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

## AwsSdkModule.forFeatures()

`AwsSdkModule.forFeatures()` creates the providers for the AWS clients you wish to use at a module-specific level. 

**Note: forFeatures cannot be used in combination with root-level service registrations.**

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
  const listSpy: jest.SpyInstance = createAwsServicePromisableSpy(
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

* Author - [Kerry Ritter](https://twitter.com/kerryritter) and BeerMoneyDev

## License

nest-aws-sdk is MIT licensed.

## Contributing

Nest-AWS-SDK is released through [semantic-release](https://github.com/semantic-release/semantic-release). Effectively this means that versioning is based off commit messages. Please review [angular-changelog-convention](https://github.com/conventional-changelog-archived-repos/conventional-changelog-angular/blob/master/convention.md) and commit under that format. Otherwise semantic-release won't pick up commits for versioning this library.
