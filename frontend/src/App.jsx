import {Route,Routes} from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/login.jsx'
import './App.css'

function App() {
  return(
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
  
}

export default App
