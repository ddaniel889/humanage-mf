export interface Holiday{
  id?: number;
  holidayType: string;
  description: string;
  holidayDate: Date;
  effectiveHolidayDate: Date;
  state: boolean;
  configLeaveOuId: number;
}
