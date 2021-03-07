import { fromIni } from '@aws-sdk/credential-provider-ini';
import { Credentials, Provider } from '@aws-sdk/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AwsServiceFactory } from './aws-service.factory';
import { AwsServiceInputConfig } from './types';

class FakeAwsService {
  constructor(readonly options: AwsServiceInputConfig) {
  }
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
    it('should create a new instance of the class with the options passed in', async () => {
      const awsService = service.create(FakeAwsService, {
        credentials: fromIni({
          profile: 'kerryritter',
        }),
      });
      const credentials = await (awsService.options.credentials as Provider<Credentials>)();

      expect(awsService).toBeDefined();
      expect(awsService.constructor.name).toBe('FakeAwsService');
      expect(credentials.accessKeyId).toBeDefined();
    });
  });
  it('should create a new instance of the class with no options passed in', () => {
    const awsService = service.create(FakeAwsService);

    expect(awsService).toBeDefined();
    expect(awsService.constructor.name).toBe('FakeAwsService');
    expect(awsService.options.credentials).toBeFalsy();
  });
});
