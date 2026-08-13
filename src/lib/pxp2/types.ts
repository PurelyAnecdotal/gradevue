export interface Pxp2GradingPeriod {
	Name: string;
	GroupName: string;
	GU: string;
	OrgYearGU: string;
	schoolID: number;
	defaultFocus: boolean;
	MarkPeriods?: Array<{ GU: string }>;
}

export interface Pxp2GbFocusData {
	GradingPeriods: Pxp2GradingPeriod[];
}

export interface Pxp2CourseMetadata {
	ID: number;
	Name: string;
	TeacherName: string;
	room?: string;
	markPreview?: string | null;
	scorePreview?: string | null;
}

export interface Pxp2MeasureType {
	id: number;
	name: string;
	weight: number;
}

export interface Pxp2ClassGrade {
	studentId?: number;
	assignmentCount?: number;
	points: number;
	pointsPossible: number;
	calculatedMark: string;
	totalWeightedPercentage?: number;
	percentage?: number;
}

export interface Pxp2MeasureTypeGrade {
	measureTypeId: number;
	measureTypeWeight: number;
	points: number;
	pointsPossible: number;
	calculatedMark: string;
}

export interface Pxp2Assignment {
	category: string;
	commentCode: string | null;
	dueDate: string;
	excused: boolean;
	gradeBookCategoryId: number;
	gradeBookId: number;
	isForGrading: boolean;
	maxScore: string;
	maxValue?: number;
	measureTypeId: number;
	name?: string;
	score: string | null;
	studentId: number;
}

export interface Pxp2ClassData {
	assignments: Pxp2Assignment[];
	classGrades: Pxp2ClassGrade[];
	classId: number;
	className: string | number;
	gradingPeriodId?: number;
	measureTypeGrades: Pxp2MeasureTypeGrade[];
	measureTypes?: Pxp2MeasureType[];
}

export interface Pxp2CourseInput {
	metadata: Pxp2CourseMetadata;
	classData: Pxp2ClassData;
	assignmentNames: Record<number, string>;
	measureTypes: Pxp2MeasureType[];
}

export interface MapGradebookInput {
	periods: Pxp2GradingPeriod[];
	activePeriod: Pxp2GradingPeriod;
	activeIndex: number;
	courses: Pxp2CourseInput[];
}
