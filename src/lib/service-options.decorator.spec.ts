import { InjectAwsDefaultOptions } from './service-options.decorator';

describe('InjectAwsDefaultOptions', () => {
  it('should wrap the @Inject decorator with the token passed in', () => {
    const result = InjectAwsDefaultOptions();
    expect(result.name).toBeDefined();
  });
});
