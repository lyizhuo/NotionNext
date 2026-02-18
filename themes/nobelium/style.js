/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
    
    // 底色
    .dark #theme-nobelium{
        background-color: rgb(24 24 27) !important;
    }

  `}</style>
}

export { Style }
