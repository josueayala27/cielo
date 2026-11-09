import type { Ticket } from '@cielo/contracts'
import { describe, expect, it } from 'vitest'
import { POSITION_STEP, buildColumns, positionAt, positionBetween } from './board-order'

const ticket = (id: string, status: Ticket['status'], position: number) => ({ id, status, position }) as Ticket

describe('positionBetween', () => {
  it('takes the midpoint between two neighbours', () => {
    expect(positionBetween(10, 20)).toBe(15)
  })

  it('steps away from a single neighbour and starts at 0 in an empty column', () => {
    expect(positionBetween(undefined, 10)).toBe(10 - POSITION_STEP)
    expect(positionBetween(10, undefined)).toBe(10 + POSITION_STEP)
    expect(positionBetween(undefined, undefined)).toBe(0)
  })
})

describe('positionAt', () => {
  const column = [ticket('a', 'open', 0), ticket('b', 'open', 10), ticket('c', 'open', 20)]

  it('reorders within a column ignoring the moved card', () => {
    // Move "a" to sit between "b" and "c".
    expect(positionAt(column, 'a', 1)).toBe(15)
  })

  it('inserts a card from another column at the top, middle or end', () => {
    expect(positionAt(column, 'x', 0)).toBe(-POSITION_STEP)
    expect(positionAt(column, 'x', 2)).toBe(15)
    expect(positionAt(column, 'x', 99)).toBe(20 + POSITION_STEP)
  })
})

describe('buildColumns', () => {
  it('groups by status, sorts by position and applies pending placements', () => {
    const tickets = [ticket('a', 'open', 5), ticket('b', 'open', 1), ticket('c', 'resolved', 0)]
    const columns = buildColumns(tickets, new Map([['c', { status: 'open', position: 3 }]]), ['open', 'in_progress', 'resolved'])
    expect(columns.open.map((t) => t.id)).toEqual(['b', 'c', 'a'])
    expect(columns.in_progress).toEqual([])
    expect(columns.resolved).toEqual([])
  })
})
