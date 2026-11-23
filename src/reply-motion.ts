import type * as React from 'react'
import { watchFirstSend, type FirstSendSession } from './first-send'

type ReplyPhase = 'idle' | 'thinking' | 'streaming' | 'done'
type Listener = () => void
type Block = { type: string; text?: string }
type ReplyEntry = {
  event: {
    type: string
    data?: {
      turn?: number
      chunk?: { type: string; text?: string; block?: Block }
      message?: { content: readonly Block[] }
    }
  }
}
interface ReplyWindow {
  revision: number
  entries: readonly ReplyEntry[]
  change:
    | { kind: 'append' | 'replace' | 'prepend'; entries: readonly ReplyEntry[] }
    | { kind: 'settle-assistant'; entry?: ReplyEntry }
}
interface ReplySource {
  getSnapshot(): ReplyWindow
  subscribe(listener: Listener): Listener
}
interface ReplyBinding { sessionId: string; eventSource: ReplySource; session?: FirstSendSession }
interface ReplyScope {
  sessions: { binding(id: string): ReplyBinding | undefined }
  slots: {
    inject(name: string, setup: () => void): void
    register(entry: { name: string; id: string; inject(id: string): ReplyProps }, view: React.ComponentType<ReplyProps>): void
  }
}
// Cordis makes this optional service available inside the injection below.
declare global {
  interface FishClientContext {
    sessions: ReplyScope['sessions'] & { list: { getSnapshot(): { phase: string; byId: Record<string, unknown> } } }
  }
}
type ReplyProps = { binding?: ReplyBinding }

function visible(text: string | undefined) {
  return typeof text === 'string' && /\S/u.test(text)
}

function contentPhase(entry: ReplyEntry): ReplyPhase | undefined {
  const { type, data } = entry.event
  if (type === 'assistant/live-chunk') {
    const chunk = data?.chunk
    if (chunk?.type === 'text-delta' && visible(chunk.text)) return 'streaming'
    if (chunk?.type === 'reasoning-delta' && visible(chunk.text)) return 'thinking'
    if (chunk?.type === 'block-end' && visible(chunk.block?.text)) {
      if (chunk.block.type === 'text') return 'streaming'
      if (chunk.block.type === 'reasoning') return 'thinking'
    }
  } else if (type === 'assistant/message') {
    const blocks = data?.message?.content
    if (blocks?.some(block => block.type === 'text' && visible(block.text))) return 'streaming'
    if (blocks?.some(block => block.type === 'reasoning' && visible(block.text))) return 'thinking'
  }
  return undefined
}

// The feed labels live appends separately from reconnect baselines and older history pages.
// A turn can contain multiple tool steps, model attempts, and a durable copy of streamed text.
function observeReply(source: ReplySource, report: (phase: ReplyPhase) => void, arrive: Listener, textAdded: (turn: number) => void) {
  let turn: number | undefined
  let sawText = false
  let phase: ReplyPhase = 'idle'
  function fold(entry: ReplyEntry, live: boolean) {
    const { type, data } = entry.event
    if (typeof data?.turn !== 'number') return
    if (type === 'turn/start') {
      if (turn !== data.turn) { turn = data.turn; sawText = false; phase = 'idle' }
      return
    }
    if (turn === undefined || turn !== data.turn) return
    if (type === 'turn/end') {
      turn = undefined
      phase = 'done'
      return
    }
    const next = contentPhase(entry)
    if (next === undefined) return
    phase = next
    if (next !== 'streaming') return
    // A reader can leave the tail halfway through a response. Durable copies of
    // streamed text don't announce it again after the reader scrolls.
    if (live && (!sawText || data.chunk?.type === 'text-delta')) textAdded(turn)
    if (sawText) return
    sawText = true
    if (live) arrive()
  }

  function rebase(entries: readonly ReplyEntry[]) {
    const previousTurn = turn, alreadyShown = sawText
    turn = undefined
    sawText = false
    phase = 'idle'
    // Only an unclosed Turn can affect today's visual state. Never play an arrival
    // while reading a replacement window, even if it contains reconstructed live chunks.
    for (let i = entries.length - 1; i >= 0; i--) {
      const event = entries[i].event
      if (event.type === 'turn/end') return
      if (event.type !== 'turn/start') continue
      for (let j = i; j < entries.length; j++) fold(entries[j], false)
      if (turn === previousTurn && alreadyShown) sawText = true
      return
    }
  }

  let snapshot = source.getSnapshot()
  let revision = snapshot.revision
  rebase(snapshot.entries)
  report(phase)
  return source.subscribe(() => {
    snapshot = source.getSnapshot()
    if (snapshot.revision === revision) return
    const change = snapshot.change
    const sequential = snapshot.revision === revision + 1
    revision = snapshot.revision
    if (change.kind === 'replace' || !sequential) rebase(snapshot.entries)
    else if (change.kind === 'append') {
      for (const entry of change.entries) fold(entry, true)
    } else if (change.kind === 'settle-assistant' && change.entry) {
      fold(change.entry, true)
    }
    report(phase)
  })
}

interface ReplyTracker {
  source: ReplySource
  views: Map<Listener, ((turn: number) => void) | undefined>
  stop: Listener
}
interface ReplyChannel {
  phase: ReplyPhase
  listeners: Set<Listener>
  tracker?: ReplyTracker
}
const channels = new Map<string, ReplyChannel>()

function channelFor(id: string) {
  let channel = channels.get(id)
  if (!channel) {
    channel = { phase: 'idle', listeners: new Set() }
    channels.set(id, channel)
  }
  return channel
}

function publish(channel: ReplyChannel, phase: ReplyPhase) {
  if (channel.phase === phase) return
  channel.phase = phase
  channel.listeners.forEach(notify => notify())
}
function releaseIfUnused(id: string, channel: ReplyChannel) {
  if (!channel.tracker && !channel.listeners.size && channels.get(id) === channel) channels.delete(id)
}

export function dfReplyPhase(sessionId?: string): ReplyPhase {
  return channels.get(sessionId)?.phase ?? 'idle'
}
export function dfSubscribeReplyPhase(sessionId: string | undefined, listener: Listener): Listener {
  if (!sessionId) return () => {}
  const channel = channelFor(sessionId)
  channel.listeners.add(listener)
  return () => { channel.listeners.delete(listener); releaseIfUnused(sessionId, channel) }
}

function attach(binding: ReplyBinding, arrive: Listener, textAdded?: (turn: number) => void) {
  const id = binding.sessionId
  const channel = channelFor(id)
  let tracker = channel.tracker
  if (!tracker || tracker.source !== binding.eventSource) {
    tracker?.stop()
    const views: ReplyTracker['views'] = new Map()
    tracker = {
      source: binding.eventSource, views,
      stop: observeReply(binding.eventSource, phase => publish(channel, phase),
        () => views.forEach((_text, play) => play()), turn => views.forEach(text => text?.(turn))),
    }
    channel.tracker = tracker
  }
  tracker.views.set(arrive, textAdded)
  return () => {
    tracker.views.delete(arrive)
    if (tracker.views.size || channel.tracker !== tracker) return
    tracker.stop()
    channel.tracker = undefined
    publish(channel, 'idle')
    releaseIfUnused(id, channel)
  }
}

export function dfInstallReplyMotion(
  react: typeof React,
  ctx: { inject(services: string[], setup: (scope: ReplyScope) => void): void },
  onArrival: (backdrop: HTMLElement) => void,
  mountBookmark?: (slot: HTMLElement) => { textAdded(turn: number): void; dispose(): void } | undefined,
) {
  const name = 'conversation.input.overlay'
  function ReplyMotion({ binding }: ReplyProps) {
    const ref = react.useRef<HTMLSpanElement>(null)
    react.useLayoutEffect(() => {
      if (!binding) return
      const pane = ref.current?.closest<HTMLElement>('[data-conversation-content]')
      const firstSend = pane && binding.session ? watchFirstSend(pane, binding.session) : undefined
      const bookmark = ref.current && mountBookmark?.(ref.current)
      const stop = attach(binding, () => {
        if (document.hidden) return
        firstSend?.arrive()
        const frame = ref.current?.closest('.dwe-frame')
        const backdrop = frame?.querySelector<HTMLElement>(':scope > .fish-backdrop')
        if (backdrop && backdrop.getClientRects().length) onArrival(backdrop)
      }, bookmark?.textAdded)
      return () => { stop(); firstSend?.dispose(); bookmark?.dispose() }
    }, [binding])
    return react.createElement('span', { ref, hidden: !mountBookmark })
  }
  ctx.inject(['sessions', 'slots'], scope => {
    scope.slots.inject(name, () => scope.slots.register({
      name, id: 'df-reply-motion',
      inject: (sessionId: string) => ({ binding: scope.sessions.binding(sessionId) }),
    }, ReplyMotion))
  })
}
