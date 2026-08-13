import { normalizeDomain } from '$lib/pxp2/domain';
import {
	extractAssignmentNames,
	extractCourseChrome,
	extractFocusArgsForCourse,
	extractGbFocusData
} from '$lib/pxp2/parse';
import { isAllowedStudentVuePath } from '$lib/pxp2/paths';
import { expect, test } from 'bun:test';

const gradebookHtml = `
<script>
PXP.GBFocusData = {"GradingPeriods":[{"Name":"Quarter 1","GroupName":"Q1","GU":"abc","OrgYearGU":"oy","schoolID":9,"defaultFocus":true}]};
</script>
<div data-guid="101">
  <div class="teacher-room">Room: B12</div>
  <span class="mark">A</span>
  <span class="score">92.5%</span>
  <button data-focus="{&quot;FocusArgs&quot;:{&quot;classID&quot;:101,&quot;AGU&quot;:0}}">Open</button>
</div>
`;

const classDetailsHtml = `
<div class="dx-datagrid">
foo.dxDataGrid(PXP.DevExpress.ExtendGridConfiguration({"dataSource":[{"gradeBookId":"9001","GBAssignment":"{\\"value\\":\\"HW 1.1\\"}"},{"gradeBookId":9002,"GBAssignment":"{\\"value\\":\\"Unit 1 Test\\"}"}]}));
</div>
`;

test('extracts grading periods from gradebook HTML', () => {
	const focus = extractGbFocusData(gradebookHtml);
	expect(focus.GradingPeriods[0]?.Name).toBe('Quarter 1');
	expect(focus.GradingPeriods[0]?.defaultFocus).toBe(true);
});

test('extracts focus args, room, and marks for a course', () => {
	expect(extractFocusArgsForCourse(gradebookHtml, 101)).toEqual({ classID: 101, AGU: 0 });
	expect(extractCourseChrome(gradebookHtml, 101)).toEqual({
		room: 'B12',
		markPreview: 'A',
		scorePreview: '92.5%'
	});
});

test('extracts assignment names from class details HTML', () => {
	expect(extractAssignmentNames(classDetailsHtml)).toEqual({
		9001: 'HW 1.1',
		9002: 'Unit 1 Test'
	});
});

test('allowlists only StudentVUE gradebook paths', () => {
	expect(isAllowedStudentVuePath('/PXP2_GradeBook.aspx?AGU=0')).toBe(true);
	expect(isAllowedStudentVuePath('/service/PXP2Communication.asmx/LoadControl')).toBe(true);
	expect(isAllowedStudentVuePath('/Service/PXPCommunication.asmx')).toBe(false);
	expect(isAllowedStudentVuePath('https://evil.example/PXP2_GradeBook.aspx')).toBe(false);
});

test('normalizes pasted portal URLs to a hostname', () => {
	expect(normalizeDomain('https://ca-pleas-psv.edupoint.com/Home_PXP2.aspx')).toBe(
		'ca-pleas-psv.edupoint.com'
	);
	expect(normalizeDomain('ca-pleas-psv.edupoint.com')).toBe('ca-pleas-psv.edupoint.com');
});
