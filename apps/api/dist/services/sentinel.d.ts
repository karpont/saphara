export interface HealthCheck {
    name: string;
    ok: boolean;
    detail?: string;
    latencyMs?: number;
}
export interface ErrorEntry {
    at: number;
    level: string;
    msg: string;
    ctx?: any;
}
export interface SecurityEvent {
    at: number;
    type: string;
    ip?: string;
    detail: string;
}
export interface BotIssue {
    id: string;
    severity: "info" | "warning" | "critical";
    title: string;
    detail: string;
    suggestion: string;
    actionable?: string;
}
export interface BotReport {
    generatedAt: string;
    health: HealthCheck[];
    stats: Record<string, number>;
    recentErrors: ErrorEntry[];
    recentSecurityEvents: SecurityEvent[];
    issues: BotIssue[];
    summary: string;
}
export declare function recordError(level: string, msg: string, ctx?: any): void;
export declare function recordSecurityEvent(type: string, detail: string, ip?: string): void;
export declare function recordRequest(ip: string): void;
export declare function generateReport(): Promise<BotReport>;
