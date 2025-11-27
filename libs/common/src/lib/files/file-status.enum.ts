export enum FileStatus {
  PENDING = 'PENDING', // User requested upload URL
  UPLOADED = 'UPLOADED', // User confirmed upload completed
  PROCESSING = 'PROCESSING', // File is being analyzed/compressed
  COMPLETED = 'COMPLETED', // Ready for consumption
  FAILED = 'FAILED', // Processing or Upload failed
}
