import { BrowserRouter } from 'react-router-dom'
import { SistemaComprasProvider } from './context/SistemaComprasContext.jsx'
import { AppLayout } from './components/layout/AppLayout'
import { AppRoutes } from './routes/AppRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <SistemaComprasProvider>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </SistemaComprasProvider>
    </BrowserRouter>
  )
}

export default App
