type JobRankingSource = {
  title?: string | null;
  description?: string | null;
  requiredSkills?: string[] | null;
  jobType?: string | null;
  location?: string | null;
  salaryRange?: string | null;
};

type ResumeRankingSource = {
  parsedText?: string | null;
  extractedSkills?: string[] | null;
  extractedEducation?: string | null;
  extractedExperience?: string | null;
};

type CandidateRankingSource = {
  resume?: ResumeRankingSource | null;
  skills?: string[] | null;
  experience?: string | null;
  coverNote?: string | null;
  formData?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    skills?: string[] | null;
    experience?: string | null;
  } | null;
};

function joinTextParts(parts: Array<string | string[] | null | undefined>) {
  return parts
    .flatMap((part) => (Array.isArray(part) ? part : [part]))
    .filter((part): part is string => Boolean(part && part.trim()))
    .join('\n');
}

function labeledText(label: string, value?: string | null) {
  return value?.trim() ? `${label}: ${value.trim()}` : null;
}

function labeledList(label: string, values?: string[] | null) {
  const cleanedValues = values?.map((value) => value.trim()).filter(Boolean);
  return cleanedValues?.length ? `${label}: ${cleanedValues.join(', ')}` : null;
}

export function buildJobRankingText(job: JobRankingSource) {
  return joinTextParts([
    labeledText('Job title', job.title),
    labeledList('Required skills', job.requiredSkills),
    labeledText('Job description', job.description),
    labeledText('Job type', job.jobType),
    labeledText('Location', job.location),
    labeledText('Salary range', job.salaryRange),
  ]);
}

export function buildApplicationFormText(formData?: CandidateRankingSource['formData']) {
  return joinTextParts([
    labeledText('Applicant name', formData?.name),
    labeledText('Applicant email', formData?.email),
    labeledText('Applicant phone', formData?.phone),
    labeledList('Application form skills', formData?.skills),
    labeledText('Application form experience', formData?.experience),
  ]);
}

export function buildCandidateRankingText(candidate: CandidateRankingSource) {
  const formText = buildApplicationFormText(candidate.formData);

  return joinTextParts([
    formText,
    labeledList('Application form skills', candidate.skills),
    labeledText('Application form experience', candidate.experience),
    labeledText('Application cover note', candidate.coverNote),
    labeledList('Resume extracted skills', candidate.resume?.extractedSkills),
    labeledText('Resume extracted education', candidate.resume?.extractedEducation),
    labeledText('Resume extracted experience', candidate.resume?.extractedExperience),
    labeledText('Resume full text', candidate.resume?.parsedText),
  ]);
}
