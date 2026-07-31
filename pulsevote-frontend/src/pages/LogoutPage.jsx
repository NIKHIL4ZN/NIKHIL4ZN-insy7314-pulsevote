import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {

    const navigate = useNavigate();

    useEffect(() => {

        localStorage.removeItem("token");

        navigate("/");

    }, []);

    return <h2>Logging out...</h2>;
}