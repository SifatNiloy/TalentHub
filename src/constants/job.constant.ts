export const JOB_INDEXES = {
  LOCATION_2DSPHERE: { location: '2dsphere' },
};
export const EMPLOYMENT_TYPE = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
  FREELANCE: "Freelance",
} as const;

export const JOB_STATUS = {
  ACTIVE: "Active",
  CLOSED: "Closed",
  DRAFT: "Draft",
} as const;
