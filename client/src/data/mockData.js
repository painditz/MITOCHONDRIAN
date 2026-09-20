// client/src/data/mockData.js
// Authoritative SentinelOps Architecture & Incident Intelligence Dataset

export const ARCHITECTURE_DATA = {
  telemetry: {
    totalAlerts: 3000,
    clusters: 15,
    p1Critical: 7,
    mitreMapped: 6,
    correlationStatus: 'ACTIVE',
    pipelineStatus: 'PIPELINE ACTIVE',
    mtttReduction: '80.5%'
  },

  // 8 Spatially Distributed Incidents for Hero & Inspection
  incidents: [
    {
      id: 'INC-101',
      priority: 'P1',
      riskScore: 92.1,
      asset: 'CORP-DC-EAST-01',
      criticality: 'DOMAIN CONTROLLER',
      user: 'svc-replication',
      observable: '10.0.1.5',
      signalsCount: 7,
      duration: '45.2 min',
      coords: { x: 50, y: 15 },
      mitreTechniques: [
        { id: 'T1003.006', name: 'DCSync Active Directory Replication' },
        { id: 'T1078.002', name: 'Domain Accounts' }
      ],
      aiBrief: 'Replication abuse detected originating from non-DC internal host targeting Directory Services replication RPC endpoint.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+45', color: '#C73B3B' },
        { name: 'Peak Severity', value: '+25', color: '#B98621' },
        { name: 'Kill-Chain Depth', value: '+12', color: '#B98621' },
        { name: 'ML Relevance', value: '+7', color: '#3A83B8' },
        { name: 'Alert Volume', value: '+3', color: '#16A34A' }
      ]
    },
    {
      id: 'INC-102',
      priority: 'P1',
      riskScore: 96.4,
      asset: 'CORP-EXCHANGE-ONLINE',
      criticality: 'CRITICAL ASSET',
      user: 'marcus.vance.cfo',
      observable: '185.220.101.5',
      signalsCount: 10,
      duration: '60.4 min',
      coords: { x: 50, y: 46 }, // Central anchor
      mitreTechniques: [
        { id: 'T1114.002', name: 'Email Collection: Remote Email Forwarding' },
        { id: 'T1567.002', name: 'Cloud Storage Exfiltration' }
      ],
      aiBrief: 'Executive account compromise followed by cloud data exfiltration involving Exchange Online asset. Automated mailbox forwarding rule to mega.nz.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+45', color: '#C73B3B' },
        { name: 'Peak Severity', value: '+25', color: '#B98621' },
        { name: 'Kill-Chain Depth', value: '+12', color: '#B98621' },
        { name: 'ML Relevance', value: '+9', color: '#3A83B8' },
        { name: 'Alert Volume', value: '+5', color: '#16A34A' }
      ]
    },
    {
      id: 'INC-103',
      priority: 'P2',
      riskScore: 78.2,
      asset: 'WKS-FIN-LEAD-04',
      criticality: 'FINANCE WORKSTATION',
      user: 'sarah.connor',
      observable: '194.26.29.112',
      signalsCount: 6,
      duration: '32.1 min',
      coords: { x: 18, y: 46 },
      mitreTechniques: [
        { id: 'T1566.001', name: 'Spearphishing Attachment' },
        { id: 'T1059.001', name: 'PowerShell Execution' }
      ],
      aiBrief: 'Malicious macro document execution spawned encoded PowerShell session attempting outbound connection to suspicious IP.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+25', color: '#B98621' },
        { name: 'Peak Severity', value: '+25', color: '#B98621' },
        { name: 'Kill-Chain Depth', value: '+14', color: '#B98621' },
        { name: 'Alert Volume', value: '+4', color: '#16A34A' }
      ]
    },
    {
      id: 'INC-105',
      priority: 'P2',
      riskScore: 71.3,
      asset: 'PROD-DB-SQL-01',
      criticality: 'PRODUCTION SQL',
      user: 'db_service_acct',
      observable: '198.51.100.77',
      signalsCount: 8,
      duration: '42.0 min',
      coords: { x: 82, y: 46 },
      mitreTechniques: [
        { id: 'T1190', name: 'Exploit Public-Facing Application' },
        { id: 'T1005', name: 'Data from Local System' }
      ],
      aiBrief: 'SQL injection burst against public web frontend leading to xp_cmdshell execution and user table staging.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+35', color: '#B98621' },
        { name: 'Peak Severity', value: '+20', color: '#B98621' },
        { name: 'Kill-Chain Depth', value: '+10', color: '#B98621' }
      ]
    },
    {
      id: 'INC-106',
      priority: 'P3',
      riskScore: 54.7,
      asset: 'CORP-VPN-GW-01',
      criticality: 'NETWORK PERIMETER',
      user: 'alicia.towers',
      observable: '45.33.32.156',
      signalsCount: 5,
      duration: '14.0 min',
      coords: { x: 18, y: 80 },
      mitreTechniques: [
        { id: 'T1110.003', name: 'Password Spraying' }
      ],
      aiBrief: 'Distributed password spray targeting perimeter VPN gateway resulting in multiple transient account lockouts.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+20', color: '#3A83B8' },
        { name: 'Peak Severity', value: '+18', color: '#3A83B8' }
      ]
    },
    {
      id: 'INC-108',
      priority: 'P1',
      riskScore: 88.5,
      asset: 'DC-BACKUP-02',
      criticality: 'CORE IDENTITY',
      user: 'krbtgt_admin',
      observable: '10.0.3.18',
      signalsCount: 9,
      duration: '52.0 min',
      coords: { x: 50, y: 80 },
      mitreTechniques: [
        { id: 'T1558.003', name: 'Kerberoasting' },
        { id: 'T1490', name: 'Inhibit System Recovery' }
      ],
      aiBrief: 'High-volume Kerberoasting service ticket requests followed by shadow copy deletion on identity backup controller.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+45', color: '#C73B3B' },
        { name: 'Peak Severity', value: '+22', color: '#B98621' },
        { name: 'Kill-Chain Depth', value: '+15', color: '#B98621' }
      ]
    },
    {
      id: 'INC-111',
      priority: 'P3',
      riskScore: 46.8,
      asset: 'DEV-TEST-VM-09',
      criticality: 'DEV NETWORK',
      user: 'dev_build_user',
      observable: '10.240.12.8',
      signalsCount: 6,
      duration: '18.4 min',
      coords: { x: 82, y: 80 },
      mitreTechniques: [
        { id: 'T1046', name: 'Network Service Discovery' }
      ],
      aiBrief: 'Rapid SYN scan against internal staging subnets originating from developer container instance.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+15', color: '#3A83B8' },
        { name: 'Peak Severity', value: '+15', color: '#3A83B8' }
      ]
    },
    {
      id: 'INC-114',
      priority: 'P4',
      riskScore: 15.0,
      asset: 'PRINT-SVR-FLOOR-2',
      criticality: 'OFFICE APPLIANCE',
      user: 'print_daemon',
      observable: '10.0.99.14',
      signalsCount: 2,
      duration: '5.0 min',
      coords: { x: 22, y: 20 },
      mitreTechniques: [
        { id: 'T1040', name: 'Network Sniffing' }
      ],
      aiBrief: 'Transient SNMP discovery broadcast flood from floor printer appliance.',
      riskFactors: [
        { name: 'Asset Criticality', value: '+5', color: '#777777' },
        { name: 'Peak Severity', value: '+5', color: '#777777' }
      ]
    }
  ],

  // 7 Interactive Architectural Stages
  stages: [
    {
      id: '01',
      code: '01',
      name: 'INGEST',
      subtitle: 'HETEROGENEOUS TELEMETRY STREAMS',
      shortDesc: 'Continuous ingestion across five enterprise telemetry sensors.',
      metric: '3,000 ALERTS',
      tag: '5 SENSORS',
      expanded: {
        title: 'MULTI-STREAM DATA INGESTION',
        lead: 'High-throughput stream processing absorbs uncoordinated alert spikes from heterogeneous monitoring infrastructure.',
        evidencePoints: [
          { label: 'EDR TELEMETRY', value: '1,450 alerts (Process injection, LSASS dump, PowerShell)' },
          { label: 'IDENTITY PROVIDER', value: '620 events (Impossible travel, password spray, OAuth consent)' },
          { label: 'CLOUD AUDIT', value: '430 records (S3 mass download, role escalation, KMS key use)' },
          { label: 'NETWORK / FIREWALL', value: '320 flows (C2 beaconing, port sweep, ICMP tunnel)' },
          { label: 'EMAIL GATEWAY', value: '180 scans (Malicious forwarding rules, phishing payloads)' }
        ],
        metrics: [
          { key: 'THROUGHPUT', val: '3,000 records / batch' },
          { key: 'INGESTION LATENCY', val: '< 180 ms' },
          { key: 'LOSSLESS BUFFER', val: 'Zero-drop guarantee' }
        ]
      }
    },
    {
      id: '02',
      code: '02',
      name: 'NORMALIZE',
      subtitle: 'CANONICAL SCHEMA STANDARD',
      shortDesc: 'Disparate vendor syntaxes standardise into a 19-field schema.',
      metric: '19-FIELD COMMON SCHEMA',
      tag: 'OCSF / STIX ALIGNED',
      expanded: {
        title: 'CANONICAL FIELD RESOLUTION',
        lead: 'Eliminates vendor-specific schema fragmentation by extracting standard entities, timestamps, and confidence ratings.',
        evidencePoints: [
          { label: 'HOST / ASSET PIVOT', value: 'Unified NetBIOS, FQDN, and cloud resource IDs' },
          { label: 'IDENTITY RESOLUTION', value: 'Normalizes UPN, sAMAccountName, and cloud GUIDs' },
          { label: 'TEMPORAL ALIGNMENT', value: 'Strict UTC ISO-8601 millisecond ordering' },
          { label: 'SEVERITY HARMONIZATION', value: '5-tier normalized severity index (Crit, High, Med, Low, Info)' }
        ],
        metrics: [
          { key: 'NORMALIZATION RATE', val: '100.0% validation' },
          { key: 'SCHEMA DRIFT', val: '0 uncategorized fields' },
          { key: 'MAPPING EFFICIENCY', val: '1.2 ms / 1k alerts' }
        ]
      }
    },
    {
      id: '03',
      code: '03',
      name: 'CORRELATE',
      subtitle: 'MULTI-ENTITY GRAPH CLUSTERING',
      shortDesc: 'Observable evidence transforms 3,000 alerts into 15 incident clusters.',
      metric: '15 INCIDENT / TRIAGE CLUSTERS',
      tag: '99.5% TRIAGE REDUCTION',
      expanded: {
        title: 'THE INCIDENT CORE',
        lead: 'Observable relationships group related alerts across time horizons, network boundaries, and credential pivots into 15 production incident / triage clusters.',
        evidencePoints: [
          { label: 'HOST', value: 'Pivots across affected workstations, servers, and domain controllers' },
          { label: 'USER', value: 'Correlates compromised identities across cloud identity and on-prem AD' },
          { label: 'EXTERNAL IP', value: 'Shared adversary command-and-control infrastructure and IPs' },
          { label: 'TEMPORAL PROXIMITY', value: '60-minute sliding window establishing incident causality' }
        ],
        metrics: [
          { key: 'PAIRWISE PRECISION', val: '1.0000' },
          { key: 'PAIRWISE RECALL', val: '0.9068' },
          { key: 'PAIRWISE F1 SCORE', val: '0.9511' }
        ]
      }
    },
    {
      id: '04',
      code: '04',
      name: 'PRIORITIZE',
      subtitle: 'ASSET-CRITICALITY WEIGHTING',
      shortDesc: 'Asset criticality is the dominant enterprise prioritization factor.',
      metric: 'RISK + ASSET CRITICALITY',
      tag: 'EXPLAINABLE RANKING',
      expanded: {
        title: 'EXPLAINABLE RISK PRIORITIZATION',
        lead: 'Asset criticality is the dominant enterprise prioritization factor. Incidents are prioritized by enterprise asset business value, peak severity, kill-chain depth, and ML relevance rather than raw alert volume.',
        evidencePoints: [
          { label: 'ASSET CRITICALITY (+45)', value: 'Domain Controller or Production Database multiplier (Dominant factor)' },
          { label: 'PEAK SEVERITY (+25)', value: 'Highest normalized severity within incident cluster' },
          { label: 'KILL-CHAIN DEPTH (+12)', value: 'Exfiltration and credential dumping progression bonus' },
          { label: 'ML RELEVANCE (+9)', value: 'Trained random forest classifier noise rejection score' },
          { label: 'ALERT VOLUME (+5)', value: 'Aggregate normalized evidence volume' }
        ],
        metrics: [
          { key: 'DOMINANT FACTOR', val: 'Asset Criticality (+45 pts)' },
          { key: 'MAX RISK SCORE', val: '96.4 / 100 Risk' },
          { key: 'P1 CRITICAL CLUSTERS', val: '7 priority incidents' }
        ]
      }
    },
    {
      id: '05',
      code: '05',
      name: 'MAP',
      subtitle: 'MITRE ATT&CK EVIDENCE ATTRIBUTION',
      shortDesc: 'Concrete observables map directly into adversary tactics and techniques.',
      metric: 'MITRE ATT&CK',
      tag: '6 MAPPED TECHNIQUES',
      expanded: {
        title: 'EVIDENCE-GROUNDED TECHNIQUE ATTRIBUTION',
        lead: 'Rules require physical forensic proof (e.g. command line parameters, API calls) before tagging ATT&CK techniques.',
        evidencePoints: [
          { label: 'T1114.002', value: 'Email Collection: Remote Email Forwarding Rule' },
          { label: 'T1567.002', value: 'Exfiltration to Cloud Storage Gateway (mega.nz)' },
          { label: 'T1078.004', value: 'Valid Accounts: Domain & Cloud Compromised Accounts' },
          { label: 'T1490', value: 'Inhibit System Recovery: Volume Shadow Copy Deletion' },
          { label: 'T1059.001', value: 'Command and Scripting Interpreter: PowerShell Execution' },
          { label: 'T1190', value: 'Exploit Public-Facing Application: SQL Injection' }
        ],
        metrics: [
          { key: 'MAPPING ACCURACY', val: '100% evidence-backed' },
          { key: 'UNGROUNDED TAGS', val: 'Strictly 0 hallucinations' },
          { key: 'KILL-CHAIN COVERAGE', val: 'Access through Exfiltration' }
        ]
      }
    },
    {
      id: '06',
      code: '06',
      name: 'SUMMARIZE',
      subtitle: 'LOCAL FLAN-T5 AI SHIFT BRIEF',
      shortDesc: 'Local language model produces concise, structured shift handover briefings.',
      metric: 'LOCAL AI SHIFT BRIEF',
      tag: 'ZERO DATA EGRESS',
      expanded: {
        title: 'LOCAL AI SHIFT HANDOVER BRIEFS',
        lead: 'Deterministic local FLAN-T5 model ingests validated incident evidence to produce concise, scannable summaries for SOC analyst relief.',
        evidencePoints: [
          { label: 'WHAT HAPPENED', value: 'Executive account compromise followed by cloud exfiltration' },
          { label: 'AFFECTED ASSET', value: 'CORP-EXCHANGE-ONLINE (Critical Infrastructure)' },
          { label: 'TIMELINE HIGHLIGHTS', value: '06:14 UTC Initial spray → 06:48 UTC Forwarding rule created' },
          { label: 'NEXT STEPS', value: 'Revoke Marcus Vance tokens, review outbound mega.nz flows' }
        ],
        metrics: [
          { key: 'FOUNDATION MODEL', val: 'google/flan-t5-small (Local)' },
          { key: 'INFERENCE SPEED', val: '420 ms / incident' },
          { key: 'EXTERNAL API CALLS', val: '0 (Air-gapped compatible)' }
        ]
      }
    },
    {
      id: '07',
      code: '07',
      name: 'REVIEW',
      subtitle: 'HUMAN DECISION & AUDIT TRAIL',
      shortDesc: '1-click analyst review confirms, modifies, or rejects the AI incident brief.',
      metric: 'HUMAN DECISION',
      tag: '80.5% MTTT SAVED',
      expanded: {
        title: 'HUMAN-IN-THE-LOOP TRIAGE AUDIT',
        lead: 'Empirical analyst decisions are logged with microsecond precision, proving real Mean-Time-To-Triage (MTTT) reduction.',
        evidencePoints: [
          { label: 'CONFIRM DECISION', value: 'Endorses AI brief and triggers SOAR quarantine playbook' },
          { label: 'REJECT DECISION', value: 'Marks false positive and updates ML negative training split' },
          { label: 'ANALYST OBSERVATIONS', value: 'Free-text forensic notes persisted to immutable audit store' },
          { label: 'MEASURED EXPERIMENT', value: 'Empirical trial recorded: 120s baseline reduced to 24s' }
        ],
        metrics: [
          { key: 'EMPIRICAL REDUCTION', val: '80.5% MTTT saved' },
          { key: 'DECISION LATENCY', val: '< 25 seconds' },
          { key: 'AUDIT COMPLIANCE', val: '100% decision persistence' }
        ]
      }
    }
  ]
};

export default ARCHITECTURE_DATA;
