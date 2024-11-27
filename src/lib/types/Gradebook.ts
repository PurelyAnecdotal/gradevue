export interface Gradebook {
	ReportingPeriods: ReportingPeriods;
	ReportingPeriod: ReportingPeriod;
	Courses: Courses;
	'_xmlns:xsd': string;
	'_xmlns:xsi': string;
	_Type: string;
	_ErrorMessage: string;
	_HideStandardGraphInd: string;
	_HideMarksColumnElementary: string;
	_HidePointsColumnElementary: string;
	_HidePercentSecondary: string;
	_DisplayStandardsData: string;
	_GBStandardsTabDefault: string;
}
export interface ReportingPeriods {
	ReportPeriod?: ReportPeriodEntity[] | null;
}
export interface ReportPeriodEntity {
	_Index: string;
	_GradePeriod: string;
	_StartDate: string;
	_EndDate: string;
}
export interface ReportingPeriod {
	_GradePeriod: string;
	_StartDate: string;
	_EndDate: string;
}
export interface Courses {
	Course?: CourseEntity[] | null;
}
export interface CourseEntity {
	Marks: Marks;
	_UsesRichContent: string;
	_Period: string;
	_Title: string;
	_Room: string;
	_Staff: string;
	_StaffEMail: string;
	_StaffGU: string;
	_HighlightPercentageCutOffForProgressBar: string;
}
export interface Marks {
	Mark: Mark;
}
export interface Mark {
	StandardViews: string;
	GradeCalculationSummary: GradeCalculationSummary | string;
	Assignments: Assignments;
	_MarkName: string;
	_CalculatedScoreString: string;
	_CalculatedScoreRaw: string;
}
export interface GradeCalculationSummary {
	AssignmentGradeCalc?: AssignmentGradeCalcEntity[] | null;
}
export interface AssignmentGradeCalcEntity {
	_Type: string;
	_Weight: string;
	_Points: string;
	_PointsPossible: string;
	_WeightedPct: string;
	_CalculatedMark: string;
}
export interface Assignments {
	Assignment?: AssignmentEntity[] | null;
}
export interface AssignmentEntity {
	Resources: string;
	Standards: string;
	_GradebookID: string;
	_Measure: string;
	_Type: string;
	_Date: string;
	_DueDate: string;
	_Score: string;
	_ScoreType: string;
	_Points: string;
	_Notes: string;
	_TeacherID: string;
	_StudentID: string;
	_MeasureDescription: string;
	_HasDropBox: string;
	_DropStartDate: string;
	_DropEndDate: string;
}
