import * as React from 'react'
import { TLTheme } from '../../types'

const styles = new Map<string, HTMLStyleElement>()

type AnyTheme = Record<string, string>

function makeCssTheme<T = AnyTheme>(prefix: string, theme: T) {
  return Object.keys(theme).reduce((acc, key) => {
    const value = theme[key as keyof T]
    if (value) {
      return acc + `${`--${prefix}-${key}`}: ${value};\n`
    }
    return acc
  }, '')
}

function useTheme<T = AnyTheme>(prefix: string, theme: T, selector = ':root') {
  React.useLayoutEffect(() => {
    const style = document.createElement('style')
    const cssTheme = makeCssTheme(prefix, theme)

    style.setAttribute('id', `${prefix}-theme`)
    style.setAttribute('data-selector', selector)
    style.innerHTML = `
        ${selector} {
          ${cssTheme}
        }
      `

    document.head.appendChild(style)

    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [prefix, theme, selector])
}

function useStyle(uid: string, rules: string) {
  React.useLayoutEffect(() => {
    if (styles.get(uid)) {
      return
    }

    const style = document.createElement('style')
    style.innerHTML = rules
    style.setAttribute('id', uid)
    document.head.appendChild(style)
    styles.set(uid, style)

    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style)
        styles.delete(uid)
      }
    }
  }, [uid, rules])
}

const css = (strings: TemplateStringsArray, ...args: unknown[]) =>
  strings.reduce(
    (acc, string, index) => acc + string + (index < args.length ? args[index] : ''),
    ''
  )

const defaultTheme: TLTheme = {
  brushFill: 'rgba(0,0,0,.05)',
  brushStroke: 'rgba(0,0,0,.25)',
  selectStroke: 'rgb(66, 133, 244)',
  selectFill: 'rgba(65, 132, 244, 0.05)',
  background: 'rgb(248, 249, 250)',
  foreground: 'rgb(51, 51, 51)',
}

const tlcss = css`
  :root {
    --tl-zoom: 1;
    --tl-scale: calc(1 / var(--tl-zoom));
  }

  .tl-counter-scaled {
    transform: scale(var(--tl-scale));
  }

  .tl-dashed {
    stroke-dasharray: calc(2px * var(--tl-scale)), calc(2px * var(--tl-scale));
  }

  .tl-transparent {
    fill: transparent;
    stroke: transparent;
  }

  .tl-cursor-ns {
    cursor: ns-resize;
  }

  .tl-cursor-ew {
    cursor: ew-resize;
  }

  .tl-cursor-nesw {
    cursor: nesw-resize;
  }

  .tl-cursor-nwse {
    cursor: nwse-resize;
  }

  .tl-corner-handle {
    stroke: var(--tl-selectStroke);
    fill: var(--tl-background);
    stroke-width: calc(1.5px * var(--tl-scale));
  }

  .tl-rotate-handle {
    stroke: var(--tl-selectStroke);
    fill: var(--tl-background);
    stroke-width: calc(1.5px * var(--tl-scale));
    cursor: grab;
  }

  .tl-handle {
    transform: scale(var(--tl-scale));
    fill: var(--tl-background);
    stroke: var(--tl-stroke);
    stroke-width: calc(2px * var(--tl-scale));
    pointer-events: all;
  }

  .tl-binding {
    fill: var(--tl-selectFill);
    stroke: var(--tl-selectStroke);
    stroke-width: calc(1px * var(--tl-scale));
    pointer-events: none;
  }

  .tl-bounds-center {
    fill: transparent;
    stroke: var(--tl-selectStroke);
    stroke-width: calc(1.5px * var(--tl-scale));
  }

  .tl-bounds-bg {
    stroke: none;
    fill: var(--tl-selectFill);
    pointer-events: all;
  }

  .tl-brush {
    fill: var(--tl-brushFill);
    stroke: var(--tl-brushStroke);
    stroke-width: calc(1px * var(--tl-scale));
    pointer-events: none;
  }

  .tl-canvas {
    position: fixed;
    overflow: hidden;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    touch-action: none;
    z-index: 100;
    pointer-events: all;
  }

  .tl-container {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 0px;
    margin: 0px;
    overscroll-behavior: none;
    overscroll-behavior-x: none;
    background-color: var(--tl-background);
  }

  .tl-container * {
    user-select: none;
  }

  .tl-dot {
    fill: var(--tl-background);
    stroke: var(--tl-foreground);
    stroke-width: 2px;
  }

  .tl-handle {
    fill: var(--tl-background);
    stroke: var(--tl-selectStroke);
    stroke-width: calc(1.5px * var(--tl-scale));
  }

  .tl-handle-bg {
    fill: transparent;
    stroke: none;
    opacity: 0.2;
    pointer-events: all;
  }

  .tl-handle-bg:hover {
    fill: var(--tl-selected-fill);
  }

  .tl-handle-bg:hover > * {
    stroke: var(--tl-selected-fill);
  }

  .tl-handle-bg:active {
    fill: var(--tl-selected-fill);
    stroke: var(--tl-selected-fill);
  }

  .tl-binding-indicator {
    stroke-width: calc(3px * var(--tl-scale));
    fill: none;
    stroke: var(--tl-selected);
  }

  .tl-shape-group {
    outline: none;
  }

  .tl-shape-group > *[data-shy='true'] {
    opacity: 0;
  }

  .tl-shape-group:hover > *[data-shy='true'] {
    opacity: 1;
  }

  .tl-current-parent > *[data-shy='true'] {
    opacity: 1;
  }
`

export function useTLTheme(theme?: Partial<TLTheme>) {
  const [tltheme] = React.useState<TLTheme>(() => ({
    ...defaultTheme,
    ...theme,
  }))

  useTheme('tl', tltheme)

  useStyle('tl-canvas', tlcss)
}
