// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Garde-fous du design system « La route ».
 * Ils empêchent un écran d'inventer ses propres couleurs ou sa propre typo :
 * tout passe par `src/theme/tokens.ts` et les composants `@/components/ui`.
 */
const couleursEnDur = [
  {
    selector: 'Literal[value=/^#([0-9a-fA-F]{3,8})$/]',
    message: 'Couleur en dur interdite : utilisez useTheme().couleurs (src/theme/tokens.ts).',
  },
  {
    selector: 'Literal[value=/^(rgb|rgba|hsl|hsla)\\(/]',
    message: 'Couleur en dur interdite : utilisez useTheme().couleurs (src/theme/tokens.ts).',
  },
];

const typoEnDur = {
  selector: 'Property[key.name=/^(fontSize|fontFamily|fontWeight|lineHeight|letterSpacing)$/]',
  message: 'Typographie en dur interdite : utilisez <Texte variante="..."> (src/components/ui/Texte.tsx).',
};

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', '.impeccable/*'],
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...couleursEnDur],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}', 'src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': ['error', ...couleursEnDur, typoEnDur],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'Button', 'TouchableOpacity', 'TouchableHighlight'],
              message: 'Utilisez les composants de @/components/ui (Texte, Ligne…) ou Pressable.',
            },
          ],
          patterns: [
            {
              group: ['@/data/mock', '**/data/mock'],
              message: 'Les écrans passent par @/data/depot, jamais directement par les données fictives.',
            },
          ],
        },
      ],
    },
  },
]);
