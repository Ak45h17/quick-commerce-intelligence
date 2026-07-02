export function formatPlatform(platform: string) {
  const labels: Record<string, string> = {
    blinkit: "Blinkit",
    zepto: "Zepto",
    instamart: "Instamart"
  };

  return labels[platform] ?? platform;
}

export function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}
