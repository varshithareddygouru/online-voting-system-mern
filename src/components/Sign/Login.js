import "./SignUtils/CSS/Sign.css"
import "./SignUtils/CSS/style.css.map"
import "./SignUtils/fonts/material-icon/css/material-design-iconic-font.min.css"
import signinimage from "./SignUtils/images/signin-image.jpg"
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Nav_bar from "../Navbar/Navbar";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from "../../helper";
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const loginSuccess = () => toast.success("Login Success",{
        className: "toast-message",
    });
    const loginFailed = () => toast.error(`Invalid Details or User Doesn't exist`,{
        className: "toast-message",
    });

    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/login`, { username, password });
            const voterst = response.data.voterObject;
            if(response.data.success){
                loginSuccess();
                setTimeout(()=>{
                    navigate('/User', { state: { voterst } });
                },2000)
            }
            else{
                loginFailed();
            }
          } 
          catch (error) {
            console.error('Login failed:', error);
            loginFailed();
          }finally {
            setLoading(false);
          }
      
    };

    return (
        <div >
            <Nav_bar />
            <section className="sign-in">
                <div className="container">
                <p style={{ color: '#888', fontSize: '0.8rem', textAlign: 'center', marginBottom: '15px' }}>
                    Use voter registered credentials to login.
                </p>

                    <div className="signin-content">
                        <div className="signin-image">
                            <figure><img src={signinimage} alt="sing up image" /></figure>
                            <Link to="/Signup" className="signup-image-link">Create an account</Link>
                        </div>

                        <div className="signin-form">
                            <h2 className="form-title">Sign In</h2>
                            <ToastContainer />
                                <div className="form-group">
                                    <label htmlFor="email"><i className="zmdi zmdi-account material-icons-name"></i></label>
                                    <input type="email" name="email" id="email" placeholder="Enter Email" onChange={(e) => setUsername(e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label htmlFor="pass"><i className="zmdi zmdi-lock"></i></label>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="pass" 
                                        id="pass" 
                                        placeholder="Password" 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        style={{ paddingRight: '2.5rem' }}
                                        required 
                                    />
                                    <span 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#89c4ee', fontSize: '1.2rem' }}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </span>
                                </div>
                                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                    <Link 
                                        to="#" 
                                        onClick={() => toast.info("Please contact the administrator or check your confirmation details to restore credentials.")}
                                        style={{ fontSize: '0.8rem', color: '#89c4ee', textDecoration: 'none', fontWeight: '500' }}
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="form-group form-button" style={{ marginTop: '20px' }}>
                                    <button className="form-submit" onClick={handleLogin} disabled={loading} style={{ cursor: 'pointer' }}>
                                        {loading ? 'Logging in...' : 'Login'}
                                    </button>
                                </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
export default Login;