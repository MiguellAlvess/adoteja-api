export interface PhotoStorage {
  upload(input: PhotoInput): Promise<string>
}

export type PhotoInput = {
  buffer: Buffer
  filename: string
  mimeType: string
}
