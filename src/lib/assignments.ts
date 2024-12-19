import { roundToLeastPrecision } from '$lib';
import type { AssignmentEntity, Course } from './types/Gradebook';

export interface Category {
	name: string;
	weightPercentage: number;
	pointsEarned: number;
	pointsPossible: number;
	weightedPercentage: number;
	gradeLetter: string;
}

interface Assignment {
	name: string;
	pointsEarned: number | undefined;
	pointsPossible: number | undefined;
	unscaledPoints: { pointsEarned: number; pointsPossible: number } | undefined;
	extraCredit: boolean;
	gradePercentageChange: number | undefined;
	notForGrade: boolean;
	hidden: boolean;
	category: string | undefined;
	date: Date | undefined;
	newHypothetical: boolean;
}

export interface RealAssignment extends Assignment {
	pointsPossible: number;
	hidden: false;
	category: string;
	date: Date;
	newHypothetical: false;
}

export interface HiddenAssignment extends Assignment {
	pointsEarned: number;
	pointsPossible: number;
	unscaledPoints: undefined;
	extraCredit: false;
	notForGrade: false;
	hidden: true;
	category: string;
	date: undefined;
	newHypothetical: false;
}

export interface ReactiveAssignment extends Assignment {
	reactive: true;
}

export interface NewHypotheticalAssignment extends ReactiveAssignment {
	newHypothetical: true;
	unscaledPoints: undefined;
	extraCredit: false;
	hidden: false;
	date: undefined;
}

type Calculable<T extends Assignment> = T & {
	pointsEarned: number;
	pointsPossible: number;
	notForGrade: false;
	category: string;
};

export type Flowed<T extends Assignment> = Calculable<T> & {
	gradePercentageChange: number;
};

interface PointsByCategory {
	[categoryName: string]: {
		pointsEarned: number;
		pointsPossible: number;
	};
}

export function calculateGradePercentage(pointsEarned: number, pointsPossible: number) {
	let gradePercentage = (pointsEarned / pointsPossible) * 100;

	if (isNaN(gradePercentage)) gradePercentage = 0;

	return gradePercentage;
}

export function calculateCourseGradePercentageFromCategories(
	pointsByCategory: PointsByCategory,
	gradeCategories: Category[]
) {
	let gradePercentage = 0;
	if (Object.entries(pointsByCategory).length == 0) return 0;

	let totalWeight = 0;

	Object.entries(pointsByCategory).forEach(([categoryName, categoryPoints]) => {
		const category = gradeCategories.find((category) => category.name == categoryName);
		if (!category) return;

		gradePercentage +=
			(categoryPoints.pointsEarned / categoryPoints.pointsPossible) * category.weightPercentage;
		totalWeight += category.weightPercentage;
	});

	gradePercentage = (gradePercentage / totalWeight) * 100;

	if (isNaN(gradePercentage)) {
		console.error('Grade percentage is NaN');
		return 0;
	}

	return gradePercentage;
}

export function calculateCourseGradePercentageFromTotals<T extends Assignment>(
	assignments: Calculable<T>[]
) {
	const { pointsEarned, pointsPossible } = getAssignmentPointTotals(assignments);

	return calculateGradePercentage(pointsEarned, pointsPossible);
}

function flowAssignmentFromTotals<T extends Assignment>(
	assignment: Calculable<T>,
	totalPointsEarned: number,
	totalPointsPossible: number
): { assignment: Flowed<T>; totalPointsEarned: number; totalPointsPossible: number } {
	const { pointsEarned, pointsPossible, extraCredit } = assignment;

	const priorGrade = calculateGradePercentage(totalPointsEarned, totalPointsPossible);

	totalPointsEarned += pointsEarned;
	totalPointsPossible += extraCredit ? 0 : pointsPossible;

	const afterGrade = calculateGradePercentage(totalPointsEarned, totalPointsPossible);

	const gradePercentageChange = afterGrade - priorGrade;

	const calculable = { ...assignment, gradePercentageChange };

	return { assignment: calculable, totalPointsEarned, totalPointsPossible };
}

function flowAssignmentFromCategories<T extends Assignment>(
	assignment: Calculable<T>,
	pointsByCategory: PointsByCategory,
	gradeCategories: Category[]
): { assignment: Flowed<T>; pointsByCategory: PointsByCategory } {
	const { pointsEarned, pointsPossible, category, extraCredit } = assignment;

	const priorGrade = calculateCourseGradePercentageFromCategories(
		pointsByCategory,
		gradeCategories
	);

	const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
	pointsByCategory[category] = {
		pointsEarned: categoryPoints.pointsEarned + pointsEarned,
		pointsPossible: categoryPoints.pointsPossible + (extraCredit ? 0 : pointsPossible)
	};

	const afterGrade = calculateCourseGradePercentageFromCategories(
		pointsByCategory,
		gradeCategories
	);

	const gradePercentageChange = afterGrade - priorGrade;

	const calculable = { ...assignment, gradePercentageChange };

	return { assignment: calculable, pointsByCategory };
}

export function calculateAssignmentGPCsFromCategories<T extends Assignment>(
	assignments: T[],
	gradeCategories: Category[]
) {
	let pointsByCategory: PointsByCategory = {};

	const flowedAssignments: (T | Flowed<T>)[] = assignments
		.toReversed()
		.map((assignment) => {
			const { pointsEarned, pointsPossible, notForGrade, category } = assignment;

			if (
				pointsEarned === undefined ||
				pointsPossible === undefined ||
				notForGrade ||
				category === undefined
			)
				return assignment;

			const calculable: Calculable<T> = {
				...assignment,
				pointsEarned,
				pointsPossible,
				notForGrade,
				category
			};

			const flowed = flowAssignmentFromCategories(calculable, pointsByCategory, gradeCategories);

			pointsByCategory = flowed.pointsByCategory;

			return flowed.assignment;
		})
		.toReversed();

	return flowedAssignments;
}

export function calculateAssignmentGPCsFromTotals<T extends Assignment>(assignments: T[]) {
	let totalPointsEarned = 0;
	let totalPointsPossible = 0;

	const flowedAssignments: (T | Flowed<T>)[] = assignments
		.toReversed()
		.map((assignment) => {
			const { pointsEarned, pointsPossible, notForGrade, category } = assignment;

			if (
				pointsEarned === undefined ||
				pointsPossible === undefined ||
				notForGrade ||
				category === undefined
			)
				return assignment;

			const calculable: Calculable<T> = {
				...assignment,
				pointsEarned,
				pointsPossible,
				notForGrade,
				category
			};

			const flowed = flowAssignmentFromTotals(calculable, totalPointsEarned, totalPointsPossible);
			totalPointsEarned = flowed.totalPointsEarned;
			totalPointsPossible = flowed.totalPointsPossible;
			return flowed.assignment;
		})
		.toReversed();

	return flowedAssignments;
}

export function calculateAssignmentGPCs<T extends Assignment>(
	assignments: T[],
	gradeCategories?: Category[]
) {
	if (gradeCategories === undefined) {
		return calculateAssignmentGPCsFromTotals(assignments);
	}

	return calculateAssignmentGPCsFromCategories(assignments, gradeCategories);
}

export function getHiddenAssignmentsFromCategories(
	categories: Category[],
	pointsByCategory: PointsByCategory
) {
	return categories
		.filter(
			(category) =>
				pointsByCategory[category.name] &&
				(category.pointsEarned !== pointsByCategory[category.name].pointsEarned ||
					category.pointsPossible !== pointsByCategory[category.name].pointsPossible)
		)
		.map((category) => {
			const { pointsEarned, pointsPossible } = pointsByCategory[category.name];

			const hiddenPointsEarned = category.pointsEarned - pointsEarned;
			const hiddenPointsPossible = category.pointsPossible - pointsPossible;

			// Calculate grade prior to the assignment
			const priorGrade = calculateCourseGradePercentageFromCategories(pointsByCategory, categories);

			pointsByCategory[category.name] = {
				pointsEarned: pointsEarned + hiddenPointsEarned,
				pointsPossible: pointsPossible + hiddenPointsPossible
			};

			// Calculate grade after the assignment
			const afterGrade = calculateCourseGradePercentageFromCategories(pointsByCategory, categories);

			// Calculate grade percentage change and initalize hypothetical gradebook
			const gradePercentageChange = afterGrade - priorGrade;

			const hiddenAssignment: Flowed<HiddenAssignment> = {
				name: `Hidden ${category.name} Assignments`,
				pointsEarned: hiddenPointsEarned,
				pointsPossible: hiddenPointsPossible,
				unscaledPoints: undefined,
				extraCredit: false,
				gradePercentageChange,
				notForGrade: false,
				hidden: true,
				category: category.name,
				date: undefined,
				newHypothetical: false
			};

			return hiddenAssignment;
		});
}

export function getPointsByCategory<T extends Assignment>(assignments: Calculable<T>[]) {
	let pointsByCategory: PointsByCategory = {};

	assignments.forEach((assignment) => {
		const { category, pointsEarned, pointsPossible, extraCredit } = assignment;

		const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };

		pointsByCategory[category] = {
			pointsEarned: categoryPoints.pointsEarned + pointsEarned,
			pointsPossible: categoryPoints.pointsPossible + (extraCredit ? 0 : pointsPossible)
		};
	});

	return pointsByCategory;
}

export function gradesMatch(rawGrade: number, expectedGrade: number) {
	const [a, b] = roundToLeastPrecision(rawGrade, expectedGrade);

	return a === b;
}

function getAssignmentPointTotals<T extends Assignment>(assignments: Calculable<T>[]) {
	let pointsEarned = 0;
	let pointsPossible = 0;

	assignments.forEach((assignment) => {
		const { pointsEarned: earned, pointsPossible: possible, extraCredit } = assignment;

		pointsEarned += earned;
		if (!extraCredit) pointsPossible += possible;
	});

	return { pointsEarned, pointsPossible };
}

export function getSynergyCourseAssignmentCategories(course: Course) {
	const gradeCalcSummary = course?.Marks.Mark.GradeCalculationSummary;

	if (typeof gradeCalcSummary == 'string' || !gradeCalcSummary?.AssignmentGradeCalc)
		return undefined;

	const categories: Category[] = gradeCalcSummary.AssignmentGradeCalc.map((category) => ({
		name: category._Type,
		weightPercentage: parseFloat(category._Weight),
		pointsEarned: parseFloat(category._Points),
		pointsPossible: parseFloat(category._PointsPossible),
		weightedPercentage: parseFloat(category._WeightedPct),
		gradeLetter: category._CalculatedMark
	}));

	return categories;
}

export function getCalculableAssignments<T extends Assignment>(assignments: T[]) {
	return assignments
		.map((assignment) => {
			const { pointsEarned, pointsPossible, notForGrade, category } = assignment;

			if (
				pointsEarned === undefined ||
				pointsPossible === undefined ||
				notForGrade ||
				category === undefined
			)
				return null;

			const calculable: Calculable<T> = {
				...assignment,
				pointsEarned,
				pointsPossible,
				notForGrade,
				category
			};

			return calculable;
		})
		.filter((assignments) => assignments !== null);
}

export function parseSynergyAssignment(synergyAssignment: AssignmentEntity) {
	const {
		_Date,
		_Measure,
		_Notes,
		_Point,
		_PointPossible,
		_Points,
		_ScoreCalValue,
		_ScoreMaxValue,
		_Type
	} = synergyAssignment;

	// Edge Cases:

	// Normal:
	// _Point: "3"
	// _PointPossible: "4"
	// _Points: "3 / 4"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"

	// Not Graded:
	// _Point: undefined
	// _PointPossible: undefined
	// _Points: "4 Points Possible"
	// _ScoreCalValue: undefined
	// _ScoreMaxValue: "4" or undefined
	// _DisplayScore: "Not Graded"

	// Extra Credit:
	// _Point: "3"
	// _PointPossible: ""
	// _Points: "3 /"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"

	// Not For Grading:
	// _Point: "3"
	// _PointPossible: "4"
	// _Points: "3 / 4"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"
	// _Notes : "(Not For Grading)"

	// Scaled:
	// _Point: "6"
	// _PointPossible: "8"
	// _Points: "6 / 8"
	// _ScoreCalValue: "3"
	// _ScoreMaxValue: "4"
	// _DisplayScore: "3 out of 4"

	const pointsEarned = _Point ? parseFloat(_Point) : undefined;

	const pointsPossible = _PointPossible
		? parseFloat(_PointPossible)
		: _ScoreMaxValue
			? parseFloat(_ScoreMaxValue)
			: parseFloat(_Points.split(' Points Possible')[0]); // Sometimes ScoreMaxValue is undefined; you can still get the points possible from the _Points field

	const pointsEarnedIsScaled =
		_Point !== undefined && _ScoreCalValue !== undefined && _Point !== _ScoreCalValue;

	const pointsPossibleIsScaled =
		_PointPossible !== undefined &&
		_ScoreMaxValue !== undefined &&
		_PointPossible !== _ScoreMaxValue;

	let unscaledPoints: { pointsEarned: number; pointsPossible: number } | undefined = undefined;

	if ((pointsEarnedIsScaled || pointsPossibleIsScaled) && _ScoreCalValue && _ScoreMaxValue) {
		unscaledPoints = {
			pointsEarned: parseFloat(_ScoreCalValue),
			pointsPossible: parseFloat(_ScoreMaxValue)
		};
	}

	const assignment: RealAssignment = {
		name: _Measure,
		pointsEarned,
		pointsPossible,
		unscaledPoints,
		extraCredit: _PointPossible === '',
		gradePercentageChange: 0,
		notForGrade: _Notes.includes('(Not For Grading)'),
		hidden: false,
		category: _Type,
		date: new Date(_Date),
		newHypothetical: false
	};

	return assignment;
}
