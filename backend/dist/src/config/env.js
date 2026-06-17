import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('5000'),
    DATABASE_URL: z.string().url(),
    MONGODB_URI: z.string().url().optional(),
    JWT_SECRET: z.string().min(10),
    JWT_REFRESH_SECRET: z.string().min(10),
    REDIS_URL: z.string().url().optional(),
    GEMINI_API_KEY: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    FRONTEND_URL: z.string().optional(),
});
const envParsed = envSchema.safeParse(process.env);
if (!envParsed.success) {
    console.error('❌ Invalid environment variables:', envParsed.error.format());
    process.exit(1);
}
export const env = envParsed.data;
//# sourceMappingURL=env.js.map