
# Amazon Connect phone number API demo  

This demo shows how you can leverage [Amazon Connect](https://aws.amazon.com/connect/) api to search user's by different techniques.  

## Usage
Use `sam` to build, invoke and deploy the function.

##### SAM Build:
Ensure you are in the root folder

`sam build --use-container`

##### SAM Deploy:
`sam deploy template.yaml --s3-bucket REPLACE_ME --stack-name REPLACE_ME --parameter-overrides ParameterKey=CFS3BucketForWebSite,ParameterValue=REPLACE_ME ParameterKey=CFSInstanceARNParam,ParameterValue=REPLACE_ME_WITH_FULL_INSTANCE_ARN --capabilities CAPABILITY_IAM`
      
