import type { Attachment } from '$lib/types/Attachment';
import type { Attendance } from '$lib/types/Attendance';
import type { AuthToken } from '$lib/types/AuthToken';
import type { Documents } from '$lib/types/Documents';
import type { Gradebook } from '$lib/types/Gradebook';
import type { MailData } from '$lib/types/MailData';
import type { ReportCard } from '$lib/types/ReportCard';
import type { StudentInfo } from '$lib/types/StudentInfo';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const alwaysArray = [
	'Gradebook.Courses.Course',
	'Gradebook.Courses.Course.Marks.Mark.Assignments.Assignment',
	'Gradebook.ReportingPeriods.ReportPeriod',
	'Attendance.Absences.Absence'
];

const envelopeParser = new XMLParser({ ignoreDeclaration: true });

const resultParser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
	attributeNamePrefix: '_',
	isArray: (_name, jpath) => alwaysArray.includes(jpath)
});

const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '_' });

export class StudentAccount {
	domain: string;
	userID: string;
	password: string;

	constructor(domain: string, userID: string, password: string) {
		this.domain = domain;
		this.userID = userID;
		this.password = password;
	}

	async soapRequest(operation: string, methodName: string, params: Record<string, unknown> = {}) {
		const res = await fetch(`https://${this.domain}/Service/PXPCommunication.asmx`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
			body: builder.build({
				'soap12:Envelope': {
					'_xmlns:soap12': 'http://www.w3.org/2003/05/soap-envelope',
					'soap12:Body': {
						[operation]: {
							_xmlns: 'http://edupoint.com/webservices/',
							userID: this.userID,
							password: this.password,
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

		const envelopeStr = await res.text();

		const envelope = envelopeParser.parse(envelopeStr);

		const resultStr =
			envelope['soap:Envelope']['soap:Body'][`${operation}Response`][`${operation}Result`];

		const result = resultParser.parse(resultStr);

		if (result.RT_ERROR) throw new Error(result.RT_ERROR._ERROR_MESSAGE);

		return result;
	}

	request(methodName: string, params: Record<string, unknown> = {}) {
		return this.soapRequest('ProcessWebServiceRequest', methodName, params);
	}

	requestMultiWeb(methodName: string, params: Record<string, unknown> = {}) {
		return this.soapRequest('ProcessWebServiceRequestMultiWeb', methodName, params);
	}

	async checkLogin() {
		await this.request('StudentInfo');
	}

	async getAuthToken(): Promise<AuthToken> {
		return (
			await this.requestMultiWeb('GenerateAuthToken', {
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

	async gradebook(reportPeriod?: number): Promise<Gradebook> {
		if (reportPeriod) {
			// May return current reporting period instead of the one requested if the one requested cannot be found

			return (await this.request('Gradebook', { ReportPeriod: reportPeriod })).Gradebook;
		}

		return (await this.request('Gradebook')).Gradebook;
	}

	async attendance(): Promise<Attendance> {
		return (await this.request('Attendance')).Attendance;
	}

	async studentInfo(): Promise<StudentInfo> {
		return (await this.request('StudentInfo')).StudentInfo;
	}

	async documents(): Promise<Documents> {
		return (await this.request('GetStudentDocumentInitialData')).StudentDocuments;
	}

	async reportCard(documentGU: string): Promise<ReportCard> {
		return (await this.request('GetReportCardDocumentData', { DocumentGU: documentGU }))
			.DocumentData;
	}

	async mailData(): Promise<MailData> {
		return (await this.request('SynergyMailGetData')).SynergyMailDataXML;
	}

	async attachment(attachmentGU: string): Promise<Attachment> {
		return (await this.request('SynergyMailGetAttachment', { SmAttachmentGU: attachmentGU }))
			.AttachmentXML;
	}
}
