export function formatDate(timestamp: number | string): string {
    const datetime = new Date(typeof timestamp === "string" ? timestamp : timestamp * 1000);

    return datetime.toLocaleDateString([], {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    });
}


export function formatTime(timestamp: number | string): string {
    const datetime = new Date(typeof timestamp === "string" ? timestamp : timestamp * 1000);

    return datetime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
}


export function formatNumber(value: number): string {
    const fixed = value.toFixed(2);
    const [integer, decimals] = fixed.split(".");

    const paddedInteger = integer.padStart(3, "0");

    return `${paddedInteger}.${decimals}`;
}

export function formatFileSize(bytes: number | string) {
    if (typeof bytes === "string") return bytes;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
