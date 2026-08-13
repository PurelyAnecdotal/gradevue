import type {
	AssignmentEntity,
	AssignmentGradeCalc,
	Course,
	Gradebook,
	Mark,
	ReportPeriod
} from '$lib/types/Gradebook';
import type {
	MapGradebookInput,
	Pxp2Assignment,
	Pxp2ClassGrade,
	Pxp2CourseInput,
	Pxp2MeasureType,
	Pxp2MeasureTypeGrade
} from './types';

function asPercent(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return value <= 1.5 ? value * 100 : value;
}

function formatPercent(value: number): string {
	const pct = asPercent(value);
	return `${Number(pct.toFixed(2))}%`;
}

function letterFromPercentage(percentage: number): string {
	if (percentage >= 89.5) return 'A';
	if (percentage >= 79.5) return 'B';
	if (percentage >= 69.5) return 'C';
	if (percentage >= 59.5) return 'D';
	return 'F';
}

function overallPercentage(classGrade: Pxp2ClassGrade | undefined, scorePreview: string): number {
	if (classGrade?.totalWeightedPercentage !== undefined) {
		return asPercent(classGrade.totalWeightedPercentage);
	}
	if (classGrade?.percentage !== undefined) {
		return asPercent(classGrade.percentage);
	}
	if (classGrade !== undefined && classGrade.pointsPossible > 0) {
		return (classGrade.points / classGrade.pointsPossible) * 100;
	}

	const preview = parseFloat(scorePreview.replace('%', ''));
	return Number.isFinite(preview) ? preview : 0;
}

function measureTypeName(measureTypes: Pxp2MeasureType[], id: number, fallback: string): string {
	return measureTypes.find((type) => type.id === id)?.name ?? fallback;
}

function mapAssignment(
	assignment: Pxp2Assignment,
	assignmentNames: Record<number, string>,
	measureTypes: Pxp2MeasureType[]
): AssignmentEntity {
	const name =
		assignment.name ??
		assignmentNames[assignment.gradeBookId] ??
		`Assignment ${assignment.gradeBookId}`;
	const category =
		assignment.category.length > 0
			? assignment.category
			: measureTypeName(measureTypes, assignment.measureTypeId, '');
	const maxScore = assignment.maxScore;
	const graded = assignment.score !== null && assignment.isForGrading && !assignment.excused;
	const notesParts: string[] = [];
	if (!assignment.isForGrading || assignment.excused) notesParts.push('(Not For Grading)');
	if (assignment.commentCode !== null && assignment.commentCode.length > 0) {
		notesParts.push(assignment.commentCode);
	}

	const pointsEarned = assignment.score ?? '';
	const displayScore = graded ? `${assignment.score} out of ${maxScore}` : 'Not Graded';
	const points = graded ? `${assignment.score} / ${maxScore}` : `${maxScore} Points Possible`;

	return {
		Resources: null,
		Standards: null,
		_GradebookID: String(assignment.gradeBookId),
		_Measure: name,
		_Type: category,
		_Date: assignment.dueDate,
		_DueDate: assignment.dueDate,
		_Score: graded ? (assignment.score ?? undefined) : undefined,
		_DisplayScore: displayScore,
		_ScoreCalValue: graded ? (assignment.score ?? undefined) : undefined,
		_TimeSincePost: '',
		_TotalSecondsSincePost: '0',
		_ScoreMaxValue: maxScore,
		_ScoreType: 'Raw Score',
		_Points: points,
		_Point: graded ? pointsEarned : undefined,
		_PointPossible: graded ? maxScore : maxScore,
		_Notes: notesParts.join(' ').trim(),
		_TeacherID: '',
		_StudentID: String(assignment.studentId),
		_MeasureDescription: '',
		_HasDropBox: false,
		_DropStartDate: assignment.dueDate,
		_DropEndDate: assignment.dueDate
	};
}

function mapCategories(
	measureTypeGrades: Pxp2MeasureTypeGrade[] | undefined,
	measureTypes: Pxp2MeasureType[]
): AssignmentGradeCalc[] | undefined {
	if (measureTypeGrades === undefined || measureTypeGrades.length === 0) return undefined;

	return measureTypeGrades.map((grade) => {
		const type = measureTypeName(
			measureTypes,
			grade.measureTypeId,
			`Category ${grade.measureTypeId}`
		);
		const weight = asPercent(grade.measureTypeWeight);
		const categoryPct = grade.pointsPossible > 0 ? (grade.points / grade.pointsPossible) * 100 : 0;
		const weightedContribution = (categoryPct / 100) * weight;

		return {
			_Type: type,
			_Weight: `${weight}%`,
			_Points: String(grade.points),
			_PointsPossible: String(grade.pointsPossible),
			_WeightedPct: formatPercent(weightedContribution),
			_CalculatedMark:
				grade.calculatedMark.length > 0
					? grade.calculatedMark
					: letterFromPercentage(categoryPct)
		};
	});
}

function mapCourse(input: Pxp2CourseInput, periodIndex: number): Course {
	const { metadata, classData, assignmentNames, measureTypes } = input;
	const classGrade = classData.classGrades[0];
	const percentage = overallPercentage(classGrade, metadata.scorePreview ?? '');
	const fromClass = classGrade?.calculatedMark;
	const fromPreview = metadata.markPreview;
	const letter =
		fromClass !== undefined && fromClass.length > 0
			? fromClass
			: fromPreview !== undefined && fromPreview !== null && fromPreview.length > 0
				? fromPreview
				: letterFromPercentage(percentage);
	const categories = mapCategories(classData.measureTypeGrades, measureTypes);
	const assignments = classData.assignments.map((assignment) =>
		mapAssignment(assignment, assignmentNames, measureTypes)
	);

	const mark: Mark = {
		StandardViews: null,
		GradeCalculationSummary:
			categories !== undefined && categories.length > 0
				? { AssignmentGradeCalc: categories }
				: null,
		Assignments: { Assignment: assignments },
		AssignmentsSinceLastAccess: null,
		_MarkName: '',
		_ShortMarkName: '',
		_CalculatedScoreString: letter,
		_CalculatedScoreRaw: percentage.toFixed(1)
	};

	const courseName = metadata.Name;
	const courseId = String(metadata.ID);

	return {
		Marks: { Mark: [mark] },
		_Period: String(periodIndex + 1),
		_Title: `${courseName} (${courseId})`,
		_CourseName: courseName,
		_CourseID: courseId,
		_Room: metadata.room ?? '',
		_Staff: metadata.TeacherName,
		_StaffEMail: '',
		_StaffGU: '',
		_ImageType: 'technical',
		_HighlightPercentageCutOffForProgressBar: '50',
		_UsesRichContent: false
	};
}

export function mapGradebook(input: MapGradebookInput): Gradebook {
	const reportingPeriods: ReportPeriod[] = input.periods.map((period, index) => ({
		_GradePeriod: period.Name,
		_Index: String(index),
		_StartDate: '',
		_EndDate: ''
	}));

	const active =
		reportingPeriods[input.activeIndex] ??
		reportingPeriods.find((period) => period._GradePeriod === input.activePeriod.Name) ??
		reportingPeriods[0];

	if (active === undefined) {
		throw new Error('No grading periods were returned');
	}

	return {
		ReportingPeriods: { ReportPeriod: reportingPeriods },
		ReportingPeriod: active,
		Courses: {
			Course: input.courses.map((course, index) => mapCourse(course, index))
		},
		'_xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
		'_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
		_Type: 'Traditional',
		_ErrorMessage: '',
		_HideStandardGraphInd: false,
		_HideMarksColumnElementary: false,
		_HidePointsColumnElementary: false,
		_HidePercentSecondary: false,
		_DisplayStandardsData: false,
		_GBStandardsTabDefault: false
	};
}
