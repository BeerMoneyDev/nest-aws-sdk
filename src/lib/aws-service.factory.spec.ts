import { Test, TestingModule } from '@nestjs/testing';
import { AwsServiceFactory } from './aws-service.factory';
import { ServiceConfigurationOptions } from 'aws-sdk/lib/service';
import { SharedIniFileCredentials } from 'aws-sdk';

class FakeAwsService {
  constructor(readonly options: ServiceConfigurationOptions) {}
}

describe('AwsServiceFactory', () => {
  let service: AwsServiceFactory;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AwsServiceFactory],
    }).compile();

    service = module.get<AwsServiceFactory>(AwsServiceFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('constructor', () => {
    it('should create a new instance of the class with the options passed in', () => {
      const awsService = service.create(FakeAwsService, {
        credentials: new SharedIniFileCredentials({
          profile: 'personal',
        }),
      });

      expect(awsService).toBeDefined();
      expect(awsService.constructor.name).toBe('FakeAwsService');
      expect((awsService.options.credentials as any).profile).toBe('personal');
    });
  });
  it('should create a new instance of the class with no options passed in', () => {
    const awsService = service.create(FakeAwsService);

    expect(awsService).toBeDefined();
    expect(awsService.constructor.name).toBe('FakeAwsService');
    expect(awsService.options.credentials).toBeFalsy();
  });
});
