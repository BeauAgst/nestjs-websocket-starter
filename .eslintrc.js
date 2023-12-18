module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
    },
    plugins: [
        "@typescript-eslint/eslint-plugin",
        "simple-import-sort",
        "jest-formatting",
        "jest",
        "unused-imports",
        "rxjs",
    ],
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:jest/recommended",
        "plugin:jest/style",
        "plugin:jest-formatting/strict",
        "plugin:prettier/recommended",
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: [".eslintrc.js"],
    rules: {
        "@typescript-eslint/consistent-type-imports": "error",
        "jest/consistent-test-it": ["error", { fn: "test", withinDescribe: "test" }],
        "jest/expect-expect": [
            "error",
            {
                assertFunctionNames: ["expect", "request.**.expect"],
            },
        ],
        "jest-formatting/padding-around-all": 2,
        "no-console": "error",
        "no-restricted-imports": [
            "error",
            {
                paths: [
                    { name: ".", message: "Do not import from own index" },
                    { name: "..", message: "Do not import from own index" },
                    { name: "./", message: "Do not import from own index" },
                ],
            },
        ],
        "require-await": "error",
        "simple-import-sort/exports": "error",
        "simple-import-sort/imports": [
            "error",
            {
                groups: [["^\\u0000"], ["^node:"], ["^@?\\w"], ["^"], ["^\\."]],
            },
        ],
    },
};
