# Node.js Layered API Example

Small TypeScript API structured in **api**, **services**, and **domain** layers for RepoGraph module and layer mapping.

## Layout

```txt
src/
  api/          # HTTP handlers
  services/     # business logic
  domain/       # entities
```

## Try it

```bash
repograph validate
repograph scan
repograph check
repograph explain -m Orders
```

## Note

`src/api/orders.controller.ts` imports from `services` and `domain` — rules enforce api → services → domain only.
