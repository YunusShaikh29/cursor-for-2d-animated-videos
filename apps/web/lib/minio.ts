/* eslint-disable turbo/no-undeclared-env-vars */

import { storageClient } from 'shared/storage';

export { storageClient };

// If you need to get video URLs in your Next.js app:
export const getVideoUrl = async (fileName: string) => {
  return await storageClient.getFileUrl(fileName);
};
