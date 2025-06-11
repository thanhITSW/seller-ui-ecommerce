# File Structure Rules

## 1. API Related Files
- Place all API endpoints in `src/api/endpoints/`
- Place API services in `src/api/services/`
- Place API configurations in `src/api/config/`
- Place API interceptors in `src/api/interceptors/`

## 2. Components
- Place reusable components in `src/components/`
- Follow this structure for each component:
  ```
  src/components/ComponentName/
  ├── index.tsx
  ├── styles.scss
  └── types.ts (if needed)
  ```

## 3. Pages
- Place page components in `src/pages/`
- Follow this structure for each page:
  ```
  src/pages/PageName/
  ├── PageName.tsx
  ├── components/
  │   └── [page-specific components]
  ├── styles/
  │   └── PageName.scss
  └── types/
      └── index.ts
  ```

## 4. Styles
- Place global styles in `src/styles/`
- Place component styles in their respective component folders
- Place page styles in `src/styles/[PageName]/`
- Use SCSS modules for component-specific styles

## 5. Types
- Place global types in `src/types/`
- Place component-specific types in their respective component folders
- Place page-specific types in `src/types/[PageName]/`
- Use index.ts files for type exports

## 6. Redux
- Place reducers in `src/redux/reducers/`
- Place actions in `src/redux/actions/`
- Place selectors in `src/redux/selectors/`
- Place store configuration in `src/redux/store/`

## 7. Contexts
- Place context files in `src/contexts/`
- Follow this structure for each context:
  ```
  src/contexts/ContextName/
  ├── index.tsx
  ├── types.ts
  └── reducer.ts (if needed)
  ```

## 8. Hooks
- Place custom hooks in `src/hooks/`
- Use .ts extension for hooks
- Group related hooks in subdirectories

## 9. Constants
- Place constants in `src/constants/`
- Group related constants in separate files
- Use index.ts for exports

## 10. Configurations
- Place app configurations in `src/configs/`
- Place environment variables in `src/configs/env/`
- Place feature flags in `src/configs/features/`

## 11. i18n
- Place translation files in `src/i18n/locales/`
- Place language configurations in `src/i18n/config/`
- Place i18n utilities in `src/i18n/utils/`

## 12. Assets
- Place images in `src/assets/images/`
- Place icons in `src/assets/icons/`
- Place fonts in `src/assets/fonts/`
- Place other media in `src/assets/media/`

## Naming Conventions
1. Use PascalCase for component files and folders
2. Use camelCase for utility files and functions
3. Use kebab-case for style files
4. Use .tsx for React components
5. Use .ts for non-React files
6. Use .scss for style files
7. Use index.ts for barrel exports

## Import Rules
1. Use absolute imports for src directory
2. Use relative imports for files in the same directory
3. Use barrel exports (index.ts) for cleaner imports
4. Group imports in this order:
   - React and third-party libraries
   - Internal components
   - Types and interfaces
   - Styles
   - Utilities and helpers

## File Organization Best Practices
1. Keep files focused and single-responsibility
2. Group related files together
3. Use meaningful and descriptive names
4. Maintain consistent structure across similar components
5. Keep the directory structure flat when possible
6. Use index files for cleaner imports
7. Document complex structures with README files 