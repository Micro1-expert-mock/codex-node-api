import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('README setup note', () => {
  it('documents the local setup flow for contributors', () => {
    const readmePath = join(process.cwd(), 'README.md')
    const readme = readFileSync(readmePath, 'utf8')

    expect(readme).toContain('## Local Setup Note')
    expect(readme).toContain('pnpm install')
    expect(readme).toContain('pnpm dev')
  })
})
