(function () {
  // 1. Configuration: Determine the base URL of the widget dynamically.
  // This ensures the script works regardless of where it's hosted (localhost or production).
  const currentScript = document.currentScript || document.scripts[document.scripts.length - 1];
  const scriptSrc = currentScript.src;
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));
  
  // CRITICAL SECURITY: Define the exact origin of your Next.js app.
  // This prevents malicious websites from spoofing resize commands or injecting XSS.
  // In production, this MUST be your actual deployed domain.
  const ALLOWED_ORIGIN = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://apps.adityoarr.com';

  // 2. Find all target containers on the host page
  const containers = document.querySelectorAll('div.adityoarr-comments');

  containers.forEach((container) => {
    const threadId = container.getAttribute('data-thread-id') || window.location.pathname;
    const hostDomain = window.location.hostname;

    // 3. Create the sandboxed iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${baseUrl}/embed?threadId=${encodeURIComponent(threadId)}&host=${encodeURIComponent(hostDomain)}`;
    
    // SECURITY: Sandbox attributes.
    // - allow-scripts: Required for Next.js/React to execute.
    // - allow-same-origin: Required for the iframe to communicate with parent via postMessage and access its own storage.
    // - allow-forms: Required for the comment input field.
    // - allow-popups: Required for the OAuth login popup workaround (Phase 5).
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
    
    // Styling to ensure seamless integration
    iframe.style.width = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.style.overflow = 'hidden';
    iframe.title = 'Adityoarr Comments Widget';

    // 4. Lazy Loading with IntersectionObserver
    // Defers iframe loading until it's 200px away from the viewport, improving host page performance.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(iframe);

    // 5. Inject iframe into the container
    container.appendChild(iframe);
  });

  // 6. Secure postMessage listener for dynamic resizing
  window.addEventListener('message', (event) => {
    // CRITICAL SECURITY: Validate the origin of the message.
    // If a malicious site tries to send a message, it will be blocked here.
    if (event.origin !== ALLOWED_ORIGIN) {
      console.warn('Adityoarr Comments: Ignored postMessage from unauthorized origin:', event.origin);
      return;
    }

    // Handle RESIZE commands
    if (event.data && event.data.type === 'RESIZE') {
      // Find the specific iframe that sent the message (supports multiple widgets on one page)
      const iframes = document.querySelectorAll('iframe[title="Adityoarr Comments Widget"]');
      iframes.forEach((iframe) => {
        if (iframe.contentWindow === event.source) {
          // Apply the new height
          iframe.style.height = `${event.data.payload.height}px`;
        }
      });
    }
  });
})();