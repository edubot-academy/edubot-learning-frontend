export const getCertificatePreviewLocale = (language) =>
    language === 'ru' ? 'ru-RU' : language === 'ky' ? 'ky-KG' : 'en-GB';

export const formatPreviewDate = (value, language = 'en') =>
    new Date(value).toLocaleDateString(getCertificatePreviewLocale(language), {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

export const normalizeExactPreviewHtml = (html) => {
    if (!html || typeof html !== 'string') return '';

    const fitStyles = `
        <style id="edubot-preview-fit">
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                background: #ffffff !important;
                overflow: hidden !important;
            }
            body > * {
                margin-left: auto !important;
                margin-right: auto !important;
                max-width: none !important;
                flex: 0 0 auto !important;
            }
        </style>
    `;
    const fitScript = `
        <script id="edubot-preview-fit-script">
            (function () {
                function getRootNode() {
                    if (!document.body) return null;
                    var children = document.body.children || [];
                    for (var index = 0; index < children.length; index += 1) {
                        var tagName = children[index].tagName;
                        if (!/^(STYLE|SCRIPT|META|LINK)$/i.test(tagName)) {
                            return children[index];
                        }
                    }
                    return null;
                }

                function fitPreview() {
                    var root = getRootNode();
                    if (!root) return;

                    root.style.transform = 'none';
                    root.style.transformOrigin = 'top center';
                    root.style.position = 'absolute';
                    root.style.left = '50%';
                    root.style.top = '0';
                    root.style.margin = '0';

                    var baseWidth = root.scrollWidth || root.offsetWidth;
                    var baseHeight = root.scrollHeight || root.offsetHeight;
                    var availableWidth = Math.max(window.innerWidth - 24, 260);
                    var availableHeight = Math.max(window.innerHeight - 24, 260);

                    if (!baseWidth || !baseHeight) return;

                    var isModalPreview = window.frameElement && window.frameElement.dataset.previewSurface === 'modal';
                    var modalFitHeight = Math.max(window.innerHeight - 24, 260);
                    var fitHeight = isModalPreview ? modalFitHeight : availableHeight;
                    var scale = Math.min(availableWidth / baseWidth, fitHeight / baseHeight, 1);
                    var scaledHeight = baseHeight * scale;
                    var topOffset = isModalPreview ? Math.max((window.innerHeight - scaledHeight) / 2, 0) : 0;

                    root.style.top = topOffset + 'px';
                    root.style.transform = 'translateX(-50%) scale(' + scale + ')';
                    document.documentElement.style.height = Math.ceil(isModalPreview ? window.innerHeight : scaledHeight) + 'px';
                    document.body.style.height = Math.ceil(isModalPreview ? window.innerHeight : scaledHeight) + 'px';
                }

                window.addEventListener('load', fitPreview);
                window.addEventListener('resize', fitPreview);
                setTimeout(fitPreview, 0);
                setTimeout(fitPreview, 120);
            })();
        </script>
    `;

    const withViewport = html.includes('name="viewport"')
        ? html
        : html.replace(
              /<head([^>]*)>/i,
              '<head$1><meta name="viewport" content="width=device-width, initial-scale=1" />'
          );

    if (/<head[^>]*>/i.test(withViewport)) {
        return withViewport.replace(/<\/head>/i, `${fitStyles}${fitScript}</head>`);
    }

    return `${fitStyles}${fitScript}${withViewport}`;
};

export const getPreviewRootNode = (doc) => {
    if (!doc?.body) return null;
    return Array.from(doc.body.children).find(
        (child) => !['STYLE', 'SCRIPT', 'META', 'LINK'].includes(child.tagName)
    );
};

export const fitExactPreviewFrame = (iframe) => {
    const fit = () => {
        const doc = iframe?.contentDocument;
        const root = getPreviewRootNode(doc);
        if (!iframe || !doc || !root) return;

        const availableWidth = Math.max(iframe.clientWidth - 24, 260);
        const availableHeight = Math.max(iframe.clientHeight - 24, 260);

        doc.documentElement.style.margin = '0';
        doc.documentElement.style.padding = '0';
        doc.documentElement.style.width = '100%';
        doc.documentElement.style.overflow = 'hidden';
        doc.body.style.margin = '0';
        doc.body.style.padding = '0';
        doc.body.style.width = '100%';
        doc.body.style.overflow = 'hidden';
        doc.body.style.background = '#ffffff';

        root.style.transform = 'none';
        root.style.transformOrigin = 'top left';
        root.style.position = 'absolute';
        root.style.left = '0';
        root.style.top = '0';
        root.style.margin = '0';
        root.style.maxWidth = 'none';

        const rect = root.getBoundingClientRect();
        const baseWidth = Math.max(root.scrollWidth, root.offsetWidth, rect.width);
        const baseHeight = Math.max(root.scrollHeight, root.offsetHeight, rect.height);
        if (!baseWidth || !baseHeight) return;

        const scale = Math.min(availableWidth / baseWidth, availableHeight / baseHeight, 1);
        const scaledWidth = baseWidth * scale;
        const scaledHeight = baseHeight * scale;
        const leftOffset = Math.max((iframe.clientWidth - scaledWidth) / 2, 0);
        const topOffset = Math.max((iframe.clientHeight - scaledHeight) / 2, 0);

        root.style.left = `${leftOffset}px`;
        root.style.top = `${topOffset}px`;
        root.style.transform = `scale(${scale})`;
        doc.documentElement.style.height = `${iframe.clientHeight}px`;
        doc.body.style.height = `${iframe.clientHeight}px`;
    };

    const scheduleFit = () => window.requestAnimationFrame(fit);
    const timeouts = [0, 80, 240].map((delay) => window.setTimeout(scheduleFit, delay));
    const resizeObserver =
        typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleFit);

    resizeObserver?.observe(iframe);
    if (iframe.parentElement) {
        resizeObserver?.observe(iframe.parentElement);
    }
    window.addEventListener('resize', scheduleFit);
    iframe.contentWindow?.addEventListener('resize', scheduleFit);

    return () => {
        timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
        resizeObserver?.disconnect();
        window.removeEventListener('resize', scheduleFit);
        iframe.contentWindow?.removeEventListener('resize', scheduleFit);
    };
};
