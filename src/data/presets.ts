import { PresetScenario } from '../types/incident';

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 's3-kms-access-denied',
    title: 'Cross-Account S3 & KMS AccessDenied',
    badge: 'Security / IAM',
    awsServices: ['Lambda', 'S3', 'KMS', 'IAM'],
    severity: 'P1 - Critical',
    summary: 'Lambda function throws AccessDenied when reading encrypted S3 objects due to missing KMS Decrypt permission and key policy delegation.',
    sampleLog: `[ERROR] ClientError: An error occurred (AccessDenied) when calling the GetObject operation:
The ciphertext refers to a customer master key that does not exist, does not exist in this account, or you do not have permission to access it.
Traceback (most recent call last):
  File "/var/task/app.py", line 42, in lambda_handler
    response = s3_client.get_object(Bucket="corp-production-vault", Key=f"invoices/{invoice_id}.pdf")
botocore.exceptions.ClientError: An error occurred (AccessDenied) when calling the GetObject operation.
AWS Request ID: e48b1112-9ab1-4231-8977-98bb03da129f
KMS Key ARN: arn:aws:kms:us-east-1:123456789012:key/3fa85f64-5717-4562-b3fc-2c963f66afa6`,
    solution: {
      id: 'sol-s3-kms',
      timestamp: '2026-09-20T10:30:00Z',
      title: 'S3 & Cross-Account KMS Decryption Failure',
      severity: 'P1 - Critical',
      service: 'AWS KMS / Amazon S3',
      rootCause: 'Lambda execution role lacks explicit kms:Decrypt permission for customer-managed key (CMK) arn:aws:kms:us-east-1:123456789012:key/3fa85f64-5717-4562-b3fc-2c963f66afa6, and KMS Key Policy does not grant cross-account access to the caller role.',
      wellArchitectedPillar: 'Security',
      architecturalImpact: 'Production billing pipeline halted. Invoices cannot be processed or served to downstream payment reconciliations.',
      remediationSteps: [
        'Attach least-privilege IAM policy allowing kms:Decrypt and kms:DescribeKey to the Lambda execution role.',
        'Update KMS Key Policy on key 3fa85f64-5717-4562-b3fc-2c963f66afa6 to delegate decryption rights to caller role ARN.',
        'Validate S3 bucket encryption settings and remove conflicting deny conditions in bucket policy.'
      ],
      iamPolicyFix: JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
          {
            "Sid": "AllowLambdaKmsDecryption",
            "Effect": "Allow",
            "Action": [
              "kms:Decrypt",
              "kms:DescribeKey"
            ],
            "Resource": "arn:aws:kms:us-east-1:123456789012:key/3fa85f64-5717-4562-b3fc-2c963f66afa6"
          },
          {
            "Sid": "AllowS3ReadAccess",
            "Effect": "Allow",
            "Action": [
              "s3:GetObject",
              "s3:GetObjectVersion"
            ],
            "Resource": "arn:aws:s3:::corp-production-vault/invoices/*"
          }
        ]
      }, null, 2),
      cliCommands: [
        {
          command: 'aws iam put-role-policy --role-name ProductionInvoiceProcessorRole --policy-name S3KMSDecryptFix --policy-document file://kms-fix-policy.json',
          explanation: 'Attaches least-privilege KMS decrypt and S3 read permissions to the Lambda IAM execution role.',
          rollback: 'aws iam delete-role-policy --role-name ProductionInvoiceProcessorRole --policy-name S3KMSDecryptFix'
        },
        {
          command: 'aws kms get-key-policy --key-id 3fa85f64-5717-4562-b3fc-2c963f66afa6 --policy-name default --output json',
          explanation: 'Verifies the KMS Key Policy allows the caller AWS account principal.',
          rollback: '# Read-only verification command; no rollback required.'
        }
      ],
      blastRadius: {
        nodes: [
          { id: 'client', name: 'External Client', service: 'External Client', status: 'degraded', role: 'external', description: 'Receiving 500 Internal Server Errors on invoice downloads' },
          { id: 'apigw', name: 'API Gateway (REST)', service: 'API Gateway', status: 'degraded', role: 'upstream', description: 'Relaying 502/500 errors from Lambda integration' },
          { id: 'lambda', name: 'InvoiceProcessorFn', service: 'Lambda', status: 'failed', role: 'root-cause', description: 'Execution terminated: ClientError (AccessDenied)' },
          { id: 's3', name: 'corp-production-vault', service: 'S3', status: 'at-risk', role: 'downstream', description: 'Target bucket holding AES-256 KMS encrypted blobs' },
          { id: 'kms', name: 'CMK (3fa85f64...)', service: 'KMS', status: 'at-risk', role: 'downstream', description: 'Customer Managed Key rejecting caller without Decrypt grant' }
        ],
        edges: [
          { from: 'client', to: 'apigw', label: 'GET /invoices/INV-9021' },
          { from: 'apigw', to: 'lambda', label: 'Invoke (Sync)' },
          { from: 'lambda', to: 's3', label: 's3:GetObject', isBroken: true },
          { from: 's3', to: 'kms', label: 'kms:Decrypt', isBroken: true }
        ]
      },
      postmortemMarkdown: `# Incident Postmortem: Cross-Account KMS AccessDenied on S3
**Date**: 2026-09-20
**Severity**: P1 - Critical
**Impact**: Production invoice processing service returned 500 error for 100% of PDF document requests.
**Primary Cause**: Missing kms:Decrypt IAM permission on Lambda role ProductionInvoiceProcessorRole following customer key migration.
**Root Cause Timeline**:
- 11:20 UTC: Deployment of new CMK encryption policy on corp-production-vault.
- 11:21 UTC: Ingestion Lambda begins failing with botocore.exceptions.ClientError: AccessDenied.
- 11:25 UTC: CloudPulse AI detected root cause & generated least-privilege IAM policy.
**Corrective Actions**:
1. Attached least-privilege policy with strict Resource ARN constraint.
2. Configured AWS Config rule kms-cmk-policy-proactive-check.`
    }
  },
  {
    id: 'ecs-fargate-nat-timeout',
    title: 'ECS Fargate CrashLoop & NAT Timeout',
    badge: 'Networking / VPC',
    awsServices: ['ECS', 'VPC', 'CloudWatch'],
    severity: 'P1 - Critical',
    summary: 'ECS Fargate tasks failing to launch due to ECR token retrieval timeout, caused by private subnet missing default route to NAT Gateway.',
    sampleLog: `STOPPED (ResourceInitializationError: unable to pull secrets or registry auth:
execution resource retrieval failed: unable to retrieve ecr auth token:
RequestError: send request failed
caused by: Post "https://api.ecr.us-east-1.amazonaws.com/": dial tcp 54.239.29.176:443: i/o timeout)
Task ARN: arn:aws:ecs:us-east-1:123456789012:task/prod-cluster/99b821ac3d
Subnet ID: subnet-0a12f349b8123 (Private-Subnet-2B)
Security Groups: [sg-0833192aa1bb]
Desired status: RUNNING -> Last status: STOPPED`,
    solution: {
      id: 'sol-ecs-nat',
      timestamp: '2026-09-20T10:35:00Z',
      title: 'ECS Task Inability to Reach ECR over VPC',
      severity: 'P1 - Critical',
      service: 'Amazon ECS / AWS VPC',
      rootCause: 'ECS Fargate task launched in private subnet subnet-0a12f349b8123 which has no route to the Internet via NAT Gateway (0.0.0.0/0 -> nat-xxxx), and the VPC lacks AWS PrivateLink VPC Endpoints for ECR (ecr.api, ecr.dkr, and s3 gateway).',
      wellArchitectedPillar: 'Reliability',
      architecturalImpact: 'New container tasks cannot pull Docker images from Amazon ECR. Auto-scaling cannot fulfill replacement instances; deployment is stalled in CrashLoop.',
      remediationSteps: [
        'Option A (Recommended & Cost Effective): Provision VPC Endpoints for ECR and S3 inside VPC vpc-prod.',
        'Option B: Add route 0.0.0.0/0 pointing to active NAT Gateway in Route Table rtb-private-2b.',
        'Verify Security Group sg-0833192aa1bb allows outbound HTTPS (port 443) traffic.'
      ],
      cliCommands: [
        {
          command: 'aws ec2 create-route --route-table-id rtb-039da921 --destination-cidr-block 0.0.0.0/0 --nat-gateway-id nat-0e91288cc110a',
          explanation: 'Restores egress Internet connectivity for the private subnet through the public NAT Gateway.',
          rollback: 'aws ec2 delete-route --route-table-id rtb-039da921 --destination-cidr-block 0.0.0.0/0'
        },
        {
          command: 'aws ec2 create-vpc-endpoint --vpc-id vpc-08a9921bb --vpc-endpoint-type Interface --service-name com.amazonaws.us-east-1.ecr.api --subnet-ids subnet-0a12f349b8123 --security-group-ids sg-0833192aa1bb',
          explanation: 'Establishes AWS PrivateLink interface endpoint for ECR API, reducing data transfer charges and bypassing public NAT routing.',
          rollback: 'aws ec2 delete-vpc-endpoints --vpc-endpoint-ids <endpoint-id>'
        }
      ],
      blastRadius: {
        nodes: [
          { id: 'alb', name: 'Application Load Balancer', service: 'External Client', status: 'degraded', role: 'upstream', description: 'Target group health checks failing (0/4 healthy hosts)' },
          { id: 'ecs', name: 'OrderServiceTask', service: 'ECS', status: 'failed', role: 'root-cause', description: 'ResourceInitializationError: ECR token timeout' },
          { id: 'vpc', name: 'Subnet-2B (Private)', service: 'VPC', status: 'failed', role: 'root-cause', description: 'Missing egress route 0.0.0.0/0 or ECR VPC endpoint' },
          { id: 'ecr', name: 'Amazon ECR Registry', service: 'S3', status: 'healthy', role: 'downstream', description: 'Registry operational but unreachable from isolated subnet' }
        ],
        edges: [
          { from: 'alb', to: 'ecs', label: 'HTTP Forwarding (Failing)', isBroken: true },
          { from: 'ecs', to: 'vpc', label: 'Subnet Placement' },
          { from: 'vpc', to: 'ecr', label: 'TCP 443 (Timed Out)', isBroken: true }
        ]
      },
      postmortemMarkdown: `# Incident Postmortem: ECS Task Launch Outage (ECR Egress)
**Date**: 2026-09-20
**Severity**: P1 - Critical
**Impact**: ECS deployment failed to rotate healthy containers; service capacity dropped to 0%.
**Root Cause**: Route Table associated with newly provisioned AZ subnets lacked default gateway route to NAT.`
    }
  },
  {
    id: 'dynamodb-hot-partition',
    title: 'DynamoDB Hot Partition & ProvisionedThroughputExceeded',
    badge: 'Database / Scaling',
    awsServices: ['DynamoDB', 'Lambda', 'CloudWatch'],
    severity: 'P2 - High',
    summary: 'Spike in write throttling on DynamoDB table due to single partition key saturation exceeding 1000 WCU partition limit.',
    sampleLog: `botocore.exceptions.ClientError: An error occurred (ProvisionedThroughputExceededException) when calling the UpdateItem operation:
The level of configured provisioned throughput for the table was exceeded.
Consider increasing your provisioning level with the UpdateTable API.
Table: UserSessionStore
Partition Key: PK="tenant#global_default"
Current WCU Bursted: 1,420 WCU/sec on single physical partition
ConsumedCapacity: {"TableName": "UserSessionStore", "CapacityUnits": 1.0}
Throttle Count (Last 5m): 14,920 throttled requests`,
    solution: {
      id: 'sol-dynamo-hot',
      timestamp: '2026-09-20T10:40:00Z',
      title: 'DynamoDB Monolithic Partition Key Hotspot',
      severity: 'P2 - High',
      service: 'Amazon DynamoDB',
      rootCause: 'Low-cardinality partition key tenant#global_default directs traffic to a single storage partition. AWS DynamoDB caps individual physical partitions at 1,000 WCU/sec regardless of overall provisioned table throughput.',
      wellArchitectedPillar: 'Performance Efficiency',
      architecturalImpact: 'User authentication and session update calls experiencing severe backoff latency (>4.2s) and 503 throttling errors.',
      remediationSteps: [
        'Immediate Mitigation: Switch table billing mode to PAY_PER_REQUEST (On-Demand) to remove provisioned throttling constraints.',
        'Architectural Fix: Implement Write Sharding / Partition Key Salting by appending a random suffix (e.g. tenant#global_default_{0..9}).',
        'Enable DynamoDB Accelerator (DAX) or in-memory Redis layer for hot read operations.'
      ],
      cliCommands: [
        {
          command: 'aws dynamodb update-table --table-name UserSessionStore --billing-mode PAY_PER_REQUEST',
          explanation: 'Transitions the table immediately to On-Demand capacity to accommodate sudden burst spikes without provisioned cap.',
          rollback: 'aws dynamodb update-table --table-name UserSessionStore --billing-mode PROVISIONED --provisioned-throughput ReadCapacityUnits=100,WriteCapacityUnits=100'
        }
      ],
      blastRadius: {
        nodes: [
          { id: 'users', name: 'Web & Mobile Users', service: 'External Client', status: 'degraded', role: 'external', description: 'Observing slow login & frequent session disconnects' },
          { id: 'auth_lambda', name: 'AuthSessionHandler', service: 'Lambda', status: 'degraded', role: 'upstream', description: 'High concurrency backoff retries filling execution concurrency pool' },
          { id: 'ddb', name: 'UserSessionStore', service: 'DynamoDB', status: 'failed', role: 'root-cause', description: 'Hot partition: 14.9k throttles on single partition key' }
        ],
        edges: [
          { from: 'users', to: 'auth_lambda', label: 'POST /auth/session' },
          { from: 'auth_lambda', to: 'ddb', label: 'UpdateItem (Throttled)', isBroken: true }
        ]
      },
      postmortemMarkdown: `# Incident Postmortem: DynamoDB Hot Partition Saturation
**Date**: 2026-09-20
**Severity**: P2 - High
**Impact**: Session write throttles exceeded 14,000 requests during peak morning traffic.
**Corrective Actions**: Enabled On-Demand billing; scheduled key salting refactor in Q4.`
    }
  },
  {
    id: 'apigw-timeout-coldstart',
    title: 'API Gateway 504 Timeout & Cold Start Cascade',
    badge: 'Serverless / Reliability',
    awsServices: ['API Gateway', 'Lambda', 'RDS'],
    severity: 'P2 - High',
    summary: 'API Gateway returning 504 Gateway Timeout due to Lambda inside VPC taking 31s during cold start initialization and RDS connection exhaustion.',
    sampleLog: `[WARN] 2026-09-20T08:14:02.102Z HTTP 504 Gateway Timeout
Endpoint request timed out after 29000ms.
Integration: AWS_PROXY -> arn:aws:lambda:us-east-1:123456789012:function:CheckoutService
X-Ray Trace ID: 1-65f210d-88ab12e091b
Init Duration: 18,452.12 ms
Duration: 10,547.88 ms
Billed Duration: 29,000 ms
Memory Size: 512 MB, Max Memory Used: 489 MB
PostgreSQL Error: FATAL: remaining connection slots are reserved for non-replication superuser connections`,
    solution: {
      id: 'sol-apigw-timeout',
      timestamp: '2026-09-20T10:45:00Z',
      title: 'API Gateway 29s Hard Limit Breach via Cold Start & DB Starvation',
      severity: 'P2 - High',
      service: 'Amazon API Gateway / AWS Lambda',
      rootCause: 'CheckoutService Lambda initialization took 18.4s due to heavy framework loading and opening new TCP connections to PostgreSQL without connection pooling, hitting Postgres max_connections limit and breaching API Gateway 29s timeout.',
      wellArchitectedPillar: 'Operational Excellence',
      architecturalImpact: 'Customer checkout transactions aborted during traffic surge. In-flight cart states desynchronized.',
      remediationSteps: [
        'Deploy AWS RDS Proxy between Lambda and Aurora PostgreSQL to multiplex database connections.',
        'Configure Provisioned Concurrency for CheckoutService to eliminate cold start overhead during business hours.',
        'Increase Lambda memory allocation from 512 MB to 1536 MB to allocate a full vCPU for faster initialization.'
      ],
      cliCommands: [
        {
          command: 'aws lambda put-provisioned-concurrency-config --function-name CheckoutService --qualifier live --provisioned-concurrent-executions 10',
          explanation: 'Keeps 10 warm Lambda execution environments pre-initialized, eliminating the 18-second cold start.',
          rollback: 'aws lambda delete-provisioned-concurrency-config --function-name CheckoutService --qualifier live'
        },
        {
          command: 'aws lambda update-function-configuration --function-name CheckoutService --memory-size 1536',
          explanation: 'Boosts CPU and network allocation proportionally to accelerate initialization.',
          rollback: 'aws lambda update-function-configuration --function-name CheckoutService --memory-size 512'
        }
      ],
      blastRadius: {
        nodes: [
          { id: 'checkout_ui', name: 'Checkout Page', service: 'External Client', status: 'failed', role: 'external', description: 'Displaying 504 Gateway Timeout error modal to customers' },
          { id: 'api_gw', name: 'APIGateway-CheckoutAPI', service: 'API Gateway', status: 'degraded', role: 'upstream', description: 'Canceling downstream execution at 29,000ms hard ceiling' },
          { id: 'lambda_chk', name: 'CheckoutService', service: 'Lambda', status: 'failed', role: 'root-cause', description: 'Execution stalled waiting on DB connection + cold start' },
          { id: 'rds_db', name: 'Aurora Postgres Cluster', service: 'External Client', status: 'degraded', role: 'downstream', description: 'Connection pool exhausted (FATAL: max connections)' }
        ],
        edges: [
          { from: 'checkout_ui', to: 'api_gw', label: 'POST /v1/checkout' },
          { from: 'api_gw', to: 'lambda_chk', label: '29s Timeout Breach', isBroken: true },
          { from: 'lambda_chk', to: 'rds_db', label: 'TCP 5432 (Pool Exhausted)', isBroken: true }
        ]
      },
      postmortemMarkdown: `# Incident Postmortem: API Gateway 504 Timeout Cascade
**Date**: 2026-09-20
**Severity**: P2 - High
**Impact**: 38% of checkout submissions failed over a 12-minute traffic spike.
**Mitigation**: Attached RDS Proxy and configured Provisioned Concurrency.`
    }
  }
];