
import './Vote.css';
import UserNavbar from '../../../Navbar/UserNavbar';
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import ScrollReveal from 'scrollreveal';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import { BASE_URL } from '../../../../helper';
import Cookies from 'js-cookie';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 700,
    bgcolor: 'rgb(255, 255, 255)',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        color: theme.palette.common.white,
        fontSize: 16,
    },

    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));


const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },

    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));


const columns = [
    {
        id: 'fullname',
        label: 'Candidate Name',
        minWidth: 250,
        align: 'left',
    },
    {
        id: 'party',
        label: 'Party',
        minWidth: 120,
    },
    {
        id: 'age',
        label: 'Age',
        minWidth: 180,
        align: 'center',
    },
    {
        id: 'photo',
        label: 'Symbol',
        minWidth: 100,
        align: 'right',
    },
    {
        id: 'action',
        label: '',
        minWidth: 200,
    },
];


export default function CustomizedTables() {

    const revealRefBottom = useRef(null);
    const revealRefLeft = useRef(null);
    const revealRefTop = useRef(null);
    const revealRefRight = useRef(null);


    // ==========================================
    // SCROLL REVEAL - BOTTOM
    // ==========================================

    useEffect(() => {

        ScrollReveal().reveal(revealRefBottom.current, {
            duration: 1000,
            delay: 300,
            distance: '50px',
            origin: 'bottom',
            easing: 'ease',
            reset: true,
        });

    }, []);


    // ==========================================
    // SCROLL REVEAL - RIGHT
    // ==========================================

    useEffect(() => {

        ScrollReveal().reveal(revealRefRight.current, {
            duration: 1000,
            delay: 300,
            distance: '50px',
            origin: 'right',
            easing: 'ease',
            reset: true,
        });

    }, []);


    // ==========================================
    // SCROLL REVEAL - LEFT
    // ==========================================

    useEffect(() => {

        ScrollReveal().reveal(revealRefLeft.current, {
            duration: 1000,
            delay: 300,
            distance: '50px',
            origin: 'left',
            easing: 'ease',
            reset: true,
        });

    }, []);


    // ==========================================
    // SCROLL REVEAL - TOP
    // ==========================================

    useEffect(() => {

        ScrollReveal().reveal(revealRefTop.current, {
            duration: 1000,
            delay: 300,
            distance: '50px',
            origin: 'top',
            easing: 'ease',
            reset: true,
        });

    }, []);


    // ==========================================
    // CANDIDATE STATE
    // ==========================================

    const [candidate, setCandidate] = useState([]);


    // ==========================================
    // GET VOTER ID FROM COOKIE
    // ==========================================

    const voterid = Cookies.get('myCookie');


    // ==========================================
    // GET CANDIDATES
    // ==========================================

    useEffect(() => {

        axios
            .get(`${BASE_URL}/getCandidate`)
            .then((response) => {

                console.log('Candidates:', response.data);

                setCandidate(response.data.candidate || []);

            })
            .catch((err) => {

                console.error(
                    'Error fetching candidate data:',
                    err
                );

            });

    }, []);


    // ==========================================
    // VOTER STATE
    // ==========================================

    const [voter, setVoter] = useState({});


    // ==========================================
    // GET VOTER DETAILS
    // ==========================================

    useEffect(() => {

        if (!voterid) {

            console.error(
                'Voter ID is missing from cookie'
            );

            return;
        }


        console.log(
            'Fetching voter using ID:',
            voterid
        );


        axios
            .get(`${BASE_URL}/getVoterbyID/${voterid}`)
            .then((response) => {

                console.log(
                    'Voter response:',
                    response.data
                );

                console.log(
                    'Voter object:',
                    response.data.voter
                );

                console.log(
                    'MongoDB _id:',
                    response.data.voter?._id
                );


                if (response.data.success) {

                    setVoter(
                        response.data.voter || {}
                    );

                } else {

                    console.error(
                        'Voter was not found:',
                        response.data
                    );

                }

            })
            .catch((error) => {

                console.error(
                    'Error fetching user data:',
                    error
                );

                if (error.response) {

                    console.error(
                        'Status:',
                        error.response.status
                    );

                    console.error(
                        'Server response:',
                        error.response.data
                    );

                }

            });

    }, [voterid]);


    // ==========================================
    // MODAL STATE
    // ==========================================

    const [open, setOpen] = React.useState(false);


    const handleOpen = () => {
        setOpen(true);
    };


    const handleClose = () => {
        setOpen(false);
    };


    // ==========================================
    // VOTE FUNCTION
    // ==========================================

    const handleVote = async (id) => {

        // --------------------------------------
        // CHECK WHETHER VOTER ALREADY VOTED
        // --------------------------------------

        if (voter.voteStatus) {

            alert(
                'You Have Already Voted'
            );

            return;
        }


        try {

            // ----------------------------------
            // CHECK VOTER ID
            // ----------------------------------

            if (!voter?._id) {

                console.error(
                    'Voter ID is missing:',
                    voter
                );

                alert(
                    'Voter information is missing. Please login again.'
                );

                return;
            }


            // ----------------------------------
            // CHECK CANDIDATE ID
            // ----------------------------------

            if (!id) {

                console.error(
                    'Candidate ID is missing'
                );

                alert(
                    'Candidate information is missing.'
                );

                return;
            }


            console.log(
                'Voter ID:',
                voter._id
            );

            console.log(
                'Candidate ID:',
                id
            );


            // ----------------------------------
            // CREATE UPDATED VOTER
            // ----------------------------------

            const updatedVoter = {
                ...voter,
                voteStatus: true,
            };


            console.log(
                'Updated voter:',
                updatedVoter
            );


            // ----------------------------------
            // UPDATE VOTER IN DATABASE
            // ----------------------------------

            const voterResponse = await axios.patch(
                `${BASE_URL}/updateVoter/${voter._id}`,
                updatedVoter
            );


            console.log(
                'Voter update response:',
                voterResponse.data
            );


            // ----------------------------------
            // UPDATE FRONTEND STATE
            // ----------------------------------

            setVoter(updatedVoter);


            // ----------------------------------
            // SHOW SUCCESS MODAL
            // ----------------------------------

            handleOpen();


        } catch (error) {

            console.error(
                '================================'
            );

            console.error(
                'ERROR WHILE VOTING'
            );

            console.error(
                '================================'
            );


            console.error(
                'Full error:',
                error
            );


            if (error.response) {

                console.error(
                    'Status:',
                    error.response.status
                );


                console.error(
                    'Server response:',
                    error.response.data
                );


            } else if (error.request) {

                console.error(
                    'No response received from server:',
                    error.request
                );


            } else {

                console.error(
                    'Error message:',
                    error.message
                );

            }


            alert(
                error.response?.data?.message ||
                'Unable to cast vote. Please check the server.'
            );

        }

    };


    // ==========================================
    // PAGE
    // ==========================================

    return (

        <div className="Vote-Page">

            <UserNavbar />


            <div className="candidate">


                {/* ==================================
                    HEADING
                ================================== */}

                <h2 ref={revealRefLeft}>
                    2024 India General Election
                </h2>


                <div
                    className="Heading1"
                    ref={revealRefRight}
                >

                    <p>
                        <span>GIVE</span> Your Vote
                    </p>

                </div>


                {/* ==================================
                    SUCCESS MODAL
                ================================== */}

                <Modal
                    className="VoteContent"
                    aria-labelledby="transition-modal-title"
                    aria-describedby="transition-modal-description"
                    open={open}
                    onClose={handleClose}
                    closeAfterTransition
                    slots={{
                        backdrop: Backdrop,
                    }}
                    slotProps={{
                        backdrop: {
                            timeout: 500,
                        },
                    }}
                >

                    <Fade
                        in={open}
                        className="VoteGivenBox"
                    >

                        <Box
                            sx={style}
                            className="MessageBox"
                        >

                            <h2>
                                Congratulations!
                            </h2>


                            <h5>
                                You Have Successfully Voted
                            </h5>


                            <button
                                onClick={handleClose}
                            >

                                <a href="/User">
                                    Ok
                                </a>

                            </button>


                        </Box>

                    </Fade>

                </Modal>


                {/* ==================================
                    CANDIDATE TABLE
                ================================== */}

                <TableContainer
                    component={Paper}
                    ref={revealRefBottom}
                >

                    <Table
                        sx={{ minWidth: 200 }}
                        aria-label="customized table"
                    >


                        {/* ==============================
                            TABLE HEAD
                        ============================== */}

                        <TableHead>

                            <TableRow className="TableRow">

                                {columns.map((column) => (

                                    <TableCell
                                        className="table_row_heading"
                                        key={column.id}
                                        align={column.align}
                                        style={{
                                            minWidth:
                                                column.minWidth,
                                        }}
                                    >

                                        {column.label}

                                    </TableCell>

                                ))}

                            </TableRow>

                        </TableHead>


                        {/* ==============================
                            TABLE BODY
                        ============================== */}

                        <TableBody>

                            {candidate.map((row) => (

                                <StyledTableRow
                                    key={row._id}
                                >


                                    {/* ==========================
                                        CANDIDATE NAME + IMAGE
                                    ========================== */}

                                    <StyledTableCell>

                                        {row.img ? (

                                            <span className="Name-Row image">

                                                <img
                                                    alt={row.fullName}
                                                    src={row.img}
                                                />

                                            </span>

                                        ) : (

                                            <p>
                                                No image
                                            </p>

                                        )}


                                        <span
                                            className="Name-Row text"
                                            align="left"
                                        >

                                            {row.fullName}

                                        </span>

                                    </StyledTableCell>


                                    {/* ==========================
                                        PARTY
                                    ========================== */}

                                    <StyledTableCell align="left">

                                        {row.party}

                                    </StyledTableCell>


                                    {/* ==========================
                                        AGE
                                    ========================== */}

                                    <StyledTableCell align="center">

                                        {row.age}

                                    </StyledTableCell>


                                    {/* ==========================
                                        SYMBOL
                                    ========================== */}

                                    <StyledTableCell
                                        align="right"
                                        className="Symbol"
                                    >

                                        {row.symbol ? (

                                            <img
                                                alt={row.symbol}
                                                src={row.symbol}
                                            />

                                        ) : (

                                            <p>
                                                No image
                                            </p>

                                        )}

                                    </StyledTableCell>


                                    {/* ==========================
                                        VOTE BUTTON
                                    ========================== */}

                                    <StyledTableCell
                                        align="right"
                                        className="voteButton"
                                    >

                                        <Button
                                            variant="contained"
                                            className="voteButton"
                                            onClick={() =>
                                                handleVote(row._id)
                                            }
                                        >

                                            Vote

                                        </Button>

                                    </StyledTableCell>


                                </StyledTableRow>

                            ))}

                        </TableBody>

                    </Table>

                </TableContainer>


            </div>

        </div>

    );
}