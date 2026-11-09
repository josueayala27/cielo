import { describe, expect, it } from 'vitest'
import { listTicketsQuerySchema } from './query'
import { createTicketSchema, updateTicketSchema } from './ticket'

const valid = {
  title: 'Printer is offline',
  description: 'It shows offline on every laptop.',
  customerName: 'Ana',
  customerEmail: ' ANA@example.com ',
  priority: 'medium',
}

describe('createTicketSchema', () => {
  it('trims, lowercases the email and defaults status to open', () => {
    expect(createTicketSchema.parse({ ...valid, title: '  Printer is offline  ' })).toMatchObject({
      title: 'Printer is offline',
      customerEmail: 'ana@example.com',
      status: 'open',
    })
  })

  it.each([
    ['title', 'abcd'],
    ['title', 'x'.repeat(101)],
    ['description', 'too short'],
    ['description', 'x'.repeat(1001)],
    ['customerName', 'A'],
    ['customerEmail', 'not-an-email'],
    ['priority', 'urgent'],
    ['status', 'closed'],
  ])('rejects invalid %s (%s)', (field, value) => {
    const result = createTicketSchema.safeParse({ ...valid, [field]: value })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual([field])
  })

  it('counts length after trimming', () => {
    expect(createTicketSchema.safeParse({ ...valid, title: '  abcd   ' }).success).toBe(false)
  })
})

describe('updateTicketSchema', () => {
  it('accepts a partial update', () => {
    expect(updateTicketSchema.parse({ status: 'resolved' })).toEqual({ status: 'resolved' })
  })

  it('accepts a board move with status and position', () => {
    expect(updateTicketSchema.parse({ status: 'open', position: -12.5 })).toEqual({ status: 'open', position: -12.5 })
    expect(updateTicketSchema.safeParse({ position: Number.POSITIVE_INFINITY }).success).toBe(false)
  })

  it('rejects empty bodies and unknown fields', () => {
    expect(updateTicketSchema.safeParse({}).success).toBe(false)
    expect(updateTicketSchema.safeParse({ createdAt: 'x' }).success).toBe(false)
  })
})

describe('listTicketsQuerySchema', () => {
  it('applies defaults and treats empty values as unset', () => {
    expect(listTicketsQuerySchema.parse({ status: '', search: '' })).toEqual({
      page: 1,
      limit: 10,
      sort: 'createdAt:desc',
    })
  })

  it('coerces numbers and enforces bounds', () => {
    expect(listTicketsQuerySchema.parse({ page: '3', limit: '25' })).toMatchObject({ page: 3, limit: 25 })
    expect(listTicketsQuerySchema.safeParse({ page: '0' }).success).toBe(false)
    expect(listTicketsQuerySchema.safeParse({ limit: '101' }).success).toBe(false)
    expect(listTicketsQuerySchema.parse({ sort: 'position:asc' }).sort).toBe('position:asc')
    expect(listTicketsQuerySchema.safeParse({ sort: 'title:asc' }).success).toBe(false)
  })
})
