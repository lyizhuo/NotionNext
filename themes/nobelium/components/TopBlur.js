// 顶部边缘从强到弱分成 7 个模糊带，每层只在自己的区间内生效，
// 相邻带用重叠的渐变交接，避免所有层同时从顶部淡出造成断层
const BLUR_LAYERS = 7
const MAX_BLUR = 8
const BAND = 100 / 8
const BLUR_RATIO = 1.5

/** 生成带缓动的 mask 过渡，避免线性 stop 在端点留下折线 */
const smoothRamp = (from, to, fromAlpha, toAlpha, steps = 4) =>
  Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps
    const eased = (1 - Math.cos(Math.PI * t)) / 2
    const alpha = fromAlpha + (toAlpha - fromAlpha) * eased
    const pos = from + (to - from) * t
    return `rgb(0 0 0 / ${alpha.toFixed(3)}) ${pos.toFixed(2)}%`
  })

// 渲染顺序从弱到强，最强层最后绘制；level 0 对应顶部最强模糊
const blurLayers = Array.from({ length: BLUR_LAYERS }, (_, index) => {
  const level = BLUR_LAYERS - index - 1
  const start = level === 0 ? 0 : (level - 1) * BAND
  const fullStart = level * BAND
  const fullEnd = (level + 1) * BAND
  const end = Math.min(100, (level + 2) * BAND)
  const stops = []

  if (level === 0) {
    stops.push('rgb(0 0 0) 0%')
  } else {
    stops.push(...smoothRamp(start, fullStart, 0, 1))
  }
  stops.push(`rgb(0 0 0) ${fullEnd.toFixed(2)}%`)
  stops.push(...smoothRamp(fullEnd, end, 1, 0))

  return {
    blur: MAX_BLUR / Math.pow(BLUR_RATIO, level),
    mask: `linear-gradient(to bottom, ${stops.join(', ')})`
  }
})

// 底色遮罩：前 1rem 保持不透明，其余用多段余弦缓动淡出
const veilSteps = 32
const veilMask = `linear-gradient(to bottom, ${Array.from(
  { length: veilSteps + 1 },
  (_, i) => {
    const t = i / veilSteps
    const alpha = (1 + Math.cos(Math.PI * t)) / 2
    return `rgb(0 0 0 / ${alpha.toFixed(
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
    {/* 底色放在模糊层下面，让模糊层把它的淡出一起抹平 */}
    <div
      className='absolute inset-0'
      style={{
        backgroundColor: 'rgb(var(--nobelium-top-blur-rgb))',
        maskImage: veilMask,
        WebkitMaskImage: veilMask
      }}
    />
    {blurLayers.map((layer, index) => (
      <div
        key={index}
        // 向左右溢出，避免 Safari 在 backdrop blur 结束处画出硬边
        className='absolute inset-y-0 -inset-x-8'
        style={{
          zIndex: index + 1,
          backdropFilter: `blur(${layer.blur.toFixed(2)}px)`,
          WebkitBackdropFilter: `blur(${layer.blur.toFixed(2)}px)`,
          maskImage: layer.mask,
          WebkitMaskImage: layer.mask
        }}
      />
    ))}
  </div>
)

export default TopBlur
