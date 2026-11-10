"use client";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

type CalendarDateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  disabled?: boolean;
  fullWidth?: boolean;
};

export default function CalendarDateField({
  label,
  value,
  onChange,
  minDate,
  disabled = false,
  fullWidth = true,
}: CalendarDateFieldProps) {
  const parsedValue = value ? dayjs(value) : null;
  const parsedMinDate = minDate ? dayjs(minDate) : undefined;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={parsedValue?.isValid() ? parsedValue : null}
        minDate={parsedMinDate?.isValid() ? parsedMinDate : undefined}
        onChange={(date: Dayjs | null) =>
          onChange(date?.isValid() ? date.format("YYYY-MM-DD") : "")
        }
        disabled={disabled}
        slotProps={{
          textField: {
            fullWidth,
            size: "small",
            sx: {
              minWidth: 170,
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.875rem",
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
}
