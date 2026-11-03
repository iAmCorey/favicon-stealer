"use client";

import { getDomain } from "./lib/utils";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

export interface FaviconProps {
  url: string;
  src?: string;
  alt?: string;
  size?: number;
  className?: string;
  timeout?: number;
  border?: boolean;
  padding?: number;
  background?: string;
  borderRadius?: number;
  lazy?: boolean;
  preferFallback?: boolean;
  preferSrc?: boolean;
}

type State = { index: number; status: "loading" | "loaded" | "error" };
type Action =
  | { type: "reset" }
  | { type: "load" }
  | { type: "error"; total: number };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "reset":
      return { index: 0, status: "loading" };
    case "load":
      return state.status === "loaded" ? state : { ...state, status: "loaded" };
    case "error": {
      const next = state.index + 1;
      return next < action.total
        ? { index: next, status: "loading" }
        : { index: state.index, status: "error" };
    }
    default:
      return state;
  }
};

const KEYFRAMES_ID = "favicon-stealer-keyframes";
const PULSE_KEYFRAMES =
  "@keyframes favicon-stealer-pulse{0%,100%{opacity:1}50%{opacity:.4}}";
const NEUTRAL_BG = "color-mix(in srgb, currentColor 10%, transparent)";

// keyframes 是全局静态资源:整个文档注入一次即可,不必每个实例 / 每次 loading 都塞一份 <style>。
// 用 DOM 上的 id 去重(而非仅模块布尔),这样 HMR 重新求值模块、或打包出多份副本时也不会重复注入。
let keyframesInjected = false;
const injectKeyframes = () => {
  if (keyframesInjected || typeof document === "undefined") return;
  keyframesInjected = true;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const el = document.createElement("style");
  el.id = KEYFRAMES_ID;
  el.textContent = PULSE_KEYFRAMES;
  document.head.appendChild(el);
};

// lazy 图的「进入视口」检测:所有实例共用一个 IntersectionObserver(列表页一页几十上百个图标,不必各 new 一个)。
// 只关心是否进入过视口:命中一次即取消观察并回调。rootMargin 用默认 0 —— 浏览器原生懒加载的提前量 ≥ 视口,
// 元素进入视口时请求必已发出,据此开始计时只会偏晚、不会过早。
// 环境没有 IntersectionObserver(老 WebView / jsdom)时什么都不做,回调永远不会触发。
let visibilityObserver: IntersectionObserver | undefined;
const visibilityCallbacks = new WeakMap<Element, () => void>();
const unobserveVisibility = (el: Element) => {
  visibilityCallbacks.delete(el);
  visibilityObserver?.unobserve(el);
};
const observeVisibility = (el: Element, onVisible: () => void) => {
  if (typeof IntersectionObserver === "undefined") return;
  if (!visibilityObserver) {
    visibilityObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = visibilityCallbacks.get(entry.target);
        unobserveVisibility(entry.target);
        cb?.();
      }
    });
  }
  visibilityCallbacks.set(el, onVisible);
  visibilityObserver.observe(el);
  return () => unobserveVisibility(el);
};

const Favicon = ({
  url,
  src,
  alt,
  size = 32,
  className = "",
  timeout = 2000,
  border = false,
  padding = 0,
  background = "transparent",
  borderRadius = 0,
  lazy = false,
  preferFallback = false,
  preferSrc = true,
}: FaviconProps): React.ReactElement => {
  // getDomain 会构造 new URL() + 跑正则,memo 掉避免每次 render 重算。
  const domain = useMemo(() => getDomain(url), [url]);

  // 候选图源统一成一个有序、去重的数组,fallback 沿数组推进。
  // src(若有)按 preferSrc 决定排在最前(默认)或作为兜底 —— 因此 src 加载失败也会回退到自动抓取。
  const sources = useMemo(() => {
    const standard = [
      `https://${domain}/favicon.ico`,
      `https://${domain}/apple-touch-icon.png`,
      `https://${domain}/logo.svg`,
      `https://${domain}/logo.png`,
    ];
    const services = [
      `https://favicon.im/${domain}?larger=true`,
      `https://favicon.im/${domain}`,
      `https://www.google.com/s2/favicons?domain=https://${domain}&sz=64`,
      `https://www.google.com/s2/favicons?domain=http://${domain}&sz=64`,
    ];
    const base = preferFallback
      ? [...services, ...standard]
      : [...standard, ...services];
    const withSrc = !src ? base : preferSrc ? [src, ...base] : [...base, src];
    // 去重:避免 src 与某个自动源相同导致 <img> 的 key 冲突。
    return [...new Set(withSrc)];
  }, [domain, src, preferFallback, preferSrc]);

  const [state, dispatch] = useReducer(reducer, {
    index: 0,
    status: "loading",
  });

  // lazy 时记下「哪个源的 <img> 已进入过视口」:等于 currentSrc 才开始计时。
  // 换源后自然失配,新源需重新等进入视口;sources 变时下面一并清空。
  const [seenSrc, setSeenSrc] = useState<string | null>(null);

  // sources 变(url / src / prefer* 变)时,在渲染期同步重置到第一个源。
  // 用渲染期更新(而非 effect)避免先提交并绘制一帧「新 sources + 旧 index」(错图/空白 + 一个废图片请求)。
  const [prevSources, setPrevSources] = useState(sources);
  if (sources !== prevSources) {
    setPrevSources(sources);
    setSeenSrc(null);
    dispatch({ type: "reset" });
  }

  const currentSrc = sources[state.index];
  const isLoading = state.status === "loading";
  const hasError = state.status === "error";
  // 用户显式传入的 src 不计网络超时:只在它真正加载失败时才回退(见 README 契约)。
  // currentSrc 恒为非空 URL,故 src 为 undefined 时此式自然为 false。
  const isUserSrc = currentSrc === src;

  // 全局动画 keyframes 客户端注入一次。
  useEffect(() => {
    injectKeyframes();
  }, []);

  // 缓存命中 / SSR 直出时 <img> 可能在挂载前就 complete,浏览器不再触发 onLoad/onError。
  // 用 img.decode() 可靠区分「解码成功(含无固有尺寸的 SVG)」与「失败」,避免 naturalWidth>0 误杀 SVG;
  // cancelled 守卫让本 effect 幂等(StrictMode 重复执行 / 源切换都不会派发过期的 load/error)。
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (!img || state.status !== "loading" || !img.complete) return;
    let cancelled = false;
    const onOk = () => !cancelled && dispatch({ type: "load" });
    const onFail = () =>
      !cancelled && dispatch({ type: "error", total: sources.length });
    // decode() 在老 WebView / 部分测试环境(jsdom)缺失,直接调用会同步抛 TypeError;
    // 没有就退回 naturalWidth 启发式。
    if (typeof img.decode === "function") {
      img.decode().then(onOk, onFail);
    } else {
      img.naturalWidth > 0 ? onOk() : onFail();
    }
    return () => {
      cancelled = true;
    };
  }, [state.status, currentSrc, sources]);

  // lazy 图在屏幕外被浏览器故意推迟加载(complete 恒 false、不触发事件),从挂载起计时会把所有源烧穿成首字母;
  // 故 lazy 时要等当前源的 <img> 进入过视口(请求必已发出)才开始计时。
  // 观察的是 <img> 本身(按源 key 重建),每个源各等一次:进入视口后被滚走,下一个源也不会在屏幕外被计时。
  const waitingForView = lazy && seenSrc !== currentSrc;
  useEffect(() => {
    const img = imgRef.current;
    if (!img || state.status !== "loading" || isUserSrc || !waitingForView)
      return;
    return observeVisibility(img, () => setSeenSrc(currentSrc));
  }, [state.status, currentSrc, isUserSrc, waitingForView]);

  // 每个网络源最多等 timeout 毫秒,无响应则跳下一个;用户 src 不计时。
  // lazy 图还没进入过视口时不计时(见上);没有 IntersectionObserver 的环境永远等不到,退化为只靠 onLoad/onError 推进。
  useEffect(() => {
    if (state.status !== "loading" || isUserSrc || waitingForView) return;
    const id = setTimeout(() => {
      dispatch({ type: "error", total: sources.length });
    }, timeout);
    return () => clearTimeout(id);
  }, [state.status, currentSrc, isUserSrc, waitingForView, timeout, sources]);

  const label = alt ?? (domain ? `${domain} logo` : "favicon");
  const letter = domain.charAt(0).toUpperCase() || "?";
  // 骨架与首字母兜底共用的中性表面(圆角跟随 prop),避免两处样式漂移。
  const neutralSurface = {
    borderRadius: borderRadius || undefined,
    background: NEUTRAL_BG,
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        boxSizing: "border-box",
        // 默认 / 零值不写内联,留给消费方的 className 决定。
        padding: padding || undefined,
        borderRadius: borderRadius || undefined,
        background: background === "transparent" ? undefined : background,
        border: border
          ? "1px solid color-mix(in srgb, currentColor 15%, transparent)"
          : undefined,
      }}
    >
      {/* 占位骨架:跟随 padding 内缩,与图片处于同一内容盒 */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: padding || 0,
            ...neutralSurface,
            animation: "favicon-stealer-pulse 1.5s ease-in-out infinite",
          }}
        />
      )}

      {currentSrc && !hasError && (
        <img
          key={currentSrc}
          ref={imgRef}
          src={currentSrc}
          // 加载中图是透明的:置空 alt 让读屏跳过,等真正显示(loaded)再用 label 播报。
          alt={isLoading ? "" : label}
          width={size}
          height={size}
          loading={lazy ? "lazy" : "eager"}
          decoding="async"
          onError={() => dispatch({ type: "error", total: sources.length })}
          onLoad={() => dispatch({ type: "load" })}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s",
          }}
        />
      )}

      {/* 全部源失败:显示域名首字母 */}
      {hasError && (
        <div
          role="img"
          aria-label={label}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...neutralSurface,
            fontSize: size * 0.5,
            lineHeight: 1,
          }}
        >
          {letter}
        </div>
      )}
    </div>
  );
};

export default Favicon;
