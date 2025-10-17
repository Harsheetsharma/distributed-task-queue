import { createClient } from "redis";

import prisma from "../../db/index";

const REDIS_QUEUE_KEY = "jobs:queue";
const REDIS_DLQ_QUEUE_KEY = "jobs:dlq";


const redis = createClient();
redis.on("error", (err) => console.error("Redis error", err));

const dlqRedis = createClient();
dlqRedis.on("error", (error) => {
    console.log("error on connecting to dlq redis queue!", error)
});

function backoffDelay(attempts: number) {
    const delay = Math.pow(2, attempts) * 1000;
    return Math.min(delay, 30000);
}

function sleep(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

async function processJob(Jobid: string) {

    await prisma.job.update({
        where: { id: Jobid },
        data: { status: "RUNNING" },
    });


    const job = await prisma.job.findUnique({
        where: {
            id: Jobid
        }
    });
    if (!job) {
        console.warn("could not found the job", Jobid);
        return;
    }
    try {
        console.log("processing the job", Jobid, "job type", job.type);
        await sleep(500);
        console.log("slept for 500 miliseconds!")


        console.log("updating the job status now...");
        await prisma.job.update({
            where: {
                id: Jobid
            },
            data: {
                status: "SUCCESS", attempts: { set: job.attempts ?? 0 }
            }
        });
        console.log("Job processed SUCCESS", Jobid);
        console.log("waiting for more Jobs to process!...")
    } catch (error) {
        console.log("Job process failed", Jobid);

        const updated = await prisma.job.update({
            where: { id: Jobid },
            data: {
                attempts: { increment: 1 },
                lastError: String(error),
                status: "FAILED",
            }
        });

        const CalbackOffDelay = backoffDelay(updated.attempts ?? 0);
        if ((updated.attempts ?? 0) >= (updated.maxAttempts ?? 5)) {
            await prisma.job.update({
                where: { id: Jobid },
                data: { status: "DLQ" }
            });
            console.log("Moving Job to DLQ", Jobid);
            await dlqRedis.lPush(REDIS_DLQ_QUEUE_KEY, Jobid);
        }
        else {
            console.log("Requiring the Job", Jobid, "with exponential backoff", CalbackOffDelay, "ms");
            await sleep(CalbackOffDelay);
            await redis.lPush(REDIS_QUEUE_KEY, Jobid);
        }
    }
}

async function runWorker() {
    await redis.connect();
    await dlqRedis.connect()

    console.log("Worker connected to Redis");
    while (true) {
        try {
            // try to pop one job (RPOP returns string | null)
            const jobId = await redis.rPop(REDIS_QUEUE_KEY);
            if (!jobId) {
                // queue empty -> sleep a bit
                await sleep(700);
                continue;
            }
            await processJob(jobId);
        } catch (err) {
            console.error("Worker loop error:", err);
            await sleep(1000);
        }
    }
}

async function ScheduleDbCheck() {
    console.log("Database is being checked right now...")
    const now = new Date();

    try {
        const isItTime = await prisma.job.findMany({
            where: {
                runAfter: {
                    lte: now
                }
            }
        });
        if (isItTime.length > 0) {
            const enqueueJobs = isItTime.map(async (key) => {
                const timeToGo = key.runAfter;
                if (timeToGo && timeToGo <= now) {
                    await redis.lPush(REDIS_QUEUE_KEY, key.id);
                }
            })
            await Promise.all(enqueueJobs); // ⬅️ Wait for all pushes to finish
            console.log("Jobs pushed to queue:", isItTime.length);
        }
        else {
            console.log("No jobs ready to be pushed at this time.")
        }
    } catch (err) {
        console.error("Failed to check Jobs: ", err)
    }
}

setInterval(() => {
    ScheduleDbCheck();
}, 60_000)


// async function checkAndEnqueueRecurringJobs() {

//     async function checkAndEnqueueRecurringJobs() {
//   const now = new Date();

//   // 1. Get all recurring jobs that are enabled and due to run
//   const dueJobs = await prisma.recurringJob.findMany({
//     where: {
//       enabled: true,
//       OR: [
//         { lastRunAt: null },
//         {
//           lastRunAt: {
//             lte: new Date(now.getTime() - 1000 * intervalSeconds)  // interval-based filtering
//           }
//         }
//       ]
//     }
//   });

//   // 2. For each job, create a normal job and enqueue it
//   for (const rJob of dueJobs) {
//     const job = await prisma.job.create({
//       data: {
//         type: rJob.type,
//         payload: rJob.payload,
//         maxAttempts: rJob.maxAttempts,
//       }
//     });

//     await redis.lPush("jobs:queue", job.id);

//     // 3. Update the recurringJob's lastRunAt
//     await prisma.recurringJob.update({
//       where: { id: rJob.id },
//       data: { lastRunAt: now }
//     });

//     console.log(`Recurring job ${rJob.name} executed and enqueued.`);
//   }
// }

// }

async function FirstTimeCheckAndEnqueueRecurringJobs() {
    const now = new Date();
    let arrayOfRecurringJobs: { recurringJobsId: string, recurringJobsInterval: number }[] = [];
    const recurJob = await prisma.recurringJob.findMany({
        where: {
            whenToRun: {
                lte: now
            }
        }
    })
    if (!recurJob) {
        return console.log("could not found the job");
    }

    if ((await recurJob).length > 0) {
        for (const key of recurJob) {
            const isitTime = key.whenToRun;
            if (!isitTime || isitTime < now) {
                const update = await prisma.recurringJob.update({
                    where: {
                        id: key.id
                    }, data: {
                        lastRunAt: now,
                        whenToRun: new Date(now.getTime() + key.intervalSeconds)
                    }
                })
                arrayOfRecurringJobs.push({ recurringJobsId: key?.id, recurringJobsInterval: key.intervalSeconds })
            }
        }

    }

    async function runJobBasedOnIntervalSeconds() {
        for (let i = 0; i < arrayOfRecurringJobs.length; i++) {
            setInterval(async () => {
                const response = await prisma.recurringJob.findUnique({
                    where: {
                        id: arrayOfRecurringJobs[i].recurringJobsId
                    }
                })
                console.log("processing job", response?.id);
            }, arrayOfRecurringJobs[i].recurringJobsInterval)
        }
    }

    runJobBasedOnIntervalSeconds();
}

FirstTimeCheckAndEnqueueRecurringJobs();

runWorker().catch((e) => {
    console.error("Worker failed:", e);
    process.exit(1);
});