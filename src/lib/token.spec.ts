import { CloudFront } from '@aws-sdk/client-cloudfront';
import { S3 } from '@aws-sdk/client-s3';
import { getAwsServiceToken } from './tokens';

describe('getAwsServiceToken()', () => {
  it('should create expected token', () => {
    expect(getAwsServiceToken(S3)).toEqual('AWS_SERVICE_S3');
    expect(getAwsServiceToken(CloudFront)).toEqual('AWS_SERVICE_CLOUDFRONT');
  });
});
