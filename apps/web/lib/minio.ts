/* eslint-disable turbo/no-undeclared-env-vars */

import {Client as MinioClient} from "minio"

export const minioClient = new MinioClient({
    endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
    port: Number(process.env.MINIO_PORT) || 9000,
    useSSL: false, 
    accessKey: process.env.MINIO_ROOT_USER || "minioadmin",
    secretKey: process.env.MINIO_ROOT_PASSWORD || "minioadmin123"
})

