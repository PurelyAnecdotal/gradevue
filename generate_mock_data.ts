#!/usr/bin/env bun

import { XMLParser } from 'fast-xml-parser';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as readline from 'node:readline';

async function prompt(question: string): Promise<string> {
	const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

const parser = new XMLParser({
	ignoreAttributes: false,
	ignoreDeclaration: true,
	attributeNamePrefix: '_'
});

async function soapRequest(
	domain: string,
	userID: string,
	password: string,
	methodName: string,
	params: Map<string, unknown> = new Map()
): Promise<string> {
	let paramStr = '<Params>';
	params.forEach((value, key) => {
		paramStr += `<${key}>${value}</${key}>`;
	});
	paramStr += '</Params>';
	paramStr = paramStr.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

	const body = `<?xml version="1.0" encoding="utf-8"?>
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
            <ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
                <userID>${userID}</userID>
                <password>${password}</password>
                <skipLoginLog>true</skipLoginLog>
                <parent>false</parent>
                <webServiceHandleName>PXPWebServices</webServiceHandleName>
                <methodName>${methodName}</methodName>
                <paramStr>${paramStr}</paramStr>
            </ProcessWebServiceRequest>
        </soap12:Body>
    </soap12:Envelope>`;

	const res = await fetch(`https://${domain}/Service/PXPCommunication.asmx`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
		body
	});

	if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

	const responseText = await res.text();

	try {
		const parsed = parser.parse(responseText);
		const result =
			parsed['soap:Envelope']['soap:Body']['ProcessWebServiceRequestResponse'][
				'ProcessWebServiceRequestResult'
			];

		const innerParsed = parser.parse(result);
		if (innerParsed.RT_ERROR) throw new Error(innerParsed.RT_ERROR._ERROR_MESSAGE);
	} catch (e) {
		if (
			e instanceof Error &&
			e.message !== "Cannot read properties of undefined (reading '_ERROR_MESSAGE')"
		)
			throw e;
	}

	return responseText;
}

async function generateMethodMockData(
	methodName: string,
	fileName: string,
	params: Map<string, unknown> = new Map()
) {
	try {
		const response = await soapRequest(domain, username, password, methodName, params);

		const outputPath = path.join(process.cwd(), 'src', 'lib', 'mocks', 'data', fileName);
		await fs.writeFile(outputPath, response, 'utf-8');

		console.log(`Saved ${fileName}`);
	} catch (error) {
		console.error(`Failed to fetch ${methodName}:`, error instanceof Error ? error.message : error);
	}
}

const domain = process.env.STUDENTVUE_DOMAIN ?? (await prompt('StudentVUE Domain: '));
const username = process.env.STUDENTVUE_USERNAME ?? (await prompt('StudentVUE Username: '));
const password = process.env.STUDENTVUE_PASSWORD ?? (await prompt('StudentVUE Password: '));

console.log(`Connecting to ${domain} as ${username}\n`);

const outputDir = path.join(process.cwd(), 'src', 'lib', 'mocks', 'data');
if (!(await fs.exists(outputDir))) await fs.mkdir(outputDir, { recursive: true });

const resources: [string, string][] = [
	['Gradebook', 'gradebook.xml'],
	['Attendance', 'attendance.xml'],
	['GetStudentDocumentInitialData', 'documents.xml'],
	['SynergyMailGetData', 'mail.xml'],
	['StudentInfo', 'studentinfo.xml']
];

await Promise.allSettled(
	resources.map(([methodName, fileName]) => generateMethodMockData(methodName, fileName))
);

console.log('\nMock data generation complete');
