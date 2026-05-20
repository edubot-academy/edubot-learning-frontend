#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { ky as DEFAULT_LOCALE } from '../src/i18n/locales/ky.js';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const FAIL_ON_FINDINGS = process.argv.includes('--fail-on-findings');

const SOURCE_EXTENSIONS = new Set(['.js', '.jsx']);
const IGNORE_PATH_SEGMENTS = new Set([
    '__fixtures__',
    '__mocks__',
    'assets',
    'examples',
    'locales',
]);
const IGNORE_FILES = new Set([
    'src/features/courses/builder/constants.js',
    'src/i18n/locale.js',
]);
const IGNORE_FILE_PATTERNS = [
    /\.spec\.[jt]sx?$/,
    /\.test\.[jt]sx?$/,
    /\.stories\.[jt]sx?$/,
];

const CHECKS = [
    {
        name: 'cyrillic-source',
        description: 'Cyrillic/Kyrgyz text outside locale resources',
        pattern: /[А-Яа-яЁёҮүӨөҢң]/,
    },
    {
        name: 'jsx-text',
        description: 'Hardcoded JSX text node',
        pattern: /<[A-Za-z][^>]*>\s*(?:[A-Za-z][^<{}`]*|\{\s*["'][A-Za-zА-Яа-яЁёҮүӨөҢң])\s*<\//,
    },
    {
        name: 'literal-ui-prop',
        description: 'Hardcoded placeholder/title/aria-label/alt prop',
        pattern: /\b(?:placeholder|title|aria-label|alt)=(?:["'][A-Za-zА-Яа-яЁёҮүӨөҢң]|\{\s*["'][A-Za-zА-Яа-яЁёҮүӨөҢң])/,
    },
    {
        name: 'literal-toast',
        description: 'Hardcoded toast message',
        pattern: /\btoast\.(?:success|error|info|warning)\(\s*['"`]/,
    },
    {
        name: 'raw-backend-message',
        description: 'Direct backend message rendering',
        pattern: /\b[A-Za-z_$][\w$]*(?:\?\.|\.)response(?:\?\.|\.)data(?:\?\.|\.)message|\bresponse(?:\?\.|\.)data(?:\?\.|\.)message/,
    },
];

const toPosix = (filePath) => filePath.split(path.sep).join('/');

const shouldIgnoreFile = (filePath) => {
    const relativePath = toPosix(path.relative(ROOT, filePath));
    const parts = relativePath.split(path.sep);

    if (IGNORE_FILES.has(relativePath)) return true;
    if (parts.some((part) => IGNORE_PATH_SEGMENTS.has(part))) return true;
    if (IGNORE_FILE_PATTERNS.some((pattern) => pattern.test(relativePath))) return true;

    return !SOURCE_EXTENSIONS.has(path.extname(filePath));
};

const walk = (directory) => {
    const files = [];
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (!IGNORE_PATH_SEGMENTS.has(entry.name)) {
                files.push(...walk(entryPath));
            }
            continue;
        }

        if (!shouldIgnoreFile(entryPath)) files.push(entryPath);
    }
    return files;
};

const findings = [];

const getTranslationPath = (resources, key) => {
    const segments = key.split('.');
    let current = resources;

    for (const segment of segments) {
        if (current == null) return undefined;

        if (Array.isArray(current) && /^\d+$/.test(segment)) {
            current = current[Number(segment)];
            continue;
        }

        current = current[segment];
    }

    return current;
};

const STATIC_TRANSLATION_KEY_PATTERN =
    /(?:\b(?:i18n\.)?t|\btRef\.current)\(\s*(['"])([^'"]+)\1/g;

for (const filePath of walk(SRC_DIR)) {
    const relativePath = toPosix(path.relative(ROOT, filePath));
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

    lines.forEach((line, index) => {
        const ignored =
            line.includes('l10n-audit-ignore') ||
            lines[index - 1]?.includes('l10n-audit-ignore');

        CHECKS.forEach((check) => {
            if (ignored) return;
            if (!check.pattern.test(line)) return;
            findings.push({
                check: check.name,
                description: check.description,
                file: relativePath,
                line: index + 1,
                text: line.trim(),
            });
        });

        if (ignored) return;

        for (const match of line.matchAll(STATIC_TRANSLATION_KEY_PATTERN)) {
            const key = match[2];
            if (getTranslationPath(DEFAULT_LOCALE, key) !== undefined) continue;

            findings.push({
                check: 'missing-static-key',
                description: 'Static translation key missing from default locale',
                file: relativePath,
                line: index + 1,
                text: key,
            });
        }
    });
}

if (findings.length === 0) {
    console.log('Localization audit passed: no localization findings.');
    process.exit(0);
}

console.log(`Localization audit found ${findings.length} finding(s):`);
for (const finding of findings) {
    console.log(
        `${finding.file}:${finding.line} [${finding.check}] ${finding.text}`
    );
}

console.log('\nIgnored by default: src/i18n/locales, src/examples, src/assets, specs/tests/stories, locale metadata, and intentional course-language content defaults.');
console.log('Use // l10n-audit-ignore on intentionally hardcoded technical UI literals.');
console.log('Use --fail-on-findings when the known backlog is low enough for CI gating.');

if (FAIL_ON_FINDINGS) process.exit(1);
