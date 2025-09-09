// This module provides PDF generation capabilities using Cloudflare Browser Rendering
// It can be used in Cloudflare Worker environments where the BROWSER binding is available

// Type for PDF generation options
interface PDFGenerateOptions {
  title?: string
  sessionId: string
  createdAt: string
  content: string // HTML content for the PDF
}

// Type for Cloudflare Worker environment
interface WorkerEnv {
  BROWSER: Fetcher // Browser binding for puppeteer
}

/**
 * Generate HTML content for PDF
 * If the content is already a complete HTML document, it will be used as is.
 * Otherwise, it will be wrapped in a basic HTML structure with header information.
 */
function createPDFHTML(options: PDFGenerateOptions): string {
  const { title, sessionId, createdAt, content } = options

  // If content is already a complete HTML document, use it as is
  if (content.trim().startsWith('<!DOCTYPE html') || content.trim().startsWith('<html')) {
    return content
  }

  // Otherwise, wrap the content in a basic HTML structure
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || 'Document'} - ${sessionId}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          max-width: 800px; 
          margin: 0 auto; 
          padding: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${title || 'Document'}</h1>
        <p><strong>Session ID:</strong> ${sessionId}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Original Date:</strong> ${new Date(createdAt).toLocaleString()}</p>
      </div>
      
      <div class="content">
        ${content}
      </div>
    </body>
    </html>
  `

  return html
}

/**
 * Generate PDF using Cloudflare Browser Rendering
 * This function is meant to be used in a Cloudflare Worker environment
 * where the Browser binding is available
 */
export async function generatePDF(
  env: WorkerEnv,
  options: PDFGenerateOptions
): Promise<ArrayBuffer> {
  console.log(`[PDF] Starting PDF generation for session: ${options.sessionId}`)

  // Check if Browser binding is available
  if (!env.BROWSER) {
    throw new Error('Browser rendering service is not configured')
  }

  // Dynamically import puppeteer - only available in worker environment
  const { default: puppeteer } = await import('@cloudflare/puppeteer')

  // Create HTML content
  const htmlContent = createPDFHTML(options)
  console.log(`[PDF] HTML content created with title: ${options.title || 'Document'}`)

  // Launch browser and generate PDF
  const browser = await puppeteer.launch(env.BROWSER)
  const page = await browser.newPage()
  await page.setContent(htmlContent)
  console.log(`[PDF] Browser page set with content`)

  // Generate PDF with print background
  const pdfBuffer = await page.pdf({ printBackground: true })
  console.log(`[PDF] PDF generated successfully`)

  // Convert to ArrayBuffer
  let arrayBuffer: ArrayBuffer
  if (pdfBuffer instanceof ArrayBuffer) {
    arrayBuffer = pdfBuffer
  } else if (typeof pdfBuffer === 'object' && pdfBuffer !== null && 'buffer' in pdfBuffer) {
    // If it's a Buffer with a buffer property
    arrayBuffer = (pdfBuffer as { buffer: ArrayBuffer }).buffer
  } else {
    // Convert using Blob if available
    const blob = new Blob([pdfBuffer])
    arrayBuffer = await blob.arrayBuffer()
  }

  // Clean up
  await browser.close()
  console.log(`[PDF] Browser closed, generation completed for session: ${options.sessionId}`)

  return arrayBuffer
}
