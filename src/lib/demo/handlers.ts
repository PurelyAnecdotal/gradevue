import { Operation, wrapEnvelope } from '$lib/synergy';
import { XMLParser } from 'fast-xml-parser';
import { http, HttpResponse } from 'msw';
import { demoMockDomain } from './demo.svelte';

import attendanceXml from './data/Attendance.xml?raw';
import gradebookXml from './data/Gradebook.xml?raw';
import studentDocumentsXml from './data/StudentDocuments.xml?raw';
import studentInfoXml from './data/StudentInfo.xml?raw';
import synergyMailDataXml from './data/SynergyMailDataXML.xml?raw';

import attachmentXml from './data/attachments/AttachmentXML.xml?raw';
import analyticsDocumentDataXml from './data/documents/analytics_DocumentData.xml?raw';
import searchconsoleDocumentDataXml from './data/documents/searchconsole_DocumentData.xml?raw';

const xmlParser = new XMLParser();

const soapResponse = (xml: string) =>
	HttpResponse.xml(wrapEnvelope(xml, Operation.Request), {
		headers: new Headers({
			'Content-Type': 'application/soap+xml; charset=utf-8',
			Mocked: 'true'
		})
	});

export const handlers = [
	http.post(`https://${demoMockDomain}/Service/PXPCommunication.asmx`, async ({ request }) => {
		const body = await request.text();

		const soapRequest =
			xmlParser.parse(body)['soap12:Envelope']['soap12:Body'].ProcessWebServiceRequest;

		const { methodName, paramStr } = soapRequest;
		const params: Record<string, any> = xmlParser.parse(paramStr).Params;

		switch (methodName) {
			case 'Gradebook':
				const reportPeriod = params.ReportPeriod;
				return soapResponse(gradebookXml);

			case 'Attendance':
				return soapResponse(attendanceXml);

			case 'GetStudentDocumentInitialData':
				return soapResponse(studentDocumentsXml);

			case 'GetReportCardDocumentData':
				const documentGU = params.DocumentGU;
				switch (documentGU) {
					case '00000000-0000-0000-0000-63861389a803':
						return soapResponse(analyticsDocumentDataXml);
					case '00000000-0000-0000-0000-45b97a766e5c':
						return soapResponse(searchconsoleDocumentDataXml);
					default:
						return HttpResponse.text(`DocumentGU ${documentGU} not found`, { status: 404 });
				};

			case 'SynergyMailGetData':
				return soapResponse(synergyMailDataXml);

			case 'SynergyMailGetAttachment':
				return soapResponse(attachmentXml);

			case 'StudentInfo':
				return soapResponse(studentInfoXml);

			default:
				return HttpResponse.text(`${methodName} methodName not yet mocked`, { status: 500 });
		}
	})
];
