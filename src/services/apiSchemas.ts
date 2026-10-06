import { z } from 'zod'
import { documentStatus, documentType, vehicleStatus, verdictCode } from '../data/schemas'
import type { LoginChallenge, PublicStatus, Session, VerifyResult } from '../types/api'

export const sessionSchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(['control_agent', 'admin_agent', 'institution_admin', 'owner', 'issuer']),
  name: z.string().min(1),
}) satisfies z.ZodType<Session>

export const loginChallengeSchema = z.object({
  challengeId: z.string().min(1),
}) satisfies z.ZodType<LoginChallenge>

export const publicStatusSchema = z.object({
  label: z.string().min(1),
}) satisfies z.ZodType<PublicStatus>

const verdictResultSchema = z.object({
  code: verdictCode,
  color: z.enum(['gris', 'rouge', 'orange', 'vert']),
  label: z.string().min(1),
  suggestedAction: z.string().min(1),
  vehicleStatus: vehicleStatus.nullable(),
  activation: z
    .object({
      status: z.enum(['ACTIVE', 'GRACE', 'REACTIVATION_REQUISE']),
      daysSinceExpiry: z.number().int(),
      graceDaysLeft: z.number().int().nullable(),
    })
    .nullable(),
  documents: z.array(
    z.object({
      id: z.string().nullable(),
      type: documentType,
      status: documentStatus,
      validUntil: z.string().nullable(),
      daysLeft: z.number().int().nullable(),
    }),
  ),
  unpaidPenaltyCount: z.number().int().min(0),
})

export const verifyResultSchema = z.object({
  verdict: verdictResultSchema,
  vehicle: z
    .object({
      plate: z.string(),
      brand: z.string(),
      model: z.string(),
      color: z.string(),
      hasDeclaredDriver: z.boolean(),
    })
    .nullable(),
  controlId: z.string().nullable(),
  checkedAt: z.string().min(1),
}) satisfies z.ZodType<VerifyResult>