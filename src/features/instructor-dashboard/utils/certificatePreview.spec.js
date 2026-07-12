import { describe, expect, it } from 'vitest';
import {
    formatPreviewDate,
    getCertificatePreviewLocale,
    getPreviewRootNode,
    normalizeExactPreviewHtml,
} from './certificatePreview';

describe('certificate preview utilities', () => {
    it('maps certificate languages to preview locales', () => {
        expect(getCertificatePreviewLocale('ky')).toBe('ky-KG');
        expect(getCertificatePreviewLocale('ru')).toBe('ru-RU');
        expect(getCertificatePreviewLocale('en')).toBe('en-GB');
        expect(getCertificatePreviewLocale('unknown')).toBe('en-GB');
    });

    it('formats preview dates with the certificate language locale', () => {
        expect(formatPreviewDate('2026-07-13T00:00:00.000Z', 'en')).toContain('2026');
        expect(formatPreviewDate('2026-07-13T00:00:00.000Z', 'ru')).toContain('2026');
    });

    it('injects viewport and preview fit assets into complete HTML documents', () => {
        const normalized = normalizeExactPreviewHtml(
            '<html><head><title>Certificate</title></head><body><main>Preview</main></body></html>'
        );

        expect(normalized).toContain('name="viewport"');
        expect(normalized).toContain('id="edubot-preview-fit"');
        expect(normalized).toContain('id="edubot-preview-fit-script"');
        expect(normalized).toContain('<main>Preview</main>');
    });

    it('keeps existing viewport metadata and supports body fragments', () => {
        const withViewport = normalizeExactPreviewHtml(
            '<html><head><meta name="viewport" content="width=device-width" /></head><body></body></html>'
        );
        const fragment = normalizeExactPreviewHtml('<main>Preview</main>');

        expect(withViewport.match(/name="viewport"/g)).toHaveLength(1);
        expect(fragment).toContain('id="edubot-preview-fit"');
        expect(fragment).toContain('<main>Preview</main>');
    });

    it('finds the first certificate content node in a preview document', () => {
        document.body.innerHTML = '<style></style><script></script><main id="certificate"></main>';

        expect(getPreviewRootNode(document)).toBe(document.getElementById('certificate'));
    });
});
