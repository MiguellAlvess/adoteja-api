import { promises as fs } from "fs"
import path from "path"
import {
  PhotoInput,
  PhotoStorage,
} from "../../application/ports/storage/photo-storage.js"

export class MulterPhotoStorageAdapter implements PhotoStorage {
  constructor(private readonly baseDir = path.resolve("uploads")) {}

  async upload(input: PhotoInput): Promise<string> {
    await fs.mkdir(this.baseDir, { recursive: true })
    const safeName = Date.now() + "-" + input.filename.replace(/\s+/g, "_")
    const filePath = path.join(this.baseDir, safeName)
    await fs.writeFile(filePath, input.buffer)
    return `/uploads/${safeName}`
  }
}
