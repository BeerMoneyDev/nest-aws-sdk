import { Test, TestingModule } from '@nestjs/testing';
import { AwsServiceFactory } from './aws-service.factory';

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
});
