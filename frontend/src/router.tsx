import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/layout/AdminLayout'

const Home                   = lazy(() => import('@/pages/public/Home'))
const Products               = lazy(() => import('@/pages/public/Products'))
const ProductDetail          = lazy(() => import('@/pages/public/ProductDetail'))
const Barrels                = lazy(() => import('@/pages/public/Barrels'))
const Cart                   = lazy(() => import('@/pages/public/Cart'))
const Checkout               = lazy(() => import('@/pages/public/Checkout'))
const OrderConfirmation      = lazy(() => import('@/pages/public/OrderConfirmation'))
const ReservationConfirmation = lazy(() => import('@/pages/public/ReservationConfirmation'))
const Login                  = lazy(() => import('@/pages/public/Login'))
const Register               = lazy(() => import('@/pages/public/Register'))
const MyOrders               = lazy(() => import('@/pages/public/MyOrders'))
const AgeBlocked             = lazy(() => import('@/pages/public/AgeBlocked'))

const AdminLogin        = lazy(() => import('@/pages/admin/AdminLogin'))
const AdminDashboard    = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminOrders       = lazy(() => import('@/pages/admin/AdminOrders'))
const AdminOrderDetail  = lazy(() => import('@/pages/admin/AdminOrderDetail'))
const AdminReservations = lazy(() => import('@/pages/admin/AdminReservations'))
const AdminProducts     = lazy(() => import('@/pages/admin/AdminProducts'))
const AdminProductForm  = lazy(() => import('@/pages/admin/AdminProductForm'))
const AdminStock        = lazy(() => import('@/pages/admin/AdminStock'))
const AdminCustomers    = lazy(() => import('@/pages/admin/AdminCustomers'))

const Loading = () => (
  <div className="min-h-screen bg-hops-black flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-hops-green border-t-transparent rounded-full animate-spin" />
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/edad-bloqueada',
    element: <AgeBlocked />,
  },
  {
    path: '/',
    element: (
      <Suspense fallback={<Loading />}>
        <PublicLayout />
      </Suspense>
    ),
    children: [
      { index: true,                       element: <Home /> },
      { path: 'productos',                 element: <Products /> },
      { path: 'productos/:id',             element: <ProductDetail /> },
      { path: 'barriles',                  element: <Barrels /> },
      { path: 'carrito',                   element: <Cart /> },
      { path: 'checkout',                  element: <Checkout /> },
      { path: 'pedido/:id/confirmacion',   element: <OrderConfirmation /> },
      { path: 'reserva/:id/confirmacion',  element: <ReservationConfirmation /> },
      { path: 'login',                     element: <Login /> },
      { path: 'registro',                  element: <Register /> },
      { path: 'mis-pedidos',               element: <MyOrders /> },
    ],
  },
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<Loading />}>
        <AdminLogin />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<Loading />}>
        <AdminLayout />
      </Suspense>
    ),
    children: [
      { index: true,                         element: <AdminDashboard /> },
      { path: 'pedidos',                     element: <AdminOrders /> },
      { path: 'pedidos/:id',                 element: <AdminOrderDetail /> },
      { path: 'reservas',                    element: <AdminReservations /> },
      { path: 'productos',                   element: <AdminProducts /> },
      { path: 'productos/nuevo',             element: <AdminProductForm /> },
      { path: 'productos/:id/editar',        element: <AdminProductForm /> },
      { path: 'stock',                       element: <AdminStock /> },
      { path: 'clientes',                    element: <AdminCustomers /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
