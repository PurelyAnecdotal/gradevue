export const PAGE_SOURCE = 'gradecompass-page';
export const BRIDGE_SOURCE = 'gradecompass-bridge';

export type BridgeRequest =
	| { type: 'ping' }
	| { type: 'hasSession'; domain: string }
	| { type: 'beginLogin'; domain: string }
	| { type: 'gradebook'; domain: string; reportPeriod?: number }
	| { type: 'studentInfo'; domain: string };

export type BridgeSuccess<T> = { ok: true; data: T };
export type BridgeFailure = { ok: false; error: string };
export type BridgeResponse<T = unknown> = BridgeSuccess<T> | BridgeFailure;

export interface Pxp2StudentInfo {
	name: string;
	sisNumber: string;
	schoolName: string;
	schoolPhone: string;
	photoUrl: string;
}

export interface SessionResult {
	loggedIn: boolean;
	student?: Pxp2StudentInfo;
}
