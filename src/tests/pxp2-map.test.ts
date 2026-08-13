import { parseSynergyAssignment } from '$lib/grades/assignments';
import { mapGradebook } from '$lib/pxp2/mapGradebook';
import type { MapGradebookInput } from '$lib/pxp2/types';
import { expect, test } from 'bun:test';

const fixture: MapGradebookInput = {
	periods: [
		{
			Name: 'Quarter 1',
			GroupName: 'Q1',
			GU: 'gp-1',
			OrgYearGU: 'oy-1',
			schoolID: 1,
			defaultFocus: true
		},
		{
			Name: 'Quarter 2',
			GroupName: 'Q2',
			GU: 'gp-2',
			OrgYearGU: 'oy-1',
			schoolID: 1,
			defaultFocus: false
		}
	],
	activePeriod: {
		Name: 'Quarter 1',
		GroupName: 'Q1',
		GU: 'gp-1',
		OrgYearGU: 'oy-1',
		schoolID: 1,
		defaultFocus: true
	},
	activeIndex: 0,
	courses: [
		{
			metadata: {
				ID: 101,
				Name: 'Algebra 1',
				TeacherName: 'Ms. Rivera',
				room: 'B12',
				markPreview: 'A',
				scorePreview: '92.5%'
			},
			measureTypes: [
				{ id: 1, name: 'Homework', weight: 20 },
				{ id: 2, name: 'Tests', weight: 80 }
			],
			assignmentNames: { 9001: 'HW 1.1' },
			classData: {
				classId: 101,
				className: 'Algebra 1',
				assignments: [
					{
						category: 'Homework',
						commentCode: null,
						dueDate: '8/18/2025',
						excused: false,
						gradeBookCategoryId: 1,
						gradeBookId: 9001,
						isForGrading: true,
						maxScore: '10',
						measureTypeId: 1,
						score: '9',
						studentId: 42
					},
					{
						category: 'Tests',
						commentCode: null,
						dueDate: '8/25/2025',
						excused: false,
						gradeBookCategoryId: 2,
						gradeBookId: 9002,
						isForGrading: true,
						maxScore: '100',
						measureTypeId: 2,
						name: 'Unit 1 Test',
						score: '94',
						studentId: 42
					},
					{
						category: 'Homework',
						commentCode: null,
						dueDate: '8/26/2025',
						excused: false,
						gradeBookCategoryId: 1,
						gradeBookId: 9003,
						isForGrading: false,
						maxScore: '5',
						measureTypeId: 1,
						name: 'Practice',
						score: '5',
						studentId: 42
					}
				],
				classGrades: [
					{
						points: 103,
						pointsPossible: 110,
						calculatedMark: 'A',
						totalWeightedPercentage: 0.925
					}
				],
				measureTypeGrades: [
					{
						measureTypeId: 1,
						measureTypeWeight: 20,
						points: 9,
						pointsPossible: 10,
						calculatedMark: 'A'
					},
					{
						measureTypeId: 2,
						measureTypeWeight: 80,
						points: 94,
						pointsPossible: 100,
						calculatedMark: 'A'
					}
				]
			}
		}
	]
};

test('maps PXP2 JSON into the existing Gradebook shape', () => {
	const gradebook = mapGradebook(fixture);

	expect(gradebook.ReportingPeriods.ReportPeriod).toHaveLength(2);
	expect(gradebook.ReportingPeriod._GradePeriod).toBe('Quarter 1');
	expect(gradebook.ReportingPeriod._Index).toBe('0');

	const course = gradebook.Courses.Course[0];
	expect(course?._CourseName).toBe('Algebra 1');
	expect(course?._Staff).toBe('Ms. Rivera');
	expect(course?._Room).toBe('B12');

	const mark = course?.Marks?.Mark[0];
	expect(mark?._CalculatedScoreString).toBe('A');
	expect(mark?._CalculatedScoreRaw).toBe('92.5');
	expect(mark?.GradeCalculationSummary?.AssignmentGradeCalc).toEqual([
		{
			_Type: 'Homework',
			_Weight: '20%',
			_Points: '9',
			_PointsPossible: '10',
			_WeightedPct: '18%',
			_CalculatedMark: 'A'
		},
		{
			_Type: 'Tests',
			_Weight: '80%',
			_Points: '94',
			_PointsPossible: '100',
			_WeightedPct: '75.2%',
			_CalculatedMark: 'A'
		}
	]);

	expect(mark?.Assignments?.Assignment).toHaveLength(3);
});

test('mapped assignments are readable by parseSynergyAssignment', () => {
	const gradebook = mapGradebook(fixture);
	const assignments = gradebook.Courses.Course[0]?.Marks?.Mark[0]?.Assignments?.Assignment ?? [];

	expect(parseSynergyAssignment(assignments[0]!)).toMatchObject({
		name: 'HW 1.1',
		id: '9001',
		pointsEarned: 9,
		pointsPossible: 10,
		category: 'Homework',
		notForGrade: false
	});

	expect(parseSynergyAssignment(assignments[1]!)).toMatchObject({
		name: 'Unit 1 Test',
		pointsEarned: 94,
		pointsPossible: 100,
		category: 'Tests'
	});

	expect(parseSynergyAssignment(assignments[2]!)).toMatchObject({
		name: 'Practice',
		notForGrade: true
	});
});
