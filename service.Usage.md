# Usage Guide for Services Worker

This guide explains how to use the RPC (Remote Procedure Call) services provided by this worker from another Cloudflare Worker.

## 1. Binding the Service

To use the services, you need to bind the deployed services worker to your consumer worker. In your consumer worker's `wrangler.jsonc` file, add the following binding configuration:

```jsonc
"services": [
    {
      "binding": "SERVICES",
      "service": "services-worker"
    }
  ]
```

-   `binding`: This is the name of the binding that will be available in your worker's environment (`env`). You can choose any name, but `SERVICES` is a good convention.
-   `service`: This is the name of the deployed services worker.

## 2. Calling the Services

Once the service is bound, you can call its methods from your consumer worker's code. Here are examples of how to use each service.

### Environment Typings

It's a good practice to define the types for your worker's environment, including the service binding.

```typescript
// Import the service type from the services worker
import type { Service } from '../services-worker/src/index';

export interface Env {
  SERVICES: Service;
}
```

### Email Service

The `sendEmail` method allows you to send an email.

**Method Signature:**

```typescript
async sendEmail(
  template: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  },
  options?: {
    from?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
  }
): Promise<{ success: boolean; id?: string; error?: string }>;
```

**Example:**

```typescript
import { IRequest, Router } from 'itty-router';
import type { Service } from '../services-worker/src/index';

export interface Env {
  SERVICES: Service;
}

const router = Router();

router.post('/send-welcome-email', async (request: IRequest, env: Env) => {
  const { to, name } = await request.json();

  const result = await env.SERVICES.sendEmail({
    to: to,
    subject: 'Welcome!',
    html: `<h1>Hi ${name},</h1><p>Welcome to our platform!</p>`,
  });

  return new Response(JSON.stringify(result));
});

export default {
  fetch: router.handle,
};
```

### PDF Generation Service

The `generatePDF` method allows you to generate a PDF from HTML content.

**Method Signature:**

```typescript
async generatePDF(options: {
  title: string;
  sessionId: string;
  createdAt: string;
  content: string;
}): Promise<ArrayBuffer>;
```

**Example:**

```typescript
import { IRequest, Router } from 'itty-router';
import type { Service } from '../services-worker/src/index';

export interface Env {
  SERVICES: Service;
}

const router = Router();

router.post('/generate-report', async (request: IRequest, env: Env) => {
  const { title, content } = await request.json();

  const pdfArrayBuffer = await env.SERVICES.generatePDF({
    title: title,
    sessionId: 'report-123',
    createdAt: new Date().toISOString(),
    content: content,
  });

  return new Response(pdfArrayBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="report.pdf"',
    },
  });
});

export default {
  fetch: router.handle,
};
```

### Push Notification Service

The `sendPushNotification` method allows you to send push notifications via the Bark service.

**Method Signature:**

```typescript
async sendPushNotification(
  pushContent: string
): Promise<{ success: boolean; message?: string }>;
```

**Example:**

```typescript
import { IRequest, Router } from 'itty-router';
import type { Service } from '../services-worker/src/index';

export interface Env {
  SERVICES: Service;
}

const router = Router();

router.post('/send-notification', async (request: IRequest, env: Env) => {
  const { message } = await request.json();

  const result = await env.SERVICES.sendPushNotification(message);

  return new Response(JSON.stringify(result));
});

export default {
  fetch: router.handle,
};
```

### File Upload Service

The `uploadFiles` method allows you to upload files to an R2 bucket.

**Method Signature:**

```typescript
async uploadFiles(
  files: { name: string; type: string; data: ArrayBuffer }[]
): Promise<{ success: boolean; count: number }>;
```

**Example:**

```typescript
import { IRequest, Router } from 'itty-router';
import type { Service } from '../services-worker/src/index';

export interface Env {
  SERVICES: Service;
}

const router = Router();

router.post('/upload-files', async (request: IRequest, env: Env) => {
  // Example: Convert a file to ArrayBuffer for upload
  const file = new File(["file content"], "example.txt", { type: "text/plain" });
  const arrayBuffer = await file.arrayBuffer();
  
  const result = await env.SERVICES.uploadFiles([
    {
      name: file.name,
      type: file.type,
      data: arrayBuffer
    }
  ]);

  return new Response(JSON.stringify(result));
});

export default {
  fetch: router.handle,
};
```