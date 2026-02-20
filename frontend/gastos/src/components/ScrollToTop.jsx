import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function scrollToTop() {
  const html = document.documentElement
  const originalBehavior = getComputedStyle(html).scrollBehavior
  html.style.scrollBehavior = 'auto'
  
  window.scrollTo(0, 0)
  html.scrollTop = 0
  document.body.scrollTop = 0
  
  setTimeout(() => {
    html.style.scrollBehavior = originalBehavior === 'smooth' ? '' : originalBehavior
  }, 0)
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    scrollToTop()
  }, [pathname])

  useEffect(() => {
    scrollToTop()
    const timeout = setTimeout(scrollToTop, 50)
    return () => clearTimeout(timeout)
  }, [pathname])

  return null
}

export default ScrollToTop
