import type { Pxp2GbFocusData } from './types';

export function decodeHtmlAttr(value: string): string {
	return value
		.replace(/&quot;/g, '"')
		.replace(/&#34;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&#39;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

export function extractGbFocusData(html: string): Pxp2GbFocusData {
	const marker = 'PXP.GBFocusData = ';
	const start = html.indexOf(marker);
	if (start === -1) throw new Error('Could not find grading period data on the gradebook page');

	const rest = html.slice(start + marker.length);
	const endMatch = rest.match(/;\s*(?:\r?\n|$)/);
	const raw =
		endMatch?.index !== undefined ? rest.slice(0, endMatch.index) : rest.trim().replace(/;$/, '');

	const parsed: unknown = JSON.parse(raw);
	if (typeof parsed !== 'object' || parsed === null || !('GradingPeriods' in parsed)) {
		throw new Error('Gradebook focus data did not include grading periods');
	}

	return parsed as Pxp2GbFocusData;
}

export function extractFocusArgsForCourse(html: string, courseId: number): Record<string, unknown> {
	const needle = `data-guid="${courseId}"`;
	const idx = html.indexOf(needle);
	if (idx === -1) throw new Error(`Course ${courseId} was not found on the gradebook page`);

	const slice = html.slice(idx, idx + 8000);
	const quoted = slice.match(/data-focus="([^"]+)"/) ?? slice.match(/data-focus='([^']+)'/);
	if (quoted?.[1] === undefined) {
		throw new Error(`Could not read class details for course ${courseId}`);
	}

	const parsed: unknown = JSON.parse(decodeHtmlAttr(quoted[1]));
	if (typeof parsed !== 'object' || parsed === null) {
		throw new Error(`Invalid class focus data for course ${courseId}`);
	}

	const record = parsed as Record<string, unknown>;
	const focusArgs = record.FocusArgs;
	if (typeof focusArgs === 'object' && focusArgs !== null) {
		return focusArgs as Record<string, unknown>;
	}

	return record;
}

export function extractCourseChrome(
	html: string,
	courseId: number
): { room: string; markPreview: string; scorePreview: string } {
	const needle = `data-guid="${courseId}"`;
	const idx = html.indexOf(needle);
	if (idx === -1) {
		return { room: '', markPreview: '', scorePreview: '' };
	}

	const slice = html.slice(idx, idx + 8000);
	const roomMatch = slice.match(/teacher-room[^>]*>([^<]*)/i);
	const markMatch = slice.match(/class="mark"[^>]*>([^<]*)/i);
	const scoreMatch = slice.match(/class="score"[^>]*>([^<]*)/i);

	return {
		room: (roomMatch?.[1] ?? '').replace(/^Room:\s*/i, '').trim(),
		markPreview: (markMatch?.[1] ?? '').trim(),
		scorePreview: (scoreMatch?.[1] ?? '').trim()
	};
}

const PXP_PLACEHOLDER = /(?<=:)PXP\.\w+\.\w+(?=[,}\]])/g;

export function extractAssignmentNames(html: string): Record<number, string> {
	const marker = '.dxDataGrid(PXP.DevExpress.ExtendGridConfiguration(';
	const start = html.lastIndexOf(marker);
	if (start === -1) return {};

	const rest = html.slice(start + marker.length);
	const line = rest.split(/\r?\n/, 1)[0] ?? rest;
	const close = line.lastIndexOf('}');
	if (close === -1) return {};
	const raw = line.slice(0, close + 1).replace(PXP_PLACEHOLDER, '""');

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {};
	}

	if (typeof parsed !== 'object' || parsed === null || !('dataSource' in parsed)) return {};

	const dataSource = (parsed as { dataSource: unknown }).dataSource;
	if (!Array.isArray(dataSource)) return {};

	const names: Record<number, string> = {};
	for (const record of dataSource) {
		if (typeof record !== 'object' || record === null) continue;
		const row = record as { gradeBookId?: unknown; GBAssignment?: unknown };
		const id = Number(row.gradeBookId);
		if (!Number.isFinite(id)) continue;

		let name: string | undefined;
		if (typeof row.GBAssignment === 'string') {
			try {
				const wrapped: unknown = JSON.parse(row.GBAssignment);
				if (typeof wrapped === 'object' && wrapped !== null && 'value' in wrapped) {
					const value = (wrapped as { value: unknown }).value;
					if (typeof value === 'string') name = value;
				}
			} catch {
				name = row.GBAssignment;
			}
		}

		if (name !== undefined && name.length > 0) names[id] = name;
	}

	return names;
}
