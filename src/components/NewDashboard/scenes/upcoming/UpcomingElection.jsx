import { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "../../theme";
import Header from "../../newComponents/Header";
import Topbar from "../global/Topbar";
import Sidebar from "../global/Sidebar";
import { BASE_URL } from "../../../../helper";

const UpcomingElection = () => {
    const [theme, colorMode] = useMode();
    const colors = tokens(theme.palette.mode);

    const [elections, setElections] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // ==========================================
    // GET ELECTIONS
    // ==========================================
    const fetchElections = async () => {
        try {
            setError("");

            const response = await fetch(
                `${BASE_URL}/api/elections`
            );

            const result = await response.json();

            if (result.success) {
                const formattedElections =
                    result.data.map((election) => ({
                        ...election,

                        // DataGrid ID
                        id: election._id,

                        // Display name
                        name: election.title,

                        // Display date
                        date: election.startDate
                            ? new Date(
                                  election.startDate
                              ).toLocaleDateString()
                            : "Not set",

                        // Election status
                        status:
                            election.status ||
                            "upcoming",
                    }));

                setElections(formattedElections);
            } else {
                setError(
                    result.message ||
                        "Unable to load elections"
                );
            }
        } catch (err) {
            console.error(
                "Fetch elections error:",
                err
            );

            setError(
                "Unable to connect to backend server."
            );
        }
    };

    // Load elections when page opens
    useEffect(() => {
        fetchElections();
    }, []);

    // ==========================================
    // CREATE ELECTION
    // ==========================================
    const handleCreateElection = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        // Check empty fields
        if (
            !title ||
            !description ||
            !startDate ||
            !endDate
        ) {
            setError(
                "Please fill all fields."
            );
            return;
        }

        // Check date
        if (
            new Date(endDate) <=
            new Date(startDate)
        ) {
            setError(
                "End date must be after start date."
            );
            return;
        }

        try {
            // Get admin token
            const token =
                localStorage.getItem("adminToken") ||
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Admin login token not found. Please login again."
                );
                return;
            }

            const response = await fetch(
                `${BASE_URL}/api/elections`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        title,
                        description,
                        startDate,
                        endDate,
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to create election"
                );
            }

            // Success message
            setMessage(
                "Election created successfully!"
            );

            // Clear form
            setTitle("");
            setDescription("");
            setStartDate("");
            setEndDate("");

            // Close form
            setShowForm(false);

            // Refresh election list
            fetchElections();

        } catch (err) {
            console.error(
                "Create election error:",
                err
            );

            setError(
                err.message ||
                    "Failed to create election."
            );
        }
    };

    // ==========================================
    // START / STOP ELECTION
    // ==========================================
    const handleStartStop = (id) => {
        setElections(
            (previousElections) =>
                previousElections.map(
                    (election) =>
                        election.id === id
                            ? {
                                  ...election,

                                  status:
                                      election.status ===
                                      "started"
                                          ? "stopped"
                                          : "started",
                              }
                            : election
                )
        );
    };

    // ==========================================
    // DELETE ELECTION
    // ==========================================
    const handleDeleteElection = async (id) => {

        // Confirmation popup
        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this election?"
            );

        if (!confirmDelete) {
            return;
        }

        try {
            setMessage("");
            setError("");

            // Get admin token
            const token =
                localStorage.getItem("adminToken") ||
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Admin login token not found. Please login again."
                );
                return;
            }

            // Delete request
            const response = await fetch(
                `${BASE_URL}/api/elections/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                        "Failed to delete election"
                );
            }

            // Success message
            setMessage(
                "Election deleted successfully!"
            );

            // Refresh table
            fetchElections();

        } catch (err) {
            console.error(
                "Delete election error:",
                err
            );

            setError(
                err.message ||
                    "Failed to delete election."
            );
        }
    };

    // ==========================================
    // DATAGRID COLUMNS
    // ==========================================
    const columns = [
        {
            field: "name",

            headerName:
                "ELECTION NAME",

            flex: 1,

            cellClassName:
                "name-column--cell",
        },

        {
            field: "date",

            headerName:
                "START DATE",

            flex: 1,
        },

        {
            field: "status",

            headerName:
                "STATUS",

            flex: 1,

            cellClassName:
                "name-column--cell",
        },

        {
            headerName:
                "ACTION",

            flex: 1.8,

            sortable: false,

            filterable: false,

            renderCell: ({ row }) => {

                const status =
                    row.status ||
                    "upcoming";

                return (
                    <Box
                        display="flex"
                        gap="10px"
                        alignItems="center"
                    >

                        {/* START / STOP BUTTON */}
                        <Button
                            variant="contained"

                            sx={{
                                backgroundColor:
                                    status ===
                                    "started"
                                        ? colors
                                              .redAccent[600]
                                        : colors
                                              .greenAccent[600],

                                color: "white",

                                fontWeight:
                                    "bold",

                                minWidth:
                                    "75px",
                            }}

                            onClick={() =>
                                handleStartStop(
                                    row.id
                                )
                            }
                        >
                            {status ===
                            "started"
                                ? "Stop"
                                : "Start"}
                        </Button>


                        {/* DELETE BUTTON */}
                        <Button
                            variant="contained"

                            sx={{
                                backgroundColor:
                                    colors
                                        .redAccent[600],

                                color: "white",

                                fontWeight:
                                    "bold",

                                minWidth:
                                    "75px",

                                "&:hover": {
                                    backgroundColor:
                                        colors
                                            .redAccent[700],
                                },
                            }}

                            onClick={() =>
                                handleDeleteElection(
                                    row.id
                                )
                            }
                        >
                            Delete
                        </Button>

                    </Box>
                );
            },
        },
    ];

    // ==========================================
    // UI
    // ==========================================
    return (
        <ColorModeContext.Provider
            value={colorMode}
        >
            <ThemeProvider
                theme={theme}
            >
                <CssBaseline />

                <div className="appNew">

                    {/* SIDEBAR */}
                    <Sidebar />

                    <main className="content">

                        {/* TOPBAR */}
                        <Topbar />

                        <Box m="0px 20px">

                            {/* HEADER */}
                            <Header
                                title="UPCOMING ELECTIONS / CURRENT ELECTIONS"

                                subtitle="Managing the Elections"
                            />


                            {/* ==================================
                                CREATE ELECTION BUTTON
                            ================================== */}

                            <Box
                                display="flex"
                                justifyContent="flex-end"
                                mb={2}
                            >

                                <Button
                                    variant="contained"

                                    onClick={() => {
                                        setShowForm(
                                            !showForm
                                        );

                                        setMessage(
                                            ""
                                        );

                                        setError(
                                            ""
                                        );
                                    }}

                                    sx={{
                                        backgroundColor:
                                            colors
                                                .greenAccent[600],

                                        color: "white",

                                        fontWeight:
                                            "bold",

                                        padding:
                                            "10px 20px",

                                        "&:hover": {
                                            backgroundColor:
                                                colors
                                                    .greenAccent[700],
                                        },
                                    }}
                                >

                                    {showForm
                                        ? "Close Form"
                                        : "+ Create Election"}

                                </Button>

                            </Box>


                            {/* ==================================
                                CREATE ELECTION FORM
                            ================================== */}

                            {showForm && (

                                <Box
                                    component="form"

                                    onSubmit={
                                        handleCreateElection
                                    }

                                    sx={{
                                        backgroundColor:
                                            colors
                                                .primary[400],

                                        padding:
                                            "20px",

                                        marginBottom:
                                            "20px",

                                        borderRadius:
                                            "5px",
                                    }}
                                >

                                    <Typography
                                        variant="h4"

                                        fontWeight="bold"

                                        mb={2}
                                    >
                                        Create New Election
                                    </Typography>


                                    <Box
                                        display="grid"

                                        gridTemplateColumns="repeat(2, 1fr)"

                                        gap={2}
                                    >

                                        {/* TITLE */}
                                        <TextField
                                            label="Election Title"

                                            value={
                                                title
                                            }

                                            onChange={(e) =>
                                                setTitle(
                                                    e.target
                                                        .value
                                                )
                                            }

                                            fullWidth

                                            required
                                        />


                                        {/* DESCRIPTION */}
                                        <TextField
                                            label="Description"

                                            value={
                                                description
                                            }

                                            onChange={(e) =>
                                                setDescription(
                                                    e.target
                                                        .value
                                                )
                                            }

                                            fullWidth

                                            required
                                        />


                                        {/* START DATE */}
                                        <TextField
                                            label="Start Date"

                                            type="datetime-local"

                                            value={
                                                startDate
                                            }

                                            onChange={(e) =>
                                                setStartDate(
                                                    e.target
                                                        .value
                                                )
                                            }

                                            InputLabelProps={{
                                                shrink: true,
                                            }}

                                            fullWidth

                                            required
                                        />


                                        {/* END DATE */}
                                        <TextField
                                            label="End Date"

                                            type="datetime-local"

                                            value={
                                                endDate
                                            }

                                            onChange={(e) =>
                                                setEndDate(
                                                    e.target
                                                        .value
                                                )
                                            }

                                            InputLabelProps={{
                                                shrink: true,
                                            }}

                                            fullWidth

                                            required
                                        />

                                    </Box>


                                    {/* CREATE BUTTON */}
                                    <Button
                                        type="submit"

                                        variant="contained"

                                        sx={{
                                            marginTop:
                                                "20px",

                                            backgroundColor:
                                                colors
                                                    .blueAccent[600],

                                            color: "white",

                                            fontWeight:
                                                "bold",

                                            "&:hover": {
                                                backgroundColor:
                                                    colors
                                                        .blueAccent[700],
                                            },
                                        }}
                                    >
                                        Create Election
                                    </Button>

                                </Box>
                            )}


                            {/* ==================================
                                SUCCESS MESSAGE
                            ================================== */}

                            {message && (

                                <Typography
                                    sx={{
                                        color:
                                            colors
                                                .greenAccent[400],

                                        marginBottom:
                                            "10px",

                                        fontWeight:
                                            "bold",
                                    }}
                                >
                                    {message}
                                </Typography>

                            )}


                            {/* ==================================
                                ERROR MESSAGE
                            ================================== */}

                            {error && (

                                <Typography
                                    sx={{
                                        color:
                                            colors
                                                .redAccent[400],

                                        marginBottom:
                                            "10px",

                                        fontWeight:
                                            "bold",
                                    }}
                                >
                                    {error}
                                </Typography>

                            )}


                            {/* ==================================
                                ELECTION TABLE
                            ================================== */}

                            <Box
                                m="20px 0 0 0"

                                height="70vh"

                                sx={{

                                    "& .MuiDataGrid-root":
                                        {
                                            border:
                                                "none",
                                        },

                                    "& .MuiDataGrid-cell":
                                        {
                                            borderBottom:
                                                "none",
                                        },

                                    "& .name-column--cell":
                                        {
                                            color:
                                                colors
                                                    .greenAccent[300],
                                        },

                                    "& .MuiDataGrid-columnHeaders":
                                        {
                                            backgroundColor:
                                                colors
                                                    .blueAccent[700],

                                            borderBottom:
                                                "none",
                                        },

                                    "& .MuiDataGrid-virtualScroller":
                                        {
                                            backgroundColor:
                                                colors
                                                    .primary[400],
                                        },

                                    "& .MuiDataGrid-footerContainer":
                                        {
                                            borderTop:
                                                "none",

                                            backgroundColor:
                                                colors
                                                    .blueAccent[700],
                                        },
                                }}
                            >

                                <DataGrid
                                    rows={
                                        elections
                                    }

                                    columns={
                                        columns
                                    }

                                    getRowId={(
                                        row
                                    ) =>
                                        row.id
                                    }
                                />

                            </Box>

                        </Box>

                    </main>

                </div>

            </ThemeProvider>

        </ColorModeContext.Provider>
    );
};

export default UpcomingElection;