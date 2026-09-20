import { RemediationPlan, IncidentSeverity, BlastRadiusData } from '../types/incident';
import { PRESET_SCENARIOS } from '../data/presets';

export function analyzeLogs(logText: string): RemediationPlan {
  const trimmed = logText.trim().toLowerCase();

  if (trimmed.includes('accessdenied') || (trimmed.includes('kms') && trimmed.includes('s3'))) {
    return JSON.parse(JSON.stringify(PRESET_SCENARIOS[0].solution));
  }
  if (trimmed.includes('resourceinitializationerror') || trimmed.includes('unable to retrieve ecr auth token') || (trimmed.includes('ecs') && trimmed.includes('timeout'))) {
    return JSON.parse(JSON.stringify(PRESET_SCENARIOS[1].solution));
  }
  if (trimmed.includes('provisionedthroughputexceededexception') || trimmed.includes('dynamodb') || trimmed.includes('hot partition')) {
    return JSON.parse(JSON.stringify(PRESET_SCENARIOS[2].solution));
  }
  if (trimmed.includes('504 gateway timeout') || trimmed.includes('init duration') || (trimmed.includes('cold start') && trimmed.includes('api gateway'))) {
    return JSON.parse(JSON.stringify(PRESET_SCENARIOS[3].solution));
  }

  // Custom log heuristic analysis
  const isSecurity = trimmed.includes('unauthorized') || trimmed.includes('iam') || trimmed.includes('forbidden') || trimmed.includes('denied');
  const isDatabase = trimmed.includes('dynamo') || trimmed.includes('postgres') || trimmed.includes('sql') || trimmed.includes('database');
  const isTimeout = trimmed.includes('timeout') || trimmed.includes('timed out') || trimmed.includes('deadline');

  const severity: IncidentSeverity = isSecurity ? 'P1 - Critical' : isTimeout ? 'P2 - High' : 'P3 - Moderate';
  const service = isSecurity ? 'AWS IAM / KMS' : isDatabase ? 'Amazon RDS / DynamoDB' : isTimeout ? 'AWS Lambda / API Gateway' : 'AWS CloudWatch / Compute';

  return {
    id: `custom-${Date.now()}`,
    timestamp: new Date().toISOString(),
    title: `Custom Incident: ${service} Failure`,
    severity,
    service,
    rootCause: `Operational disruption detected in ${service}. Likely configuration mismatch, permission denial, or resource capacity saturation.`,
    wellArchitectedPillar: isSecurity ? 'Security' : isTimeout ? 'Reliability' : 'Operational Excellence',
    architecturalImpact: 'Microservice latency degradation and upstream request drop rate elevation.',
    remediationSteps: [
      'Inspect CloudWatch Logs Insights for correlating error traces.',
      'Validate IAM execution role policies and resource boundary limits.',
      'Check AWS Health Dashboard for regional service degradation.',
      'Apply least-privilege policies and verify VPC Security Group egress rules.'
    ],
    iamPolicyFix: JSON.stringify({
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "LeastPrivilegeRecoveryGrant",
          "Effect": "Allow",
          "Action": [
            "cloudwatch:GetMetricData",
            "logs:FilterLogEvents"
          ],
          "Resource": "*"
        }
      ]
    }, null, 2),
    cliCommands: [
      {
        command: `aws logs filter-log-events --log-group-name /aws/application --filter-pattern "[ERROR]"`,
        explanation: 'Queries correlated error events across the affected application log groups.',
        rollback: '# Read-only diagnostic query; no rollback needed.'
      }
    ],
    blastRadius: {
      nodes: [
        { id: 'client', name: 'External Client', service: 'External Client', status: 'degraded', role: 'external', description: 'Experiencing intermittent HTTP failures' },
        { id: 'origin', name: service, service: 'Lambda', status: 'failed', role: 'root-cause', description: 'Log trace origin reporting execution errors' },
        { id: 'cloudwatch', name: 'CloudWatch Alarms', service: 'CloudWatch', status: 'at-risk', role: 'downstream', description: 'Alarm metric threshold breached' }
      ],
      edges: [
        { from: 'client', to: 'origin', label: 'HTTP Request', isBroken: true },
        { from: 'origin', to: 'cloudwatch', label: 'Emit Metrics' }
      ]
    },
    postmortemMarkdown: `# Incident Postmortem: ${service} Disruption
**Severity**: ${severity}
**Detected Signature**:
${logText.slice(0, 200)}
**Mitigation**: Applied automated least-privilege remediation via CloudPulse AI.`
  };
}

export function simulateRemediation(currentBlastRadius: BlastRadiusData): BlastRadiusData {
  return {
    nodes: currentBlastRadius.nodes.map(node => ({
      ...node,
      status: 'healthy',
      description: 'Restored to healthy operational status via CloudPulse AI remediation.'
    })),
    edges: currentBlastRadius.edges.map(edge => ({
      ...edge,
      isBroken: false,
      label: edge.label ? edge.label.replace('(Failing)', '(Restored)').replace('(Throttled)', '(Active)').replace('(Timed Out)', '(OK)') : 'Healthy'
    }))
  };
}