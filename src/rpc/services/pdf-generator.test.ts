import { describe, it, expect, vi } from 'vitest'
import { generatePDF } from './pdf-generator'

// Mock environment for testing
const mockEnv = {
  BROWSER: {
    // Mock browser binding
  },
}

// Mock puppeteer
vi.mock('@cloudflare/puppeteer', () => ({
  default: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setContent: vi.fn(),
        pdf: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
      }),
      close: vi.fn(),
    }),
  },
}))

describe('PDF Generator', () => {
  it('should generate PDF with HTML content', async () => {
    const options = {
      title: 'Test Document',
      sessionId: 'test-session-123',
      createdAt: new Date().toISOString(),
      content: '<h1>Hello World</h1><p>This is a test document</p>',
    }

    const result = await generatePDF(mockEnv, options)
    expect(result).toBeInstanceOf(ArrayBuffer)
  })
})
