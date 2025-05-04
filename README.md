# Referrski Monorepo

This is a monorepo built with Turborepo containing various projects for the Referrski platform.

## What's inside?

This monorepo uses [pnpm](https://pnpm.io) as a package manager and includes the following packages/apps:

### Apps and Packages

- `api`: a [Next.js](https://nextjs.org) app with API routes
- `@referrski/eslint-config`: ESLint configurations
- `@referrski/typescript-config`: TypeScript configurations
- `@referrski/ui`: a future stub React component library shared by applications

### Utilities

This Turborepo has some additional tools already setup:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as Remote Caching to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need to login to your Vercel account with:

```
pnpm dlx turbo login
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
