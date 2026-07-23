require('dotenv').config();
const config = require('../config');
const connectDB = require('../config/db');
const { Worker } = require('bullmq');
const queueConnection = require('../config/queueConnection');
const logger = require('../utils/logger');

const { Emitter } = require('@socket.io/redis-emitter');
const IORedis = require('ioredis');
const emitterPubClient = new IORedis(config.redis.url);
// Publishes into the same Redis pub/sub channel the main API server's io.adapter() subscribes to.
// No HTTP server, no direct client connections — this only emits, it never listens.
emitterPubClient.on('error', (err) => logger.error('Worker emitter Redis error', { error: err.message }));

const workerIo = new Emitter(emitterPubClient);

const resumeScanRepository = require('../repositories/resumeScan.repository');
const roadmapRepository = require('../repositories/roadmap.repository');
const portfolioScanRepository = require('../repositories/portfolioScan.repository');
const { analyzeResume } = require('../services/ai/resumeService');
const { generateRoadmap } = require('../services/ai/roadmapService');
const { getPortfolioData } = require('../services/github/githubApiService');
const { analyzePortfolio } = require('../services/ai/githubIntelligenceService');
const userRepository = require('../repositories/user.repository');
const mailSender = require('../utils/mailsender');
const emailTemplate = require('../mail/templates/emailVerificationTemplate');
const ResumeScan = require('../models/ResumeScan');
const Roadmap = require('../models/Roadmap');
const PortfolioScan = require('../models/PortfolioScan');
const Internship = require('../models/Internship');
const scheduleCronJobs = require('../jobs/scheduleCronJobs');

connectDB();

// ── AI worker ────────────────────────────────────────────────────────────────
const worker = new Worker('ai-queue', async (job) => {
  logger.info('Processing job', { jobId: job.id, jobName: job.name });

  if (job.name === 'resume-analyze') {
    const { scanId } = job.data;
    const scan = await resumeScanRepository.findById(scanId);
    if (!scan) throw new Error(`ResumeScan ${scanId} not found`);
    scan.status = 'processing';
    await scan.save();

    try {
      const aiResult = await analyzeResume({
        resumeText: scan.resumeText,
        jobDescription: scan.jobDescription,
        targetRole: scan.targetRole,
      });
      scan.atsScore = aiResult.atsScore;
      scan.result = {
        strengths: aiResult.strengths,
        weaknesses: aiResult.weaknesses,
        missingKeywords: aiResult.missingKeywords,
        presentKeywords: aiResult.presentKeywords,
        improvements: aiResult.improvements,
        sectionFeedback: aiResult.sectionFeedback,
        overallFeedback: aiResult.overallFeedback,
      };
      scan.status = 'completed';
      await scan.save();
      workerIo.to(`user_${scan.user}`).emit('resumeReady', { scanId: scan._id.toString(), status: 'completed' });
    } catch (err) {
      scan.status = 'failed';
      scan.errorMessage = err.message;
      await scan.save();
      workerIo.to(`user_${scan.user}`).emit('resumeReady', { scanId: scan._id.toString(), status: 'failed' });
      throw err;
    }
  }

  else if (job.name === 'roadmap-generate') {
    const { roadmapId } = job.data;
    const roadmap = await roadmapRepository.findById(roadmapId);
    if (!roadmap) throw new Error(`Roadmap ${roadmapId} not found`);
    roadmap.status = 'processing';
    await roadmap.save();

    try {
      const aiResult = await generateRoadmap({
        year: roadmap.year,
        branch: roadmap.branch,
        goalType: roadmap.goalType,
        interests: roadmap.interests,
      });
      roadmap.title = aiResult.title;
      roadmap.weeks = aiResult.weeks;
      roadmap.status = 'completed';
      await roadmap.save();
      workerIo.to(`user_${roadmap.user}`).emit('roadmapReady', { roadmapId: roadmap._id.toString(), status: 'completed' });
    } catch (err) {
      roadmap.status = 'failed';
      roadmap.errorMessage = err.message;
      worker.on('failed', (job, err) => {
  logger.error('Worker: job failed', { jobId: job?.id, jobName: job?.name, error: err.message, stack: err.stack });
});
      await roadmap.save();
      workerIo.to(`user_${roadmap.user}`).emit('roadmapReady', { roadmapId: roadmap._id.toString(), status: 'failed' });
      throw err;
    }
  }

  else if (job.name === 'github-analyze') {
    const { scanId, userId } = job.data;
    const scan = await portfolioScanRepository.findByIdForUser(scanId, userId);
    if (!scan) throw new Error(`PortfolioScan ${scanId} not found`);
    scan.status = 'processing';
    await scan.save();

    try {
      const user = await userRepository.findById(userId, { withGithubToken: true });
      const { repos } = await getPortfolioData(user.githubAccessToken);
      if (repos.length === 0) throw new Error('No public repositories found to analyze');

      const aiResult = await analyzePortfolio({ username: user.githubUsername, repos });
      scan.healthScore = aiResult.healthScore;
      scan.scoreBreakdown = aiResult.scoreBreakdown;
      scan.recruiterPerception = aiResult.recruiterPerception;
      scan.rawStats = { repoCount: repos.length, reposAnalyzed: repos.map(r => r.name) };
      scan.status = 'completed';
      await scan.save();
      workerIo.to(`user_${scan.user}`).emit('githubScanReady', { scanId: scan._id.toString(), status: 'completed' });
    } catch (err) {
      scan.status = 'failed';
      scan.errorMessage = err.message;
      await scan.save();
      workerIo.to(`user_${scan.user}`).emit('githubScanReady', { scanId: scan._id.toString(), status: 'failed' });
      throw err;
    }
  }
}, { connection: queueConnection, concurrency: 3 });

worker.on('completed', (job) => logger.info('Worker: job completed', { jobId: job.id, jobName: job.name }));
worker.on('failed', (job, err) => logger.error('Worker: job failed', { jobId: job?.id, jobName: job?.name, error: err.message }));

// ── Email worker ─────────────────────────────────────────────────────────────
const emailWorker = new Worker('email-queue', async (job) => {
  if (job.name === 'send-otp-email') {
    const { email, otp } = job.data;
    await mailSender(email, 'Email Verification - IdeaHub', emailTemplate(otp));
    logger.info('OTP email sent', { jobId: job.id, email });
  }
}, { connection: queueConnection, concurrency: 5 });

emailWorker.on('failed', (job, err) => logger.error('Email job failed after retries', { jobId: job?.id, error: err.message }));

// ── Cron worker ──────────────────────────────────────────────────────────────
const cronWorker = new Worker('cron-queue', async (job) => {
  if (job.name === 'cleanup-stuck-scans') {
    const cutoff = new Date(Date.now() - 10 * 60 * 1000); // stuck for more than 10 minutes = dead, not just slow
    const staleQuery = { status: { $in: ['pending', 'processing'] }, createdAt: { $lt: cutoff } };
    const failUpdate = { status: 'failed', errorMessage: 'Timed out — processing took too long, please try again' };

    const [resumeResult, roadmapResult, githubResult] = await Promise.all([
      ResumeScan.updateMany(staleQuery, failUpdate),
      Roadmap.updateMany(staleQuery, failUpdate),
      PortfolioScan.updateMany(staleQuery, failUpdate),
    ]);

    logger.info('Cron: cleaned up stuck scans', {
      resumeCleared: resumeResult.modifiedCount,
      roadmapCleared: roadmapResult.modifiedCount,
      githubCleared: githubResult.modifiedCount,
    });
  }

  if (job.name === 'expire-internships') {
    const result = await Internship.updateMany(
      { status: 'active', deadline: { $lt: new Date() } },
      { status: 'expired' }
    );
    logger.info('Cron: expired internships', { count: result.modifiedCount });
  }
}, { connection: queueConnection, concurrency: 1 });

cronWorker.on('failed', (job, err) => logger.error('Cron job failed', { jobName: job?.name, error: err.message }));

scheduleCronJobs();

logger.info('🛠️  AI worker process started, listening on ai-queue...');
logger.info('📧 Email worker started, listening on email-queue...');
logger.info('⏰ Cron worker started, listening on cron-queue...');