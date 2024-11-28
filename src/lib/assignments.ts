import type { CourseEntity } from './types/Gradebook';

export interface Category {
	name: string;
	weightPercentage: number;
	pointsEarned: number;
	pointsPossible: number;
	weightedPercentage: number;
	gradeLetter: string;
}

interface BaseAssignment {
	name: string;
	pointsEarned?: number;
	pointsPossible: number;
	gradePercentageChange: number;
	notForGrade: boolean;
	hidden: boolean;
	category: string;
	date?: Date;
}

export interface RealAssignment extends BaseAssignment {
	hidden: false;
	date: Date;
}

export interface HiddenAssignment extends BaseAssignment {
	pointsEarned: number;
	notForGrade: false;
	hidden: true;
}

export interface ReactiveAssignment extends BaseAssignment {
	reactive: true;
	newHypothetical: boolean;
}

export interface NewHypotheticalAssignment extends ReactiveAssignment {
	hidden: false;
	notForGrade: false;
	newHypothetical: true;
}

export type Assignment = RealAssignment | HiddenAssignment | ReactiveAssignment;

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

function calculateCourseGradePercentageFromCategories(
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

export function calculateCourseGradePercentageFromTotals(assignments: Assignment[]) {
	const { pointsEarned, pointsPossible } = getAssignmentPointTotals(assignments);

	return calculateGradePercentage(pointsEarned, pointsPossible);
}

export function calculateAssignmentGradePercentageChanges<T extends Assignment>(
	assignments: T[],
	gradeCategories?: Category[]
): T[] {
	const validAssignments = assignments.filter(includeAssignmentInGradeCalc);

	if (!gradeCategories) {
		let totalPointsEarned = 0;
		let totalPointsPossible = 0;

		return validAssignments
			.toReversed()
			.map((assignment) => {
				const { pointsEarned, pointsPossible } = assignment;

				if (pointsEarned === undefined) return assignment;

				const priorGrade = calculateGradePercentage(totalPointsEarned, totalPointsPossible);

				totalPointsEarned += pointsEarned;
				totalPointsPossible += pointsPossible;

				const afterGrade = calculateGradePercentage(totalPointsEarned, totalPointsPossible);

				const gradePercentageChange = afterGrade - priorGrade;

				return { ...assignment, gradePercentageChange };
			})
			.toReversed();
	}

	let pointsByCategory: PointsByCategory = {};

	return validAssignments
		.toReversed()
		.map((assignment) => {
			const { category, pointsEarned, pointsPossible } = assignment;

			if (pointsEarned === undefined) return assignment;

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

			return { ...assignment, gradePercentageChange };
		})
		.toReversed();
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

			const hiddenAssignment: HiddenAssignment = {
				name: `Hidden ${category.name} Assignments`,
				pointsEarned: hiddenPointsEarned,
				pointsPossible: hiddenPointsPossible,
				gradePercentageChange,
				notForGrade: false,
				hidden: true,
				category: category.name
			};

			return hiddenAssignment;
		});
}

export function getPointsByCategory(assignments: Assignment[]) {
	let pointsByCategory: PointsByCategory = {};

	assignments.filter(includeAssignmentInGradeCalc).forEach((assignment) => {
		const { category, pointsEarned, pointsPossible } = assignment;

		if (pointsEarned === undefined) return;

		const categoryPoints = pointsByCategory[category] ?? { pointsEarned: 0, pointsPossible: 0 };
		pointsByCategory[category] = {
			pointsEarned: categoryPoints.pointsEarned + pointsEarned,
			pointsPossible: categoryPoints.pointsPossible + pointsPossible
		};
	});

	return pointsByCategory;
}

export function gradesMatch(rawGrade: number, expectedGrade: number) {
	// const decimalPlaces = expectedGrade % 1 !== 0 ? expectedGrade.toString().split('.')[1].length : 0;

	// return Math.floor(rawGrade * 10 ** decimalPlaces) / 10 ** decimalPlaces === expectedGrade;
	return true;
}

export function getAssignmentPointTotals(assignments: Assignment[]) {
	let pointsEarned = 0;
	let pointsPossible = 0;

	assignments.filter(includeAssignmentInGradeCalc).forEach((assignment) => {
		const { pointsEarned: earned, pointsPossible: possible } = assignment;

		if (earned === undefined) return;

		pointsEarned += earned;
		pointsPossible += possible;
	});

	return { pointsEarned, pointsPossible };
}

export function calculateGradeFlow<T extends Assignment>(
	assignments: T[],
	gradeCategories?: Category[]
) {
	return {
		assignments: calculateAssignmentGradePercentageChanges(assignments, gradeCategories),
		grade: gradeCategories
			? calculateCourseGradePercentageFromCategories(
					getPointsByCategory(assignments),
					gradeCategories
				)
			: calculateCourseGradePercentageFromTotals(assignments)
	};
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

function includeAssignmentInGradeCalc(assignment: Assignment) {
	return !assignment.notForGrade && assignment.pointsEarned !== undefined;
}
