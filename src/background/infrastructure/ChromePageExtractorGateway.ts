import type { PageExtractorGateway } from "../domain/gateways.js";

/**
 * Executes content extraction directly in the active page context.
 */
export class ChromePageExtractorGateway implements PageExtractorGateway {
  /**
   * Collects headings, unique links, and a short text excerpt from the page.
   */
  async extract(tabId: number): Promise<{
    headings: string[];
    links: { text: string; href: string }[];
    excerpt: string;
  }> {
    const [scriptResult] = await chrome.scripting.executeScript<
      [],
      {
        headings: string[];
        links: { text: string; href: string }[];
        excerpt: string;
      }
    >({
      target: { tabId },
      func: () => {
        const normalizeText = (value: string): string =>
          value.replace(/\s+/g, " ").trim();

        const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
          .map((element) => normalizeText(element.textContent ?? ""))
          .filter(Boolean)
          .slice(0, 20);

        const seenLinks = new Set<string>();
        const links = Array.from(document.querySelectorAll("a[href]"))
          .map((anchor) => ({
            href: (anchor as HTMLAnchorElement).href,
            text: normalizeText(anchor.textContent ?? ""),
          }))
          .filter((link) => link.href.startsWith("http"))
          .filter((link) => {
            if (seenLinks.has(link.href)) {
              return false;
            }
            seenLinks.add(link.href);
            return true;
          })
          .slice(0, 20);

        const excerpt = normalizeText(document.body?.innerText ?? "").slice(
          0,
          500
        );

        return {
          headings,
          links,
          excerpt,
        };
      },
    });

    if (!scriptResult || !scriptResult.result) {
      throw new Error("No extraction data returned from the page.");
    }

    return scriptResult.result;
  }
}
