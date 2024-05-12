export interface HypotheticalGradebook {
	[id: string]: {
		pointsEarned: number;
		pointsPossible: number;
		gradePercentageChange: number;
		notForGrade: boolean;
		category?: string;
		name?: string;
	};
}