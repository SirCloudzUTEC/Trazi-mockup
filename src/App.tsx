import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { TraziToaster } from './components/TraziToast'
import { Postulante } from './views/postulante/Postulante'
import { Rrhh } from './views/rrhh/Rrhh'
import { Direccion } from './views/direccion/Direccion'
import { ComprobantePage } from './views/postulante/ComprobantePage'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Postulante />} />
        <Route path="/rrhh" element={<Rrhh />} />
        <Route path="/direccion" element={<Direccion />} />
        <Route path="/comprobante" element={<ComprobantePage />} />
        <Route path="*" element={<Postulante />} />
      </Routes>
      <TraziToaster />
    </BrowserRouter>
  )
}
