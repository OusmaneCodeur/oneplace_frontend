import ClientLayout from "../components/client/ClientLayout";
import Home from "../pages/client/Home";
import Products from "../pages/client/Products";
import ProductDetails from "../pages/client/ProductDetails";
import Cart from "../pages/client/Cart";
import Checkout from "../pages/client/Checkout";
import Account from "../pages/client/Account";
import Login from "../pages/client/Login";
import Register from "../pages/client/Register";

export const clientRoutes = [
  {
    element: <ClientLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/products", element: <Products /> },
      { path: "/products/:id", element: <ProductDetails /> },
      { path: "/cart", element: <Cart /> },
      { path: "/checkout", element: <Checkout /> },
      { path: "/account", element: <Account /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
    ],
  },
];
