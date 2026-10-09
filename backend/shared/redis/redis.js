import Redis from "ioredis"

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

async function upstashCommand(...command) {
    const response = await fetch(upstashUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${upstashToken}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
    })
    const result = await response.json()

    if (!response.ok || result.error) {
        throw new Error(`Redis command failed: ${result.error || response.statusText}`)
    }

    return result.result
}

let redis
if (upstashUrl && upstashToken) {
    redis = {
        get: (key) => upstashCommand("GET", key),
        set: (key, value, ...options) => upstashCommand("SET", key, value, ...options),
        del: (...keys) => upstashCommand("DEL", ...keys),
        incr: (key) => upstashCommand("INCR", key),
        expire: (key, seconds) => upstashCommand("EXPIRE", key, seconds),
        ttl: (key) => upstashCommand("TTL", key)
    }
} else if (process.env.VERCEL === "1") {
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required on Vercel")
} else {
    redis = new Redis(process.env.REDIS_URL)
}

if (redis instanceof Redis) {
    redis.on("connect", () => {
        console.log("redis connected")
    })
}

export default redis