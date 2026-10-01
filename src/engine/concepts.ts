// Insurance-domain concept map used by the deterministic semantic engine.
// Each concept lists synonyms / phrasings (terms), related concepts for query
// expansion, and the departments that typically own that knowledge.

export type ConceptKind = 'domain' | 'tech'

export interface Concept {
  id: string
  label: string
  kind: ConceptKind
  terms: string[]
  related: string[]
  depts: string[]
}

export const CONCEPTS: Concept[] = [
  {
    id: 'mga', label: 'MGA / Delegated Authority', kind: 'domain',
    terms: ['mga', 'managing general agent', 'managing general agency', 'delegated authority', 'delegated underwriting', 'coverholder', 'program administrator', 'mga partner', 'mga data', 'mga management', 'binding authority'],
    related: ['programs', 'bordereaux', 'underwriting'],
    depts: ['Programs', 'Underwriting'],
  },
  {
    id: 'programs', label: 'Programs', kind: 'domain',
    terms: ['program', 'program business', 'program management', 'program manager', 'program launch', 'program lifecycle', 'insurance program'],
    related: ['mga', 'onboarding', 'underwriting'],
    depts: ['Programs'],
  },
  {
    id: 'onboarding', label: 'Launch / Onboarding', kind: 'domain',
    terms: ['onboarding', 'onboard', 'launch', 'launching', 'launched', 'go live', 'stand up', 'standing up', 'due diligence', 'partner setup', 'implementation'],
    related: ['programs', 'mga'],
    depts: ['Programs', 'Operations', 'Product'],
  },
  {
    id: 'pricing', label: 'Pricing / Rating', kind: 'domain',
    terms: ['pricing', 'price', 'priced', 'rating', 'rate', 'rater', 'rating engine', 'rate plan', 'rate adequacy', 'rate indication', 'technical price', 'loss cost', 'rating factor'],
    related: ['estimation', 'actuarial', 'underwriting'],
    depts: ['Pricing', 'Actuarial'],
  },
  {
    id: 'estimation', label: 'Estimation / Forecasting', kind: 'domain',
    terms: ['estimation', 'estimate', 'estimating', 'estimated', 'estimator', 'forecast', 'forecasting', 'projection', 'project future', 'predict', 'predicting', 'prediction', 'how much', 'expected loss', 'indication', 'budgeting'],
    related: ['pricing', 'actuarial'],
    depts: ['Pricing', 'Actuarial'],
  },
  {
    id: 'underwriting', label: 'Underwriting / Risk Selection', kind: 'domain',
    terms: ['underwriting', 'underwriter', 'underwrite', 'risk selection', 'risk assessment', 'risk appetite', 'appetite', 'referral', 'submission', 'underwriting guideline', 'line size', 'underwriting authority'],
    related: ['pricing', 'commercial_property'],
    depts: ['Underwriting'],
  },
  {
    id: 'claims', label: 'Claims / Loss', kind: 'domain',
    terms: ['claim', 'claims', 'loss', 'claim payment', 'pay for claim', 'claimant', 'fnol', 'first notice of loss', 'adjuster', 'adjusting', 'severity', 'frequency', 'tpa', 'claim file'],
    related: ['reserving'],
    depts: ['Claims'],
  },
  {
    id: 'reserving', label: 'Reserving / IBNR', kind: 'domain',
    terms: ['reserving', 'reserve', 'ibnr', 'incurred but not reported', 'ultimate loss', 'ultimate', 'ultimately pay', 'ultimately cost', 'ultimate claim', 'ultimate cost', 'future claim payment', 'unpaid claim', 'case reserve', 'loss reserve', 'reserve adequacy', 'claims estimation', 'claim estimation', 'outstanding claim'],
    related: ['loss_development', 'actuarial', 'claims', 'estimation'],
    depts: ['Actuarial', 'Claims'],
  },
  {
    id: 'loss_development', label: 'Loss Development', kind: 'domain',
    terms: ['loss development', 'development triangle', 'triangle', 'chain ladder', 'development factor', 'ldf', 'still developing', 'claim that are still developing', 'developing claim', 'claims development', 'emergence', 'tail factor', 'bornhuetter ferguson', 'accident year', 'paid to incurred'],
    related: ['reserving', 'actuarial'],
    depts: ['Actuarial'],
  },
  {
    id: 'actuarial', label: 'Actuarial', kind: 'domain',
    terms: ['actuarial', 'actuary', 'actuaries', 'loss ratio', 'experience study', 'credibility', 'glm', 'trend', 'fcas', 'acas'],
    related: ['reserving', 'pricing', 'estimation'],
    depts: ['Actuarial', 'Pricing'],
  },
  {
    id: 'premium', label: 'Premium', kind: 'domain',
    terms: ['premium', 'written premium', 'earned premium', 'gwp', 'policy premium', 'premium received', 'expected premium', 'expected policy premium', 'policy level premium', 'premium accounting', 'premium audit', 'installment'],
    related: ['reconciliation', 'finance', 'receivables'],
    depts: ['Finance', 'Finance Technology'],
  },
  {
    id: 'receivables', label: 'Receivables / Cash', kind: 'domain',
    terms: ['receivable', 'receivables', 'collection', 'cash application', 'cash applied', 'money received', 'money we receive', 'received from', 'payment received', 'remittance', 'remit', 'cash', 'aged debt', 'aged balance'],
    related: ['premium', 'reconciliation', 'finance'],
    depts: ['Finance'],
  },
  {
    id: 'reconciliation', label: 'Reconciliation', kind: 'domain',
    terms: ['reconcile', 'reconciliation', 'reconciling', 'reconciled', 'compare', 'comparing', 'comparison', 'against expected', 'variance', 'tie out', 'true up', 'matching rule'],
    related: ['premium', 'finance'],
    depts: ['Finance', 'Finance Technology'],
  },
  {
    id: 'reinsurance', label: 'Reinsurance / Ceded', kind: 'domain',
    terms: ['reinsurance', 'reinsurer', 'ceded', 'cede', 'cession', 'treaty', 'facultative', 'recoverable', 'quota share', 'excess of loss', 'retrocession'],
    related: ['finance', 'catastrophe'],
    depts: ['Reinsurance'],
  },
  {
    id: 'bordereaux', label: 'Bordereaux', kind: 'domain',
    terms: ['bordereaux', 'bordereau', 'bdx', 'premium bordereaux', 'claims bordereaux', 'mga reporting', 'partner reporting', 'partner file', 'mga file'],
    related: ['mga', 'premium', 'data_eng'],
    depts: ['Programs', 'Finance Technology', 'Data'],
  },
  {
    id: 'finance', label: 'Finance / Accounting', kind: 'domain',
    terms: ['finance', 'financial', 'accounting', 'general ledger', 'ledger', 'journal entry', 'month end', 'close process', 'financial system', 'statutory accounting', 'gaap', 'money', 'controller', 'fp&a', 'expense'],
    related: ['premium', 'reconciliation'],
    depts: ['Finance', 'Finance Technology'],
  },
  {
    id: 'commercial_property', label: 'Commercial Property', kind: 'domain',
    terms: ['commercial property', 'property', 'tiv', 'total insured value', 'cope', 'statement of values', 'sov', 'wind', 'flood', 'fire', 'property exposure'],
    related: ['underwriting', 'catastrophe', 'pricing'],
    depts: ['Underwriting', 'Pricing'],
  },
  {
    id: 'catastrophe', label: 'Catastrophe / Exposure', kind: 'domain',
    terms: ['catastrophe', 'cat model', 'cat modeling', 'exposure', 'accumulation', 'rms', 'air model', 'hurricane', 'earthquake', 'aggregation'],
    related: ['commercial_property', 'reinsurance'],
    depts: ['Underwriting', 'Reinsurance'],
  },
  {
    id: 'policy_admin', label: 'Policy Administration / Policy Data', kind: 'domain',
    terms: ['policy administration', 'policy admin', 'policy system', 'pas', 'policy data', 'policy level', 'policy record', 'endorsement', 'issuance', 'guidewire', 'duck creek', 'policy servicing'],
    related: ['operations', 'data_governance'],
    depts: ['Operations', 'Engineering'],
  },
  {
    id: 'compliance', label: 'Compliance / Regulatory', kind: 'domain',
    terms: ['compliance', 'regulatory', 'regulator', 'regulation', 'rate filing', 'filing', 'department of insurance', 'doi', 'naic', 'statutory reporting', 'annual statement', 'licensing', 'audit', 'sox', 'control', 'privacy'],
    related: ['finance'],
    depts: ['Compliance'],
  },
  {
    id: 'operations', label: 'Operations', kind: 'domain',
    terms: ['operations', 'ops', 'process improvement', 'servicing', 'sla', 'backlog', 'throughput', 'operating model', 'process mapping'],
    related: ['automation', 'policy_admin'],
    depts: ['Operations'],
  },
  {
    id: 'product', label: 'Product Development', kind: 'domain',
    terms: ['product development', 'new product', 'product launch', 'coverage design', 'policy form', 'product manager', 'roadmap', 'coverage'],
    related: ['onboarding', 'underwriting'],
    depts: ['Product'],
  },
  {
    id: 'distribution', label: 'Distribution / Brokers', kind: 'domain',
    terms: ['broker', 'distribution', 'agent', 'producer', 'commission', 'wholesaler', 'agency', 'broker portal'],
    related: ['product'],
    depts: ['Product', 'Operations'],
  },
  {
    id: 'fraud', label: 'Fraud / SIU', kind: 'domain',
    terms: ['fraud', 'fraudulent', 'siu', 'special investigation', 'suspicious', 'investigation'],
    related: ['claims', 'data_science'],
    depts: ['Claims'],
  },
  {
    id: 'litigation', label: 'Litigation / Recovery', kind: 'domain',
    terms: ['litigation', 'legal', 'attorney', 'lawsuit', 'legal spend', 'subrogation', 'recovery'],
    related: ['claims'],
    depts: ['Claims'],
  },
  {
    id: 'specialty_lines', label: 'Specialty Lines', kind: 'domain',
    terms: ['cyber', 'ransomware', 'workers compensation', 'workers comp', 'commercial auto', 'fleet', 'telematics', 'agribusiness', 'farm'],
    related: ['product', 'underwriting'],
    depts: ['Underwriting', 'Product'],
  },
  {
    id: 'data_eng', label: 'Data Engineering / Pipelines', kind: 'tech',
    terms: ['data engineering', 'data engineer', 'etl', 'elt', 'pipeline', 'ingestion', 'ingest', 'ingests', 'data integration', 'integration', 'api', 'feed', 'data feed', 'data intake', 'intake', 'sftp', 'data lake', 'mulesoft', 'data pipeline'],
    related: ['snowflake_dbt', 'data_governance'],
    depts: ['Data', 'Engineering', 'Finance Technology'],
  },
  {
    id: 'snowflake_dbt', label: 'Snowflake / dbt', kind: 'tech',
    terms: ['snowflake', 'dbt', 'data warehouse', 'warehouse', 'sql', 'data mart', 'data model'],
    related: ['data_eng', 'reporting'],
    depts: ['Data', 'Finance Technology'],
  },
  {
    id: 'reporting', label: 'Reporting / BI / Analytics', kind: 'tech',
    terms: ['reporting', 'report', 'dashboard', 'bi', 'business intelligence', 'power bi', 'tableau', 'analytics', 'kpi', 'metric', 'visualization', 'insight', 'monitoring'],
    related: ['snowflake_dbt'],
    depts: ['Analytics', 'Data'],
  },
  {
    id: 'data_science', label: 'Predictive Modeling / ML', kind: 'tech',
    terms: ['machine learning', 'ml', 'predictive model', 'predictive modeling', 'statistical model', 'gbm', 'data science', 'data scientist', 'gradient boosting', 'neural network'],
    related: ['estimation', 'actuarial'],
    depts: ['Data', 'Analytics', 'Actuarial'],
  },
  {
    id: 'automation', label: 'Automation / Workflow', kind: 'tech',
    terms: ['automate', 'automated', 'automatically', 'automation', 'automating', 'automates', 'workflow', 'rpa', 'manual process', 'manual', 'straight through', 'stp', 'streamline', 'orchestration', 'monday com workflow'],
    related: ['operations', 'data_eng'],
    depts: ['Engineering', 'Operations', 'Finance Technology'],
  },
  {
    id: 'data_governance', label: 'Data Standards / Quality', kind: 'tech',
    terms: ['data standardization', 'data standard', 'standardization', 'standardize', 'data quality', 'master data', 'data dictionary', 'data governance', 'acord', 'schema', 'lineage', 'validation', 'data validation', 'canonical'],
    related: ['data_eng', 'policy_admin'],
    depts: ['Data'],
  },
  {
    id: 'genai', label: 'AI / Document Intelligence', kind: 'tech',
    terms: ['ai', 'genai', 'generative ai', 'llm', 'chatbot', 'document extraction', 'extract', 'extraction', 'ocr', 'summarization', 'summarize', 'document processing', 'nlp'],
    related: ['automation', 'data_science'],
    depts: ['Engineering', 'Data'],
  },
]

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]))

export const STOPWORDS = new Set(
  'a an the and or but if of to for in on at by with from into onto about as is are was were be been being we our us i me my you your they them their it its this that these those what which who whom how why when where want wants need needs would could should can will we ll ve re s t d m do does did doing done have has had having new better way some any all more most other such only own same so than too very just also get make develop build create help thing stuff work working worked already understand involved considering consider look looking find idea problem much many one two'.split(
    ' ',
  ),
)
