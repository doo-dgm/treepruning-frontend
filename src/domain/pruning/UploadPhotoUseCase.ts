import type { PruningRepository } from './PruningRepository'

export class UploadPhotoUseCase {
  constructor(private readonly repo: PruningRepository) {}

  execute(file: File): Promise<string> {
    return this.repo.uploadPhoto(file)
  }
}
