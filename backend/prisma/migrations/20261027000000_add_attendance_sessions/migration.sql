-- Preserve legacy daily timestamps as the first attendance session.
CREATE TABLE "AttendanceSession" (
    "id" SERIAL NOT NULL,
    "attendanceId" INTEGER NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceSession_pkey" PRIMARY KEY ("id")
);

INSERT INTO "AttendanceSession" ("attendanceId", "checkIn", "checkOut", "updatedAt")
SELECT "id", "checkIn", "checkOut", CURRENT_TIMESTAMP
FROM "Attendance"
WHERE "checkIn" IS NOT NULL;

CREATE INDEX "AttendanceSession_attendanceId_checkIn_idx"
    ON "AttendanceSession"("attendanceId", "checkIn");

ALTER TABLE "AttendanceSession"
    ADD CONSTRAINT "AttendanceSession_attendanceId_fkey"
    FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
