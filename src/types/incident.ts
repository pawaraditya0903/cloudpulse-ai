export type IncidentSeverity = 'P1 - Critical' | 'P2 - High' | 'P3 - Moderate' | 'P4 - Low';

export type ServiceStatus = 'failed' | 'degraded' | 'healthy' | 'at-risk';

export interface BlastRadiusNode {
  id: string;
  name: string;
  service: 'Lambda' | 'S3' | 'KMS' | 'DynamoDB' | 'ECS' | 'VPC' | 'API Gateway' | 'CloudFront' | 'IAM' | 'CloudWatch' | 'External Client';
  status: ServiceStatus;
  role: 'root-cause' | 'upstream' | 'downstream' | 'external';
  description: string;
}

export interface BlastRadiusEdge {
  from: string;
  to: string;
  label?: string;
  isBroken?: boolean;
}

export interface BlastRadiusData {
  nodes: BlastRadiusNode[];
  edges: BlastRadiusEdge[];
}

export interface RemediationCommand {
  command: string;
  explanation: string;
  rollback: string;
}

export interface RemediationPlan {
  id: string;
  timestamp: string;
  title: string;
  severity: IncidentSeverity;
  service: string;
  rootCause: string;
  wellArchitectedPillar: 'Security' | 'Reliability' | 'Operational Excellence' | 'Cost Optimization' | 'Performance Efficiency';
  architecturalImpact: string;
  cliCommands: RemediationCommand[];
  iamPolicyFix?: string;
  remediationSteps: string[];
  blastRadius: BlastRadiusData;
  postmortemMarkdown: string;
}

export interface PresetScenario {
  id: string;
  title: string;
  badge: string;
  awsServices: string[];
  severity: IncidentSeverity;
  summary: string;
  sampleLog: string;
  solution: RemediationPlan;
}
