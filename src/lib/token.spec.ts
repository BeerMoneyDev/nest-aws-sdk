import { CloudFrontClient } from '@aws-sdk/client-cloudfront';
import { S3Client } from '@aws-sdk/client-s3';

import { getAwsServiceToken } from './tokens';

describe('getAwsServiceToken()', () => {
  it('should create expected token', () => {
    expect(getAwsServiceToken(S3Client)).toEqual('AWS_SERVICE_S3CLIENT');
    expect(getAwsServiceToken(CloudFrontClient)).toEqual(
      'AWS_SERVICE_CLOUDFRONTCLIENT',
    );
  });
});
