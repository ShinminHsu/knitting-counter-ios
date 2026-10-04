#!/usr/bin/env node
/**
 * 驗證匯入／還原時的完成狀態推導（fix-import-progress-recalc）。
 *
 * 先用 tsc 把需要的 TS 編成 CJS，再以 Module._load 注入 mock
 * （MMKV、i18n、expo-* 都不能在 Node 跑），然後直接呼叫純函式與 store action。
 *
 * 用法：node scripts/verify-import-progress.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const require = createRequire(import.meta.url)
const out = mkdtempSync(join(tmpdir(), 'stitchie-verify-'))

// ─── 1. Compile to CJS ────────────────────────────────────────────────────────

execFileSync(
  'npx',
  ['tsc', 'src/stores/useProjectStore.ts', '--outDir', out,
   '--rootDir', '.', '--module', 'commonjs', '--target', 'es2020', '--moduleResolution', 'node',
   '--esModuleInterop', '--skipLibCheck', '--resolveJsonModule'],
  { cwd: ROOT, stdio: ['ignore', 'ignore', 'pipe'] }
)

// ─── 2. Inject mocks for anything that needs a device ─────────────────────────

const store = new Map()
const mocks = {
  'react-native-mmkv': {
    createMMKV: () => ({
      set: (k, v) => store.set(k, v),
      getString: (k) => store.get(k),
      delete: (k) => store.delete(k),
      getAllKeys: () => [...store.keys()],
    }),
  },
  'expo-localization': { getLocales: () => [{ languageCode: 'en' }] },
  'react-i18next': { initReactI18next: { type: '3rdParty', init() {} } },
}

const Module = require('module')
const realLoad = Module._load
Module._load = function (request, parent, isMain) {
  if (mocks[request]) return mocks[request]
  // 編譯產物放在 temp 目錄，裸模組要回專案根目錄解析（zustand、i18next…）
  if (!request.startsWith('.') && !request.startsWith('/') && !Module.builtinModules.includes(request)) {
    try {
      return realLoad.call(this, require.resolve(request, { paths: [ROOT] }), parent, isMain)
    } catch {
      // 解析不到就讓原本的流程去報錯
    }
  }
  return realLoad.call(this, request, parent, isMain)
}

const { useProjectStore } = require(join(out, 'src/stores/useProjectStore.js'))
const { withDerivedCompletion, calculateProgressPercentage, isProjectComplete } =
  require(join(out, 'src/utils/index.js'))

// ─── 3. Fixtures ──────────────────────────────────────────────────────────────

/** 一圈 n 針的 round */
const round = (id, n) => ({
  id,
  roundNumber: 0,
  patternItems: [{ id: `${id}-i`, type: 'stitch', data: { id: `${id}-s`, type: 'knit', count: n } }],
  notes: '',
})

const chart = (over) => ({
  id: 'c1', name: 'Chart', rounds: [round('r1', 10), round('r2', 10)],
  currentRound: 0, currentStitch: 0, createdAt: '', updatedAt: '', ...over,
})

const project = (charts, over) => ({
  id: 'p1', name: 'Project', craftType: 'knitting', roundStartNumber: 1,
  charts, photos: [], sessions: [], createdAt: '', updatedAt: '', ...over,
})

// ─── 4. Assertions ────────────────────────────────────────────────────────────

let failures = 0
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) { failures++; console.error(`  ✗ ${label}\n      expected ${JSON.stringify(expected)}\n      actual   ${JSON.stringify(actual)}`) }
  else console.log(`  ✓ ${label}`)
}

console.log('\nwithDerivedCompletion')

{ // 回報的 bug：旗標說完成，位置只到一半
  const r = withDerivedCompletion(project([chart({ isCompleted: true, currentRound: 0, currentStitch: 5 })], { isCompleted: true }))
  check('stale isCompleted:true at round 1/2 → not completed', r.charts[0].isCompleted, false)
  check('  project not completed', r.isCompleted, false)
  check('  chart shows 25%', calculateProgressPercentage(r.charts[0]), 25)
  check('  isProjectComplete false', isProjectComplete(r), false)
}

{ // 真的完成的專案不能被誤判
  const r = withDerivedCompletion(project([chart({ isCompleted: false, currentRound: 1, currentStitch: 10 })]))
  check('position at end of last round → completed', r.charts[0].isCompleted, true)
  check('  project completed', r.isCompleted, true)
  check('  chart shows 100%', calculateProgressPercentage(r.charts[0]), 100)
}

{ // currentRound 超出 rounds 範圍 → 進度已走完，補到結尾
  const r = withDerivedCompletion(project([chart({ currentRound: 7, currentStitch: 3 })]))
  check('currentRound past end → clamped to last index', r.charts[0].currentRound, 1)
  check('  stitch snapped to round total', r.charts[0].currentStitch, 10)
  check('  chart completed', r.charts[0].isCompleted, true)
}

{ // 嚴格模式（updateChart 用）不信任旗標
  const r = withDerivedCompletion(project([chart({ isCompleted: true, currentRound: 1, currentStitch: 7 })]))
  check('strict mode ignores isCompleted in last round', r.charts[0].isCompleted, false)
  check('  position left alone', r.charts[0].currentStitch, 7)
}

{ // 匯入模式：舊版織完但少記最後幾針
  const opts = { trustCompletedInLastRound: true }
  const r = withDerivedCompletion(project([chart({ isCompleted: true, currentRound: 1, currentStitch: 7 })]), opts)
  check('import mode trusts flag when position is in the last round', r.charts[0].isCompleted, true)
  check('  stitch snapped to round total', r.charts[0].currentStitch, 10)
  check('  chart shows 100%', calculateProgressPercentage(r.charts[0]), 100)
}

{ // 匯入模式：完成後又加圈的髒資料不受信任規則保護
  const opts = { trustCompletedInLastRound: true }
  const r = withDerivedCompletion(project([chart({ isCompleted: true, currentRound: 0, currentStitch: 5 })]), opts)
  check('import mode distrusts flag outside the last round', r.charts[0].isCompleted, false)
  check('  position left alone', r.charts[0].currentStitch, 5)
}

{ // currentStitch 超過該圈總針數
  const r = withDerivedCompletion(project([chart({ currentRound: 0, currentStitch: 999 })]))
  check('currentStitch past round total → clamped', r.charts[0].currentStitch, 10)
}

{ // 舊檔案缺欄位
  const r = withDerivedCompletion(project([chart({ currentRound: undefined, currentStitch: undefined, isCompleted: true })]))
  check('missing position fields → 0/0, not completed', [r.charts[0].currentRound, r.charts[0].currentStitch, r.charts[0].isCompleted], [0, 0, false])
}

{ // 空 rounds
  const r = withDerivedCompletion(project([chart({ rounds: [], currentRound: 3, currentStitch: 3, isCompleted: true })]))
  check('empty rounds → position 0/0, not completed', [r.charts[0].currentRound, r.charts[0].currentStitch, r.charts[0].isCompleted], [0, 0, false])
}

{ // 空 charts
  const r = withDerivedCompletion(project([], { isCompleted: true }))
  check('empty charts → project not completed', r.isCompleted, false)
}

console.log('\nstore actions')

{ // importProject 洗掉髒旗標
  useProjectStore.setState({ projects: [], deletedProjects: {} })
  useProjectStore.getState().importProject(project([chart({ isCompleted: true, currentStitch: 5 })], { id: 'imp', isCompleted: true }))
  const p = useProjectStore.getState().projects[0]
  check('importProject heals stale flag', [p.isCompleted, p.charts[0].isCompleted], [false, false])
}

{ // MERGE_PATTERN：完成的專案併入未完成的 chart
  useProjectStore.setState({ projects: [], deletedProjects: {} })
  const done = chart({ id: 'done', currentRound: 1, currentStitch: 10 })
  const fresh = chart({ id: 'fresh', currentRound: 0, currentStitch: 0 })
  useProjectStore.getState().overwriteProject(project([done], { id: 'm', isCompleted: true }))
  check('completed project stays completed', useProjectStore.getState().projects[0].isCompleted, true)
  useProjectStore.getState().overwriteProject(project([done, fresh], { id: 'm', isCompleted: true }))
  const p = useProjectStore.getState().projects[0]
  check('merging an unfinished chart drops project completion', p.isCompleted, false)
  check('  finished chart stays completed', p.charts[0].isCompleted, true)
}

{ // 只改名稱不能動完成狀態
  useProjectStore.setState({ projects: [], deletedProjects: {} })
  useProjectStore.getState().importProject(project([chart({ id: 'c1', currentRound: 1, currentStitch: 10 })], { id: 'rn' }))
  check('setup: imported project completed', useProjectStore.getState().projects[0].isCompleted, true)
  useProjectStore.getState().updateChart('rn', 'c1', { name: 'Renamed' })
  const p = useProjectStore.getState().projects[0]
  check('rename leaves completion untouched', [p.isCompleted, p.charts[0].isCompleted], [true, true])
  check('  name applied', p.charts[0].name, 'Renamed')
}

{ // 加一圈到已完成的 chart（既有 chart-progress 行為不可回歸）
  useProjectStore.setState({ projects: [], deletedProjects: {} })
  useProjectStore.getState().importProject(project([chart({ id: 'c1', currentRound: 1, currentStitch: 10 })], { id: 'add' }))
  useProjectStore.getState().updateChart('add', 'c1', { rounds: [round('r1', 10), round('r2', 10), round('r3', 10)] })
  const p = useProjectStore.getState().projects[0]
  check('adding a round un-completes the chart', [p.charts[0].isCompleted, p.isCompleted], [false, false])
}

{ // 既有 chart-progress 行為：重設最後一圈必須取消完成，不能被匯入的信任規則救回
  useProjectStore.setState({ projects: [], deletedProjects: {} })
  useProjectStore.getState().importProject(project([chart({ id: 'c1', currentRound: 1, currentStitch: 10 })], { id: 'rst' }))
  check('setup: completed after import', useProjectStore.getState().projects[0].isCompleted, true)
  useProjectStore.getState().updateChart('rst', 'c1', { currentStitch: 0 })
  const p = useProjectStore.getState().projects[0]
  check('resetting the round un-completes the chart', [p.charts[0].isCompleted, p.isCompleted], [false, false])
  check('  position actually reset', p.charts[0].currentStitch, 0)
}

rmSync(out, { recursive: true, force: true })
console.log(failures === 0 ? '\n✓ all checks passed\n' : `\n✗ ${failures} check(s) failed\n`)
process.exit(failures === 0 ? 0 : 1)
