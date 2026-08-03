export interface ParticipationStats {
  weeklyScore: number
  monthlyScore: number
  ranking: { position: number; total: number; course: string } | null
  attendanceRate: number
  activitiesCompleted: number
  helpGiven: number
  acceptedAnswers: number
  mentorshipsAttended: number
  studyTimeHours: number
}
