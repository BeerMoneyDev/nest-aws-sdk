import { getAwsServiceToken } from './tokens';
import { S3, CloudFront } from 'aws-sdk';

describe('getAwsServiceToken()', () => {
  it('should create expected token', () => {
    expect(getAwsServiceToken(S3)).toEqual('AWS_SERVICE_S3');
    expect(getAwsServiceToken(CloudFront)).toEqual('AWS_SERVICE_CLOUDFRONT');
  });
});
