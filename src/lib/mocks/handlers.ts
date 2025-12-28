import { env } from '$env/dynamic/public';
import { XMLParser } from 'fast-xml-parser';
import { http, HttpResponse } from 'msw';

let attachment: string;
let attendance: string;
let document: string;
let documents: string;
let gradebook: string;
let mail: string;
let studentInfo: string;

if (import.meta.env.DEV) {
	const [
		attachmentModule,
		attendanceModule,
		documentModule,
		documentsModule,
		gradebookModule,
		mailModule,
		studentInfoModule
	] = await Promise.all([
		import('./data/attachment.xml?raw'),
		import('./data/attendance.xml?raw'),
		import('./data/document.xml?raw'),
		import('./data/documents.xml?raw'),
		import('./data/gradebook.xml?raw'),
		import('./data/mail.xml?raw'),
		import('./data/studentinfo.xml?raw')
	]);

	attachment = attachmentModule.default;
	attendance = attendanceModule.default;
	document = documentModule.default;
	documents = documentsModule.default;
	gradebook = gradebookModule.default;
	mail = mailModule.default;
	studentInfo = studentInfoModule.default;
}

const xmlParser = new XMLParser();

const soapHeaders = new Headers({
	'Content-Type': 'application/soap+xml; charset=utf-8',
	Mocked: 'true'
});

export const handlers = [
	http.post(
		`${env.PUBLIC_MOCK_STUDENTVUE_ORIGIN}/Service/PXPCommunication.asmx`,
		async ({ request }) => {
			const body = await request.text();

			const xml = xmlParser.parse(body);

			const soapRequest = xml['soap12:Envelope']['soap12:Body'].ProcessWebServiceRequest;

			const { methodName } = soapRequest;

			const { paramStr } = soapRequest;
			const params: Record<string, any> = xmlParser.parse(paramStr).Params;

			switch (methodName) {
				case 'Gradebook':
					const reportPeriod = params.ReportPeriod;
					return HttpResponse.xml(gradebook, { headers: soapHeaders });
				case 'Attendance':
					return HttpResponse.xml(attendance, { headers: soapHeaders });
				case 'GetStudentDocumentInitialData':
					return HttpResponse.xml(documents, { headers: soapHeaders });
				case 'GetReportCardDocumentData':
					return HttpResponse.xml(document, { headers: soapHeaders });
				case 'SynergyMailGetData':
					return HttpResponse.xml(mail, { headers: soapHeaders });
				case 'SynergyMailGetAttachment':
					return HttpResponse.xml(attachment, { headers: soapHeaders });
				case 'StudentInfo':
					return HttpResponse.xml(studentInfo, { headers: soapHeaders });
				default:
					return HttpResponse.text(`${methodName} methodName not yet mocked`, { status: 500 });
			}
		}
	)
];
