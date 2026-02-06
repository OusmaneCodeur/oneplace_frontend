import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProductsAdmin from "../pages/admin/ProductsAdmin";
import ProductDetailsAdmin from "../pages/admin/ProductDetailsAdmin";
import CategoriesAdmin from "../pages/admin/CategoriesAdmin";
import OrdersAdmin from "../pages/admin/OrdersAdmin";
import OrderDetailsAdmin from "../pages/admin/OrderDetailsAdmin";
import UsersAdmin from "../pages/admin/UsersAdmin";
import UserDetailAdmin from "../pages/admin/UserDetailAdmin";
import ReviewsAdmin from "../pages/admin/ReviewsAdmin";
import DeliveriesAdmin from "../pages/admin/DeliveriesAdmin";
import SettingsAdmin from "../pages/admin/SettingsAdmin";
import SearchAdmin from "../pages/admin/SearchAdmin";
import AdminOnlyRoute from "./AdminOnlyRoute";

export const adminRoutes = [
    {
        element: <AdminLayout />,
        children: [
            { path: "/admin", element: <AdminDashboard /> },
            { path: "/admin/search", element: <SearchAdmin /> },

            { path: "/admin/products", element: <ProductsAdmin /> },
            { path: "/admin/products/create", element: <ProductsAdmin /> },
            { path: "/admin/products/edit/:id", element: <ProductsAdmin /> },
            { path: "/admin/products/:id", element: <ProductDetailsAdmin /> },

            { path: "/admin/categories", element: <CategoriesAdmin /> },
            { path: "/admin/categories/create", element: <CategoriesAdmin /> },
            { path: "/admin/categories/edit/:id", element: <CategoriesAdmin /> },

            { path: "/admin/orders", element: <OrdersAdmin /> },
            { path: "/admin/orders/:id", element: <OrderDetailsAdmin /> },

            { path: "/admin/reviews", element: <ReviewsAdmin /> },
            { path: "/admin/deliveries", element: <DeliveriesAdmin /> },

            { path: "/admin/users", element: <AdminOnlyRoute><UsersAdmin /></AdminOnlyRoute> },
            { path: "/admin/users/:id", element: <AdminOnlyRoute><UserDetailAdmin /></AdminOnlyRoute> },
            { path: "/admin/settings", element: <AdminOnlyRoute><SettingsAdmin /></AdminOnlyRoute> },
        ],
    },
];
