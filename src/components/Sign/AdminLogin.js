import "./SignUtils/CSS/Sign.css";
import "./SignUtils/CSS/style.css.map";
import "./SignUtils/fonts/material-icon/css/material-design-iconic-font.min.css";
import signinimage from "./SignUtils/images/adminbanner.png";
import { useState } from "react";
import Nav_bar from "../Navbar/Navbar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../helper";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";

const AdminLogin = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const loginSuccess = () =>
        toast.success("Login Success", {
            className: "toast-message",
        });

    const loginFailed = () =>
        toast.error("Invalid email or password", {
            className: "toast-message",
        });

    const handleLogin = async () => {
        if (!email || !password) {
            toast.error("Please enter email and password");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${BASE_URL}/api/admin/login`,
                {
                    email: email,
                    password: password,
                }
            );

            console.log("Admin login response:", response.data);

            if (response.data.success) {
                const admin = response.data.admin;

                // Store token for protected admin API requests
                if (response.data.token) {
                    localStorage.setItem("adminToken", response.data.token);
                }

                loginSuccess();

                setTimeout(() => {
                    navigate("/Admin", {
                        state: { admin },
                    });
                }, 1000);
            } else {
                loginFailed();
            }
        } catch (error) {
            console.error(
                "Admin login failed:",
                error.response?.data || error.message
            );

            loginFailed();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Nav_bar />

            <section className="sign-in">
                <div className="container">

                    <p
                        style={{
                            color: "#888",
                            fontSize: "0.8rem",
                            textAlign: "center",
                            marginBottom: "15px",
                        }}
                    >
                        Enter administrator credentials to access the console.
                    </p>

                    <div className="signin-content">

                        <div className="signin-image">
                            <figure>
                                <img
                                    src={signinimage}
                                    alt="admin login"
                                />
                            </figure>
                        </div>

                        <div className="signin-form">

                            <h2 className="form-title">
                                Admin Login
                            </h2>

                            <ToastContainer />

                            <div className="form-group">
                                <label htmlFor="email">
                                    <i className="zmdi zmdi-email"></i>
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    placeholder="Enter Admin Email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div
                                className="form-group"
                                style={{ position: "relative" }}
                            >
                                <label htmlFor="pass">
                                    <i className="zmdi zmdi-lock"></i>
                                </label>

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="pass"
                                    id="pass"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    style={{
                                        paddingRight: "2.5rem",
                                    }}
                                    required
                                />

                                <span
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    style={{
                                        position: "absolute",
                                        right: "10px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer",
                                        color: "#89c4ee",
                                        fontSize: "1.2rem",
                                    }}
                                >
                                    {showPassword ? (
                                        <FiEyeOff />
                                    ) : (
                                        <FiEye />
                                    )}
                                </span>
                            </div>

                            <div
                                className="form-group"
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: "10px",
                                }}
                            >
                                <Link
                                    to="#"
                                    onClick={() =>
                                        toast.info(
                                            "Please contact the system administrator to reset your password."
                                        )
                                    }
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#89c4ee",
                                        textDecoration: "none",
                                        fontWeight: "500",
                                    }}
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <div
                                className="form-group form-button"
                                style={{ marginTop: "20px" }}
                            >
                                <button
                                    className="form-submit"
                                    onClick={handleLogin}
                                    disabled={loading}
                                    style={{
                                        cursor: "pointer",
                                    }}
                                >
                                    {loading
                                        ? "Logging in..."
                                        : "Login"}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AdminLogin