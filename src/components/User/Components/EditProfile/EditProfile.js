import React, { useState, useEffect } from 'react';
import "../../../Sign/SignUtils/CSS/Sign.css";
import "../../../Sign/SignUtils/CSS/style.css.map";
import UserNavbar from "../../../Navbar/UserNavbar";
import axios from 'axios';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../../helper';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const EditProfile = () => {
    const navigate = useNavigate();
    const voterid = Cookies.get('myCookie');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        pass: '',
        re_pass: ''
    });

    useEffect(() => {
        if (!voterid) {
            navigate('/Login');
            return;
        }

        axios.get(`${BASE_URL}/getVoterbyID/${voterid}`)
            .then((response) => {
                if (response.data.success && response.data.voter) {
                    const { firstName, lastName, phone, email } = response.data.voter;
                    setFormData(prev => ({
                        ...prev,
                        firstName: firstName || '',
                        lastName: lastName || '',
                        phone: phone || '',
                        email: email || ''
                    }));
                }
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                toast.error("Failed to load profile details.");
            });
    }, [voterid, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.pass && formData.pass !== formData.re_pass) {
            toast.error("Passwords do not match");
            setLoading(false);
            return;
        }

        const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone
        };

        if (formData.pass) {
            updateData.voteStatus = false; // dummy parameter or we can just send pass
            updateData.password = formData.pass;
        }

        try {
            const response = await axios.patch(`${BASE_URL}/updateVoter/${voterid}`, updateData);
            if (response.data.success) {
                toast.success("Profile updated successfully!");
                setTimeout(() => {
                    navigate('/User');
                }, 1500);
            } else {
                toast.error(response.data.message || "Failed to update profile.");
            }
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div >
            <UserNavbar/>
            <section className="signup">
                <div className="container">
                    <div className="signup-content">
                        <div className="signup-form" style={{ width: '100%' }}>
                            <h2 className="form-title">Edit Your Details</h2>
                            <ToastContainer />
                            <form className="register-form" id="register-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="firstName"><i className="zmdi zmdi-account material-icons-name"></i></label>
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        id="firstName" 
                                        value={formData.firstName} 
                                        onChange={handleChange} 
                                        placeholder="Your First Name" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="lastName"><i className="zmdi zmdi-account-box material-icons-name"></i></label>
                                    <input 
                                        type="text" 
                                        name="lastName" 
                                        id="lastName" 
                                        value={formData.lastName} 
                                        onChange={handleChange} 
                                        placeholder="Your Last Name" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone"><i className="zmdi zmdi-local-phone material-icons-name"></i></label>
                                    <input 
                                        type="text" 
                                        name="phone" 
                                        id="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        placeholder="Your Phone Number" 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email"><i className="zmdi zmdi-email"></i></label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        id="email" 
                                        value={formData.email} 
                                        disabled 
                                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }} 
                                    />
                                </div>
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label htmlFor="pass"><i className="zmdi zmdi-lock"></i></label>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        name="pass" 
                                        id="pass" 
                                        value={formData.pass} 
                                        onChange={handleChange} 
                                        placeholder="New Password (optional)" 
                                        style={{ paddingRight: '2.5rem' }}
                                    />
                                    <span 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#89c4ee', fontSize: '1.2rem' }}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </span>
                                </div>
                                <div className="form-group" style={{ position: 'relative' }}>
                                    <label htmlFor="re-pass"><i className="zmdi zmdi-lock-outline"></i></label>
                                    <input 
                                        type={showRePassword ? "text" : "password"} 
                                        name="re_pass" 
                                        id="re_pass" 
                                        value={formData.re_pass} 
                                        onChange={handleChange} 
                                        placeholder="Repeat your password" 
                                        style={{ paddingRight: '2.5rem' }}
                                    />
                                    <span 
                                        onClick={() => setShowRePassword(!showRePassword)} 
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#89c4ee', fontSize: '1.2rem' }}
                                    >
                                        {showRePassword ? <FiEyeOff /> : <FiEye />}
                                    </span>
                                </div>
                                <div className="form-group form-button">
                                    <button className="form-submit" type="submit" disabled={loading} style={{ cursor: 'pointer' }}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EditProfile;