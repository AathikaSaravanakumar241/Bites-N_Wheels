import { Route, Routes } from 'react-router-dom'
import UserHome from './pages/User/UserHome.jsx'
import VendorHome from './pages/Vendor/VendorHome.jsx'
import Login from './pages/login.jsx'
import CategoryPage from './pages/User/Category.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/user" element={<UserHome />} />
      <Route path="/vendor" element={<VendorHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="user/category/:categoryId" element={<CategoryPage />} />
    </Routes>
  )
}

export default App