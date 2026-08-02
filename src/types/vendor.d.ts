// Minimal declarations for the vendored libraries loaded via <script> tags in
// index.html (js/jquery.min.js and js/typed.min.js). Only the surface the site
// actually uses is declared, so the full @types/jquery package is not needed.

interface TypedOptions {
  strings: string[];
  typeSpeed?: number;
  backDelay?: number;
  contentType?: "html" | "text";
  loop?: boolean;
  resetCallback?: () => void;
}

interface VendorJQuery {
  typed(options: TypedOptions | "reset"): VendorJQuery;
  click(handler: (this: HTMLElement) => void): VendorJQuery;
}

declare function $(ready: () => void): VendorJQuery;
declare function $(selector: string): VendorJQuery;
