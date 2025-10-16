### Adding components

It's important that going forward all components added should be themeable. To do so ensure any
colors come from the [variables.css](./src/variables.css) file with the `--theming-*` prefix. When
adding new variables make downstream dependencies aware that they may be required now to define
additional styles.
