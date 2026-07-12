const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || process.env.MONGODBURI;
if (!mongoUri) {
  console.error('MONGODB_URI not set. Aborting.');
  process.exit(1);
}

async function connect() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0 || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    const va = Number(a[i]) || 0;
    const vb = Number(b[i]) || 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function similarityToPercentage(sim) {
  if (!Number.isFinite(sim)) return 0;
  return Math.max(0, Math.min(100, sim * 100));
}

function extractYears(text) {
  if (!text) return 0;
  const m = String(text).toLowerCase().match(/(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:\+)?\s*(?:years?|yrs?)/i);
  if (m && m[1]) return Number(m[1]);
  return 0;
}

function calcExperience(candidateYears, requiredYears) {
  if (!Number.isFinite(candidateYears)) return 0;
  if (!Number.isFinite(requiredYears) || requiredYears <= 0) return 100;
  if (candidateYears >= requiredYears) return 100;
  return Number(((candidateYears / requiredYears) * 100).toFixed(2));
}

function calcSkillMatch(jobSkills, candidateSkills) {
  if (!Array.isArray(jobSkills) || jobSkills.length === 0) return 0;
  const nj = jobSkills.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  const nc = candidateSkills.map(s => String(s).toLowerCase().trim()).filter(Boolean);
  const matched = nj.filter(s => nc.includes(s));
  return Number(((matched.length / nj.length) * 100).toFixed(2));
}

function calcEducationScore(text) {
  const t = String(text || '').toLowerCase();
  if (/phd|doctorate/.test(t)) return 100;
  if (/master|msc|mtech/.test(t)) return 90;
  if (/bachelor|bca|bsc|be|btech|bs/.test(t)) return 80;
  if (/diploma|certificate/.test(t)) return 60;
  return 0;
}

function countProjects(text) {
  if (!text) return 0;
  const t = String(text).toLowerCase();
  const m = t.match(/\bprojects?\b/g);
  if (m && m.length) return m.length;
  const alt = t.match(/project[:\-]/g);
  return alt ? alt.length : 0;
}

function calcProjectScore(count) {
  if (!Number.isFinite(count) || count <= 0) return 0;
  return Math.min(100, Number(((count / 5) * 100).toFixed(2)));
}

function weightedScore({ similarity, skillMatch, experienceScore, educationScore, projectScore }) {
  const finalScore = similarity * 0.4 + skillMatch * 0.3 + experienceScore * 0.15 + educationScore * 0.1 + projectScore * 0.05;
  return Number(finalScore.toFixed(2));
}

async function main() {
  await connect();
  console.log('Connected to MongoDB');

  const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false, collection: 'applications' }));
  const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false, collection: 'jobs' }));
  const Resume = mongoose.model('Resume', new mongoose.Schema({}, { strict: false, collection: 'resumes' }));
  const RankingResult = mongoose.model('RankingResult', new mongoose.Schema({}, { strict: false, collection: 'rankingresults' }));

  const targetJobId = process.env.TARGET_JOB_ID;
  const targetApplicationId = process.env.TARGET_APPLICATION_ID;

  const query = {};
  if (targetJobId) {
    query.jobId = targetJobId;
  }
  if (targetApplicationId) {
    query._id = targetApplicationId;
  }

  const total = await Application.countDocuments(query);
  console.log('Applications to process:', total);

  const cursor = Application.find(query).cursor();
  let processed = 0;
  for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
    try {
      const app = doc.toObject();
      const job = app.jobId ? await Job.findById(app.jobId).lean() : null;
      const resume = app.resumeId ? await Resume.findById(app.resumeId).lean() : null;

      const jobEmbedding = (job && job.embedding) || [];
      const resumeEmbedding = (resume && resume.embedding) || [];

      const similarity = (Array.isArray(jobEmbedding) && Array.isArray(resumeEmbedding) && jobEmbedding.length>0 && resumeEmbedding.length>0)
        ? similarityToPercentage(cosineSimilarity(jobEmbedding, resumeEmbedding))
        : 0;

      const candidateSkills = Array.from(new Set([...(app.skills || []), ...(resume?.extractedSkills || [])]));
      const jobSkills = job?.requiredSkills || [];
      const skillMatch = calcSkillMatch(jobSkills, candidateSkills);

      const candidateYears = Number(app.experience) || extractYears(resume?.extractedExperience || app.experience || '');
      const requiredYears = extractYears(job?.description || '');
      const experienceScore = calcExperience(candidateYears, requiredYears);

      const educationScore = calcEducationScore(resume?.extractedEducation || '');

      const projectCount = countProjects(resume?.parsedText || '');
      const projectScore = calcProjectScore(projectCount);

      const finalScore = weightedScore({ similarity, skillMatch, experienceScore, educationScore, projectScore });

      const nj = jobSkills.map(s => String(s).toLowerCase().trim()).filter(Boolean);
      const nc = candidateSkills.map(s => String(s).toLowerCase().trim()).filter(Boolean);
      const matchedKeywords = nj.filter(s => nc.includes(s));
      const missingKeywords = nj.filter(s => !nc.includes(s));

      const algorithm = 'local_weighted_v1';

      await Application.updateOne({ _id: app._id }, { $set: { matchPercentage: finalScore, matchedKeywords, missingKeywords, rankingEngine: algorithm, rankingCalculatedAt: new Date() } });

      await RankingResult.findOneAndUpdate({ applicationId: app._id }, { $set: { jobId: app.jobId, applicationId: app._id, userId: app.userId, resumeId: app.resumeId, score: finalScore, matchedKeywords, missingKeywords, algorithm, jobTokenCount: 0, candidateTokenCount: 0 } }, { upsert: true });

      processed++;
      if (processed % 50 === 0) console.log('Processed', processed);
    } catch (err) {
      console.error('Failed for application', doc._id, err.message);
    }
  }

  console.log('Done. Processed', processed);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
