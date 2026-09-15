import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import './FoodTruckLoader.css'

export default function RouteProgressBar() {
  const location = useLocation()
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(true)
    const timer = setTimeout(() => {
      setActive(false)
    }, 450)
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  if (!active) return null
  return <div className="ftl-top-bar" aria-hidden="true" />
}
