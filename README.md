# CloudPulse AI: The Autonomous AWS SRE Copilot
> **Zero to Shipped AWS Builder Center Hackathon Project**  
> **Category**: `#workplace-efficiency` | **Lane**: `#startup`

---

## ⚡ What is CloudPulse AI?
CloudPulse AI is an autonomous, serverless site reliability copilot built specifically for AWS developers and DevOps teams. It ingests cryptic error logs from Amazon CloudWatch, ECS container tasks, Lambda timeouts, and AWS IAM permission denials, and immediately delivers:

1. **Deterministic Root Cause Analysis (RCA)** in plain technical English.
2. **Interactive Visual Blast-Radius Dependency Graph** visualizing the failing origin, degraded upstream gateways, and downstream at-risk resources.
3. **Least-Privilege Remediation Generator** with ready-to-run AWS CLI commands and strict, resource-scoped IAM JSON policies.
4. **1-Click Self-Healing Simulation** demonstrating instant system recovery and health restoration.
5. **Production Postmortem Export** generating formatted Markdown reports for Jira, Slack, and engineering retrospectives.

---

## 🎯 4 Built-In 1-Click Judge Simulations
To evaluate the system in under 60 seconds without pasting your own AWS logs:
- **Scenario 1**: *Cross-Account S3 & KMS `AccessDenied` in Lambda* (Security / IAM)
- **Scenario 2**: *ECS Fargate CrashLoop & NAT Gateway Egress Timeout* (Networking / VPC)
- **Scenario 3**: *DynamoDB Hot Partition & `ProvisionedThroughputExceededException`* (Database / Scaling)
- **Scenario 4**: *API Gateway 504 Timeout & Cold Start Cascade* (Serverless / Reliability)

---

## 🏗️ AWS Cloud Architecture
- **Frontend Layer**: React 18 + Vite + Tailwind CSS deployed via **AWS Amplify Hosting** with global CloudFront distribution and SSL.
- **Compute Layer**: Serverless **AWS Lambda** parsing telemetry and orchestrating heuristic/AI diagnostics.
- **Intelligence Layer**: Amazon Bedrock integration foundation for deep architectural inference.
- **Storage Layer**: **Amazon DynamoDB** (On-Demand capacity) storing incident postmortems and audit logs.
- **Observability**: **Amazon CloudWatch** structured metric collection.

---

## 🚀 Quickstart (Run Locally)
```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build
```

---

## ☁️ Deploy to AWS Amplify in 2 Minutes
1. Push this repository to GitHub or GitLab.
2. Navigate to the **AWS Amplify Console** (`https://console.aws.amazon.com/amplify`).
3. Click **Host web app** > Select your Git provider > Choose this repository (`main` branch).
4. Amplify will automatically detect `amplify.yml` and deploy your live public URL (e.g. `https://main.d123456.amplifyapp.com`).