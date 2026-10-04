#!/usr/bin/env node
/**
 * 掃描 src/ 與 app/ 是否有寫死的中日文字串。
 *
 * 所有顯示給使用者的文字都必須走 i18n（src/i18n/locales/），否則英日文使用者
 * 會看到中文。註解與開發用 log 不算，會先被剝除或列入 allowlist。
 *
 * 用法：node scripts/check-hardcoded-cjk.mjs  （有發現時 exit 1）
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const SCAN_DIRS = ['src', 'app']
const EXTENSIONS = ['.ts', '.tsx']

/** 這些路徑本來就該有中日文 */
const SKIP_PATHS = [
  join('src', 'i18n', 'locales'),
  // 只有 __DEV__ console.warn，不會顯示給使用者
  join('src', 'services', 'analyticsService.ts'),
]

/** CJK 統一漢字、平假名、片假名、全形標點 */
const CJK = /[　-〿぀-ゟ゠-ヿ㐀-䶿一-鿿＀-￯]/

/** 把註解換成等長空白，保留行號與欄位對齊 */
function stripComments(source) {
  const out = source.split('')
  let i = 0
  let state = 'code' // code | line | block | single | double | template
  while (i < source.length) {
    const c = source[i]
    const next = source[i + 1]
    const blank = () => {
      if (out[i] !== '\n') out[i] = ' '
    }
    if (state === 'code') {
      if (c === '/' && next === '/') { state = 'line'; blank(); out[i + 1] = ' '; i += 2; continue }
      if (c === '/' && next === '*') { state = 'block'; blank(); out[i + 1] = ' '; i += 2; continue }
      if (c === "'") state = 'single'
      else if (c === '"') state = 'double'
      else if (c === '`') state = 'template'
    } else if (state === 'line') {
      if (c === '\n') state = 'code'
      else blank()
    } else if (state === 'block') {
      if (c === '*' && next === '/') { blank(); out[i + 1] = ' '; state = 'code'; i += 2; continue }
      blank()
    } else {
      // 字串內：跳過跳脫字元，遇到對應的結尾符號就回到 code
      if (c === '\\') { i += 2; continue }
      if ((state === 'single' && c === "'") || (state === 'double' && c === '"') || (state === 'template' && c === '`')) {
        state = 'code'
      }
    }
    i += 1
  }
  return out.join('')
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else if (EXTENSIONS.some((ext) => entry.endsWith(ext))) yield full
  }
}

const findings = []
for (const dir of SCAN_DIRS) {
  for (const file of walk(join(ROOT, dir))) {
    const rel = relative(ROOT, file)
    if (SKIP_PATHS.some((skip) => rel === skip || rel.startsWith(skip + sep))) continue
    const lines = stripComments(readFileSync(file, 'utf8')).split('\n')
    lines.forEach((line, idx) => {
      if (CJK.test(line)) findings.push(`${rel}:${idx + 1}: ${line.trim()}`)
    })
  }
}

if (findings.length > 0) {
  console.error(`找到 ${findings.length} 處寫死的中日文，請改用 i18n：\n`)
  findings.forEach((f) => console.error('  ' + f))
  process.exit(1)
}
console.log('✓ 沒有寫死的中日文字串')
