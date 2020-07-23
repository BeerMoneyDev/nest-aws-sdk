import { AwsService } from '../lib/types';
import { getAwsServiceToken } from '../lib/aws-service.decorator';

export function createAwsServiceMock(mockOptions: {
  provide: AwsService;
  useValue: any;
}) {
  return {
    provide: getAwsServiceToken(mockOptions.provide),
    useValue: mockOptions.useValue,
  };
}
