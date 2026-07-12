#!/usr/bin/env node
const mongoose = require('mongoose');
const Application = require('../database/Application.model');
const Job = require('../database/Job.model');
const Resume = require('../database/Resume.model');

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

const SKILL_DICTIONARY = ['react','nextjs','nodejs','mongodb','express','typescript','docker','aws'];
function extractSkills(text){
  const normalized = String(text||'').toLowerCase();
  return SKILL_DICTIONARY.filter(s=>normalized.includes(s));
}

function calculateSkillMatch(jobSkills, candidateSkills){
  if(!Array.isArray(jobSkills)||jobSkills.length===0) return 0;
  const nj = jobSkills.map(s=>String(s).toLowerCase().trim()).filter(Boolean);
  const nc = candidateSkills.map(s=>String(s).toLowerCase().trim()).filter(Boolean);
  const matched = nj.filter(s=>nc.includes(s));
  return Number(((matched.length / nj.length)*100).toFixed(2));
}

function extractYearsFromText(text){
  if(!text||!text.trim()) return 0;
  const m = String(text).toLowerCase().match(/(\d+(?:\.\d+)?)(?:\s*-\s*\d+(?:\.\d+)?)?\s*(?:\+)?\s*(?:years?|yrs?)/i);
  if(m&&m[1]) return Number(m[1]);
  return 0;
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
  const m=n.match(/\bprojects?\b/g);
  if(m&&m.length) return m.length;
  const alt=n.match(/project[:\-]/g);
  return alt?alt.length:0;
}

function calculateProjectScore(num){
  if(!Number.isFinite(num)||num<=0) return 0;
  return Math.min(100, Number(((num/5)*100).toFixed(2)));
}

function calculateWeightedRankingScore({similarity, skillMatch, experienceScore, educationScore, projectScore}){
  const final = similarity*0.4 + skillMatch*0.3 + experienceScore*0.15 + educationScore*0.1 + projectScore*0.05;
  return Number(final.toFixed(2));
}

async function main(){
  const id = process.argv[2];
  if(!id){
    console.error('Usage: node scripts/recalcApplication.js <applicationId>');
    process.exit(2);
  }

  let mongoUri = process.env.MONGODB_URI || process.env.MONGODBURI;
  if (!mongoUri) {
    const fs = require('fs');
    const path = require('path');
    const root = path.resolve(__dirname, '..');
    const candidates = ['.env.local', '.env', '.env.development'];
    for (const f of candidates) {
      const p = path.join(root, f);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8');
        const match = content.match(/MONGODB_URI\s*=\s*(.+)/);
        if (match && match[1]) {
          mongoUri = match[1].trim();
          break;
        }
      }
    }
  }

  if (!mongoUri) {
    console.error('MONGODB_URI env var is required (set in environment or in .env(.local))');
    process.exit(2);
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 });

  const application = await Application.findById(id).lean();
  if(!application){
    console.error('Application not found');
    process.exit(1);
  }
  const job = await Job.findById(application.jobId).lean();
  const resume = await Resume.findById(application.resumeId).lean();

  if(!job||!resume){
    console.error('Job or Resume not found');
    process.exit(1);
  }

  const jobEmbedding = (job.embedding||[]);
  const resumeEmbedding = (resume.embedding||[]);
  const similarity = (Array.isArray(jobEmbedding)&&Array.isArray(resumeEmbedding)&&jobEmbedding.length>0&&resumeEmbedding.length>0)? similarityToPercentage(cosineSimilarity(jobEmbedding, resumeEmbedding)) : 0;

  const candidateSkills = Array.from(new Set([...(application.skills||[]), ...(resume.extractedSkills||[])]));
  const jobSkills = job.requiredSkills || [];
  const skillMatch = calculateSkillMatch(jobSkills, candidateSkills);

  const candidateYears = Number(application.experience) || extractYearsFromText(String(resume.extractedExperience||application.experience||'')) || 0;
  const requiredYears = extractYearsFromText(String(job.description||''));
  const experienceScore = calculateExperienceScore(candidateYears, requiredYears);

  const educationScore = calculateEducationScore(String(resume.extractedEducation||''));
  const projectCount = countProjectSections(String(resume.parsedText||''));
  const projectScore = calculateProjectScore(projectCount);

  const finalScore = calculateWeightedRankingScore({ similarity, skillMatch, experienceScore, educationScore, projectScore });

  console.log(JSON.stringify({ applicationId: String(application._id), similarity, skillMatch, experienceScore, educationScore, projectScore, finalScore, matchedKeywords: job.requiredSkills? (job.requiredSkills.map(s=>String(s).toLowerCase()).filter(s=>candidateSkills.map(c=>String(c).toLowerCase()).includes(s))) : [] , missingKeywords: job.requiredSkills? (job.requiredSkills.map(s=>String(s).toLowerCase()).filter(s=>!candidateSkills.map(c=>String(c).toLowerCase()).includes(s))) : [] , jobEmbeddingLength: jobEmbedding.length, resumeEmbeddingLength: resumeEmbedding.length }, null, 2));

  await mongoose.disconnect();
}

main().catch(err=>{ console.error(err); process.exit(1); });
