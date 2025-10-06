import express from "express";
import { createClient } from 'redis';
import prisma from "../../db/index.js";
import { connect } from "http2";
// import prisma from "@db/index"
const app = express();
app.use(express.json());

const REDIS_QUEUE_KEY = "jobs:queue";
const REDIS_DLQ_QUEUE_KEY = "jobs:dlq";

const PORT = process.env.PORT ?? 4000;

const redis = createClient();
redis.on("error", (error) => { console.error("redis error", error) });

const dlqRedis = createClient();
dlqRedis.on("error", (error) => {
    console.log("error on connecting to dlq redis queue!", error)
});
const response = redis.connect();
if (!response) {
    console.log("connection failed to redis");
}
const response2 = dlqRedis.connect();
if (!response2) {
    console.log("connection failed to dlq redis!");
}

async function startServer() {

    console.log("the startServer is being started!")


    app.use((req, res, next) => {
        console.log("Incoming:", req.method, req.url);
        next();
    });

    app.get("/", (req, res) => {
        res.json({
            message: "hello from redis app!"
        })
    })
    app.get("/test", (req, res) => {
        res.send("Test route works!");
    });



    app.post('/postjob', async (req, res) => {
        try {
            const { type, payload = {}, runAfter = null, maxAttempts = 5 } = req.body;
            if (!type) {
                return res.status(400).json({
                    message: "this is required!"
                })
            }

            const job = await prisma.job.create({
                data: {
                    type,
                    payload,
                    maxAttempts,
                    runAfter: runAfter ? new Date(runAfter) : null,
                }
            })
            const now = new Date();
            if (!job.runAfter || job.runAfter <= now) {
                console.log("pushing Job to redis: ", job.id,);
                await redis.lPush(REDIS_QUEUE_KEY, job.id);
            }
            return res.status(201).json({ id: job.id, status: job.status });

        } catch (err) {
            console.error("POST /jobs error:", err);
            return res.status(500).json({ error: "job creation failed" });
        }
    });

    app.get("/jobs/:id", async (req, res) => {
        const id = req.params.id;
        const response = await prisma.job.findUnique({
            where: {
                id,
            }
        })
        if (!response) {
            return res.status(404).json({
                error: "could not found!"
            })
        }
        return res.json(response);
    })

    app.get("/jobs/dlq", async (req, res) => {

        try {
            const allDqlJobs = await dlqRedis.lRange(REDIS_DLQ_QUEUE_KEY, 0, -1);
            if (!allDqlJobs || allDqlJobs.length === 0) {
                return res.json({ jobs: [] })
            }
            const Jobs = await prisma.job.findMany({
                where: {
                    id: {
                        in: allDqlJobs
                    }
                }
            })
            return res.json({
                Jobs
            })
        } catch (e) {
            console.log("Failed to fetch the DLQ queue")
            return res.status(400).json({
                error: "could not fetch the dlq queue"
            })
        }
    })

    app.listen(PORT, () => {
        console.log("app is listening on port", PORT);
    })
}

startServer().catch((e) => {
    console.error("Failed to start API", e);
    process.exit(1);
});


// pnpm install  # make sure everything is up to date
// rm -rf node_modules/.prisma
// rm -rf packages/db/node_modules/@prisma
// rm -rf packages/api/node_modules/@prisma
// pnpm exec prisma generate --schema packages/db/prisma/schema.prisma