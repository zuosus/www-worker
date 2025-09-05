# Services Worker


## Technical Stack

* Runtime: Cloudflare Worker
* Language: TypeScript
* RPC Framework: Cloudflare WorkerEntrypoint

## Development

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```

### Required Bindings and Secrets

This worker requires the following bindings and secrets to function properly:

These are configured in the `wrangler.jsonc` file.

### Deployment

Deploy to Cloudflare:
```bash
bun run deploy
```

### Database

This worker uses Cloudflare D1 with Drizzle ORM for database operations.

* Schema definition: `src/api/db/schema.ts`

To work with the database:
1. Use Drizzle Studio to visualize and manage your local database during development
2. All database changes should be made through the Drizzle ORM schema file (`src/api/db/schema.ts`)
3. To generate migrations, run `bun run generate`

### Testing

This project includes unit tests for the PDF generation service. To run the tests:

```bash
bun test
```

Or directly with vitest:

```bash
bun run test
```
