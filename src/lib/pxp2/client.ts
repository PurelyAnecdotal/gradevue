import type { Gradebook } from '$lib/types/Gradebook';
import { mapGradebook } from './mapGradebook';
import {
	extractAssignmentNames,
	extractCourseChrome,
	extractFocusArgsForCourse,
	extractGbFocusData
} from './parse';
import { assertAllowedStudentVuePath } from './paths';
import type { Pxp2StudentInfo } from './protocol';
import type {
	Pxp2ClassData,
	Pxp2CourseInput,
	Pxp2CourseMetadata,
	Pxp2GbFocusData,
	Pxp2GradingPeriod,
	Pxp2MeasureType
} from './types';

export interface Pxp2Transport {
	origin: string;
	fetch: typeof fetch;
}

const PORTAL_HEADERS = {
	Current_web_portal: 'StudentVUE'
};

const CLASS_DATA_BODY = {
	FriendlyName: 'genericdata.classdata',
	Method: 'GetClassData',
	Parameters: '{}'
};

function asString(value: unknown, fallback = ''): string {
	return typeof value === 'string' ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
	if (typeof value === 'object' && value !== null) return value as Record<string, unknown>;
	return undefined;
}

function unwrapAsmx(body: unknown): unknown {
	const record = asRecord(body);
	if (record === undefined || !('d' in record)) return body;

	const inner = record.d;
	if (typeof inner === 'string') {
		try {
			return JSON.parse(inner);
		} catch {
			return inner;
		}
	}
	return inner;
}

async function readBody(res: Response): Promise<unknown> {
	const text = await res.text();
	if (text.length === 0) return undefined;
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

export async function pxp2Request(
	transport: Pxp2Transport,
	path: string,
	init: RequestInit = {}
): Promise<Response> {
	assertAllowedStudentVuePath(path);
	const url = `${transport.origin}${path}`;
	const headers = new Headers(init.headers);
	if (!headers.has('Current_web_portal'))
		headers.set('Current_web_portal', PORTAL_HEADERS.Current_web_portal);

	const res = await transport.fetch(url, {
		...init,
		headers,
		credentials: 'include'
	});

	if (!res.ok) {
		throw new Error(`StudentVUE request failed (${res.status}) for ${path.split('?')[0]}`);
	}

	return res;
}

export async function fetchStudent(transport: Pxp2Transport): Promise<Pxp2StudentInfo> {
	const res = await pxp2Request(
		transport,
		'/api/v1/components/pxp/student-picker/StudentPicker/GetStudents',
		{ method: 'POST' }
	);
	const body = await readBody(res);
	const record = asRecord(body);
	const list = record?.data;
	if (!Array.isArray(list) || list.length === 0) {
		throw new Error('Not logged in to StudentVUE');
	}

	const student = asRecord(list[0]);
	if (student === undefined) throw new Error('Not logged in to StudentVUE');

	return {
		name: asString(student.name ?? student.Name, 'Student'),
		sisNumber: asString(student.sisNumber ?? student.SisNumber),
		schoolName: asString(student.schoolName ?? student.SchoolName),
		schoolPhone: asString(student.schoolPhone ?? student.SchoolPhone),
		photoUrl: asString(student.photoUrl ?? student.PhotoUrl)
	};
}

export async function hasPxp2Session(
	transport: Pxp2Transport
): Promise<Pxp2StudentInfo | undefined> {
	try {
		return await fetchStudent(transport);
	} catch {
		return undefined;
	}
}

async function fetchGradebookHtml(transport: Pxp2Transport): Promise<string> {
	const res = await pxp2Request(transport, '/PXP2_GradeBook.aspx?AGU=0', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
	});
	return res.text();
}

async function loadControl(
	transport: Pxp2Transport,
	control: string,
	parameters: Record<string, unknown>
): Promise<string> {
	const res = await pxp2Request(transport, '/service/PXP2Communication.asmx/LoadControl', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json; charset=utf-8',
			Referer: `${transport.origin}/PXP2_GradeBook.aspx?AGU=0`
		},
		body: JSON.stringify({ request: { control, parameters } })
	});

	const unwrapped = asRecord(unwrapAsmx(await readBody(res)));
	const data = asRecord(unwrapped?.Data) ?? unwrapped;
	const html = data?.html;
	if (typeof html !== 'string') throw new Error(`StudentVUE did not return ${control} HTML`);
	return html;
}

function gradingPeriodPayload(period: Pxp2GradingPeriod): Record<string, unknown> {
	return {
		AGU: 0,
		GradingPeriodGroup: period.GroupName,
		OrgYearGU: period.OrgYearGU,
		gradePeriodGU: period.GU,
		schoolID: period.schoolID
	};
}

async function fetchCourseMetadata(
	transport: Pxp2Transport,
	period: Pxp2GradingPeriod
): Promise<Pxp2CourseMetadata[]> {
	const markPeriodGU = period.MarkPeriods?.[0]?.GU ?? period.GU;
	const res = await pxp2Request(
		transport,
		'/service/PXP2Communication.asmx/GradebookFocusClassInfo',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Referer: `${transport.origin}/PXP2_GradeBook.aspx?AGU=0`
			},
			body: JSON.stringify({
				request: {
					gradingPeriodGU: period.GU,
					AGU: '0',
					orgYearGU: period.OrgYearGU,
					schoolID: period.schoolID,
					markPeriodGU
				}
			})
		}
	);

	const unwrapped = asRecord(unwrapAsmx(await readBody(res)));
	const data = asRecord(unwrapped?.Data) ?? unwrapped;
	const classes = data?.Classes;
	if (!Array.isArray(classes)) throw new Error('StudentVUE did not return class list');

	return classes.map((entry) => {
		const row = asRecord(entry) ?? {};
		return {
			ID: Number(row.ID),
			Name: asString(row.Name),
			TeacherName: asString(row.TeacherName)
		};
	});
}

async function fetchClassData(transport: Pxp2Transport): Promise<Pxp2ClassData> {
	const res = await pxp2Request(
		transport,
		'/api/GB/ClientSideData/Transfer?action=genericdata.classdata-GetClassData',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=utf-8',
				Referer: `${transport.origin}/PXP2_GradeBook.aspx?AGU=0`
			},
			body: JSON.stringify(CLASS_DATA_BODY)
		}
	);

	const body = await readBody(res);
	const record = asRecord(body);
	if (record === undefined) throw new Error('StudentVUE did not return class data');

	const assignments = Array.isArray(record.assignments) ? record.assignments : [];
	const classGrades = Array.isArray(record.classGrades) ? record.classGrades : [];
	const measureTypeGrades = Array.isArray(record.measureTypeGrades) ? record.measureTypeGrades : [];
	const measureTypes = Array.isArray(record.measureTypes) ? record.measureTypes : undefined;

	return {
		assignments: assignments as Pxp2ClassData['assignments'],
		classGrades: classGrades as Pxp2ClassData['classGrades'],
		classId: Number(record.classId ?? 0),
		className: (record.className as string | number) ?? '',
		gradingPeriodId:
			typeof record.gradingPeriodId === 'number' ? record.gradingPeriodId : undefined,
		measureTypeGrades: measureTypeGrades as Pxp2ClassData['measureTypeGrades'],
		measureTypes: measureTypes as Pxp2MeasureType[] | undefined
	};
}

export async function fetchPxp2Gradebook(
	transport: Pxp2Transport,
	reportPeriodIndex?: number
): Promise<Gradebook> {
	const html = await fetchGradebookHtml(transport);
	const focus: Pxp2GbFocusData = extractGbFocusData(html);
	const periods = focus.GradingPeriods;
	if (periods.length === 0) throw new Error('No grading periods were found');

	const defaultIndex = periods.findIndex((period) => period.defaultFocus);
	const activeIndex =
		reportPeriodIndex !== undefined ? reportPeriodIndex : defaultIndex === -1 ? 0 : defaultIndex;
	const activePeriod = periods[activeIndex];
	if (activePeriod === undefined) throw new Error('That grading period is not available');

	let periodHtml = html;
	if (activeIndex !== (defaultIndex === -1 ? 0 : defaultIndex)) {
		periodHtml = await loadControl(
			transport,
			'Gradebook_SchoolClasses',
			gradingPeriodPayload(activePeriod)
		);
	}

	const coursesMeta = await fetchCourseMetadata(transport, activePeriod);
	let measureTypes: Pxp2MeasureType[] = [];
	const courses: Pxp2CourseInput[] = [];

	for (const metadata of coursesMeta) {
		const chrome = extractCourseChrome(periodHtml, metadata.ID);
		const focusArgs = extractFocusArgsForCourse(periodHtml, metadata.ID);
		const classHtml = await loadControl(transport, 'Gradebook_ClassDetails', focusArgs);
		const assignmentNames = extractAssignmentNames(classHtml);
		const classData = await fetchClassData(transport);
		if (classData.measureTypes !== undefined && classData.measureTypes.length > 0) {
			measureTypes = classData.measureTypes;
		}

		courses.push({
			metadata: {
				...metadata,
				room: chrome.room,
				markPreview: chrome.markPreview,
				scorePreview: chrome.scorePreview
			},
			classData,
			assignmentNames,
			measureTypes
		});
	}

	for (const course of courses) {
		course.measureTypes = measureTypes;
	}

	return mapGradebook({
		periods,
		activePeriod,
		activeIndex,
		courses
	});
}
