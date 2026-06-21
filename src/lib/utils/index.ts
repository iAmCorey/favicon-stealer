export const getDomain = (url: string) => {
  try {
    // Add https:// protocol only when one isn't already present.
    // Use a strict regex (not startsWith('http')) so 'HTTP://...' and
    // hosts like 'httpfoo.com' are handled correctly.
    const hasProtocol = /^https?:\/\//i.test(url);
    const urlWithProtocol = hasProtocol ? url : `https://${url}`;
    const domain = new URL(urlWithProtocol).hostname;
    // Remove 'www.' prefix if exists
    return domain.replace(/^www\./, "");
  } catch (error) {
    // Return original input if URL parsing fails
    return url;
  }
};
