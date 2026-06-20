import { randomUUID } from 'crypto';
import type { DomainEventName } from './names';
import type { DomainEventPayloads } from './payloads';

/**
 * Domain event envelope (ADR-076). Contracts owns the envelope shape, the
 * subscriber descriptor, and the typed bus interface; the BullMQ-backed
 * implementation lives in `platform`.
 */
export interface DomainEvent<T = unknown> {
  /** Sortable UUID (v4 today; v7 when available). */
  eventId: string;
  eventName: DomainEventName;
  tenantId: string;
  /** Per-ticket partition key for ordering. */
  partitionKey: string;
  occurredAt: Date;
  /** correlationId — links the event to the originating request. */
  correlationId: string;
  payload: T;
}

/** A fully-typed event for a known name (payload inferred from the name). */
export type TypedDomainEvent<K extends DomainEventName> = DomainEvent<DomainEventPayloads[K]>;

export interface SubscriberOptions {
  subscriberName: string;
  concurrency?: number;
}

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => Promise<void>;

export interface IEventBus {
  emit<T>(event: DomainEvent<T>): Promise<void>;
  subscribe<K extends DomainEventName>(
    eventName: K,
    handler: EventHandler<DomainEventPayloads[K]>,
    options: SubscriberOptions,
  ): void;
  /** Dispatch an event to all registered subscribers (called by the BullMQ worker). */
  dispatch<T>(event: DomainEvent<T>): Promise<void>;
}

/** Construct a domain event envelope with a fresh id + timestamp. */
export function makeDomainEvent<K extends DomainEventName>(
  eventName: K,
  tenantId: string,
  partitionKey: string,
  payload: DomainEventPayloads[K],
  correlationId: string = randomUUID(),
): TypedDomainEvent<K> {
  return {
    eventId: randomUUID(),
    eventName,
    tenantId,
    partitionKey,
    occurredAt: new Date(),
    correlationId,
    payload,
  };
}
