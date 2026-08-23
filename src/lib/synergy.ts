import type { Attachment, AttachmentResult } from '$lib/types/Attachment';
import type { Attendance, AttendanceResult } from '$lib/types/Attendance';
import type { AuthToken, AuthTokenResult } from '$lib/types/AuthToken';
import type { Documents, DocumentsResult } from '$lib/types/Documents';
import type { MailData, MailResult } from '$lib/types/MailData';
import type { StudentInfo, StudentInfoResult } from '$lib/types/StudentInfo';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import type { Course, GradebookResult, ReportPeriod } from './types/Gradebook';
import type { ReportCard, ReportCardNotFound, ReportCardResult } from './types/ReportCard';
import type { SyResponse } from '$lib/syfetch';
import { demoMockDomain } from '$lib/constants';
import { syfetch } from '$lib/syfetch';

export const Operation = {
	Request: 'ProcessWebServiceRequest',
	RequestMultiWeb: 'ProcessWebServiceRequestMultiWeb'
} as const;

export type Operation = (typeof Operation)[keyof typeof Operation];

const MethodName = {
	Gradebook: 'Gradebook',
	Attendance: 'Attendance',
	StudentInfo: 'StudentInfo',
	Documents: 'GetStudentDocumentInitialData',
	ReportCard: 'GetReportCardDocumentData',
	Mail: 'SynergyMailGetData',
	Attachment: 'SynergyMailGetAttachment',
	GenerateAuthToken: 'GenerateAuthToken'
} as const;

type MethodName = (typeof MethodName)[keyof typeof MethodName];

const alwaysArray = [
	'Gradebook.Courses.Course',
	'Gradebook.Courses.Course.Marks.Mark',
	'Gradebook.Courses.Course.Marks.Mark.Assignments.Assignment',
	'Gradebook.Courses.Course.Marks.Mark.Assignments.Assignment.Resources.Resource',
	'Gradebook.ReportingPeriods.ReportPeriod',
	'Attendance.Absences.Absence',
	'SynergyMailDataXML.InboxItemListings.MessageXML',
	'StudentDocuments.StudentDocumentDatas.StudentDocumentData',
];

const envelopeParser = new XMLParser({ ignoreDeclaration: true });

const resultParser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
	attributeNamePrefix: '_',
	isArray: (_name, jpath) => typeof jpath === 'string' && alwaysArray.includes(jpath),
	attributeValueProcessor: (_name, value) =>
		value === 'true' ? true : value === 'false' ? false : value
});

/** For use only with output of xml parser; applies only to non-attributes */
function convertEmptyElementToNull<T>(obj: T): T {
	if (typeof obj !== 'object' || obj === null) return obj;

	if (Array.isArray(obj)) return obj.map(convertEmptyElementToNull) as T;

	const newObj: any = {};
	for (const [key, val] of Object.entries(obj)) {
		if (val === '' && !key.startsWith('_')) {
			newObj[key] = null;
		} else {
			newObj[key] = convertEmptyElementToNull(val);
		}
	}
	return newObj;
}

const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '_' });

export const unwrapEnvelope = (envelopeStr: string, operation: Operation): string =>
	envelopeParser.parse(envelopeStr)['soap:Envelope']['soap:Body'][`${operation}Response`][
		`${operation}Result`
	];

export const wrapEnvelope = (body: string, operation: Operation): string =>
	builder.build({
		'?xml': { _version: '1.0', _encoding: 'utf-8' },
		'soap:Envelope': {
			'_xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'soap:Body': {
				[`${operation}Response`]: {
					_xmlns: 'http://edupoint.com/webservices/',
					[`${operation}Result`]: body
				}
			}
		}
	});

export function parseResult<T>(resultStr: string): T {
	const result = resultParser.parse(resultStr);

	if (result.RT_ERROR) throw new Error(result.RT_ERROR._ERROR_MESSAGE);

	return result;
}

interface Credentials {
	domain: string;
	userID: string;
	password: string;
	syfetchUrl?: string;
}

function parseRecentRowText(text: string) {
	let title = text;
	let dueDate = '';
	let score = '';

	const dueMatch = text.match(/Due Date:\s*([0-9/]+)/i);
	if (dueMatch && dueMatch[1]) dueDate = dueMatch[1].trim();

	const scoreMatch = text.match(/Score:\s*([^;]+)$/i);
	if (scoreMatch && scoreMatch[1]) score = scoreMatch[1].trim();

	const beforeDue = text.split(/Due Date:/i)[0] || '';
	title = beforeDue.replace(/[A-Z][a-z]+,\s*[A-Z]\s+.*$/, '').trim() || beforeDue.trim();

	let point: string | undefined = undefined;
	let pointPossible: string | undefined = undefined;
	if (score.includes('out of')) {
		const parts = score.split('out of');
		point = parts[0]?.trim();
		pointPossible = parts[1]?.trim();
	}

	return { title, dueDate, score, point, pointPossible };
}

export class PortalSession {
	domain: string;
	userID: string;
	password: string;
	syfetchUrl?: string;
	cookies: Map<string, string> = new Map();
	isLoggedIn: boolean = false;
	agu: string = '';

	constructor(domain: string, userID: string, password: string, syfetchUrl?: string) {
		this.domain = domain;
		this.userID = userID;
		this.password = password;
		this.syfetchUrl = syfetchUrl;
	}

	updateCookies(res: SyResponse | Response) {
		const headers = res.headers as any;
		const setCookie = headers.getSetCookie
			? headers.getSetCookie()
			: [headers.get('set-cookie')].filter(Boolean);
		for (const header of setCookie) {
			if (!header) continue;
			for (const cookieStr of header.split(/,(?=[^;]+=[^;]+)/)) {
				const parts = cookieStr.split(';')[0]?.trim().split('=');
				if (parts && parts.length >= 2 && parts[0]) {
					const name = parts[0].trim();
					const val = parts.slice(1).join('=').trim();
					if (name) this.cookies.set(name, val);
				}
			}
		}
	}

	getCookieHeader(): string {
		return Array.from(this.cookies.entries())
			.map(([k, v]) => `${k}=${v}`)
			.join('; ');
	}

	async request(path: string, init: RequestInit = {}): Promise<SyResponse | Response> {
		const url = path.startsWith('http') ? path : `https://${this.domain}${path}`;
		const headers = Object.assign(
			{
				'User-Agent':
					'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Cookie: this.getCookieHeader(),
				Accept: 'text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8'
			},
			init.headers || {}
		);

		const fetchFn =
			typeof window !== 'undefined'
				? (u: string, i?: RequestInit) => syfetch(u, i, this.syfetchUrl)
				: this.syfetchUrl
					? (u: string, i?: RequestInit) => syfetch(u, i, this.syfetchUrl)
					: fetch;

		const res = await fetchFn(url, { ...init, headers, redirect: 'manual' });
		this.updateCookies(res);
		return res;
	}

	async login(): Promise<void> {
		const getRes = await this.request('/PXP2_Login_Student.aspx?regenerateSessionId=true');
		const getHtml = await getRes.text();

		const viewState = getHtml.match(/id="__VIEWSTATE"\s+value="([^"]+)"/)?.[1] || '';
		const viewStateGen = getHtml.match(/id="__VIEWSTATEGENERATOR"\s+value="([^"]+)"/)?.[1] || '';
		const eventValidation = getHtml.match(/id="__EVENTVALIDATION"\s+value="([^"]+)"/)?.[1] || '';

		const params = new URLSearchParams();
		params.set('__VIEWSTATE', viewState);
		params.set('__VIEWSTATEGENERATOR', viewStateGen);
		params.set('__EVENTVALIDATION', eventValidation);
		params.set('ctl00$MainContent$username', this.userID);
		params.set('ctl00$MainContent$password', this.password);
		params.set('ctl00$MainContent$Submit1', 'Login');

		const postRes = await this.request('/PXP2_Login_Student.aspx', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Referer: `https://${this.domain}/PXP2_Login_Student.aspx`
			},
			body: params.toString()
		});

		if (postRes.status === 302 || (postRes.status === 200 && postRes.headers.get('location'))) {
			this.isLoggedIn = true;
			return;
		}

		const postHtml = await postRes.text();
		const errMatch = postHtml.match(/id="ctl00_MainContent_FailureText"[^>]*>([^<]+)</i);
		const errMsg = errMatch && errMatch[1] ? errMatch[1].trim() : 'Authentication failed: Invalid credentials or login error';
		throw new Error(errMsg);
	}

	async ensureLoggedIn(): Promise<void> {
		if (!this.isLoggedIn) await this.login();
	}

	async studentInfo(): Promise<StudentInfo> {
		await this.ensureLoggedIn();
		const res = await this.request('/PXP2_Attendance.aspx');
		const html = await res.text();
		const attMatch = html.match(/PXP\.StudentAttendanceData\s*=\s*(\{[\s\S]*?\});/);
		if (attMatch && attMatch[1]) {
			try {
				const attData = JSON.parse(attMatch[1]);
				const details = attData.stuAttendanceDetails || {};
				return {
					'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
					'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
					_Type: 'Short',
					_ShowPhysicianAndDentistInfo: 'false',
					FormattedName: details.name || this.userID,
					PermID: parseInt(details.sisNumber || '0') || 0,
					Gender: '',
					Grade: 12,
					Photo: ''
				};
			} catch (e) {}
		}
		return {
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			_Type: 'Short',
			_ShowPhysicianAndDentistInfo: 'false',
			FormattedName: this.userID,
			PermID: 0,
			Gender: '',
			Grade: 12,
			Photo: ''
		};
	}

	async attendance(): Promise<Attendance> {
		await this.ensureLoggedIn();
		const res = await this.request('/PXP2_Attendance.aspx');
		const html = await res.text();
		return {
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			_Type: 'Attendance',
			_StartPeriod: '0',
			_EndPeriod: '6',
			_PeriodCount: '7',
			_SchoolName: '',
			Absences: { Absence: [] },
			TotalExcused: { PeriodTotal: [] },
			TotalTardies: { PeriodTotal: [] },
			TotalUnexcused: { PeriodTotal: [] },
			TotalActivities: { PeriodTotal: [] },
			TotalUnexcusedTardies: { PeriodTotal: [] },
			ConcurrentSchoolsLists: ''
		};
	}

	async gradebookXml(targetReportPeriodIndex?: number): Promise<string> {
		await this.ensureLoggedIn();
		const res = await this.request('/PXP2_Gradebook.aspx', {
			headers: { Referer: `https://${this.domain}/Home_PXP2.aspx` }
		});
		const html = await res.text();

		const gbFocusMatch = html.match(/PXP\.GBFocusData\s*=\s*(\{[\s\S]*?\});/);
		if (!gbFocusMatch || !gbFocusMatch[1]) throw new Error('Could not parse Gradebook focus data from portal');
		const gbFocusData = JSON.parse(gbFocusMatch[1]);

		this.agu = html.match(/PXP\.AGU\s*=\s*['"]([^'"]+)['"]/)?.[1] || '';

		const gradingPeriodsList = gbFocusData.GradingPeriods || [];
		let currentPeriodIndex = 0;
		const reportPeriodsXmlList: ReportPeriod[] = gradingPeriodsList.map((gp: any, idx: number) => {
			if (gp.defaultFocus) currentPeriodIndex = idx;
			return {
				_Index: String(idx),
				_GradePeriod: gp.Name,
				_StartDate: '',
				_EndDate: ''
			};
		});

		const activeIndex =
			targetReportPeriodIndex !== undefined ? targetReportPeriodIndex : currentPeriodIndex;
		const activePeriod = reportPeriodsXmlList[activeIndex] || reportPeriodsXmlList[0] || {
			_Index: '0',
			_GradePeriod: 'Current Period',
			_StartDate: '',
			_EndDate: ''
		};

		// Parse recent assignment rows from overview page
		const recentAssignmentsByClass = new Map<number, any[]>();
		const rowMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
		for (const m of rowMatches) {
			const rowHtml = m[1] ?? '';
			if (rowHtml.includes('Gradebook_AssignmentDetails')) {
				const focusMatch = rowHtml.match(/data-focus='([^']+)'/);
				if (focusMatch && focusMatch[1]) {
					try {
						const focusObj = JSON.parse(focusMatch[1]);
						const classID = focusObj.FocusArgs.classID;
						const assignmentID = String(focusObj.FocusArgs.assignmentID);

						const text = rowHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
						const { title, dueDate, score, point, pointPossible } = parseRecentRowText(text);

						if (!recentAssignmentsByClass.has(classID)) recentAssignmentsByClass.set(classID, []);
						recentAssignmentsByClass.get(classID)!.push({
							_GradebookID: assignmentID,
							_Measure: title,
							_Type: 'Assignment',
							_Date: dueDate,
							_DueDate: dueDate,
							_Score: point,
							_DisplayScore: score,
							_ScoreType: 'Raw Score',
							_Points: score,
							_Point: point,
							_PointPossible: pointPossible,
							_TimeSincePost: '',
							_TotalSecondsSincePost: '0',
							_Notes: '',
							_TeacherID: String(focusObj.FocusArgs.teacherID),
							_StudentID: String(focusObj.FocusArgs.studentGU),
							_MeasureDescription: '',
							_HasDropBox: false,
							_DropStartDate: '',
							_DropEndDate: '',
							Resources: null,
							Standards: null
						});
					} catch (e) {}
				}
			}
		}

		// Parse course buttons
		const courseButtons = [
			...html.matchAll(
				/<button[^>]*class="[^"]*course-title[^"]*"[^>]*data-focus='([^']+)'[^>]*>([\s\S]*?)<\/button>/gi
			)
		];

		const courses: Course[] = [];

		for (let i = 0; i < courseButtons.length; i++) {
			const btn = courseButtons[i];
			if (!btn || !btn[1] || !btn[2]) continue;
			const focusObj = JSON.parse(btn[1]);
			const rawTitle = btn[2].replace(/<[^>]+>/g, ' ').trim();
			const controlName = focusObj.LoadParams?.ControlName;
			const focusArgs = focusObj.FocusArgs;

			let period = '0';
			let courseName = rawTitle;
			let courseId = String(focusArgs.classID);
			const titleMatch = rawTitle.match(/^(\d+):\s*(.*)$/);
			if (titleMatch && titleMatch[1] && titleMatch[2]) {
				period = titleMatch[1];
				courseName = titleMatch[2];
			}

			// Extract teacher name, room, and official grade & score from overview HTML block
			const startIdx = html.indexOf(btn[0]);
			const nextStartIdx =
				i + 1 < courseButtons.length && courseButtons[i + 1]?.[0]
					? html.indexOf(courseButtons[i + 1]![0])
					: html.indexOf('id="recent-assignments-panel"');
			const block = html.slice(startIdx, nextStartIdx !== -1 ? nextStartIdx : startIdx + 4000);

			const teacherMatch =
				block.match(/<div class="teacher hide-for-screen">([^<]+)<\/div>/i) ||
				block.match(/<span class="pxp-contact-info"[^>]*>([^<]+)<\/span>/i) ||
				block.match(/<span[^>]*class="[^"]*teacher[^"]*"[^>]*>([^<]+)<\/span>/i);
			const staff = teacherMatch && teacherMatch[1] ? teacherMatch[1].trim() : '';

			const roomMatch =
				block.match(/<div class="teacher-room[^"]*">Room:\s*([^<]+)<\/div>/i) ||
				block.match(/Room:\s*([^\s<&]+)/i);
			const room = roomMatch && roomMatch[1] ? roomMatch[1].trim() : '';

			const mailMatch = block.match(/href="mailto:([^"]+)"/i);
			const staffEmail = mailMatch && mailMatch[1] ? mailMatch[1].trim() : '';

			const markMatch =
				block.match(/<span class="mark">([^<]+)<\/span>/i) ||
				block.match(/class="[^"]*mark[^"]*"[^>]*>([^<]+)</i);
			const scoreMatch =
				block.match(/<span class="score">([^<]+)<\/span>/i) ||
				block.match(/class="[^"]*score[^"]*"[^>]*>([^<]+)</i);

			let calcScoreStr = markMatch && markMatch[1] ? markMatch[1].trim() : 'N/A';
			let scoreText = scoreMatch && scoreMatch[1] ? scoreMatch[1].replace('%', '').trim() : '0';
			let calcScoreRaw = scoreText === 'N/A' || isNaN(parseFloat(scoreText)) ? '0' : scoreText;

			// LoadControl
			const controlRes = await this.request('/service/PXP2Communication.asmx/LoadControl', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					AGU: this.agu,
					Referer: `https://${this.domain}/PXP2_Gradebook.aspx`
				},
				body: JSON.stringify({
					request: {
						control: controlName,
						parameters: focusArgs
					}
				})
			});
			const controlJson = (await (controlRes as any).json()) as any;
			const controlHtml = controlJson.d?.Data?.html || '';
			const focusKey = controlJson.d?.FOCUS_KEY || '';

			let assignments: any[] = [];

			if (controlName === 'Gradebook_RichContentClassDetails') {
				const action = 'pxp.course.content.items-LoadWithOptions';
				const itemsRes = await this.request(
					`/api/GB/ClientSideData/Transfer?action=${encodeURIComponent(action)}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json; charset=utf-8',
							CURRENT_WEB_PORTAL: 'StudentVUE',
							FOCUS_KEY: focusKey,
							Referer: `https://${this.domain}/PXP2_Gradebook.aspx`
						},
						body: JSON.stringify({
							FriendlyName: 'pxp.course.content.items',
							Method: 'LoadWithOptions',
							Parameters: JSON.stringify({
								loadOptions: { filter: [], group: [], paginate: false, requireTotalCount: true },
								clientState: {}
							})
						})
					}
				);
				const itemsJson = (await (itemsRes as any).json()) as any;
				const rawItems = itemsJson.responseData?.data || [];
				assignments = rawItems.map((item: any) => ({
					_GradebookID: String(item.itemID || item.id),
					_Measure: item.title || '',
					_Type: item.assignmentType || item.unit || '',
					_Date: item.date || '',
					_DueDate: item.due_date || '',
					_Score: item.gradeMark ? String(item.gradeMark) : undefined,
					_DisplayScore: `${item.gradeMark} out of ${item.pointsPossible}`,
					_ScoreCalValue: item.calcValue ? String(item.calcValue) : undefined,
					_ScoreMaxValue: item.pointsPossible ? String(item.pointsPossible) : undefined,
					_ScoreType: 'Raw Score',
					_Points: `${item.points || item.gradeMark}/${item.pointsPossible}`,
					_Point: item.gradeMark ? String(item.gradeMark) : undefined,
					_PointPossible: item.pointsPossible ? String(item.pointsPossible) : undefined,
					_TimeSincePost: '',
					_TotalSecondsSincePost: '0',
					_Notes: item.publicNote || '',
					_TeacherID: String(focusArgs.teacherID),
					_StudentID: String(focusArgs.studentGU),
					_MeasureDescription: '',
					_HasDropBox: false,
					_DropStartDate: '',
					_DropEndDate: '',
					Resources: null,
					Standards: null
				}));
			} else if (controlName === 'Gradebook_ClassDetails') {
				const dsMatch = controlHtml.match(
					/"dataSource":\s*(\[[\s\S]*?\])(?:,\s*"noDataText"|\}\)\))/
				);
				if (dsMatch && dsMatch[1]) {
					try {
						const rawList = JSON.parse(dsMatch[1]);
						assignments = rawList.map((item: any) => {
							const assignmentVal =
								typeof item.GBAssignment === 'string' && item.GBAssignment.startsWith('{')
									? JSON.parse(item.GBAssignment).value
									: item.GBAssignment;
							const scoreVal =
								typeof item.GBScore === 'string' && item.GBScore.startsWith('{')
									? JSON.parse(item.GBScore).value
									: item.GBScore;
							return {
								_GradebookID: String(item.gradeBookId || item.id),
								_Measure: assignmentVal || '',
								_Type: item.GBAssignmentType || '',
								_Date: item.Date || '',
								_DueDate: item.Date || '',
								_Score: scoreVal || undefined,
								_DisplayScore: scoreVal || '',
								_ScoreType: item.GBScoreType || 'Raw Score',
								_Points: item.GBPoints || '',
								_Point: scoreVal ? scoreVal.split(' ')[0] : undefined,
								_PointPossible: item.GBPoints ? item.GBPoints.split('/')[1] : undefined,
								_TimeSincePost: '',
								_TotalSecondsSincePost: '0',
								_Notes: item.GBNotes || '',
								_TeacherID: String(focusArgs.teacherID),
								_StudentID: String(focusArgs.studentGU),
								_MeasureDescription: '',
								_HasDropBox: Boolean(item.GBDropBox),
								_DropStartDate: '',
								_DropEndDate: '',
								Resources: null,
								Standards: null
							};
						});
					} catch (e) {
						console.error('Failed to parse dataSource JSON:', e);
					}
				}

				const gradeMatch = controlHtml.match(
					/<div id="current-grade">[\s\S]*?<div class="mark">([^<]+)<\/div>[\s\S]*?<div class="score">([^<]+)<\/div>/
				);
				if (gradeMatch && gradeMatch[1] && gradeMatch[2]) {
					calcScoreStr = gradeMatch[1].trim();
					calcScoreRaw = gradeMatch[2].replace('%', '').trim();
				}
			}

			if (assignments.length === 0 && recentAssignmentsByClass.has(focusArgs.classID)) {
				assignments = recentAssignmentsByClass.get(focusArgs.classID)!;
			}

			courses.push({
				_Period: period,
				_Title: `${courseName} (${courseId})`,
				_CourseName: courseName,
				_CourseID: courseId,
				_Room: room,
				_Staff: staff,
				_StaffEMail: staffEmail,
				_StaffGU: '',
				_ImageType: 'science',
				_HighlightPercentageCutOffForProgressBar: '50',
				_UsesRichContent: controlName === 'Gradebook_RichContentClassDetails',
				Marks: {
					Mark: [
						{
							_MarkName: activePeriod._GradePeriod,
							_ShortMarkName: activePeriod._GradePeriod,
							_CalculatedScoreString: calcScoreStr,
							_CalculatedScoreRaw: calcScoreRaw,
							StandardViews: null,
							GradeCalculationSummary: null,
							Assignments: {
								Assignment: assignments
							},
							AssignmentsSinceLastAccess: null
						}
					]
				}
			});
		}

		const resultObj: GradebookResult = {
			Gradebook: {
				'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
				'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
				_Type: 'Traditional',
				_ErrorMessage: '',
				_HideStandardGraphInd: false,
				_HideMarksColumnElementary: false,
				_HidePointsColumnElementary: false,
				_HidePercentSecondary: false,
				_DisplayStandardsData: false,
				_GBStandardsTabDefault: false,
				ReportingPeriods: {
					ReportPeriod: reportPeriodsXmlList
				},
				ReportingPeriod: activePeriod,
				Courses: {
					Course: courses
				}
			}
		};

		return builder.build(resultObj);
	}
}

async function fetchSoap(
	operation: Operation,
	methodName: MethodName,
	{ domain, userID, password, syfetchUrl }: Credentials,
	params: Record<string, unknown> = {}
) {
	const url = `https://${domain}/Service/PXPCommunication.asmx`;
	const body = builder.build({
		'soap12:Envelope': {
			'_xmlns:soap12': 'http://www.w3.org/2003/05/soap-envelope',
			'soap12:Body': {
				[operation]: {
					_xmlns: 'http://edupoint.com/webservices/',
					userID,
					password,
					skipLoginLog: true,
					parent: false,
					webServiceHandleName: 'PXPWebServices',
					methodName,
					paramStr: builder.build({ Params: params })
				}
			}
		}
	});

	const fetchFn =
		domain === demoMockDomain
			? fetch
			: (u: string, init?: RequestInit) => syfetch(u, init, syfetchUrl);

	const res = await fetchFn(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
		body
	});

	if (res.status !== 200) throw new Error(`HTTP ${res.status} when requesting ${operation}`);

	return res;
}

async function soapRequest<T>(
	operation: Operation,
	methodName: MethodName,
	credentials: Credentials,
	params: Record<string, unknown> = {}
) {
	const res = await fetchSoap(operation, methodName, credentials, params);

	const envelopeStr = await res.text();

	const resultStr = unwrapEnvelope(envelopeStr, operation);

	return parseResult<T>(resultStr);
}

const webServiceRequest = <T>(
	methodName: MethodName,
	credentials: Credentials,
	params: Record<string, unknown> = {}
) => soapRequest<T>(Operation.Request, methodName, credentials, params);

const webServiceRequestMultiWeb = <T>(
	methodName: MethodName,
	credentials: Credentials,
	params: Record<string, unknown> = {}
) => soapRequest<T>(Operation.RequestMultiWeb, methodName, credentials, params);

export const parseGradebookXML = (resultStr: string) =>
	convertEmptyElementToNull(parseResult<GradebookResult>(resultStr).Gradebook);

export class StudentAccount {
	domain: string;
	userID: string;
	password: string;
	syfetchUrl?: string;
	portalSession: PortalSession;

	constructor(domain: string, userID: string, password: string, syfetchUrl?: string) {
		this.domain = domain;
		this.userID = userID;
		this.password = password;
		this.syfetchUrl = syfetchUrl;
		this.portalSession = new PortalSession(domain, userID, password, syfetchUrl);
	}

	get credentials(): Credentials {
		return {
			domain: this.domain,
			userID: this.userID,
			password: this.password,
			syfetchUrl: this.syfetchUrl
		};
	}

	async checkLogin() {
		if (this.domain === demoMockDomain) {
			await webServiceRequest<StudentInfoResult>('StudentInfo', this.credentials);
		} else {
			await this.portalSession.login();
		}
	}

	async gradebookRequest(reportPeriod?: number): Promise<{ text: () => Promise<string> }> {
		if (this.domain === demoMockDomain) {
			const params = reportPeriod ? { ReportPeriod: reportPeriod } : undefined;
			return await fetchSoap(Operation.Request, MethodName.Gradebook, this.credentials, params);
		}

		const rawXml = await this.portalSession.gradebookXml(reportPeriod);
		const envelopeXml = wrapEnvelope(rawXml, Operation.Request);
		return {
			text: async () => envelopeXml
		};
	}

	async attendance(): Promise<Attendance> {
		if (this.domain === demoMockDomain) {
			return (await webServiceRequest<AttendanceResult>(MethodName.Attendance, this.credentials))
				.Attendance;
		}
		return await this.portalSession.attendance();
	}

	async studentInfo(): Promise<StudentInfo> {
		if (this.domain === demoMockDomain) {
			return (await webServiceRequest<StudentInfoResult>(MethodName.StudentInfo, this.credentials))
				.StudentInfo;
		}
		return await this.portalSession.studentInfo();
	}

	async documents(): Promise<Documents> {
		if (this.domain === demoMockDomain) {
			return (await webServiceRequest<DocumentsResult>(MethodName.Documents, this.credentials))
				.StudentDocuments;
		}
		return {
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			_showDateColumn: '',
			_showDocNameColumn: '',
			_showDocCatColumn: '',
			_StudentGU: '',
			_StudentSSY: '',
			StudentDocumentDatas: { StudentDocumentData: [] }
		};
	}

	async reportCard(documentGU: string): Promise<ReportCard | ReportCardNotFound> {
		if (this.domain === demoMockDomain) {
			return (
				await webServiceRequest<ReportCardResult>(MethodName.ReportCard, this.credentials, {
					DocumentGU: documentGU
				})
			).DocumentData;
		}
		return {
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			Base64Code: '',
			_DocumentGU: documentGU,
			_FileName: '',
			_DocFileName: '',
			_DocType: ''
		};
	}

	async mailData(): Promise<MailData> {
		if (this.domain === demoMockDomain) {
			return (await webServiceRequest<MailResult>(MethodName.Mail, this.credentials))
				.SynergyMailDataXML;
		}
		return {
			FolderListViews: { FolderListViewXML: [] },
			InboxItemListings: { MessageXML: [] },
			SentItemListings: { MessageXML: [] },
			DraftItemListings: { MessageXML: [] },
			ArchiveItemListings: '',
			OutboxItemListings: '',
			AllOtherFolderMessages: '',
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			_PersonGU: '',
			_NewSignature: '',
			_ReplySignature: '',
			_EnableForwarding: '',
			_emailAddresses: '',
			_ParentRecipientAccessValue: '',
			_StudentRecipientAccessValue: '',
			_StaffRecipientAccessValue: '',
			_UserGroupsTabAllowed: '',
			_MassEmailTabAllowed: '',
			_StudentGroupsTabAllowed: '',
			_ContactListsTabAllowed: '',
			_StaffTabAllowed: '',
			_ParentsTabAllowed: '',
			_StudentsTabAllowed: '',
			_ClassesTabAllowed: '',
			_TeachersTabAllowed: '',
			_CounselorsTabAllowed: '',
			_ShowBCC: '',
			_SynergyMailForwardingEnabled: '',
			_SM_CheckUnreadMessagesTimeout: '',
			_SM_MaxAttachmentSizeMB: '',
			_SM_JobTitleColumnVisible: '',
			_SM_TypeColumnVisible: '',
			_SM_ContactLogOption: '',
			_SM_SupportingClassesDropDown: '',
			_SM_SupportingMessageSubjectAsElement: ''
		};
	}

	async attachment(attachmentGU: string): Promise<Attachment> {
		if (this.domain === demoMockDomain) {
			return (
				await webServiceRequest<AttachmentResult>(MethodName.Attachment, this.credentials, {
					SmAttachmentGU: attachmentGU
				})
			).AttachmentXML;
		}
		return {
			'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
			'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
			Base64Code: '',
			_SmAttachmentGU: attachmentGU,
			_DocumentName: ''
		};
	}

	async getAuthToken(): Promise<AuthToken> {
		if (this.domain === demoMockDomain) {
			return (
				await webServiceRequestMultiWeb<AuthTokenResult>('GenerateAuthToken', this.credentials, {
					Username: this.userID,
					TokenForClassWebSite: true,
					Usertype: 0,
					IsParentStudent: 0,
					DataString: '',
					DocumentID: 1,
					AssignmentID: 1
				})
			).AuthToken;
		}
		return {
			_EncyToken: ''
		};
	}
}
