import { ServiceConfigurationOptions } from '..';
import { InjectAwsService } from './aws-service.decorator';

class FakeAwsService {
  constructor(readonly options: ServiceConfigurationOptions) {}
}

describe('InjectAwsService', () => {
  it('should wrap the @Inject decorator with the token passed in', () => {
    const result = InjectAwsService(FakeAwsService);
    expect(result.name).toBeDefined();
  });
});
