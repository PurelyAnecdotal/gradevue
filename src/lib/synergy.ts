import type { AttachmentResult } from '$lib/types/Attachment';
import type { AttendanceResult } from '$lib/types/Attendance';
import type { AuthTokenResult } from '$lib/types/AuthToken';
import type { DocumentsResult } from '$lib/types/Documents';
import type { MailResult } from '$lib/types/MailData';
import type { StudentInfoResult } from '$lib/types/StudentInfo';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import type { GradebookResult } from './types/Gradebook';
import type { ReportCardResult } from './types/ReportCard';

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
	'StudentDocuments.StudentDocumentDatas.StudentDocumentData'
];

const envelopeParser = new XMLParser({ ignoreDeclaration: true });

const resultParser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
	attributeNamePrefix: '_',
	isArray: (_name, jpath) => alwaysArray.includes(jpath),
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
}

async function fetchSoap(
	operation: Operation,
	methodName: MethodName,
	{ domain, userID, password }: Credentials,
	params: Record<string, unknown> = {}
) {
	const res = await fetch(`https://${domain}/Service/PXPCommunication.asmx`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
		body: builder.build({
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
		})
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

export type AccountMode = 'soap' | 'pxp2';

function pxp2Unavailable(feature: string): Error {
	return new Error(`${feature} is not available with the companion extension yet`);
}

export class StudentAccount {
	domain: string;
	userID: string;
	password: string;
	mode: AccountMode;

	constructor(domain: string, userID: string, password: string, mode: AccountMode = 'soap') {
		this.domain = domain;
		this.userID = userID;
		this.password = password;
		this.mode = mode;
	}

	static fromPxp2(domain: string) {
		return new StudentAccount(domain, '', '', 'pxp2');
	}

	get credentials(): Credentials {
		return {
			domain: this.domain,
			userID: this.userID,
			password: this.password
		};
	}

	async checkLogin() {
		if (this.mode === 'pxp2') {
			const { bridgeRequest } = await import('$lib/bridge');
			await bridgeRequest({ type: 'beginLogin', domain: this.domain }, 6 * 60 * 1000);
			return;
		}

		await webServiceRequest<StudentInfoResult>('StudentInfo', this.credentials);
	}

	async fetchPxp2Gradebook(reportPeriod?: number) {
		const { bridgeRequest } = await import('$lib/bridge');
		return await bridgeRequest<import('$lib/types/Gradebook').Gradebook>({
			type: 'gradebook',
			domain: this.domain,
			reportPeriod
		});
	}

	async gradebookRequest(reportPeriod?: number) {
		if (this.mode === 'pxp2') throw pxp2Unavailable('SOAP gradebook');

		// When a specific report period is requested, if it is not available Synergy returns the current report period
		const params = reportPeriod !== undefined ? { ReportPeriod: reportPeriod } : undefined;

		return await fetchSoap(Operation.Request, MethodName.Gradebook, this.credentials, params);
	}

	async attendance() {
		if (this.mode === 'pxp2') throw pxp2Unavailable('Attendance');

		return (await webServiceRequest<AttendanceResult>(MethodName.Attendance, this.credentials))
			.Attendance;
	}

	async studentInfo() {
		if (this.mode === 'pxp2') {
			const { bridgeRequest } = await import('$lib/bridge');
			const info = await bridgeRequest<import('$lib/pxp2/protocol').Pxp2StudentInfo>({
				type: 'studentInfo',
				domain: this.domain
			});

			return {
				FormattedName: info.name,
				PermID: Number.parseInt(info.sisNumber, 10) || 0,
				Gender: '',
				Grade: 0,
				Photo: '',
				'_xmlns:xsd': '',
				'_xmlns:xsi': '',
				_Type: '',
				_ShowPhysicianAndDentistInfo: 'false'
			};
		}

		return (await webServiceRequest<StudentInfoResult>(MethodName.StudentInfo, this.credentials))
			.StudentInfo;
	}

	async documents() {
		if (this.mode === 'pxp2') throw pxp2Unavailable('Documents');

		return (await webServiceRequest<DocumentsResult>(MethodName.Documents, this.credentials))
			.StudentDocuments;
	}

	async reportCard(documentGU: string) {
		if (this.mode === 'pxp2') throw pxp2Unavailable('Report cards');

		return (
			await webServiceRequest<ReportCardResult>(MethodName.ReportCard, this.credentials, {
				DocumentGU: documentGU
			})
		).DocumentData;
	}

	async mailData() {
		if (this.mode === 'pxp2') throw pxp2Unavailable('Mail');

		return (await webServiceRequest<MailResult>(MethodName.Mail, this.credentials))
			.SynergyMailDataXML;
	}

	async attachment(attachmentGU: string) {
		if (this.mode === 'pxp2') throw pxp2Unavailable('Mail attachments');

		return (
			await webServiceRequest<AttachmentResult>(MethodName.Attachment, this.credentials, {
				SmAttachmentGU: attachmentGU
			})
		).AttachmentXML;
	}

	async getAuthToken() {
		if (this.mode === 'pxp2') throw pxp2Unavailable('Auth tokens');

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
}
