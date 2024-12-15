import { roundToLeastPrecision } from '$lib';
import type { CourseEntity } from './types/Gradebook';

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
	const { pointsEarned, pointsPossible } = assignment;

	const priorGrade = calculateGradePercentage(totalPointsEarned, totalPointsPossible);

	totalPointsEarned += pointsEarned;
	totalPointsPossible += pointsPossible;

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
	const { pointsEarned, pointsPossible, category } = assignment;

	const priorGrade = calculateCourseGradePercentageFromCategories(
		pointsByCategory,
		gradeCategories
	);

	const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
	pointsByCategory[category] = {
		pointsEarned: categoryPoints.pointsEarned + pointsEarned,
		pointsPossible: categoryPoints.pointsPossible + pointsPossible
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
		const { category, pointsEarned, pointsPossible } = assignment;

		const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
		pointsByCategory[category] = {
			pointsEarned: categoryPoints.pointsEarned + pointsEarned,
			pointsPossible: categoryPoints.pointsPossible + pointsPossible
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
		const { pointsEarned: earned, pointsPossible: possible } = assignment;

		pointsEarned += earned;
		pointsPossible += possible;
	});

	return { pointsEarned, pointsPossible };
}

export function getSynergyCourseAssignmentCategories(course: CourseEntity) {
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
