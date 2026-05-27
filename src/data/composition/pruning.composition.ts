import { PruningRepositoryImpl }                from '@/data/repositories/PruningRepositoryImpl'
import { GetPruningFormDataUseCase }            from '@/domain/pruning/GetPruningFormDataUseCase'
import { SchedulePruningUseCase }               from '@/domain/pruning/SchedulePruningUseCase'
import { GetPruningsUseCase }                   from '@/domain/pruning/GetPruningsUseCase'
import { GetTreesBySectorUseCase }              from '@/domain/pruning/GetTreesBySectorUseCase'
import { UploadPhotoUseCase }                   from '@/domain/pruning/UploadPhotoUseCase'
import { SchedulePreventivePruningUseCase }     from '@/domain/pruning/SchedulePreventivePruningUseCase'

const repo = new PruningRepositoryImpl()

export const getPruningFormDataUseCase      = new GetPruningFormDataUseCase(repo)
export const schedulePruningUseCase         = new SchedulePruningUseCase(repo)
export const getPruningsUseCase             = new GetPruningsUseCase(repo)
export const getTreesBySectorUseCase        = new GetTreesBySectorUseCase(repo)
export const uploadPhotoUseCase             = new UploadPhotoUseCase(repo)
export const schedulePreventiveUseCase      = new SchedulePreventivePruningUseCase(repo)
