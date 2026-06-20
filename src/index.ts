/**
 * @opsflow/contracts — the typed boundary every OpsFlow repo depends on.
 * Dependency direction is strict: contracts → everything; nothing depends back up.
 *
 * Surface:
 *  - enums          shared vocabulary (tier, status, priority, channel, …)
 *  - state          AgentState zod schema + inferred types (no LangGraph)
 *  - agent          AgentContract + AgentResult envelope (+ packageResult)
 *  - tools          tool-contract types
 *  - events         event names, payloads, envelope, typed bus interface
 *  - version        envelope versioning + boundary validation
 */

export * from './enums';
export * from './state/AgentState';
export * from './agent/AgentContract';
export * from './agent/AgentResult';
export * from './tools/contracts';
export * from './events/names';
export * from './events/payloads';
export * from './events/envelope';
export * from './version/boundary';
