import React, { useState, Dispatch, useEffect } from 'react';
import JobsTable from '../components/JobsTable.tsx';
import InputAdornment from '@mui/material/InputAdornment';
import { AuthUser } from 'aws-amplify/auth';
import {
    FormControlLabel,
    TextField,
    Box,
    Button,
    Checkbox,
    styled,
    Divider,
    IconButton,
    Table,
    TableContainer,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableFooter,
    TablePagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { useTheme } from '@mui/material/styles';
import Popup from '../components/PopUp';
import Alert from '@mui/material/Alert';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

import '../styles/marketStyle.css';

const ColorButton = styled(Button)({
    color: 'black',
    borderColor: 'rgb(192, 192, 192)',
    margin: '5px',
    '&:hover': {
        borderColor: 'rgb(192, 192, 192)',
    }
});

type FilterBarProps = {
    setShowPopUp: Dispatch<React.SetStateAction<boolean>>,
}

const FilterBar: React.FC<FilterBarProps> = (props) => {
    let setShowPopUp = props.setShowPopUp;
    let formData = props.formData;
    let setFormData = props.setFormData;
    let submitCallback = props.submitCallback;

    let onMaterialCheck = (mat, event) => {
        let formDataCopy = JSON.parse(JSON.stringify(formData));
        let checked = event.target.checked;
        formDataCopy.materials[mat] = checked;
        setFormData(formDataCopy);
    }

    let onColorCheck = (col, event) => {
        let formDataCopy = JSON.parse(JSON.stringify(formData));
        let checked = event.target.checked;
        formDataCopy.colors[col] = checked;
        setFormData(formDataCopy);
    }

    let handleNumericChange = (field, event) => {
        let formDataCopy = JSON.parse(JSON.stringify(formData));
        formDataCopy[field] = event.target.value.replace(/[^0-9.]/g, '');
        setFormData(formDataCopy);
    }

    return (
        <>
            <div className='material'>
                <label>Material</label>
                <Box className='filters'>
                {Object.keys(formData.materials).map((mat) => (
                    <FormControlLabel control={<Checkbox 
                        checked={ formData.materials[mat] }
                        onChange={ (e) => { onMaterialCheck(mat, e) } }
                    />} label={mat} />
                ))}
                </Box>
            </div>
            <div className='color'>
                <label>Color</label>
                <Box className='filters'>
                    {Object.keys(formData.colors).map((col) => (
                        <FormControlLabel control={<Checkbox 
                            checked={ formData.colors[col] }
                            onChange={ (e) => { onColorCheck(col, e) } }
                        />} label={col} />
                    ))}
                </Box>
            </div>
            <div className='min-size'>
                <Box>
                    <TextField
                        id="outlined-number"
                        label="Min Price"
                        type="number"
                        size="small"
                        value={formData.minPrice}
                        onChange={(e) => { handleNumericChange('minPrice', e) } }
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            </div>
            <div className='max-size'>
                <Box>
                    <TextField
                        id="outlined-number"
                        label="Max Price"
                        type="number"
                        size="small"
                        value={formData.maxPrice}
                        onChange={(e) => { handleNumericChange('maxPrice', e) } }
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Box>
            </div>
            <ColorButton variant="outlined" onClick={submitCallback}>Apply Filter</ColorButton>
            <p>----- OR ------</p>
            <ColorButton variant="outlined" onClick={() => setShowPopUp(true)}>Create New Job</ColorButton>
        </>
    )
};

interface TablePaginationActionsProps {
    count: number;
    page: number;
    rowsPerPage: number;
    onPageChange: (
        event: React.MouseEvent<HTMLButtonElement>,
        newPage: number,
    ) => void;
}

function TablePaginationActions(props: TablePaginationActionsProps) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;

    const handleFirstPageButtonClick = (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        onPageChange(event, 0);
    };

    const handleBackButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <IconButton
                onClick={handleFirstPageButtonClick}
                disabled={page === 0}
                aria-label="first page"
            >
                {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
            </IconButton>
            <IconButton
                onClick={handleBackButtonClick}
                disabled={page === 0}
                aria-label="previous page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            </IconButton>
            <IconButton
                onClick={handleNextButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="next page"
            >
                {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
            </IconButton>
            <IconButton
                onClick={handleLastPageButtonClick}
                disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                aria-label="last page"
            >
                {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
            </IconButton>
        </Box>
    );
}


type JobList = Schema['Job']['type'];

export default function Market({ user }: { user: AuthUser }) {
    const [showPopUp, setShowPopUp] = useState<boolean>(false);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertType, setAlertType] = useState<string>('');
    const [showAlertMessage, setShowAlertMessage] = useState<string>('');
    const [showDelete, setShowDelete] = useState<boolean>(false); // set true when the new row is created for 1 min
    const [jobsList, setJobsList] = useState<JobList[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const client = generateClient<Schema>();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: jobs } = await client.models.Job.list({
                    authMode: 'userPool'
                });
                setJobsList(jobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
        };
        fetchData();
    }, [])

    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - jobsList.length) : 0;

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async(id: string) => {
        try {
            await client.models.Job.delete({'id': id});
            setAlertType('success')
            setShowAlertMessage('Job deleted successfully')
            setShowAlert(true)
        } catch (error) {
            setAlertType('error')
            setShowAlertMessage('Error deleting the job')
            setShowAlert(true)
            console.log('Error while deleting an job: ',error);
        }
    };

    let [formData, setFormData] = useState({
        'minPrice': 0,
        'maxPrice': 100,
        'colors': new Set(),
        'materials': {
            'Plastic': false,
            'Resin': false,
            'Carbon Fiber': false
        },
        'colors': {
            'Red': false,
            'White': false,
            'Black': false,
            'Blue': false,
            'Transparent': false
        }
    });

    let [filters, setFilters] = useState({});

    const submitCallback = async () => {
        let new_filter = {
            amountOffered: {
                gt: formData.minPrice,
                lt: formData.maxPrice
            },
        }

        let colors = [];
        let color, val;
        console.log(formData.colors);
        for([color, val] of Object.entries(formData.colors)) {
            if(val) {
                colors.push(color);
            }
        }

        if(colors.length > 0) {
            new_filter.colors = { 'eq': colors };
        }

        let materials = [];
        let material;
        for([material, val] of Object.entries(formData.materials)) {
            if(val) {
                materials.push(material);
            }
        }

        if(materials.length > 0) {
            new_filter.requiredMaterials = { 'eq': materials };
        }


        setFilters(new_filter);
        let {data: jobs, errors} = await client.models.Job.list({
            filter: new_filter
        });
        console.log("Callback JOBS");
        console.log(jobs);
        console.log("Callback filters");
        console.log(new_filter.materials);
    }

    return (
        <>
            <div className='filter-container'>
                <div className='filter-div'>
                    <FilterBar
                        setShowPopUp={setShowPopUp}
                        formData={formData}
                        setFormData={setFormData}
                        submitCallback={submitCallback}
                    />
                </div>
                <div className='jobs-list'>
                    <h2>Jobs List</h2>
                    <Divider></Divider>
                    {Object.keys(filters).length > 0 ?
                        (<JobsTable filters={filters}/>) :
                        (<p>Apply some filters, and we'll show available jobs</p>)
                    }
                </div>
            </div>
            {showPopUp &&
                <Popup
                    showPopUp={showPopUp}
                    setShowPopUp={setShowPopUp}
                    setShowAlert={setShowAlert}
                    setShowAlertMessage={setShowAlertMessage}
                    setAlertType={setAlertType}
                    user={user}
                />
            }
            {showAlert &&
                <Alert variant="filled" severity={alertType} onClose={() => { setShowAlert(false) }} className='alert-message'>
                    {showAlertMessage}
                </Alert>
            }
        </>
    )
}
