import { XMLParser } from 'fast-xml-parser';
import type { Gradebook } from '$lib/Gradebook';
import type { Attendance } from './Attendance';

const parser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
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

	async request(methodName: string, paramStr = '&lt;Parms&gt;&lt;/Parms&gt;') {
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

	async grades(): Promise<Gradebook> {
		return (await this.request('Gradebook')).Gradebook;
	}

	async attendance(): Promise<Attendance> {
		return (await this.request('Attendance')).Attendance;
	}
}
