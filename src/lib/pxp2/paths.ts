const ALLOWED_PATHS = [
	'/PXP2_Login_Student.aspx',
	'/PXP2_GradeBook.aspx',
	'/service/PXP2Communication.asmx/LoadControl',
	'/service/PXP2Communication.asmx/GradebookFocusClassInfo',
	'/api/GB/ClientSideData/Transfer',
	'/api/v1/components/pxp/student-picker/StudentPicker/GetStudents'
] as const;

export function pathnameOf(path: string): string {
	return path.split('?')[0] ?? path;
}

export function isAllowedStudentVuePath(path: string): boolean {
	if (!path.startsWith('/')) return false;
	const pathname = pathnameOf(path);
	return ALLOWED_PATHS.some((allowed) => pathname === allowed);
}

export function assertAllowedStudentVuePath(path: string): void {
	if (!isAllowedStudentVuePath(path)) {
		throw new Error(`Blocked StudentVUE path: ${pathnameOf(path)}`);
	}
}
