import { XMLParser } from 'fast-xml-parser';
import { http, HttpResponse } from 'msw';
import attachment from './data/attachment.xml?raw';
import attendance from './data/attendance.xml?raw';
import document from './data/document.xml?raw';
import documents from './data/documents.xml?raw';
import gradebook from './data/gradebook.xml?raw';
import mail from './data/mail.xml?raw';
import studentInfo from './data/studentinfo.xml?raw';

const xmlParser = new XMLParser();

const soapHeaders = new Headers({
	'Content-Type': 'application/soap+xml; charset=utf-8',
	Mocked: 'true'
});

export const handlers = [
	http.post(
		'https://ca-pleas-psv.edupoint.com/Service/PXPCommunication.asmx',
		async ({ request }) => {
			const body = await request.text();

			const xml = xmlParser.parse(body);

			const methodName = xml['soap12:Envelope']['soap12:Body'].ProcessWebServiceRequest.methodName;

			switch (methodName) {
				case 'Gradebook':
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
