#!/usr/bin/env node
/*
  Scans resumes with parsedText and missing extracted fields, populates
  `extractedSkills`, `extractedEducation`, `extractedExperience`, and
  recalculates application rankings for applications referencing updated resumes.

  Usage:
    node scripts/repairResumesAndRecalc.js [--dry-run]

  Ensure MONGODB_URI is available in env or in .env(.local).
*/

const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

function preprocessText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const SKILL_DICTIONARY = ['react','nextjs','nodejs','mongodb','express','typescript','docker','aws'];
function extractSkills(text){
  const n = preprocessText(text);
  return SKILL_DICTIONARY.filter(s=>n.includes(s));
}

function extractEducation(text){
  const n = String(text||'').toLowerCase();
  if(/phd|doctorate/.test(n)) return 'PhD';
  if(/master|msc|mtech/.test(n)) return 'Masters';
  if(/bachelor|bca|bsc|be|btech|bs/.test(n)) return 'Bachelors';
  if(/diploma|certificate/.test(n)) return 'Diploma';
  return '';
}

function extractYearsFromText(text){
  if(!text||!text.trim()) return 0;
  const m = String(text).toLowerCase().match(/(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:\+)?\s*(?:years?|yrs?)/i);
  if(m&&m[1]) return Number(m[1]);
  return 0;
}

function cosineSimilarity(a,b){
  if(!Array.isArray(a)||!Array.isArray(b)||a.length===0||b.length===0||a.length!==b.length) return 0;
  let dot=0, na=0, nb=0;
  for(let i=0;i<a.length;i++){ const va=Number(a[i])||0; const vb=Number(b[i])||0; dot+=va*vb; na+=va*va; nb+=vb*vb; }
  if(na===0||nb===0) return 0; return dot/(Math.sqrt(na)*Math.sqrt(nb));
}
function similarityToPercentage(sim){ if(!Number.isFinite(sim)) return 0; return Math.max(0, Math.min(100, sim*100)); }

function calculateSkillMatch(jobSkills, candidateSkills){
  if(!Array.isArray(jobSkills)||jobSkills.length===0) return 0;
  const nj = jobSkills.map(s=>String(s).toLowerCase().trim()).filter(Boolean);
  const nc = candidateSkills.map(s=>String(s).toLowerCase().trim()).filter(Boolean);
  const matched = nj.filter(s=>nc.includes(s));
  return Number(((matched.length/nj.length)*100).toFixed(2));
}

function calculateExperienceScore(candidateYears, requiredYears){
  if(!Number.isFinite(candidateYears)) return 0;
  if(!Number.isFinite(requiredYears)||requiredYears<=0) return 100;
  if(candidateYears>=requiredYears) return 100;
  return Number(((candidateYears/requiredYears)*100).toFixed(2));
}

function calculateEducationScore(text){
  const n=String(text||'').toLowerCase();
  if(/phd|doctorate/.test(n)) return 100;
  if(/master|msc|mtech/.test(n)) return 90;
  if(/bachelor|bca|bsc|be|btech|bs/.test(n)) return 80;
  if(/diploma|certificate/.test(n)) return 60;
  return 0;
}

function countProjectSections(text){
  if(!text||!text.trim()) return 0;
  const n=String(text).toLowerCase();
  const m=n.match(/\bprojects?\b/g); if(m&&m.length) return m.length; const alt=n.match(/project[:\-]/g); return alt?alt.length:0;
}
function calculateProjectScore(numberOfRelevantProjects){ if(!Number.isFinite(numberOfRelevantProjects)||numberOfRelevantProjects<=0) return 0; const score = (numberOfRelevantProjects/5)*100; return Math.min(100, Number(score.toFixed(2))); }

function calculateWeightedRankingScore({ similarity, skillMatch, experienceScore, educationScore, projectScore }){
  const final = similarity*0.4 + skillMatch*0.3 + experienceScore*0.15 + educationScore*0.1 + projectScore*0.05;
  return Number(final.toFixed(2));
}

async function main(){
  const dryRun = process.argv.includes('--dry-run');

  let mongoUri = process.env.MONGODB_URI || process.env.MONGODBURI;
  if(!mongoUri){
    const root = path.resolve(__dirname, '..');
    const candidates = ['.env.local', '.env', '.env.development'];
    for(const f of candidates){
      const p = path.join(root, f);
      if(fs.existsSync(p)){
        const content = fs.readFileSync(p,'utf8');
        const m = content.match(/MONGODB_URI\s*=\s*(.+)/);
        if(m&&m[1]){ mongoUri = m[1].trim(); break; }
      }
    }
  }
  if(!mongoUri){ console.error('MONGODB_URI not found in env or .env files'); process.exit(2); }

  const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });
  await client.connect();
  const db = client.db();
  const resumesCol = db.collection('resumes');
  const appsCol = db.collection('applications');
  const jobsCol = db.collection('jobs');
  const rankingCol = db.collection('rankingresults');

  const cursor = resumesCol.find({ parsedText: { $exists: true, $ne: '' } });
  let processed = 0;
  while(await cursor.hasNext()){
    const resume = await cursor.next();
    const needSkills = !Array.isArray(resume.extractedSkills) || resume.extractedSkills.length === 0;
    const needEdu = !resume.extractedEducation || !String(resume.extractedEducation).trim();
    const needExp = !resume.extractedExperience || !String(resume.extractedExperience).trim();

    if(!needSkills && !needEdu && !needExp){ continue; }

    const cleaned = preprocessText(resume.parsedText || resume.resumeText || '');
    const skills = extractSkills(cleaned);
    const education = extractEducation(resume.parsedText || '');
    const years = extractYearsFromText(resume.parsedText || '');

    const updateFields = {};
    if (needSkills) updateFields.extractedSkills = skills;
    if (needEdu) updateFields.extractedEducation = education;
    if (needExp) updateFields.extractedExperience = years ? String(years) : '';

    console.log('Resume', String(resume._id), 'will be updated:', updateFields);
    if(!dryRun){
      await resumesCol.updateOne({ _id: resume._id }, { $set: updateFields });
    }

    // Recalculate applications pointing to this resume
    const apps = await appsCol.find({ resumeId: resume._id }).toArray();
    for(const app of apps){
      const job = await jobsCol.findOne({ _id: ObjectId(app.jobId) });
      if(!job){ console.warn('Job not found for app', String(app._id)); continue; }

      const jobEmbedding = Array.isArray(job.embedding) ? job.embedding : [];
      const resumeEmbedding = Array.isArray(resume.embedding) ? resume.embedding : [];
      const similarity = (jobEmbedding.length>0 && resumeEmbedding.length>0) ? similarityToPercentage(cosineSimilarity(jobEmbedding, resumeEmbedding)) : 0;

      const candidateSkills = Array.from(new Set([...(app.skills||[]), ...(skills||resume.extractedSkills||[])]));
      const jobSkills = job.requiredSkills || [];
      const skillMatch = calculateSkillMatch(jobSkills, candidateSkills);

      const candidateYears = Number(app.experience) || extractYearsFromText(String(resume.extractedExperience || app.experience || '')) || 0;
      const requiredYears = extractYearsFromText(String(job.description || ''));
      const experienceScore = calculateExperienceScore(candidateYears, requiredYears);

      const educationScore = calculateEducationScore(String(resume.extractedEducation || ''));
      const projectCount = countProjectSections(String(resume.parsedText || ''));
      const projectScore = calculateProjectScore(projectCount);

      const finalScore = calculateWeightedRankingScore({ similarity, skillMatch, experienceScore, educationScore, projectScore });

      const normalizedJobSkills = (jobSkills || []).map(s=>String(s).toLowerCase().trim()).filter(Boolean);
      const normalizedCandidateSkills = candidateSkills.map(s=>String(s).toLowerCase().trim()).filter(Boolean);
      const matchedKeywords = normalizedJobSkills.filter(s=>normalizedCandidateSkills.includes(s));
      const missingKeywords = normalizedJobSkills.filter(s=>!normalizedCandidateSkills.includes(s));

      console.log(' App', String(app._id), '-> finalScore', finalScore, 'sim', similarity, 'skillMatch', skillMatch);

      if(!dryRun){
        await appsCol.updateOne({ _id: app._id }, { $set: { matchPercentage: finalScore, matchedKeywords, missingKeywords, rankingEngine: 'local_weighted_v1', rankingCalculatedAt: new Date() } });
        await rankingCol.updateOne({ applicationId: app._id }, { $set: { jobId: job._id, applicationId: app._id, userId: app.userId, resumeId: resume._id, score: finalScore, matchedKeywords, missingKeywords, algorithm: 'local_weighted_v1', jobTokenCount: 0, candidateTokenCount: 0 } }, { upsert: true });
      }
    }

    processed += 1;
  }

  console.log('Processed resumes:', processed);
  await client.close();
}

main().catch(err=>{ console.error(err); process.exit(1); });
