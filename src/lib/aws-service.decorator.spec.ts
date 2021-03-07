import { InjectAwsService } from './aws-service.decorator';
import { AwsServiceInputConfig } from './types';

class FakeAwsService {
  constructor(readonly options: AwsServiceInputConfig) {
  }
}

describe('InjectAwsService', () => {
  it('should wrap the @Inject decorator with the token passed in', () => {
    const result = InjectAwsService(FakeAwsService);
    expect(result.name).toBeDefined();
  });
});
