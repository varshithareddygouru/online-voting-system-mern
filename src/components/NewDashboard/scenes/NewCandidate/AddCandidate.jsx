import { Box, Button, TextField } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../newComponents/Header";
import Sidebar from "../global/Sidebar";
import Topbar from "../global/Topbar";
import { ColorModeContext, useMode } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { BASE_URL } from "../../../../helper";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AddCandidate = () => {
    const [theme, colorMode] = useMode();
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const initialValues = {
        fullName: "",
        age: "",
        party: "",
        bio: "",
        image: null,
        symbol: null,
    };

    const checkoutSchema = yup.object().shape({
        fullName: yup.string().required("Candidate name is required"),
        age: yup.string().required("Age is required"),
        party: yup.string().required("Party name is required"),
        bio: yup.string().required("Bio is required"),
    });

    const handleSubmit = async (values, { resetForm }) => {
        setLoading(true);

        try {
            console.log("Candidate form values:", values);

            if (!values.party || values.party.trim() === "") {
                toast.error("Please enter the candidate party");
                setLoading(false);
                return;
            }

            const data = new FormData();

            data.append("fullName", values.fullName);
            data.append("age", values.age);
            data.append("party", values.party);
            data.append("bio", values.bio);

            if (values.image) {
                data.append("image", values.image);
            }

            if (values.symbol) {
                data.append("symbol", values.symbol);
            }

            const token =
                localStorage.getItem("adminToken") ||
                localStorage.getItem("token");

            const response = await axios.post(
                `${BASE_URL}/createCandidate`,
                data,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Server response:", response.data);

            if (response.data.success) {
                toast.success("Candidate Created Successfully!");

                resetForm();

                setTimeout(() => {
                    navigate("/Candidate");
                }, 1000);
            } else {
                toast.error(
                    response.data.message ||
                    "Candidate creation failed"
                );
            }
        } catch (error) {
            console.error(
                "Create candidate error:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.message ||
                "Candidate creation failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />

                <div className="appNew">
                    <Sidebar />

                    <main className="content">
                        <Topbar />

                        <ToastContainer />

                        <Box m="0px 20px">
                            <Header
                                title="CREATE NEW CANDIDATE"
                                subtitle="Create a New Candidate Profile"
                            />

                            <br />

                            <Formik
                                initialValues={initialValues}
                                validationSchema={checkoutSchema}
                                onSubmit={handleSubmit}
                            >
                                {({
                                    values,
                                    errors,
                                    touched,
                                    handleBlur,
                                    handleChange,
                                    setFieldValue,
                                    handleSubmit,
                                }) => (
                                    <form onSubmit={handleSubmit}>
                                        <Box
                                            display="grid"
                                            gap="20px"
                                            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                                            sx={{
                                                "& > div": {
                                                    gridColumn: isNonMobile
                                                        ? undefined
                                                        : "span 4",
                                                },
                                            }}
                                        >
                                            <TextField
                                                fullWidth
                                                variant="filled"
                                                type="text"
                                                label="Candidate Name"
                                                name="fullName"
                                                value={values.fullName}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={
                                                    !!touched.fullName &&
                                                    !!errors.fullName
                                                }
                                                helperText={
                                                    touched.fullName &&
                                                    errors.fullName
                                                }
                                                sx={{
                                                    gridColumn: "span 4",
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                variant="filled"
                                                type="number"
                                                label="Candidate Age"
                                                name="age"
                                                value={values.age}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={
                                                    !!touched.age &&
                                                    !!errors.age
                                                }
                                                helperText={
                                                    touched.age && errors.age
                                                }
                                                sx={{
                                                    gridColumn: "span 2",
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                variant="filled"
                                                type="text"
                                                label="Candidate Party"
                                                name="party"
                                                value={values.party}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={
                                                    !!touched.party &&
                                                    !!errors.party
                                                }
                                                helperText={
                                                    touched.party &&
                                                    errors.party
                                                }
                                                sx={{
                                                    gridColumn: "span 2",
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                variant="filled"
                                                type="text"
                                                label="Candidate Bio"
                                                name="bio"
                                                value={values.bio}
                                                onBlur={handleBlur}
                                                onChange={handleChange}
                                                error={
                                                    !!touched.bio &&
                                                    !!errors.bio
                                                }
                                                helperText={
                                                    touched.bio && errors.bio
                                                }
                                                sx={{
                                                    gridColumn: "span 4",
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                variant="filled"
                                                type="file"
                                                label="Candidate Image"
                                                name="image"
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        "image",
                                                        e.target.files[0]
                                                    )
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    gridColumn: "span 2",
                                                }}
                                            />

                                            <TextField
                                                fullWidth
                                                variant="filled"
                                                type="file"
                                                label="Party Symbol"
                                                name="symbol"
                                                onChange={(e) =>
                                                    setFieldValue(
                                                        "symbol",
                                                        e.target.files[0]
                                                    )
                                                }
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                sx={{
                                                    gridColumn: "span 2",
                                                }}
                                            />
                                        </Box>

                                        <Box
                                            display="flex"
                                            justifyContent="end"
                                            mt="20px"
                                        >
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                color="secondary"
                                                variant="contained"
                                            >
                                                {loading
                                                    ? "Creating..."
                                                    : "Create Candidate"}
                                            </Button>
                                        </Box>
                                    </form>
                                )}
                            </Formik>
                        </Box>
                    </main>
                </div>
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default AddCandidate;