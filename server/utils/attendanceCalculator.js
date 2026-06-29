/**
 * Shared Attendance Calculation Utility
 */

const formatDateLocal = (d) => {
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const calculateAttendanceStats = (records, joiningDate, dateRange = null, globalWorkingDays = null) => {
  const joinDate = joiningDate ? new Date(joiningDate) : null;
  if (joinDate) {
    joinDate.setHours(0, 0, 0, 0);
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Determine the start and end dates for our loop
  let startDate = joinDate ? new Date(joinDate) : null;
  
  // If no joining date is provided, infer the start date from the earliest record
  if (!startDate && records && records.length > 0) {
    const earliestRecord = records.reduce((earliest, r) => {
      const rDate = new Date(r.date);
      return rDate < earliest ? rDate : earliest;
    }, new Date(records[0].date));
    startDate = new Date(earliestRecord);
    startDate.setHours(0, 0, 0, 0);
  }

  let endDate = new Date(today);

  if (dateRange) {
    if (dateRange.startDate) {
      const rStart = new Date(dateRange.startDate);
      rStart.setHours(0, 0, 0, 0);
      if (!startDate || rStart > startDate) {
        startDate = rStart;
      }
    }
    if (dateRange.endDate) {
      const rEnd = new Date(dateRange.endDate);
      rEnd.setHours(23, 59, 59, 999);
      if (rEnd < endDate) {
        endDate = rEnd;
      }
    }
  }

  // Create a map of existing records by YYYY-MM-DD (Local)
  const recordMap = {};
  let presentDays = 0;
  let absentDays = 0;
  let holidayDays = 0;

  records.forEach(r => {
    if (r.date && r.status) {
      const rDate = new Date(r.date);
      rDate.setHours(12, 0, 0, 0); // avoid tz boundary shifts for comparison
      
      // Filter by date range if applicable
      let inRange = true;
      if (dateRange) {
        if (dateRange.startDate && rDate < new Date(dateRange.startDate).setHours(0,0,0,0)) inRange = false;
        if (dateRange.endDate && rDate > new Date(dateRange.endDate).setHours(23,59,59,999)) inRange = false;
      }

      const dateStr = formatDateLocal(r.date);
      recordMap[dateStr] = r.status;

      if (inRange) {
        if (r.status === 'present') presentDays++;
        else if (r.status === 'absent') absentDays++;
        else if (r.status === 'holiday') holidayDays++;
      }
    }
  });

  let notMarkedDays = 0;

  if (startDate && startDate <= endDate) {
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = formatDateLocal(current);
      const status = recordMap[dateStr];

      // We only care about finding days that SHOULD have been marked but WEREN'T
      // If it has a status, it was already counted above.
      if (!status) {
        // If it's not marked, check if it was a working day
        let isWorkingDay = false;
        
        if (globalWorkingDays) {
          isWorkingDay = globalWorkingDays.has(dateStr);
        } else {
          // Fallback: If no globalWorkingDays provided, assume non-Sunday is a working day
          isWorkingDay = current.getDay() !== 0;
        }

        if (isWorkingDay) {
          notMarkedDays++;
        }
      }

      current.setDate(current.getDate() + 1);
    }
  }

  const totalWorkingDays = presentDays + absentDays + notMarkedDays;
  let attendancePercentage = 100.00;
  if (totalWorkingDays > 0) {
    const calculated = (presentDays / totalWorkingDays) * 100;
    // Round to two decimal places
    attendancePercentage = Math.max(0, Math.min(100, parseFloat(calculated.toFixed(2))));
  }

  return {
    totalWorkingDays,
    presentDays,
    absentDays,
    holidayDays,
    notMarkedDays,
    attendancePercentage
  };
};
