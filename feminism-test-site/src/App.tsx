import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Test from './pages/Test'
import Result from './pages/Result'
import Encyclopedia from './pages/Encyclopedia'
import Method from './pages/Method'

function Topbar() {
  const loc = useLocation()
  return (
    <div className="topbar">
      <div className="container">
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <strong>女性主义派别测试</strong>
          <span className="badge">静态版</span>
        </div>
        <div className="nav">
          <Link to="/" style={{textDecoration: loc.pathname==='/'?'underline':'none'}}>首页</Link>
          <Link to="/test" style={{textDecoration: loc.pathname.startsWith('/test')?'underline':'none'}}>测试</Link>
          <Link to="/encyclopedia" style={{textDecoration: loc.pathname.startsWith('/encyclopedia')?'underline':'none'}}>派别百科</Link>
          <Link to="/method" style={{textDecoration: loc.pathname.startsWith('/method')?'underline':'none'}}>方法</Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Topbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/result" element={<Result />} />
        <Route path="/encyclopedia" element={<Encyclopedia />} />
        <Route path="/method" element={<Method />} />
      </Routes>
    </>
  )
}
