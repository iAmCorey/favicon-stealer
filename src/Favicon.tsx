"use client";

import { getDomain } from "./lib/utils";
import React, { useEffect, useState } from "react";

interface IProps {
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

const Favicon = ({
  url,
  src,
  alt,
  size = 32,
  className = "",
  timeout = 3000, // 增加到3秒，给网站自己的favicon更多加载时间
  border = false,
  padding = 0,
  background = "transparent",
  borderRadius = 0,
  lazy = false,
  preferFallback = false,
  preferSrc = true,
}: IProps) => {
  const domain = getDomain(url);
  const [imgSrc, setImgSrc] = useState("");
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const standardSources = [
    `https://${domain}/favicon.ico`,
    `https://${domain}/logo.svg`,
    `https://${domain}/logo.png`,
    `https://${domain}/apple-touch-icon.png`,
    `https://${domain}/apple-touch-icon-precomposed.png`,
    `https://${domain}/static/img/favicon.ico`,
    `https://${domain}/static/img/favicon.png`,
    `https://${domain}/img/favicon.png`,
    `https://${domain}/img/favicon.ico`,
    `https://${domain}/static/img/logo.svg`,
    `https://${domain}/apple-touch-icon-precomposed.png`,
  ];

  const fallbackServices = [
    `https://favicon.im/${domain}?larger=true`,
    `https://favicon.im/${domain}`,
    `https://www.google.com/s2/favicons?domain=https://${domain}&sz=64`,
    `https://www.google.com/s2/favicons?domain=http://${domain}&sz=64`,
  ];

  const fallbackSources = preferFallback
    ? [...fallbackServices, ...standardSources]
    : [...standardSources, ...fallbackServices];

  useEffect(() => {
    if (!isInitialized) {
      setImgSrc(fallbackSources[0]);
      setIsInitialized(true);
    }
  }, [isInitialized, fallbackSources]);

  useEffect(() => {
    let timeoutId: any;

    if (isLoading && imgSrc) {
      timeoutId = setTimeout(() => {
        handleError();
      }, timeout);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [imgSrc, isLoading, timeout]);

  const handleError = () => {
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbackSources.length) {
      setFallbackIndex(nextIndex);
      setImgSrc(fallbackSources[nextIndex]);
      setIsLoading(true);
    } else {
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div
      className={
        `relative inline-block 
        ${className} 
        ${border ? "border" : ""} 
        ${hasError ? "opacity-0" : ""}
        ${padding ? `p-[${padding}px]` : ""}
        ${borderRadius ? `rounded-[${borderRadius}px]` : ""}
        `
      }
      style={{
        width: size,
        height: size,
        background: background,
        padding: padding ? `${padding}px` : 0,
        borderRadius: borderRadius ? `${borderRadius}px` : 0,
      }}
    >
      {/* placeholder */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full rounded-md bg-gray-200/60" />
        </div>
      )}

      


      {/* 根据 preferSrc 参数决定图片源的优先级 */}
      {(preferSrc ? (src || imgSrc) : (imgSrc || src)) && (
        <img
          src={preferSrc ? (src || imgSrc) : (imgSrc || src)}
          alt={alt || `${domain} logo`}
          width={size}
          height={size}
          loading={lazy ? "lazy" : "eager"}
          onError={handleError}
          onLoad={handleLoad}
          className={`inline-block transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          style={{
            objectFit: "contain",
            display: hasError ? "none" : "inline-block",
          }}
        />
      )}

      {/* Fallback: Display first letter of domain when all image sources fail */}
      {hasError && (
        <div
          className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md"
          style={{ fontSize: `${size * 0.5}px` }}
        >
          {domain.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default Favicon;