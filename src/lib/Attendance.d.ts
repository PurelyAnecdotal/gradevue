export interface Attendance {
    Absences: Absences;
    TotalExcused: TotalExcusedOrTotalTardiesOrTotalUnexcusedOrTotalActivitiesOrTotalUnexcusedTardies;
    TotalTardies: TotalExcusedOrTotalTardiesOrTotalUnexcusedOrTotalActivitiesOrTotalUnexcusedTardies;
    TotalUnexcused: TotalExcusedOrTotalTardiesOrTotalUnexcusedOrTotalActivitiesOrTotalUnexcusedTardies;
    TotalActivities: TotalExcusedOrTotalTardiesOrTotalUnexcusedOrTotalActivitiesOrTotalUnexcusedTardies;
    TotalUnexcusedTardies: TotalExcusedOrTotalTardiesOrTotalUnexcusedOrTotalActivitiesOrTotalUnexcusedTardies;
    ConcurrentSchoolsLists: string;
    '_xmlns:xsd': string;
    '_xmlns:xsi': string;
    _Type: string;
    _StartPeriod: string;
    _EndPeriod: string;
    _PeriodCount: string;
    _SchoolName: string;
  }
  export interface Absences {
    Absence?: (AbsenceEntity)[] | null;
  }
  export interface AbsenceEntity {
    Periods: Periods;
    _AbsenceDate: string;
    _Reason: string;
    _Note: string;
    _DailyIconName: string;
    _CodeAllDayReasonType: string;
    _CodeAllDayDescription: string;
  }
  export interface Periods {
    Period?: (PeriodEntity)[] | null;
  }
  export interface PeriodEntity {
    _Number: string;
    _Name: string;
    _Reason: string;
    _Course: string;
    _Staff: string;
    _StaffEMail: string;
    _IconName: string;
    _SchoolName: string;
    _StaffGU: string;
    _OrgYearGU: string;
  }
  export interface TotalExcusedOrTotalTardiesOrTotalUnexcusedOrTotalActivitiesOrTotalUnexcusedTardies {
    PeriodTotal?: (PeriodTotalEntity)[] | null;
  }
  export interface PeriodTotalEntity {
    _Number: string;
    _Total: string;
  }
  