// 多层 backdrop-filter 叠加：越强的模糊越早淡出，形成自上而下的渐进模糊
const blurLayers = [
  { blur: 0.5, end: 100 },
  { blur: 1, end: 85 },
  { blur: 2, end: 70 },
  { blur: 4, end: 55 },
  { blur: 8, end: 40 }
]

// 底色遮罩：状态栏高度内保持不透明，其余部分用余弦缓动淡出，避免出现色带
const veilSteps = 12
const veil = `linear-gradient(to bottom, ${Array.from(
  { length: veilSteps + 1 },
  (_, i) => {
    const t = i / veilSteps
    const alpha = (1 + Math.cos(Math.PI * t)) / 2
    return `rgb(var(--nobelium-top-blur-rgb) / ${alpha.toFixed(
      3
    )}) calc(1rem + (100% - 1rem) * ${t.toFixed(3)})`
  }
).join(', ')})`

/**
 * 顶部渐进模糊层，不参与布局；需要时放在 fixed 导航下方
 * @param {boolean} visible
 */
const TopBlur = ({ visible }) => (
  <div
    aria-hidden
    className={`pointer-events-none fixed inset-x-0 top-0 z-[9] h-32 overflow-hidden transition-opacity duration-500 md:h-36 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}
  >
    {blurLayers.map(({ blur, end }) => (
      <div
        key={blur}
        // 向左右溢出，避免 Safari 在 backdrop blur 结束处画出硬边
        className='absolute inset-y-0 -inset-x-8'
        style={{
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: `linear-gradient(to bottom, black, transparent ${end}%)`,
          WebkitMaskImage: `linear-gradient(to bottom, black, transparent ${end}%)`
        }}
      />
    ))}
    <div className='absolute inset-0' style={{ backgroundImage: veil }} />
  </div>
)

export default TopBlur
