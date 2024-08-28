# Sitewatch UI

This folder contains the `ui` component of the Sitewatch monorepo. It is a [Next.js](https://nextjs.org/) application designed to provide the frontend for the Sitewatch platform.

## Getting Started

To run the development server for the `ui` component:

```bash
npm run ui:dev
# or
yarn ui:dev
# or
pnpm ui:dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Building the Application

To build the production-ready version of the `ui` component:

```bash
npm run ui:build
# or
yarn ui:build
# or
pnpm ui:build
```

The build output will be located in the `ui/.next` directory.

### Starting the Production Server

To start the production server for the `ui` component:

```bash
npm run ui:start
# or
yarn ui:start
# or
pnpm ui:start
```

### Linting

To run the linter for the `ui` component:

```bash
npm run ui:lint
# or
yarn ui:lint
# or
pnpm ui:lint
```

### Running Tests

To run the test suite for the `ui` component:

```bash
npm run ui:test
# or
yarn ui:test
# or
pnpm ui:test
```

## Dependencies

Here are some of the main tools used to build the frontend.

- **[Next.js](https://nextjs.org/)**: Framework for server-rendered React applications.
- **[React](https://reactjs.org/)**: Core library for building user interfaces.
- **[Tailwind CSS](https://tailwindcss.com/)**: CSS framework for styling.
- **[TypeScript](https://www.typescriptlang.org/)**
- **[shadcn](https://shadcn.dev/)**: UI components built with Radix UI and Tailwind.
- **[Framer Motion](https://www.framer.com/motion/)**: Animation library for React.
- **[Zod](https://zod.dev/)**: TypeScript schema declaration and validation library.

## Deployment

For deployment instructions and details on the full platform deployment, refer to the root monorepo documentation.
