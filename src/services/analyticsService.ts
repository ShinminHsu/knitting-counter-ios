import { CraftType } from '../types'

export async function logScreenView(_screenName: string): Promise<void> {}
export async function logProjectCreated(_craftType: CraftType): Promise<void> {}
export async function logTrackingStarted(): Promise<void> {}
export async function logChartCompleted(): Promise<void> {}
export async function logRoundAdded(): Promise<void> {}
export async function logStitchAdded(): Promise<void> {}
export async function logTemplateUsed(): Promise<void> {}
export async function logImport(): Promise<void> {}
export async function logExport(): Promise<void> {}
