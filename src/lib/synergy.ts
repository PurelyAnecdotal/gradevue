import type { Attendance } from '$lib/Attendance';
import type { DocumentsList } from '$lib/DocumentsList';
import type { Gradebook } from '$lib/Gradebook';
import type { Message } from '$lib/Message';
import type { ReportCardDocument } from '$lib/ReportCardDocument';
import type { ReportCardListEntity } from '$lib/ReportCardListEntity';
import type { StudentInfo } from '$lib/StudentInfo';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

const alwaysArray = [
	'Gradebook.Courses.Course',
	'Gradebook.Courses.Course.Marks.Mark.Assignments.Assignment',
	'Gradebook.ReportingPeriods.ReportPeriod'
];

const parser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
	attributeNamePrefix: '_',
	isArray: (_name, jpath) => alwaysArray.includes(jpath)
});

const builder = new XMLBuilder({
	ignoreAttributes: false,
	attributeNamePrefix: '_'
});

export class StudentAccount {
	domain: string;
	userID: string;
	password: string;

	constructor(domain: string, userID: string, password: string) {
		this.domain = domain;
		this.userID = userID;
		this.password = password;
	}

	async request(methodName: string, params: unknown = {}) {
		const paramStr = builder
			.build({ Params: params })
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;');

		const res = await fetch(`https://${this.domain}/Service/PXPCommunication.asmx?WSDL`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
			body: `<?xml version="1.0" encoding="utf-8"?>
            <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
                <soap12:Body>
                    <ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
                        <userID>${this.userID}</userID>
                        <password>${this.password}</password>
                        <skipLoginLog>true</skipLoginLog>
                        <parent>false</parent>
                        <webServiceHandleName>PXPWebServices</webServiceHandleName>
                        <methodName>${methodName}</methodName>
                        <paramStr>${paramStr}</paramStr>
                    </ProcessWebServiceRequest>
                </soap12:Body>
            </soap12:Envelope>`
		});

		return parser.parse(
			parser.parse(await res.text())['soap:Envelope']['soap:Body'].ProcessWebServiceRequestResponse
				.ProcessWebServiceRequestResult
		);
	}

	async checkLogin() {
		const res = await this.request('StudentInfo');

		if (res.RT_ERROR) throw new Error(res.RT_ERROR._ERROR_MESSAGE);
	}

	async grades(reportPeriod?: number): Promise<Gradebook> {
		if (reportPeriod)
			return (await this.request('Gradebook', { ReportPeriod: reportPeriod })).Gradebook;

		return (await this.request('Gradebook')).Gradebook;
	}

	async attendance(): Promise<Attendance> {
		return (await this.request('Attendance')).Attendance;
	}

	async studentInfo(): Promise<StudentInfo> {
		return (await this.request('StudentInfo')).StudentInfo;
	}

	async reportCardList(): Promise<ReportCardListEntity[]> {
		return (await this.request('GetReportCardInitialData')).RCReportingPeriodData.RCReportingPeriods
			.RCReportingPeriod;
	}

	async reportCard(documentGU: string): Promise<ReportCardDocument> {
		return (
			await this.request('GetReportCardDocumentData', {
				DocumentGU: documentGU
			})
		).DocumentData;
	}

	async documentsList(): Promise<DocumentsList> {
		return (await this.request('GetStudentDocumentInitialData')).StudentDocuments;
	}

	async messages(): Promise<Message[]> {
		return (await this.request('GetPXPMessages')).PXPMessagesData.MessageListings.MessageListing;
	}
}
